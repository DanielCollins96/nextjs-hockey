export function voteKey(username, targetType, targetId) {
  return `${encodeURIComponent(username)}::${targetType}::${targetId}`;
}

export function voteTransition(existingValue) {
  const current = existingValue === 1 ? 1 : 0;
  const nextValue = current === 1 ? 0 : 1;
  return { nextValue, delta: nextValue - current };
}
