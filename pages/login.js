import { withAuthenticator, AmplifySignUp, AmplifySignIn } from '@aws-amplify/ui-react'
import { useForm } from "react-hook-form";
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '../contexts/Auth';


function Login() {
    const router = useRouter()

    const { signIn } = useAuth();

    const { register, handleSubmit } = useForm();

    const onSubmit = async (event) => {
        console.log(event);
        try {
            let res = await signIn(event)
            console.log(res);
            if (res.username) {
                router.push('/profile')
            } else {
                try {
                    alert(res.message)
                } catch(e) {
                    console.log(e);
                }
            }

        } catch (e) {
            console.log(e);
        }
        
    } 

    return (
        <div className="flex justify-center">
            {/* <AmplifySignIn />
            <AmplifySignUp 
                slot="sign-up"
                usernameAlias="email"
                formFields={[
                    { type: "username" },
                    { type: "password" },
                    { type: "email" }
                ]}
            /> */}
             <div className="w-full max-w-sm mx-auto mt-12">
                <form onSubmit={handleSubmit(onSubmit)} class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                 <p className="mt-3 mb-6 font-bold tracking-wide text-lg">Sign in to your account</p>
                <div className="mb-4">
                    <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                    <input type="email" {...register('email')} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"/>
                </div>
                <div className="mb-6">
                    <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2">Password</label>
                    <input type="password" {...register('password')} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"/>
                </div>
                <div className="flex items-center justify-between">
                    <button className="uppercase bg-blue-500 hover:bg-blue-700 text-white font-bold tracking-wide py-2 px-4 rounded focus:outline-none focus:shadow-outline"type="submit">Sign In</button>
                    <button className="inline-block align-baseline text-sm ">No Account? <Link href="/signup"><a className="font-bold text-blue-500 hover:text-blue-800">Create account</a></Link></button>
                </div>
                </form>
                <pre>
                {/* {Object.keys(errors).length > 0 && (
                    <label>Errors: {JSON.stringify(errors, null, 2)}</label>
                )} */}
                </pre>
            {/* <p>{JSON.stringify(values, null, 2)}</p>
            <pre>{JSON.stringify(status, null, 2)}</pre> */}
        </div>
        </div>
    )
}


// export default withAuthenticator(Login)
export default Login

