const ALLOWED_TAGS = new Set([
  "p", "br", "strong", "em", "u", "s", "ul", "ol", "li", "a", "blockquote", "h2", "h3", "code", "pre", "img",
]);

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
    ALLOWED_ATTR: ["href", "src", "alt", "target", "rel"],
    ALLOWED_URI_REGEXP: /^https?:/i,
  });
  const document = new DOMParser().parseFromString(clean, "text/html");
  document.querySelectorAll("img").forEach((image) => {
    const src = image.getAttribute("src") || "";
    if (!src.startsWith("https://")) image.remove();
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
  const text = htmlToText(clean);
  if (!text && !/<img\s/i.test(clean)) {
    throw new Error("Write something before posting.");
  }
  if (text.length > 20000) {
    throw new Error("Post is too long.");
  }
  return clean;
}
