import { normalizeSeasonId } from "./season";

export function listTeamSeasonIds(skaters = [], goalies = []) {
  const ids = new Set();
  for (const row of [...skaters, ...goalies]) {
    const season = normalizeSeasonId(row?.season);
    if (season) ids.add(season);
  }
  return [...ids].sort((a, b) => b.localeCompare(a));
}

export function buildTeamSeasonMap(skaters = [], goalies = [], playoffSeasons = []) {
  const seasonMap = {};

  skaters.forEach((skater) => {
    const season = normalizeSeasonId(skater.season);
    if (!season) return;
    if (!seasonMap[season]) seasonMap[season] = { skaters: [], goalies: [] };
    seasonMap[season].skaters.push(skater);
  });

  goalies.forEach((goalie) => {
    const season = normalizeSeasonId(goalie.season);
    if (!season) return;
    if (!seasonMap[season]) seasonMap[season] = { skaters: [], goalies: [] };
    seasonMap[season].goalies.push(goalie);
  });

  const playoffSeasonIds = new Set(playoffSeasons.map(normalizeSeasonId));
  Object.keys(seasonMap).forEach((season) => {
    seasonMap[season].madePlayoffs = playoffSeasonIds.has(season);
  });

  return seasonMap;
}
