import { loadGames } from "../../../lib/game-data";
import { PAGE_CACHE, setPageCache } from "../../../lib/http-cache";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { date, startDate, endDate } = req.query;

  try {
    const result = await loadGames({ date, startDate, endDate });

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    res.setHeader("X-Data-Source", result.source);
    setPageCache(res, PAGE_CACHE.live);

    res.status(200).json({ games: result.games, dateBounds: result.dateBounds });
  } catch (error) {
    console.error("Error fetching games:", error);
    res.status(500).json({ error: "Failed to fetch games" });
  }
}
