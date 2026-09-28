import assert from "node:assert/strict";
import test from "node:test";
import { signAppSyncRequest, signAwsRequest } from "../lib/forum-iam.js";

test("AppSync IAM signatures cover the body and omit an API key", () => {
  const headers = signAppSyncRequest({
    url: "https://example.appsync-api.us-east-1.amazonaws.com/graphql",
    body: JSON.stringify({ query: "query { getForumThread(id: \"1\") { id } }" }),
    region: "us-east-1",
    credentials: { accessKeyId: "AKIAEXAMPLE", secretAccessKey: "wJalrXUtnFEMI/K7MDENG+bPxRfiCYEXAMPLEKEY" },
    now: new Date("2015-08-30T12:36:00.000Z"),
  });
  assert.match(headers.Authorization, /^AWS4-HMAC-SHA256 Credential=AKIAEXAMPLE\/20150830\/us-east-1\/appsync\/aws4_request/);
  assert.match(headers.Authorization, /SignedHeaders=content-type;host;x-amz-date/);
  assert.equal(headers["X-Amz-Date"], "20150830T123600Z");
  assert.equal(headers["x-api-key"], undefined);
});

test("DynamoDB signatures name the dynamodb service and target", () => {
  const headers = signAwsRequest({
    url: "https://dynamodb.us-east-1.amazonaws.com/",
    body: "{}",
    region: "us-east-1",
    service: "dynamodb",
    credentials: { accessKeyId: "AKIAEXAMPLE", secretAccessKey: "wJalrXUtnFEMI/K7MDENG+bPxRfiCYEXAMPLEKEY" },
    headers: {
      "content-type": "application/x-amz-json-1.0",
      "x-amz-target": "DynamoDB_20120810.GetItem",
    },
    now: new Date("2015-08-30T12:36:00.000Z"),
  });
  assert.match(headers.Authorization, /\/us-east-1\/dynamodb\/aws4_request/);
  assert.equal(headers["X-Amz-Target"], "DynamoDB_20120810.GetItem");
  assert.equal(headers["Content-Type"], "application/x-amz-json-1.0");
});
