import { adminGraphql, userGraphql } from "./forum-admin";
import { FORUM_FEED, boardById, gameThreadId } from "./forum-boards";
import { excerptFromHtml, requireForumBody, validateDisplayName, validateTitle } from "./forum-content";
import { isUsageConflict } from "./forum-quota-slots";
import { isProfileBioPost, parseProfileContent, PROFILE_BIO_SUBJECT } from "./user-profile";

const THREAD_COUNTER_ID = "forum-thread-number";
const ACTIVITY_FIELDS = "id boardSlug lastActivityAt score replyCount viewCount lastPostAuthor lastPostExcerpt _version _deleted";
const THREAD_FIELDS = `id number boardSlug gameId feed authorId title body authorName score replyCount viewCount postedAt lastActivityAt lastPostAuthor lastPostExcerpt owner _version _deleted`;
const REPLY_FIELDS = `id threadId body authorName authorId parentReplyId score postedAt owner _version _deleted`;

function isConflict(error) {
  const text = JSON.stringify(error?.errors || error?.message || error);
  return text.includes("Conflict") || text.includes("ConditionalCheckFailed") || /already exists/i.test(text);
}

export async function displayNameForToken(token, username) {
  const data = await userGraphql(token, /* GraphQL */ `
    query ForumDisplayName($userId: ID!) {
      listPosts(limit: 20, filter: { userId: { eq: $userId }, subject: { eq: "${PROFILE_BIO_SUBJECT}" } }) {
        items { id userId subject content _deleted }
      }
    }
  `, { userId: username });
  const post = (data?.listPosts?.items || []).find((item) => item && !item._deleted && isProfileBioPost(item));
  const name = parseProfileContent(post?.content).username || "";
  if (!name) throw new Error("Set a display name before posting.");
  return validateDisplayName(name);
}

async function nextThreadNumber() {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    let current = null;
    try {
      const data = await adminGraphql(/* GraphQL */ `
        query GetForumCounter($id: ID!) {
          getForumCounter(id: $id) { id value _version _deleted }
        }
      `, { id: THREAD_COUNTER_ID });
      current = data?.getForumCounter;
      if (current?._deleted) current = null;
    } catch (error) {
      if (!/not found/i.test(error?.message || "")) throw error;
    }

    if (!current) {
      try {
        await adminGraphql(/* GraphQL */ `
          mutation CreateForumCounter($input: CreateForumCounterInput!) {
            createForumCounter(input: $input) { id value _version }
          }
        `, { input: { id: THREAD_COUNTER_ID, value: 1 } });
        return 1;
      } catch (error) {
        if (isConflict(error) || isUsageConflict(error)) continue;
        throw error;
      }
    }

    try {
      await adminGraphql(/* GraphQL */ `
        mutation UpdateForumCounter($input: UpdateForumCounterInput!) {
          updateForumCounter(input: $input) { id value _version }
        }
      `, { input: { id: THREAD_COUNTER_ID, value: current.value + 1, _version: current._version } });
      return current.value + 1;
    } catch (error) {
      if (!isConflict(error)) throw error;
    }
  }
  throw new Error("Could not assign a thread number.");
}

async function getActivity(id) {
  const data = await adminGraphql(/* GraphQL */ `
    query GetForumActivity($id: ID!) {
      getForumActivity(id: $id) { ${ACTIVITY_FIELDS} }
    }
  `, { id });
  const activity = data?.getForumActivity;
  return activity && !activity._deleted ? activity : null;
}

export async function writeActivity(id, change, extra = {}) {
  const apply = async (current) => {
    if (!current) {
      const created = await adminGraphql(/* GraphQL */ `
        mutation CreateForumActivity($input: CreateForumActivityInput!) {
          createForumActivity(input: $input) { ${ACTIVITY_FIELDS} }
        }
      `, { input: { id, ...extra, ...change(null) } });
      return created?.createForumActivity || null;
    }
    const updated = await adminGraphql(/* GraphQL */ `
      mutation UpdateForumActivity($input: UpdateForumActivityInput!) {
        updateForumActivity(input: $input) { ${ACTIVITY_FIELDS} }
      }
    `, { input: { id, ...extra, ...change(current), _version: current._version } });
    return updated?.updateForumActivity || null;
  };

  try {
    return await apply(await getActivity(id));
  } catch (error) {
    if (!isConflict(error)) throw error;
    return apply(await getActivity(id));
  }
}

export async function createTrustedThread({ token, username, boardSlug, title, body, gameId = null, id = null }) {
  if (!boardById(boardSlug)) throw new Error("Unknown board.");
  const requestedId = id ? String(id) : "";
  const requestedGameId = gameId ? String(gameId) : "";
  if (requestedId || requestedGameId) {
    if (!requestedId || !requestedGameId || requestedId !== gameThreadId(requestedGameId)) {
      throw new Error("Invalid game thread.");
    }
  }
  const authorName = await displayNameForToken(token, username);
  const cleanTitle = validateTitle(title);
  const cleanBody = await requireForumBody(body);
  const postedAt = new Date().toISOString();
  const excerpt = excerptFromHtml(cleanBody);
  const number = await nextThreadNumber();
  const input = {
    boardSlug,
    feed: FORUM_FEED,
    authorId: username,
    owner: username,
    number,
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
  if (requestedId) {
    input.id = requestedId;
    input.gameId = requestedGameId;
  }

  const created = await adminGraphql(/* GraphQL */ `
    mutation CreateForumThread($input: CreateForumThreadInput!) {
      createForumThread(input: $input) { ${THREAD_FIELDS} }
    }
  `, { input });
  const thread = created?.createForumThread;
  if (thread?.id) {
    await writeActivity(thread.id, () => ({
      boardSlug,
      lastActivityAt: postedAt,
      score: 0,
      replyCount: 0,
      viewCount: 0,
      lastPostAuthor: authorName,
      lastPostExcerpt: excerpt,
    }), { boardSlug });
  }
  return thread;
}

async function getThread(id) {
  const data = await adminGraphql(/* GraphQL */ `
    query GetForumThread($id: ID!) {
      getForumThread(id: $id) { ${THREAD_FIELDS} }
    }
  `, { id });
  const thread = data?.getForumThread;
  return thread && !thread._deleted ? thread : null;
}

export async function createTrustedReply({ token, username, threadId, body, parentReplyId = null }) {
  const thread = await getThread(threadId);
  if (!thread) throw new Error("That thread does not exist.");
  const authorName = await displayNameForToken(token, username);
  const cleanBody = await requireForumBody(body);
  const postedAt = new Date().toISOString();
  const excerpt = excerptFromHtml(cleanBody);
  const created = await adminGraphql(/* GraphQL */ `
    mutation CreateForumReply($input: CreateForumReplyInput!) {
      createForumReply(input: $input) { ${REPLY_FIELDS} }
    }
  `, {
    input: {
      threadId: thread.id,
      ...(parentReplyId ? { parentReplyId } : {}),
      body: cleanBody,
      authorName,
      authorId: username,
      owner: username,
      score: 0,
      postedAt,
    },
  });

  await writeActivity(thread.id, (current) => ({
    boardSlug: thread.boardSlug,
    replyCount: (current?.replyCount ?? thread.replyCount ?? 0) + 1,
    lastActivityAt: postedAt,
    lastPostAuthor: authorName,
    lastPostExcerpt: excerpt,
    score: current?.score ?? thread.score ?? 0,
    viewCount: current?.viewCount ?? thread.viewCount ?? 0,
  }), { boardSlug: thread.boardSlug });

  return created?.createForumReply;
}

export async function viewTrustedThread({ id, boardSlug }) {
  if (!id) throw new Error("Missing thread.");
  return writeActivity(id, (current) => ({
    boardSlug: boardSlug || current?.boardSlug,
    viewCount: (current?.viewCount || 0) + 1,
    score: current?.score || 0,
    replyCount: current?.replyCount || 0,
    lastActivityAt: current?.lastActivityAt,
    lastPostAuthor: current?.lastPostAuthor,
    lastPostExcerpt: current?.lastPostExcerpt,
  }), boardSlug ? { boardSlug } : {});
}

export async function voteTrustedTarget({ id, boardSlug, delta }) {
  if (!id) throw new Error("Missing target.");
  const change = delta === -1 ? -1 : 1;
  return writeActivity(id, (current) => ({
    ...(boardSlug ? { boardSlug } : {}),
    score: Math.max(0, (current?.score || 0) + change),
    replyCount: current?.replyCount || 0,
    viewCount: current?.viewCount || 0,
    lastActivityAt: current?.lastActivityAt,
    lastPostAuthor: current?.lastPostAuthor,
    lastPostExcerpt: current?.lastPostExcerpt,
  }), boardSlug ? { boardSlug } : {});
}

export async function markTrustedDeleted({ id, boardSlug }) {
  if (!id) throw new Error("Missing target.");
  return writeActivity(id, (current) => ({
    boardSlug: boardSlug || current?.boardSlug,
    lastPostAuthor: "deleted",
    lastPostExcerpt: "Deleted",
    lastActivityAt: current?.lastActivityAt,
    score: current?.score || 0,
    replyCount: current?.replyCount || 0,
    viewCount: current?.viewCount || 0,
  }), boardSlug ? { boardSlug } : {});
}
