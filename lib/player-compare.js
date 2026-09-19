import { toNumber } from "./format.js";
import { getFirstValue, nhlSeasonsByYear, regularStatKeys } from "./player-stats.js";
import { comparePlayersUrl, compareStartUrl, extractEntityId, playerUrl } from "./routes.js";

export function playerHeadshotUrl(id) {
  return `https://assets.nhle.com/mugs/nhl/latest/${id}.png`;
}

export function normalizeCompareSlugs(slugs) {
  const values = Array.isArray(slugs) ? slugs.filter(Boolean) : [];
  return values.slice(0, 2).map((slug) => ({
    slug: String(slug),
    id: extractEntityId(slug),
  }));
}

export function compareQueryIds(query = {}) {
  const left = query.left || query.a || null;
  const right = query.right || query.b || null;
  return {
    left: left ? extractEntityId(left) : null,
    right: right ? extractEntityId(right) : null,
  };
}

export function canonicalComparePath(leftPerson, rightPerson) {
  if (leftPerson && rightPerson) {
    return comparePlayersUrl(
      leftPerson.player_name,
      leftPerson.playerId,
      rightPerson.player_name,
      rightPerson.playerId
    );
  }

  const single = leftPerson || rightPerson;
  if (single) {
    return compareStartUrl(single.player_name, single.playerId);
  }

  return "/players/compare";
}

export function samePlayerRedirect(person) {
  return playerUrl(person?.player_name, person?.playerId);
}

export function compareWinner(leftValue, rightValue, { lowerIsBetter = false } = {}) {
  if (leftValue === null || leftValue === undefined || leftValue === "") return null;
  if (rightValue === null || rightValue === undefined || rightValue === "") return null;

  const left = toNumber(leftValue);
  const right = toNumber(rightValue);
  if (left === null || right === null) return null;
  if (left === right) return "tie";
  if (lowerIsBetter) return left < right ? "left" : "right";
  return left > right ? "left" : "right";
}

const SKATER_CAREER_ROWS = [
  { key: "games", label: "NHL GP" },
  { key: "goals", label: "Goals" },
  { key: "assists", label: "Assists" },
  { key: "points", label: "Points" },
  { key: "plusMinus", label: "+/-" },
  { key: "pim", label: "PIM" },
  { key: "playoffGames", label: "Playoff GP" },
  { key: "playoffGoals", label: "Playoff G" },
  { key: "playoffAssists", label: "Playoff A" },
  { key: "playoffPoints", label: "Playoff P" },
];

const GOALIE_CAREER_ROWS = [
  { key: "games", label: "NHL GP" },
  { key: "wins", label: "Wins" },
  { key: "losses", label: "Losses", lowerIsBetter: true },
  { key: "gaa", label: "GAA", digits: 2, lowerIsBetter: true },
  { key: "savePct", label: "SV%", digits: 3 },
  { key: "shutouts", label: "Shutouts" },
  { key: "playoffGames", label: "Playoff GP" },
  { key: "playoffWins", label: "Playoff W" },
];

export function careerCompareRows(isGoalie) {
  return isGoalie ? GOALIE_CAREER_ROWS : SKATER_CAREER_ROWS;
}

const SKATER_SEASON_COLUMNS = [
  { key: "games", label: "GP", keys: regularStatKeys.games },
  { key: "goals", label: "G", keys: regularStatKeys.goals },
  { key: "assists", label: "A", keys: regularStatKeys.assists },
  { key: "points", label: "P", keys: regularStatKeys.points },
  { key: "plusMinus", label: "+/-", keys: regularStatKeys.plusMinus },
  { key: "pim", label: "PIM", keys: regularStatKeys.pim },
];

const GOALIE_SEASON_COLUMNS = [
  { key: "games", label: "GP", keys: regularStatKeys.games },
  { key: "wins", label: "W", keys: regularStatKeys.wins },
  { key: "losses", label: "L", keys: regularStatKeys.losses, lowerIsBetter: true },
  { key: "gaa", label: "GAA", keys: regularStatKeys.gaa, digits: 2, lowerIsBetter: true },
  { key: "savePct", label: "SV%", keys: regularStatKeys.savePct, digits: 3 },
  { key: "shutouts", label: "SO", keys: regularStatKeys.shutouts },
];

export function seasonCompareColumns(isGoalie) {
  return isGoalie ? GOALIE_SEASON_COLUMNS : SKATER_SEASON_COLUMNS;
}

export function mergeNhlSeasons(leftStats, rightStats) {
  const leftBySeason = new Map(nhlSeasonsByYear(leftStats).map((entry) => [String(entry.season), entry.row]));
  const rightBySeason = new Map(nhlSeasonsByYear(rightStats).map((entry) => [String(entry.season), entry.row]));
  const seasons = new Set([...leftBySeason.keys(), ...rightBySeason.keys()]);

  return [...seasons]
    .sort((left, right) => Number(right) - Number(left))
    .map((season) => ({
      season,
      left: leftBySeason.get(season) || null,
      right: rightBySeason.get(season) || null,
    }));
}

export function seasonCellValue(row, column) {
  if (!row) return null;
  return getFirstValue(row, column.keys);
}

export function awardCounts(awards) {
  const counts = new Map();
  (Array.isArray(awards) ? awards : []).forEach((award) => {
    const name = award?.trophy_default || award?.trophy || award?.name;
    if (!name) return;
    counts.set(name, (counts.get(name) || 0) + 1);
  });

  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name));
}

export function sortSearchPlayers(players, { excludeIds = [], preferPosition = "" } = {}) {
  const excluded = new Set((excludeIds || []).map((id) => String(id)));
  const preferred = String(preferPosition || "").toUpperCase();

  return (Array.isArray(players) ? players : [])
    .filter((player) => player?.id != null && !excluded.has(String(player.id)))
    .sort((left, right) => {
      if (preferred) {
        const leftMatch = String(left.position || "").toUpperCase() === preferred ? 0 : 1;
        const rightMatch = String(right.position || "").toUpperCase() === preferred ? 0 : 1;
        if (leftMatch !== rightMatch) return leftMatch - rightMatch;
      }

      return (
        (Number(right.games) || 0) - (Number(left.games) || 0) ||
        (Number(right.points) || 0) - (Number(left.points) || 0)
      );
    });
}
