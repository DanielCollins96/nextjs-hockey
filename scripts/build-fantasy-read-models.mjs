import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { FANTASY_READ_MODEL_DIR, fantasyGameTypeId, fantasyPhase } from "../lib/fantasy-data.js";
import { loadFantasyPool, loadFantasySeasons } from "../lib/fantasy-pool.js";
import { applySkaterRealtime, fetchSkaterRealtime } from "../lib/fantasy-realtime.js";
import { readModelPaths } from "../lib/read-models.js";

const PHASES = ["regular", "playoffs"];
const bucket = (process.env.READ_MODEL_S3_BUCKET || "").trim();
const prefix = (process.env.READ_MODEL_S3_PREFIX || "").trim().replace(/^\/+|\/+$/g, "");
const s3 = bucket
  ? new S3Client({ region: process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "us-west-2" })
  : null;

async function upload(key, body) {
  if (!s3) return;
  const objectKey = prefix ? `${prefix}/${key}` : key;
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      Body: body,
      ContentType: "application/json",
      CacheControl: "public, max-age=300, stale-while-revalidate=86400",
    })
  );
  console.log(`uploaded s3://${bucket}/${objectKey}`);
}

async function writeJson(key, payload) {
  const body = JSON.stringify(payload);
  const file = path.join(FANTASY_READ_MODEL_DIR, key);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, body);
  await upload(key, body);
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

try {
  const seasons = await loadFantasySeasons();
  await writeJson(readModelPaths.fantasySeasons(), { seasons });
  console.log(`seasons ${seasons.length}`);

  for (const season of seasons) {
    for (const phase of PHASES) {
      const key = readModelPaths.fantasyPool(season, fantasyPhase(phase));
      const existing = await readExisting(key);
      if (existing?.hitsLoaded && Array.isArray(existing.players)) {
        await upload(key, JSON.stringify(existing));
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
          await upload(key, JSON.stringify(existing));
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
} finally {
  try {
    const { closeDbPool } = await import("../lib/db-pool.js");
    await closeDbPool();
  } catch (error) {
    console.error(error.message);
  }
}

if (!bucket) console.log("Wrote local files only. Set READ_MODEL_S3_BUCKET to upload them.");
