import { fetchReadModel, readModelPaths } from "./read-models";

export async function loadSeason(year) {
  const season = year ? Number.parseInt(year, 10) : 20252026;

  if (Number.isNaN(season)) {
    return { notFound: true };
  }

  const readModel = await fetchReadModel(readModelPaths.season(season));

  if (readModel) {
    const players = readModel.players || [];
    const goalies = readModel.goalies || [];
    const availableSeasons = readModel.availableSeasons || [];
    const resolvedSeason = readModel.season || season;
    const seasonKnown = availableSeasons.some((value) => Number(value) === Number(resolvedSeason));

    if (!players.length && !goalies.length && availableSeasons.length && !seasonKnown) {
      return { notFound: true };
    }

    return {
      source: "s3-read-model",
      players,
      goalies,
      availableSeasons,
      season: resolvedSeason,
    };
  }

  const {
    getPointLeadersBySeason,
    getGoalieLeadersBySeason,
    getAvailableSeasons,
  } = await import("./queries");
  const [players, goalies, availableSeasons] = await Promise.all([
    getPointLeadersBySeason(season),
    getGoalieLeadersBySeason(season),
    getAvailableSeasons(),
  ]);

  const knownSeasons = availableSeasons || [];
  const hasLeaders = (players || []).length > 0 || (goalies || []).length > 0;
  if (
    !hasLeaders &&
    knownSeasons.length &&
    !knownSeasons.some((value) => Number(value) === Number(season))
  ) {
    return { notFound: true };
  }

  return {
    source: "postgres",
    players: players || [],
    goalies: goalies || [],
    availableSeasons: knownSeasons,
    season,
  };
}
