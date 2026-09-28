import assert from "node:assert/strict";
import test from "node:test";
import { voteKey, voteTransition } from "../lib/forum-votes.js";

test("each user can hold one vote per target", () => {
  assert.equal(voteKey("fan@example.com", "thread", "t1"), "fan%40example.com::thread::t1");
  assert.notEqual(voteKey("fan@example.com", "thread", "t1"), voteKey("fan@example.com", "reply", "t1"));
});

test("score delta comes from the unique vote transition", () => {
  assert.deepEqual(voteTransition(undefined), { nextValue: 1, delta: 1 });
  assert.deepEqual(voteTransition(0), { nextValue: 1, delta: 1 });
  assert.deepEqual(voteTransition(1), { nextValue: 0, delta: -1 });
  const first = voteTransition(null);
  const second = voteTransition(first.nextValue);
  const third = voteTransition(second.nextValue);
  assert.equal(first.delta + second.delta + third.delta, 1);
  assert.equal(first.delta + first.delta, 2);
});
