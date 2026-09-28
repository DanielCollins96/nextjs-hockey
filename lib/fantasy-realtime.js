const REALTIME_URL = "https://api.nhle.com/stats/rest/en/skater/realtime";
const CACHE_TTL_MS = 15 * 60 * 1000;
const realtimeCache = new Map();

function num(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

export function sumSkaterRealtime(rows) {
  const totals = new Map();
  for (const row of rows || []) {
    if (row?.playerId == null) continue;
    const id = String(row.playerId);
    const current = totals.get(id) || { hits: 0, blockedShots: 0 };
    current.hits += num(row.hits);
    current.blockedShots += num(row.blockedShots);
    totals.set(id, current);
  }
  return totals;
}

export function applySkaterRealtime(players, totals) {
  return (players || []).map((player) => {
    const extra = totals?.get(String(player.playerId));
    if (!extra || player.position === "G" || player.positionGroup === "G") {
      return { ...player, HIT: num(player.HIT), BLK: num(player.BLK) };
    }
    return {
      ...player,
      HIT: extra.hits,
      BLK: extra.blockedShots,
    };
  });
}

async function fetchRealtimeBody(season, gameTypeId, start, limit) {
  const url = new URL(REALTIME_URL);
  url.searchParams.set("isAggregate", "false");
  url.searchParams.set("isGame", "false");
  url.searchParams.set("start", String(start));
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("cayenneExp", `gameTypeId=${Number(gameTypeId)} and seasonId=${Number(season)}`);

  let response;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    response = await fetch(url, {
      headers: { Accept: "application/json" },
    });
    if (response.status !== 429) break;
    await new Promise((resolve) => setTimeout(resolve, 400 * 2 ** attempt));
  }
  if (!response.ok) {
    throw new Error(`NHL realtime stats failed (${response.status})`);
  }
  return response.json();
}

export async function fetchSkaterRealtime(season, gameTypeId = 2) {
  const key = `${Number(season)}:${Number(gameTypeId)}`;
  const cached = realtimeCache.get(key);
  if (cached && cached.expires > Date.now()) return cached.totals;

  const first = await fetchRealtimeBody(season, gameTypeId, 0, -1);
  let rows = Array.isArray(first.data) ? first.data : [];
  const total = num(first.total);

  if (total > rows.length && rows.length > 0) {
    const pageSize = rows.length;
    const starts = [];
    for (let start = rows.length; start < total; start += pageSize) starts.push(start);
    const pages = await Promise.all(
      starts.map((start) => fetchRealtimeBody(season, gameTypeId, start, pageSize))
    );
    for (const page of pages) {
      if (Array.isArray(page.data)) rows = rows.concat(page.data);
    }
  }

  const totals = sumSkaterRealtime(rows);
  realtimeCache.set(key, { totals, expires: Date.now() + CACHE_TTL_MS });
  return totals;
}
