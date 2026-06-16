export const normalizeSeasonId = (season) =>
  season === null || season === undefined ? "" : String(season);
