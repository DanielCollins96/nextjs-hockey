import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/Auth';
import { AmplifySignUp, AmplifySignIn, AmplifyAuthenticator,AmplifyAuthContainer,withAuthenticator } from '@aws-amplify/ui-react'
import Amplify, { API, graphqlOperation } from 'aws-amplify';
import dynamic from 'next/dynamic';
import "easymde/dist/easymde.min.css";
import s from "./profile.module.css";

const SimpleMDE = dynamic(() => import('react-simplemde-editor'), { ssr: false })


// https://docs.amplify.aws/ui/auth/authenticator/q/framework/react#custom-form-fields
function Profile() {
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    API.get('three-staging', '/posts')
  })

  const changePost = (e) => {
    setPost(() => ({...post, [e.target.name] : e.target.value }))
  }

  const savePost = () => {
    console.log(post)
  }

  return (
    <div>
      { user && <h2 className="font-bold">Welcome, {user?.attributes?.email}</h2> }
      <div className="flex flex-col items-center sm:flex-row m-2 sm:items-start">
        <div className="bg-white m-2 p-2">
          { user && <h2 className="font-bold">Welcome, {user?.attributes?.email}</h2> }
        </div>
        <div className="w-3/4 flex flex-col p-2">
          <label htmlFor="title" className="text-3xl mb-2">
            <input type="text" onChange={changePost} className="p-1" placeholder="Enter title..." value={post?.title} name="title" id="title"/>
          </label>
          <SimpleMDE value={post?.content} onChange={value => setPost({...post, content: value})}/>
          <button className="bg-blue-200 p-3 rounded inline-block" onClick={savePost} type="submit">Save Post</button>
        </div>
      </div>
    </div>
  )
}

export default withAuthenticator(Profile)
// export default Profile