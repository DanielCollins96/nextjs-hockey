import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/Auth';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import Amplify, { API, graphqlOperation, Auth } from 'aws-amplify';
import * as queries from '../src/graphql/queries';
import * as mutations from '../src/graphql/mutations';
import PostEditor from '../components/PostEditor';


function Profile() {
  const router = useRouter();
  const [post, setPost] = useState({title: '', content: ''});
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  
  const { user, setUser } = useAuth();

  console.log(user);
  
  const fetchPosts = async () => {
    const result = await API.graphql(graphqlOperation(queries.listPosts, { id: user.username }));
    console.log('LOL');
    console.log(result);
    return result
  }
  
  // const { data, isLoading, isError, error: userQueryError, status } = useQuery(`user - ${user?.username}`, fetchPosts, {enabled: !!user});
  const { data, isLoading, isFetching } = useQuery(`user - ${user?.username}`, fetchPosts, {enabled: !!user});
  console.log({data});

  // setPosts(data)
  // console.log({userQueryError});
  // console.log({status});
  // console.log(Object.keys(queryError));


  const savePost = () => {
    console.log(post);
    console.log(user.username);
    console.log('ave post');
    
    const writeAPI = () => {
      API.graphql(graphqlOperation(mutations.createPost, { input: { post } }))
        .then(() => {
          console.log('fuoerowerjpwoer yah');
          setPost(null);
          setError('');
        })
        .catch(err => {
          console.log(err);
          setError(err.message);
        });
    }

  //   let rando = async () => {    
  // try {
  //   const createPost = await fetch(process.env.NEXT_PUBLIC_GRAPHQL_API, {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //       'Accept': 'application/json',
  //       'x-api-key': 'da2-sakwasgofnchrdi6gqv766ggtq'
  //     },
  //     body: JSON.stringify({
  //       query: `{
  //         createPost(input: {title: $title, content: $content, userId: $username}) {
  //           id
  //         }
  //       }`,
  //       variables: {
  //         title: post.title,
  //         content: post.content,
  //         username: user.username
  //       }
  //     })
  //   })
  //   console.log(createPost);
  //   console.log(createPost?.errors);
  //   setPost(null)
  // } catch (error) {
  //   console.log(error);
  // }}
    // writeAPI()

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
          <div className="w-3/4 flex flex-col p-2">
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