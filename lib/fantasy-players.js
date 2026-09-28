import { seasonEndYear } from "./format.js";
import { teamAbbrevFromName } from "./routes.js";

function num(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

export function ageAtSeason(birthDate, season) {
  const endYear = seasonEndYear(season);
  if (!birthDate || !endYear) return null;

  const birth = birthDate instanceof Date ? birthDate : new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return null;

  const asOf = new Date(Date.UTC(endYear, 1, 1));
  let age = asOf.getUTCFullYear() - birth.getUTCFullYear();
  const month = asOf.getUTCMonth() - birth.getUTCMonth();
  if (month < 0 || (month === 0 && asOf.getUTCDate() < birth.getUTCDate())) age -= 1;
  return age >= 0 && age < 80 ? age : null;
}

function isGoalieRow(row) {
  const hasGoalie = row.gl_gp != null;
  const hasSkater = row.sk_gp != null;
  if (row.position === "G") return hasGoalie || !hasSkater;
  return !row.position && hasGoalie && !hasSkater;
}

export function shapeFantasyPlayer(row, season) {
  const goalie = isGoalieRow(row);
  const games = num(goalie ? row.gl_gp : row.sk_gp);
  const goals = num(goalie ? row.gl_g : row.sk_g);
  const assists = num(goalie ? row.gl_a : row.sk_a);
  const shots = goalie ? 0 : num(row.sk_sog);
  const shotsAgainst = goalie ? num(row.gl_sa) : 0;
  const goalsAgainst = goalie ? num(row.gl_ga) : 0;
  const saves = goalie ? Math.max(shotsAgainst - goalsAgainst, 0) : 0;
  const minutes = goalie ? num(row.gl_toi) : 0;
  const teamName = row.team_name || "";
  const age = ageAtSeason(row.birthDate, season);
  const position = row.position || (goalie ? "G" : "");

  return {
    playerId: row.playerId,
    name: [row.firstName, row.lastName].filter(Boolean).join(" ") || `Player ${row.playerId}`,
    position,
    positionGroup: goalie || position === "G" ? "G" : position === "D" ? "D" : "F",
    teamName,
    teamAbbrev: row.teamAbbrev || teamAbbrevFromName(teamName, season) || "",
    teamId: row.teamId == null ? null : String(row.teamId),
    GP: games,
    G: goals,
    A: assists,
    P: goalie ? goals + assists : num(row.sk_p),
    PPG: goalie ? 0 : num(row.sk_ppg),
    PPP: goalie ? 0 : num(row.sk_ppp),
    SHG: goalie ? 0 : num(row.sk_shg),
    SHP: goalie ? 0 : num(row.sk_shp),
    GWG: goalie ? 0 : num(row.sk_gwg),
    OTG: goalie ? 0 : num(row.sk_otg),
    SOG: shots,
    HIT: 0,
    BLK: 0,
    PIM: num(goalie ? row.gl_pim : row.sk_pim),
    PM: goalie ? 0 : num(row.sk_pm),
    W: goalie ? num(row.gl_w) : 0,
    L: goalie ? num(row.gl_l) : 0,
    OTL: goalie ? num(row.gl_otl) : 0,
    SO: goalie ? num(row.gl_so) : 0,
    GA: goalsAgainst,
    SA: shotsAgainst,
    SV: saves,
    GS: goalie ? num(row.gl_gs) : 0,
    TOI: minutes,
    SVPCT: shotsAgainst > 0 ? saves / shotsAgainst : 0,
    GAA: minutes > 0 ? (goalsAgainst * 60) / minutes : 0,
    SHPCT: shots > 0 ? goals / shots : 0,
    FOPCT: !goalie && games > 0 ? num(row.sk_fo) / games : 0,
    AGE: age,
  };
}

export function shapeFantasyPlayers(rows, season) {
  return (rows || []).map((row) => shapeFantasyPlayer(row, season));
}
