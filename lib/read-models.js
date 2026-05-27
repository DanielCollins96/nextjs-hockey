const READ_MODEL_BASE_URL =
  process.env.READ_MODEL_BASE_URL ||
  process.env.S3_READ_MODEL_BASE_URL ||
  process.env.NEXT_PUBLIC_READ_MODEL_BASE_URL;

const DEFAULT_TIMEOUT_MS = 2500;

function getBaseUrl() {
  return READ_MODEL_BASE_URL?.replace(/\/+$/, "");
}

function buildReadModelUrl(path) {
  const baseUrl = getBaseUrl();
  if (!baseUrl) return null;

  const cleanPath = String(path || "").replace(/^\/+/, "");
  return `${baseUrl}/${cleanPath}`;
}

function pathSegment(value) {
  return encodeURIComponent(String(value));
}

export function readModelsEnabled() {
  return Boolean(getBaseUrl());
}

export async function fetchReadModel(path, options = {}) {
  const url = buildReadModelUrl(path);
  if (!url) return null;

  const timeoutMs = options.timeoutMs || DEFAULT_TIMEOUT_MS;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    });

    if (response.status === 404) return null;

    if (!response.ok) {
      console.warn(
        `Read model fetch failed for ${path}: ${response.status} ${response.statusText}`
      );
      return null;
    }

    return await response.json();
  } catch (error) {
    if (error.name !== "AbortError") {
      console.warn(`Read model fetch failed for ${path}:`, error.message);
    }
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export const readModelPaths = {
  player: (id) => `players/${pathSegment(id)}.json`,
  playerSearch: (bucket) =>
    bucket
      ? `indexes/player-search/${pathSegment(bucket)}.json`
      : "indexes/player-search.json",
  playerIds: () => "indexes/player-ids.json",
  team: (id) => `teams/${pathSegment(id)}.json`,
  teams: () => "indexes/teams.json",
  teamIds: () => "indexes/team-ids.json",
  teamRosters: () => "indexes/team-rosters.json",
  draft: (year) => `drafts/${pathSegment(year)}.json`,
  draftYears: () => "indexes/draft-years.json",
  season: (season) => `seasons/${pathSegment(season)}.json`,
};

export function unwrapReadModel(payload, key) {
  if (!payload) return null;
  if (Object.prototype.hasOwnProperty.call(payload, key)) return payload[key];
  return payload;
}
