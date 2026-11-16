import { useQuery } from "react-query";
import SEO from "../../components/SEO";
import BoardIndex from "../../components/forum/BoardIndex";
import HotStrip from "../../components/forum/HotStrip";
import PopularCatalog from "../../components/forum/PopularCatalog";
import { calendarDateString } from "../../lib/format";
import { explainForumError, loadForumHome, mergeBoards } from "../../lib/forum-api";

export default function ForumHomePage() {
  const today = calendarDateString();
  const query = useQuery("forum-home", loadForumHome);
  const gamesQuery = useQuery(["forum-games", today], async () => {
    const response = await fetch(`/api/games?date=${today}`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.games || [];
  });

  return (
    <div className="mx-auto max-w-6xl px-3 py-6">
      <SEO
        title="Hockey Forum"
        description="NHL discussion boards for teams, trades, the draft, and game threads."
        path="/forum"
      />
      <h1 className="text-3xl font-bold text-gray-950 dark:text-white">Forum</h1>
      <p className="mt-2 max-w-2xl text-gray-600 dark:text-gray-300">
        Team boards, general hockey talk, and a game thread for every game.
      </p>
      {query.isLoading && <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">Loading boards...</p>}
      {query.isError && (
        <div className="mt-6">
          <p className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-200">
            {explainForumError(query.error)}
          </p>
          <div className="mt-4">
            <BoardIndex boards={mergeBoards([])} games={gamesQuery.data} />
          </div>
        </div>
      )}
      {query.data && (
        <div className="mt-6 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_12.5rem] lg:gap-x-5">
          <div className="min-w-0 lg:col-start-1">
            <PopularCatalog threads={query.data.popularFeed} />
          </div>
          <aside className="mt-6 lg:sticky lg:top-4 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-0">
            <HotStrip threads={query.data.hotThreads} compact />
          </aside>
          <div className="mt-6 min-w-0 lg:col-start-1 lg:mt-0">
            <BoardIndex boards={query.data.boards} games={gamesQuery.data} />
          </div>
        </div>
      )}
    </div>
  );
}
