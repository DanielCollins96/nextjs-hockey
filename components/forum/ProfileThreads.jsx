import Link from "next/link";
import { useQuery } from "react-query";
import { explainForumError, loadAuthorThreads } from "../../lib/forum-api";
import { boardById } from "../../lib/forum-boards";
import ForumTime from "./ForumTime";

export default function ProfileThreads({ username }) {
  const query = useQuery(
    ["profile-forum-threads", username],
    () => loadAuthorThreads(username),
    { enabled: Boolean(username) }
  );

  if (query.isLoading) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">Loading forum threads...</p>;
  }

  if (query.isError) {
    return <p className="text-sm text-red-700 dark:text-red-300">{explainForumError(query.error)}</p>;
  }

  if (!query.data?.length) {
    return <p className="text-sm text-gray-600 dark:text-gray-300">You have not started a forum thread yet.</p>;
  }

  return (
    <ul className="divide-y divide-gray-100 dark:divide-gray-700">
      {query.data.map((thread) => (
        <li key={thread.id} className="py-3">
          <Link href={`/forum/t/${thread.id}`} className="font-semibold text-gray-900 hover:text-blue-700 dark:text-gray-100 dark:hover:text-blue-300">
            {thread.title}
          </Link>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {boardById(thread.boardSlug)?.title || "Forum"} · {thread.replyCount || 0} replies · <ForumTime value={thread.postedAt || thread.createdAt} />
          </p>
        </li>
      ))}
    </ul>
  );
}
