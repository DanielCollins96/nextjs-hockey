import awsExports from "../aws-exports";
import { loadForumCredentials } from "./forum-aws";
import { signAwsRequest } from "./forum-iam";

const API_ID = process.env.FORUM_GRAPHQL_API_ID || "btgmwipyhbg25prcxls7pxtuce";
const ENV_NAME = process.env.FORUM_ENV || "staging";

export function forumModelTable(model) {
  return `${model}-${API_ID}-${ENV_NAME}`;
}

function textAttr(item, name) {
  const value = item?.[name];
  if (value?.S != null) return value.S;
  return "";
}

function recordFromItem(item) {
  if (!item || item._deleted?.BOOL) return null;
  const version = Number(item._version?.N);
  return {
    id: textAttr(item, "id"),
    authorId: textAttr(item, "authorId"),
    owner: textAttr(item, "owner"),
    boardSlug: textAttr(item, "boardSlug"),
    authorName: textAttr(item, "authorName"),
    threadId: textAttr(item, "threadId"),
    postedAt: textAttr(item, "postedAt"),
    lastPostAuthor: textAttr(item, "lastPostAuthor"),
    lastActivityAt: textAttr(item, "lastActivityAt"),
    version: Number.isFinite(version) ? version : 0,
  };
}

async function dynamo(action, payload) {
  const credentials = await loadForumCredentials();
  if (!credentials) throw new Error("Forum write API is not configured.");
  const body = JSON.stringify(payload);
  const url = `https://dynamodb.${awsExports.aws_appsync_region}.amazonaws.com/`;
  const headers = signAwsRequest({
    url,
    body,
    region: awsExports.aws_appsync_region,
    service: "dynamodb",
    credentials,
    headers: {
      "content-type": "application/x-amz-json-1.0",
      "x-amz-target": `DynamoDB_20120810.${action}`,
    },
  });
  const response = await fetch(url, { method: "POST", headers, body });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || "Forum request failed.");
    error.code = String(data.__type || "");
    throw error;
  }
  return data;
}

export function isVersionConflict(error) {
  return /ConditionalCheckFailed/i.test(`${error?.code || ""} ${error?.message || ""}`);
}

export async function getForumModel(model, id) {
  const data = await dynamo("GetItem", {
    TableName: forumModelTable(model),
    Key: { id: { S: String(id) } },
    ConsistentRead: true,
  });
  return recordFromItem(data?.Item);
}

export async function updateForumModel(model, id, version, fields) {
  const names = { "#version": "_version", "#changed": "_lastChangedAt", "#updated": "updatedAt" };
  const values = {
    ":version": { N: String(version) },
    ":one": { N: "1" },
    ":changed": { N: String(Date.now()) },
    ":updated": { S: new Date().toISOString() },
  };
  const sets = ["#version = #version + :one", "#changed = :changed", "#updated = :updated"];
  Object.entries(fields).forEach(([key, value], index) => {
    names[`#f${index}`] = key;
    values[`:f${index}`] = { S: String(value) };
    sets.push(`#f${index} = :f${index}`);
  });
  await dynamo("UpdateItem", {
    TableName: forumModelTable(model),
    Key: { id: { S: String(id) } },
    UpdateExpression: `SET ${sets.join(", ")}`,
    ConditionExpression: "#version = :version",
    ExpressionAttributeNames: names,
    ExpressionAttributeValues: values,
  });
}
