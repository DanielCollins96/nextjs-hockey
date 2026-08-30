export const PAGE_CACHE = {
  stable: "public, s-maxage=43200, stale-while-revalidate=86400",
  hourly: "public, s-maxage=3600, stale-while-revalidate=86400",
  live: "public, s-maxage=300, stale-while-revalidate=3600",
  search: "public, s-maxage=600, stale-while-revalidate=3600",
};

export function setPageCache(res, policy = PAGE_CACHE.hourly) {
  if (!res || res.headersSent) return;
  res.setHeader("Cache-Control", policy);
}
