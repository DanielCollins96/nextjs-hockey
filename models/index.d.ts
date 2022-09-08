import { ModelInit, MutableModel } from "@aws-amplify/datastore";





export declare class Post {
  readonly id: string;
  readonly userId?: string | null;
  readonly subject?: string | null;
  readonly content?: string | null;
  readonly name?: string | null;
  constructor(init: ModelInit<Post>);
  static copyOf(source: Post, mutator: (draft: MutableModel<Post>) => MutableModel<Post> | void): Post;
}

export declare class Comment {
  readonly id: string;
  readonly PostID?: string | null;
  readonly UserID?: string | null;
  readonly Content?: string | null;
  constructor(init: ModelInit<Comment>);
  static copyOf(source: Comment, mutator: (draft: MutableModel<Comment>) => MutableModel<Comment> | void): Comment;
}