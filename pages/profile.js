import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/Auth';
import { AmplifySignUp, AmplifySignIn, AmplifyAuthenticator,AmplifyAuthContainer,withAuthenticator } from '@aws-amplify/ui-react'
import Amplify, { API } from 'aws-amplify';
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
    </div>
  )
}

export default withAuthenticator(Profile)
// export default Profile