import { S3Client } from "@aws-sdk/client-s3";
import awsExports from "../aws-exports";

const REGION = awsExports.aws_cognito_region;
const IDENTITY_POOL = awsExports.aws_cognito_identity_pool_id;
const LOGIN_KEY = `cognito-idp.${REGION}.amazonaws.com/${awsExports.aws_user_pools_id}`;

let guestCredentials = null;

function staticCredentials() {
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) return null;
  return {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    ...(process.env.AWS_SESSION_TOKEN ? { sessionToken: process.env.AWS_SESSION_TOKEN } : {}),
  };
}

export function forumS3Client(credentials) {
  const config = { region: awsExports.aws_user_files_s3_bucket_region };
  const resolved = credentials || staticCredentials();
  if (resolved?.accessKeyId && resolved?.secretAccessKey) {
    config.credentials = {
      accessKeyId: resolved.accessKeyId,
      secretAccessKey: resolved.secretAccessKey,
      ...(resolved.sessionToken ? { sessionToken: resolved.sessionToken } : {}),
    };
  }
  return new S3Client(config);
}

function claimsFromToken(token) {
  try {
    const segment = String(token || "").split(".")[1];
    if (!segment) return null;
    return JSON.parse(Buffer.from(segment, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

async function identityCall(target, body) {
  const response = await fetch(`https://cognito-identity.${REGION}.amazonaws.com/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": `AWSCognitoIdentityService.${target}`,
    },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Could not get storage credentials.");
  }
  return data;
}

function credentialsFromIdentity(data) {
  const credentials = data?.Credentials;
  if (!credentials?.AccessKeyId || !credentials?.SecretKey) {
    throw new Error("Could not get storage credentials.");
  }
  return {
    accessKeyId: credentials.AccessKeyId,
    secretAccessKey: credentials.SecretKey,
    sessionToken: credentials.SessionToken,
    expiration: Number(credentials.Expiration || 0) * 1000,
  };
}

async function identityCredentials(logins) {
  const identity = await identityCall("GetId", {
    IdentityPoolId: IDENTITY_POOL,
    ...(logins ? { Logins: logins } : {}),
  });
  const result = await identityCall("GetCredentialsForIdentity", {
    IdentityId: identity.IdentityId,
    ...(logins ? { Logins: logins } : {}),
  });
  return credentialsFromIdentity(result);
}

export async function forumVerifiedUser(token) {
  const claims = claimsFromToken(token);
  const username = String(claims?.["cognito:username"] || claims?.email || "").trim();
  if (!username) return null;
  await identityCall("GetId", {
    IdentityPoolId: IDENTITY_POOL,
    Logins: { [LOGIN_KEY]: token },
  });
  return { username };
}

export async function forumUserFromIdToken(token) {
  const user = await forumVerifiedUser(token);
  if (!user) return null;
  const credentials = await identityCredentials({ [LOGIN_KEY]: token });
  return { username: user.username, credentials };
}

export async function guestStorageCredentials() {
  if (guestCredentials && guestCredentials.expiration > Date.now() + 60_000) {
    return guestCredentials;
  }
  guestCredentials = await identityCredentials();
  return guestCredentials;
}

export function isStorageCredentialError(error) {
  const text = `${error?.name || ""} ${error?.message || ""}`;
  return /Credential|AccessDenied|Forbidden|ExpiredToken|InvalidAccessKey|not authorized|Access Denied/i.test(text);
}
