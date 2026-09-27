import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useQuery } from "react-query";
import toast from "react-hot-toast";

import { boardById, gameThreadId } from "../../lib/forum-boards";
import {
  createForumReply,
  deleteOwnReply,
  deleteOwnThread,
  ensureGameThread,
  explainForumError,
  incrementThreadView,
  isForumOwner,
  loadThread,
  loadVote,
  nestReplies,
  toggleVote,
} from "../../lib/forum-api";
import ConfirmDialog from "../ConfirmDialog";
import DisplayNameForm from "./DisplayNameForm";
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

function PostCard({ post, isThread, canDelete, vote, onVote, onDelete, onReply, voting, composer }) {
  return (
    <article className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-gray-900 dark:text-gray-100">{post.authorName || "Member"}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            <ForumTime value={post.postedAt || post.createdAt} />
            {isThread && post.viewCount ? ` · ${post.viewCount} views` : ""}
          </p>
        </div>
        {canDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="text-xs font-medium text-red-600 hover:underline dark:text-red-400"
          >
            Delete
          </button>
        )}
      </div>
      <ForumBody html={post.body} />
      <div className="mt-3 flex items-center gap-3">
        <VoteButton active={vote?.value === 1} score={post.score} disabled={voting || !onVote} onClick={onVote} />
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
      {composer && (
        <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
          {composer}
        </div>
      )}
    </article>
  );
}

function ReplyTree({ reply, depth, replyingTo, identity, votes, onToggleReply, onSubmitReply, onVote, onDelete, votingId }) {
  return (
    <div className={depth > 0 ? "ml-4 border-l border-gray-200 pl-3 dark:border-gray-600" : ""}>
      <PostCard
        post={reply}
        canDelete={isForumOwner(reply, identity.user)}
        vote={votes?.[reply.id]}
        voting={votingId === reply.id}
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
              depth={depth + 1}
              replyingTo={replyingTo}
              identity={identity}
              votes={votes}
              onToggleReply={onToggleReply}
              onSubmitReply={onSubmitReply}
              onVote={onVote}
              onDelete={onDelete}
              votingId={votingId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ForumThread({ threadId, game = null, embedded = false }) {
  const router = useRouter();
  const identity = useForumIdentity();
  const resolvedId = game ? gameThreadId(game.id) : threadId;
  const viewed = useRef(false);
  const creating = useRef(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [votingId, setVotingId] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);

  const query = useQuery(
    ["forum-thread", resolvedId],
    () => loadThread(resolvedId),
    { enabled: Boolean(resolvedId) }
  );
  const { refetch } = query;
  const thread = query.data?.thread || null;
  const replies = query.data?.replies || [];

  const voteQuery = useQuery(
    ["forum-votes", identity.user?.username, thread?.id, replies.map((reply) => reply.id).join(",")],
    async () => {
      const username = identity.user.username;
      const [threadVote, replyVotes] = await Promise.all([
        loadVote(username, "thread", thread.id),
        Promise.all(replies.map(async (reply) => [reply.id, await loadVote(username, "reply", reply.id)])),
      ]);
      return {
        thread: threadVote,
        replies: Object.fromEntries(replyVotes),
      };
    },
    { enabled: Boolean(identity.user?.username && thread?.id) }
  );

  useEffect(() => {
    viewed.current = false;
    creating.current = false;
  }, [resolvedId]);

  useEffect(() => {
    if (!game || !identity.authorName || !identity.user || query.isLoading || thread || creating.current) return undefined;
    creating.current = true;
    ensureGameThread(game, {
      authorName: identity.authorName,
      authorId: identity.user.username,
    })
      .then(() => refetch())
      .catch((error) => toast.error(explainForumError(error)));
    return undefined;
  }, [game, identity.authorName, identity.user, query.isLoading, refetch, thread]);

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
    setVotingId(target.id);
    try {
      await toggleVote({
        username: identity.user.username,
        targetType,
        target,
      });
      await Promise.all([query.refetch(), voteQuery.refetch()]);
    } catch (error) {
      toast.error(explainForumError(error));
    } finally {
      setVotingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.kind === "thread") {
        await deleteOwnThread(thread);
        toast.success("Thread deleted");
        if (embedded) query.refetch();
        else router.push(`/forum/b/${thread.boardSlug}`);
      } else {
        await deleteOwnReply(deleteTarget.reply, thread);
        toast.success("Reply deleted");
        query.refetch();
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

  if (!thread) {
    return (
      <div id="thread" className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Game thread</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">This game does not have a thread yet.</p>
        <div className="mt-3">
          <DisplayNameForm identity={identity} compact />
        </div>
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
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{thread.title}</h2>
          <Link href={`/forum/t/${thread.id}`} className="text-sm font-medium text-blue-700 hover:underline dark:text-blue-300">
            Open thread
          </Link>
        </div>
      )}
      {!embedded && <h1 className="text-2xl font-bold text-gray-950 dark:text-white">{thread.title}</h1>}
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {thread.replyCount || 0} {(thread.replyCount || 0) === 1 ? "comment" : "comments"}
      </p>
      <PostCard
        post={thread}
        isThread
        canDelete={isForumOwner(thread, identity.user)}
        vote={voteQuery.data?.thread}
        voting={votingId === thread.id}
        onVote={identity.user ? () => vote("thread", thread) : null}
        onDelete={() => setDeleteTarget({ kind: "thread" })}
      />
      <div className="space-y-3">
        {nestReplies(replies).map((reply) => (
          <ReplyTree
            key={reply.id}
            reply={reply}
            depth={0}
            replyingTo={replyingTo}
            identity={identity}
            votes={voteQuery.data?.replies}
            votingId={votingId}
            onToggleReply={(replyId) => setReplyingTo((current) => (replyId && current === replyId ? null : replyId))}
            onVote={vote}
            onDelete={(target) => setDeleteTarget({ kind: "reply", reply: target })}
            onSubmitReply={async (draft, parentReplyId) => {
              await createForumReply({
                thread,
                body: draft.body,
                authorName: draft.authorName,
                authorId: draft.authorId,
                parentReplyId,
              });
              setReplyingTo(null);
              await query.refetch();
            }}
          />
        ))}
      </div>
      <ForumComposer
        identity={identity}
        title="Reply to thread"
        submitLabel="Reply"
        placeholder="Write a reply..."
        onSubmit={(draft) => createForumReply({
          thread,
          body: draft.body,
          authorName: draft.authorName,
          authorId: draft.authorId,
        }).then(() => query.refetch())}
      />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={deleteTarget?.kind === "thread" ? "Delete thread" : "Delete reply"}
        message="This cannot be undone."
        confirmText="Delete"
        isLoading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
