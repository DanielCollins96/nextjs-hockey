export const HOT_LIMIT = 8;
export const POPULAR_PREVIEW = 8;
export const POPULAR_PAGE_SIZE = 8;
export const POPULAR_FEED_LIMIT = 40;

export function recentPostAt(thread) {
  const value = thread?.lastActivityAt || thread?.postedAt || thread?.createdAt;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
}

function voteCount(thread) {
  const score = Number(thread?.score);
  return Number.isFinite(score) ? score : 0;
}

function postedAt(thread) {
  const time = new Date(thread?.postedAt || thread?.createdAt || 0).getTime();
  return Number.isFinite(time) ? time : 0;
}

function liveThreads(threads) {
  return [...(threads || [])].filter((thread) => thread && !thread._deleted);
}

export function rankHotThreads(threads, limit = HOT_LIMIT) {
  return liveThreads(threads)
    .sort((left, right) => {
      const delta = recentPostAt(right) - recentPostAt(left);
      if (delta !== 0) return delta;
      return String(right.id || "").localeCompare(String(left.id || ""));
    })
    .slice(0, limit);
}

export function rankPopularThreads(threads, limit = POPULAR_FEED_LIMIT) {
  return liveThreads(threads)
    .filter((thread) => voteCount(thread) > 0)
    .sort((left, right) => {
      const votes = voteCount(right) - voteCount(left);
      if (votes !== 0) return votes;
      const posted = postedAt(right) - postedAt(left);
      if (posted !== 0) return posted;
      return String(right.id || "").localeCompare(String(left.id || ""));
    })
    .slice(0, limit);
}

export function popularNeighbors(threads, threadId) {
  const list = threads || [];
  const index = list.findIndex((thread) => thread?.id === threadId);
  if (index < 0) return { index: -1, previous: null, next: null };
  return {
    index,
    previous: list[index - 1] || null,
    next: list[index + 1] || null,
  };
}
