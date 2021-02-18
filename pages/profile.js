import { useState, useEffect } from 'react'
import { Auth } from 'aws-amplify'
import { withAuthenticator, AmplifySignOut, AmplifySignUp, AmplifyAuthenticator } from '@aws-amplify/ui-react'

// https://docs.amplify.aws/ui/auth/authenticator/q/framework/react#custom-form-fields
function Profile() {
  const [user, setUser] = useState(null)
  useEffect(() => {
    // Access the user session on the client
    Auth.currentAuthenticatedUser()
      .then(user => {
        console.log("User: ", user)
        setUser(user)
      })
      .catch(err => setUser(null))
  }, [])
  return (
    <AmplifyAuthenticator>
      { user && <h1>Welcome, {user.username}</h1> }
      <AmplifySignUp
        slot="sign-up"
        usernameAlias="email"
        formFields={[
          {
            type: "text",
            label: "Preffered Name",
            placeholder: "custom Phone placeholder",
            required: true,
          },
          {
            type: "email",
            label: "Email",
            placeholder: "Email",
            required: true,
          },
          {
            type: "password",
            label: "Password",
            placeholder: "Password",
            required: true,
          },
        ]} 
      />

    </AmplifyAuthenticator>
  )
}

// export default withAuthenticator(Profile)
export default Profile