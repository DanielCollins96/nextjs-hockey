import test from "node:test";
import assert from "node:assert/strict";
import { hotScore, rankHotThreads } from "../lib/forum-hot.js";

const HOUR = 60 * 60 * 1000;

test("a newer unvoted thread ranks above an older unvoted thread", () => {
  const older = new Date("2026-09-26T12:00:00.000Z").toISOString();
  const newer = new Date("2026-09-26T18:00:00.000Z").toISOString();
  const ranked = rankHotThreads([
    { id: "old", score: 0, postedAt: older },
    { id: "new", score: 0, postedAt: newer },
  ]);
  assert.deepEqual(ranked.map((thread) => thread.id), ["new", "old"]);
});

test("upvotes can keep an older thread ahead of a brand-new one", () => {
  const now = new Date("2026-09-26T18:00:00.000Z");
  const older = new Date(now.getTime() - (12 * HOUR)).toISOString();
  const ranked = rankHotThreads([
    { id: "fresh", score: 0, postedAt: now.toISOString() },
    { id: "hot", score: 10, postedAt: older },
  ]);
  assert.equal(ranked[0].id, "hot");
});

test("ten upvotes are worth about twelve and a half hours", () => {
  const base = Date.parse("2026-09-26T00:00:00.000Z");
  const votedAt = new Date(base).toISOString();
  const newerAt = new Date(base + (12.5 * HOUR)).toISOString();
  const voted = hotScore(10, votedAt);
  const fresh = hotScore(1, newerAt);
  assert.ok(Math.abs(voted - fresh) < 0.02);
});

test("zero votes and one vote share the same vote term", () => {
  const postedAt = "2026-09-26T12:00:00.000Z";
  assert.equal(hotScore(0, postedAt), hotScore(1, postedAt));
});
