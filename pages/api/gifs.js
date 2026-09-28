import { forumUserFromIdToken } from "../../lib/forum-aws";
import { FORUM_GIF_SEARCHES_PER_DAY, isForumImageUrl } from "../../lib/forum-content";
import { releaseDailyQuota, reserveDailyQuota } from "../../lib/forum-quota";

const cache = new Map();
const CACHE_MS = 10 * 60 * 1000;

function gifFromTenor(item) {
  const formats = item?.media_formats || {};
  const src = formats.gif?.url || formats.mediumgif?.url || "";
  const preview = formats.tinygif?.url || formats.nanogif?.url || src;
  if (!isForumImageUrl(src) || !isForumImageUrl(preview)) return null;
  return { src, preview, alt: item.content_description || "GIF" };
}

function gifFromGiphy(item) {
  const images = item?.images || {};
  const src = images.original?.url || images.fixed_height?.url || "";
  const preview = images.fixed_height_small?.url || images.fixed_height?.url || src;
  if (!isForumImageUrl(src) || !isForumImageUrl(preview)) return null;
  return { src, preview, alt: item.title || "GIF" };
}

async function searchTenor(query, key) {
  const url = new URL("https://tenor.googleapis.com/v2/search");
  url.searchParams.set("q", query);
  url.searchParams.set("key", key);
  url.searchParams.set("client_key", "hocke-forum");
  url.searchParams.set("limit", "16");
  url.searchParams.set("media_filter", "gif,tinygif");
  const response = await fetch(url);
  if (!response.ok) throw new Error("GIF search failed.");
  const data = await response.json();
  return (data.results || []).map(gifFromTenor).filter(Boolean);
}

async function searchGiphy(query, key) {
  const url = new URL("https://api.giphy.com/v1/gifs/search");
  url.searchParams.set("api_key", key);
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "16");
  url.searchParams.set("rating", "pg-13");
  const response = await fetch(url);
  if (!response.ok) throw new Error("GIF search failed.");
  const data = await response.json();
  return (data.data || []).map(gifFromGiphy).filter(Boolean);
}

function cachedGifs(query) {
  const hit = cache.get(query);
  if (!hit || hit.expires < Date.now()) {
    cache.delete(query);
    return null;
  }
  return hit.gifs;
}

function rememberGifs(query, gifs) {
  if (cache.size > 100) {
    const oldest = cache.keys().next().value;
    cache.delete(oldest);
  }
  cache.set(query, { gifs, expires: Date.now() + CACHE_MS });
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const tenorKey = process.env.TENOR_API_KEY;
  const giphyKey = process.env.GIPHY_API_KEY;
  if (!tenorKey && !giphyKey) {
    return res.status(200).json({ configured: false, gifs: [] });
  }

  const token = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  const user = token ? await forumUserFromIdToken(token).catch(() => null) : null;
  if (!user) return res.status(401).json({ configured: true, error: "Log in to search GIFs." });

  const query = String(req.query.q || "").trim().slice(0, 50);
  if (!query) return res.status(200).json({ configured: true, gifs: [] });

  const cached = cachedGifs(query.toLowerCase());
  if (cached) return res.status(200).json({ configured: true, gifs: cached });

  const reservation = await reserveDailyQuota(token, user.username, "gif", FORUM_GIF_SEARCHES_PER_DAY);
  if (!reservation) {
    return res.status(429).json({ configured: true, error: "GIF search is limited for today. Paste a GIF link instead." });
  }

  try {
    const gifs = tenorKey
      ? await searchTenor(query, tenorKey)
      : await searchGiphy(query, giphyKey);
    rememberGifs(query.toLowerCase(), gifs);
    return res.status(200).json({ configured: true, gifs });
  } catch {
    await releaseDailyQuota(token, reservation);
    return res.status(502).json({ configured: true, error: "GIF search is unavailable. Paste a GIF link instead." });
  }
}
