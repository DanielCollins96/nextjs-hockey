export const GAME_THREADS_BOARD_ID = "game-threads";
export const FORUM_FEED = "all";

const CURRENT_TEAMS = [
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

const GENERAL_BOARDS = [
  {
    id: "nhl-talk",
    title: "National Hockey League Talk",
    description: "Players, teams, games, and the Stanley Cup playoffs.",
  },
  {
    id: "trade-rumors",
    title: "Trade Rumors and Free Agent Talk",
    description: "Rumors, signings, trades, and roster moves.",
  },
  {
    id: "draft",
    title: "NHL Draft and Prospects",
    description: "Prospects from every league and the NHL draft.",
  },
  {
    id: "international",
    title: "International Hockey",
    description: "World Juniors, the Olympics, and best-on-best tournaments.",
  },
  {
    id: "business",
    title: "Business of Hockey",
    description: "The salary cap, contracts, media, and league business.",
  },
];

function boardRecord({ id, title, description, section, sortOrder, teamAbbrev = null }) {
  return {
    id,
    slug: id,
    title,
    description,
    section,
    teamAbbrev,
    sortOrder,
    threadCount: 0,
    postCount: 0,
  };
}

export const FORUM_BOARDS = [
  ...GENERAL_BOARDS.map((board, index) => boardRecord({
    ...board,
    section: "general",
    sortOrder: index + 1,
  })),
  ...CURRENT_TEAMS.map(([abbrev, name], index) => boardRecord({
    id: abbrev.toLowerCase(),
    title: name,
    description: `Roster talk, games, and news for the ${name}.`,
    section: "team",
    sortOrder: 100 + index,
    teamAbbrev: abbrev,
  })),
  boardRecord({
    id: GAME_THREADS_BOARD_ID,
    title: "Game Threads",
    description: "One thread for each game.",
    section: "games",
    sortOrder: 1000,
  }),
];

export const FORUM_SECTIONS = [
  { id: "general", title: "General Hockey Discussion" },
  { id: "team", title: "Team Boards" },
  { id: "games", title: "Game Threads" },
];

export function boardById(id) {
  return FORUM_BOARDS.find((board) => board.id === String(id || "").toLowerCase()) || null;
}

export function teamBoardId(abbreviation) {
  const id = String(abbreviation || "").trim().toLowerCase();
  const board = boardById(id);
  return board?.section === "team" ? board.id : null;
}

export function gameThreadId(gameId) {
  return `game-${gameId}`;
}

export function gamesForTeam(games, abbreviation) {
  const code = String(abbreviation || "").trim().toUpperCase();
  if (!code) return [];
  return (games || []).filter((game) => (
    game?.awayTeam_abbrev === code || game?.homeTeam_abbrev === code
  ));
}

export function gameThreadTitle(game) {
  const away = game?.awayTeam_abbrev || "Away";
  const home = game?.homeTeam_abbrev || "Home";
  const date = game?.gameDate || String(game?.startTimeUTC || "").slice(0, 10);
  return date ? `${away} @ ${home} — ${date}` : `${away} @ ${home}`;
}
