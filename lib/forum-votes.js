export const VOTE_FLIP_MS = 3000;
export const VOTES_PER_DAY = 80;

export function voteKey(username, targetType, targetId) {
  return `${encodeURIComponent(username)}::${targetType}::${targetId}`;
}

export function voteFlipAllowed(updatedAt, now = Date.now(), waitMs = VOTE_FLIP_MS) {
  const updated = Date.parse(updatedAt || "");
  if (!Number.isFinite(updated)) return true;
  return now - updated >= waitMs;
}

export function voteTransition(existingValue) {
  const current = existingValue === 1 ? 1 : 0;
  const nextValue = current === 1 ? 0 : 1;
  return { nextValue, delta: nextValue - current };
}
