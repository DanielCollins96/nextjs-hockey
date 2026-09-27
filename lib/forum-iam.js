import { createHash, createHmac } from "crypto";

function sha256Hex(value) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function hmac(key, value) {
  return createHmac("sha256", key).update(value, "utf8").digest();
}

function signingKey(secret, dateStamp, region, service) {
  return hmac(hmac(hmac(hmac(`AWS4${secret}`, dateStamp), region), service), "aws4_request");
}

export function signAppSyncRequest({ url, body, region, credentials, now = new Date() }) {
  const endpoint = new URL(url);
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const payloadHash = sha256Hex(body);
  const canonical = {
    "content-type": "application/json",
    host: endpoint.hostname,
    "x-amz-date": amzDate,
  };
  if (credentials.sessionToken) canonical["x-amz-security-token"] = credentials.sessionToken;
  const signedHeaderNames = Object.keys(canonical).sort();
  const canonicalHeaders = signedHeaderNames.map((name) => `${name}:${canonical[name]}\n`).join("");
  const signedHeaders = signedHeaderNames.join(";");
  const canonicalRequest = [
    "POST",
    endpoint.pathname,
    "",
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");
  const scope = `${dateStamp}/${region}/appsync/aws4_request`;
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, scope, sha256Hex(canonicalRequest)].join("\n");
  const signature = createHmac("sha256", signingKey(credentials.secretAccessKey, dateStamp, region, "appsync"))
    .update(stringToSign, "utf8")
    .digest("hex");
  const headers = {
    "Content-Type": "application/json",
    Host: endpoint.hostname,
    "X-Amz-Date": amzDate,
    Authorization: `AWS4-HMAC-SHA256 Credential=${credentials.accessKeyId}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
  };
  if (credentials.sessionToken) headers["X-Amz-Security-Token"] = credentials.sessionToken;
  return headers;
}
