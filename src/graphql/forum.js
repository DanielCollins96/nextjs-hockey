const boardFields = `
  id
  slug
  title
  description
  section
  teamAbbrev
  sortOrder
  threadCount
  postCount
  lastPostTitle
  lastPostAuthor
  lastPostAt
  _version
  _deleted
  _lastChangedAt
  createdAt
  updatedAt
`;

const threadFields = `
  id
  boardSlug
  gameId
  feed
  authorId
  number
  title
  body
  authorName
  score
  replyCount
  viewCount
  postedAt
  lastActivityAt
  lastPostAuthor
  lastPostExcerpt
  owner
  _version
  _deleted
  _lastChangedAt
  createdAt
  updatedAt
`;

const replyFields = `
  id
  threadId
  body
  authorName
  authorId
  parentReplyId
  score
  postedAt
  owner
  _version
  _deleted
  _lastChangedAt
  createdAt
  updatedAt
`;

const voteFields = `
  id
  targetId
  targetType
  value
  owner
  _version
  _deleted
  _lastChangedAt
  createdAt
  updatedAt
`;

export const getForumBoard = /* GraphQL */ `
  query GetForumBoard($id: ID!) {
    getForumBoard(id: $id) {
      ${boardFields}
    }
  }
`;

export const listForumBoards = /* GraphQL */ `
  query ListForumBoards($limit: Int, $nextToken: String) {
    listForumBoards(limit: $limit, nextToken: $nextToken) {
      items {
        ${boardFields}
      }
      nextToken
    }
  }
`;

export const getForumThread = /* GraphQL */ `
  query GetForumThread($id: ID!) {
    getForumThread(id: $id) {
      ${threadFields}
    }
  }
`;

export const threadsByBoard = /* GraphQL */ `
  query ThreadsByBoard(
    $boardSlug: String!
    $sortDirection: ModelSortDirection
    $limit: Int
    $nextToken: String
  ) {
    threadsByBoard(
      boardSlug: $boardSlug
      sortDirection: $sortDirection
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        ${threadFields}
      }
      nextToken
    }
  }
`;

export const threadsByFeed = /* GraphQL */ `
  query ThreadsByFeed(
    $feed: String!
    $sortDirection: ModelSortDirection
    $limit: Int
    $nextToken: String
  ) {
    threadsByFeed(
      feed: $feed
      sortDirection: $sortDirection
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        ${threadFields}
      }
      nextToken
    }
  }
`;

export const threadsByAuthor = /* GraphQL */ `
  query ThreadsByAuthor(
    $authorId: String!
    $sortDirection: ModelSortDirection
    $limit: Int
    $nextToken: String
  ) {
    threadsByAuthor(
      authorId: $authorId
      sortDirection: $sortDirection
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        ${threadFields}
      }
      nextToken
    }
  }
`;

export const threadsByNumber = /* GraphQL */ `
  query ThreadsByNumber(
    $number: Int!
    $sortDirection: ModelSortDirection
    $limit: Int
    $nextToken: String
  ) {
    threadsByNumber(
      number: $number
      sortDirection: $sortDirection
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        ${threadFields}
      }
      nextToken
    }
  }
`;

export const createForumThread = /* GraphQL */ `
  mutation CreateForumThread($input: CreateForumThreadInput!) {
    createForumThread(input: $input) {
      ${threadFields}
    }
  }
`;

export const updateForumThread = /* GraphQL */ `
  mutation UpdateForumThread($input: UpdateForumThreadInput!) {
    updateForumThread(input: $input) {
      ${threadFields}
    }
  }
`;

export const deleteForumThread = /* GraphQL */ `
  mutation DeleteForumThread($input: DeleteForumThreadInput!) {
    deleteForumThread(input: $input) {
      ${threadFields}
    }
  }
`;

export const getForumReply = /* GraphQL */ `
  query GetForumReply($id: ID!) {
    getForumReply(id: $id) {
      ${replyFields}
    }
  }
`;

export const repliesByThread = /* GraphQL */ `
  query RepliesByThread(
    $threadId: ID!
    $sortDirection: ModelSortDirection
    $limit: Int
    $nextToken: String
  ) {
    repliesByThread(
      threadId: $threadId
      sortDirection: $sortDirection
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        ${replyFields}
      }
      nextToken
    }
  }
`;

export const createForumReply = /* GraphQL */ `
  mutation CreateForumReply($input: CreateForumReplyInput!) {
    createForumReply(input: $input) {
      ${replyFields}
    }
  }
`;

export const updateForumReply = /* GraphQL */ `
  mutation UpdateForumReply($input: UpdateForumReplyInput!) {
    updateForumReply(input: $input) {
      ${replyFields}
    }
  }
`;

export const deleteForumReply = /* GraphQL */ `
  mutation DeleteForumReply($input: DeleteForumReplyInput!) {
    deleteForumReply(input: $input) {
      ${replyFields}
    }
  }
`;

export const getForumVote = /* GraphQL */ `
  query GetForumVote($id: ID!) {
    getForumVote(id: $id) {
      ${voteFields}
    }
  }
`;

export const createForumVote = /* GraphQL */ `
  mutation CreateForumVote($input: CreateForumVoteInput!) {
    createForumVote(input: $input) {
      ${voteFields}
    }
  }
`;

export const updateForumVote = /* GraphQL */ `
  mutation UpdateForumVote($input: UpdateForumVoteInput!) {
    updateForumVote(input: $input) {
      ${voteFields}
    }
  }
`;

const activityFields = `
  id
  boardSlug
  lastActivityAt
  score
  replyCount
  viewCount
  lastPostAuthor
  lastPostExcerpt
  _version
  _deleted
  _lastChangedAt
  createdAt
  updatedAt
`;

export const getForumActivity = /* GraphQL */ `
  query GetForumActivity($id: ID!) {
    getForumActivity(id: $id) {
      ${activityFields}
    }
  }
`;

export const createForumActivity = /* GraphQL */ `
  mutation CreateForumActivity($input: CreateForumActivityInput!) {
    createForumActivity(input: $input) {
      ${activityFields}
    }
  }
`;

export const updateForumActivity = /* GraphQL */ `
  mutation UpdateForumActivity($input: UpdateForumActivityInput!) {
    updateForumActivity(input: $input) {
      ${activityFields}
    }
  }
`;

export const getForumCounter = /* GraphQL */ `
  query GetForumCounter($id: ID!) {
    getForumCounter(id: $id) {
      id
      value
      _version
      _deleted
    }
  }
`;

export const createForumCounter = /* GraphQL */ `
  mutation CreateForumCounter($input: CreateForumCounterInput!) {
    createForumCounter(input: $input) {
      id
      value
      _version
    }
  }
`;

export const updateForumCounter = /* GraphQL */ `
  mutation UpdateForumCounter($input: UpdateForumCounterInput!) {
    updateForumCounter(input: $input) {
      id
      value
      _version
    }
  }
`;
