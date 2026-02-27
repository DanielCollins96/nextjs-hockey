import React, {useState} from "react";
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

const THREAD_SUBJECT_PREFIX_REGEX = /^THREAD#/i;

function getNormalizedSubject(post) {
  return String(post?.subject || "").trim();
}

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
    threadLink = `/teams/${threadId}`;
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

  const sortedPosts = (posts = []) => {
    const copy = [...posts];
    return copy.sort((a, b) => {
      const left = new Date(a.createdAt).getTime();
      const right = new Date(b.createdAt).getTime();
      return postDateOrder ? right - left : left - right;
    });
  };

  const personalPosts = sortedPosts(
    (userPosts || []).filter((post) => !isThreadSubject(post))
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
    API.graphql(
      graphqlOperation(mutations.createPost, {
        input: {...post, userId: user.username},
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
              Welcome, {user?.attributes?.email}
            </h2>
          )}
          <div className="dark:text-white p-12 rounded">
            My Bio
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
                <div id="settings">
                  <p className="text-gray-900 dark:text-gray-100">LOLOLOL</p>
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
