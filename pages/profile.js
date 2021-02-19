import { useState, useEffect } from 'react'
import { Auth } from 'aws-amplify'
import { useAuth } from '../contexts/Auth';
import { withAuthenticator, AmplifySignOut, AmplifySignUp, AmplifySignIn, AmplifyAuthenticator } from '@aws-amplify/ui-react'

// https://docs.amplify.aws/ui/auth/authenticator/q/framework/react#custom-form-fields
function Profile() {

  const { user } = useAuth();

  return (
    <AmplifyAuthenticator usernameAlias="email">
      { user && <h1>Welcome, {user.username}</h1> }
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
          formFields={[
            { type: "username" },
            { type: "password" },
            { type: "email"},
          ]}
        />

    </AmplifyAuthenticator>
  )
}

// export default withAuthenticator(Profile)
export default Profile