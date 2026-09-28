import { sanitizeForumHtml, forumUploadExtension, isForumUploadKey, forumUploadKeyFromStoredSrc, FORUM_UPLOAD_MAX_BYTES } from "./forum-content";

export function forumFileSrc(key) {
  return `/api/forum-file?key=${encodeURIComponent(key)}`;
}

export async function forumAuthToken() {
  const { Auth } = await import("aws-amplify");
  const session = await Auth.currentSession();
  return session.getIdToken().getJwtToken();
}

export async function uploadForumImage(file) {
  const extension = forumUploadExtension(file);
  if (!extension) throw new Error("Use a jpg, png, webp, or gif.");
  if (file.size > FORUM_UPLOAD_MAX_BYTES) throw new Error("Images must be 2 MB or smaller.");

  const token = await forumAuthToken();
  const response = await fetch("/api/forum-upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": file.type,
    },
    body: file,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Could not upload that image.");
  if (!isForumUploadKey(data.key)) throw new Error("Could not upload that image.");
  return { key: data.key, src: forumFileSrc(data.key) };
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
