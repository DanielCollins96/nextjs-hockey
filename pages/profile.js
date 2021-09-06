import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/Auth';
import { AmplifySignUp, AmplifySignIn, AmplifyAuthenticator } from '@aws-amplify/ui-react'
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
    API.get('three', '/posts')
  })

  const changePost = (e) => {
    setPost(() => ({...post, [e.target.name] : e.target.value }))
  }

  const savePost = () => {
    console.log(post)
  }

  return (
    <AmplifyAuthenticator usernameAlias="email">
      { user && <h2>Welcome, {user?.attributes?.email}</h2> }
      <div className="">
        <div>
          <label htmlFor="title">
            Post Title
            <input type="text" onChange={changePost} placeholder="Title" value={post?.title} name="title" id="title"/>
          </label>
          <SimpleMDE value={post?.content} onChange={value => setPost({...post, content: value})}/>
          <button onClick={savePost} type="submit">Save Post</button>
        </div>
      </div>
      {posts ? posts.map((post) => {
        return <p>Hey</p> 
      })
      :
       <p>whaaat</p>
      }
      <AmplifySignIn 
        headerText="Sign In"
        slot="sign-in"
        usernameAlias="email"
        formFields={[
          {
            type: "email",
            label: "Email",
            placeholder: "Please enter your Email",
            required: true,
          },
          {
            type: "password",
            label: "Password",
            placeholder: "Please enter your Password",
            required: true,
          },
        ]}
      />
      <AmplifySignUp
          slot="sign-up"
          usernameAlias="email"
          formFields={[
            {
              type: "email",
              label: "Email",
              placeholder: "Please enter your Email",
              required: false,
            },
            {
              type: "password",
              label: "Password",
              placeholder: "Please enter your Password",
              required: true,
            },
          ]}
        />

    </AmplifyAuthenticator>
  )
}

// export default withAuthenticator(Profile)
export default Profile