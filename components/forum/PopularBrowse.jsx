import Link from "next/link";
import { popularNeighbors } from "../../lib/forum-hot";
import { threadPath } from "../../lib/forum-numbers";

const POPULAR_SEARCH = { feed: "popular" };

function RankList({ threads, threadId }) {
  return (
    <nav aria-label="Popular ranks" className="max-h-[calc(100vh-2rem)] overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <h2 className="px-2 pb-1 text-[11px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">Popular</h2>
      <ol>
        {threads.map((thread, index) => {
          const current = thread.id === threadId;
          const score = thread.score || 0;
          return (
            <li key={thread.id}>
              <Link
                href={threadPath(thread, POPULAR_SEARCH)}
                title={thread.title}
                aria-current={current ? "page" : undefined}
                className={`flex items-center gap-2 rounded-md px-2 py-1.5 ${
                  current
                    ? "bg-gray-100 dark:bg-gray-800"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800/60"
                }`}
              >
                <span className="w-4 shrink-0 text-right text-[11px] tabular-nums text-gray-400 dark:text-gray-500">{index + 1}</span>
                <span className={`min-w-0 flex-1 truncate text-[13px] leading-5 ${current ? "font-semibold text-gray-950 dark:text-white" : "text-gray-800 dark:text-gray-200"}`}>
                  {thread.title}
                </span>
                <span className="shrink-0 text-right text-[11px] font-semibold tabular-nums leading-4 text-blue-700 dark:text-blue-300">
                  {score}
                  <span className="block font-normal text-gray-400 dark:text-gray-500">{score === 1 ? "upvote" : "upvotes"}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function NextCard({ thread, rank }) {
  if (!thread) {
    return (
      <p className="rounded-md border border-gray-200 p-3 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
        End of popular
      </p>
    );
  }
  return (
    <Link href={threadPath(thread, POPULAR_SEARCH)} className="block rounded-md border border-gray-200 bg-white p-3 hover:border-blue-400 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-500">
      <p className="text-[11px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-300">Next</p>
      <p className="mt-1 text-2xl font-bold tabular-nums leading-none text-gray-400 dark:text-gray-500">{rank}</p>
      {thread.image ? (
        <img src={thread.image} alt="" className="mt-2 h-28 w-full rounded object-cover" />
      ) : null}
      <p className="mt-2 text-sm font-semibold leading-snug text-gray-900 dark:text-gray-100">{thread.title}</p>
      {thread.excerpt ? (
        <p className="mt-1 line-clamp-4 text-xs leading-snug text-gray-600 dark:text-gray-300">{thread.excerpt}</p>
      ) : null}
      <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">
        {thread.score || 0} {(thread.score || 0) === 1 ? "upvote" : "upvotes"}
      </p>
    </Link>
  );
}

export default function PopularBrowse({ threads, threadId, children }) {
  const list = threads || [];
  const { index, next } = popularNeighbors(list, threadId);
  if (index < 0) return children;

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[14rem_minmax(0,1fr)_12.5rem]">
      <aside className="hidden lg:sticky lg:top-4 lg:block">
        <RankList threads={list} threadId={threadId} />
      </aside>
      <div className="min-w-0">{children}</div>
      <aside className="lg:sticky lg:top-4">
        <NextCard thread={next} rank={index + 2} />
      </aside>
    </div>
  );
}
