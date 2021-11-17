import {useState} from 'react'
import { Auth } from 'aws-amplify';
import { useForm } from "react-hook-form";
import { UseAuth } from '../contexts/Auth';
import { useRouter } from 'next/router'
import Link from 'next/link'
import { FaSpinner } from "react-icons/fa";
import { useToasts } from 'react-toast-notifications'



export default function RequestResetForm() {
        const router = useRouter()
    
        const { register, handleSubmit, formState } = useForm();
        const [isLoading, setIsLoading] = useState(false)
        const [submitError, setSubmitError] = useState('')
    
        const { addToast } = useToasts()
        
        const { authState, setAuthState } = UseAuth()
        
        const onSubmit = async (data) => {
            setIsLoading(true)
            setSubmitError('')
            try {
            let { username } = data
            console.log(username);
            let user = await Auth.forgotPassword(username)
            addToast('Check your email for a reset link', { appearance: 'success', autoDismiss: true })
            } catch (error) {
                console.log(error);
                // setSubmitError(error.message)
            addToast(error.message, { appearance: 'error', autoDismiss: true})
                try {
                    console.log(user)
                    setSubmitError(user.message)
                } catch(e) {
                    console.log(e);
                }
            }
            setIsLoading(false)
        }
        
        return (
            <div className="">
    
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col ">
                <p className="text-3xl font-bold mb-8">Reset your password</p>
                <p className="mb-8">To receive a code to reset your password, please enter your email address.</p>
                <div className="mb-8">
                    <label htmlFor="username" className="font-bold block mb-2">Email</label>
                    <input id="username" type="email" className="w-full px-3 py-2 rounded leading-5 outline-red focus:outline-none  focus:ring focus:border-blue-300 focus:shadow-inner " {...register('username')}/>
                </div>
                <button type="submit" className="shadow-2xl w-44 bg-blue-600 hover:bg-blue-700 text-white font-bold tracking-wide mb-4 py-2 px-2 rounded focus:shadow-outline disabled:opacity-20">
                    {isLoading ? <FaSpinner className="m-auto h-6 animate-spin" /> : 'Reset Password'}
                </button>
                <div className=" h-6">
                        {submitError ? 
                            <div className="bg-red-100 border text-sm border-red-400 text-red-700 px-3 py-2 rounded relative" role="alert">
                            <span className="block sm:inline">{submitError}</span>
                        </div>
                        :
                        <p className=""></p>
                        }
                    </div>
            </form>
            </div>
        )
    }
    