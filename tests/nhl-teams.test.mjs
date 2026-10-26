import assert from "node:assert/strict";
import test from "node:test";
import {
  ACTIVE_NHL_TEAMS,
  decorateDraftTeams,
  isActiveNhlTeam,
  partitionNhlTeams,
} from "../lib/nhl-teams.js";

test("active NHL list is the current 32 franchises", () => {
  assert.equal(ACTIVE_NHL_TEAMS.length, 32);
  assert.ok(isActiveNhlTeam("UTA"));
  assert.ok(isActiveNhlTeam({ abbreviation: "wpg" }));
  assert.ok(isActiveNhlTeam({ abbreviation: "NJD" }));
});

test("relocated and defunct codes are former teams", () => {
  for (const abbrev of [
    "AFM",
    "ATL",
    "ARI",
    "PHX",
    "QUE",
    "HFD",
    "WIN",
    "MNS",
    "CLR",
    "KCS",
    "CLE",
    "CGS",
    "OAK",
  ]) {
    assert.equal(isActiveNhlTeam(abbrev), false, abbrev);
  }
});

test("partition and decorate put current teams first", () => {
  const teams = [
    { id: 47, abbreviation: "AFM", name: "Atlanta Flames" },
    { id: 1, abbreviation: "NJD", name: "New Jersey Devils" },
    { id: 53, abbreviation: "ARI", name: "Arizona Coyotes" },
    { id: 59, abbreviation: "UTA", name: "Utah Mammoth" },
    { id: 11, abbreviation: "ATL", name: "Atlanta Thrashers" },
  ];

  const { active, former } = partitionNhlTeams(teams);
  assert.deepEqual(
    active.map((team) => team.abbreviation),
    ["NJD", "UTA"]
  );
  assert.deepEqual(
    former.map((team) => team.abbreviation),
    ["ARI", "AFM", "ATL"]
  );

  const decorated = decorateDraftTeams(teams);
  assert.deepEqual(
    decorated.map((team) => team.abbreviation),
    ["NJD", "UTA", "ARI", "AFM", "ATL"]
  );
  assert.equal(decorated[0].active, true);
  assert.equal(decorated.at(-1).active, false);
});
