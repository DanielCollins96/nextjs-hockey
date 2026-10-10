// Vercel CDN uses s-maxage / stale-while-revalidate, then strips them from the
// client-facing header. Without an explicit max-age, curl sees only
// `Cache-Control: public`, and the edge can keep serving stale player/team/game
// read models long after S3 updates.
export const PAGE_CACHE = {
  stable: "public, max-age=0, s-maxage=43200, stale-while-revalidate=86400",
  hourly: "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
  live: "public, max-age=0, s-maxage=300, stale-while-revalidate=3600",
  search: "public, max-age=0, s-maxage=600, stale-while-revalidate=3600",
  daily: "public, max-age=0, s-maxage=86400, stale-while-revalidate=172800",
  error: "private, no-store",
};

export function setPageCache(res, policy = PAGE_CACHE.hourly) {
  if (!res || res.headersSent) return;
  res.setHeader("Cache-Control", policy);
}
