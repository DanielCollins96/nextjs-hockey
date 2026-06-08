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

function normalizeTeamName(name) {
  const value = String(name || "").trim();
  return NHL_TEAM_NAMES_BY_ABBREV[value.toUpperCase()] || value;
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

export function playerUrl(name, id) {
  return `/players/${encodeURIComponent(entitySlug(name, id))}`;
}

export function teamUrl(name, id) {
  return `/teams/${encodeURIComponent(entitySlug(normalizeTeamName(name), id))}`;
}
