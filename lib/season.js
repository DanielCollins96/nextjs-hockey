export const normalizeSeasonId = (season) =>
  season === null || season === undefined ? "" : String(season);

// NHL seasons roll over in September, matching the ETL scraper.
export function currentNhlSeasonId(date = new Date()) {
  const year = date.getFullYear();
  const startYear = date.getMonth() >= 8 ? year : year - 1;
  return startYear * 10000 + (startYear + 1);
}
