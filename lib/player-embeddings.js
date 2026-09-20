import { seasonEndYear, toNumber } from "./format.js";

export const EMBEDDING_VERSION = 1;
export const MIN_SIMILAR_CANDIDATE_GAMES = 50;
export const MIN_SIMILAR_GOALIE_GAMES = 25;
export const DEFAULT_SIMILAR_LIMIT = 8;
export const MAX_SIMILAR_LIMIT = 20;

const FORWARD_POSITIONS = new Set(["C", "L", "R", "W", "LW", "RW", "F", "CENTER"]);
const DEFENSE_POSITIONS = new Set(["D", "LD", "RD", "DEFENSE", "DEFENCE"]);
const GOALIE_POSITIONS = new Set(["G", "GOALIE", "GOALTENDER"]);

export const SKATER_FEATURES = [
  { key: "gamesLog", weight: 0.4 },
  { key: "goalsPerGame", weight: 1.5 },
  { key: "assistsPerGame", weight: 1.5 },
  { key: "pointsPerGame", weight: 0.9 },
  { key: "goalShare", weight: 1.35 },
  { key: "era", weight: 0.35 },
];

export const GOALIE_FEATURES = [
  { key: "gamesLog", weight: 0.5 },
  { key: "winPct", weight: 1.6 },
  { key: "winsPerGame", weight: 1.15 },
  { key: "era", weight: 0.4 },
];

export function positionGroup(position) {
  const value = String(position || "").trim().toUpperCase();
  if (!value) return "F";
  if (GOALIE_POSITIONS.has(value)) return "G";
  if (DEFENSE_POSITIONS.has(value)) return "D";
  if (FORWARD_POSITIONS.has(value)) return "F";
  if (value.startsWith("G")) return "G";
  if (value.startsWith("D")) return "D";
  return "F";
}

export function featuresForGroup(group) {
  return group === "G" ? GOALIE_FEATURES : SKATER_FEATURES;
}

export function minGamesForGroup(group) {
  return group === "G" ? MIN_SIMILAR_GOALIE_GAMES : MIN_SIMILAR_CANDIDATE_GAMES;
}

function rate(numerator, games) {
  if (!games) return 0;
  return (toNumber(numerator) || 0) / games;
}

export function rawPlayerFeatures(player) {
  const games = Math.max(0, toNumber(player?.games) || 0);
  const goals = Math.max(0, toNumber(player?.goals) || 0);
  const assists = Math.max(0, toNumber(player?.assists) || 0);
  const points = Math.max(0, toNumber(player?.points) || goals + assists);
  const wins = Math.max(0, toNumber(player?.wins) || 0);
  const losses = Math.max(0, toNumber(player?.losses) || 0);
  const decisions = wins + losses;
  const era = seasonEndYear(player?.last_season || player?.lastSeason) || 0;

  return {
    gamesLog: Math.log1p(games),
    goalsPerGame: rate(goals, games),
    assistsPerGame: rate(assists, games),
    pointsPerGame: rate(points, games),
    goalShare: points > 0 ? goals / points : 0,
    winPct: decisions > 0 ? wins / decisions : 0,
    winsPerGame: rate(wins, games),
    era,
  };
}

export function meanAndStd(values) {
  const numbers = (values || []).filter((value) => Number.isFinite(value));
  if (numbers.length === 0) return { mean: 0, std: 0 };
  const mean = numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
  if (numbers.length === 1) return { mean, std: 0 };
  const variance =
    numbers.reduce((sum, value) => sum + (value - mean) ** 2, 0) / numbers.length;
  return { mean, std: Math.sqrt(variance) };
}

export function zScore(value, mean, std) {
  if (!Number.isFinite(value) || !Number.isFinite(mean)) return 0;
  if (!Number.isFinite(std) || std < 1e-9) return 0;
  return (value - mean) / std;
}

export function l2Normalize(vector) {
  const values = Array.isArray(vector) ? vector.map((value) => (Number.isFinite(value) ? value : 0)) : [];
  const norm = Math.sqrt(values.reduce((sum, value) => sum + value * value, 0));
  if (norm < 1e-9) return values.map(() => 0);
  return values.map((value) => value / norm);
}

export function cosineSimilarity(left, right) {
  const length = Math.min(left?.length || 0, right?.length || 0);
  if (!length) return 0;
  let dot = 0;
  for (let index = 0; index < length; index += 1) {
    dot += (left[index] || 0) * (right[index] || 0);
  }
  return dot;
}

export function similarityPercent(cosine) {
  const clamped = Math.max(-1, Math.min(1, Number(cosine) || 0));
  return Math.round(((clamped + 1) / 2) * 100);
}

export function buildGroupStats(players, group) {
  const features = featuresForGroup(group);
  const stats = {};
  features.forEach((feature) => {
    stats[feature.key] = meanAndStd(
      (players || []).map((player) => rawPlayerFeatures(player)[feature.key])
    );
  });
  return stats;
}

export function embedPlayer(player, groupStats, group = positionGroup(player?.position)) {
  const features = featuresForGroup(group);
  const raw = rawPlayerFeatures(player);
  const weighted = features.map((feature) => {
    const stats = groupStats?.[feature.key] || { mean: 0, std: 0 };
    return zScore(raw[feature.key], stats.mean, stats.std) * feature.weight;
  });
  return l2Normalize(weighted);
}

export function buildEmbeddingIndex(players) {
  const byGroup = { F: [], D: [], G: [] };
  (Array.isArray(players) ? players : []).forEach((player) => {
    if (!player?.playerId && player?.id == null) return;
    const group = positionGroup(player.position);
    const minGames = minGamesForGroup(group);
    const games = toNumber(player.games) || 0;
    if (games < minGames) return;
    byGroup[group].push(player);
  });

  const statsByGroup = {
    F: buildGroupStats(byGroup.F, "F"),
    D: buildGroupStats(byGroup.D, "D"),
    G: buildGroupStats(byGroup.G, "G"),
  };

  const entries = [];
  Object.entries(byGroup).forEach(([group, groupPlayers]) => {
    groupPlayers.forEach((player) => {
      entries.push({
        player,
        group,
        vector: embedPlayer(player, statsByGroup[group], group),
      });
    });
  });

  return {
    version: EMBEDDING_VERSION,
    statsByGroup,
    entries,
    byId: new Map(entries.map((entry) => [String(entry.player.playerId ?? entry.player.id), entry])),
  };
}

function closestFeatureLabels(targetRaw, otherRaw, group, groupStats) {
  const features = featuresForGroup(group);
  return features
    .filter((feature) => (groupStats?.[feature.key]?.std || 0) > 1e-6)
    .map((feature) => {
      const delta = Math.abs((targetRaw[feature.key] || 0) - (otherRaw[feature.key] || 0));
      return { key: feature.key, delta, weight: feature.weight };
    })
    .sort((left, right) => left.delta / left.weight - right.delta / right.weight)
    .slice(0, 2)
    .map((feature) => {
      if (feature.key === "goalShare") return "scoring mix";
      if (feature.key === "goalsPerGame") return "goal scoring";
      if (feature.key === "assistsPerGame") return "playmaking";
      if (feature.key === "pointsPerGame") return "point production";
      if (feature.key === "gamesLog") return "career volume";
      if (feature.key === "winPct" || feature.key === "winsPerGame") return "winning rate";
      if (feature.key === "era") return "era";
      return feature.key;
    });
}

export function rankSimilarPlayers(index, targetPlayer, {
  limit = DEFAULT_SIMILAR_LIMIT,
  excludeIds = [],
} = {}) {
  if (!index || !targetPlayer) return [];

  const targetId = String(targetPlayer.playerId ?? targetPlayer.id ?? "");
  const group = positionGroup(targetPlayer.position);
  const excluded = new Set(
    [targetId, ...(excludeIds || []).map((id) => String(id))].filter(Boolean)
  );
  const existing = index.byId.get(targetId);
  const targetVector = existing?.vector || embedPlayer(targetPlayer, index.statsByGroup[group], group);
  const targetRaw = rawPlayerFeatures(targetPlayer);

  return index.entries
    .filter((entry) => entry.group === group && !excluded.has(String(entry.player.playerId ?? entry.player.id)))
    .map((entry) => {
      const cosine = cosineSimilarity(targetVector, entry.vector);
      return {
        player: entry.player,
        group,
        cosine,
        similarity: similarityPercent(cosine),
        reasons: closestFeatureLabels(
          targetRaw,
          rawPlayerFeatures(entry.player),
          group,
          index.statsByGroup[group]
        ),
      };
    })
    .sort((left, right) => right.cosine - left.cosine || (Number(right.player.games) || 0) - (Number(left.player.games) || 0))
    .slice(0, Math.min(Math.max(limit, 1), MAX_SIMILAR_LIMIT));
}

export function parseSimilarLimit(value, fallback = DEFAULT_SIMILAR_LIMIT) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(Math.max(parsed, 1), MAX_SIMILAR_LIMIT);
}
