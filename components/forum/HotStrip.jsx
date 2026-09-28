import Link from "next/link";
import { boardById } from "../../lib/forum-boards";
import { threadPath } from "../../lib/forum-numbers";
import ForumTime from "./ForumTime";

function postCount(thread) {
  return (thread.replyCount || 0) + 1;
}

export default function HotStrip({ threads }) {
  if (!threads?.length) return null;

  return (
    <aside className="order-1 h-fit rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 lg:sticky lg:top-4 lg:order-2">
      <h2 className="text-sm font-bold uppercase tracking-wide text-blue-700 dark:text-blue-300">
        Hot right now
      </h2>
      <ol className="mt-3 divide-y divide-gray-100 dark:divide-gray-700">
        {threads.map((thread) => {
          const board = boardById(thread.boardSlug);
          const posts = postCount(thread);
          return (
            <li key={thread.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-3 gap-y-1 py-3 first:pt-0 last:pb-0">
              <Link href={threadPath(thread)} className="break-words font-semibold text-gray-900 hover:text-blue-700 dark:text-gray-100 dark:hover:text-blue-300">
                {thread.title}
              </Link>
              <p className="whitespace-nowrap text-right text-xs tabular-nums text-gray-500 dark:text-gray-400">
                <ForumTime value={thread.lastActivityAt || thread.postedAt || thread.createdAt} />
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {thread.number ? (
                  <span className="font-semibold tabular-nums text-gray-700 dark:text-gray-200">#{thread.number}</span>
                ) : null}
                {thread.number ? " · " : ""}
                {board?.title || "Forum"} · {thread.authorName}
              </p>
              <p className="text-right text-xs font-semibold tabular-nums text-gray-700 dark:text-gray-200">
                {thread.score || 0} {(thread.score || 0) === 1 ? "upvote" : "upvotes"}
              </p>
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                {posts} {posts === 1 ? "post" : "posts"}
              </p>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
