import { extractEntityId } from "../../../../lib/routes";
import { findSimilarPlayers } from "../../../../lib/player-similarity";
import { parseSimilarLimit } from "../../../../lib/player-embeddings";
import { PAGE_CACHE } from "../../../../lib/http-cache";

function parseExcludeIds(value) {
  return String(value || "")
    .split(/[,\s]+/)
    .map((id) => extractEntityId(id))
    .filter(Boolean);
}

export default async function handler(req, res) {
  if (req.method && req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error_message: "Method Not Allowed" });
  }

  try {
    const id = extractEntityId(req.query.id);
    if (!id) {
      return res.status(400).json({ error_message: "Missing player id" });
    }

    const result = await findSimilarPlayers(id, {
      limit: parseSimilarLimit(req.query.limit),
      excludeIds: parseExcludeIds(req.query.exclude),
    });

    if (!result.source || result.source === "none") {
      return res.status(500).json({ error_message: "Internal Server Error" });
    }

    res.setHeader("X-Data-Source", result.source);
    res.setHeader("Cache-Control", PAGE_CACHE.hourly);
    return res.status(200).json({
      source: result.source,
      version: result.version,
      playerId: result.playerId,
      group: result.group,
      players: result.players,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error_message: "Internal Server Error" });
  }
}
