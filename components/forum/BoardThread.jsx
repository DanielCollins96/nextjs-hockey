import Link from "next/link";
import { isForumDeleted } from "../../lib/forum-content";
import { threadPath } from "../../lib/forum-numbers";
import ForumBody from "./ForumBody";
import ForumTime from "./ForumTime";

const PREVIEW_REPLIES = 3;

export default function BoardThread({ thread }) {
  const href = threadPath(thread);
  const replyCount = thread.replyCount || 0;
  const replies = (thread.previewReplies || []).slice(-PREVIEW_REPLIES);
  const omitted = Math.max(0, replyCount - replies.length);

  return (
    <article className="border-b border-gray-200 px-4 py-4 last:border-b-0 dark:border-gray-700">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <Link href={href} className="break-words font-bold text-green-700 hover:underline dark:text-green-400">
          {thread.title}
        </Link>
        {thread.number ? (
          <span className="text-xs font-semibold tabular-nums text-gray-500 dark:text-gray-400">#{thread.number}</span>
        ) : null}
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{thread.authorName}</span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          <ForumTime value={thread.postedAt || thread.createdAt} />
          {" · "}
          {replyCount} {replyCount === 1 ? "comment" : "comments"}
        </span>
      </div>
      <div className="max-h-48 overflow-hidden">
        {isForumDeleted(thread.body) ? (
          <p className="mt-2 text-sm italic text-gray-500 dark:text-gray-400">Deleted</p>
        ) : (
          <ForumBody html={thread.body} />
        )}
      </div>
      {omitted > 0 && (
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
          {omitted} {omitted === 1 ? "comment" : "comments"} omitted.{" "}
          <Link href={href} className="font-medium text-blue-700 hover:underline dark:text-blue-300">
            Click here to view.
          </Link>
        </p>
      )}
      {replies.length > 0 && (
        <div className="mt-3 space-y-2 border-l-2 border-gray-200 pl-3 dark:border-gray-600">
          {replies.map((reply) => (
            <div key={reply.id} className="max-h-32 overflow-hidden rounded-md bg-gray-50 px-3 py-2 dark:bg-gray-900/50">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                <span className={`font-semibold ${isForumDeleted(reply.body) ? "italic text-gray-500 dark:text-gray-400" : "text-gray-800 dark:text-gray-100"}`}>
                  {isForumDeleted(reply.body) ? "deleted" : reply.authorName}
                </span>
                {" · "}
                <ForumTime value={reply.postedAt || reply.createdAt} />
              </p>
              {isForumDeleted(reply.body) ? (
                <p className="text-sm italic text-gray-500 dark:text-gray-400">Deleted</p>
              ) : (
                <ForumBody html={reply.body} />
              )}
            </div>
          ))}
        </div>
      )}
      <Link href={href} className="mt-3 inline-block text-sm font-medium text-blue-700 hover:underline dark:text-blue-300">
        View thread
      </Link>
    </article>
  );
}
