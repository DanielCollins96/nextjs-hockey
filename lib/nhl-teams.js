// Current NHL franchises only. Relocated/defunct codes (ARI, ATL, AFM, PHX,
// QUE, HFD, WIN, MNS, CLR, …) are not active.
export const ACTIVE_NHL_TEAMS = [
  ["ANA", "Anaheim Ducks"],
  ["BOS", "Boston Bruins"],
  ["BUF", "Buffalo Sabres"],
  ["CAR", "Carolina Hurricanes"],
  ["CBJ", "Columbus Blue Jackets"],
  ["CGY", "Calgary Flames"],
  ["CHI", "Chicago Blackhawks"],
  ["COL", "Colorado Avalanche"],
  ["DAL", "Dallas Stars"],
  ["DET", "Detroit Red Wings"],
  ["EDM", "Edmonton Oilers"],
  ["FLA", "Florida Panthers"],
  ["LAK", "Los Angeles Kings"],
  ["MIN", "Minnesota Wild"],
  ["MTL", "Montreal Canadiens"],
  ["NJD", "New Jersey Devils"],
  ["NSH", "Nashville Predators"],
  ["NYI", "New York Islanders"],
  ["NYR", "New York Rangers"],
  ["OTT", "Ottawa Senators"],
  ["PHI", "Philadelphia Flyers"],
  ["PIT", "Pittsburgh Penguins"],
  ["SEA", "Seattle Kraken"],
  ["SJS", "San Jose Sharks"],
  ["STL", "St. Louis Blues"],
  ["TBL", "Tampa Bay Lightning"],
  ["TOR", "Toronto Maple Leafs"],
  ["UTA", "Utah Mammoth"],
  ["VAN", "Vancouver Canucks"],
  ["VGK", "Vegas Golden Knights"],
  ["WPG", "Winnipeg Jets"],
  ["WSH", "Washington Capitals"],
];

export const ACTIVE_NHL_ABBREVS = new Set(
  ACTIVE_NHL_TEAMS.map(([abbreviation]) => abbreviation)
);

export function teamAbbreviation(team) {
  if (typeof team === "string") return team.trim().toUpperCase();
  return String(team?.abbreviation || team?.abbrev || team?.triCode || "")
    .trim()
    .toUpperCase();
}

export function isActiveNhlTeam(team) {
  return ACTIVE_NHL_ABBREVS.has(teamAbbreviation(team));
}

function compareTeamName(left, right) {
  return String(left?.name || left?.abbreviation || "").localeCompare(
    String(right?.name || right?.abbreviation || ""),
    "en",
    { sensitivity: "base" }
  );
}

export function partitionNhlTeams(teams) {
  const active = [];
  const former = [];

  for (const team of teams || []) {
    if (isActiveNhlTeam(team)) active.push(team);
    else former.push(team);
  }

  return {
    active: active.sort(compareTeamName),
    former: former.sort(compareTeamName),
  };
}

export function decorateDraftTeams(teams) {
  const { active, former } = partitionNhlTeams(teams);
  return [
    ...active.map((team) => ({ ...team, active: true })),
    ...former.map((team) => ({ ...team, active: false })),
  ];
}
