const ALLOWED_TAGS = new Set([
  "p", "br", "strong", "em", "u", "s", "ul", "ol", "li", "a", "blockquote", "h2", "h3", "code", "pre", "img", "video",
]);

const IMAGE_EXTENSION = /\.(gif|jpe?g|png|webp|avif)(?:$|[?#])/i;
const VIDEO_EXTENSION = /\.(mp4|webm)(?:$|[?#])/i;
const IMAGE_HOST = /(^|\.)(media\d*\.giphy\.com|i\.giphy\.com|media\d*\.tenor\.com|c\.tenor\.com|i\.imgur\.com|i\.redd\.it)$/i;
const UPLOAD_KEY = /^forum\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(gif|jpe?g|png|webp)$/i;
const UPLOAD_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
};

export const FORUM_UPLOAD_HOST = "forum-uploads.hocke.invalid";
export const FORUM_UPLOAD_MAX_BYTES = 2 * 1024 * 1024;
export const FORUM_FILE_MAX_BYTES = 4 * 1024 * 1024;
export const FORUM_UPLOADS_PER_POST = 4;
export const FORUM_IMAGES_PER_POST = 6;
export const FORUM_VIDEOS_PER_POST = 2;
export const FORUM_UPLOADS_PER_DAY = 15;

export function forumUploadExtension(file) {
  return UPLOAD_TYPES[file?.type] || "";
}

export function isForumUploadKey(value) {
  return UPLOAD_KEY.test(String(value || ""));
}

export function forumUploadSrc(key) {
  return `https://${FORUM_UPLOAD_HOST}/${key}`;
}

export function forumUploadKeyFromSrc(value) {
  let url;
  try {
    url = new URL(String(value || "").trim());
  } catch {
    return "";
  }
  if (url.protocol !== "https:" || url.hostname !== FORUM_UPLOAD_HOST) return "";
  let key = "";
  try {
    key = decodeURIComponent(url.pathname.replace(/^\/+/, ""));
  } catch {
    return "";
  }
  return isForumUploadKey(key) ? key : "";
}

const STORED_UPLOAD = /(?:^|\/)public\/(forum\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(?:gif|jpe?g|png|webp))(?:$|[?#])/i;

export function forumUploadKeyFromStoredSrc(value) {
  const marker = forumUploadKeyFromSrc(value);
  if (marker) return marker;
  const match = String(value || "").match(STORED_UPLOAD);
  if (!match || !isForumUploadKey(match[1])) return "";
  return match[1];
}

export function isForumVideoUrl(value) {
  let url;
  try {
    url = new URL(String(value || "").trim());
  } catch {
    return false;
  }
  if (url.protocol !== "https:") return false;
  return VIDEO_EXTENSION.test(url.pathname);
}

export function isForumImageUrl(value) {
  if (forumUploadKeyFromSrc(value)) return true;
  let url;
  try {
    url = new URL(String(value || "").trim());
  } catch {
    return false;
  }
  if (url.protocol !== "https:") return false;
  return IMAGE_EXTENSION.test(url.pathname) || IMAGE_HOST.test(url.hostname);
}

export function assertForumMediaLimits(html) {
  const source = String(html || "");
  const uploads = (source.match(/data-upload="/g) || []).length;
  const images = (source.match(/<img\b/gi) || []).length;
  const videos = (source.match(/<video\b/gi) || []).length;
  if (uploads > FORUM_UPLOADS_PER_POST) {
    throw new Error(`A post can include up to ${FORUM_UPLOADS_PER_POST} uploaded images.`);
  }
  if (images > FORUM_IMAGES_PER_POST) {
    throw new Error(`A post can include up to ${FORUM_IMAGES_PER_POST} images.`);
  }
  if (videos > FORUM_VIDEOS_PER_POST) {
    throw new Error(`A post can include up to ${FORUM_VIDEOS_PER_POST} videos.`);
  }
}

export function htmlToText(html) {
  return String(html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

export function excerptFromHtml(html, limit = 140) {
  const text = htmlToText(html);
  if (text.length <= limit) return text;
  return `${text.slice(0, limit - 1).trim()}…`;
}

export function validateDisplayName(name) {
  const trimmed = String(name || "").trim().replace(/\s+/g, " ");
  if (trimmed.length < 3 || trimmed.length > 24) {
    throw new Error("Display name must be 3 to 24 characters.");
  }
  if (trimmed.includes("@")) {
    throw new Error("Use a display name, not an email address.");
  }
  return trimmed;
}

export function validateTitle(title) {
  const trimmed = String(title || "").trim().replace(/\s+/g, " ");
  if (trimmed.length < 3 || trimmed.length > 120) {
    throw new Error("Title must be 3 to 120 characters.");
  }
  return trimmed;
}

export async function sanitizeForumHtml(html) {
  if (typeof window === "undefined") return "";
  const { default: DOMPurify } = await import("dompurify");
  const clean = DOMPurify.sanitize(String(html || ""), {
    ALLOWED_TAGS: [...ALLOWED_TAGS],
    ALLOWED_ATTR: ["href", "src", "alt", "target", "rel", "loading", "data-upload", "controls", "loop", "muted", "playsinline", "autoplay", "preload"],
    ALLOWED_URI_REGEXP: /^https?:/i,
  });
  const document = new DOMParser().parseFromString(clean, "text/html");
  document.querySelectorAll("img").forEach((image) => {
    const src = image.getAttribute("src") || "";
    const uploadKey = image.getAttribute("data-upload") || "";
    const key = isForumUploadKey(uploadKey) ? uploadKey : forumUploadKeyFromStoredSrc(src);
    if (key) {
      image.setAttribute("src", forumUploadSrc(key));
      image.setAttribute("data-upload", key);
    } else if (!isForumImageUrl(src)) {
      image.remove();
      return;
    } else {
      image.removeAttribute("data-upload");
      image.setAttribute("src", src);
    }
    image.setAttribute("loading", "lazy");
    if (!image.getAttribute("alt")) image.setAttribute("alt", "");
  });
  document.querySelectorAll("video").forEach((video) => {
    const src = video.getAttribute("src") || "";
    if (!isForumVideoUrl(src)) {
      video.remove();
      return;
    }
    video.setAttribute("src", src);
    video.setAttribute("controls", "");
    video.setAttribute("loop", "");
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("autoplay", "");
    video.setAttribute("preload", "metadata");
  });
  document.querySelectorAll("a").forEach((link) => {
    const href = link.getAttribute("href") || "";
    if (!/^https?:/i.test(href)) {
      link.removeAttribute("href");
      return;
    }
    link.setAttribute("rel", "noopener noreferrer");
    link.setAttribute("target", "_blank");
  });
  return document.body.innerHTML.trim();
}

export async function requireForumBody(html) {
  const clean = await sanitizeForumHtml(html);
  assertForumMediaLimits(clean);
  const text = htmlToText(clean);
  if (!text && !/<img\s/i.test(clean) && !/<video\s/i.test(clean)) {
    throw new Error("Write something before posting.");
  }
  if (text.length > 20000) {
    throw new Error("Post is too long.");
  }
  return clean;
}
