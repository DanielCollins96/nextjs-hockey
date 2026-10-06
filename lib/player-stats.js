import { seasonEndYear, toNumber } from "./format.js";

export const regularStatKeys = {
  games: ["stat.games", "gamesPlayed"],
  goals: ["stat.goals", "goals"],
  assists: ["stat.assists", "assists"],
  points: ["stat.points", "points"],
  pim: ["stat.pim", "penaltyMinutes"],
  plusMinus: ["stat.plusMinus", "plusMinus"],
  wins: ["stat.wins", "wins"],
  losses: ["stat.losses", "losses"],
  gaa: ["stat.goalAgainstAverage", "goalsAgainstAverage"],
  savePct: ["stat.savePercentage", "savePercentage"],
  shutouts: ["stat.shutouts", "shutouts"],
  toi: ["stat.toiPerGame", "avgToi", "stat.timeOnIcePerGame"],
};

export const playoffStatKeys = {
  games: ["playoffGamesPlayed"],
  goals: ["playoffGoals"],
  assists: ["playoffAssists"],
  points: ["playoffPoints"],
  pim: ["playoffPenaltyMinutes"],
  plusMinus: ["playoffPlusMinus"],
  wins: ["playoffWins"],
  losses: ["playoffLosses"],
  gaa: ["playoffGoalsAgainstAverage"],
  savePct: ["playoffSavePercentage"],
};

export function getFirstValue(row, keys) {
  for (const key of keys) {
    const value = row?.[key];
    if (value !== null && value !== undefined && value !== "") return value;
  }

  return null;
}

export function getPersonValue(person, keys) {
  for (const key of keys) {
    const value = person?.[key];
    if (value !== null && value !== undefined && value !== "") return value;
  }

  return null;
}

export function formatHeight(person) {
  const inches = toNumber(
    getPersonValue(person, ["heightInInches", "heightInches", "height_in_inches", "height"])
  );
  if (inches !== null && inches > 0) {
    return `${Math.floor(inches / 12)}'${inches % 12}"`;
  }

  const centimeters = toNumber(
    getPersonValue(person, ["heightInCentimeters", "heightCentimeters", "height_in_centimeters"])
  );
  return centimeters === null || centimeters <= 0 ? "-" : `${centimeters} cm`;
}

export function formatWeight(person) {
  const pounds = toNumber(
    getPersonValue(person, ["weightInPounds", "weightPounds", "weight_in_pounds", "weight"])
  );
  if (pounds !== null && pounds > 0) return `${pounds} lb`;

  const kilograms = toNumber(
    getPersonValue(person, ["weightInKilograms", "weightKilograms", "weight_in_kilograms"])
  );
  return kilograms === null || kilograms <= 0 ? "-" : `${kilograms} kg`;
}

export function isNHLDataRow(row) {
  return row?.["league.name"] === "NHL" || row?.["league.name"] === "National Hockey League";
}

export function hasDraftData(data) {
  if (!data) return false;
  const value = String(data).trim();
  if (value === "[null]" || value === "null" || value === "") return false;
  if (Array.isArray(data) && data.filter(Boolean).length === 0) return false;
  return true;
}

export function formatDraft(person) {
  if (!hasDraftData(person?.draft_seasons)) return "Undrafted";

  const year = Array.isArray(person.draft_seasons)
    ? person.draft_seasons.filter(Boolean).join(", ")
    : person.draft_seasons;
  const team = person?.displayAbbrev ? `, ${person.displayAbbrev}` : "";
  const pick = person?.ordinalPick ? ` (${person.ordinalPick} overall)` : "";
  return `${year}${team}${pick}`;
}

export function formatStatValue(value, digits = 0) {
  if (value === null || value === undefined || value === "") return "-";
  const number = toNumber(value);
  if (number === null) return "-";
  return digits > 0 ? number.toFixed(digits) : String(number);
}

export function parseToiSeconds(value) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0 ? value : null;
  }

  const text = String(value).trim();
  const match = text.match(/^(\d+):([0-5]?\d)$/);
  if (!match) {
    const number = toNumber(text);
    return number !== null && number > 0 ? number : null;
  }

  return Number(match[1]) * 60 + Number(match[2]);
}

export function formatToi(value) {
  const seconds = parseToiSeconds(value);
  if (seconds === null) return "-";

  const rounded = Math.round(seconds);
  const minutes = Math.floor(rounded / 60);
  const remainder = rounded % 60;
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}

export function toiSecondsBySeason(landing) {
  const grouped = new Map();

  (Array.isArray(landing?.seasonTotals) ? landing.seasonTotals : []).forEach((row) => {
    if (row?.leagueAbbrev !== "NHL" || Number(row?.gameTypeId) !== 2) return;
    const season = String(row.season || "");
    const seconds = parseToiSeconds(row.avgToi);
    const games = toNumber(row.gamesPlayed) || 0;
    if (!season || seconds === null) return;

    const current = grouped.get(season) || [];
    current.push({ seconds, games });
    grouped.set(season, current);
  });

  return new Map(
    [...grouped.entries()].map(([season, rows]) => {
      const totalGames = rows.reduce((sum, row) => sum + row.games, 0);
      if (!totalGames) return [season, rows[0].seconds];
      const weighted = rows.reduce((sum, row) => sum + row.seconds * row.games, 0) / totalGames;
      return [season, weighted];
    })
  );
}

export function mergeToiIntoPlayerStats(stats, landing) {
  const bySeason = toiSecondsBySeason(landing);
  if (bySeason.size === 0) return Array.isArray(stats) ? stats : [];

  return (Array.isArray(stats) ? stats : []).map((row) => {
    if (!isNHLDataRow(row)) return row;
    const seconds = bySeason.get(String(row?.season));
    if (seconds == null) return row;
    return { ...row, "stat.toiPerGame": seconds };
  });
}

function landingTeamName(row, landing) {
  const nested = row?.teamName;
  if (nested && typeof nested === "object" && nested.default) return nested.default;
  if (typeof nested === "string" && nested) return nested;
  return landing?.fullTeamName?.default || landing?.fullTeamName || null;
}

function landingNhlSeasonBuckets(landing) {
  const grouped = new Map();

  (Array.isArray(landing?.seasonTotals) ? landing.seasonTotals : []).forEach((row) => {
    if (row?.leagueAbbrev !== "NHL") return;
    const season = String(row.season || "");
    const gameTypeId = Number(row.gameTypeId);
    if (!season || (gameTypeId !== 2 && gameTypeId !== 3)) return;

    const current = grouped.get(season) || { regular: [], playoff: [] };
    if (gameTypeId === 3) current.playoff.push(row);
    else current.regular.push(row);
    grouped.set(season, current);
  });

  return grouped;
}

function sumLandingStat(rows, key) {
  return (rows || []).reduce((total, row) => total + (toNumber(row?.[key]) || 0), 0);
}

function landingSeasonStatRow(season, buckets, landing) {
  const regular = buckets.regular || [];
  const playoff = buckets.playoff || [];
  const source = regular[0] || playoff[0];
  if (!source) return null;

  const teamName = landingTeamName(source, landing);
  const featuredSeason = String(landing?.featuredStats?.season || "");
  const teamId =
    featuredSeason && featuredSeason === String(season) && landing?.currentTeamId != null
      ? landing.currentTeamId
      : null;

  return {
    season: Number(season) || season,
    "league.name": "NHL",
    "team.name": teamName,
    "team.id": teamId,
    "stat.games": sumLandingStat(regular, "gamesPlayed"),
    "stat.goals": sumLandingStat(regular, "goals"),
    "stat.assists": sumLandingStat(regular, "assists"),
    "stat.points": sumLandingStat(regular, "points"),
    "stat.pim": sumLandingStat(regular, "pim"),
    "stat.plusMinus": sumLandingStat(regular, "plusMinus"),
    "stat.wins": sumLandingStat(regular, "wins"),
    "stat.losses": sumLandingStat(regular, "losses"),
    "stat.shutouts": sumLandingStat(regular, "shutouts"),
    "stat.goalAgainstAverage": weightedAverage(
      regular.map((row) => ({
        "stat.goalAgainstAverage": row.goalsAgainstAvg,
        "stat.games": row.gamesPlayed,
      })),
      regularStatKeys.gaa,
      regularStatKeys.games
    ),
    "stat.savePercentage": weightedAverage(
      regular.map((row) => ({
        "stat.savePercentage": row.savePctg,
        "stat.games": row.gamesPlayed,
      })),
      regularStatKeys.savePct,
      regularStatKeys.games
    ),
    playoffGamesPlayed: sumLandingStat(playoff, "gamesPlayed"),
    playoffGoals: sumLandingStat(playoff, "goals"),
    playoffAssists: sumLandingStat(playoff, "assists"),
    playoffPoints: sumLandingStat(playoff, "points"),
    playoffPenaltyMinutes: sumLandingStat(playoff, "pim"),
    playoffPlusMinus: sumLandingStat(playoff, "plusMinus"),
    playoffWins: sumLandingStat(playoff, "wins"),
    playoffLosses: sumLandingStat(playoff, "losses"),
  };
}

export function mergeLandingSeasonsIntoPlayerStats(stats, landing) {
  const existing = Array.isArray(stats) ? stats : [];
  const presentSeasons = new Set(
    existing.filter(isNHLDataRow).map((row) => String(row?.season || "")).filter(Boolean)
  );

  const extras = [...landingNhlSeasonBuckets(landing).entries()]
    .filter(([season]) => !presentSeasons.has(season))
    .map(([season, buckets]) => landingSeasonStatRow(season, buckets, landing))
    .filter(Boolean)
    .sort((left, right) => (Number(right.season) || 0) - (Number(left.season) || 0));

  return extras.length ? [...extras, ...existing] : existing;
}

export function mergeLandingPlayerStats(stats, landing) {
  return mergeToiIntoPlayerStats(mergeLandingSeasonsIntoPlayerStats(stats, landing), landing);
}

export function isGoaliePosition(position) {
  return String(position || "").toUpperCase() === "G";
}

export function nhlStatRows(stats) {
  return (Array.isArray(stats) ? stats : []).filter(isNHLDataRow);
}

export function sumStat(rows, keys) {
  return (rows || []).reduce((total, row) => total + (toNumber(getFirstValue(row, keys)) || 0), 0);
}

export function weightedAverage(rows, valueKeys, weightKeys) {
  const safeRows = rows || [];
  const totalWeight = sumStat(safeRows, weightKeys);
  if (!totalWeight) return null;

  const weightedTotal = safeRows.reduce((total, row) => {
    const weight = toNumber(getFirstValue(row, weightKeys)) || 0;
    const value = toNumber(getFirstValue(row, valueKeys)) || 0;
    return total + weight * value;
  }, 0);

  return weightedTotal / totalWeight;
}

export function currentTeamFromStats(stats) {
  const nhlRows = nhlStatRows(stats).filter((row) => row?.["team.name"]);
  if (nhlRows.length === 0) return null;

  return [...nhlRows].sort((left, right) => {
    const seasonA = Number(left?.season) || 0;
    const seasonB = Number(right?.season) || 0;
    if (seasonB !== seasonA) return seasonB - seasonA;

    const gamesA = toNumber(getFirstValue(left, regularStatKeys.games)) || 0;
    const gamesB = toNumber(getFirstValue(right, regularStatKeys.games)) || 0;
    return gamesB - gamesA;
  })[0];
}

function aggregateNhlSeason(rows) {
  const safeRows = rows || [];
  if (safeRows.length === 0) return null;

  const teamNames = [...new Set(safeRows.map((row) => row?.["team.name"]).filter(Boolean))];
  const teamIds = [...new Set(safeRows.map((row) => row?.["team.id"]).filter((id) => id != null))];

  return {
    season: safeRows[0]?.season,
    "league.name": "NHL",
    "team.name": teamNames.length === 1 ? teamNames[0] : teamNames.length > 1 ? `${teamNames.length}TM` : "-",
    "team.id": teamIds.length === 1 ? teamIds[0] : null,
    "stat.games": sumStat(safeRows, regularStatKeys.games),
    "stat.goals": sumStat(safeRows, regularStatKeys.goals),
    "stat.assists": sumStat(safeRows, regularStatKeys.assists),
    "stat.points": sumStat(safeRows, regularStatKeys.points),
    "stat.pim": sumStat(safeRows, regularStatKeys.pim),
    "stat.plusMinus": sumStat(safeRows, regularStatKeys.plusMinus),
    "stat.wins": sumStat(safeRows, regularStatKeys.wins),
    "stat.losses": sumStat(safeRows, regularStatKeys.losses),
    "stat.shutouts": sumStat(safeRows, regularStatKeys.shutouts),
    "stat.goalAgainstAverage": weightedAverage(safeRows, regularStatKeys.gaa, regularStatKeys.games),
    "stat.savePercentage": weightedAverage(safeRows, regularStatKeys.savePct, regularStatKeys.games),
    "stat.toiPerGame": weightedAverage(
      safeRows.filter((row) => getFirstValue(row, regularStatKeys.toi) != null),
      regularStatKeys.toi,
      regularStatKeys.games
    ),
    playoffGamesPlayed: sumStat(safeRows, playoffStatKeys.games),
    playoffGoals: sumStat(safeRows, playoffStatKeys.goals),
    playoffAssists: sumStat(safeRows, playoffStatKeys.assists),
    playoffPoints: sumStat(safeRows, playoffStatKeys.points),
    playoffPenaltyMinutes: sumStat(safeRows, playoffStatKeys.pim),
    playoffPlusMinus: sumStat(safeRows, playoffStatKeys.plusMinus),
    playoffWins: sumStat(safeRows, playoffStatKeys.wins),
    playoffLosses: sumStat(safeRows, playoffStatKeys.losses),
    playoffGoalsAgainstAverage: weightedAverage(safeRows, playoffStatKeys.gaa, playoffStatKeys.games),
    playoffSavePercentage: weightedAverage(safeRows, playoffStatKeys.savePct, playoffStatKeys.games),
    age: safeRows.map((row) => toNumber(row.age)).find((value) => value !== null) ?? null,
    birthdate: getFirstValue(safeRows[0], ["birthdate", "birthDate"]),
  };
}

export function parseBirthdate(value) {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const text = String(value).trim();
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return Number.isNaN(date.getTime()) ? null : date;
}

export function seasonAge(row, birthdate) {
  const explicitAge = toNumber(row?.age);
  if (explicitAge !== null && explicitAge > 0 && explicitAge < 60) {
    return Math.round(explicitAge);
  }

  const endYear = seasonEndYear(row?.season);
  const birth = parseBirthdate(birthdate || row?.birthdate || row?.birthDate);
  if (!endYear || !birth) return null;
  return endYear - birth.getUTCFullYear();
}

export function nhlSeasonsByYear(stats) {
  const grouped = new Map();

  nhlStatRows(stats).forEach((row) => {
    const season = String(row?.season || "");
    if (!season) return;
    const current = grouped.get(season) || [];
    current.push(row);
    grouped.set(season, current);
  });

  return [...grouped.entries()]
    .map(([season, rows]) => ({ season, row: aggregateNhlSeason(rows) }))
    .filter((entry) => entry.row)
    .sort((left, right) => Number(right.season) - Number(left.season));
}

export function careerTotals(stats, isGoalie) {
  const rows = nhlStatRows(stats);

  if (isGoalie) {
    return {
      games: sumStat(rows, regularStatKeys.games),
      wins: sumStat(rows, regularStatKeys.wins),
      losses: sumStat(rows, regularStatKeys.losses),
      shutouts: sumStat(rows, regularStatKeys.shutouts),
      gaa: weightedAverage(rows, regularStatKeys.gaa, regularStatKeys.games),
      savePct: weightedAverage(rows, regularStatKeys.savePct, regularStatKeys.games),
      playoffGames: sumStat(rows, playoffStatKeys.games),
      playoffWins: sumStat(rows, playoffStatKeys.wins),
    };
  }

  const toiRows = rows.filter((row) => getFirstValue(row, regularStatKeys.toi) != null);

  return {
    games: sumStat(rows, regularStatKeys.games),
    goals: sumStat(rows, regularStatKeys.goals),
    assists: sumStat(rows, regularStatKeys.assists),
    points: sumStat(rows, regularStatKeys.points),
    pim: sumStat(rows, regularStatKeys.pim),
    plusMinus: sumStat(rows, regularStatKeys.plusMinus),
    toi: weightedAverage(toiRows, regularStatKeys.toi, regularStatKeys.games),
    playoffGames: sumStat(rows, playoffStatKeys.games),
    playoffGoals: sumStat(rows, playoffStatKeys.goals),
    playoffAssists: sumStat(rows, playoffStatKeys.assists),
    playoffPoints: sumStat(rows, playoffStatKeys.points),
  };
}
