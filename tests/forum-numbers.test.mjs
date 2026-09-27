import assert from "node:assert/strict";
import test from "node:test";
import { isThreadNumber, postNumbers, threadIdForNumber, threadPath, threadNumbers } from "../lib/forum-numbers.js";

test("threads are numbered as integers from oldest to newest", () => {
  const numbers = threadNumbers([
    { id: "b", postedAt: "2026-09-27T02:00:00.000Z" },
    { id: "a", postedAt: "2026-09-27T01:00:00.000Z" },
    { id: "c", postedAt: "2026-09-27T03:00:00.000Z", _deleted: true },
  ]);
  assert.equal(numbers.get("a"), 1);
  assert.equal(numbers.get("b"), 2);
  assert.equal(numbers.get("c"), undefined);
});

test("thread urls use the integer id only", () => {
  assert.equal(
    threadPath({ id: "c5041370-d58d-42aa-9978-d97044fc6355", number: 12, title: "MEOW" }),
    "/forum/t/12"
  );
  assert.equal(threadPath({ id: "abc", title: "A very long title that should not appear" }), "/forum/t/abc");
  assert.equal(isThreadNumber("12"), true);
  assert.equal(isThreadNumber("c5041370"), false);
  assert.equal(threadIdForNumber({ abc: 12, def: 4 }, "12"), "abc");
});

test("posts are integer sub ids, with the opening post reserved as 1", () => {
  const numbers = postNumbers([
    { id: "later", postedAt: "2026-09-27T03:00:00.000Z" },
    { id: "earlier", postedAt: "2026-09-27T02:00:00.000Z" },
  ]);
  assert.equal(numbers.get("earlier"), 2);
  assert.equal(numbers.get("later"), 3);
});
