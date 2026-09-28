import awsExports from "../aws-exports";
import { loadForumCredentials } from "./forum-aws";
import { signAppSyncRequest } from "./forum-iam";

export async function adminGraphql(query, variables) {
  const credentials = await loadForumCredentials();
  if (!credentials) throw new Error("Forum write API is not configured.");
  const body = JSON.stringify({ query, variables });
  const headers = signAppSyncRequest({
    url: awsExports.aws_appsync_graphqlEndpoint,
    body,
    region: awsExports.aws_appsync_region,
    credentials,
  });
  const response = await fetch(awsExports.aws_appsync_graphqlEndpoint, {
    method: "POST",
    headers,
    body,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.errors?.length) {
    const error = new Error(payload.errors?.[0]?.message || "Forum request failed.");
    error.errors = payload.errors;
    throw error;
  }
  return payload.data;
}

export async function userGraphql(token, query, variables) {
  const response = await fetch(awsExports.aws_appsync_graphqlEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify({ query, variables }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.errors?.length) {
    const error = new Error(payload.errors?.[0]?.message || "Forum request failed.");
    error.errors = payload.errors;
    throw error;
  }
  return payload.data;
}
