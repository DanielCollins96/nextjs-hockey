import { useContext, useState } from 'react';
import * as Yup from 'yup';
import { useForm } from "react-hook-form";
import { useRouter } from 'next/router';
import { Auth } from 'aws-amplify';
import Link from 'next/link'
import { useAuth } from '../contexts/Auth';


const signupSchema = Yup.object().shape({
    username: Yup.string().required('Username is required'),
    email: Yup.string()
      .email('Invalid email')
      .required('Email is required'),
    password: Yup.string().required('Password is required')
      .min(8)

});

export default function Signup() {
    const router = useRouter();

    const { signUp } = useAuth()


    const { register, handleSubmit } = useForm();
    const [loginLoading, setLoginLoading] = useState(false);
    

    const onSubmit = async (data) => {

      try {
        console.log(data);
        let res = await signUp(data)
        console.log(res);
        if (res.username) {
          // router.push('/profile');
        }
      } catch (error) {
        console.log('wtf');
        console.log(error);
        alert(error.message)
        setLoginLoading(false);
      }
    }


    // console.log(errors)
    return (
        <div className="w-full max-w-sm mx-auto mt-12">
            <form onSubmit={handleSubmit(onSubmit)} class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <p className="mt-3 mb-6 font-bold tracking-wide text-lg">Sign up for an account</p>

              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                <input required type="email" {...register('email')} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"/>
              </div>
              <div className="mb-6">
                <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                <input type="password" {...register('password')} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"/>
              </div>
              <div className="flex items-center justify-between">
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"type="submit">Submit</button>
                <button className="inline-block align-baseline font- text-sm">Have an account? <Link href="/login"><a className="font-bold text-blue-500 hover:text-blue-800">Sign in</a></Link></button>
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
    );
}



