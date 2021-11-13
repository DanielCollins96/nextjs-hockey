import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/Auth';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import Amplify, { API, graphqlOperation, Auth } from 'aws-amplify';
import * as queries from '../src/graphql/queries';
import * as mutations from '../src/graphql/mutations';
import PostEditor from '../components/PostEditor';
import PostsList from '../components/PostsList';


function Profile() {
  const router = useRouter();
  const [post, setPost] = useState({
    subject: '', 
    content: '',
    name: ''
    });
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  
  const { user, setUser } = useAuth();

  console.log(user);
  
  const fetchPosts = async () => {
    try {
      const result = await API.graphql(graphqlOperation(queries.listPosts, {filter: {userId: {eq: user.username}} }))    
      console.log({result});
      // console.log(result.data.listPosts.items);
      return result.data.listPosts.items
    } catch (err) {
      console.log('pooe');
      console.error(err)
    }
  }
  
  const { data: userPosts, isLoading, isFetching } = useQuery(`user - ${user?.username}`, fetchPosts, {enabled: !!user});
  // console.log({data});


  const savePost = () => {
    console.log(post);
    console.log(user.username);
    console.log('ave post');

      API.graphql(graphqlOperation(mutations.createPost, { input: { ...post, userId: user.username } }))
        .then(() => {
          console.log('fuoerowerjpwoer yah');
          setPost({
            subject: '', 
            content: '',
            name: ''
            })
          setError('');
        })
        .catch(err => {
          console.log(err);
          setError(err.message);
        });

    }


    if (!user) {
      return <p className="text-xl mx-auto mt-12">Login to view profile!</p>
    }
  

  // console.log(Auth.userAttributes(user).then(res => console.log(res)));
  return (
    <div>
      <div className="flex flex-col items-center sm:flex-row m-2 sm:items-start">
        <div className="bg-white m-2 p-2">
          { user && <h2 className="font-bold">Welcome, {user?.attributes?.email}</h2> }
          <div className="bg-red-200 p-12">My Bio</div>
          {/* {isError && <p>Error fetching posts: {JSON.stringify(userQueryError.errors)}</p>}
          {userQueryError && <p>Error fetching posts2: {JSON.stringify(Object.keys(userQueryError))}</p>} */}
        </div>
          <div className="w-11/12 sm:w-3/4 flex flex-col p-2">
            <PostsList posts={userPosts}/>
            <PostEditor post={post} setPost={setPost} savePost={savePost}/>
            <div id="settings">
              <p>LOLOLOL</p>
            </div>
        </div>
      </div>
    </div>
  )
}

// export default withAuthenticator(Profile)
export default Profile