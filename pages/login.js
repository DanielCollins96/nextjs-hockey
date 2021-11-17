import { withAuthenticator, AmplifySignUp, AmplifySignIn } from '@aws-amplify/ui-react'
import { useForm } from "react-hook-form";
import Link from 'next/link'
import { useRouter } from 'next/router'
import { UseAuth } from '../contexts/Auth';
import LoginForm from '../components/LoginForm'


function Login() {

    const router = useRouter();

    const { user } = UseAuth();

    if (user) {
        return <p className="text-lg mx-auto mt-12">User Logged In</p>
    }

    return (
        <div className="flex justify-center">
            <LoginForm />
        </div>
    )
}


// export default withAuthenticator(Login)
export default Login

