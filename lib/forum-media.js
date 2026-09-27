import { sanitizeForumHtml, forumUploadExtension, isForumUploadKey, forumUploadKeyFromStoredSrc, FORUM_UPLOAD_MAX_BYTES } from "./forum-content";

export function forumFileSrc(key) {
  return `/api/forum-file?key=${encodeURIComponent(key)}`;
}

export async function uploadForumImage(file) {
  const extension = forumUploadExtension(file);
  if (!extension) throw new Error("Use a jpg, png, webp, or gif.");
  if (file.size > FORUM_UPLOAD_MAX_BYTES) throw new Error("Images must be 8 MB or smaller.");

  const key = `forum/${crypto.randomUUID()}.${extension}`;
  const { Storage } = await import("aws-amplify");
  await Storage.put(key, file, {
    level: "public",
    contentType: file.type,
  });
  const src = await Storage.get(key, { level: "public", expires: 3600 });
  if (typeof src !== "string" || !src.startsWith("https://")) {
    throw new Error("Could not upload that image.");
  }
  return { key, src };
}

export async function resolveForumImages(html) {
  const clean = await sanitizeForumHtml(html);
  if (!clean || typeof window === "undefined") return clean;

  const document = new DOMParser().parseFromString(clean, "text/html");
  let changed = false;
  document.querySelectorAll("img").forEach((image) => {
    const key = image.getAttribute("data-upload") || forumUploadKeyFromStoredSrc(image.getAttribute("src"));
    if (!isForumUploadKey(key)) return;
    image.setAttribute("src", forumFileSrc(key));
    image.setAttribute("data-upload", key);
    changed = true;
  });
  return changed ? document.body.innerHTML.trim() : clean;
}
