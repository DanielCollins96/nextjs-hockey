import { useEffect, useMemo, useRef, useState } from "react";
import { API, graphqlOperation } from "aws-amplify";
import { useQuery } from "react-query";
import { formatDistance } from "date-fns";
import toast from "react-hot-toast";
import { FaTrashAlt } from "react-icons/fa";

import { UseAuth } from "../contexts/Auth";
import * as queries from "../src/graphql/queries";
import * as mutations from "../src/graphql/mutations";
import ConfirmDialog from "./ConfirmDialog";

function formatThreadSubject(subject, prefix) {
  if (!subject) return "General";
  if (subject.startsWith(prefix)) {
    const cleaned = subject.slice(prefix.length).trim();
    return cleaned || "General";
  }
  return subject;
}

export default function ThreadMessageBoard({
  threadType,
  threadId,
  title,
  emptyMessage = "No posts yet.",
  anchorId = "thread",
}) {
  const { user } = UseAuth();
  const sectionRef = useRef(null);
  const [search, setSearch] = useState("");
  const [post, setPost] = useState({ name: "", subject: "", content: "" });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletingPostId, setDeletingPostId] = useState(null);

  const normalizedType = String(threadType || "").toUpperCase();
  const normalizedId = String(threadId || "");
  const threadPrefix = useMemo(
    () => `THREAD#${normalizedType}#${normalizedId}#`,
    [normalizedType, normalizedId]
  );

  const fetchPosts = async () => {
    const result = await API.graphql(
      graphqlOperation(queries.listPosts, {
        limit: 500,
        filter: {
          subject: {
            beginsWith: threadPrefix,
          },
        },
      })
    );
    const items = result?.data?.listPosts?.items || [];

    return items
      .filter((item) => !item?._deleted)
      .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));
  };

  const {
    data: posts = [],
    isLoading,
    error,
    refetch,
  } = useQuery(["thread-posts", threadPrefix, user?.username], fetchPosts, {
    enabled: Boolean(normalizedType && normalizedId && user?.username),
  });

  const filteredPosts = posts.filter((entry) => {
    const term = search.toLowerCase();
    if (!term) return true;

    return (
      (entry.content || "").toLowerCase().includes(term) ||
      formatThreadSubject(entry.subject, threadPrefix).toLowerCase().includes(term) ||
      (entry.name || "").toLowerCase().includes(term)
    );
  });

  const updateField = (event) => {
    const { name, value } = event.target;
    setPost((current) => ({ ...current, [name]: value }));
  };

  const savePost = async () => {
    if (!user?.username) {
      toast.error("Log in to post in this thread.");
      return;
    }

    const trimmedContent = post.content?.trim();
    const trimmedSubject = post.subject?.trim();
    const trimmedName = post.name?.trim();

    if (!trimmedContent) {
      toast.error("Post content is required.");
      return;
    }

    setSaving(true);
    try {
      const authorName = trimmedName || user?.attributes?.email || user?.username || "Member";

      await API.graphql(
        graphqlOperation(mutations.createPost, {
          input: {
            userId: user.username,
            name: authorName,
            subject: `${threadPrefix}${trimmedSubject || "General"}`,
            content: trimmedContent,
          },
        })
      );

      setPost({ name: "", subject: "", content: "" });
      toast.success("Post added");
      refetch();
    } catch (requestError) {
      toast.error("Unable to save post");
      console.error(requestError);
    } finally {
      setSaving(false);
    }
  };

  const requestDeletePost = (id, version) => {
    if (!id || !version) return;
    setDeleteTarget({id, version});
  };

  const deletePost = async () => {
    if (!deleteTarget?.id || !deleteTarget?.version) return;

    setDeletingPostId(deleteTarget.id);
    try {
      await API.graphql(
        graphqlOperation(mutations.deletePost, {
          input: { id: deleteTarget.id, _version: deleteTarget.version },
        })
      );
      toast.success("Post deleted");
      setDeleteTarget(null);
      refetch();
    } catch (requestError) {
      toast.error("Unable to delete post");
      console.error(requestError);
    } finally {
      setDeletingPostId(null);
    }
  };

  useEffect(() => {
    if (!user?.username) return;

    const targetHash = `#${anchorId}`;
    if (window.location.hash !== targetHash) return;

    const timer = window.setTimeout(() => {
      sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);

    return () => window.clearTimeout(timer);
  }, [anchorId, user?.username]);

  if (!user?.username) {
    return null;
  }

  return (
    <section
      id={anchorId}
      ref={sectionRef}
      className="scroll-mt-24 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-5"
    >
      <h2 className="text-lg font-semibold dark:text-white mb-3">{title}</h2>

      <div className="mb-3">
        <input
          type="search"
          name="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search thread"
          className="w-full max-w-md px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white"
        />
      </div>

      {error && (
        <p className="mb-3 text-red-600 dark:text-red-400">Could not load posts for this thread.</p>
      )}

      {isLoading ? (
        <p className="text-gray-500 dark:text-gray-400 mb-4">Loading posts...</p>
      ) : filteredPosts.length ? (
        <div className="space-y-2 mb-4">
          {filteredPosts.map((entry) => {
            const canDelete = entry.userId === user.username;
            return (
              <article key={entry.id} className="rounded border border-gray-200 dark:border-gray-700 px-3 py-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium dark:text-white">{formatThreadSubject(entry.subject, threadPrefix)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {entry.name || "Member"} · {formatDistance(new Date(entry.createdAt), new Date())} ago
                    </p>
                  </div>
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => requestDeletePost(entry.id, entry._version)}
                      disabled={deletingPostId === entry.id}
                      aria-label="Delete post"
                      title="Delete post"
                      className="inline-flex items-center justify-center h-8 w-8 rounded border border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20 disabled:opacity-70"
                    >
                      {deletingPostId === entry.id ? "..." : <FaTrashAlt className="h-3.5 w-3.5" />}
                    </button>
                  )}
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm dark:text-gray-100">{entry.content}</p>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400 mb-4">{emptyMessage}</p>
      )}

      <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
        <h3 className="font-medium dark:text-white mb-2">Add comment</h3>
        <div className="grid gap-2">
          <input
            type="text"
            name="name"
            value={post.name}
            onChange={updateField}
            placeholder="Display name (optional)"
            className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white"
          />
          <input
            type="text"
            name="subject"
            value={post.subject}
            onChange={updateField}
            placeholder="Subject (optional)"
            className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white"
          />
          <textarea
            name="content"
            rows="3"
            value={post.content}
            onChange={updateField}
            placeholder="Share your take"
            className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white"
          />
          <div>
            <button
              type="button"
              onClick={savePost}
              disabled={saving}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-70"
            >
              {saving ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      </div>
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Post"
        message="Are you sure you want to delete this post? This cannot be undone."
        confirmText="Delete"
        isLoading={!!deletingPostId}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={deletePost}
      />
    </section>
  );
}
