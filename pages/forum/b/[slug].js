import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useQuery } from "react-query";
import SEO from "../../../components/SEO";
import ForumComposer from "../../../components/forum/ForumComposer";
import ForumTime from "../../../components/forum/ForumTime";
import { useForumIdentity } from "../../../components/forum/useForumIdentity";
import { boardById } from "../../../lib/forum-boards";
import { createForumThread, explainForumError, loadBoardThreads } from "../../../lib/forum-api";

export default function ForumBoardPage() {
  const router = useRouter();
  const slug = String(router.query.slug || "");
  const definition = boardById(slug);
  const identity = useForumIdentity();
  const [extraThreads, setExtraThreads] = useState([]);
  const [cursor, setCursor] = useState(undefined);
  const [loadingMore, setLoadingMore] = useState(false);

  const query = useQuery(
    ["forum-board", slug],
    () => loadBoardThreads(slug),
    { enabled: Boolean(slug && definition) }
  );

  if (!router.isReady) {
    return <p className="mx-auto max-w-5xl px-3 py-6 text-sm text-gray-500 dark:text-gray-400">Loading board...</p>;
  }

  if (slug && !definition) {
    return <p className="mx-auto max-w-5xl px-3 py-6 text-gray-700 dark:text-gray-200">That board does not exist.</p>;
  }

  const board = query.data?.board || definition;
  const threads = [...(query.data?.threads || []), ...extraThreads];
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

      <div className="mt-5">
        <ForumComposer
          identity={identity}
          title="New thread"
          showTitle
          submitLabel="Create thread"
          placeholder="Start the thread..."
          onSubmit={async (draft) => {
            const thread = await createForumThread({
              boardSlug: definition.id,
              title: draft.title,
              body: draft.body,
              authorName: draft.authorName,
              authorId: draft.authorId,
            });
            if (thread?.id) router.push(`/forum/t/${thread.id}`);
          }}
        />
      </div>

      {query.isLoading && <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">Loading threads...</p>}
      {query.isError && (
        <p className="mt-6 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-200">
          {explainForumError(query.error)}
        </p>
      )}

      <ul className="mt-6 divide-y divide-gray-200 overflow-hidden rounded-lg border border-gray-200 bg-white dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-800">
        {threads.map((thread) => (
          <li key={thread.id} className="px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link href={`/forum/t/${thread.id}`} className="font-semibold text-gray-900 hover:text-blue-700 dark:text-gray-100 dark:hover:text-blue-300">
                  {thread.title}
                </Link>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {thread.authorName} · {thread.replyCount || 0} replies · <ForumTime value={thread.lastActivityAt || thread.postedAt} />
                </p>
              </div>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{thread.score || 0}</span>
            </div>
          </li>
        ))}
        {!query.isLoading && threads.length === 0 && (
          <li className="px-4 py-6 text-sm text-gray-600 dark:text-gray-300">No threads yet.</li>
        )}
      </ul>
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
