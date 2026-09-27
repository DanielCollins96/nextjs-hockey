export function usageDayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function usageSlotId(username, kind, slot, day = usageDayKey()) {
  const name = String(username || "").trim();
  return `usage#${encodeURIComponent(name)}#${day}#${kind}#${slot}`;
}

export function isUsageConflict(error) {
  const text = `${error?.message || ""} ${JSON.stringify(error?.errors || "")}`;
  return /already exists|ConditionalCheckFailed|The conditional request failed|Duplicate/i.test(text);
}
