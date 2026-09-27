import { FORUM_SYSTEM_ID } from "./forum-boards.js";

function byPostedAt(left, right) {
  const leftAt = left?.postedAt || left?.createdAt || "";
  const rightAt = right?.postedAt || right?.createdAt || "";
  if (leftAt !== rightAt) return leftAt < rightAt ? -1 : 1;
  return String(left?.id || "").localeCompare(String(right?.id || ""));
}

export function threadNumbers(threads) {
  const numbers = new Map();
  [...(threads || [])]
    .filter((thread) => thread && !thread._deleted && thread.id)
    .sort(byPostedAt)
    .forEach((thread, index) => numbers.set(thread.id, index + 1));
  return numbers;
}

export function threadPath(thread) {
  if (!thread?.id) return "/forum";
  if (!thread.number) return `/forum/t/${thread.id}`;
  return `/forum/t/${thread.number}`;
}

export function isForumOwner(record, user) {
  const ids = [user?.username, user?.attributes?.email, user?.attributes?.sub]
    .map((value) => String(value || "").trim())
    .filter(Boolean);
  if (!record || !ids.length) return false;
  const authorId = String(record.authorId || "");
  if (authorId === FORUM_SYSTEM_ID) return false;
  const owner = String(record.owner || "");
  return ids.some((id) => authorId === id || owner === id || owner.endsWith(`::${id}`));
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
