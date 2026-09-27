import { PutObjectCommand } from "@aws-sdk/client-s3";
import awsExports from "../../aws-exports";
import { forumS3Client, forumVerifiedUser } from "../../lib/forum-aws";
import {
  FORUM_UPLOAD_MAX_BYTES,
  FORUM_UPLOADS_PER_DAY,
  forumUploadExtension,
} from "../../lib/forum-content";
import { releaseDailyQuota, reserveDailyQuota } from "../../lib/forum-quota";

const TYPES = {
  jpg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
};

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

  const user = await forumVerifiedUser(token).catch(() => null);
  if (!user) return res.status(401).json({ error: "Log in to upload an image." });

  const extension = forumUploadExtension({ type: String(req.headers["content-type"] || "").split(";")[0] });
  if (!extension) return res.status(400).json({ error: "Use a jpg, png, webp, or gif." });

  const reservation = await reserveDailyQuota(token, user.username, "upload", FORUM_UPLOADS_PER_DAY);
  if (!reservation) {
    return res.status(429).json({ error: `You can upload ${FORUM_UPLOADS_PER_DAY} images a day.` });
  }

  try {
    const body = await readBody(req, FORUM_UPLOAD_MAX_BYTES);
    if (!body.length) throw new Error("That image is empty.");
    const key = `forum/${crypto.randomUUID()}.${extension}`;
    const client = forumS3Client();
    await client.send(new PutObjectCommand({
      Bucket: awsExports.aws_user_files_s3_bucket,
      Key: `public/${key}`,
      Body: body,
      ContentType: TYPES[extension],
      CacheControl: "public, max-age=31536000, immutable",
    }));
    return res.status(200).json({ key });
  } catch (error) {
    await releaseDailyQuota(token, reservation);
    const tooBig = error?.message === "Images must be 2 MB or smaller.";
    return res.status(tooBig ? 413 : 500).json({ error: tooBig ? error.message : "Could not upload that image." });
  }
}
