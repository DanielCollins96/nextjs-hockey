import { useEffect, useState } from "react";
import { sanitizeForumHtml } from "../../lib/forum-content";

export default function ForumBody({ html }) {
  const [safeHtml, setSafeHtml] = useState("");

  useEffect(() => {
    let active = true;
    sanitizeForumHtml(html).then((clean) => {
      if (active) setSafeHtml(clean);
    });
    return () => {
      active = false;
    };
  }, [html]);

  if (!safeHtml) return null;

  return (
    <div
      className="prose prose-sm mt-2 max-w-none text-gray-800 dark:prose-invert dark:text-gray-100"
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}
