import { fetchReadModel, readModelPaths, readModelsEnabled } from "./read-models";

function serializeGame(game) {
  return {
    ...game,
    gameDate:
      game.gameDate instanceof Date
        ? game.gameDate.toISOString().split("T")[0]
        : game.gameDate,
    startTimeUTC:
      game.startTimeUTC instanceof Date
        ? game.startTimeUTC.toISOString()
        : game.startTimeUTC,
  };
}

function formatDate(date) {
  const parsed = new Date(`${date}T00:00:00Z`);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString().split("T")[0];
}

function buildDateRange(startDate, endDate) {
  const dates = [];
  const current = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);

  if (Number.isNaN(current.getTime()) || Number.isNaN(end.getTime()) || current > end) {
    return null;
  }

  while (current <= end) {
    dates.push(current.toISOString().split("T")[0]);
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return dates;
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

    const { getGameDateRange } = await import("./queries");
    return getGameDateRange();
  } catch (error) {
    console.warn("Failed to fetch game date bounds:", error.message);
    return null;
  }
}

export async function loadGames({ date, startDate, endDate } = {}) {
  let games;
  let source;

  if (startDate && endDate) {
    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);
    const dates =
      formattedStartDate && formattedEndDate
        ? buildDateRange(formattedStartDate, formattedEndDate)
        : null;

    if (!dates) {
      return { error: "Invalid date range" };
    }

    if (readModelsEnabled()) {
      const readModels = await Promise.all(dates.map(fetchGameDateReadModel));
      games = readModels.flatMap((readModel) => readModel?.games || []);
      source = "s3-read-model";
    } else {
      const { getGamesByDateRange } = await import("./queries");
      games = await getGamesByDateRange(formattedStartDate, formattedEndDate);
      source = "postgres";
    }
  } else if (date) {
    const formattedDate = formatDate(date);

    if (!formattedDate) {
      return { error: "Invalid date" };
    }

    if (readModelsEnabled()) {
      const readModel = await fetchGameDateReadModel(formattedDate);
      games = readModel?.games || [];
      source = "s3-read-model";
    } else {
      const { getGamesByDate } = await import("./queries");
      games = await getGamesByDate(formattedDate);
      source = "postgres";
    }
  } else {
    return { error: "Date parameter is required" };
  }

  const [serializedGames, dateBounds] = await Promise.all([
    Promise.resolve(games.map(serializeGame)),
    getGameDateBounds(),
  ]);

  return {
    source,
    games: serializedGames,
    dateBounds,
  };
}

export async function loadGame(id) {
  const readModel = await fetchReadModel(readModelPaths.game(id));
  let game;
  let goals = [];
  let penalties = [];
  let threeStars = [];
  let source;

  if (readModel) {
    game = readModel.game;
    goals = readModel.goals || [];
    penalties = readModel.penalties || [];
    threeStars = readModel.threeStars || [];
    source = "s3-read-model";
  } else {
    const { getGameById } = await import("./queries");
    game = await getGameById(id);
    source = "postgres";
  }

  if (!game) {
    return { notFound: true };
  }

  return {
    source,
    game: serializeGame(game),
    goals,
    penalties,
    threeStars,
  };
}
