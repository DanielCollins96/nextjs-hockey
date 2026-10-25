import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const parameters = JSON.parse(
  readFileSync(new URL("../amplify/backend/storage/nhljsstorage/parameters.json", import.meta.url), "utf8"),
);
const template = JSON.parse(
  readFileSync(new URL("../amplify/backend/storage/nhljsstorage/s3-cloudformation-template.json", import.meta.url), "utf8"),
);
const forumUpload = readFileSync(new URL("../pages/api/forum-upload.js", import.meta.url), "utf8");
const forumFile = readFileSync(new URL("../pages/api/forum-file.js", import.meta.url), "utf8");
const readModelInfra = readFileSync(new URL("../infra/read-models/main.tf", import.meta.url), "utf8");
const awsExports = readFileSync(new URL("../aws-exports.js", import.meta.url), "utf8");

function joinSuffix(resource) {
  const join = resource?.["Fn::Join"];
  assert.ok(Array.isArray(join?.[1]), "expected Fn::Join resource");
  return join[1].at(-1);
}

function policyStatement(resourceId) {
  const statements = template.Resources[resourceId]?.Properties?.PolicyDocument?.Statement;
  assert.ok(Array.isArray(statements) && statements.length, `${resourceId} is missing a policy statement`);
  return statements[0];
}

function policyRoles(resourceId) {
  return JSON.stringify(template.Resources[resourceId]?.Properties?.Roles || []);
}

test("Cognito identities cannot write or list the shared public prefix", () => {
  assert.equal(parameters.s3PermissionsAuthenticatedPublic, "DISALLOW");
  assert.equal(parameters.s3PermissionsAuthenticatedUploads, "DISALLOW");
  assert.equal(parameters.AuthenticatedAllowList, "DISALLOW");
  assert.equal(parameters.GuestAllowList, "DISALLOW");
  assert.equal(parameters.s3PermissionsGuestUploads, "DISALLOW");
  assert.deepEqual(parameters.selectedGuestPermissions, ["s3:GetObject"]);
  assert.equal(parameters.selectedAuthenticatedPermissions.includes("s3:ListBucket"), false);
});

test("owner-scoped private and protected prefixes keep their own-object writes", () => {
  assert.equal(parameters.s3PermissionsAuthenticatedPrivate, "s3:PutObject,s3:GetObject,s3:DeleteObject");
  assert.equal(parameters.s3PermissionsAuthenticatedProtected, "s3:PutObject,s3:GetObject,s3:DeleteObject");
  assert.equal(joinSuffix(policyStatement("S3AuthPrivatePolicy").Resource[0]), "/private/${cognito-identity.amazonaws.com:sub}/*");
  assert.equal(joinSuffix(policyStatement("S3AuthProtectedPolicy").Resource[0]), "/protected/${cognito-identity.amazonaws.com:sub}/*");
});

test("guest GetObject is limited to public forum uploads", () => {
  assert.equal(parameters.s3PermissionsGuestPublic, "s3:GetObject");
  const guestPublic = policyStatement("S3GuestPublicPolicy");
  assert.equal(guestPublic.Effect, "Allow");
  assert.equal(joinSuffix(guestPublic.Resource[0]), "/public/forum/*");
});

test("auth and guest roles are denied PutObject and DeleteObject on public/*", () => {
  const deny = policyStatement("S3AuthDenyForumUploadPolicy");
  const roles = policyRoles("S3AuthDenyForumUploadPolicy");
  assert.equal(deny.Effect, "Deny");
  assert.deepEqual(deny.Action, ["s3:PutObject", "s3:DeleteObject"]);
  assert.equal(joinSuffix(deny.Resource[0]), "/public/*");
  assert.match(roles, /authRoleName/);
  assert.match(roles, /unauthRoleName/);
});

test("forum uploads stay server-mediated UUID keys under public/forum/", () => {
  assert.match(forumUpload, /forumS3Client\(\)/);
  assert.doesNotMatch(forumUpload, /forumUserFromIdToken|guestStorageCredentials/);
  assert.match(forumUpload, /const key = `forum\/\$\{crypto\.randomUUID\(\)\}\.\$\{extension\}`/);
  assert.match(forumUpload, /Key: `public\/\$\{key\}`/);
  assert.doesNotMatch(forumUpload, /req\.(?:body|query|headers).*key/i);
  assert.match(forumFile, /isForumUploadKey\(key\)/);
  assert.match(forumFile, /Key: `public\/\$\{key\}`/);
});

test("stats read-models live in a separate Terraform bucket", () => {
  assert.match(readModelInfra, /resource "aws_s3_bucket" "read_models"/);
  assert.doesNotMatch(readModelInfra, /three1900875b17af49e68e61a6d8420dd5a5/);
  assert.match(awsExports, /aws_user_files_s3_bucket": "three1900875b17af49e68e61a6d8420dd5a560858-staging"/);
});
