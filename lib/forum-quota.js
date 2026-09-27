import awsExports from "../aws-exports";
import { isUsageConflict, usageDayKey, usageSlotId } from "./forum-quota-slots";

export { isUsageConflict, usageDayKey, usageSlotId } from "./forum-quota-slots";

const USAGE_MUTATION = /* GraphQL */ `
  mutation CreateForumUsage($input: CreateForumUsageInput!) {
    createForumUsage(input: $input) {
      id
      _version
    }
  }
`;

const USAGE_DELETE = /* GraphQL */ `
  mutation DeleteForumUsage($input: DeleteForumUsageInput!) {
    deleteForumUsage(input: $input) {
      id
    }
  }
`;

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
    const error = new Error(payload.errors?.[0]?.message || "Forum quota request failed.");
    error.errors = payload.errors;
    throw error;
  }
  return payload.data;
}

export async function reserveDailyQuota(token, username, kind, limit) {
  const name = String(username || "").trim();
  if (!name || !token) return null;
  const day = usageDayKey();

  for (let slot = 0; slot < limit; slot += 1) {
    try {
      const data = await graphql(token, USAGE_MUTATION, {
        input: {
          id: usageSlotId(name, kind, slot, day),
          userId: name,
          day,
          kind,
        },
      });
      const reservation = data?.createForumUsage;
      if (!reservation?.id) throw new Error("Forum quota request failed.");
      return reservation;
    } catch (error) {
      if (isUsageConflict(error)) continue;
      if (!schemaMissing(error)) console.error("Forum quota reserve failed:", error?.message || error);
      return null;
    }
  }

  return null;
}

export async function releaseDailyQuota(token, reservation) {
  if (!token || !reservation?.id) return;
  try {
    await graphql(token, USAGE_DELETE, {
      input: {
        id: reservation.id,
        ...(reservation._version ? { _version: reservation._version } : {}),
      },
    });
  } catch (error) {
    if (!schemaMissing(error)) console.error("Forum quota release failed:", error?.message || error);
  }
}
