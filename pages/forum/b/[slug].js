import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useQuery } from "react-query";
import SEO from "../../../components/SEO";
import BoardThread from "../../../components/forum/BoardThread";
import ForumComposer from "../../../components/forum/ForumComposer";
import { useForumIdentity } from "../../../components/forum/useForumIdentity";
import GameThreadLinks from "../../../components/forum/GameThreadLinks";
import { boardById } from "../../../lib/forum-boards";
import { calendarDateString } from "../../../lib/format";
import { createForumThread, explainForumError, loadBoardThreads, loadThreadNumberMap } from "../../../lib/forum-api";

export default function ForumBoardPage() {
  const router = useRouter();
  const slug = String(router.query.slug || "");
  const definition = boardById(slug);
  const identity = useForumIdentity();
  const [extraThreads, setExtraThreads] = useState([]);
  const [cursor, setCursor] = useState(undefined);
  const [loadingMore, setLoadingMore] = useState(false);
  const [writing, setWriting] = useState(false);

  const today = calendarDateString();
  const query = useQuery(
    ["forum-board", slug],
    () => loadBoardThreads(slug),
    { enabled: Boolean(slug && definition) }
  );
  const numbersQuery = useQuery("forum-thread-numbers", loadThreadNumberMap);
  const gamesQuery = useQuery(
    ["forum-games", today],
    async () => {
      const response = await fetch(`/api/games?date=${today}`);
      if (!response.ok) return [];
      const data = await response.json();
      return data.games || [];
    },
    { enabled: definition?.section === "team" }
  );

  if (!router.isReady) {
    return <p className="mx-auto max-w-5xl px-3 py-6 text-sm text-gray-500 dark:text-gray-400">Loading board...</p>;
  }

  if (slug && !definition) {
    return <p className="mx-auto max-w-5xl px-3 py-6 text-gray-700 dark:text-gray-200">That board does not exist.</p>;
  }

  const board = query.data?.board || definition;
  const threads = [...(query.data?.threads || []), ...extraThreads].map((thread) => ({
    ...thread,
    number: thread.number || numbersQuery.data?.[thread.id],
  }));
  const moreToken = cursor === undefined ? query.data?.nextToken : cursor;

  const loadMore = async () => {
    if (!moreToken || loadingMore) return;
    setLoadingMore(true);
    try {
      const page = await loadBoardThreads(slug, moreToken);
      setExtraThreads((current) => [...current, ...(page?.threads || [])]);
      setCursor(page?.nextToken || null);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-3 py-6">
      <SEO
        title={board?.title || "Forum"}
        description={board?.description || "Hockey discussion"}
        path={`/forum/b/${slug}`}
      />
      <p className="text-sm text-gray-500 dark:text-gray-400">
        <Link href="/forum" className="hover:underline">Forum</Link>
      </p>
      <h1 className="mt-2 text-3xl font-bold text-gray-950 dark:text-white">{board?.title}</h1>
      <p className="mt-2 text-gray-600 dark:text-gray-300">{board?.description}</p>
      <GameThreadLinks games={gamesQuery.data} abbreviation={definition?.teamAbbrev} />

      <div className="mt-5">
        {writing ? (
          <ForumComposer
            identity={identity}
            title="New thread"
            showTitle
            submitLabel="Create thread"
            placeholder="Start the thread..."
            onCancel={() => setWriting(false)}
            onSubmit={async (draft) => {
              const thread = await createForumThread({
                boardSlug: definition.id,
                title: draft.title,
                body: draft.body,
              });
              if (thread?.id) router.push(`/forum/t/${thread.number || thread.id}`);
            }}
          />
        ) : (
          <button
            type="button"
            onClick={() => setWriting(true)}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            New thread
          </button>
        )}
      </div>

      {query.isLoading && <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">Loading threads...</p>}
      {query.isError && (
        <p className="mt-6 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-200">
          {explainForumError(query.error)}
        </p>
      )}

      <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        {threads.map((thread) => (
          <BoardThread key={thread.id} thread={thread} />
        ))}
        {!query.isLoading && threads.length === 0 && (
          <p className="px-4 py-6 text-sm text-gray-600 dark:text-gray-300">No threads yet.</p>
        )}
      </div>
      {moreToken && (
        <button
          type="button"
          onClick={loadMore}
          disabled={loadingMore}
          className="mt-4 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-70 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-800"
        >
          {loadingMore ? "Loading..." : "Older threads"}
        </button>
      )}
    </div>
  );
}
