import { fetchReadModel, readModelPaths } from "./read-models";

function latestSeasonId(seasons) {
  return [...(seasons || [])]
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value))
    .sort((left, right) => right - left)[0] || null;
}

async function loadSeasonExact(season) {
  const readModel = await fetchReadModel(readModelPaths.season(season));

  if (readModel) {
    const players = readModel.players || [];
    const goalies = readModel.goalies || [];
    const availableSeasons = readModel.availableSeasons || [];
    const resolvedSeason = readModel.season || season;
    const seasonKnown = availableSeasons.some((value) => Number(value) === Number(resolvedSeason));

    if (!players.length && !goalies.length && availableSeasons.length && !seasonKnown) {
      return { notFound: true, availableSeasons };
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
    return { notFound: true, availableSeasons: knownSeasons };
  }

  return {
    source: "postgres",
    players: players || [],
    goalies: goalies || [],
    availableSeasons: knownSeasons,
    season,
  };
}

export async function loadSeason(year) {
  const explicitYear = year != null && String(year).trim() !== "";
  const requested = explicitYear ? Number.parseInt(year, 10) : 20252026;

  if (explicitYear && Number.isNaN(requested)) {
    return { notFound: true };
  }

  const first = await loadSeasonExact(requested);
  if (!first.notFound) return first;
  if (explicitYear) return first;

  const latest = latestSeasonId(first.availableSeasons);
  if (latest && latest !== requested) {
    return loadSeasonExact(latest);
  }

  return {
    source: first.source || "none",
    players: [],
    goalies: [],
    availableSeasons: first.availableSeasons || [],
    season: latest || requested,
  };
}
