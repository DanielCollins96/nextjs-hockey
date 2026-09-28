import fs from "fs/promises";
import path from "path";
import { fetchReadModel, readModelPaths } from "./read-models.js";

export const FANTASY_READ_MODEL_DIR = path.join(process.cwd(), "data", "read-models");

export function fantasyPhase(phase) {
  return phase === "playoffs" ? "playoffs" : "regular";
}

export function fantasyGameTypeId(phase) {
  return fantasyPhase(phase) === "playoffs" ? 3 : 2;
}

export function fantasySeasonList(payload) {
  const seasons = payload?.seasons || payload?.availableSeasons;
  if (!Array.isArray(seasons) || seasons.length === 0) return null;
  const parsed = seasons.map((season) => Number.parseInt(season, 10)).filter((season) => Number.isFinite(season));
  return parsed.length ? parsed : null;
}

export function parseFantasySlug(slug) {
  const parts = Array.isArray(slug) ? slug : [];
  if (parts.length > 2) return null;
  if (parts.length === 2 && parts[1] !== "playoffs") return null;

  const phase = parts[1] === "playoffs" ? "playoffs" : "regular";
  if (parts.length === 0) return { season: null, phase };

  const season = Number.parseInt(parts[0], 10);
  if (!Number.isFinite(season)) return null;
  return { season, phase };
}

async function readLocalJson(key) {
  const text = await fs.readFile(path.join(FANTASY_READ_MODEL_DIR, key), "utf8");
  return JSON.parse(text);
}

export async function fantasyStaticPaths() {
  const availableSeasons = fantasySeasonList(await readLocalJson(readModelPaths.fantasySeasons()));
  if (!availableSeasons) return [];

  const paths = [{ params: { slug: false } }];
  for (const season of availableSeasons) {
    const year = String(season);
    paths.push({ params: { slug: [year] } });
    paths.push({ params: { slug: [year, "playoffs"] } });
  }
  return paths;
}

export async function loadStaticFantasyPage(slug) {
  const parsed = parseFantasySlug(slug);
  if (!parsed) return { notFound: true };

  let availableSeasons;
  try {
    availableSeasons = fantasySeasonList(await readLocalJson(readModelPaths.fantasySeasons()));
  } catch (error) {
    if (error.code !== "ENOENT") console.error("Fantasy season index missing:", error);
    return { notFound: true };
  }
  if (!availableSeasons) return { notFound: true };

  const season = parsed.season ?? availableSeasons[0];
  if (!availableSeasons.some((value) => Number(value) === Number(season))) return { notFound: true };

  let payload;
  try {
    payload = await readLocalJson(readModelPaths.fantasyPool(season, parsed.phase));
  } catch (error) {
    if (error.code !== "ENOENT") console.error("Fantasy pool file missing:", error);
    return { notFound: true };
  }

  const pool = fantasyPoolFromReadModel(payload, season, parsed.phase);
  if (!pool) return { notFound: true };

  return {
    players: pool.players,
    season: pool.season,
    availableSeasons,
    phase: parsed.phase,
    hitsLoaded: pool.hitsLoaded,
  };
}

export function fantasyPoolFromReadModel(payload, season, phase) {
  if (!payload || !Array.isArray(payload.players)) return null;
  if (Number(payload.season) !== Number(season)) return null;
  return {
    season: Number(season),
    phase: fantasyPhase(payload.phase || phase),
    players: payload.players,
    hitsLoaded: Boolean(payload.hitsLoaded),
  };
}

async function readLocalReadModel(key) {
  try {
    const text = await fs.readFile(path.join(FANTASY_READ_MODEL_DIR, key), "utf8");
    return JSON.parse(text);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.warn(`Local fantasy read model failed for ${key}:`, error.message);
    }
    return null;
  }
}

async function readPrebuilt(key) {
  const remote = await fetchReadModel(key);
  if (remote) return { payload: remote, source: "s3-read-model" };

  const local = await readLocalReadModel(key);
  if (local) return { payload: local, source: "local-read-model" };
  return null;
}

export async function loadFantasy({ year, phase } = {}) {
  const resolvedPhase = fantasyPhase(phase);
  const hasYear = year != null && String(year).trim() !== "";
  const requested = hasYear ? Number.parseInt(year, 10) : null;
  if (hasYear && !Number.isFinite(requested)) return { notFound: true };

  const seasonsPrebuilt = await readPrebuilt(readModelPaths.fantasySeasons());
  let availableSeasons = fantasySeasonList(seasonsPrebuilt?.payload);
  if (!availableSeasons) {
    const { loadFantasySeasons } = await import("./fantasy-pool.js");
    availableSeasons = await loadFantasySeasons();
  }
  if (!availableSeasons?.length) return { notFound: true };

  const season = requested ?? availableSeasons[0];
  if (!availableSeasons.some((value) => Number(value) === Number(season))) {
    return { notFound: true };
  }

  const poolPrebuilt = await readPrebuilt(readModelPaths.fantasyPool(season, resolvedPhase));
  const pool = fantasyPoolFromReadModel(poolPrebuilt?.payload, season, resolvedPhase);
  if (pool) {
    return {
      source: poolPrebuilt.source,
      players: pool.players,
      season: pool.season,
      availableSeasons,
      phase: resolvedPhase,
      hitsLoaded: pool.hitsLoaded,
    };
  }

  const { loadFantasyPool } = await import("./fantasy-pool.js");
  const fallback = await loadFantasyPool(season, fantasyGameTypeId(resolvedPhase));
  return {
    source: "postgres",
    players: fallback.players,
    season: Number(season),
    availableSeasons,
    phase: resolvedPhase,
    hitsLoaded: fallback.hitsLoaded,
  };
}
