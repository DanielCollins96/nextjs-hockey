import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { FANTASY_READ_MODEL_DIR, fantasyGameTypeId, fantasyPhase } from "../lib/fantasy-data.js";
import { loadFantasyPool, loadFantasySeasons } from "../lib/fantasy-pool.js";
import { applySkaterRealtime, fetchSkaterRealtime } from "../lib/fantasy-realtime.js";
import { readModelPaths } from "../lib/read-models.js";
import pool from "../lib/db.js";

const PHASES = ["regular", "playoffs"];

async function writeJson(key, payload) {
  const file = path.join(FANTASY_READ_MODEL_DIR, key);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(payload));
  return file;
}

async function readExisting(key) {
  try {
    return JSON.parse(await readFile(path.join(FANTASY_READ_MODEL_DIR, key), "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

const seasons = await loadFantasySeasons();
await writeJson(readModelPaths.fantasySeasons(), { seasons });
console.log(`seasons ${seasons.length}`);

for (const season of seasons) {
  for (const phase of PHASES) {
    const key = readModelPaths.fantasyPool(season, fantasyPhase(phase));
    const existing = await readExisting(key);
    if (existing?.hitsLoaded && Array.isArray(existing.players)) {
      console.log(`${key} kept players=${existing.players.length}`);
      continue;
    }

    if (Array.isArray(existing?.players)) {
      try {
        const totals = await fetchSkaterRealtime(season, fantasyGameTypeId(phase));
        const players = applySkaterRealtime(existing.players, totals);
        await writeJson(key, { ...existing, hitsLoaded: true, players });
        console.log(`${key} hits refreshed players=${players.length}`);
      } catch (error) {
        console.error(`${key} hits still missing: ${error.message}`);
      }
      continue;
    }

    const poolResult = await loadFantasyPool(season, fantasyGameTypeId(phase));
    await writeJson(key, {
      season: Number(season),
      phase: fantasyPhase(phase),
      gameTypeId: fantasyGameTypeId(phase),
      hitsLoaded: poolResult.hitsLoaded,
      players: poolResult.players,
    });
    console.log(`${key} players=${poolResult.players.length} hits=${poolResult.hitsLoaded}`);
  }
}

await pool.end();
