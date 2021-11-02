import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/Auth';
import { useRouter } from 'next/router';
import Amplify, { API, graphqlOperation, Auth } from 'aws-amplify';
import * as queries from './graphql/queries';

import dynamic from 'next/dynamic';
// import {  }
import "easymde/dist/easymde.min.css";
import PostEditor from '../components/PostEditor';

const SimpleMDE = dynamic(() => import('react-simplemde-editor'), { ssr: false })


// https://docs.amplify.aws/ui/auth/authenticator/q/framework/react#custom-form-fields
function Profile() {
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  
  const { user, setUser } = useAuth();
  
  useEffect(() => {
    API.get('three', '/posts')
  })

  useEffect(() => {
    Auth.currentAuthenticatedUser()
      .then(user => setUser(user))
      .catch(() => router.push('/login'))
  }, []);

  
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
        </div>
          <div className="w-3/4 flex flex-col p-2">
            <PostEditor post={post} setPost={setPost}/>
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