import Link from "next/link";
import { useQuery } from "react-query";
import { loadBoardThreads, loadThreadNumberMap, explainForumError } from "../../lib/forum-api";
import { threadPath } from "../../lib/forum-numbers";
import { teamBoardId } from "../../lib/forum-boards";
import ForumTime from "./ForumTime";

export default function TeamBoardPreview({ abbreviation, teamName }) {
  const boardId = teamBoardId(abbreviation);
  const query = useQuery(
    ["team-board", boardId],
    () => loadBoardThreads(boardId),
    { enabled: Boolean(boardId) }
  );
  const numbersQuery = useQuery("forum-thread-numbers", loadThreadNumberMap);

  if (!boardId) return null;

  const threads = (query.data?.threads || []).slice(0, 5);

  return (
    <section className="mt-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{teamName} board</h2>
        <Link href={`/forum/b/${boardId}`} className="text-sm font-medium text-blue-700 hover:underline dark:text-blue-300">
          Open board
        </Link>
      </div>
      {query.isLoading && (
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Loading threads...</p>
      )}
      {query.isError && (
        <p className="mt-3 text-sm text-red-700 dark:text-red-300">{explainForumError(query.error)}</p>
      )}
      {!query.isLoading && !query.isError && threads.length === 0 && (
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">No threads yet.</p>
      )}
      <ul className="mt-3 divide-y divide-gray-100 dark:divide-gray-700">
        {threads.map((thread) => (
          <li key={thread.id} className="py-2">
            <Link href={threadPath({ ...thread, number: numbersQuery.data?.[thread.id] })} className="font-medium text-gray-900 hover:text-blue-700 dark:text-gray-100 dark:hover:text-blue-300">
              {thread.title}
            </Link>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {thread.replyCount || 0} {(thread.replyCount || 0) === 1 ? "comment" : "comments"} · <ForumTime value={thread.lastActivityAt || thread.postedAt} />
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
