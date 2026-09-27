import { useEffect, useState } from "react";
import ImageModal from "../ImageModal";
import { resolveForumImages } from "../../lib/forum-media";

export default function ForumBody({ html }) {
  const [safeHtml, setSafeHtml] = useState("");
  const [media, setMedia] = useState(null);

  useEffect(() => {
    let active = true;
    resolveForumImages(html).then((clean) => {
      if (active) setSafeHtml(clean);
    });
    return () => {
      active = false;
    };
  }, [html]);

  const openMedia = (event) => {
    const node = event.target.closest?.("img, video");
    if (!node || !event.currentTarget.contains(node)) return;
    const src = node.currentSrc || node.getAttribute("src");
    if (!src) return;
    if (node.tagName === "VIDEO") node.pause();
    event.preventDefault();
    setMedia({
      src,
      alt: node.getAttribute("alt") || "",
      kind: node.tagName === "VIDEO" ? "video" : "native",
    });
  };

  if (!safeHtml) return null;

  return (
    <>
      <div
        className="prose prose-sm mt-2 max-w-none text-gray-800 dark:prose-invert dark:text-gray-100 [&_img]:max-h-96 [&_img]:cursor-zoom-in [&_video]:cursor-zoom-in"
        onClick={openMedia}
        dangerouslySetInnerHTML={{ __html: safeHtml }}
      />
      <ImageModal
        isOpen={Boolean(media)}
        onClose={() => setMedia(null)}
        src={media?.src || ""}
        alt={media?.alt || ""}
        kind={media?.kind || "native"}
      />
    </>
  );
}
