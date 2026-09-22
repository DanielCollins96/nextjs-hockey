import { fetchReadModel, readModelPaths, readModelsEnabled } from "./read-models";

function latestSeasonId(seasons) {
  return [...(seasons || [])]
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value))
    .sort((left, right) => right - left)[0] || null;
}

function hasSeasonSplit(readModel) {
  return Array.isArray(readModel?.playoffPlayers) && Array.isArray(readModel?.playoffGoalies);
}

function seasonPayload({
  source,
  players = [],
  playoffPlayers = [],
  goalies = [],
  playoffGoalies = [],
  awards = [],
  availableSeasons = [],
  season,
}) {
  return {
    source,
    players,
    playoffPlayers,
    goalies,
    playoffGoalies,
    awards,
    availableSeasons,
    season,
  };
}

async function loadSeasonFromPostgres(season, extras = {}) {
  const {
    getPointLeadersBySeason,
    getGoalieLeadersBySeason,
    getSeasonAwards,
    getAvailableSeasons,
  } = await import("./queries");
  const [players, playoffPlayers, goalies, playoffGoalies, awards, availableSeasons] =
    await Promise.all([
      getPointLeadersBySeason(season, 2),
      getPointLeadersBySeason(season, 3),
      getGoalieLeadersBySeason(season, 2),
      getGoalieLeadersBySeason(season, 3),
      extras.awards !== undefined ? Promise.resolve(extras.awards) : getSeasonAwards(season),
      extras.availableSeasons !== undefined
        ? Promise.resolve(extras.availableSeasons)
        : getAvailableSeasons(),
    ]);

  return seasonPayload({
    source: "postgres",
    players: players || [],
    playoffPlayers: playoffPlayers || [],
    goalies: goalies || [],
    playoffGoalies: playoffGoalies || [],
    awards: awards || extras.awards || [],
    availableSeasons: availableSeasons || extras.availableSeasons || [],
    season,
  });
}

async function loadSeasonExact(season) {
  const readModel = await fetchReadModel(readModelPaths.season(season));

  if (readModel && hasSeasonSplit(readModel)) {
    const availableSeasons = readModel.availableSeasons || [];
    const resolvedSeason = readModel.season || season;
    const seasonKnown = availableSeasons.some((value) => Number(value) === Number(resolvedSeason));
    const players = readModel.players || [];
    const goalies = readModel.goalies || [];
    const playoffPlayers = readModel.playoffPlayers || [];
    const playoffGoalies = readModel.playoffGoalies || [];
    const hasLeaders =
      players.length > 0 ||
      goalies.length > 0 ||
      playoffPlayers.length > 0 ||
      playoffGoalies.length > 0;

    if (!hasLeaders && availableSeasons.length && !seasonKnown) {
      return { notFound: true, availableSeasons };
    }

    return seasonPayload({
      source: "s3-read-model",
      players,
      playoffPlayers,
      goalies,
      playoffGoalies,
      awards: readModel.awards || [],
      availableSeasons,
      season: resolvedSeason,
    });
  }

  if (readModel || !readModelsEnabled()) {
    try {
      return await loadSeasonFromPostgres(season, {
        awards: readModel?.awards,
        availableSeasons: readModel?.availableSeasons,
      });
    } catch (error) {
      console.error("Season leader split query failed:", error);
      if (!readModel) throw error;
    }
  }

  if (readModel) {
    const availableSeasons = readModel.availableSeasons || [];
    const resolvedSeason = readModel.season || season;
    const seasonKnown = availableSeasons.some((value) => Number(value) === Number(resolvedSeason));
    const players = readModel.players || [];
    const goalies = readModel.goalies || [];

    if (!players.length && !goalies.length && availableSeasons.length && !seasonKnown) {
      return { notFound: true, availableSeasons };
    }

    return seasonPayload({
      source: "s3-read-model",
      players,
      playoffPlayers: [],
      goalies,
      playoffGoalies: [],
      awards: readModel.awards || [],
      availableSeasons,
      season: resolvedSeason,
    });
  }

  if (readModelsEnabled()) {
    return { notFound: true };
  }

  return { notFound: true };
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

  return seasonPayload({
    source: first.source || "none",
    availableSeasons: first.availableSeasons || [],
    season: latest || requested,
  });
}
