import { adminGraphql } from "./forum-admin";
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
  return /Cannot query field|Unknown type|not found in schema|undefined|not configured/i.test(error?.message || "");
}

export async function reserveDailyQuota(_token, username, kind, limit) {
  const name = String(username || "").trim();
  if (!name) return null;
  const day = usageDayKey();

  for (let slot = 0; slot < limit; slot += 1) {
    try {
      const data = await adminGraphql(USAGE_MUTATION, {
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

export async function releaseDailyQuota(_token, reservation) {
  if (!reservation?.id) return;
  try {
    await adminGraphql(USAGE_DELETE, {
      input: {
        id: reservation.id,
        ...(reservation._version ? { _version: reservation._version } : {}),
      },
    });
  } catch (error) {
    if (!schemaMissing(error)) console.error("Forum quota release failed:", error?.message || error);
  }
}
