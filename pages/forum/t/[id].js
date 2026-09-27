import { useRouter } from "next/router";
import { useQuery } from "react-query";
import SEO from "../../../components/SEO";
import ForumThread from "../../../components/forum/ForumThread";
import { loadThreadNumberMap } from "../../../lib/forum-api";
import { isThreadNumber, threadIdForNumber } from "../../../lib/forum-numbers";

export default function ForumThreadPage() {
  const router = useRouter();
  const raw = String(router.query.id || "");
  const numeric = isThreadNumber(raw);
  const numbersQuery = useQuery("forum-thread-numbers", loadThreadNumberMap, { enabled: numeric });
  const threadId = numeric ? threadIdForNumber(numbersQuery.data, raw) : raw;
  const waiting = !router.isReady || (numeric && !numbersQuery.isFetched);
  const missing = numeric && numbersQuery.isFetched && !threadId;
  const path = `/forum/t/${raw || ""}`;

  return (
    <div className="mx-auto max-w-3xl px-3 py-6">
      <SEO title="Forum thread" description="Hockey forum thread" path={path} />
      {waiting && <p className="text-sm text-gray-500 dark:text-gray-400">Loading thread...</p>}
      {missing && <p className="text-gray-700 dark:text-gray-200">That thread does not exist.</p>}
      {!waiting && threadId && <ForumThread threadId={threadId} />}
    </div>
  );
}
