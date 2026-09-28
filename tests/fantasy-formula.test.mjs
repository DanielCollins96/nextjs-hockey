import test from "node:test";
import assert from "node:assert/strict";
import {
  compileFormula,
  projectScore,
  DEFAULT_FANTASY_FORMULA,
  LEAGUE_FANTASY_FORMULA,
} from "../lib/fantasy-formula.js";
import { ageAtSeason, shapeFantasyPlayer } from "../lib/fantasy-players.js";
import { applySkaterRealtime, sumSkaterRealtime } from "../lib/fantasy-realtime.js";

const skater = {
  GP: 82,
  G: 48,
  A: 90,
  P: 138,
  PPP: 54,
  SOG: 306,
  W: 0,
  SO: 0,
};

function score(formula, row) {
  const compiled = compileFormula(formula);
  assert.equal(compiled.ok, true, compiled.error);
  return compiled.evaluate(row);
}

test("scores goals, assists, power-play points, and shots", () => {
  assert.equal(score("3*G + 2*A + PPP + 0.4*SOG", skater), 500.4);
});

test("league formula scores the sheet weights for skaters and goalies", () => {
  assert.equal(DEFAULT_FANTASY_FORMULA, LEAGUE_FANTASY_FORMULA);
  assert.equal(
    score(LEAGUE_FANTASY_FORMULA, {
      G: 10, A: 20, PPP: 8, SHP: 1, SOG: 100, HIT: 50, BLK: 40,
    }),
    79.5
  );
  assert.equal(
    score(LEAGUE_FANTASY_FORMULA, {
      W: 10, GA: 20, SV: 500, SO: 2, OTL: 3,
    }),
    109
  );
});

test("respects precedence, parentheses, percent, and power", () => {
  assert.equal(score("2+3*4", {}), 14);
  assert.equal(score("(2+3)*4", {}), 20);
  assert.equal(score("50%*10", {}), 5);
  assert.equal(score("(3*4)%", {}), 0.12);
  assert.equal(score("2^3", {}), 8);
  assert.equal(score("3*-G", { G: 2 }), -6);
});

test("names are case-insensitive and aliases work", () => {
  assert.equal(score("3*goals + 2*assists", { G: 2, A: 1 }), 8);
  assert.equal(score("shots + shutouts + plus", { SOG: 4, SO: 1, PM: 3 }), 8);
});

test("IF and AND skip the branch that would divide by zero", () => {
  assert.equal(score("IF(GP>0, G/GP, 0)", { GP: 0, G: 10 }), 0);
  assert.equal(score("IF(GP>0, G/GP*82, 0)", { GP: 41, G: 10 }), 20);
  assert.equal(score("GP>0 AND G/GP>1", { GP: 0, G: 5 }), 0);
  assert.equal(score("GP>0 AND G/GP>1", { GP: 2, G: 4 }), 1);
});

test("division by zero blanks that player", () => {
  assert.equal(score("G/GP", { G: 4, GP: 0 }), null);
});

test("functions and comparisons", () => {
  assert.equal(score("MIN(3,1,2)", {}), 1);
  assert.equal(score("MAX(G, A)", { G: 2, A: 5 }), 5);
  assert.equal(score("ABS(-4)", {}), 4);
  assert.equal(score("ROUND(1.26, 1)", {}), 1.3);
  assert.equal(score("IF(GP>=10, 1, 0)", { GP: 10 }), 1);
  assert.equal(score("IF(GP<>10, 1, 0)", { GP: 9 }), 1);
});

test("scores hits and blocked shots, and rejects unknown names", () => {
  assert.equal(score("0.1*HITS + 0.5*BLOCKS", { HIT: 10, BLK: 4 }), 3);

  const unknown = compileFormula("3*FOO");
  assert.equal(unknown.ok, false);
  assert.match(unknown.error, /Unknown name FOO/);

  assert.equal(compileFormula("   ").ok, false);
  assert.equal(compileFormula("MIN").ok, false);
});

test("lists the stats a formula uses, in catalog order", () => {
  const compiled = compileFormula("SO + W + G");
  assert.deepEqual(compiled.stats, ["G", "W", "SO"]);
});

test("sums hits and blocked shots onto skaters", () => {
  const totals = sumSkaterRealtime([
    { playerId: 1, hits: 4, blockedShots: 2 },
    { playerId: "1", hits: 3, blockedShots: 1 },
    { playerId: 2, hits: 9, blockedShots: 8 },
  ]);
  const [skaterRow, goalieRow] = applySkaterRealtime(
    [
      { playerId: "1", position: "C", positionGroup: "F", HIT: 0, BLK: 0 },
      { playerId: "2", position: "G", positionGroup: "G", HIT: 0, BLK: 0 },
    ],
    totals
  );
  assert.equal(skaterRow.HIT, 7);
  assert.equal(skaterRow.BLK, 3);
  assert.equal(goalieRow.HIT, 0);
  assert.equal(goalieRow.BLK, 0);
});

test("projects a season total to a full schedule", () => {
  assert.equal(projectScore(41, 41, 82), 82);
  assert.equal(projectScore(41, 41, 0), 41);
  assert.equal(projectScore(41, 0, 82), null);
  assert.equal(projectScore(null, 41, 82), null);
});

test("ages a player as of February 1", () => {
  assert.equal(ageAtSeason("2000-06-15", 20252026), 25);
  assert.equal(ageAtSeason("2000-01-15", 20252026), 26);
});

test("shapes skater and goalie counting stats", () => {
  const skaterRow = shapeFantasyPlayer(
    {
      playerId: "1",
      firstName: "Connor",
      lastName: "McDavid",
      position: "C",
      birthDate: "1997-01-13",
      team_name: "Edmonton Oilers",
      teamAbbrev: "EDM",
      teamId: "22",
      sk_gp: 82,
      sk_g: 48,
      sk_a: 90,
      sk_p: 138,
      sk_ppp: 54,
      sk_sog: 306,
      sk_fo: 40.6,
      sk_pm: 17,
    },
    20252026
  );
  assert.equal(skaterRow.positionGroup, "F");
  assert.equal(skaterRow.P, 138);
  assert.equal(skaterRow.W, 0);
  assert.equal(skaterRow.SHPCT, 48 / 306);
  assert.equal(skaterRow.AGE, 29);

  const goalieRow = shapeFantasyPlayer(
    {
      playerId: "2",
      firstName: "Test",
      lastName: "Goalie",
      position: "G",
      team_name: "Winnipeg Jets",
      gl_gp: 58,
      gl_w: 39,
      gl_so: 2,
      gl_ga: 132,
      gl_sa: 1483,
      gl_toi: 3430.75,
      gl_g: 0,
      gl_a: 1,
    },
    20252026
  );
  assert.equal(goalieRow.positionGroup, "G");
  assert.equal(goalieRow.SV, 1351);
  assert.equal(goalieRow.G, 0);
  assert.equal(goalieRow.A, 1);
  assert.ok(Math.abs(goalieRow.GAA - 2.308533) < 0.001);
  assert.equal(goalieRow.PPP, 0);
});
