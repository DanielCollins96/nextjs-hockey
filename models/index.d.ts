import { ModelInit, MutableModel } from "@aws-amplify/datastore";
// @ts-ignore
import { LazyLoading, LazyLoadingDisabled } from "@aws-amplify/datastore";













type EagerPost = {
  readonly id: string;
  readonly userId: string;
  readonly subject?: string | null;
  readonly content: string;
  readonly name?: string | null;
}

type LazyPost = {
  readonly id: string;
  readonly userId: string;
  readonly subject?: string | null;
  readonly content: string;
  readonly name?: string | null;
}

export declare type Post = LazyLoading extends LazyLoadingDisabled ? EagerPost : LazyPost

export declare const Post: (new (init: ModelInit<Post>) => Post) & {
  copyOf(source: Post, mutator: (draft: MutableModel<Post>) => MutableModel<Post> | void): Post;
}

type EagerComment = {
  readonly id: string;
  readonly PostID?: string | null;
  readonly UserID?: string | null;
  readonly Content?: string | null;
}

type LazyComment = {
  readonly id: string;
  readonly PostID?: string | null;
  readonly UserID?: string | null;
  readonly Content?: string | null;
}

export declare type Comment = LazyLoading extends LazyLoadingDisabled ? EagerComment : LazyComment

export declare const Comment: (new (init: ModelInit<Comment>) => Comment) & {
  copyOf(source: Comment, mutator: (draft: MutableModel<Comment>) => MutableModel<Comment> | void): Comment;
}

type EagerForumBoard = {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly description?: string | null;
  readonly section: string;
  readonly teamAbbrev?: string | null;
  readonly sortOrder: number;
  readonly threadCount?: number | null;
  readonly postCount?: number | null;
  readonly lastPostTitle?: string | null;
  readonly lastPostAuthor?: string | null;
  readonly lastPostAt?: string | null;
}

type LazyForumBoard = {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly description?: string | null;
  readonly section: string;
  readonly teamAbbrev?: string | null;
  readonly sortOrder: number;
  readonly threadCount?: number | null;
  readonly postCount?: number | null;
  readonly lastPostTitle?: string | null;
  readonly lastPostAuthor?: string | null;
  readonly lastPostAt?: string | null;
}

export declare type ForumBoard = LazyLoading extends LazyLoadingDisabled ? EagerForumBoard : LazyForumBoard

export declare const ForumBoard: (new (init: ModelInit<ForumBoard>) => ForumBoard) & {
  copyOf(source: ForumBoard, mutator: (draft: MutableModel<ForumBoard>) => MutableModel<ForumBoard> | void): ForumBoard;
}

type EagerForumThread = {
  readonly id: string;
  readonly boardSlug: string;
  readonly gameId?: string | null;
  readonly feed: string;
  readonly authorId: string;
  readonly title: string;
  readonly body: string;
  readonly authorName: string;
  readonly score: number;
  readonly replyCount: number;
  readonly viewCount?: number | null;
  readonly postedAt: string;
  readonly lastActivityAt: string;
  readonly lastPostAuthor?: string | null;
  readonly lastPostExcerpt?: string | null;
}

type LazyForumThread = {
  readonly id: string;
  readonly boardSlug: string;
  readonly gameId?: string | null;
  readonly feed: string;
  readonly authorId: string;
  readonly title: string;
  readonly body: string;
  readonly authorName: string;
  readonly score: number;
  readonly replyCount: number;
  readonly viewCount?: number | null;
  readonly postedAt: string;
  readonly lastActivityAt: string;
  readonly lastPostAuthor?: string | null;
  readonly lastPostExcerpt?: string | null;
}

export declare type ForumThread = LazyLoading extends LazyLoadingDisabled ? EagerForumThread : LazyForumThread

export declare const ForumThread: (new (init: ModelInit<ForumThread>) => ForumThread) & {
  copyOf(source: ForumThread, mutator: (draft: MutableModel<ForumThread>) => MutableModel<ForumThread> | void): ForumThread;
}

type EagerForumReply = {
  readonly id: string;
  readonly threadId: string;
  readonly body: string;
  readonly authorName: string;
  readonly authorId: string;
  readonly parentReplyId?: string | null;
  readonly score?: number | null;
  readonly postedAt: string;
}

type LazyForumReply = {
  readonly id: string;
  readonly threadId: string;
  readonly body: string;
  readonly authorName: string;
  readonly authorId: string;
  readonly parentReplyId?: string | null;
  readonly score?: number | null;
  readonly postedAt: string;
}

export declare type ForumReply = LazyLoading extends LazyLoadingDisabled ? EagerForumReply : LazyForumReply

export declare const ForumReply: (new (init: ModelInit<ForumReply>) => ForumReply) & {
  copyOf(source: ForumReply, mutator: (draft: MutableModel<ForumReply>) => MutableModel<ForumReply> | void): ForumReply;
}

type EagerForumVote = {
  readonly id: string;
  readonly targetId: string;
  readonly targetType: string;
  readonly value: number;
}

type LazyForumVote = {
  readonly id: string;
  readonly targetId: string;
  readonly targetType: string;
  readonly value: number;
}

export declare type ForumVote = LazyLoading extends LazyLoadingDisabled ? EagerForumVote : LazyForumVote

export declare const ForumVote: (new (init: ModelInit<ForumVote>) => ForumVote) & {
  copyOf(source: ForumVote, mutator: (draft: MutableModel<ForumVote>) => MutableModel<ForumVote> | void): ForumVote;
}