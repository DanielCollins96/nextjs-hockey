import { fetchReadModel, readModelPaths, readModelsEnabled, unwrapReadModel } from "./read-models";
import { serializeDateOnly } from "./format";
import { normalizeSeasonId } from "./season";
import { buildTeamSeasonMap, listTeamSeasonIds } from "./team-season";

export { buildTeamSeasonMap, listTeamSeasonIds };

const MIN_CONTRACT_SEASON = "20052006";

function getContractSeason(rosterRows, requestedSeason) {
  const requestedSeasonId = normalizeSeasonId(requestedSeason);
  if (requestedSeasonId) return requestedSeasonId;

  return (
    rosterRows
      .map((player) => normalizeSeasonId(player?.season))
      .filter(Boolean)
      .sort((a, b) => b.localeCompare(a))[0] || ""
  );
}

function serializeRosterRow(player) {
  return {
    ...player,
    birthdate: serializeDateOnly(player.birthdate || player.birthDate),
  };
}

function resolveRosterSeason(seasonIds, rosterSeason) {
  if (rosterSeason === true || rosterSeason === "latest") {
    return seasonIds[0] || null;
  }

  return normalizeSeasonId(rosterSeason) || null;
}

function filterRosterBySeason(rows, seasonId) {
  if (!seasonId) return rows;
  return rows.filter((row) => normalizeSeasonId(row?.season) === seasonId);
}

function normalizeTeamContractReadModel(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  return Array.isArray(payload.teamContracts) ? payload.teamContracts : [];
}

async function fetchTeamContracts(skaters, goalies, requestedSeason) {
  const rosterRows = [...(skaters || []), ...(goalies || [])].filter(
    (player) => normalizeSeasonId(player?.season) >= MIN_CONTRACT_SEASON
  );
  const contractSeason = getContractSeason(rosterRows, requestedSeason);
  if (!contractSeason) return [];

  const teamId = rosterRows.find(
    (player) => normalizeSeasonId(player?.season) === contractSeason
  )?.id;
  if (!teamId) return [];

  const teamContractReadModel = await fetchReadModel(
    readModelPaths.teamContracts(teamId, contractSeason),
    { missStatuses: [403, 404] }
  );
  return normalizeTeamContractReadModel(teamContractReadModel);
}

function finalizeTeamPayload({
  source,
  team,
  teamRecords,
  skaters,
  goalies,
  teamContracts,
  playoffSeasons,
  rosterSeason,
}) {
  const serializedSkaters = (skaters || []).map(serializeRosterRow);
  const serializedGoalies = (goalies || []).map(serializeRosterRow);
  const seasonIds = listTeamSeasonIds(serializedSkaters, serializedGoalies);
  const selectedRosterSeason = resolveRosterSeason(seasonIds, rosterSeason);

  return {
    source,
    team,
    teamRecords,
    skaters: filterRosterBySeason(serializedSkaters, selectedRosterSeason),
    goalies: filterRosterBySeason(serializedGoalies, selectedRosterSeason),
    teamContracts,
    playoffSeasons: playoffSeasons || [],
    seasonIds,
    rosterSeason: selectedRosterSeason,
  };
}

export async function loadTeam(id, { contractSeason, rosterSeason } = {}) {
  const readModel = await fetchReadModel(readModelPaths.team(id));

  if (readModel) {
    if (!readModel.team || !(readModel.team.fullName || readModel.team.name || readModel.team.abbreviation)) {
      return { notFound: true };
    }

    const skaters = readModel.skaters || [];
    const goalies = readModel.goalies || [];
    const teamRecords = readModel.teamRecords || [];
    const teamContracts = await fetchTeamContracts(skaters, goalies, contractSeason);
    let source = "s3-read-model";
    if (teamContracts.length) {
      source = `${source}+s3-player-contracts`;
    }

    return finalizeTeamPayload({
      source,
      team: readModel.team,
      teamRecords,
      skaters,
      goalies,
      teamContracts,
      playoffSeasons: readModel.playoffSeasons || [],
      rosterSeason,
    });
  }

  if (readModelsEnabled()) {
    return { notFound: true };
  }

  const {
    getTeamInfo,
    getTeamSeasons,
    getTeamSkaters,
    getTeamGoalies,
    getPlayoffYears,
  } = await import("./queries");

  const teamInfo = await getTeamInfo(id);
  if (!teamInfo) {
    return { notFound: true };
  }

  const [teamRecords, skaters, goalies] = await Promise.all([
    getTeamSeasons(id),
    getTeamSkaters(id),
    getTeamGoalies(id),
  ]);

  const playoffSeasons = await getPlayoffYears(teamInfo.abbreviation);
  const teamContracts = await fetchTeamContracts(skaters, goalies, contractSeason);

  return finalizeTeamPayload({
    source: teamContracts.length ? "postgres+s3-player-contracts" : "postgres",
    team: teamInfo,
    teamRecords,
    skaters,
    goalies,
    teamContracts,
    playoffSeasons,
    rosterSeason,
  });
}

export async function loadTeamContractsOnly(id, contractSeason) {
  const result = await loadTeam(id, { contractSeason });
  if (result.notFound) return result;
  return {
    source: result.source,
    teamContracts: result.teamContracts,
  };
}

export async function loadTeams() {
  const readModel = await fetchReadModel(readModelPaths.teams());

  if (readModel) {
    return {
      source: "s3-read-model",
      teams: unwrapReadModel(readModel, "teams") || [],
    };
  }

  const { getTeams } = await import("./queries");
  return {
    source: "postgres",
    teams: await getTeams(),
  };
}

export async function loadTeamIds() {
  const readModel = await fetchReadModel(readModelPaths.teamIds());

  if (readModel) {
    return {
      source: "s3-read-model",
      teamIds: unwrapReadModel(readModel, "teamIds") || [],
    };
  }

  const { getTeamIds } = await import("./queries");
  return {
    source: "postgres",
    teamIds: (await getTeamIds()) || [],
  };
}
