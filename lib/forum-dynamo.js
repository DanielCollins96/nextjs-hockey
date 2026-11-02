import awsExports from "../aws-exports";
import { loadForumCredentials } from "./forum-aws";
import { signAwsRequest } from "./forum-iam";
import { voteFlipAllowed, voteTransition } from "./forum-votes";

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
    error.reasons = data.CancellationReasons || [];
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

function numAttr(item, name) {
  const value = Number(item?.[name]?.N);
  return Number.isFinite(value) ? value : 0;
}

function isVoteConflict(error) {
  if (isVersionConflict(error)) return true;
  return (error?.reasons || []).some((reason) => /ConditionalCheckFailed|TransactionConflict/i.test(reason?.Code || ""));
}

async function getItem(model, id) {
  const data = await dynamo("GetItem", {
    TableName: forumModelTable(model),
    Key: { id: { S: String(id) } },
    ConsistentRead: true,
  });
  return data?.Item || null;
}

function activityItem({ target, targetId, score, now, iso }) {
  const item = {
    id: { S: targetId },
    __typename: { S: "ForumActivity" },
    score: { N: String(score) },
    replyCount: { N: String(numAttr(target, "replyCount")) },
    viewCount: { N: String(numAttr(target, "viewCount")) },
    _version: { N: "1" },
    _lastChangedAt: { N: String(now) },
    createdAt: { S: iso },
    updatedAt: { S: iso },
  };
  ["boardSlug", "lastActivityAt", "lastPostAuthor", "lastPostExcerpt"].forEach((name) => {
    if (target?.[name]?.S) item[name] = { S: target[name].S };
  });
  return item;
}

async function writeForumVote({ voteId, targetId, targetType, targetModel }) {
  const [vote, target, activity] = await Promise.all([
    getItem("ForumVote", voteId),
    getItem(targetModel, targetId),
    getItem("ForumActivity", targetId),
  ]);
  if (!target || target._deleted?.BOOL) throw new Error("That post does not exist.");

  const voteGone = !vote || vote._deleted?.BOOL;
  if (!voteGone && !voteFlipAllowed(textAttr(vote, "updatedAt"))) {
    throw new Error("Wait a moment before changing that vote.");
  }
  const currentValue = voteGone ? 0 : numAttr(vote, "value") === 1 ? 1 : 0;
  const { nextValue, delta } = voteTransition(currentValue);
  const now = Date.now();
  const iso = new Date(now).toISOString();
  const activityGone = !activity || activity._deleted?.BOOL;
  const score = Math.max(0, (activityGone ? numAttr(target, "score") : numAttr(activity, "score")) + delta);
  const voteWrite = vote
    ? {
      Update: {
        TableName: forumModelTable("ForumVote"),
        Key: { id: { S: voteId } },
        UpdateExpression: "SET #value = :next, #deleted = :false, #version = if_not_exists(#version, :zero) + :one, #changed = :changed, #updated = :updated",
        ConditionExpression: "(attribute_not_exists(#version) OR #version = :version) AND (attribute_not_exists(#value) OR #value = :current OR #deleted = :true)",
        ExpressionAttributeNames: {
          "#value": "value",
          "#deleted": "_deleted",
          "#version": "_version",
          "#changed": "_lastChangedAt",
          "#updated": "updatedAt",
        },
        ExpressionAttributeValues: {
          ":next": { N: String(nextValue) },
          ":current": { N: String(currentValue) },
          ":false": { BOOL: false },
          ":true": { BOOL: true },
          ":version": { N: String(numAttr(vote, "_version")) },
          ":zero": { N: "0" },
          ":one": { N: "1" },
          ":changed": { N: String(now) },
          ":updated": { S: iso },
        },
      },
    }
    : {
      Put: {
        TableName: forumModelTable("ForumVote"),
        Item: {
          id: { S: voteId },
          targetId: { S: targetId },
          targetType: { S: targetType },
          value: { N: String(nextValue) },
          __typename: { S: "ForumVote" },
          _version: { N: "1" },
          _lastChangedAt: { N: String(now) },
          createdAt: { S: iso },
          updatedAt: { S: iso },
        },
        ConditionExpression: "attribute_not_exists(id)",
      },
    };
  const activityWrite = activityGone
    ? {
      Put: {
        TableName: forumModelTable("ForumActivity"),
        Item: activityItem({ target, targetId, score, now, iso }),
        ConditionExpression: "attribute_not_exists(id) OR #deleted = :true",
        ExpressionAttributeNames: { "#deleted": "_deleted" },
        ExpressionAttributeValues: { ":true": { BOOL: true } },
      },
    }
    : {
      Update: {
        TableName: forumModelTable("ForumActivity"),
        Key: { id: { S: targetId } },
        UpdateExpression: "SET score = :score, #version = #version + :one, #changed = :changed, #updated = :updated",
        ConditionExpression: "#version = :version",
        ExpressionAttributeNames: {
          "#version": "_version",
          "#changed": "_lastChangedAt",
          "#updated": "updatedAt",
        },
        ExpressionAttributeValues: {
          ":score": { N: String(score) },
          ":version": { N: String(numAttr(activity, "_version")) },
          ":one": { N: "1" },
          ":changed": { N: String(now) },
          ":updated": { S: iso },
        },
      },
    };

  await dynamo("TransactWriteItems", { TransactItems: [voteWrite, activityWrite] });
  return { id: targetId, score, value: nextValue };
}

export async function readForumVotes(ids) {
  const unique = [...new Set((ids || []).map((id) => String(id || "")).filter(Boolean))];
  const rows = await Promise.all(unique.map(async (id) => {
    const item = await getItem("ForumVote", id);
    if (!item || item._deleted?.BOOL || numAttr(item, "value") !== 1) return null;
    return { id, value: 1 };
  }));
  return rows.filter(Boolean);
}

export async function applyForumVote(input) {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    try {
      return await writeForumVote(input);
    } catch (error) {
      if (!isVoteConflict(error) || attempt === 5) {
        if (isVoteConflict(error)) throw new Error("Could not record that vote.");
        throw error;
      }
    }
  }
  throw new Error("Could not record that vote.");
}
