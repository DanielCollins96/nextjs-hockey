import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { FaTrashAlt } from "react-icons/fa";
import { useQuery, useQueryClient } from "react-query";
import toast from "react-hot-toast";

import { boardById, gameThreadId, gameThreadTitle } from "../../lib/forum-boards";
import {
  createForumReply,
  deleteOwnReply,
  deleteOwnThread,
  ensureGameThread,
  explainForumError,
  incrementThreadView,
  isForumOwner,
  loadThread,
  loadVotes,
  nestReplies,
  toggleVote,
} from "../../lib/forum-api";
import { isForumDeleted } from "../../lib/forum-content";
import { postNumbers, threadPath } from "../../lib/forum-numbers";
import ConfirmDialog from "../ConfirmDialog";
import ForumBody from "./ForumBody";
import ForumComposer from "./ForumComposer";
import ForumTime from "./ForumTime";
import { useForumIdentity } from "./useForumIdentity";

function VoteButton({ active, score, disabled, onClick }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold ${
        active
          ? "border-blue-600 bg-blue-600 text-white"
          : "border-gray-300 text-gray-700 hover:border-blue-400 dark:border-gray-600 dark:text-gray-200"
      } disabled:opacity-50`}
    >
      Upvote {score || 0}
    </button>
  );
}

function patchScore(current, targetType, targetId, delta, score) {
  if (!current) return current;
  const nextScore = (post) => (score == null ? Math.max(0, (post.score || 0) + delta) : score);
  if (targetType === "thread") {
    if (current.thread?.id !== targetId) return current;
    return { ...current, thread: { ...current.thread, score: nextScore(current.thread) } };
  }
  return {
    ...current,
    replies: (current.replies || []).map((reply) => (
      reply.id === targetId ? { ...reply, score: nextScore(reply) } : reply
    )),
  };
}

function patchVote(current, targetType, targetId, value) {
  const vote = value === 1 ? { value: 1 } : null;
  if (targetType === "thread") return { thread: vote, replies: current?.replies || {} };
  return {
    thread: current?.thread || null,
    replies: { ...(current?.replies || {}), [targetId]: vote },
  };
}

function PostCard({ post, isThread, postNumber, canDelete, vote, onVote, onDelete, onReply, composer }) {
  const deleted = isForumDeleted(post.body);
  return (
    <article id={`p-${postNumber}`} className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`font-semibold ${deleted ? "italic text-gray-500 dark:text-gray-400" : "text-gray-900 dark:text-gray-100"}`}>
            {deleted ? "deleted" : (post.authorName || "Member")}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            <ForumTime value={post.postedAt || post.createdAt} />
            {isThread && post.viewCount ? ` · ${post.viewCount} views` : ""}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <a href={`#p-${postNumber}`} className="font-mono text-xs font-semibold tabular-nums text-gray-500 hover:text-blue-700 dark:text-gray-400 dark:hover:text-blue-300">
            #{postNumber}
          </a>
          {canDelete && !deleted && (
            <button
              type="button"
              onClick={onDelete}
              aria-label="Delete post"
              title="Delete post"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <FaTrashAlt className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
      {deleted ? (
        <p className="mt-2 text-sm italic text-gray-500 dark:text-gray-400">Deleted</p>
      ) : (
        <>
          <ForumBody html={post.body} />
          <div className="mt-3 flex items-center gap-3">
            <VoteButton active={vote?.value === 1} score={post.score} disabled={!onVote} onClick={onVote} />
            {onReply && (
              <button
                type="button"
                onClick={onReply}
                className="text-xs font-semibold text-blue-700 hover:underline dark:text-blue-300"
              >
                Reply
              </button>
            )}
          </div>
        </>
      )}
      {!deleted && composer && (
        <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
          {composer}
        </div>
      )}
    </article>
  );
}

function ReplyTree({ reply, depth, postNumber, numbers, replyingTo, identity, votes, onToggleReply, onSubmitReply, onVote, onDelete }) {
  return (
    <div className={depth > 0 ? "ml-4 border-l border-gray-200 pl-3 dark:border-gray-600" : ""}>
      <PostCard
        post={reply}
        postNumber={postNumber}
        canDelete={isForumOwner(reply, identity.user)}
        vote={votes?.[reply.id]}
        onVote={identity.user ? () => onVote("reply", reply) : null}
        onDelete={() => onDelete(reply)}
        onReply={() => onToggleReply(reply.id)}
        composer={replyingTo === reply.id ? (
          <ForumComposer
            embedded
            identity={identity}
            title={`Reply to ${reply.authorName}`}
            submitLabel="Reply"
            placeholder="Write a reply..."
            onCancel={() => onToggleReply(null)}
            onSubmit={(draft) => onSubmitReply(draft, reply.id)}
          />
        ) : null}
      />
      {reply.children?.length > 0 && (
        <div className="mt-3 space-y-3">
          {reply.children.map((child) => (
            <ReplyTree
              key={child.id}
              reply={child}
              postNumber={numbers.get(child.id)}
              numbers={numbers}
              depth={depth + 1}
              replyingTo={replyingTo}
              identity={identity}
              votes={votes}
              onToggleReply={onToggleReply}
              onSubmitReply={onSubmitReply}
              onVote={onVote}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ForumThread({ threadId, game = null, embedded = false }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const identity = useForumIdentity();
  const resolvedId = game ? gameThreadId(game.id) : threadId;
  const viewed = useRef(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const voting = useRef(false);
  const [replyingTo, setReplyingTo] = useState(null);

  const query = useQuery(
    ["forum-thread", resolvedId],
    () => loadThread(resolvedId),
    { enabled: Boolean(resolvedId) }
  );
  const { refetch } = query;
  const thread = query.data?.thread || null;
  const replies = query.data?.replies || [];
  const repliesTruncated = Boolean(query.data?.truncated);
  const threadNumber = thread?.number || null;
  const replyNumbers = postNumbers(replies);

  const voteKey = ["forum-votes", identity.user?.username, thread?.id, replies.map((reply) => reply.id).join(",")];
  const voteQuery = useQuery(
    voteKey,
    async () => {
      const votes = await loadVotes(identity.user.username, [
        { type: "thread", id: thread.id },
        ...replies.map((reply) => ({ type: "reply", id: reply.id })),
      ]);
      return {
        thread: votes[thread.id] || null,
        replies: Object.fromEntries(replies.map((reply) => [reply.id, votes[reply.id] || null])),
      };
    },
    { enabled: Boolean(identity.user?.username && thread?.id) }
  );

  useEffect(() => {
    viewed.current = false;
  }, [resolvedId]);

  useEffect(() => {
    if (embedded || !thread || !threadNumber || !router.isReady) return undefined;
    const canonical = threadPath({ ...thread, number: threadNumber });
    const [current, hash] = router.asPath.split("#");
    const path = current.split("?")[0];
    if (path === canonical) return undefined;
    router.replace(hash ? `${canonical}#${hash}` : canonical);
    return undefined;
  }, [embedded, router, thread, threadNumber]);

  useEffect(() => {
    if (!identity.user || !thread || viewed.current) return undefined;
    viewed.current = true;
    incrementThreadView(thread).then(() => refetch()).catch(() => {});
    return undefined;
  }, [identity.user, refetch, thread]);

  const vote = async (targetType, target) => {
    if (!identity.user) {
      toast.error("Log in to upvote.");
      return;
    }
    if (voting.current) return;
    voting.current = true;
    const threadKey = ["forum-thread", resolvedId];
    const previousThread = queryClient.getQueryData(threadKey);
    const previousVotes = queryClient.getQueryData(voteKey);
    const currentVote = targetType === "thread" ? previousVotes?.thread : previousVotes?.replies?.[target.id];
    const nextValue = currentVote?.value === 1 ? 0 : 1;
    const delta = nextValue === 1 ? 1 : -1;
    queryClient.setQueryData(threadKey, (current) => patchScore(current, targetType, target.id, delta));
    queryClient.setQueryData(voteKey, (current) => patchVote(current, targetType, target.id, nextValue));
    try {
      const result = await toggleVote({ targetType, target });
      queryClient.setQueryData(threadKey, (current) => patchScore(current, targetType, target.id, 0, result.score));
      queryClient.setQueryData(voteKey, (current) => patchVote(current, targetType, target.id, result.value));
    } catch (error) {
      queryClient.setQueryData(threadKey, previousThread);
      queryClient.setQueryData(voteKey, previousVotes);
      toast.error(explainForumError(error));
    } finally {
      voting.current = false;
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.kind === "thread") {
        await deleteOwnThread(thread);
        toast.success("Post deleted");
        await query.refetch();
      } else {
        await deleteOwnReply(deleteTarget.reply);
        toast.success("Post deleted");
        await query.refetch();
      }
      setDeleteTarget(null);
    } catch (error) {
      toast.error(explainForumError(error));
    } finally {
      setDeleting(false);
    }
  };

  if (query.isLoading) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">Loading thread...</p>;
  }

  if (query.isError) {
    return <p className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-200">{explainForumError(query.error)}</p>;
  }

  if (!thread && game) {
    const title = gameThreadTitle(game);
    return (
      <div id="thread" className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">No posts yet. The game thread is created with the first post.</p>
        <ForumComposer
          identity={identity}
          title="Post"
          submitLabel="Post"
          placeholder="Write the first post..."
          onSubmit={async (draft) => {
            const created = await ensureGameThread(game);
            if (!created?.id) throw new Error("Could not open the game thread.");
            await createForumReply({
              thread: created,
              body: draft.body,
            });
            await query.refetch();
          }}
        />
      </div>
    );
  }

  if (!thread) {
    return (
      <div id="thread" className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <p className="text-sm text-gray-600 dark:text-gray-300">That thread does not exist.</p>
      </div>
    );
  }

  const board = boardById(thread.boardSlug);

  return (
    <div id="thread" className="space-y-4">
      {!embedded && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          <Link href="/forum" className="hover:underline">Forum</Link>
          {" / "}
          <Link href={`/forum/b/${thread.boardSlug}`} className="hover:underline">{board?.title || "Board"}</Link>
        </p>
      )}
      {embedded && (
        <div className="flex items-center justify-between gap-3">
          <h2 className={`text-xl font-bold ${isForumDeleted(thread.body) ? "italic text-gray-500 dark:text-gray-400" : "text-gray-900 dark:text-gray-100"}`}>
            {isForumDeleted(thread.body) ? "Deleted" : thread.title}
          </h2>
          <Link href={threadPath({ ...thread, number: threadNumber })} className="text-sm font-medium text-blue-700 hover:underline dark:text-blue-300">
            Open thread
          </Link>
        </div>
      )}
      {!embedded && (
        <h1 className={`break-words text-2xl font-bold ${isForumDeleted(thread.body) ? "italic text-gray-500 dark:text-gray-400" : "text-gray-950 dark:text-white"}`}>
          {isForumDeleted(thread.body) ? "Deleted" : thread.title}
          {threadNumber ? <span className="ml-2 text-lg font-semibold tabular-nums text-gray-500 dark:text-gray-400"> #{threadNumber}</span> : null}
        </h1>
      )}
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {thread.replyCount || 0} {(thread.replyCount || 0) === 1 ? "comment" : "comments"}
      </p>
      <PostCard
        post={thread}
        isThread
        postNumber={1}
        canDelete={isForumOwner(thread, identity.user)}
        vote={voteQuery.data?.thread}
        onVote={identity.user ? () => vote("thread", thread) : null}
        onDelete={() => setDeleteTarget({ kind: "thread" })}
      />
      <div className="space-y-3">
        {nestReplies(replies).map((reply) => (
          <ReplyTree
            key={reply.id}
            reply={reply}
            postNumber={replyNumbers.get(reply.id)}
            numbers={replyNumbers}
            depth={0}
            replyingTo={replyingTo}
            identity={identity}
            votes={voteQuery.data?.replies}
            onToggleReply={(replyId) => setReplyingTo((current) => (replyId && current === replyId ? null : replyId))}
            onVote={vote}
            onDelete={(target) => setDeleteTarget({ kind: "reply", reply: target })}
            onSubmitReply={async (draft, parentReplyId) => {
              await createForumReply({
                thread,
                body: draft.body,
                parentReplyId,
              });
              setReplyingTo(null);
              await query.refetch();
            }}
          />
        ))}
        {repliesTruncated && (
          <p className="text-sm text-gray-500 dark:text-gray-400">Some older replies are not shown.</p>
        )}
      </div>
      <ForumComposer
        identity={identity}
        title="Reply to thread"
        submitLabel="Reply"
        placeholder="Write a reply..."
        onSubmit={(draft) => createForumReply({
          thread,
          body: draft.body,
        }).then(() => query.refetch())}
      />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete post"
        message="The post stays in place and shows as deleted."
        confirmText="Delete"
        isLoading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
