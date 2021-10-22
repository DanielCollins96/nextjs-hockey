import { withAuthenticator, AmplifySignUp, AmplifySignIn } from '@aws-amplify/ui-react'

function Login() {

    return (
        <div className="flex justify-center">
            <AmplifySignIn />
            <AmplifySignUp 
                slot="sign-up"
                usernameAlias="email"
                formFields={[
                    { type: "username" },
                    { type: "password" },
                    { type: "email" }
                ]}
            />
        </div>
    )
}


export default withAuthenticator(Login)

