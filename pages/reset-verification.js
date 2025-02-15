import { useEffect } from 'react'
import Link from 'next/link'
import ResetPasswordForm from '../components/ResetPasswordForm'

export default function ResetVerification() {
    return (
        (<div className="mx-auto flex flex-col max-w-lg items-center w-full">
            <div className="mt-8 w-full mx-3">
            <ResetPasswordForm />        
            <div className="flex flex-col gap-1 mt-6">
                <Link href="/reset-password" className="underline hover:no-underline mb-2">
                    Request a code
                </Link>
                <Link href="/login" className=" underline hover:no-underline">
                    Back to login
                </Link>
            </div> 
            </div>
        </div>)
    );
}
