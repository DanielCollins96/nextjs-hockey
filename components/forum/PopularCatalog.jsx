import { useState } from "react";
import Link from "next/link";
import { boardById } from "../../lib/forum-boards";
import { POPULAR_PAGE_SIZE } from "../../lib/forum-hot";
import { threadPath } from "../../lib/forum-numbers";
import ForumTime from "./ForumTime";

function Pager({ page, pages, onPage }) {
  if (pages < 2) return null;
  const nearby = [page - 1, page, page + 1].filter((item) => item >= 0 && item < pages);
  const buttons = [
    { label: "First", target: 0, disabled: page === 0 },
    ...nearby.map((item) => ({ label: String(item + 1), target: item, current: item === page })),
    { label: "Last", target: pages - 1, disabled: page === pages - 1 },
    { label: "Next", target: page + 1, disabled: page >= pages - 1 },
  ];
  return (
    <nav aria-label="Popular pages" className="flex flex-wrap items-center gap-1.5">
      {buttons.map((button) => (
        <button
          key={`${button.label}-${button.target}`}
          type="button"
          disabled={button.disabled}
          onClick={() => onPage(button.target)}
          className={
            button.label === "Next" && !button.disabled
              ? "rounded bg-blue-600 px-2 py-1 text-xs font-bold text-white hover:bg-blue-700"
              : button.current
                ? "rounded bg-gray-900 px-2 py-1 text-xs font-bold text-white dark:bg-gray-100 dark:text-gray-900"
                : "rounded px-2 py-1 text-xs font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-40 dark:text-gray-200 dark:hover:bg-gray-700"
          }
        >
          {button.label}
        </button>
      ))}
    </nav>
  );
}

export default function PopularCatalog({ threads }) {
  const [page, setPage] = useState(0);
  const list = threads || [];
  if (!list.length) return null;
  const pages = Math.ceil(list.length / POPULAR_PAGE_SIZE);
  const current = Math.min(page, pages - 1);
  const slice = list.slice(current * POPULAR_PAGE_SIZE, (current + 1) * POPULAR_PAGE_SIZE);

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-700 dark:text-gray-200">Popular</h2>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Ranked by upvotes</p>
        </div>
        <Pager page={current} pages={pages} onPage={setPage} />
      </div>
      <ol className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {slice.map((thread, index) => {
          const rank = current * POPULAR_PAGE_SIZE + index + 1;
          const board = boardById(thread.boardSlug);
          const replies = thread.replyCount || 0;
          const score = thread.score || 0;
          return (
            <li key={thread.id}>
              <Link
                href={threadPath(thread, { feed: "popular" })}
                className="group flex h-full gap-2 rounded-md border border-gray-200 bg-white p-2 hover:border-blue-400 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-500"
              >
                <span className="w-6 shrink-0 text-center text-lg font-bold tabular-nums leading-none text-gray-400 dark:text-gray-500">
                  {rank}
                </span>
                <span className="flex w-10 shrink-0 flex-col items-center justify-center text-blue-700 dark:text-blue-300">
                  <span className="text-sm font-bold tabular-nums leading-none">{score}</span>
                  <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-wide">{score === 1 ? "upvote" : "upvotes"}</span>
                </span>
                {thread.image ? (
                  <img src={thread.image} alt="" className="h-16 w-16 shrink-0 rounded object-cover" />
                ) : null}
                <span className="min-w-0">
                  <span className="block text-sm font-semibold leading-snug text-gray-900 group-hover:text-blue-700 dark:text-gray-100 dark:group-hover:text-blue-300">
                    {thread.title}
                  </span>
                  {thread.excerpt ? (
                    <span className="mt-1 line-clamp-3 block text-xs leading-snug text-gray-600 dark:text-gray-300">
                      {thread.excerpt}
                    </span>
                  ) : null}
                  <span className="mt-1 block text-[11px] text-gray-500 dark:text-gray-400">
                    {replies} {replies === 1 ? "reply" : "replies"}
                    {" · "}
                    Latest: {thread.lastPostAuthor || thread.authorName}
                    {" · "}
                    <ForumTime value={thread.lastActivityAt || thread.postedAt || thread.createdAt} />
                  </span>
                  <span className="mt-0.5 block text-[11px] text-gray-600 underline decoration-gray-300 underline-offset-2 dark:text-gray-300">
                    {board?.title || "Forum"}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
