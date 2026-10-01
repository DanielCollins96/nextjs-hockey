import { useRouter } from "next/router";
import { useQuery } from "react-query";
import SEO from "../../../components/SEO";
import ForumThread from "../../../components/forum/ForumThread";
import { findThreadIdByNumber } from "../../../lib/forum-api";
import { isThreadNumber } from "../../../lib/forum-numbers";

export default function ForumThreadPage() {
  const router = useRouter();
  const raw = String(router.query.id || "");
  const numeric = isThreadNumber(raw);
  const numbersQuery = useQuery(
    ["forum-thread-id", raw],
    () => findThreadIdByNumber(raw),
    { enabled: numeric }
  );
  const threadId = numeric ? numbersQuery.data : raw;
  const waiting = !router.isReady || (numeric && !numbersQuery.isFetched);
  const missing = numeric && numbersQuery.isFetched && !threadId;
  const path = `/forum/t/${raw || ""}`;
  const browsingPopular = router.isReady && router.query.feed === "popular";

  return (
    <div className={`mx-auto px-3 py-6 ${browsingPopular ? "max-w-6xl" : "max-w-3xl"}`}>
      <SEO title="Forum thread" description="Hockey forum thread" path={path} />
      {waiting && <p className="text-sm text-gray-500 dark:text-gray-400">Loading thread...</p>}
      {missing && <p className="text-gray-700 dark:text-gray-200">That thread does not exist.</p>}
      {!waiting && threadId && <ForumThread threadId={threadId} />}
    </div>
  );
}
