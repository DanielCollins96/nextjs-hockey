import { useEffect } from "react";
import { useQuery } from "react-query";
import SEO from "../../components/SEO";
import BoardIndex from "../../components/forum/BoardIndex";
import HotStrip from "../../components/forum/HotStrip";
import { useForumIdentity } from "../../components/forum/useForumIdentity";
import { ensureForumBoards, explainForumError, loadForumHome, mergeBoards } from "../../lib/forum-api";

export default function ForumHomePage() {
  const identity = useForumIdentity();
  const query = useQuery("forum-home", loadForumHome);
  const { refetch } = query;

  useEffect(() => {
    if (!identity.user?.username) return undefined;
    let cancelled = false;
    ensureForumBoards()
      .then(() => {
        if (!cancelled) return refetch();
        return null;
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [identity.user?.username, refetch]);

  return (
    <div className="mx-auto max-w-5xl px-3 py-6">
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
            <BoardIndex boards={mergeBoards([])} />
          </div>
        </div>
      )}
      {query.data && (
        <div className="mt-6">
          <HotStrip threads={query.data.hotThreads} />
          <BoardIndex boards={query.data.boards} />
        </div>
      )}
    </div>
  );
}
