import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { isForumUploadKey } from "../../lib/forum-content";
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

  const client = new S3Client({ region: awsExports.aws_user_files_s3_bucket_region });
  try {
    const object = await client.send(new GetObjectCommand({
      Bucket: awsExports.aws_user_files_s3_bucket,
      Key: `public/${key}`,
    }));
    const extension = key.split(".").pop().toLowerCase();
    res.setHeader("Content-Type", object.ContentType || TYPES[extension] || "application/octet-stream");
    res.setHeader("Cache-Control", "public, max-age=86400");
    const bytes = await object.Body.transformToByteArray();
    return res.status(200).send(Buffer.from(bytes));
  } catch {
    return res.status(404).end();
  }
}
