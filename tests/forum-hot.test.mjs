import test from "node:test";
import assert from "node:assert/strict";
import { popularNeighbors, rankHotThreads, rankPopularThreads, recentPostAt } from "../lib/forum-hot.js";

test("a thread with a newer post ranks above an older one", () => {
  const older = "2026-09-26T12:00:00.000Z";
  const newer = "2026-09-26T18:00:00.000Z";
  const ranked = rankHotThreads([
    { id: "old", score: 40, lastActivityAt: older },
    { id: "new", score: 0, lastActivityAt: newer },
  ]);
  assert.deepEqual(ranked.map((thread) => thread.id), ["new", "old"]);
});

test("a reply moves an older thread ahead of a newer thread with no replies", () => {
  const created = "2026-09-20T12:00:00.000Z";
  const opened = "2026-09-26T18:00:00.000Z";
  const replied = "2026-09-26T19:00:00.000Z";
  const ranked = rankHotThreads([
    { id: "fresh", score: 12, postedAt: opened, lastActivityAt: opened },
    { id: "revived", score: 0, postedAt: created, lastActivityAt: replied },
  ]);
  assert.deepEqual(ranked.map((thread) => thread.id), ["revived", "fresh"]);
});

test("falls back to the original post time when there is no later activity", () => {
  const older = "2026-09-26T12:00:00.000Z";
  const newer = "2026-09-26T18:00:00.000Z";
  const ranked = rankHotThreads([
    { id: "old", postedAt: older },
    { id: "new", createdAt: newer },
  ]);
  assert.deepEqual(ranked.map((thread) => thread.id), ["new", "old"]);
  assert.equal(recentPostAt({ postedAt: older }), Date.parse(older));
});

test("more upvotes rank above a newer thread with fewer", () => {
  const ranked = rankPopularThreads([
    { id: "fresh", score: 0, postedAt: "2026-09-26T18:00:00.000Z" },
    { id: "voted", score: 1, postedAt: "2026-09-20T12:00:00.000Z" },
    { id: "hot", score: 10, postedAt: "2026-09-01T12:00:00.000Z" },
  ]);
  assert.deepEqual(ranked.map((thread) => thread.id), ["hot", "voted"]);
});

test("threads with no upvotes are left out of popular", () => {
  const ranked = rankPopularThreads([
    { id: "plain", score: 0, postedAt: "2026-09-26T18:00:00.000Z" },
    { id: "voted", score: 2, postedAt: "2026-09-20T12:00:00.000Z" },
  ]);
  assert.deepEqual(ranked.map((thread) => thread.id), ["voted"]);
});

test("equal upvote counts fall back to the newer thread", () => {
  const ranked = rankPopularThreads([
    { id: "older", score: 2, postedAt: "2026-09-20T12:00:00.000Z" },
    { id: "newer", score: 2, postedAt: "2026-09-26T18:00:00.000Z" },
  ]);
  assert.deepEqual(ranked.map((thread) => thread.id), ["newer", "older"]);
});

test("popular next and previous follow the upvote ranking", () => {
  const ranked = rankPopularThreads([
    { id: "low", score: 1, postedAt: "2026-09-26T18:00:00.000Z" },
    { id: "high", score: 20, postedAt: "2026-09-26T12:00:00.000Z" },
    { id: "mid", score: 5, postedAt: "2026-09-26T16:00:00.000Z" },
  ]);
  assert.deepEqual(ranked.map((thread) => thread.id), ["high", "mid", "low"]);
  const neighbors = popularNeighbors(ranked, "mid");
  assert.equal(neighbors.previous.id, "high");
  assert.equal(neighbors.next.id, "low");
  assert.equal(popularNeighbors(ranked, "missing").index, -1);
});

test("deleted threads are left out of the strip", () => {
  const ranked = rankHotThreads([
    { id: "gone", lastActivityAt: "2026-09-26T20:00:00.000Z", _deleted: true },
    { id: "live", lastActivityAt: "2026-09-26T12:00:00.000Z" },
  ], 8);
  assert.deepEqual(ranked.map((thread) => thread.id), ["live"]);
});
