/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreatePost = /* GraphQL */ `
  subscription OnCreatePost {
    onCreatePost {
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
export const onUpdatePost = /* GraphQL */ `
  subscription OnUpdatePost {
    onUpdatePost {
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
export const onDeletePost = /* GraphQL */ `
  subscription OnDeletePost {
    onDeletePost {
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
export const onCreateComment = /* GraphQL */ `
  subscription OnCreateComment {
    onCreateComment {
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
export const onUpdateComment = /* GraphQL */ `
  subscription OnUpdateComment {
    onUpdateComment {
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
export const onDeleteComment = /* GraphQL */ `
  subscription OnDeleteComment {
    onDeleteComment {
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
export const onCreateForumBoard = /* GraphQL */ `
  subscription OnCreateForumBoard {
    onCreateForumBoard {
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
export const onUpdateForumBoard = /* GraphQL */ `
  subscription OnUpdateForumBoard {
    onUpdateForumBoard {
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
export const onDeleteForumBoard = /* GraphQL */ `
  subscription OnDeleteForumBoard {
    onDeleteForumBoard {
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
export const onCreateForumVote = /* GraphQL */ `
  subscription OnCreateForumVote($owner: String) {
    onCreateForumVote(owner: $owner) {
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
export const onUpdateForumVote = /* GraphQL */ `
  subscription OnUpdateForumVote($owner: String) {
    onUpdateForumVote(owner: $owner) {
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
export const onDeleteForumVote = /* GraphQL */ `
  subscription OnDeleteForumVote($owner: String) {
    onDeleteForumVote(owner: $owner) {
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
