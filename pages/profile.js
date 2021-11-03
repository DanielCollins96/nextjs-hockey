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
  const [post, setPost] = useState(null);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  
  const { user, setUser } = useAuth();
  console.log(user);
  const { data, isLoading, error: queryError } = useQuery('user', () => {
    return API.graphql(graphqlOperation(queries.getUser, { id: user.id }));
  });

  useEffect(async () => {
    console.log('what');
    // API.get('three', '/posts')
    // let posts = await API.graphql(graphqlOperation(queries.listPosts, {authToken: 'da2-sakwasgofnchrdi6gqv766ggtq'}))
    console.log(process.env.GRAPHQL_API);
    const response = await fetch(process.env.NEXT_PUBLIC_GRAPHQL_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-api-key': 'da2-sakwasgofnchrdi6gqv766ggtq'
      },
      body: JSON.stringify({
        query: `{  
            listPosts {
            nextToken
            startedAt
            items {
              id
              content
              title
            }
          }
        }`
      })
    })
    console.log(response);
    // setPosts(posts)
  }, [])

  useEffect(() => {
    Auth.currentAuthenticatedUser()
      .then(user => setUser(user))
      .catch(() => router.push('/login'))
  }, []);

  
  if (!user) {
    return <p className="text-xl mx-auto mt-12">Login to view profile!</p>
  }

  const savePost = async () => {
    console.log(post);

    try {

    const createPost = await fetch(process.env.NEXT_PUBLIC_GRAPHQL_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-api-key': 'da2-sakwasgofnchrdi6gqv766ggtq'
      },
      body: JSON.stringify({
        query: `{
          createPost(input: {title: "HUge cawk", content: "FUCK"}) {
            id
          }
        }`
      })
    })
    console.log(createPost);
    setPost(null)
  } catch (error) {
    console.log(error);
  }
    // writeAPI()

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
    }
  

  // console.log(Auth.userAttributes(user).then(res => console.log(res)));
  return (
    <div>
      <div className="flex flex-col items-center sm:flex-row m-2 sm:items-start">
        <div className="bg-white m-2 p-2">
          { user && <h2 className="font-bold">Welcome, {user?.attributes?.email}</h2> }
          <div className="bg-red-200 p-12">My Bio</div>
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