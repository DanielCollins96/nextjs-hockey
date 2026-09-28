/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createPost = /* GraphQL */ `
  mutation CreatePost(
    $input: CreatePostInput!
    $condition: ModelPostConditionInput
  ) {
    createPost(input: $input, condition: $condition) {
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
export const updatePost = /* GraphQL */ `
  mutation UpdatePost(
    $input: UpdatePostInput!
    $condition: ModelPostConditionInput
  ) {
    updatePost(input: $input, condition: $condition) {
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
export const deletePost = /* GraphQL */ `
  mutation DeletePost(
    $input: DeletePostInput!
    $condition: ModelPostConditionInput
  ) {
    deletePost(input: $input, condition: $condition) {
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
export const createComment = /* GraphQL */ `
  mutation CreateComment(
    $input: CreateCommentInput!
    $condition: ModelCommentConditionInput
  ) {
    createComment(input: $input, condition: $condition) {
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
export const updateComment = /* GraphQL */ `
  mutation UpdateComment(
    $input: UpdateCommentInput!
    $condition: ModelCommentConditionInput
  ) {
    updateComment(input: $input, condition: $condition) {
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
export const deleteComment = /* GraphQL */ `
  mutation DeleteComment(
    $input: DeleteCommentInput!
    $condition: ModelCommentConditionInput
  ) {
    deleteComment(input: $input, condition: $condition) {
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
export const createForumBoard = /* GraphQL */ `
  mutation CreateForumBoard(
    $input: CreateForumBoardInput!
    $condition: ModelForumBoardConditionInput
  ) {
    createForumBoard(input: $input, condition: $condition) {
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
export const updateForumBoard = /* GraphQL */ `
  mutation UpdateForumBoard(
    $input: UpdateForumBoardInput!
    $condition: ModelForumBoardConditionInput
  ) {
    updateForumBoard(input: $input, condition: $condition) {
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
export const deleteForumBoard = /* GraphQL */ `
  mutation DeleteForumBoard(
    $input: DeleteForumBoardInput!
    $condition: ModelForumBoardConditionInput
  ) {
    deleteForumBoard(input: $input, condition: $condition) {
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
export const createForumThread = /* GraphQL */ `
  mutation CreateForumThread(
    $input: CreateForumThreadInput!
    $condition: ModelForumThreadConditionInput
  ) {
    createForumThread(input: $input, condition: $condition) {
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
export const updateForumThread = /* GraphQL */ `
  mutation UpdateForumThread(
    $input: UpdateForumThreadInput!
    $condition: ModelForumThreadConditionInput
  ) {
    updateForumThread(input: $input, condition: $condition) {
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
export const deleteForumThread = /* GraphQL */ `
  mutation DeleteForumThread(
    $input: DeleteForumThreadInput!
    $condition: ModelForumThreadConditionInput
  ) {
    deleteForumThread(input: $input, condition: $condition) {
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
export const createForumReply = /* GraphQL */ `
  mutation CreateForumReply(
    $input: CreateForumReplyInput!
    $condition: ModelForumReplyConditionInput
  ) {
    createForumReply(input: $input, condition: $condition) {
      id
      threadId
      authorId
      parentReplyId
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
export const updateForumReply = /* GraphQL */ `
  mutation UpdateForumReply(
    $input: UpdateForumReplyInput!
    $condition: ModelForumReplyConditionInput
  ) {
    updateForumReply(input: $input, condition: $condition) {
      id
      threadId
      authorId
      parentReplyId
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
export const deleteForumReply = /* GraphQL */ `
  mutation DeleteForumReply(
    $input: DeleteForumReplyInput!
    $condition: ModelForumReplyConditionInput
  ) {
    deleteForumReply(input: $input, condition: $condition) {
      id
      threadId
      authorId
      parentReplyId
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
export const createForumVote = /* GraphQL */ `
  mutation CreateForumVote(
    $input: CreateForumVoteInput!
    $condition: ModelForumVoteConditionInput
  ) {
    createForumVote(input: $input, condition: $condition) {
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
export const updateForumVote = /* GraphQL */ `
  mutation UpdateForumVote(
    $input: UpdateForumVoteInput!
    $condition: ModelForumVoteConditionInput
  ) {
    updateForumVote(input: $input, condition: $condition) {
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
export const deleteForumVote = /* GraphQL */ `
  mutation DeleteForumVote(
    $input: DeleteForumVoteInput!
    $condition: ModelForumVoteConditionInput
  ) {
    deleteForumVote(input: $input, condition: $condition) {
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
