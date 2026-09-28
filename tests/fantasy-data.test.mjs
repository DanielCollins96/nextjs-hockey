import assert from "node:assert/strict";
import test from "node:test";
import {
  fantasyPoolFromReadModel,
  fantasySeasonList,
  fantasyStaticPathEntries,
  parseFantasySlug,
} from "../lib/fantasy-data.js";
import { fantasyPageHref, fantasyPublicHrefs } from "../lib/fantasy-paths.js";

test("fantasy season index accepts a seasons array", () => {
  assert.deepEqual(fantasySeasonList({ seasons: ["20252026", 20242025] }), [20252026, 20242025]);
  assert.equal(fantasySeasonList({ seasons: [] }), null);
  assert.equal(fantasySeasonList(null), null);
});

test("fantasy page paths cover the latest season and playoffs", () => {
  assert.equal(fantasyPageHref(20252026, "regular", 20252026), "/fantasy");
  assert.equal(fantasyPageHref(20242025, "regular", 20252026), "/fantasy/20242025");
  assert.equal(fantasyPageHref(20242025, "playoffs", 20252026), "/fantasy/20242025/playoffs");
  assert.deepEqual(fantasyPublicHrefs([20252026, 20242025]), [
    "/fantasy",
    "/fantasy/20252026/playoffs",
    "/fantasy/20242025",
    "/fantasy/20242025/playoffs",
  ]);
  assert.deepEqual(fantasyStaticPathEntries([20252026, 20242025]), [
    { params: { slug: [] } },
    { params: { slug: ["20252026"] } },
    { params: { slug: ["20252026", "playoffs"] } },
    { params: { slug: ["20242025"] } },
    { params: { slug: ["20242025", "playoffs"] } },
  ]);
  assert.deepEqual(parseFantasySlug([]), { season: null, phase: "regular" });
  assert.deepEqual(parseFantasySlug(undefined), { season: null, phase: "regular" });
  assert.deepEqual(parseFantasySlug(["20242025", "playoffs"]), { season: 20242025, phase: "playoffs" });
  assert.equal(parseFantasySlug(["20242025", "preseason"]), null);
});

test("fantasy pool files must match the requested season", () => {
  const pool = fantasyPoolFromReadModel(
    { season: 20252026, phase: "playoffs", hitsLoaded: true, players: [{ playerId: 1 }] },
    20252026,
    "playoffs"
  );
  assert.equal(pool.players.length, 1);
  assert.equal(pool.hitsLoaded, true);
  assert.equal(pool.phase, "playoffs");
  assert.equal(
    fantasyPoolFromReadModel(
      { season: 20252026, phase: "regular", players: [{ playerId: 1 }] },
      20252026,
      "playoffs"
    ),
    null
  );
  assert.equal(
    fantasyPoolFromReadModel({ season: 20242025, players: [] }, 20252026, "regular"),
    null
  );
  assert.equal(fantasyPoolFromReadModel({ season: 20252026 }, 20252026, "regular"), null);
});
