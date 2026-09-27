import awsExports from "../aws-exports";

export function forumApiKey() {
  return process.env.APPSYNC_API_KEY || process.env.AWS_APPSYNC_API_KEY || awsExports.aws_appsync_apiKey || "";
}

export async function adminGraphql(query, variables) {
  const apiKey = forumApiKey();
  if (!apiKey) throw new Error("Forum write API is not configured.");
  const response = await fetch(awsExports.aws_appsync_graphqlEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
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
