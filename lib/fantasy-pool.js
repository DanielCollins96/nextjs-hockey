import { applySkaterRealtime, fetchSkaterRealtime } from "./fantasy-realtime.js";

const CACHE_TTL_MS = 15 * 60 * 1000;
const poolCache = new Map();
let seasonsCache = null;

export async function loadFantasySeasons() {
  if (seasonsCache && seasonsCache.expires > Date.now()) return seasonsCache.seasons;

  const { getFantasySeasons } = await import("./queries.js");
  const seasons = await getFantasySeasons();
  seasonsCache = { seasons, expires: Date.now() + CACHE_TTL_MS };
  return seasons;
}

export async function loadFantasyPool(season, gameTypeId = 2) {
  const key = `${Number(season)}:${Number(gameTypeId)}`;
  const cached = poolCache.get(key);
  if (cached && cached.expires > Date.now()) return cached.value;

  const { getFantasyPlayers } = await import("./queries.js");
  const [players, realtimeResult] = await Promise.all([
    getFantasyPlayers(season, gameTypeId),
    fetchSkaterRealtime(season, gameTypeId).then(
      (realtime) => ({ realtime, hitsLoaded: true }),
      (error) => {
        console.error("Fantasy hits and blocked shots failed to load:", error);
        return { realtime: new Map(), hitsLoaded: false };
      }
    ),
  ]);

  const value = {
    players: applySkaterRealtime(players, realtimeResult.realtime),
    hitsLoaded: realtimeResult.hitsLoaded,
  };

  if (value.hitsLoaded) {
    poolCache.set(key, { value, expires: Date.now() + CACHE_TTL_MS });
  }

  return value;
}
