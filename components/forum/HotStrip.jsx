import Link from "next/link";
import { boardById } from "../../lib/forum-boards";
import { threadPath } from "../../lib/forum-numbers";
import ForumTime from "./ForumTime";

function postCount(thread) {
  return (thread.replyCount || 0) + 1;
}

function CompactStrip({ threads, heading }) {
  return (
    <section>
      <h2 className="text-[11px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {heading}
      </h2>
      <ol className="mt-1">
        {threads.map((thread) => {
          const board = boardById(thread.boardSlug);
          return (
            <li key={thread.id} className="border-b border-gray-100 py-2 last:border-b-0 dark:border-gray-700">
              <Link href={threadPath(thread)} className="block text-[13px] font-semibold leading-snug text-gray-900 hover:text-blue-700 dark:text-gray-100 dark:hover:text-blue-300">
                {thread.title}
              </Link>
              <p className="mt-0.5 text-[11px] leading-snug text-gray-500 dark:text-gray-400">
                Latest: {thread.lastPostAuthor || thread.authorName}
                {" · "}
                <ForumTime value={thread.lastActivityAt || thread.postedAt || thread.createdAt} />
              </p>
              <Link href={`/forum/b/${thread.boardSlug}`} className="text-[11px] text-gray-600 underline decoration-gray-300 underline-offset-2 hover:text-blue-700 dark:text-gray-300 dark:hover:text-blue-300">
                {board?.title || "Forum"}
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export default function HotStrip({ threads, heading = "Latest posts", linkSearch = null, numbered = false, compact = false }) {
  if (!threads?.length) return null;
  if (compact) return <CompactStrip threads={threads} heading={heading} />;

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <h2 className="text-sm font-bold uppercase tracking-wide text-blue-700 dark:text-blue-300">
        {heading}
      </h2>
      <ol className="mt-3 divide-y divide-gray-100 dark:divide-gray-700">
        {threads.map((thread, index) => {
          const board = boardById(thread.boardSlug);
          const posts = postCount(thread);
          return (
            <li key={thread.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-3 gap-y-1 py-3 first:pt-0 last:pb-0">
              <Link href={threadPath(thread, linkSearch)} className="break-words font-semibold text-gray-900 hover:text-blue-700 dark:text-gray-100 dark:hover:text-blue-300">
                {numbered ? <span className="mr-2 tabular-nums text-gray-500 dark:text-gray-400">{index + 1}</span> : null}
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
    </section>
  );
}
