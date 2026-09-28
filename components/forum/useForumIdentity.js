import { useQuery } from "react-query";
import { API, graphqlOperation } from "aws-amplify";
import toast from "react-hot-toast";

import { UseAuth } from "../../contexts/Auth";
import * as mutations from "../../src/graphql/mutations";
import * as queries from "../../src/graphql/queries";
import {
  PROFILE_BIO_SUBJECT,
  isProfileBioPost,
  parseProfileContent,
  serializeProfileContent,
} from "../../lib/user-profile";
import { validateDisplayName } from "../../lib/forum-content";

async function loadIdentity(username) {
  const result = await API.graphql(
    graphqlOperation(queries.listPosts, {
      limit: 20,
      filter: {
        userId: { eq: username },
        subject: { eq: PROFILE_BIO_SUBJECT },
      },
    })
  );
  const post = (result?.data?.listPosts?.items || []).find(
    (item) => item && !item._deleted && isProfileBioPost(item)
  );
  const profile = parseProfileContent(post?.content);
  return {
    post: post || null,
    username: profile.username || "",
    bio: profile.bio || "",
  };
}

export function useForumIdentity() {
  const { user } = UseAuth();
  const query = useQuery(
    ["forum-identity", user?.username],
    () => loadIdentity(user.username),
    { enabled: Boolean(user?.username) }
  );

  const saveDisplayName = async (name) => {
    const username = validateDisplayName(name);
    const current = query.data || { post: null, bio: "" };
    const content = serializeProfileContent({
      username,
      bio: current.bio || "",
    });

    if (current.post?._version) {
      await API.graphql(
        graphqlOperation(mutations.updatePost, {
          input: {
            id: current.post.id,
            userId: user.username,
            subject: PROFILE_BIO_SUBJECT,
            content,
            name: "Profile",
            _version: current.post._version,
          },
        })
      );
    } else {
      await API.graphql(
        graphqlOperation(mutations.createPost, {
          input: {
            userId: user.username,
            subject: PROFILE_BIO_SUBJECT,
            content,
            name: "Profile",
          },
        })
      );
    }

    await query.refetch();
    toast.success("Display name saved");
    return username;
  };

  return {
    user,
    authorName: query.data?.username || "",
    needsName: Boolean(user?.username) && query.isSuccess && !query.data?.username,
    isLoading: Boolean(user?.username) && query.isLoading,
    saveDisplayName,
  };
}
