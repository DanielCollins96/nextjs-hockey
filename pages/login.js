import { withAuthenticator, AmplifySignUp, AmplifySignIn } from '@aws-amplify/ui-react'
import { useForm } from "react-hook-form";
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '../contexts/Auth';
import LoginForm from '../components/LoginForm'
import { ToastProvider } from 'react-toast-notifications'


function Login() {

    const router = useRouter();

    const { user } = useAuth();

    if (user) {
        return <p className="text-lg mx-auto mt-12">User Logged In</p>
    }

    return (
        <div className="flex justify-center">
            <ToastProvider>
                <LoginForm />
            </ToastProvider>
        </div>
    )
}


// export default withAuthenticator(Login)
export default Login

