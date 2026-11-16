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
export const FORUM_GIF_SEARCHES_PER_DAY = 40;

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

export function forumPreviewImage(html) {
  const match = String(html || "").match(/<img\b[^>]*\bsrc=["']([^"']+)["']/i);
  const src = match?.[1] || "";
  return isForumImageUrl(src) ? src : "";
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

export const FORUM_TITLE_MIN = 3;
export const FORUM_TITLE_MAX = 80;
export const FORUM_BODY_MAX = 10000;
export const FORUM_DELETED_BODY = '<p data-forum-deleted="1">Deleted</p>';

export function isForumDeleted(html) {
  return /data-forum-deleted\s*=\s*["']1["']/i.test(String(html || ""));
}

export function validateTitle(title) {
  const trimmed = String(title || "").trim().replace(/\s+/g, " ");
  if (trimmed.length < FORUM_TITLE_MIN || trimmed.length > FORUM_TITLE_MAX) {
    throw new Error(`Title must be ${FORUM_TITLE_MIN} to ${FORUM_TITLE_MAX} characters.`);
  }
  return trimmed;
}

const ALLOWED_ATTR = new Set([
  "href", "src", "alt", "target", "rel", "loading", "data-upload", "data-forum-deleted",
  "controls", "loop", "muted", "playsinline", "autoplay", "preload",
]);
const VOID_TAGS = new Set(["br", "img"]);
const DROP_WITH_CONTENT = new Set([
  "script", "style", "iframe", "object", "embed", "link", "meta", "svg", "math", "noscript", "template",
]);

function decodeAttr(value) {
  return String(value || "")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&amp;/gi, "&");
}

function encodeAttr(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function parseAttrs(raw) {
  const attrs = {};
  const re = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let match;
  while ((match = re.exec(String(raw || "")))) {
    const name = match[1].toLowerCase();
    if (!ALLOWED_ATTR.has(name)) continue;
    attrs[name] = decodeAttr(match[2] ?? match[3] ?? match[4] ?? "");
  }
  return attrs;
}

function renderAttrs(attrs) {
  return Object.entries(attrs).map(([name, value]) => ` ${name}="${encodeAttr(value)}"`).join("");
}

function attrsFromRaw(raw) {
  const match = String(raw || "").match(/^<\/?[a-zA-Z][\w:-]*([\s\S]*?)\/?>$/);
  return parseAttrs(match ? match[1] : "");
}

function renderOpenTag(tag, attrs) {
  if (tag === "img") {
    const src = attrs.src || "";
    const uploadKey = attrs["data-upload"] || "";
    const key = isForumUploadKey(uploadKey) ? uploadKey : forumUploadKeyFromStoredSrc(src);
    if (key) {
      return `<img${renderAttrs({ src: forumUploadSrc(key), "data-upload": key, loading: "lazy", alt: attrs.alt || "" })}>`;
    }
    if (!isForumImageUrl(src)) return null;
    return `<img${renderAttrs({ src, loading: "lazy", alt: attrs.alt || "" })}>`;
  }
  if (tag === "video") {
    const src = attrs.src || "";
    if (!isForumVideoUrl(src)) return null;
    return `<video${renderAttrs({
      src,
      controls: "",
      loop: "",
      muted: "",
      playsinline: "",
      autoplay: "",
      preload: "metadata",
    })}>`;
  }
  if (tag === "a") {
    const href = attrs.href || "";
    const next = {};
    if (/^https?:/i.test(href)) {
      next.href = href;
      next.rel = "noopener noreferrer";
      next.target = "_blank";
    }
    return `<a${renderAttrs(next)}>`;
  }
  if (tag === "br") return "<br>";
  const next = {};
  Object.entries(attrs).forEach(([name, value]) => {
    if (ALLOWED_ATTR.has(name)) next[name] = value;
  });
  return `<${tag}${renderAttrs(next)}>`;
}

function* tokenizeForumHtml(html) {
  const source = String(html || "");
  let index = 0;
  while (index < source.length) {
    if (source.startsWith("<!--", index)) {
      const end = source.indexOf("-->", index + 4);
      index = end === -1 ? source.length : end + 3;
      continue;
    }
    if (source[index] === "<") {
      const end = source.indexOf(">", index);
      const raw = end === -1 ? "" : source.slice(index, end + 1);
      const close = raw && /^<\/([a-zA-Z][\w:-]*)/.exec(raw);
      const open = raw && /^<([a-zA-Z][\w:-]*)/.exec(raw);
      if (close) {
        yield { type: "close", tag: close[1].toLowerCase() };
        index = end + 1;
        continue;
      }
      if (open) {
        yield {
          type: /\/\s*>$/.test(raw) || VOID_TAGS.has(open[1].toLowerCase()) ? "void" : "open",
          tag: open[1].toLowerCase(),
          raw,
        };
        index = end + 1;
        continue;
      }
      yield { type: "text", value: "<" };
      index += 1;
      continue;
    }
    const next = source.indexOf("<", index);
    yield { type: "text", value: source.slice(index, next === -1 ? source.length : next) };
    index = next === -1 ? source.length : next;
  }
}

export function sanitizeForumHtmlSync(html) {
  const out = [];
  let skip = 0;
  let skipTag = "";
  for (const token of tokenizeForumHtml(html)) {
    if (token.type === "text") {
      if (!skip) out.push(token.value);
      continue;
    }
    if (token.type === "open" || token.type === "void") {
      if (skip) {
        if (token.type === "open" && token.tag === skipTag) skip += 1;
        continue;
      }
      if (DROP_WITH_CONTENT.has(token.tag)) {
        if (token.type === "open") {
          skip = 1;
          skipTag = token.tag;
        }
        continue;
      }
      if (!ALLOWED_TAGS.has(token.tag)) continue;
      const rendered = renderOpenTag(token.tag, attrsFromRaw(token.raw));
      if (rendered == null) {
        if (token.type === "open") {
          skip = 1;
          skipTag = token.tag;
        }
        continue;
      }
      out.push(rendered);
      continue;
    }
    if (skip) {
      if (token.tag === skipTag) {
        skip -= 1;
        if (!skip) skipTag = "";
      }
      continue;
    }
    if (ALLOWED_TAGS.has(token.tag) && !VOID_TAGS.has(token.tag)) out.push(`</${token.tag}>`);
  }
  return out.join("").trim();
}

export async function sanitizeForumHtml(html) {
  return sanitizeForumHtmlSync(html);
}

export async function requireForumBody(html) {
  const clean = await sanitizeForumHtml(html);
  assertForumMediaLimits(clean);
  const text = htmlToText(clean);
  if (!text && !/<img\s/i.test(clean) && !/<video\s/i.test(clean)) {
    throw new Error("Write something before posting.");
  }
  if (text.length > FORUM_BODY_MAX) {
    throw new Error(`Post must be ${FORUM_BODY_MAX} characters or less.`);
  }
  return clean;
}
