// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { Post, Comment, ForumBoard, ForumThread, ForumReply, ForumVote } = initSchema(schema);

export {
  Post,
  Comment,
  ForumBoard,
  ForumThread,
  ForumReply,
  ForumVote
};