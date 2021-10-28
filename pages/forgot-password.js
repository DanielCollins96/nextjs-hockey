import {useState} from 'react'
import { Auth } from 'aws-amplify';
import { useForm } from "react-hook-form";
import { useAuth } from '../contexts/Auth';
import { useRouter } from 'next/router'
import { FaSpinner } from "react-icons/fa";

export default function ForgotPassword() {
    
    const router = useRouter()

    const [submitError, setSubmitError] = useState('')

    const { register, handleSubmit, formState } = useForm();
    const { isSubmitting } = formState;

    const onSubmit = async (event) => {

        setSubmitError('')
        const { email, code, new_password } = event
        
        Auth.forgotPasswordSubmit(email, code, new_password)
            .then(data => {
                console.log(data)
                router.push('/login')
            })
            .catch(err => {
                console.log(err)
                setSubmitError(err.message)
            });
    }

    return (
        <div className="m-auto">
            <p className="">Fuck bwoi</p>
            <div className="">
                <label for="" className="">Enter Email</label>
                <input type="text" />
                <button onClick={(e) => {
                    console.log('in here');
                    console.log(e);
                    console.log(e.target);
                }}>send reset code</button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
            <p className="mt-3 mb-6 font-bold tracking-wide text-lg">Reset your password with your code.</p>
                <div className="mb-4">
                    <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                    <input type="email" {...register('email')} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"/>
                </div>
                <div className="mb-2">
                    <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2">Reset Code</label>
                    <input type="text" {...register('code')} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-1 leading-tight focus:outline-none focus:shadow-outline"/>
                </div>
                <div className="mb-2">
                    <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2">New Password</label>
                    <input type="password" {...register('new_password')} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-1 leading-tight focus:outline-none focus:shadow-outline"/>
                </div>
                <button disabled={isSubmitting} className="uppercase w-24 bg-blue-600 hover:bg-blue-700 text-white font-bold tracking-wide py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-20"type="submit">
                        {isSubmitting ? <FaSpinner className="h-6 animate-spin m-auto" /> : 'Submit'}
                    </button>
                    {submitError && 
                  <div class="bg-red-100 border text-sm border-red-400 text-red-700 px-3 py-2 rounded relative" role="alert">
                    <span class="block sm:inline">{submitError}</span>
                  </div>
              }
            </form>
        </div>
    )
}