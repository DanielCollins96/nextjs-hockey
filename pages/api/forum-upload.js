import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import awsExports from "../../aws-exports";
import {
  FORUM_UPLOAD_MAX_BYTES,
  FORUM_UPLOADS_PER_DAY,
  forumUploadExtension,
} from "../../lib/forum-content";

const TYPES = {
  jpg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
};

const uploadsByUser = new Map();

function reserveUpload(username) {
  const day = new Date().toISOString().slice(0, 10);
  const current = uploadsByUser.get(username);
  const count = current?.day === day ? current.count : 0;
  if (count >= FORUM_UPLOADS_PER_DAY) return false;
  uploadsByUser.set(username, { day, count: count + 1 });
  return true;
}

function refundUpload(username) {
  const current = uploadsByUser.get(username);
  if (!current || current.count < 1) return;
  uploadsByUser.set(username, { day: current.day, count: current.count - 1 });
}

function readBody(req, maxBytes) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    let settled = false;
    const fail = (error) => {
      if (settled) return;
      settled = true;
      reject(error);
    };
    const succeed = (value) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > maxBytes) {
        fail(new Error("Images must be 2 MB or smaller."));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => succeed(Buffer.concat(chunks)));
    req.on("error", () => fail(new Error("Could not upload that image.")));
  });
}

async function cognitoUsername(token) {
  const response = await fetch(`https://cognito-idp.${awsExports.aws_cognito_region}.amazonaws.com/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": "AWSCognitoIdentityProviderService.GetUser",
    },
    body: JSON.stringify({ AccessToken: token }),
  });
  if (!response.ok) return "";
  const data = await response.json();
  return data.Username || "";
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ error: "Log in to upload an image." });

  const username = await cognitoUsername(token);
  if (!username) return res.status(401).json({ error: "Log in to upload an image." });

  const extension = forumUploadExtension({ type: String(req.headers["content-type"] || "").split(";")[0] });
  if (!extension) return res.status(400).json({ error: "Use a jpg, png, webp, or gif." });
  if (!reserveUpload(username)) {
    return res.status(429).json({ error: `You can upload ${FORUM_UPLOADS_PER_DAY} images a day.` });
  }

  try {
    const body = await readBody(req, FORUM_UPLOAD_MAX_BYTES);
    if (!body.length) throw new Error("That image is empty.");
    const key = `forum/${crypto.randomUUID()}.${extension}`;
    const client = new S3Client({ region: awsExports.aws_user_files_s3_bucket_region });
    await client.send(new PutObjectCommand({
      Bucket: awsExports.aws_user_files_s3_bucket,
      Key: `public/${key}`,
      Body: body,
      ContentType: TYPES[extension],
      CacheControl: "public, max-age=31536000, immutable",
    }));
    return res.status(200).json({ key });
  } catch (error) {
    refundUpload(username);
    const tooBig = error?.message === "Images must be 2 MB or smaller.";
    return res.status(tooBig ? 413 : 500).json({ error: tooBig ? error.message : "Could not upload that image." });
  }
}
