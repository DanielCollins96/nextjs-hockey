import React, {useState, useEffect} from "react";
import {UseAuth} from "../contexts/Auth";
import {useRouter} from "next/router";
import {useQuery} from "react-query";
import Amplify, {API, graphqlOperation, Auth} from "aws-amplify";
import {Tab, Tabs, TabList, TabPanel} from "react-tabs";
import toast from "react-hot-toast";
import "react-tabs/style/react-tabs.css";

import * as queries from "../src/graphql/queries";
import * as mutations from "../src/graphql/mutations";
import PostEditor from "../components/PostEditor";
import PostsList from "../components/PostsList";

function Profile() {
  const router = useRouter();
  const {user, setUser} = UseAuth();
  console.log(user);

  const [post, setPost] = useState({
    subject: "",
    content: "",
    name: "",
  });
  const [search, setSearch] = useState("");
  const [postDateOrder, setPostDateOrder] = useState(false);
  const [error, setError] = useState("");

  const fetchPosts = async () => {
    console.log("fetching");
    try {
      let result = await API.graphql(
        graphqlOperation(queries.listPosts, {
          filter: {userId: {eq: user.username}},
        })
      );
      console.log({result});
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
    isLoading,
    isFetching,
    status,
    refetch,
  } = useQuery(`userposts - ${user?.username}`, fetchPosts, {enabled: !!user});

  const filteredPosts = userPosts?.filter(
    (post) =>
      post.content.toUpperCase().includes(search.toUpperCase()) || search === ""
  );

  const togglePostsDate = () => {
    setPostDateOrder(!postDateOrder);
    userPosts.sort((a, b) => {
      return postDateOrder
        ? a.createdAt > b.createdAt
          ? -1
          : 1
        : a.createdAt < b.createdAt
        ? -1
        : 1;
    });
  };

  const deletePost = async (id, _version) => {
    alert("Are You Sure You Want To Delete This Post?");
    try {
      const result = await API.graphql(
        graphqlOperation(mutations.deletePost, {
          input: {id: id, _version: _version},
        })
      );
      console.log({result});
      toast.success("Post deleted");
    } catch (err) {
      console.log({err});
      console.log(err.errors[0]?.message);
      toast.error(`Error deleting post: ${err.errors[0]?.message}`);
    }
  };

  const savePost = () => {
    console.log(post);
    console.log(user.username);
    console.log("Save post");

    API.graphql(
      graphqlOperation(mutations.createPost, {
        input: {...post, userId: user.username},
      })
    )
      .then(() => {
        console.log("Save Success");
        toast.success("Post saved");
        setPost({
          subject: "",
          content: "",
          name: "",
        });
        setError("");
        refetch();
      })
      .catch((err) => {
        console.log(err);
        setError(err.message);
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
              <Tab className="px-3 py-1 rounded text-gray-900 dark:text-gray-100" selectedClassName="bg-red-300 dark:bg-red-600 text-white">Settings</Tab>
              <Tab className="px-3 py-1 rounded text-gray-900 dark:text-gray-100" selectedClassName="bg-red-300 dark:bg-red-600 text-white">Create Post</Tab>
            </TabList>
            <div className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded min-h-72 p-2">
              <TabPanel>
                <PostsList
                  error={status === "error"}
                  posts={filteredPosts}
                  search={search}
                  setSearch={setSearch}
                  deletePost={deletePost}
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
    </div>
  );
}

// export default withAuthenticator(Profile)
export default Profile;
