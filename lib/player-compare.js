import { toNumber } from "./format.js";
import { getFirstValue, nhlSeasonsByYear, regularStatKeys, seasonAge } from "./player-stats.js";
import {
  comparePlayersUrl,
  extractEntityId,
  MAX_COMPARE_PLAYERS,
  playerUrl,
} from "./routes.js";

export { MAX_COMPARE_PLAYERS };

export function playerHeadshotUrl(id) {
  return `https://assets.nhle.com/mugs/nhl/latest/${id}.png`;
}

export function shortPlayerName(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  return parts.length <= 1 ? name || "" : parts[parts.length - 1];
}

export function uniquePlayerIds(ids) {
  const seen = new Set();
  return (ids || []).filter((id) => {
    if (id == null || id === "") return false;
    const key = String(id);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, MAX_COMPARE_PLAYERS);
}

export function normalizeCompareSlugs(slugs) {
  const values = Array.isArray(slugs) ? slugs.filter(Boolean) : [];
  return values.slice(0, MAX_COMPARE_PLAYERS).map((slug) => ({
    slug: String(slug),
    id: extractEntityId(slug),
  }));
}

export function compareQueryIds(query = {}) {
  const fromList = String(query.players || "")
    .split(/[,\s]+/)
    .map((value) => (value ? extractEntityId(value) : null));
  const named = ["a", "b", "c", "d", "p1", "p2", "p3", "p4", "left", "right"].map((key) => (
    query[key] ? extractEntityId(query[key]) : null
  ));

  return uniquePlayerIds([...fromList, ...named]);
}

export function canonicalComparePath(...people) {
  const list = people.length === 1 && Array.isArray(people[0]) ? people[0] : people;
  const players = (list || []).filter(Boolean).slice(0, MAX_COMPARE_PLAYERS);

  if (players.length === 0) return "/players/compare";
  return comparePlayersUrl(players);
}

export function samePlayerRedirect(person) {
  return playerUrl(person?.player_name, person?.playerId);
}

export function compareWinners(values, { lowerIsBetter = false } = {}) {
  const numbers = (values || []).map((value) => {
    if (value === null || value === undefined || value === "") return null;
    return toNumber(value);
  });
  const present = numbers.filter((number) => number !== null);
  if (present.length < 2) return numbers.map(() => false);

  const best = lowerIsBetter ? Math.min(...present) : Math.max(...present);
  const flags = numbers.map((number) => number !== null && number === best);
  if (flags.filter(Boolean).length === present.length) {
    return numbers.map(() => false);
  }
  return flags;
}

export function compareWinner(leftValue, rightValue, options) {
  if (leftValue === null || leftValue === undefined || leftValue === "") return null;
  if (rightValue === null || rightValue === undefined || rightValue === "") return null;

  const flags = compareWinners([leftValue, rightValue], options);
  if (!flags[0] && !flags[1]) return "tie";
  return flags[0] ? "left" : "right";
}

const SKATER_CAREER_ROWS = [
  { key: "games", label: "NHL GP" },
  { key: "goals", label: "Goals" },
  { key: "assists", label: "Assists" },
  { key: "points", label: "Points" },
  { key: "plusMinus", label: "+/-" },
  { key: "pim", label: "PIM" },
  { key: "toi", label: "TOI/G", format: "toi" },
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
  { key: "toi", label: "TOI", keys: regularStatKeys.toi, format: "toi" },
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

function normalizeStatsGroups(statsGroups) {
  return statsGroups.length === 1 && Array.isArray(statsGroups[0]) && statsGroups[0].every((item) => item == null || Array.isArray(item))
    ? statsGroups[0]
    : statsGroups;
}

export function mergeNhlSeasons(...statsGroups) {
  const groups = normalizeStatsGroups(statsGroups);

  const maps = groups.map((stats) => (
    new Map(nhlSeasonsByYear(stats).map((entry) => [String(entry.season), entry.row]))
  ));
  const seasons = new Set(maps.flatMap((map) => [...map.keys()]));

  return [...seasons]
    .sort((left, right) => Number(right) - Number(left))
    .map((season) => {
      const rows = maps.map((map) => map.get(season) || null);
      return {
        season,
        rows,
        left: rows[0] || null,
        right: rows[1] || null,
      };
    });
}

export function mergeNhlSeasonsByAge(statsByPlayer, birthdates = []) {
  const groups = Array.isArray(statsByPlayer) ? statsByPlayer : [];
  const maps = groups.map((stats, index) => {
    const byAge = new Map();
    nhlSeasonsByYear(stats).forEach(({ row }) => {
      const age = seasonAge(row, birthdates[index]);
      if (age == null) return;
      const current = byAge.get(age);
      const currentGames = toNumber(current?.["stat.games"]) || 0;
      const nextGames = toNumber(row?.["stat.games"]) || 0;
      if (!current || nextGames > currentGames) {
        byAge.set(age, { ...row, age });
      }
    });
    return byAge;
  });

  const ages = new Set(maps.flatMap((map) => [...map.keys()]));
  return [...ages]
    .sort((left, right) => right - left)
    .map((age) => {
      const rows = maps.map((map) => map.get(age) || null);
      return {
        age,
        label: `Age ${age}`,
        rows,
        left: rows[0] || null,
        right: rows[1] || null,
      };
    });
}

export function playersMissingAge(players, rowsByAge) {
  return (players || []).filter((side, index) => {
    const hasBirthdate = Boolean(side?.person?.birthdate || side?.person?.birthDate);
    const hasAgeRow = (rowsByAge || []).some((entry) => entry.rows?.[index]);
    return !hasBirthdate && !hasAgeRow;
  });
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

export function majorityPosition(players) {
  const counts = new Map();
  (players || []).forEach((player) => {
    const position = String(player?.person?.position || player?.position || "").toUpperCase();
    if (!position) return;
    counts.set(position, (counts.get(position) || 0) + 1);
  });

  return [...counts.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] || "";
}
