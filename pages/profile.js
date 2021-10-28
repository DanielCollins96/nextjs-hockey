import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/Auth';
import { useRouter } from 'next/router';
import Amplify, { API, graphqlOperation, Auth } from 'aws-amplify';
import dynamic from 'next/dynamic';
import "easymde/dist/easymde.min.css";

const SimpleMDE = dynamic(() => import('react-simplemde-editor'), { ssr: false })


// https://docs.amplify.aws/ui/auth/authenticator/q/framework/react#custom-form-fields
function Profile() {
  const router = useRouter();

  const [post, setPost] = useState(null);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  
  const { user, setUser } = useAuth();
  
  useEffect(() => {
    API.get('three-staging', '/posts')
  })

  useEffect(() => {
    Auth.currentAuthenticatedUser()
      .then(user => setUser(user))
      .catch(() => router.push('/login'))
  }, []);

  const changePost = (e) => {
    setPost(() => ({...post, [e.target.name] : e.target.value }))
  }

  const savePost = () => {
    console.log(post)
  }
  
  if (!user) {
    return <p className="text-xl m-auto">Login to view profile!</p>
  }

  return (
    <div>
      <div className="flex flex-col items-center sm:flex-row m-2 sm:items-start">
        <div className="bg-white m-2 p-2">
          { user && <h2 className="font-bold">Welcome, {user?.attributes?.email}</h2> }
          <div className="bg-red-200 p-12">My Bio</div>
        </div>
          <div className="w-3/4 flex flex-col p-2">
            <div id="post_box" className="border rounded-b p-1">
              <label htmlFor="title" className="text-3xl mb-2">
                <input type="text" onChange={changePost} className="p-1" placeholder="Enter title..." value={post?.title} name="title" id="title"/>
              </label>
              <SimpleMDE value={post?.content} onChange={value => setPost({...post, content: value})}/>
              <button className="bg-blue-200 px-3 py-1 rounded inline-block mb-2" onClick={savePost} type="submit">Save Post</button>
            </div>
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