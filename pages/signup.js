import { useContext, useState } from 'react';
import * as Yup from 'yup';
import { useForm } from "react-hook-form";
import { useRouter } from 'next/router';
import { Auth } from 'aws-amplify';
import Link from 'next/link'
import { FaSpinner } from "react-icons/fa";
import { UseAuth } from '../contexts/Auth';


export default function Signup() {
    const router = useRouter();

    const [submitError, setSubmitError] = useState('')

    const { signUp, setUser, user } = UseAuth()

    const { register, handleSubmit, formState } = useForm();
    const { isSubmitting } = formState;

    if (user) {
        return <p className="mx-auto mt-12">User Already Logged In</p>
    }

    const onSubmit = async (data) => {
      setSubmitError('')
      try {
        console.log(data);
        console.log(isSubmitting);
        let user = await signUp(data)
        console.log(user);
        if (user.username) {
          // setUser()
          // router.push('/profile');
        } else {
          try {
            setSubmitError(user.message)
          } catch(e) {
            console.log(e);
          }
        }
      } catch (error) {
        console.log('wtf');
        console.log(error);
        alert(error.message)
      }
    }


    // console.log(errors)
    return (
      (<div className="w-full max-w-sm mx-auto mt-12">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 shadow-md rounded px-8 pt-6 pb-8 mb-4"
        >
        <p className="mt-3 mb-6 font-bold tracking-wide text-2xl">Sign up for an account</p>

          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-gray-800 dark:text-gray-200 text-sm font-bold mb-2"
            >
              Email
            </label>
            <input
              required
              type="email"
              {...register('email')}
              className="shadow appearance-none border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded w-full py-2 px-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-gray-800 dark:text-gray-200 text-sm font-bold mb-2"
            >
              Password
            </label>
            <input
              type="password"
              {...register('password')}
              className="shadow appearance-none border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded w-full py-2 px-3 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="mb-2">
          {submitError && 
              <div className="bg-red-50 dark:bg-red-900 border text-sm border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 px-3 py-2 rounded relative" role="alert">
                <span className="block sm:inline">{submitError}</span>
              </div>
          }
          </div>
          <div className="flex items-center justify-between">
            <button className="w-24 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
              {isSubmitting ? <FaSpinner className="h-6 animate-spin m-auto" /> : 'Submit'}
            </button>
            <button className="inline-block align-baseline font- text-sm">Have an account? <Link href="/login" className="font-bold text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200">Sign in</Link></button>
          </div>
        </form>
      </div>)
    );
}



