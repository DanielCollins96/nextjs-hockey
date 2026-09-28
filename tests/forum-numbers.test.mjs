import assert from "node:assert/strict";
import test from "node:test";
import { activityDeleteTarget, isForumOwner, isThreadNumber, postNumbers, threadIdForNumber, threadPath, threadNumbers } from "../lib/forum-numbers.js";

test("the author can delete a forum post even when the owner field is hidden", () => {
  const user = { username: "fan@example.com" };
  assert.equal(isForumOwner({ authorId: "fan@example.com", owner: null }, user), true);
  assert.equal(isForumOwner({ authorId: "someone-else", owner: null }, user), false);
  assert.equal(isForumOwner({ owner: "abc::fan@example.com" }, user), true);
  assert.equal(isForumOwner({ authorId: "system", owner: "fan@example.com" }, user), false);
});

test("activity deletion requires the caller to own the target post", () => {
  const thread = {
    id: "thread-1",
    boardSlug: "leafs",
    authorId: "fan@example.com",
    lastPostAuthor: "fan",
    lastActivityAt: "2026-09-27T02:00:00.000Z",
  };
  const reply = {
    id: "reply-1",
    threadId: "thread-1",
    authorId: "fan@example.com",
    authorName: "fan",
    postedAt: "2026-09-27T02:00:00.000Z",
  };
  assert.deepEqual(
    activityDeleteTarget({ username: "fan@example.com", targetType: "thread", thread }),
    { activityId: "thread-1", boardSlug: "leafs" }
  );
  assert.equal(activityDeleteTarget({ username: "other@example.com", targetType: "thread", thread }), null);
  assert.deepEqual(
    activityDeleteTarget({ username: "fan@example.com", targetType: "reply", thread, reply }),
    { activityId: "thread-1", boardSlug: "leafs" }
  );
  assert.equal(activityDeleteTarget({ username: "other@example.com", targetType: "reply", thread, reply }), null);
  assert.deepEqual(
    activityDeleteTarget({
      username: "fan@example.com",
      targetType: "reply",
      thread: { ...thread, lastActivityAt: "2026-09-27T03:00:00.000Z" },
      reply,
    }),
    { activityId: "", boardSlug: "leafs" }
  );
  assert.equal(activityDeleteTarget({ username: "fan@example.com", targetType: "activity", thread }), null);
  assert.deepEqual(
    activityDeleteTarget({
      identities: ["cognito-sub", "fan@example.com"],
      targetType: "thread",
      thread,
    }),
    { activityId: "thread-1", boardSlug: "leafs" }
  );
});

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

test("persisted thread numbers stay stable when newer threads appear", () => {
  const numbers = threadNumbers([
    { id: "old", postedAt: "2026-09-27T01:00:00.000Z", number: 1 },
    { id: "new", postedAt: "2026-09-27T03:00:00.000Z", number: 4 },
    { id: "mid", postedAt: "2026-09-27T02:00:00.000Z" },
  ]);
  assert.equal(numbers.get("old"), 1);
  assert.equal(numbers.get("new"), 4);
  assert.equal(numbers.get("mid"), 5);
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
