import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { FORUM_FILE_MAX_BYTES, isForumUploadKey } from "../../lib/forum-content";
import awsExports from "../../aws-exports";

const TYPES = {
  gif: "image/gif",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

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

  const client = new S3Client({ region: awsExports.aws_user_files_s3_bucket_region });
  try {
    const object = await client.send(new GetObjectCommand({
      Bucket: awsExports.aws_user_files_s3_bucket,
      Key: `public/${key}`,
    }));
    if ((object.ContentLength || 0) > FORUM_FILE_MAX_BYTES) {
      object.Body?.destroy?.();
      return res.status(413).end();
    }
    res.setHeader("Content-Type", contentType);
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    const bytes = await object.Body.transformToByteArray();
    return res.status(200).send(Buffer.from(bytes));
  } catch {
    return res.status(404).end();
  }
}
