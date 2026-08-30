import { fetchReadModel, readModelPaths, unwrapReadModel } from "./read-models";
import { hasContractData, normalizeContractReadModel } from "./contracts";
import { serializeDateOnly } from "./format";

function serializePlayerRow(playerRow) {
  return {
    ...playerRow,
    birthdate: serializeDateOnly(playerRow.birthdate || playerRow.birthDate),
  };
}

const hasPositiveNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0;
};

const needsMeasurementData = (player) =>
  (!hasPositiveNumber(player?.heightInInches) &&
    !hasPositiveNumber(player?.heightInCentimeters)) ||
  (!hasPositiveNumber(player?.weightInPounds) &&
    !hasPositiveNumber(player?.weightInKilograms));

async function fetchNhlPlayerMeasurements(id) {
  try {
    const response = await fetch(`https://api-web.nhle.com/v1/player/${id}/landing`);
    if (!response.ok) return {};

    const player = await response.json();
    return {
      heightInInches: player.heightInInches,
      weightInPounds: player.weightInPounds,
      heightInCentimeters: player.heightInCentimeters,
      weightInKilograms: player.weightInKilograms,
    };
  } catch (error) {
    console.log("Unable to fetch NHL player measurements", error);
    return {};
  }
}

async function hydratePlayerMeasurements(id, playerRows) {
  const safePlayerRows = Array.isArray(playerRows) ? playerRows : [];
  if (!safePlayerRows.some(needsMeasurementData)) return safePlayerRows;

  const measurements = await fetchNhlPlayerMeasurements(id);
  return safePlayerRows.map((player) =>
    needsMeasurementData(player)
      ? {
          ...player,
          ...measurements,
        }
      : player
  );
}

async function fetchPlayerContracts(id, playerReadModel) {
  const embeddedContracts = normalizeContractReadModel(playerReadModel);
  if (hasContractData(embeddedContracts)) {
    return embeddedContracts;
  }

  return normalizeContractReadModel(
    await fetchReadModel(readModelPaths.playerContracts(id), { missStatuses: [403, 404] })
  );
}

function normalizeSearchTerm(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function comparePlayerSearchResults(left, right) {
  return (
    (Number(right.games) || 0) - (Number(left.games) || 0) ||
    (Number(right.points) || 0) - (Number(left.points) || 0) ||
    (Number(right.goals) || 0) - (Number(left.goals) || 0)
  );
}

export async function loadPlayer(id) {
  const readModel = await fetchReadModel(readModelPaths.player(id));

  if (readModel) {
    let playerRows = [];
    if (Array.isArray(readModel.player)) {
      playerRows = readModel.player;
    } else if (readModel.player) {
      playerRows = [readModel.player];
    }

    const player = playerRows.map(serializePlayerRow);
    const hydratedPlayer = await hydratePlayerMeasurements(id, player);
    const { contracts, currentContract } = await fetchPlayerContracts(id, readModel);

    return {
      source: "s3-read-model",
      player: hydratedPlayer,
      playerStats: readModel.playerStats || readModel.stats || [],
      awards: readModel.awards || [],
      contracts,
      currentContract,
    };
  }

  const { getPlayerStats, getPlayer, getPlayerAwards } = await import("./queries");
  const player = await hydratePlayerMeasurements(
    id,
    (await getPlayer(id) || []).map(serializePlayerRow)
  );
  if (!player || player.length === 0) {
    return { notFound: true };
  }

  const [playerStats, awards] = await Promise.all([
    getPlayerStats(id, player[0]?.position),
    getPlayerAwards(id),
  ]);

  return {
    source: "postgres",
    player,
    playerStats,
    awards,
    contracts: [],
    currentContract: null,
  };
}

export async function searchPlayersList(q, limit = 100) {
  const parsedLimit = Number.parseInt(limit, 10);
  const safeLimit = Number.isNaN(parsedLimit) ? 100 : Math.min(Math.max(parsedLimit, 1), 200);
  const normalizedSearchTerm = normalizeSearchTerm(q);
  const searchBucket = /^[a-z]/.test(normalizedSearchTerm)
    ? normalizedSearchTerm[0]
    : null;

  if (!normalizedSearchTerm || normalizedSearchTerm.length < 2) {
    return { source: "none", players: [] };
  }

  const readModel = searchBucket
    ? await fetchReadModel(readModelPaths.playerSearch(searchBucket))
    : null;

  if (readModel) {
    const playersIndex = unwrapReadModel(readModel, "players") || [];
    const players = playersIndex
      .filter((player) => {
        const searchText = normalizeSearchTerm(
          player.searchText || player.player_name || ""
        );
        return searchText.includes(normalizedSearchTerm);
      })
      .sort(comparePlayerSearchResults)
      .slice(0, safeLimit);

    return { source: "s3-read-model", players };
  }

  const { searchPlayers } = await import("./queries");
  const players = q ? await searchPlayers(String(q), safeLimit) : [];
  return { source: "postgres", players };
}

export async function loadPlayerIds() {
  const readModel = await fetchReadModel(readModelPaths.playerIds());

  if (readModel) {
    return {
      source: "s3-read-model",
      playerIds: unwrapReadModel(readModel, "playerIds") || [],
    };
  }

  const { getAllPlayerIds } = await import("./queries");
  return {
    source: "postgres",
    playerIds: (await getAllPlayerIds()) || [],
  };
}
