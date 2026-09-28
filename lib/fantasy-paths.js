export function fantasyPageHref(season, phase, latestSeason) {
  const year = String(season);
  if (phase === "playoffs") return `/fantasy/${year}/playoffs`;
  if (latestSeason != null && Number(season) === Number(latestSeason)) return "/fantasy";
  return `/fantasy/${year}`;
}

export function fantasyPublicHrefs(seasons) {
  if (!Array.isArray(seasons) || seasons.length === 0) return ["/fantasy"];
  const latest = seasons[0];
  const hrefs = [];
  for (const season of seasons) {
    hrefs.push(fantasyPageHref(season, "regular", latest));
    hrefs.push(fantasyPageHref(season, "playoffs", latest));
  }
  return [...new Set(hrefs)];
}
