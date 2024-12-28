import {useState} from 'react'
import { Auth } from 'aws-amplify';
import { useForm } from "react-hook-form";
import { UseAuth } from '../contexts/Auth';
import { useRouter } from 'next/router'
import Link from 'next/link'
import { FaSpinner } from "react-icons/fa";
import RequestResetForm from '../components/RequestResetForm'


export default function ForgotPassword() {
    
    const router = useRouter()

    const [submitError, setSubmitError] = useState('')

    const { register, handleSubmit, formState } = useForm();
    const { isSubmitting } = formState;

    return (
        (<div className="mx-auto mt-10 px-3">
            <RequestResetForm />
            <div className="flex flex-col gap-1 mt-6">
                <Link href="/reset-verification" className="underline hover:no-underline mb-2">
                    Have a code?
                </Link>
                <Link href="/login" className=" underline hover:no-underline">
                    Back to login
                </Link>
            </div>
        </div>)
    );
}
