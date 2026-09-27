import { formatDistance } from "date-fns";

export default function ForumTime({ value }) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return <time dateTime={date.toISOString()}>{formatDistance(date, new Date())} ago</time>;
}

export function isRecent(value) {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  return Date.now() - date.getTime() < 24 * 60 * 60 * 1000;
}
