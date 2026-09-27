import Link from "next/link";
import { boardById } from "../../lib/forum-boards";
import ForumTime from "./ForumTime";

export default function HotStrip({ threads }) {
  if (!threads?.length) return null;

  return (
    <section className="mb-6 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <h2 className="text-sm font-bold uppercase tracking-wide text-blue-700 dark:text-blue-300">
        Hot right now
      </h2>
      <ol className="mt-3 divide-y divide-gray-100 dark:divide-gray-700">
        {threads.map((thread) => {
          const board = boardById(thread.boardSlug);
          return (
            <li key={thread.id} className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link href={`/forum/t/${thread.id}`} className="font-semibold text-gray-900 hover:text-blue-700 dark:text-gray-100 dark:hover:text-blue-300">
                    {thread.title}
                  </Link>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {board?.title || "Forum"} · {thread.authorName} · <ForumTime value={thread.postedAt || thread.createdAt} />
                  </p>
                </div>
                <span className="shrink-0 text-sm font-semibold text-gray-700 dark:text-gray-200">
                  {thread.score || 0}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
