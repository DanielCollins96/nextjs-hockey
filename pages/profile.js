import React, {useEffect, useState} from "react";
import {UseAuth} from "../contexts/Auth";
import {useQuery} from "react-query";
import {API, graphqlOperation} from "aws-amplify";
import {Tab, Tabs, TabList, TabPanel} from "react-tabs";
import toast from "react-hot-toast";
import "react-tabs/style/react-tabs.css";

import * as queries from "../src/graphql/queries";
import * as mutations from "../src/graphql/mutations";
import PostEditor from "../components/PostEditor";
import PostsList from "../components/PostsList";
import ConfirmDialog from "../components/ConfirmDialog";
import { teamUrl } from "../lib/routes";
import {
  PROFILE_BIO_SUBJECT,
  getNormalizedSubject,
  isProfileBioPost,
  parseProfileContent,
  serializeProfileContent,
} from "../lib/user-profile";

const THREAD_SUBJECT_PREFIX_REGEX = /^THREAD#/i;

function isThreadSubject(post) {
  return THREAD_SUBJECT_PREFIX_REGEX.test(getNormalizedSubject(post));
}

function parseThreadPost(post) {
  const subject = getNormalizedSubject(post);
  if (!isThreadSubject(post)) {
    return { isThreadPost: false };
  }

  const parts = subject.split("#");
  const rawType = (parts[1] || "UNKNOWN").toUpperCase();
  const threadId = parts[2] || "";
  const rawThreadSubject = parts.slice(3).join("#");
  const cleanSubject = rawThreadSubject?.trim() || "General";

  let threadLink = null;
  if (rawType === "TEAM" && threadId) {
    threadLink = teamUrl(cleanSubject, threadId);
  } else if (rawType === "GAME" && threadId) {
    threadLink = `/games/${threadId}`;
  }

  return {
    isThreadPost: true,
    threadType: rawType,
    threadId,
    cleanSubject,
    threadLink,
    threadLabel: threadId ? `${rawType} • ${threadId}` : rawType,
  };
}

function Profile() {
  const {user} = UseAuth();

  const [post, setPost] = useState({
    subject: "",
    content: "",
    name: "",
  });
  const [search, setSearch] = useState("");
  const [postDateOrder, setPostDateOrder] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [usernameDraft, setUsernameDraft] = useState("");
  const [bioDraft, setBioDraft] = useState("");
  const [savingBio, setSavingBio] = useState(false);

  const fetchPosts = async () => {
    try {
      let result = await API.graphql(
        graphqlOperation(queries.listPosts, {
          filter: {userId: {eq: user.username}},
        })
      );
      result = result.data.listPosts.items;
      result = result.filter((post) => {
        return post._deleted == null;
      });
      return result;
    } catch (err) {
      console.log("Error fetching posts");
      console.error(err);
      throw new Error(err);
    }
  };

  const {
    data: userPosts,
    status,
    refetch,
  } = useQuery(`userposts - ${user?.username}`, fetchPosts, {enabled: !!user});

  const profileBioPost = (userPosts || []).find(isProfileBioPost);
  const profile = parseProfileContent(profileBioPost?.content);
  const displayUsername = profile.username || "Member";

  useEffect(() => {
    if (status === "success") {
      setUsernameDraft(profile.username);
      setBioDraft(profile.bio);
    }
  }, [profile.bio, profile.username, status]);

  const sortedPosts = (posts = []) => {
    const copy = [...posts];
    return copy.sort((a, b) => {
      const left = new Date(a.createdAt).getTime();
      const right = new Date(b.createdAt).getTime();
      return postDateOrder ? right - left : left - right;
    });
  };

  const personalPosts = sortedPosts(
    (userPosts || []).filter(
      (post) => !isThreadSubject(post) && !isProfileBioPost(post)
    )
  );

  const boardPosts = sortedPosts(
    (userPosts || [])
      .map((post) => {
        const parsed = parseThreadPost(post);
        if (!parsed.isThreadPost) return null;

        return {
          ...post,
          subject: parsed.cleanSubject,
          threadLink: parsed.threadLink,
          threadLabel: parsed.threadLabel,
        };
      })
      .filter(Boolean)
  );

  const filteredPersonalPosts = personalPosts.filter(
    (post) =>
      (post.content || "").toUpperCase().includes(search.toUpperCase()) ||
      (post.subject || "").toUpperCase().includes(search.toUpperCase()) ||
      search === ""
  );

  const filteredBoardPosts = boardPosts.filter(
    (post) =>
      (post.content || "").toUpperCase().includes(search.toUpperCase()) ||
      (post.subject || "").toUpperCase().includes(search.toUpperCase()) ||
      (post.threadLabel || "").toUpperCase().includes(search.toUpperCase()) ||
      search === ""
  );

  const togglePostsDate = () => {
    setPostDateOrder(!postDateOrder);
  };

  const requestDeletePost = (id, _version) => {
    setDeleteTarget({id, _version});
  };

  const deletePost = async () => {
    if (!deleteTarget?.id || !deleteTarget?._version) return;

    setDeleting(true);
    try {
      await API.graphql(
        graphqlOperation(mutations.deletePost, {
          input: {id: deleteTarget.id, _version: deleteTarget._version},
        })
      );
      toast.success("Post deleted");
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      console.log({err});
      console.log(err.errors[0]?.message);
      toast.error(`Error deleting post: ${err.errors[0]?.message}`);
    } finally {
      setDeleting(false);
    }
  };

  const savePost = () => {
    const trimmedName = post.name?.trim();

    API.graphql(
      graphqlOperation(mutations.createPost, {
        input: {
          ...post,
          name: trimmedName || displayUsername,
          userId: user.username,
        },
      })
    )
      .then(() => {
        toast.success("Post saved");
        setPost({
          subject: "",
          content: "",
          name: "",
        });
        refetch();
      })
      .catch((err) => {
        console.error(err);
        toast.error("Error saving post");
      });
  };

  const saveProfile = async () => {
    if (!user?.username) return;

    const trimmedBio = bioDraft.trim();
    const trimmedUsername = usernameDraft.trim();
    setSavingBio(true);
    try {
      const profileContent = serializeProfileContent({
        username: trimmedUsername,
        bio: trimmedBio,
      });

      if (profileBioPost?._version) {
        await API.graphql(
          graphqlOperation(mutations.updatePost, {
            input: {
              id: profileBioPost.id,
              userId: user.username,
              subject: PROFILE_BIO_SUBJECT,
              content: profileContent,
              name: "Profile",
              _version: profileBioPost._version,
            },
          })
        );
      } else {
        await API.graphql(
          graphqlOperation(mutations.createPost, {
            input: {
              userId: user.username,
              subject: PROFILE_BIO_SUBJECT,
              content: profileContent,
              name: "Profile",
            },
          })
        );
      }

      toast.success("Profile saved");
      refetch();
    } catch (err) {
      console.error(err);
      toast.error("Error saving profile");
    } finally {
      setSavingBio(false);
    }
  };

  if (!user) {
    return (
      <p className="text-xl mx-auto mt-12 text-gray-900 dark:text-gray-100">
        Login to view profile!
      </p>
    );
  }

  return (
    <div>
      <div className="flex flex-col items-center sm:flex-row m-2 sm:items-start">
        <div className="bg-white dark:bg-gray-800 dark:text-gray-100 m-2 p-2 rounded">
          {user && (
            <h2 className="font-bold text-gray-900 dark:text-gray-100">
              {displayUsername}
            </h2>
          )}
          <div className="mt-3 rounded border border-gray-200 p-4 text-gray-700 dark:border-gray-700 dark:text-gray-100">
            <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">Bio</h3>
            <p className="whitespace-pre-wrap text-sm">
              {profile.bio || "No bio yet."}
            </p>
          </div>
        </div>
        <div className="w-11/12 sm:w-3/4 flex flex-col p-2 gap-2">
          <Tabs>
            <TabList className="flex gap-3 bg-gray-100 dark:bg-gray-900 p-2 rounded">
              <Tab className="px-3 py-1 rounded text-gray-900 dark:text-gray-100" selectedClassName="bg-red-300 dark:bg-red-600 text-white">Posts</Tab>
              <Tab className="px-3 py-1 rounded text-gray-900 dark:text-gray-100" selectedClassName="bg-red-300 dark:bg-red-600 text-white">Board Posts</Tab>
              <Tab className="px-3 py-1 rounded text-gray-900 dark:text-gray-100" selectedClassName="bg-red-300 dark:bg-red-600 text-white">Settings</Tab>
              <Tab className="px-3 py-1 rounded text-gray-900 dark:text-gray-100" selectedClassName="bg-red-300 dark:bg-red-600 text-white">Create Post</Tab>
            </TabList>
            <div className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded min-h-72 p-2">
              <TabPanel>
                <PostsList
                  error={status === "error"}
                  posts={filteredPersonalPosts}
                  search={search}
                  setSearch={setSearch}
                  deletePost={requestDeletePost}
                  toggle={togglePostsDate}
                />
              </TabPanel>
              <TabPanel>
                <PostsList
                  error={status === "error"}
                  posts={filteredBoardPosts}
                  search={search}
                  setSearch={setSearch}
                  deletePost={requestDeletePost}
                  toggle={togglePostsDate}
                />
              </TabPanel>
              <TabPanel>
                <div id="settings" className="max-w-2xl">
                  <label
                    htmlFor="profile-username"
                    className="mb-2 block font-medium text-gray-900 dark:text-gray-100"
                  >
                    Username
                  </label>
                  <input
                    id="profile-username"
                    type="text"
                    maxLength="40"
                    value={usernameDraft}
                    onChange={(event) => setUsernameDraft(event.target.value)}
                    placeholder="Choose a username"
                    className="mb-4 w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                  <label
                    htmlFor="profile-bio"
                    className="mb-2 block font-medium text-gray-900 dark:text-gray-100"
                  >
                    Profile bio
                  </label>
                  <textarea
                    id="profile-bio"
                    rows="6"
                    maxLength="500"
                    value={bioDraft}
                    onChange={(event) => setBioDraft(event.target.value)}
                    placeholder="Write a short bio for your profile."
                    className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {bioDraft.length}/500 characters
                    </p>
                    <button
                      type="button"
                      onClick={saveProfile}
                      disabled={savingBio}
                      className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-70"
                    >
                      {savingBio ? "Saving..." : "Save profile"}
                    </button>
                  </div>
                </div>
              </TabPanel>
              <TabPanel>
                <PostEditor post={post} setPost={setPost} savePost={savePost} />
              </TabPanel>
            </div>
          </Tabs>
        </div>
      </div>
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Post"
        message="Are you sure you want to delete this post? This cannot be undone."
        confirmText="Delete"
        isLoading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={deletePost}
      />
    </div>
  );
}

// export default withAuthenticator(Profile)
export default Profile;
