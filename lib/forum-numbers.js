import { FORUM_SYSTEM_ID } from "./forum-boards.js";

function byPostedAt(left, right) {
  const leftAt = left?.postedAt || left?.createdAt || "";
  const rightAt = right?.postedAt || right?.createdAt || "";
  if (leftAt !== rightAt) return leftAt < rightAt ? -1 : 1;
  return String(left?.id || "").localeCompare(String(right?.id || ""));
}

export function persistedThreadNumber(thread) {
  const number = Number(thread?.number);
  return Number.isInteger(number) && number > 0 ? number : null;
}

export function threadNumbers(threads) {
  const numbers = new Map();
  const listed = [...(threads || [])].filter((thread) => thread && !thread._deleted && thread.id);
  listed.forEach((thread) => {
    const number = persistedThreadNumber(thread);
    if (number) numbers.set(thread.id, number);
  });
  let next = Math.max(0, ...numbers.values(), 0) + 1;
  listed.sort(byPostedAt).forEach((thread) => {
    if (!numbers.has(thread.id)) {
      numbers.set(thread.id, next);
      next += 1;
    }
  });
  return numbers;
}

export function threadPath(thread, search) {
  if (!thread?.id) return "/forum";
  const number = persistedThreadNumber(thread) || Number(thread?.number);
  const path = Number.isInteger(number) && number > 0 ? `/forum/t/${number}` : `/forum/t/${thread.id}`;
  if (!search) return path;
  const params = new URLSearchParams();
  Object.entries(search).forEach(([key, value]) => {
    if (value != null && value !== "") params.set(key, String(value));
  });
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

export function recordOwnedBy(record, identities) {
  const ids = [...new Set((identities || []).map((value) => String(value || "").trim()).filter(Boolean))];
  if (!record || !ids.length) return false;
  const authorId = String(record.authorId || "");
  if (authorId === FORUM_SYSTEM_ID) return false;
  const owner = String(record.owner || "");
  return ids.some((id) => authorId === id || owner === id || owner.endsWith(`::${id}`));
}

export function isForumOwner(record, user) {
  return recordOwnedBy(record, [user?.username, user?.attributes?.email, user?.attributes?.sub]);
}

export function activityDeleteTarget({ username, identities, targetType, thread, reply }) {
  const ids = [...new Set([username, ...(identities || [])].map((value) => String(value || "").trim()).filter(Boolean))];
  if (!ids.length) return null;
  if (targetType === "thread") {
    if (!thread || !recordOwnedBy(thread, ids)) return null;
    return { activityId: thread.id, boardSlug: thread.boardSlug || "" };
  }
  if (targetType === "reply") {
    if (!reply || !recordOwnedBy(reply, ids)) return null;
    if (!thread || String(thread.id) !== String(reply.threadId)) return null;
    if (thread.lastPostAuthor === reply.authorName && thread.lastActivityAt === reply.postedAt) {
      return { activityId: thread.id, boardSlug: thread.boardSlug || "" };
    }
    return { activityId: "", boardSlug: thread.boardSlug || "" };
  }
  return null;
}

export function isThreadNumber(value) {
  return /^[1-9]\d*$/.test(String(value || ""));
}

export function threadIdForNumber(numberMap, number) {
  const target = Number(number);
  if (!Number.isInteger(target) || target < 1) return null;
  const match = Object.entries(numberMap || {}).find(([, value]) => value === target);
  return match?.[0] || null;
}

export function postNumbers(replies) {
  const numbers = new Map();
  [...(replies || [])]
    .filter((reply) => reply && !reply._deleted && reply.id)
    .sort(byPostedAt)
    .forEach((reply, index) => numbers.set(reply.id, index + 2));
  return numbers;
}
