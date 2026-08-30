import { fetchReadModel, readModelPaths } from "./read-models";

export async function loadSeason(year) {
  const season = year ? Number.parseInt(year, 10) : 20252026;

  if (Number.isNaN(season)) {
    return { error: "Invalid season year" };
  }

  const readModel = await fetchReadModel(readModelPaths.season(season));

  if (readModel) {
    return {
      source: "s3-read-model",
      players: readModel.players || [],
      goalies: readModel.goalies || [],
      availableSeasons: readModel.availableSeasons || [],
      season: readModel.season || season,
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

  return {
    source: "postgres",
    players: players || [],
    goalies: goalies || [],
    availableSeasons: availableSeasons || [],
    season,
  };
}
