const NHL_TEAM_NAMES_BY_ABBREV = {
  ANA: "Anaheim Ducks",
  ARI: "Arizona Coyotes",
  ATL: "Atlanta Thrashers",
  BOS: "Boston Bruins",
  BUF: "Buffalo Sabres",
  CAR: "Carolina Hurricanes",
  CBJ: "Columbus Blue Jackets",
  CGY: "Calgary Flames",
  CHI: "Chicago Blackhawks",
  CLR: "Colorado Rockies",
  COL: "Colorado Avalanche",
  DAL: "Dallas Stars",
  DET: "Detroit Red Wings",
  EDM: "Edmonton Oilers",
  FLA: "Florida Panthers",
  HFD: "Hartford Whalers",
  LAK: "Los Angeles Kings",
  MIN: "Minnesota Wild",
  MNS: "Minnesota North Stars",
  MTL: "Montreal Canadiens",
  NJD: "New Jersey Devils",
  NSH: "Nashville Predators",
  NYI: "New York Islanders",
  NYR: "New York Rangers",
  OTT: "Ottawa Senators",
  PHI: "Philadelphia Flyers",
  PHX: "Phoenix Coyotes",
  PIT: "Pittsburgh Penguins",
  QUE: "Quebec Nordiques",
  SEA: "Seattle Kraken",
  SJS: "San Jose Sharks",
  STL: "St. Louis Blues",
  TBL: "Tampa Bay Lightning",
  TOR: "Toronto Maple Leafs",
  UTA: "Utah Mammoth",
  VAN: "Vancouver Canucks",
  VGK: "Vegas Golden Knights",
  WIN: "Winnipeg Jets",
  WPG: "Winnipeg Jets",
  WSH: "Washington Capitals",
};

function foldTeamName(name) {
  return String(name || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function normalizeTeamName(name) {
  const value = String(name || "").trim();
  const foldedUpper = foldTeamName(value).toUpperCase();
  return NHL_TEAM_NAMES_BY_ABBREV[value.toUpperCase()] || NHL_TEAM_NAMES_BY_ABBREV[foldedUpper] || value;
}

const TEAM_ABBREV_BY_NAME = {
  "anaheim ducks": "ANA",
  "anaheim mighty ducks": "ANA",
  "mighty ducks of anaheim": "ANA",
  "arizona coyotes": "ARI",
  "atlanta flames": "AFM",
  "atlanta thrashers": "ATL",
  "boston bruins": "BOS",
  "brooklyn americans": "BRK",
  "buffalo sabres": "BUF",
  "calgary flames": "CGY",
  "california golden seals": "CGS",
  "carolina hurricanes": "CAR",
  "chicago black hawks": "CHI",
  "chicago blackhawks": "CHI",
  "cleveland barons": "CLE",
  "colorado avalanche": "COL",
  "colorado rockies": "CLR",
  "columbus blue jackets": "CBJ",
  "dallas stars": "DAL",
  "detroit cougars": "DCG",
  "detroit falcons": "DFL",
  "detroit red wings": "DET",
  "edmonton oilers": "EDM",
  "florida panthers": "FLA",
  "hamilton tigers": "HAM",
  "hartford whalers": "HFD",
  "kansas city scouts": "KCS",
  "los angeles kings": "LAK",
  "minnesota north stars": "MNS",
  "minnesota wild": "MIN",
  "montreal canadiens": "MTL",
  "montreal maroons": "MMR",
  "montreal wanderers": "MWN",
  "nashville predators": "NSH",
  "new jersey devils": "NJD",
  "new york americans": "NYA",
  "new york islanders": "NYI",
  "new york rangers": "NYR",
  "oakland seals": "OAK",
  "ottawa senators": "OTT",
  "ottawa senators 1917": "SEN",
  "philadelphia flyers": "PHI",
  "philadelphia quakers": "QUA",
  "phoenix coyotes": "PHX",
  "pittsburgh penguins": "PIT",
  "pittsburgh pirates": "PIR",
  "quebec bulldogs": "QBD",
  "quebec nordiques": "QUE",
  "san jose sharks": "SJS",
  "seattle kraken": "SEA",
  "st louis blues": "STL",
  "st louis eagles": "SLE",
  "tampa bay lightning": "TBL",
  "toronto arenas": "TAN",
  "toronto maple leafs": "TOR",
  "toronto st patricks": "TSP",
  "utah hockey club": "UTA",
  "utah mammoth": "UTA",
  "vancouver canucks": "VAN",
  "vegas golden knights": "VGK",
  "washington capitals": "WSH",
  "winnipeg jets": "WPG",
  "winnipeg jets 1979": "WIN",
};

function seasonStartYear(season) {
  const year = Number(String(season || "").slice(0, 4));
  return Number.isFinite(year) && year > 1900 ? year : null;
}

export function teamAbbrevFromName(name, season) {
  const value = String(name || "").trim();
  if (!value) return "";

  const folded = foldTeamName(value);
  const foldedUpper = folded.toUpperCase();
  if (NHL_TEAM_NAMES_BY_ABBREV[value.toUpperCase()]) return value.toUpperCase();
  if (folded.length === 3 && NHL_TEAM_NAMES_BY_ABBREV[foldedUpper]) return foldedUpper;

  if (folded === "winnipeg jets") {
    const year = seasonStartYear(season);
    if (year && year < 2011) return "WIN";
  }

  return TEAM_ABBREV_BY_NAME[folded] || "";
}

export function slugify(value) {
  return String(value || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function entitySlug(name, id) {
  const safeId = id === null || id === undefined ? "" : String(id).trim();
  const nameSlug = slugify(name);

  if (!safeId) return nameSlug;
  return nameSlug ? `${nameSlug}-${safeId}` : safeId;
}

export function extractEntityId(value) {
  const segment = Array.isArray(value) ? value[0] : value;
  const decodedSegment = decodeURIComponent(String(segment || ""));
  const match = decodedSegment.match(/(\d+)$/);

  return match ? match[1] : decodedSegment;
}

export const MAX_COMPARE_PLAYERS = 4;

export function playerUrl(name, id) {
  return `/players/${encodeURIComponent(entitySlug(name, id))}`;
}

export function compareStartUrl(name, id) {
  return `/players/compare/${encodeURIComponent(entitySlug(name, id))}`;
}

function comparePathFromPlayers(players) {
  const slugs = (Array.isArray(players) ? players : [])
    .filter((player) => player && (player.id != null || player.playerId != null))
    .slice(0, MAX_COMPARE_PLAYERS)
    .map((player) =>
      encodeURIComponent(entitySlug(player.name || player.player_name, player.id || player.playerId))
    );

  if (slugs.length === 0) return "/players/compare";
  return `/players/compare/${slugs.join("/")}`;
}

export function compareHref(players, align = "season") {
  const path = comparePlayersUrl(players);
  return align === "age" ? `${path}?align=age` : path;
}

export function comparePlayersUrl(...args) {
  if (Array.isArray(args[0])) {
    return comparePathFromPlayers(args[0]);
  }

  const players = [];
  for (let index = 0; index < args.length; index += 2) {
    players.push({ name: args[index], id: args[index + 1] });
  }
  return comparePathFromPlayers(players);
}

export function teamUrl(name, id) {
  return `/teams/${encodeURIComponent(entitySlug(normalizeTeamName(name), id))}`;
}

export function draftTeamUrl(name, id) {
  return `/drafts/teams/${encodeURIComponent(entitySlug(normalizeTeamName(name), id))}`;
}
