/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getPost = /* GraphQL */ `
  query GetPost($id: ID!) {
    getPost(id: $id) {
      id
      userId
      subject
      content
      name
      _version
      _deleted
      _lastChangedAt
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listPosts = /* GraphQL */ `
  query ListPosts(
    $filter: ModelPostFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listPosts(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        userId
        subject
        content
        name
        _version
        _deleted
        _lastChangedAt
        createdAt
        updatedAt
        __typename
      }
      nextToken
      startedAt
      __typename
    }
  }
`;
export const syncPosts = /* GraphQL */ `
  query SyncPosts(
    $filter: ModelPostFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncPosts(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
        id
        userId
        subject
        content
        name
        _version
        _deleted
        _lastChangedAt
        createdAt
        updatedAt
        __typename
      }
      nextToken
      startedAt
      __typename
    }
  }
`;
export const getComment = /* GraphQL */ `
  query GetComment($id: ID!) {
    getComment(id: $id) {
      id
      PostID
      UserID
      Content
      _version
      _deleted
      _lastChangedAt
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listComments = /* GraphQL */ `
  query ListComments(
    $filter: ModelCommentFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listComments(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        PostID
        UserID
        Content
        _version
        _deleted
        _lastChangedAt
        createdAt
        updatedAt
        __typename
      }
      nextToken
      startedAt
      __typename
    }
  }
`;
export const syncComments = /* GraphQL */ `
  query SyncComments(
    $filter: ModelCommentFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncComments(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
        id
        PostID
        UserID
        Content
        _version
        _deleted
        _lastChangedAt
        createdAt
        updatedAt
        __typename
      }
      nextToken
      startedAt
      __typename
    }
  }
`;
export const getForumBoard = /* GraphQL */ `
  query GetForumBoard($id: ID!) {
    getForumBoard(id: $id) {
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
      __typename
    }
  }
`;
export const listForumBoards = /* GraphQL */ `
  query ListForumBoards(
    $filter: ModelForumBoardFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listForumBoards(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
        __typename
      }
      nextToken
      startedAt
      __typename
    }
  }
`;
export const syncForumBoards = /* GraphQL */ `
  query SyncForumBoards(
    $filter: ModelForumBoardFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncForumBoards(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
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
        __typename
      }
      nextToken
      startedAt
      __typename
    }
  }
`;
export const threadsByBoard = /* GraphQL */ `
  query ThreadsByBoard(
    $boardSlug: String
    $lastActivityAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelForumThreadFilterInput
    $limit: Int
    $nextToken: String
  ) {
    threadsByBoard(
      boardSlug: $boardSlug
      lastActivityAt: $lastActivityAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        boardSlug
        gameId
        feed
        authorId
        score
        replyCount
        viewCount
        postedAt
        lastActivityAt
        lastPostAuthor
        lastPostExcerpt
        _version
        _deleted
        _lastChangedAt
        createdAt
        updatedAt
        owner
        title
        body
        authorName
        __typename
      }
      nextToken
      startedAt
      __typename
    }
  }
`;
export const threadsByFeed = /* GraphQL */ `
  query ThreadsByFeed(
    $feed: String
    $postedAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelForumThreadFilterInput
    $limit: Int
    $nextToken: String
  ) {
    threadsByFeed(
      feed: $feed
      postedAt: $postedAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        boardSlug
        gameId
        feed
        authorId
        score
        replyCount
        viewCount
        postedAt
        lastActivityAt
        lastPostAuthor
        lastPostExcerpt
        _version
        _deleted
        _lastChangedAt
        createdAt
        updatedAt
        owner
        title
        body
        authorName
        __typename
      }
      nextToken
      startedAt
      __typename
    }
  }
`;
export const threadsByAuthor = /* GraphQL */ `
  query ThreadsByAuthor(
    $authorId: String
    $postedAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelForumThreadFilterInput
    $limit: Int
    $nextToken: String
  ) {
    threadsByAuthor(
      authorId: $authorId
      postedAt: $postedAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        boardSlug
        gameId
        feed
        authorId
        score
        replyCount
        viewCount
        postedAt
        lastActivityAt
        lastPostAuthor
        lastPostExcerpt
        _version
        _deleted
        _lastChangedAt
        createdAt
        updatedAt
        owner
        title
        body
        authorName
        __typename
      }
      nextToken
      startedAt
      __typename
    }
  }
`;
export const syncForumThreads = /* GraphQL */ `
  query SyncForumThreads(
    $filter: ModelForumThreadFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncForumThreads(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
        id
        boardSlug
        gameId
        feed
        authorId
        score
        replyCount
        viewCount
        postedAt
        lastActivityAt
        lastPostAuthor
        lastPostExcerpt
        _version
        _deleted
        _lastChangedAt
        createdAt
        updatedAt
        owner
        title
        body
        authorName
        __typename
      }
      nextToken
      startedAt
      __typename
    }
  }
`;
export const getForumThread = /* GraphQL */ `
  query GetForumThread($id: ID!) {
    getForumThread(id: $id) {
      id
      boardSlug
      gameId
      feed
      authorId
      score
      replyCount
      viewCount
      postedAt
      lastActivityAt
      lastPostAuthor
      lastPostExcerpt
      _version
      _deleted
      _lastChangedAt
      createdAt
      updatedAt
      owner
      title
      body
      authorName
      __typename
    }
  }
`;
export const listForumThreads = /* GraphQL */ `
  query ListForumThreads(
    $filter: ModelForumThreadFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listForumThreads(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        boardSlug
        gameId
        feed
        authorId
        score
        replyCount
        viewCount
        postedAt
        lastActivityAt
        lastPostAuthor
        lastPostExcerpt
        _version
        _deleted
        _lastChangedAt
        createdAt
        updatedAt
        owner
        title
        body
        authorName
        __typename
      }
      nextToken
      startedAt
      __typename
    }
  }
`;
export const repliesByThread = /* GraphQL */ `
  query RepliesByThread(
    $threadId: ID
    $postedAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelForumReplyFilterInput
    $limit: Int
    $nextToken: String
  ) {
    repliesByThread(
      threadId: $threadId
      postedAt: $postedAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        threadId
        authorId
        score
        postedAt
        _version
        _deleted
        _lastChangedAt
        createdAt
        updatedAt
        owner
        body
        authorName
        __typename
      }
      nextToken
      startedAt
      __typename
    }
  }
`;
export const syncForumReplies = /* GraphQL */ `
  query SyncForumReplies(
    $filter: ModelForumReplyFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncForumReplies(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
        id
        threadId
        authorId
        score
        postedAt
        _version
        _deleted
        _lastChangedAt
        createdAt
        updatedAt
        owner
        body
        authorName
        __typename
      }
      nextToken
      startedAt
      __typename
    }
  }
`;
export const getForumReply = /* GraphQL */ `
  query GetForumReply($id: ID!) {
    getForumReply(id: $id) {
      id
      threadId
      authorId
      score
      postedAt
      _version
      _deleted
      _lastChangedAt
      createdAt
      updatedAt
      owner
      body
      authorName
      __typename
    }
  }
`;
export const listForumReplys = /* GraphQL */ `
  query ListForumReplys(
    $filter: ModelForumReplyFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listForumReplys(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        threadId
        authorId
        score
        postedAt
        _version
        _deleted
        _lastChangedAt
        createdAt
        updatedAt
        owner
        body
        authorName
        __typename
      }
      nextToken
      startedAt
      __typename
    }
  }
`;
export const getForumVote = /* GraphQL */ `
  query GetForumVote($id: ID!) {
    getForumVote(id: $id) {
      id
      targetId
      targetType
      value
      _version
      _deleted
      _lastChangedAt
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const listForumVotes = /* GraphQL */ `
  query ListForumVotes(
    $filter: ModelForumVoteFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listForumVotes(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        targetId
        targetType
        value
        _version
        _deleted
        _lastChangedAt
        createdAt
        updatedAt
        owner
        __typename
      }
      nextToken
      startedAt
      __typename
    }
  }
`;
export const syncForumVotes = /* GraphQL */ `
  query SyncForumVotes(
    $filter: ModelForumVoteFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncForumVotes(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
        id
        targetId
        targetType
        value
        _version
        _deleted
        _lastChangedAt
        createdAt
        updatedAt
        owner
        __typename
      }
      nextToken
      startedAt
      __typename
    }
  }
`;
