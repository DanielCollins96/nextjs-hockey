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

test("legacy Comment model is authenticated-only like Post", () => {
  const comment = typeBlock("Comment");
  assert.match(comment, /@auth\(rules:\s*\[\{allow:\s*private\}\]\)/);
  assert.doesNotMatch(comment, /allow:\s*public/);
  assert.doesNotMatch(comment, /provider:\s*apiKey/);
});

test("AppSync additional auth keeps IAM and does not enable API_KEY", () => {
  const backend = JSON.parse(
    readFileSync(new URL("../amplify/backend/backend-config.json", import.meta.url), "utf8")
  );
  const cli = JSON.parse(
    readFileSync(new URL("../amplify/backend/api/three/cli-inputs.json", import.meta.url), "utf8")
  );
  const params = JSON.parse(
    readFileSync(new URL("../amplify/backend/api/three/parameters.json", import.meta.url), "utf8")
  );
  const awsExports = readFileSync(new URL("../aws-exports.js", import.meta.url), "utf8");
  const authConfig = backend.api.three.output.authConfig;
  const additional = authConfig.additionalAuthenticationProviders;
  const additionalModes = cli.serviceConfiguration.additionalAuthTypes.map((type) => type.mode);

  assert.equal(authConfig.defaultAuthentication.authenticationType, "AMAZON_COGNITO_USER_POOLS");
  assert.ok(additional.some((provider) => provider.authenticationType === "AWS_IAM"));
  assert.ok(additional.every((provider) => provider.authenticationType !== "API_KEY"));
  assert.deepEqual(additionalModes, ["AWS_IAM"]);
  assert.equal(params.CreateAPIKey, 0);
  assert.doesNotMatch(awsExports, /aws_appsync_apiKey/);
  assert.doesNotMatch(schema, /provider:\s*apiKey/);
  assert.doesNotMatch(schema, /allow:\s*public(?![^\]\n]*provider:\s*iam)/);
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
