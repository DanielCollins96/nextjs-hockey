import { toNumber } from "./format.js";

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
  const number = toNumber(value);
  if (number === null) return "-";
  return digits > 0 ? number.toFixed(digits) : String(number);
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
  };
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

  return {
    games: sumStat(rows, regularStatKeys.games),
    goals: sumStat(rows, regularStatKeys.goals),
    assists: sumStat(rows, regularStatKeys.assists),
    points: sumStat(rows, regularStatKeys.points),
    pim: sumStat(rows, regularStatKeys.pim),
    plusMinus: sumStat(rows, regularStatKeys.plusMinus),
    playoffGames: sumStat(rows, playoffStatKeys.games),
    playoffGoals: sumStat(rows, playoffStatKeys.goals),
    playoffAssists: sumStat(rows, playoffStatKeys.assists),
    playoffPoints: sumStat(rows, playoffStatKeys.points),
  };
}
