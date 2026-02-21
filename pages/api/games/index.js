import { getGamesByDate, getGamesByDateRange } from "../../../lib/queries";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { date, startDate, endDate } = req.query;

  try {
    let games;

    if (startDate && endDate) {
      games = await getGamesByDateRange(startDate, endDate);
    } else if (date) {
      games = await getGamesByDate(date);
    } else {
      return res.status(400).json({ error: "Date parameter is required" });
    }

    const serializedGames = games.map(game => ({
      ...game,
      gameDate: game.gameDate instanceof Date ? game.gameDate.toISOString().split('T')[0] : game.gameDate,
      startTimeUTC: game.startTimeUTC instanceof Date ? game.startTimeUTC.toISOString() : game.startTimeUTC,
    }));

    res.setHeader(
      'Cache-Control',
      'public, s-maxage=300, stale-while-revalidate=3600'
    );

    res.status(200).json({ games: serializedGames });
  } catch (error) {
    console.error("Error fetching games:", error);
    res.status(500).json({ error: "Failed to fetch games" });
  }
}
