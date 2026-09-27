import { GetObjectCommand } from "@aws-sdk/client-s3";
import awsExports from "../../aws-exports";
import { forumS3Client, guestStorageCredentials, isStorageCredentialError } from "../../lib/forum-aws";
import { FORUM_FILE_MAX_BYTES, isForumUploadKey } from "../../lib/forum-content";

const TYPES = {
  gif: "image/gif",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

async function readUpload(key) {
  const clients = [];
  try {
    clients.push(forumS3Client(await guestStorageCredentials()));
  } catch {
    // Guest identity credentials are unavailable. The default provider still covers a local AWS profile or Vercel keys.
  }
  clients.push(forumS3Client());

  let lastError = null;
  for (const client of clients) {
    try {
      return await client.send(new GetObjectCommand({
        Bucket: awsExports.aws_user_files_s3_bucket,
        Key: `public/${key}`,
      }));
    } catch (error) {
      lastError = error;
      if (!isStorageCredentialError(error)) throw error;
    }
  }
  throw lastError;
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end();
  }

  const key = String(req.query.key || "");
  if (!isForumUploadKey(key)) return res.status(400).end();
  const extension = key.split(".").pop().toLowerCase();
  const contentType = TYPES[extension];
  if (!contentType) return res.status(400).end();

  try {
    const object = await readUpload(key);
    if ((object.ContentLength || 0) > FORUM_FILE_MAX_BYTES) {
      object.Body?.destroy?.();
      return res.status(413).end();
    }
    res.setHeader("Content-Type", contentType);
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Content-Security-Policy", "default-src 'none'");
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    const bytes = await object.Body.transformToByteArray();
    return res.status(200).send(Buffer.from(bytes));
  } catch {
    return res.status(404).end();
  }
}
