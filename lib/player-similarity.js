import { fetchReadModel, readModelPaths, unwrapReadModel } from "./read-models";
import { playerUrl } from "./routes";
import {
  DEFAULT_SIMILAR_LIMIT,
  EMBEDDING_VERSION,
  buildEmbeddingIndex,
  parseSimilarLimit,
  positionGroup,
  rankSimilarPlayers,
} from "./player-embeddings";

const CORPUS_TTL_MS = 60 * 60 * 1000;
const SEARCH_BUCKETS = "abcdefghijklmnopqrstuvwxyz".split("");
const INDEX_TIMEOUT_MS = 8000;

let corpusCache = {
  expiresAt: 0,
  promise: null,
  payload: null,
};

function numberOrZero(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

export function mapSimilarityPlayer(player) {
  const id = player?.playerId ?? player?.id;
  const name = player?.player_name || player?.name || player?.fullName || "";
  const goals = numberOrZero(player?.goals);
  const assists = numberOrZero(player?.assists);

  return {
    playerId: id,
    player_name: name,
    position: player?.position || "",
    team_name: player?.team_name || player?.teamName || player?.team_abbrev || "",
    games: numberOrZero(player?.games),
    goals,
    assists,
    points: numberOrZero(player?.points) || goals + assists,
    wins: numberOrZero(player?.wins),
    losses: numberOrZero(player?.losses),
    last_season: player?.last_season || player?.lastSeason || "",
  };
}

function playersFromSearchIndex(readModel) {
  const playersById = new Map();
  const rows = unwrapReadModel(readModel, "players");
  (Array.isArray(rows) ? rows : []).forEach((player) => {
    const mapped = mapSimilarityPlayer(player);
    if (mapped.playerId == null || mapped.playerId === "") return;
    playersById.set(String(mapped.playerId), mapped);
  });
  return [...playersById.values()];
}

function serializeSimilarPlayer(entry) {
  const player = entry.player;
  const id = player.playerId ?? player.id;
  const name = player.player_name || player.name || "";

  return {
    id,
    name,
    position: player.position || "",
    teamName: player.team_name || player.teamName || "",
    games: numberOrZero(player.games),
    goals: numberOrZero(player.goals),
    assists: numberOrZero(player.assists),
    points: numberOrZero(player.points),
    wins: numberOrZero(player.wins),
    losses: numberOrZero(player.losses),
    lastSeason: player.last_season || player.lastSeason || "",
    similarity: entry.similarity,
    reasons: entry.reasons,
    href: playerUrl(name, id),
  };
}

async function loadCorpusFromEmbeddingsReadModel() {
  const readModel = await fetchReadModel(readModelPaths.playerEmbeddings(), {
    timeoutMs: INDEX_TIMEOUT_MS,
  });
  if (!readModel) return null;

  const rows = unwrapReadModel(readModel, "players") || [];
  const players = (Array.isArray(rows) ? rows : []).map(mapSimilarityPlayer);
  if (!players.length) return null;

  return {
    source: "s3-embeddings",
    players,
  };
}

async function loadCorpusFromSearchReadModels() {
  const fullIndex = await fetchReadModel(readModelPaths.playerSearch(), {
    timeoutMs: INDEX_TIMEOUT_MS,
  });
  const fullPlayers = playersFromSearchIndex(fullIndex);
  if (fullPlayers.length) {
    return { source: "s3-player-search", players: fullPlayers };
  }

  const buckets = await Promise.all(
    SEARCH_BUCKETS.map((bucket) =>
      fetchReadModel(readModelPaths.playerSearch(bucket), { timeoutMs: INDEX_TIMEOUT_MS })
    )
  );

  // Missing buckets are an incomplete stitch; fall through instead of caching a truncated NHL corpus.
  if (buckets.some((readModel) => !readModel)) return null;

  const playersById = new Map();
  buckets.forEach((readModel) => {
    playersFromSearchIndex(readModel).forEach((player) => {
      playersById.set(String(player.playerId), player);
    });
  });

  if (playersById.size === 0) return null;
  return { source: "s3-player-search", players: [...playersById.values()] };
}

async function loadCorpusFromPostgres() {
  const { getPlayerSimilarityCorpus } = await import("./queries");
  const rows = await getPlayerSimilarityCorpus();
  return {
    source: "postgres",
    players: (rows || []).map(mapSimilarityPlayer),
  };
}

async function loadSimilarityCorpusUncached() {
  const fromEmbeddings = await loadCorpusFromEmbeddingsReadModel();
  if (fromEmbeddings) return fromEmbeddings;

  const fromSearch = await loadCorpusFromSearchReadModels();
  if (fromSearch) return fromSearch;

  return loadCorpusFromPostgres();
}

export async function loadSimilarityCorpus({ force = false } = {}) {
  const now = Date.now();
  if (!force && corpusCache.payload && now < corpusCache.expiresAt) {
    return corpusCache.payload;
  }
  if (!force && corpusCache.promise) return corpusCache.promise;

  corpusCache.promise = loadSimilarityCorpusUncached()
    .then((corpus) => {
      if (!corpus || corpus.source === "none" || !corpus.players?.length) {
        corpusCache.promise = null;
        throw new Error("Player similarity corpus unavailable");
      }
      const index = buildEmbeddingIndex(corpus.players);
      const payload = {
        source: corpus.source,
        version: EMBEDDING_VERSION,
        players: corpus.players,
        index,
      };
      corpusCache.payload = payload;
      corpusCache.expiresAt = Date.now() + CORPUS_TTL_MS;
      corpusCache.promise = null;
      return payload;
    })
    .catch((error) => {
      corpusCache.promise = null;
      throw error;
    });

  return corpusCache.promise;
}

export function findTargetPlayer(corpus, id, profileOverride = null) {
  const key = String(id ?? "");
  if (!key) return profileOverride ? mapSimilarityPlayer(profileOverride) : null;

  const indexed = corpus.index.byId.get(key)?.player;
  if (indexed) return indexed;

  const fromCorpus = corpus.players.find((player) => String(player.playerId) === key);
  if (fromCorpus) return fromCorpus;
  if (profileOverride) return mapSimilarityPlayer({ ...profileOverride, playerId: id });
  return null;
}

export async function findSimilarPlayers(id, {
  limit = DEFAULT_SIMILAR_LIMIT,
  excludeIds = [],
  profileOverride = null,
} = {}) {
  const corpus = await loadSimilarityCorpus();
  const target = findTargetPlayer(corpus, id, profileOverride);
  if (!target || corpus.source === "none") {
    return {
      source: corpus.source,
      version: EMBEDDING_VERSION,
      playerId: id || null,
      group: target ? positionGroup(target.position) : null,
      players: [],
    };
  }

  const ranked = rankSimilarPlayers(corpus.index, target, {
    limit: parseSimilarLimit(limit),
    excludeIds,
  });

  return {
    source: corpus.source,
    version: EMBEDDING_VERSION,
    playerId: String(target.playerId),
    group: positionGroup(target.position),
    players: ranked.map(serializeSimilarPlayer),
  };
}
