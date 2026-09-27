import { API, graphqlOperation, Auth } from "aws-amplify";

import * as forum from "../src/graphql/forum";
import {
  FORUM_BOARDS,
  FORUM_FEED,
  GAME_THREADS_BOARD_ID,
  boardById,
  gameThreadId,
  gameThreadTitle,
} from "./forum-boards";
import { excerptFromHtml, requireForumBody, validateTitle } from "./forum-content";
import { rankHotThreads } from "./forum-hot";
import { threadNumbers } from "./forum-numbers";

const USER_POOLS = "AMAZON_COGNITO_USER_POOLS";
const IAM = "AWS_IAM";

function liveItems(connection) {
  return (connection?.items || []).filter((item) => item && !item._deleted);
}

function isConflict(error) {
  const text = JSON.stringify(error?.errors || error?.message || error);
  return text.includes("Conflict") || text.includes("ConditionalCheckFailed");
}

function graphqlErrorMessage(error) {
  return error?.errors?.[0]?.message || error?.message || "Forum request failed.";
}

async function currentUser() {
  try {
    return await Auth.currentAuthenticatedUser();
  } catch {
    return null;
  }
}

async function graphql(query, variables, authMode) {
  return API.graphql({
    ...graphqlOperation(query, variables),
    authMode,
  });
}

async function readForum(query, variables) {
  const user = await currentUser();
  return graphql(query, variables, user ? USER_POOLS : IAM);
}

function writeForum(query, variables) {
  return graphql(query, variables, USER_POOLS);
}

export function isForumOwner(record, user) {
  const username = user?.username;
  if (!record?.owner || !username) return false;
  return record.owner === username || record.owner.endsWith(`::${username}`);
}

export function voteKey(username, targetType, targetId) {
  return `${encodeURIComponent(username)}::${targetType}::${targetId}`;
}

async function getBoard(id) {
  const result = await readForum(forum.getForumBoard, { id });
  const board = result?.data?.getForumBoard;
  return board && !board._deleted ? board : null;
}

async function getThread(id) {
  const result = await readForum(forum.getForumThread, { id });
  const thread = result?.data?.getForumThread;
  return thread && !thread._deleted ? thread : null;
}

async function ensureBoard(boardId) {
  const definition = boardById(boardId);
  if (!definition) throw new Error("Unknown board.");
  const existing = await getBoard(definition.id);
  if (existing) return existing;

  try {
    const created = await writeForum(forum.createForumBoard, {
      input: {
        id: definition.id,
        slug: definition.slug,
        title: definition.title,
        description: definition.description,
        section: definition.section,
        ...(definition.teamAbbrev ? { teamAbbrev: definition.teamAbbrev } : {}),
        sortOrder: definition.sortOrder,
        threadCount: 0,
        postCount: 0,
      },
    });
    return created?.data?.createForumBoard;
  } catch (error) {
    const again = await getBoard(definition.id);
    if (again) return again;
    throw error;
  }
}

async function updateBoard(boardId, change) {
  const apply = async () => {
    const board = await getBoard(boardId);
    if (!board) return null;
    const next = change(board);
    const result = await writeForum(forum.updateForumBoard, {
      input: {
        id: board.id,
        ...next,
        _version: board._version,
      },
    });
    return result?.data?.updateForumBoard || null;
  };

  try {
    return await apply();
  } catch (error) {
    if (!isConflict(error)) throw error;
    return apply();
  }
}

function boardActivityPatch(board, { title, authorName, postedAt, threadDelta = 0, postDelta = 0 }) {
  return {
    threadCount: Math.max(0, (board.threadCount || 0) + threadDelta),
    postCount: Math.max(0, (board.postCount || 0) + postDelta),
    lastPostTitle: title,
    lastPostAuthor: authorName,
    lastPostAt: postedAt,
  };
}

export async function ensureForumBoards() {
  if (typeof window !== "undefined" && window.sessionStorage.getItem("forum-boards-seeded") === "1") {
    return;
  }
  const user = await currentUser();
  if (!user) return;

  for (let index = 0; index < FORUM_BOARDS.length; index += 6) {
    const chunk = FORUM_BOARDS.slice(index, index + 6);
    await Promise.all(chunk.map((board) => ensureBoard(board.id)));
  }

  if (typeof window !== "undefined") {
    window.sessionStorage.setItem("forum-boards-seeded", "1");
  }
}

export function mergeBoards(remoteBoards) {
  const byId = new Map((remoteBoards || []).filter((board) => board && !board._deleted).map((board) => [board.id, board]));
  return FORUM_BOARDS.map((definition) => ({
    ...definition,
    ...(byId.get(definition.id) || {}),
    title: definition.title,
    description: definition.description,
    section: definition.section,
    sortOrder: definition.sortOrder,
  }));
}

function attachLastThreads(boards, threads, numbers) {
  const byBoard = new Map();
  (threads || []).forEach((thread) => {
    if (!thread?.boardSlug || !thread.id) return;
    const list = byBoard.get(thread.boardSlug) || [];
    list.push(thread);
    byBoard.set(thread.boardSlug, list);
  });

  return boards.map((board) => {
    const titled = (byBoard.get(board.id) || []).filter((thread) => thread.title === board.lastPostTitle);
    const match = titled.sort((left, right) => {
      const leftAt = left.lastActivityAt || left.postedAt || "";
      const rightAt = right.lastActivityAt || right.postedAt || "";
      return rightAt.localeCompare(leftAt);
    })[0];
    return match ? { ...board, lastThreadId: match.id, lastThreadNumber: numbers?.get(match.id) } : board;
  });
}

export async function loadForumHome() {
  const [boardResult, feedResult] = await Promise.all([
    readForum(forum.listForumBoards, { limit: 100 }),
    readForum(forum.threadsByFeed, { feed: FORUM_FEED, sortDirection: "DESC", limit: 200 }),
  ]);
  const feedThreads = liveItems(feedResult?.data?.threadsByFeed);
  const numbers = threadNumbers(feedThreads);

  return {
    boards: attachLastThreads(mergeBoards(liveItems(boardResult?.data?.listForumBoards)), feedThreads, numbers),
    hotThreads: rankHotThreads(feedThreads, 8).map((thread) => ({
      ...thread,
      number: numbers.get(thread.id),
    })),
    threadNumbers: Object.fromEntries(numbers),
  };
}

export async function loadThreadNumberMap() {
  const feedResult = await readForum(forum.threadsByFeed, {
    feed: FORUM_FEED,
    sortDirection: "DESC",
    limit: 200,
  });
  return Object.fromEntries(threadNumbers(liveItems(feedResult?.data?.threadsByFeed)));
}

export async function loadBoardThreads(slug, nextToken) {
  const definition = boardById(slug);
  if (!definition) return null;
  const [board, threadResult] = await Promise.all([
    getBoard(definition.id),
    readForum(forum.threadsByBoard, {
      boardSlug: definition.id,
      sortDirection: "DESC",
      limit: 25,
      nextToken: nextToken || null,
    }),
  ]);

  return {
    board: { ...definition, ...(board || {}) },
    threads: liveItems(threadResult?.data?.threadsByBoard),
    nextToken: threadResult?.data?.threadsByBoard?.nextToken || null,
  };
}

export async function loadRecentReplies(threadId, limit = 3) {
  const result = await readForum(forum.repliesByThread, {
    threadId,
    sortDirection: "DESC",
    limit,
  });
  return liveItems(result?.data?.repliesByThread).reverse();
}

export async function loadThread(threadId) {
  const thread = await getThread(threadId);
  if (!thread) return null;
  const replyResult = await readForum(forum.repliesByThread, {
    threadId: thread.id,
    sortDirection: "ASC",
    limit: 100,
  });
  return {
    thread,
    replies: liveItems(replyResult?.data?.repliesByThread),
    nextToken: replyResult?.data?.repliesByThread?.nextToken || null,
  };
}

export async function loadAuthorThreads(authorId) {
  const result = await readForum(forum.threadsByAuthor, {
    authorId,
    sortDirection: "DESC",
    limit: 20,
  });
  return liveItems(result?.data?.threadsByAuthor);
}

export async function fetchReplyCounts(gameIds) {
  const ids = [...new Set((gameIds || []).map((id) => String(id || "")).filter(Boolean))];
  const counts = {};

  for (let index = 0; index < ids.length; index += 8) {
    const chunk = ids.slice(index, index + 8);
    let unavailable = false;
    await Promise.all(chunk.map(async (gameId) => {
      try {
        const thread = await getThread(gameThreadId(gameId));
        if (thread) counts[gameId] = thread.replyCount || 0;
      } catch (error) {
        if (isSchemaUnavailable(error)) {
          unavailable = true;
          return;
        }
        console.error("Error fetching game thread count:", error);
      }
    }));
    if (unavailable) break;
  }

  return counts;
}

function isSchemaUnavailable(error) {
  return /403|ForumBoard|ForumThread|ForumReply|Cannot query field|Unknown type|not found in schema|undefined/i.test(graphqlErrorMessage(error));
}

export async function createForumThread({ boardSlug, title, body, authorName, authorId, gameId = null, id = null }) {
  const cleanTitle = validateTitle(title);
  const cleanBody = await requireForumBody(body);
  const postedAt = new Date().toISOString();
  const excerpt = excerptFromHtml(cleanBody);
  await ensureBoard(boardSlug);

  const input = {
    boardSlug,
    ...(gameId ? { gameId: String(gameId) } : {}),
    feed: FORUM_FEED,
    authorId,
    title: cleanTitle,
    body: cleanBody,
    authorName,
    score: 0,
    replyCount: 0,
    viewCount: 0,
    postedAt,
    lastActivityAt: postedAt,
    lastPostAuthor: authorName,
    lastPostExcerpt: excerpt,
  };
  if (id) input.id = id;

  const created = await writeForum(forum.createForumThread, { input });
  const thread = created?.data?.createForumThread;
  await updateBoard(boardSlug, (board) => boardActivityPatch(board, {
    title: cleanTitle,
    authorName,
    postedAt,
    threadDelta: 1,
    postDelta: 1,
  }));
  return thread;
}

export function boardCommentCount(board) {
  return Math.max(0, (board?.postCount || 0) - (board?.threadCount || 0));
}

export function nestReplies(replies) {
  const nodes = new Map();
  (replies || []).forEach((reply) => {
    nodes.set(reply.id, { ...reply, children: [] });
  });
  const roots = [];
  nodes.forEach((node) => {
    const parent = node.parentReplyId ? nodes.get(node.parentReplyId) : null;
    if (parent && parent.id !== node.id) parent.children.push(node);
    else roots.push(node);
  });
  return roots;
}

export async function createForumReply({ thread, body, authorName, authorId, parentReplyId = null }) {
  const cleanBody = await requireForumBody(body);
  const postedAt = new Date().toISOString();
  const excerpt = excerptFromHtml(cleanBody);
  const created = await writeForum(forum.createForumReply, {
    input: {
      threadId: thread.id,
      ...(parentReplyId ? { parentReplyId } : {}),
      body: cleanBody,
      authorName,
      authorId,
      score: 0,
      postedAt,
    },
  });

  await updateThread(thread.id, (current) => ({
    replyCount: (current.replyCount || 0) + 1,
    lastActivityAt: postedAt,
    lastPostAuthor: authorName,
    lastPostExcerpt: excerpt,
  }));
  await updateBoard(thread.boardSlug, (board) => boardActivityPatch(board, {
    title: thread.title,
    authorName,
    postedAt,
    postDelta: 1,
  }));

  return created?.data?.createForumReply;
}

async function updateThread(threadId, change) {
  const apply = async () => {
    const thread = await getThread(threadId);
    if (!thread) return null;
    const result = await writeForum(forum.updateForumThread, {
      input: {
        id: thread.id,
        ...change(thread),
        _version: thread._version,
      },
    });
    return result?.data?.updateForumThread || null;
  };

  try {
    return await apply();
  } catch (error) {
    if (!isConflict(error)) throw error;
    return apply();
  }
}

async function updateReply(reply, change) {
  const apply = async (current) => {
    const updated = await writeForum(forum.updateForumReply, {
      input: {
        id: current.id,
        ...change(current),
        _version: current._version,
      },
    });
    return updated?.data?.updateForumReply || null;
  };

  try {
    return await apply(reply);
  } catch (error) {
    if (!isConflict(error)) throw error;
    const result = await readForum(forum.repliesByThread, {
      threadId: reply.threadId,
      sortDirection: "ASC",
      limit: 100,
    });
    const fresh = liveItems(result?.data?.repliesByThread).find((item) => item.id === reply.id);
    if (!fresh) return null;
    return apply(fresh);
  }
}

export async function incrementThreadView(thread) {
  if (!thread?.id) return null;
  return updateThread(thread.id, (current) => ({
    viewCount: (current.viewCount || 0) + 1,
  }));
}

export async function deleteOwnThread(thread) {
  await writeForum(forum.deleteForumThread, {
    input: { id: thread.id, _version: thread._version },
  });
  await updateBoard(thread.boardSlug, (board) => ({
    threadCount: Math.max(0, (board.threadCount || 0) - 1),
    postCount: Math.max(0, (board.postCount || 0) - 1),
  }));
}

export async function deleteOwnReply(reply, thread) {
  await writeForum(forum.deleteForumReply, {
    input: { id: reply.id, _version: reply._version },
  });
  await updateThread(thread.id, (current) => ({
    replyCount: Math.max(0, (current.replyCount || 0) - 1),
  }));
  await updateBoard(thread.boardSlug, (board) => ({
    postCount: Math.max(0, (board.postCount || 0) - 1),
  }));
}

export async function toggleVote({ username, targetType, target }) {
  const id = voteKey(username, targetType, target.id);
  let existing = null;
  try {
    const result = await writeForum(forum.getForumVote, { id });
    const vote = result?.data?.getForumVote;
    existing = vote && !vote._deleted ? vote : null;
  } catch (error) {
    if (!String(graphqlErrorMessage(error)).toLowerCase().includes("not found")) {
      existing = null;
    }
  }

  const nextValue = existing?.value === 1 ? 0 : 1;
  const delta = nextValue === 1 ? 1 : -1;

  if (!existing) {
    await writeForum(forum.createForumVote, {
      input: {
        id,
        targetId: target.id,
        targetType,
        value: 1,
      },
    });
  } else {
    await writeForum(forum.updateForumVote, {
      input: {
        id: existing.id,
        value: nextValue,
        _version: existing._version,
      },
    });
  }

  if (targetType === "thread") {
    return updateThread(target.id, (current) => ({
      score: Math.max(0, (current.score || 0) + delta),
    }));
  }

  return updateReply(target, (current) => ({
    score: Math.max(0, (current.score || 0) + delta),
  }));
}

export async function loadVote(username, targetType, targetId) {
  if (!username || !targetId) return null;
  try {
    const result = await writeForum(forum.getForumVote, {
      id: voteKey(username, targetType, targetId),
    });
    const vote = result?.data?.getForumVote;
    return vote && !vote._deleted ? vote : null;
  } catch {
    return null;
  }
}

export async function ensureGameThread(game, author) {
  const id = gameThreadId(game.id);
  const existing = await getThread(id);
  if (existing) return existing;
  if (!author?.authorName || !author?.authorId) return null;

  const title = gameThreadTitle(game);
  try {
    return await createForumThread({
      id,
      boardSlug: GAME_THREADS_BOARD_ID,
      gameId: String(game.id),
      title,
      body: `<p>Game thread for ${escapeHtml(title)}.</p>`,
      authorName: author.authorName,
      authorId: author.authorId,
    });
  } catch (error) {
    const again = await getThread(id);
    if (again) return again;
    throw error;
  }
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function explainForumError(error) {
  const message = graphqlErrorMessage(error);
  if (isSchemaUnavailable(error)) {
    return "The forum API is not deployed yet. Run amplify push, then reload.";
  }
  return message;
}
