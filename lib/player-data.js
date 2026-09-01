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

async function loadPlayerBase(id) {
  const readModel = await fetchReadModel(readModelPaths.player(id));

  if (readModel) {
    let playerRows = [];
    if (Array.isArray(readModel.player)) {
      playerRows = readModel.player;
    } else if (readModel.player) {
      playerRows = [readModel.player];
    }

    const player = await hydratePlayerMeasurements(
      id,
      playerRows.map(serializePlayerRow)
    );
    if (!player.length) {
      return { notFound: true };
    }

    return { source: "s3-read-model", player, readModel };
  }

  const { getPlayer } = await import("./queries");
  const player = await hydratePlayerMeasurements(
    id,
    ((await getPlayer(id)) || []).map(serializePlayerRow)
  );
  if (!player.length) {
    return { notFound: true };
  }

  return { source: "postgres", player, readModel: null };
}

export async function loadPlayerProfile(id) {
  const base = await loadPlayerBase(id);
  if (base.notFound) return base;

  return {
    source: base.source,
    player: base.player,
  };
}

export async function loadPlayer(id) {
  const base = await loadPlayerBase(id);
  if (base.notFound) return base;

  if (base.readModel) {
    const { contracts, currentContract } = await fetchPlayerContracts(
      id,
      base.readModel
    );

    return {
      source: base.source,
      player: base.player,
      playerStats: base.readModel.playerStats || base.readModel.stats || [],
      awards: base.readModel.awards || [],
      contracts,
      currentContract,
    };
  }

  const { getPlayerStats, getPlayerAwards } = await import("./queries");
  const [playerStats, awards] = await Promise.all([
    getPlayerStats(id, base.player[0]?.position),
    getPlayerAwards(id),
  ]);

  return {
    source: base.source,
    player: base.player,
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

const MIN_SITEMAP_GAMES = 1;
const SEARCH_BUCKETS = "abcdefghijklmnopqrstuvwxyz".split("");

function toSitemapPlayer(player) {
  return {
    playerId: player.playerId ?? player.id ?? player,
    player_name: player.player_name || player.name || player.fullName || "",
    games: Number(player.games) || 0,
  };
}

function playersFromSearchIndex(readModel, minGames) {
  const playersById = new Map();
  const rows = unwrapReadModel(readModel, "players");
  (Array.isArray(rows) ? rows : []).forEach((player) => {
    const mapped = toSitemapPlayer(player);
    if (!mapped.playerId || mapped.games < minGames) return;
    playersById.set(String(mapped.playerId), mapped);
  });
  return [...playersById.values()];
}

async function loadSitemapPlayersFromPostgres(minGames) {
  const { getSitemapPlayers } = await import("./queries");
  return {
    source: "postgres",
    players: ((await getSitemapPlayers(minGames)) || []).map(toSitemapPlayer),
  };
}

export async function loadSitemapPlayers(minGames = MIN_SITEMAP_GAMES) {
  const safeMinGames = Number.isFinite(Number(minGames)) ? Number(minGames) : MIN_SITEMAP_GAMES;
  const fullIndexPlayers = playersFromSearchIndex(
    await fetchReadModel(readModelPaths.playerSearch()),
    safeMinGames
  );

  if (fullIndexPlayers.length) {
    return { source: "s3-read-model", players: fullIndexPlayers };
  }

  const bucketIndexes = await Promise.all(
    SEARCH_BUCKETS.map((bucket) => fetchReadModel(readModelPaths.playerSearch(bucket)))
  );

  if (bucketIndexes.some((readModel) => !readModel)) {
    return loadSitemapPlayersFromPostgres(safeMinGames);
  }

  const bucketPlayersById = new Map();
  bucketIndexes.forEach((readModel) => {
    playersFromSearchIndex(readModel, safeMinGames).forEach((player) => {
      bucketPlayersById.set(String(player.playerId), player);
    });
  });

  if (bucketPlayersById.size) {
    return { source: "s3-read-model", players: [...bucketPlayersById.values()] };
  }

  return loadSitemapPlayersFromPostgres(safeMinGames);
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
