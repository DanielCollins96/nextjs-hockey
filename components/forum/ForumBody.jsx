import { useEffect, useRef, useState } from "react";
import ImageModal from "../ImageModal";
import { resolveForumImages } from "../../lib/forum-media";

export default function ForumBody({ html }) {
  const bodyRef = useRef(null);
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

  useEffect(() => {
    const root = bodyRef.current;
    if (!root) return;
    root.querySelectorAll("img").forEach((node) => {
      node.setAttribute("tabindex", "0");
      node.setAttribute("role", "button");
      if (!node.getAttribute("aria-label")) {
        node.setAttribute("aria-label", node.getAttribute("alt") || "Open media");
      }
    });
  }, [safeHtml]);

  const openMedia = (event) => {
    if (event.target.closest?.("video")) return;
    const node = event.target.closest?.("img");
    if (!node || !event.currentTarget.contains(node)) return;
    const src = node.currentSrc || node.getAttribute("src");
    if (!src) return;
    event.preventDefault();
    setMedia({
      src,
      alt: node.getAttribute("alt") || "",
      kind: "native",
    });
  };

  if (!safeHtml) return null;

  return (
    <>
      <div
        ref={bodyRef}
        className="prose prose-sm mt-2 max-w-none text-gray-800 dark:prose-invert dark:text-gray-100"
        onClick={openMedia}
        onKeyDown={(event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          openMedia(event);
        }}
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
