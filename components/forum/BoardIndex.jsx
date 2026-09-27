import Link from "next/link";
import { boardCommentCount } from "../../lib/forum-api";
import { FORUM_SECTIONS, gamesForTeam } from "../../lib/forum-boards";
import ForumTime, { isRecent } from "./ForumTime";
import GameThreadLinks from "./GameThreadLinks";

function Count({ label, value }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
      <span className="font-semibold text-gray-800 dark:text-gray-100">{value || 0}</span>
      {label}
    </span>
  );
}

export default function BoardIndex({ boards, games = [] }) {
  return (
    <div className="space-y-6">
      {FORUM_SECTIONS.map((section) => {
        const rows = (boards || []).filter((board) => board.section === section.id);
        if (!rows.length) return null;
        return (
          <section key={section.id} className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <h2 className="border-b border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold uppercase tracking-wide text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
              {section.title}
            </h2>
            <ul>
              {rows.map((board) => {
                const teamGames = gamesForTeam(games, board.teamAbbrev);
                return (
                <li key={board.id} className="border-b border-gray-100 px-4 py-3 last:border-b-0 dark:border-gray-700">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link href={`/forum/b/${board.id}`} className="font-semibold text-gray-900 hover:text-blue-700 dark:text-gray-100 dark:hover:text-blue-300">
                          {board.title}
                        </Link>
                        {isRecent(board.lastPostAt) && (
                          <span className="rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                            New
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{board.description}</p>
                      <div className="mt-2 flex gap-3">
                        <Count label="threads" value={board.threadCount} />
                        <Count label="comments" value={boardCommentCount(board)} />
                      </div>
                      <GameThreadLinks games={teamGames} abbreviation={board.teamAbbrev} />
                    </div>
                    <div className="sm:max-w-xs sm:text-right">
                      {board.lastPostTitle ? (
                        <>
                          {board.lastThreadId ? (
                            <Link href={`/forum/t/${board.lastThreadId}`} className="block truncate text-sm font-medium text-gray-900 hover:text-blue-700 dark:text-gray-100 dark:hover:text-blue-300">
                              {board.lastPostTitle}
                            </Link>
                          ) : (
                            <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{board.lastPostTitle}</p>
                          )}
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {board.lastPostAuthor} · <ForumTime value={board.lastPostAt} />
                          </p>
                        </>
                      ) : (
                        <p className="text-xs text-gray-500 dark:text-gray-400">No posts yet</p>
                      )}
                    </div>
                  </div>
                </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
