import { API, Auth, graphqlOperation } from "aws-amplify";

import * as queries from "../src/graphql/queries";
import { validateDisplayName } from "./forum-content";
import { isProfileBioPost, parseProfileContent, PROFILE_BIO_SUBJECT } from "./user-profile";

export async function displayNameForUser(username) {
  const name = String(username || "").trim();
  if (!name) return "";
  const result = await API.graphql(
    graphqlOperation(queries.listPosts, {
      limit: 20,
      filter: {
        userId: { eq: name },
        subject: { eq: PROFILE_BIO_SUBJECT },
      },
    })
  );
  const post = (result?.data?.listPosts?.items || []).find(
    (item) => item && !item._deleted && isProfileBioPost(item)
  );
  const usernameValue = parseProfileContent(post?.content).username || "";
  if (!usernameValue) return "";
  return validateDisplayName(usernameValue);
}

export async function forumAuthorFromAuth() {
  const user = await Auth.currentAuthenticatedUser();
  const authorId = String(user?.username || "").trim();
  if (!authorId) throw new Error("Log in to post.");
  const authorName = await displayNameForUser(authorId);
  if (!authorName) throw new Error("Set a display name before posting.");
  return { authorId, authorName, user };
}
