
import React, { useState } from 'react'
import { Auth } from 'aws-amplify'
import { useForm } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";
import { useRouter } from 'next/router'


export default function ResetPasswordForm() {
    const router = useRouter()

    const [submitError, setSubmitError] = useState('')

    const { register, handleSubmit, formState } = useForm();
    const [isLoading, setIsLoading] = useState(false)

    const onSubmit = async (event) => {
        setIsLoading(true)
        setSubmitError('')
        const { email, code, new_password } = event

        Auth.forgotPasswordSubmit(email, code, new_password)
            .then(data => {
                console.log(data)
                router.push('/profile')
            })
            .catch(err => {
                console.log(err)
                setSubmitError(err.message)
            })
            .finally(() => {
                console.log('finally')
                setIsLoading(false)
            })
    }

    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)}>
            <p className="mt-3 mb-6 font-bold tracking-wide text-4xl">Reset your password</p>
                <div className="mb-5">
                    <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                    <input id="email" type="email" {...register('email')} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight outline-red focus:outline-none  focus:ring focus:border-blue-300 focus:shadow-inner"/>
                </div>
                <div className="mb-5">
                    <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2">Reset Code</label>
                    <input type="text" {...register('code')} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-1 leading-tight outline-red focus:outline-none  focus:ring focus:border-blue-300 focus:shadow-inner"/>
                </div>
                <div className="mb-5">
                    <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2">New Password</label>
                    <input type="password" {...register('new_password')} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-1 leading-tight outline-red focus:outline-none  focus:ring focus:border-blue-300 focus:shadow-inner"/>
                </div>
                <button className="uppercase w-24 bg-blue-600 hover:bg-blue-700 text-white font-bold tracking-wide py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-20" type="submit">
                    {isLoading ? <FaSpinner className="h-6 animate-spin m-auto" />  : 'Submit'}
                </button>
                {submitError && 
                <div className="mt-3 bg-red-100 border text-sm border-red-400 text-red-700 px-3 py-2 rounded" role="alert">
                    <span className="block sm:inline">{submitError}</span>
                </div>
              }
            </form>
        </div>
    )
}

