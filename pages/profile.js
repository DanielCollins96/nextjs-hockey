import React, { useState, useEffect } from 'react'
import { UseAuth } from '../contexts/Auth';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import Amplify, { API, graphqlOperation, Auth } from 'aws-amplify';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { ToastProvider, useToasts } from 'react-toast-notifications'
import 'react-tabs/style/react-tabs.css';

import * as queries from '../src/graphql/queries';
import * as mutations from '../src/graphql/mutations';
import PostEditor from '../components/PostEditor';
import PostsList from '../components/PostsList';


function Profile() {
  const router = useRouter();
  const { user, setUser } = UseAuth();
  console.log(user);

  const [post, setPost] = useState({
    subject: '', 
    content: '',
    name: ''
    });
  const [search, setSearch] = useState('');
  const [postDateOrder, setPostDateOrder] = useState(false)
  const [error, setError] = useState('');

  const { addToast } = useToasts();

  
  const fetchPosts = async () => {
    try {
      const result = await API.graphql(graphqlOperation(queries.listPosts, {filter: {userId: {eq: user.username}} }))    
      console.log({result});
      
      return result.data.listPosts.items
    } catch (err) {
      console.log('Error fetching posts');
      console.error(err)
      throw new Error(err)
    }
  }
  
  const { data: userPosts, isLoading, isFetching, status, refetch } = useQuery(`userposts - ${user?.username}`, fetchPosts, {enabled: !!user});
  console.log({userPosts});
  
  const togglePostsDate = () => {
    setPostDateOrder(!postDateOrder)
    console.log(postDateOrder);
    console.log('in toggl');
    userPosts.sort((a, b) => {
      return postDateOrder ? a.createdAt > b.createdAt ? -1 : 1 : a.createdAt < b.createdAt ? -1 : 1
    })

  }
  let filteredPosts = userPosts?.filter((post) => post.content.toUpperCase().includes(search.toUpperCase()) || search === '' )

  const deletePost = async (id, _version) => {
    alert('Are You Sure You Want To Delete This Post?')
    try {
      const result = await API.graphql(graphqlOperation(mutations.deletePost, {input: {id: id}}))
      console.log({result});
      addToast('Post deleted', { appearance: 'success', autoDismiss: true })
    }
    catch (err) {
      console.log({err});
      console.log(err.errors[0]?.message);
      addToast('Error deleting post', { appearance: 'error', autoDismiss: true })
    }
  }

  const savePost = () => {
    console.log(post);
    console.log(user.username);
    console.log('Save post');

      API.graphql(graphqlOperation(mutations.createPost, { input: { ...post, userId: user.username } }))
        .then(() => {
          console.log('Save Success');
          addToast(`Post saved`, { appearance: 'success', autoDismiss: true });
          setPost({
            subject: '', 
            content: '',
            name: ''
            })
          setError('');
          refetch()
        })
        .catch(err => {
          console.log(err);
          setError(err.message);
        });

    }

    if (!user) {
      return <p className="text-xl mx-auto mt-12">Login to view profile!</p>
    }
  
  return (
    <div>
      <div className="flex flex-col items-center sm:flex-row m-2 sm:items-start">
        <div className="bg-white m-2 p-2">
          { user && <h2 className="font-bold">Welcome, {user?.attributes?.email}</h2> }
          <div className="bg-red-200 p-12">My Bio</div>
        </div>
          <div className="w-11/12 sm:w-3/4 flex flex-col p-2 gap-2">
            <Tabs>
              <TabList className="flex gap-3" activeTabClassName="bg-red-300">
                <Tab>Posts</Tab>
                <Tab>Settings</Tab>
                <Tab>Create Post</Tab>
              </TabList>
              <div className="border border-black min-h-72">
              <TabPanel>
                <PostsList 
                  error={status === 'error'}
                  posts={filteredPosts} 
                  search={search} 
                  setSearch={setSearch}
                  deletePost={deletePost}
                  toggle={togglePostsDate}
                  />
              </TabPanel>
              <TabPanel>
                <div id="settings">
                  <p>LOLOLOL</p>
                </div>  
              </TabPanel>
              <TabPanel>
                <PostEditor 
                  post={post} 
                  setPost={setPost} 
                  savePost={savePost}
                  />
              </TabPanel>
            </div>
            </Tabs>
        </div>
      </div>
    </div>
  )
}

// export default withAuthenticator(Profile)
export default Profile