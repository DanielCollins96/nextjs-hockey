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
import { excerptFromHtml, forumPreviewImage, isForumDeleted } from "./forum-content";
import { HOT_LIMIT, POPULAR_FEED_LIMIT, rankHotThreads, rankPopularThreads } from "./forum-hot";
import { persistedThreadNumber, threadIdForNumber, threadNumbers } from "./forum-numbers";
import { voteKey } from "./forum-votes";

export { isForumOwner } from "./forum-numbers";
export { voteKey } from "./forum-votes";

const USER_POOLS = "AMAZON_COGNITO_USER_POOLS";
const IAM = "AWS_IAM";
const ACTIVITY_FIELDS = "id boardSlug lastActivityAt score replyCount viewCount lastPostAuthor lastPostExcerpt _version _deleted";
const REPLY_PREVIEW_FIELDS = "id threadId body authorName authorId postedAt _deleted";
const VOTE_FIELDS = "id targetId targetType value owner _version _deleted";

function liveItems(connection) {
  return (connection?.items || []).filter((item) => item && !item._deleted);
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

async function trustedWrite(action, payload) {
  const user = await currentUser();
  if (!user) throw new Error("Log in to post.");
  const token = user.signInUserSession?.idToken?.jwtToken || (await Auth.currentSession()).getIdToken().getJwtToken();
  const response = await fetch("/api/forum-write", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action, ...payload }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Forum request failed.");
  return data;
}

async function getBoard(id) {
  try {
    const result = await readForum(forum.getForumBoard, { id });
    const board = result?.data?.getForumBoard;
    return board && !board._deleted ? board : null;
  } catch (error) {
    if (isSchemaUnavailable(error)) return null;
    throw error;
  }
}

async function getThread(id) {
  const result = await readForum(forum.getForumThread, { id });
  const thread = result?.data?.getForumThread;
  return thread && !thread._deleted ? thread : null;
}

function withActivity(record, activity) {
  if (!record) return record;
  if (!activity || activity._deleted) return record;
  return {
    ...record,
    score: activity.score ?? record.score,
    replyCount: activity.replyCount ?? record.replyCount,
    viewCount: activity.viewCount ?? record.viewCount,
    lastActivityAt: activity.lastActivityAt || record.lastActivityAt,
    lastPostAuthor: activity.lastPostAuthor ?? record.lastPostAuthor,
    lastPostExcerpt: activity.lastPostExcerpt ?? record.lastPostExcerpt,
  };
}

async function getActivity(id) {
  if (!id) return null;
  try {
    const result = await readForum(forum.getForumActivity, { id });
    const activity = result?.data?.getForumActivity;
    return activity && !activity._deleted ? activity : null;
  } catch (error) {
    if (isSchemaUnavailable(error)) return null;
    throw error;
  }
}

async function loadActivities(ids) {
  const unique = [...new Set((ids || []).map((id) => String(id || "")).filter(Boolean))];
  const byId = new Map();

  for (let index = 0; index < unique.length; index += 25) {
    const chunk = unique.slice(index, index + 25);
    const variableDefs = chunk.map((_, item) => `$id${item}: ID!`).join(", ");
    const selections = chunk.map((_, item) => `a${item}: getForumActivity(id: $id${item}) { ${ACTIVITY_FIELDS} }`).join("\n");
    const variables = {};
    chunk.forEach((id, item) => {
      variables[`id${item}`] = id;
    });
    try {
      const result = await readForum(`query ForumActivities(${variableDefs}) { ${selections} }`, variables);
      chunk.forEach((id, item) => {
        const activity = result?.data?.[`a${item}`];
        if (activity && !activity._deleted) byId.set(id, activity);
      });
    } catch (error) {
      if (isSchemaUnavailable(error)) break;
      throw error;
    }
  }

  return byId;
}

export async function ensureForumBoards() {
  return null;
}

function presentBoard(definition, remote) {
  return {
    ...definition,
    ...(remote || {}),
    id: definition.id,
    slug: definition.slug,
    title: definition.title,
    description: definition.description,
    section: definition.section,
    teamAbbrev: definition.teamAbbrev,
    sortOrder: definition.sortOrder,
  };
}

export function mergeBoards(remoteBoards) {
  const byId = new Map((remoteBoards || []).filter((board) => board && !board._deleted).map((board) => [board.id, board]));
  return FORUM_BOARDS.map((definition) => presentBoard(definition, byId.get(definition.id)));
}

function applyThreadStats(boards, threads, numbers) {
  const byBoard = new Map();
  (threads || []).forEach((thread) => {
    if (!thread?.boardSlug || !thread.id) return;
    const list = byBoard.get(thread.boardSlug) || [];
    list.push(thread);
    byBoard.set(thread.boardSlug, list);
  });

  return boards.map((board) => {
    const list = byBoard.get(board.id) || [];
    const last = [...list].sort((left, right) => {
      const leftAt = left.lastActivityAt || left.postedAt || "";
      const rightAt = right.lastActivityAt || right.postedAt || "";
      return rightAt.localeCompare(leftAt);
    })[0];
    const threadCount = list.length;
    const postCount = list.reduce((sum, thread) => sum + 1 + (thread.replyCount || 0), 0);
    return {
      ...board,
      threadCount,
      postCount,
      lastPostTitle: last?.title || board.lastPostTitle,
      lastPostAuthor: last?.lastPostAuthor || last?.authorName || board.lastPostAuthor,
      lastPostAt: last?.lastActivityAt || last?.postedAt || board.lastPostAt,
      lastThreadId: last?.id,
      lastThreadNumber: last ? persistedThreadNumber(last) || numbers?.get(last.id) : undefined,
    };
  });
}

const FEED_PAGE = 200;
const FEED_MAX_PAGES = 25;
const REPLY_PAGE = 100;
const REPLY_MAX_PAGES = 20;

async function readPages(query, variables, field, pageSize, maxPages) {
  const items = [];
  let nextToken = null;
  for (let page = 0; page < maxPages; page += 1) {
    const result = await readForum(query, { ...variables, limit: pageSize, nextToken });
    const connection = result?.data?.[field];
    items.push(...liveItems(connection));
    nextToken = connection?.nextToken || null;
    if (!nextToken) break;
  }
  return { items, nextToken };
}

async function loadFeedThreads() {
  const { items } = await readPages(
    forum.threadsByFeed,
    { feed: FORUM_FEED, sortDirection: "DESC" },
    "threadsByFeed",
    FEED_PAGE,
    FEED_MAX_PAGES
  );
  const activities = await loadActivities(items.map((thread) => thread.id));
  return items.map((thread) => withActivity(thread, activities.get(thread.id)));
}

export async function loadForumHome() {
  const [boardResult, feedThreads] = await Promise.all([
    readForum(forum.listForumBoards, { limit: 100 }).catch((error) => {
      if (isSchemaUnavailable(error)) return { data: { listForumBoards: { items: [] } } };
      throw error;
    }),
    loadFeedThreads(),
  ]);
  const numbers = threadNumbers(feedThreads);
  const boards = applyThreadStats(mergeBoards(liveItems(boardResult?.data?.listForumBoards)), feedThreads, numbers);

  const listed = (thread) => {
    const deleted = isForumDeleted(thread.body);
    return {
      id: thread.id,
      number: persistedThreadNumber(thread) || numbers.get(thread.id),
      boardSlug: thread.boardSlug,
      title: thread.title,
      authorName: thread.authorName,
      lastPostAuthor: thread.lastPostAuthor || thread.authorName,
      score: thread.score || 0,
      replyCount: thread.replyCount || 0,
      postedAt: thread.postedAt,
      lastActivityAt: thread.lastActivityAt,
      createdAt: thread.createdAt,
      excerpt: deleted ? "" : excerptFromHtml(thread.body, 160),
      image: deleted ? "" : forumPreviewImage(thread.body),
    };
  };

  const popularThreads = rankPopularThreads(feedThreads, POPULAR_FEED_LIMIT);
  const replyCounts = await countThreadReplies(popularThreads.map((thread) => thread.id));

  return {
    boards,
    hotThreads: rankHotThreads(feedThreads, HOT_LIMIT).map(listed),
    popularFeed: popularThreads.map((thread) => {
      const row = listed(thread);
      const counted = replyCounts.get(thread.id);
      return counted == null ? row : { ...row, replyCount: counted };
    }),
    threadNumbers: Object.fromEntries(numbers),
  };
}

export async function loadThreadNumberMap() {
  const feedThreads = await loadFeedThreads();
  return Object.fromEntries(threadNumbers(feedThreads));
}

export async function findThreadIdByNumber(number) {
  const target = Number(number);
  if (!Number.isInteger(target) || target < 1) return null;
  try {
    const result = await readForum(forum.threadsByNumber, { number: target, limit: 5 });
    const thread = liveItems(result?.data?.threadsByNumber)[0];
    if (thread?.id) return thread.id;
  } catch (error) {
    if (!isSchemaUnavailable(error)) throw error;
  }
  const map = await loadThreadNumberMap();
  return threadIdForNumber(map, target);
}

async function countThreadReplies(threadIds) {
  const counts = new Map();
  const ids = [...new Set((threadIds || []).map((id) => String(id || "")).filter(Boolean))];

  for (let index = 0; index < ids.length; index += 15) {
    const chunk = ids.slice(index, index + 15);
    const variableDefs = chunk.map((_, item) => `$id${item}: ID!`).join(", ");
    const selections = chunk.map((_, item) => (
      `r${item}: repliesByThread(threadId: $id${item}, limit: 100) { items { _deleted } }`
    )).join("\n");
    const variables = {};
    chunk.forEach((id, item) => {
      variables[`id${item}`] = id;
    });
    try {
      const result = await readForum(`query PopularReplyCounts(${variableDefs}) { ${selections} }`, variables);
      chunk.forEach((id, item) => {
        const items = result?.data?.[`r${item}`]?.items || [];
        counts.set(id, items.filter((reply) => reply && !reply._deleted).length);
      });
    } catch (error) {
      if (isSchemaUnavailable(error)) break;
      throw error;
    }
  }

  return counts;
}

async function loadRecentRepliesForThreads(threadIds, limit = 3) {
  const ids = [...new Set((threadIds || []).map((id) => String(id || "")).filter(Boolean))];
  const byId = new Map();

  for (let index = 0; index < ids.length; index += 20) {
    const chunk = ids.slice(index, index + 20);
    const variableDefs = chunk.map((_, item) => `$id${item}: ID!`).join(", ");
    const selections = chunk.map((_, item) => (
      `r${item}: repliesByThread(threadId: $id${item}, sortDirection: DESC, limit: ${limit}) { items { ${REPLY_PREVIEW_FIELDS} } }`
    )).join("\n");
    const variables = {};
    chunk.forEach((id, item) => {
      variables[`id${item}`] = id;
    });
    try {
      const result = await readForum(`query BoardReplyPreviews(${variableDefs}) { ${selections} }`, variables);
      chunk.forEach((id, item) => {
        byId.set(id, liveItems(result?.data?.[`r${item}`]).reverse());
      });
    } catch (error) {
      if (isSchemaUnavailable(error)) break;
      throw error;
    }
  }

  return byId;
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

  const rawThreads = liveItems(threadResult?.data?.threadsByBoard);
  const activities = await loadActivities(rawThreads.map((thread) => thread.id));
  const threads = rawThreads.map((thread) => withActivity(thread, activities.get(thread.id)));
  const previews = await loadRecentRepliesForThreads(
    threads.filter((thread) => (thread.replyCount || 0) > 0).map((thread) => thread.id)
  );

  return {
    board: presentBoard(definition, board),
    threads: threads.map((thread) => ({
      ...thread,
      number: persistedThreadNumber(thread),
      previewReplies: previews.get(thread.id) || [],
    })),
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
  const [{ items, nextToken }, activity] = await Promise.all([
    readPages(
      forum.repliesByThread,
      { threadId: thread.id, sortDirection: "ASC" },
      "repliesByThread",
      REPLY_PAGE,
      REPLY_MAX_PAGES
    ),
    getActivity(thread.id),
  ]);
  const replyActivities = await loadActivities(items.map((reply) => reply.id));
  const liveThread = withActivity(thread, activity);
  return {
    thread: {
      ...liveThread,
      number: persistedThreadNumber(thread) || thread.number,
      replyCount: nextToken ? Math.max(liveThread.replyCount || 0, items.length) : items.length,
    },
    replies: items.map((reply) => withActivity(reply, replyActivities.get(reply.id))),
    truncated: Boolean(nextToken),
  };
}

export async function loadAuthorThreads(authorId) {
  const result = await readForum(forum.threadsByAuthor, {
    authorId,
    sortDirection: "DESC",
    limit: 20,
  });
  const threads = liveItems(result?.data?.threadsByAuthor);
  const activities = await loadActivities(threads.map((thread) => thread.id));
  return threads.map((thread) => ({
    ...withActivity(thread, activities.get(thread.id)),
    number: persistedThreadNumber(thread),
  }));
}

export async function fetchReplyCounts(gameIds) {
  const ids = [...new Set((gameIds || []).map((id) => String(id || "")).filter(Boolean))];
  const counts = {};

  for (let index = 0; index < ids.length; index += 25) {
    const chunk = ids.slice(index, index + 25);
    const variableDefs = chunk.map((_, item) => `$id${item}: ID!`).join(", ");
    const selections = chunk.map((_, item) => `t${item}: getForumThread(id: $id${item}) { replyCount _deleted } a${item}: getForumActivity(id: $id${item}) { replyCount _deleted }`).join("\n");
    const variables = {};
    chunk.forEach((gameId, item) => {
      variables[`id${item}`] = gameThreadId(gameId);
    });

    try {
      const result = await readForum(
        `query GameThreadCounts(${variableDefs}) { ${selections} }`,
        variables
      );
      chunk.forEach((gameId, item) => {
        const activity = result?.data?.[`a${item}`];
        const thread = result?.data?.[`t${item}`];
        if (activity && !activity._deleted) counts[gameId] = activity.replyCount || 0;
        else if (thread && !thread._deleted) counts[gameId] = thread.replyCount || 0;
      });
    } catch (error) {
      if (isSchemaUnavailable(error)) break;
      console.error("Error fetching game thread count:", error);
    }
  }

  return counts;
}

function isSchemaUnavailable(error) {
  return /403|ForumBoard|ForumThread|ForumReply|ForumActivity|ForumCounter|Cannot query field|Unknown type|not found in schema|undefined/i.test(graphqlErrorMessage(error));
}

export async function createForumThread({ boardSlug, title, body, gameId = null, id = null }) {
  const data = await trustedWrite("createThread", { boardSlug, title, body, gameId, id });
  return data.thread;
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

export async function createForumReply({ thread, body, parentReplyId = null }) {
  const data = await trustedWrite("createReply", {
    threadId: thread.id,
    body,
    parentReplyId,
  });
  return data.reply;
}

export async function incrementThreadView(thread) {
  if (!thread?.id) return null;
  if (!(await currentUser())) return null;
  const data = await trustedWrite("viewThread", { id: thread.id, boardSlug: thread.boardSlug });
  return data.activity;
}

export async function deleteOwnThread(thread) {
  await trustedWrite("markDeleted", { id: thread.id, targetType: "thread" });
}

export async function deleteOwnReply(reply) {
  await trustedWrite("markDeleted", { id: reply.id, targetType: "reply" });
}

export async function toggleVote({ targetType, target }) {
  const data = await trustedWrite("voteTarget", {
    id: target.id,
    targetType,
  });
  return { score: data.activity?.score, value: data.value };
}

export async function loadVote(username, targetType, targetId) {
  const votes = await loadVotes(username, [{ type: targetType, id: targetId }]);
  return votes[targetId] || null;
}

export async function loadVotes(username, targets) {
  const votes = {};
  const list = (targets || []).filter((target) => target?.id && target?.type);
  if (!username || !list.length) return votes;

  for (let index = 0; index < list.length; index += 25) {
    const chunk = list.slice(index, index + 25);
    const variableDefs = chunk.map((_, item) => `$id${item}: ID!`).join(", ");
    const selections = chunk.map((_, item) => `v${item}: getForumVote(id: $id${item}) { ${VOTE_FIELDS} }`).join("\n");
    const variables = {};
    chunk.forEach((target, item) => {
      variables[`id${item}`] = voteKey(username, target.type, target.id);
    });
    try {
      const result = await writeForum(`query ForumVotes(${variableDefs}) { ${selections} }`, variables);
      chunk.forEach((target, item) => {
        const vote = result?.data?.[`v${item}`];
        if (vote && !vote._deleted) votes[target.id] = vote;
      });
    } catch (error) {
      if (isSchemaUnavailable(error)) break;
      throw error;
    }
  }

  return votes;
}

export async function ensureGameThread(game) {
  const id = gameThreadId(game.id);
  const existing = await getThread(id);
  if (existing) return existing;

  const title = gameThreadTitle(game);
  try {
    return await createForumThread({
      id,
      boardSlug: GAME_THREADS_BOARD_ID,
      gameId: String(game.id),
      title,
      body: `<p>Game thread for ${escapeHtml(title)}.</p>`,
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
