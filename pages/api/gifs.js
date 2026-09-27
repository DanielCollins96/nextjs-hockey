import { isForumImageUrl } from "../../lib/forum-content";

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

  const query = String(req.query.q || "").trim().slice(0, 50);
  if (!query) return res.status(200).json({ configured: true, gifs: [] });

  try {
    const gifs = tenorKey
      ? await searchTenor(query, tenorKey)
      : await searchGiphy(query, giphyKey);
    return res.status(200).json({ configured: true, gifs });
  } catch {
    return res.status(502).json({ configured: true, error: "GIF search is unavailable. Paste a GIF link instead." });
  }
}
