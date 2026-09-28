export function fantasyPageHref(season, phase, latestSeason) {
  const year = String(season);
  if (phase === "playoffs") return `/fantasy/${year}/playoffs`;
  if (latestSeason != null && Number(season) === Number(latestSeason)) return "/fantasy";
  return `/fantasy/${year}`;
}
