import { loadFantasy } from "../../lib/fantasy-data";
import { PAGE_CACHE } from "../../lib/http-cache";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error_message: "Method not allowed" });
  }

  try {
    const result = await loadFantasy({
      year: req.query.year,
      phase: req.query.phase,
    });

    if (result.notFound) {
      return res.status(404).json({ error_message: "Fantasy season not found" });
    }

    const latest = result.availableSeasons[0];
    res.setHeader("X-Data-Source", result.source);
    res.setHeader(
      "Cache-Control",
      Number(result.season) === Number(latest) ? PAGE_CACHE.live : PAGE_CACHE.stable
    );

    return res.status(200).json({
      season: result.season,
      phase: result.phase,
      availableSeasons: result.availableSeasons,
      hitsLoaded: result.hitsLoaded,
      players: result.players,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error_message: "Internal Server Error" });
  }
}
