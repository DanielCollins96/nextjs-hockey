import awsExports from "../aws-exports";

const counts = new Map();

const USAGE_QUERY = /* GraphQL */ `
  query UsageByUserDay($userId: String!, $day: String!) {
    usageByUserDay(userId: $userId, day: { eq: $day }, limit: 100) {
      items {
        id
        kind
        _deleted
      }
    }
  }
`;

const USAGE_MUTATION = /* GraphQL */ `
  mutation CreateForumUsage($input: CreateForumUsageInput!) {
    createForumUsage(input: $input) {
      id
    }
  }
`;

function dayKey() {
  return new Date().toISOString().slice(0, 10);
}

function memoryId(username, kind) {
  const name = String(username || "").trim().slice(0, 200);
  if (!name) return "";
  return `${kind}:${name}:${dayKey()}`;
}

function reserveMemory(username, kind, limit) {
  const id = memoryId(username, kind);
  if (!id) return false;
  const count = counts.get(id) || 0;
  if (count >= limit) return false;
  counts.set(id, count + 1);
  return true;
}

export function refundDailyQuota(username, kind) {
  const id = memoryId(username, kind);
  if (!id) return;
  const count = counts.get(id) || 0;
  if (count > 1) counts.set(id, count - 1);
  else counts.delete(id);
}

function schemaMissing(error) {
  return /Cannot query field|Unknown type|not found in schema|undefined/i.test(error?.message || "");
}

async function graphql(token, query, variables) {
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
    throw new Error(payload.errors?.[0]?.message || "Forum quota request failed.");
  }
  return payload.data;
}

async function usageCount(token, username, kind) {
  const data = await graphql(token, USAGE_QUERY, {
    userId: username,
    day: dayKey(),
  });
  return (data?.usageByUserDay?.items || []).filter((item) => item && !item._deleted && item.kind === kind).length;
}

export async function reserveDailyQuota(token, username, kind, limit) {
  const name = String(username || "").trim();
  if (!name) return false;
  try {
    const count = await usageCount(token, name, kind);
    return count < limit;
  } catch (error) {
    if (!schemaMissing(error)) console.error("Forum quota lookup failed:", error?.message || error);
    return reserveMemory(name, kind, limit);
  }
}

export async function recordDailyQuota(token, username, kind) {
  const name = String(username || "").trim();
  if (!name) return;
  try {
    await graphql(token, USAGE_MUTATION, {
      input: {
        id: crypto.randomUUID(),
        userId: name,
        day: dayKey(),
        kind,
      },
    });
  } catch (error) {
    if (schemaMissing(error)) return;
    console.error("Forum quota record failed:", error?.message || error);
  }
}
