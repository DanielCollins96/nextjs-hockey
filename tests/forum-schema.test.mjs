import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const schema = readFileSync(new URL("../amplify/backend/api/three/schema.graphql", import.meta.url), "utf8");

function typeBlock(name) {
  const match = schema.match(new RegExp(`type ${name}\\b[\\s\\S]*?\\n}`));
  assert.ok(match, `${name} is missing from the AppSync schema`);
  return match[0];
}

test("ForumThread has a required number that clients cannot write", () => {
  const thread = typeBlock("ForumThread");
  assert.match(thread, /number:\s*Int!/);
  const numberField = thread.slice(thread.indexOf("number:"), thread.indexOf("boardSlug:"));
  assert.match(numberField, /provider:\s*iam, operations:\s*\[\s*read,\s*create/);
  assert.doesNotMatch(numberField, /allow:\s*owner/);
  assert.doesNotMatch(numberField, /provider:\s*apiKey/);
});

test("trusted forum writes are not API-key mutations", () => {
  ["ForumThread", "ForumReply", "ForumVote", "ForumUsage", "ForumCounter", "ForumActivity"].forEach((name) => {
    assert.doesNotMatch(typeBlock(name), /provider:\s*apiKey/);
  });
});

test("ForumVote is readable by its owner and not client-writable via owner rules", () => {
  const vote = typeBlock("ForumVote");
  const ownerRule = vote.match(/allow:\s*owner,?\s*operations:\s*\[([^\]]+)\]/);
  assert.ok(ownerRule, "ForumVote is missing an owner auth rule");
  assert.equal(ownerRule[1].replace(/\s/g, ""), "read");
});

test("ForumUsage is owned by userId and clients cannot delete quota slots", () => {
  const usage = typeBlock("ForumUsage");
  const ownerRule = usage.match(/allow:\s*owner,[^\]\n]*operations:\s*\[([^\]]+)\]/);
  assert.ok(ownerRule, "ForumUsage is missing an owner auth rule");
  assert.match(usage, /ownerField:\s*"userId"/);
  assert.equal(ownerRule[1].replace(/\s/g, ""), "read");
});
