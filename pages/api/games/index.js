import { fetchReadModel, readModelPaths, readModelsEnabled } from "../../../lib/read-models";

function serializeGame(game) {
  return {
    ...game,
    gameDate: game.gameDate instanceof Date ? game.gameDate.toISOString().split('T')[0] : game.gameDate,
    startTimeUTC: game.startTimeUTC instanceof Date ? game.startTimeUTC.toISOString() : game.startTimeUTC,
  }
}

function formatDate(date) {
  const parsed = new Date(`${date}T00:00:00Z`)

  if (Number.isNaN(parsed.getTime())) {
    return null
  }

  return parsed.toISOString().split('T')[0]
}

function buildDateRange(startDate, endDate) {
  const dates = []
  const current = new Date(`${startDate}T00:00:00Z`)
  const end = new Date(`${endDate}T00:00:00Z`)

  if (Number.isNaN(current.getTime()) || Number.isNaN(end.getTime()) || current > end) {
    return null
  }

  while (current <= end) {
    dates.push(current.toISOString().split('T')[0])
    current.setUTCDate(current.getUTCDate() + 1)
  }

  return dates
}

function fetchGameDateReadModel(date) {
  return fetchReadModel(readModelPaths.gameDate(date), {
    missStatuses: [403, 404],
  });
}

async function getGameDateBounds() {
  try {
    const readModel = await fetchReadModel(readModelPaths.gameDateRange(), {
      missStatuses: [403, 404],
    });

    if (readModel?.minDate && readModel?.maxDate) {
      return {
        minDate: readModel.minDate,
        maxDate: readModel.maxDate,
      };
    }

    if (readModelsEnabled()) {
      return null;
    }

    const { getGameDateRange } = await import("../../../lib/queries");
    return getGameDateRange();
  } catch (error) {
    console.warn("Failed to fetch game date bounds:", error.message);
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { date, startDate, endDate } = req.query;

  try {
    let games;

    if (startDate && endDate) {
      const formattedStartDate = formatDate(startDate);
      const formattedEndDate = formatDate(endDate);
      const dates = formattedStartDate && formattedEndDate
        ? buildDateRange(formattedStartDate, formattedEndDate)
        : null;

      if (!dates) {
        return res.status(400).json({ error: "Invalid date range" });
      }

      if (readModelsEnabled()) {
        const readModels = await Promise.all(
          dates.map(fetchGameDateReadModel)
        );

        games = readModels.flatMap((readModel) => readModel?.games || []);
        res.setHeader('X-Data-Source', 's3-read-model');
      } else {
        const { getGamesByDateRange } = await import("../../../lib/queries");
        games = await getGamesByDateRange(formattedStartDate, formattedEndDate);
        res.setHeader('X-Data-Source', 'postgres');
      }
    } else if (date) {
      const formattedDate = formatDate(date);

      if (!formattedDate) {
        return res.status(400).json({ error: "Invalid date" });
      }

      const readModel = await fetchGameDateReadModel(formattedDate);

      if (readModel) {
        games = readModel.games || [];
        res.setHeader('X-Data-Source', 's3-read-model');
      } else {
        const { getGamesByDate } = await import("../../../lib/queries");
        games = await getGamesByDate(date);
        res.setHeader('X-Data-Source', 'postgres');
      }
    } else {
      return res.status(400).json({ error: "Date parameter is required" });
    }

    const [serializedGames, dateBounds] = await Promise.all([
      Promise.resolve(games.map(serializeGame)),
      getGameDateBounds(),
    ]);

    res.setHeader(
      'Cache-Control',
      'public, s-maxage=300, stale-while-revalidate=3600'
    );

    res.status(200).json({ games: serializedGames, dateBounds });
  } catch (error) {
    console.error("Error fetching games:", error);
    res.status(500).json({ error: "Failed to fetch games" });
  }
}
