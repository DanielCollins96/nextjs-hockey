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