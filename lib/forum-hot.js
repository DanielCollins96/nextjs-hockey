const EPOCH_DIVISOR = 45000;

export function hotScore(score, createdAt) {
  const votes = Number(score) || 0;
  const order = Math.log10(Math.max(Math.abs(votes), 1));
  const sign = votes > 0 ? 1 : votes < 0 ? -1 : 0;
  const seconds = new Date(createdAt).getTime() / 1000;
  if (!Number.isFinite(seconds)) return 0;
  return sign * order + seconds / EPOCH_DIVISOR;
}

export function rankHotThreads(threads, limit = 8) {
  return [...(threads || [])]
    .filter((thread) => thread && !thread._deleted)
    .sort((left, right) => {
      const scoreDelta = hotScore(right.score, right.postedAt || right.createdAt)
        - hotScore(left.score, left.postedAt || left.createdAt);
      if (scoreDelta !== 0) return scoreDelta;
      return new Date(right.postedAt || right.createdAt) - new Date(left.postedAt || left.createdAt);
    })
    .slice(0, limit);
}
