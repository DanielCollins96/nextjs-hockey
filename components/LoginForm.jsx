import {useState} from 'react'
import { useForm } from "react-hook-form";
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '../contexts/Auth';
import { FaSpinner } from "react-icons/fa";

export default function LoginForm() {
    const router = useRouter()

    const [submitError, setSubmitError] = useState('')

    const { signIn, setUser } = useAuth();

    const { register, handleSubmit, formState } = useForm();
    const { isSubmitting } = formState;

    const onSubmit = async (event) => {
        console.log(event);
        setSubmitError('')
        try {
            let user = await signIn(event)
            
            if (user.username) {
                setUser(user)
                router.push('/profile')
            } else {
                try {
                    console.log(user)
                    setSubmitError(user.message)
                } catch(e) {
                    console.log(e);
                }
            }

        } catch (e) {
            console.log(e);
        }
        
    } 

    return (
             <div className="w-full max-w-sm mx-auto mt-12">
                <form onSubmit={handleSubmit(onSubmit)} class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                 <p className="mt-3 mb-6 font-bold tracking-wide text-lg">Sign in to your account</p>
                <div className="mb-4">
                    <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                    <input type="email" {...register('email')} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"/>
                </div>
                <div className="mb-2">
                    <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2">Password</label>
                    <input type="password" {...register('password')} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-1 leading-tight focus:outline-none focus:shadow-outline"/>
                </div>
                <div className="mb-3 text-xs">
                    <p>Forgot your password? <Link href="/signup"><a className="font-bold text-blue-600 hover:text-blue-800">Reset Password</a></Link></p>
                </div>
                <div className="mb-2 h-9">
                    {submitError ? 
                        <div class="bg-red-100 border text-sm border-red-400 text-red-700 px-3 py-2 rounded relative" role="alert">
                        <span class="block sm:inline">{submitError}</span>
                    </div>
                    :
                    <p className=""></p>
                    }
                </div>
                <div className="flex items-center justify-between">
                    <button disabled={isSubmitting} className="uppercase w-24 bg-blue-600 hover:bg-blue-700 text-white font-bold tracking-wide py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-20"type="submit">
                        {isSubmitting ? <FaSpinner className="h-6 animate-spin m-auto" /> : 'Sign in'}
                    </button>
                    <div className="flex gap-1">

                    <p className="text-sm">No Account?</p>
                    <button className="inline-block align-baseline text-sm "><Link href="/signup"><a className="font-bold text-blue-600 hover:text-blue-800">Create account</a></Link></button>
                    </div>
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
    )
}


