import { withAuthenticator, AmplifySignUp, AmplifySignIn } from '@aws-amplify/ui-react'
import { useForm } from "react-hook-form";
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '../contexts/Auth';
import LoginForm from '../components/LoginForm'


function Login() {

    return (
        <div className="flex justify-center">
            <LoginForm />
        </div>
    )
}


// export default withAuthenticator(Login)
export default Login

