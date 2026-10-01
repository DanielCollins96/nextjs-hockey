import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const schema = readFileSync(new URL("../amplify/backend/api/three/schema.graphql", import.meta.url), "utf8");
const authParameters = readFileSync(new URL("../amplify/backend/auth/three/parameters.json", import.meta.url), "utf8");
const storageTemplate = readFileSync(
  new URL("../amplify/backend/storage/nhljsstorage/s3-cloudformation-template.json", import.meta.url),
  "utf8"
);
const forumWrite = readFileSync(new URL("../pages/api/forum-write.js", import.meta.url), "utf8");
const forumApi = readFileSync(new URL("../lib/forum-api.js", import.meta.url), "utf8");

const WRITE_MODELS = ["ForumThread", "ForumReply", "ForumVote", "ForumUsage", "ForumCounter", "ForumActivity"];

function typeBlock(name) {
  const match = schema.match(new RegExp(`type ${name}\\b[\\s\\S]*?\\n}`));
  assert.ok(match, `${name} is missing from the AppSync schema`);
  return match[0];
}

function modelAuthRules(block) {
  const auth = block.match(/@auth\(rules:\s*\[([\s\S]*?)\]\)/);
  assert.ok(auth, "missing @auth rules");
  return auth[1];
}

function operationsFor(rules, pattern) {
  const match = rules.match(new RegExp(`${pattern}[^\\]]*operations:\\s*\\[([^\\]]+)\\]`));
  return match ? match[1].replace(/\s/g, "") : "";
}

test("ForumThread has a required number that clients cannot write", () => {
  const thread = typeBlock("ForumThread");
  assert.match(thread, /number:\s*Int!/);
  const rules = modelAuthRules(thread);
  assert.equal(operationsFor(rules, "allow:\\s*public,\\s*provider:\\s*iam"), "read");
  assert.match(operationsFor(rules, "allow:\\s*private,\\s*provider:\\s*iam"), /create/);
  const ownerOps = operationsFor(rules, "allow:\\s*owner");
  assert.equal(ownerOps, "read");
  assert.doesNotMatch(thread, /provider:\s*apiKey/);
});

test("trusted forum writes are not API-key mutations", () => {
  WRITE_MODELS.forEach((name) => {
    assert.doesNotMatch(typeBlock(name), /provider:\s*apiKey/);
  });
});

test("guest IAM cannot create or update forum models", () => {
  WRITE_MODELS.forEach((name) => {
    const rules = modelAuthRules(typeBlock(name));
    const publicIam = operationsFor(rules, "allow:\\s*public,\\s*provider:\\s*iam");
    if (publicIam) {
      assert.equal(publicIam, "read", `${name} public IAM must be read-only, got ${publicIam}`);
    }
    assert.doesNotMatch(publicIam, /create|update|delete/);
  });
});

test("trusted AppSync writes use private IAM rather than Cognito user-pool mutations", () => {
  ["ForumThread", "ForumReply", "ForumUsage", "ForumCounter", "ForumActivity"].forEach((name) => {
    const rules = modelAuthRules(typeBlock(name));
    const privateIam = operationsFor(rules, "allow:\\s*private,\\s*provider:\\s*iam");
    assert.match(privateIam, /create|update|delete/, `${name} is missing private IAM writes`);
    const privateUserPools = [...rules.matchAll(/allow:\s*private,(?!\s*provider)[^[\]]*operations:\s*\[([^\]]+)\]/g)];
    privateUserPools.forEach((match) => {
      assert.doesNotMatch(match[1], /create|update|delete/, `${name} still allows user-pool writes`);
    });
  });
});

test("ForumVote is readable by its owner and not client-writable via owner rules", () => {
  const vote = typeBlock("ForumVote");
  const ownerRule = vote.match(/allow:\s*owner,?\s*operations:\s*\[([^\]]+)\]/);
  assert.ok(ownerRule, "ForumVote is missing an owner auth rule");
  assert.equal(ownerRule[1].replace(/\s/g, ""), "read");
  assert.doesNotMatch(modelAuthRules(vote), /allow:\s*public/);
});

test("ForumUsage is owned by userId and clients cannot delete quota slots", () => {
  const usage = typeBlock("ForumUsage");
  const ownerRule = usage.match(/allow:\s*owner,[^\]\n]*operations:\s*\[([^\]]+)\]/);
  assert.ok(ownerRule, "ForumUsage is missing an owner auth rule");
  assert.match(usage, /ownerField:\s*"userId"/);
  assert.equal(ownerRule[1].replace(/\s/g, ""), "read");
  assert.equal(operationsFor(modelAuthRules(usage), "allow:\\s*private,\\s*provider:\\s*iam"), "create,delete");
});

test("guest identity pool access stays enabled only for public reads and storage", () => {
  const auth = JSON.parse(authParameters);
  assert.equal(auth.allowUnauthenticatedIdentities, true);
  assert.match(typeBlock("ForumBoard"), /allow:\s*public,\s*provider:\s*iam,\s*operations:\s*\[\s*read\s*\]/);
  assert.match(storageTemplate, /DenyForumTrustedMutations/);
  assert.match(storageTemplate, /createForumThread/);
  assert.match(storageTemplate, /unauthRoleName/);
});

test("the Next.js forum write path still requires a signed-in user", () => {
  assert.match(forumWrite, /forumVerifiedUser/);
  assert.match(forumWrite, /Log in to post/);
  assert.match(forumApi, /trustedWrite\("createThread"/);
  assert.match(forumApi, /\/api\/forum-write/);
  assert.match(forumApi, /Log in to post/);
});
