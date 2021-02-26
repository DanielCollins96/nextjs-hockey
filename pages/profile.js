import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/Auth';
import dynamic from 'next/dynamic'
import { AmplifySignUp, AmplifySignIn, AmplifyAuthenticator } from '@aws-amplify/ui-react'
const TextEditor = dynamic(() => import('../components/editor'));
import Amplify, { API } from 'aws-amplify';
import s from "./profile.module.css";

// https://docs.amplify.aws/ui/auth/authenticator/q/framework/react#custom-form-fields
function Profile() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    API.get('three', '/posts')
  })
  return (
    <AmplifyAuthenticator usernameAlias="email">
      { user && <h2>Welcome, {user.attributes.email}</h2> }
      <div className={s.editor}>
        <TextEditor />
      </div>
      {posts ? posts.map((post) => {
        return <p>Hey</p> 
      })
      :
       <p>whaaat</p>
      }
      <AmplifySignIn 
        headerText="Sign In To Fuck Babes"
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
        },        ]}
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