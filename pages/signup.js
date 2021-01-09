import { useContext, useState } from 'react';
import { Form, Formik } from "formik";
import * as Yup from 'yup';
import { useRouter } from 'next/router';

const SignupSchema = Yup.object().shape({
    firstName: Yup.string().required(
      'First name is required'
    ),
    lastName: Yup.string().required('Last name is required'),
    email: Yup.string()
      .email('Invalid email')
      .required('Email is required'),
    password: Yup.string().required('Password is required')
});

export default function Signup() {
    const router = useRouter();
    const [signupSuccess, setSignupSuccess] = useState();
    const [signupError, setSignupError] = useState();
    const [loginLoading, setLoginLoading] = useState(false);
    
    const submitCredentials = async credentials => {
        try {
          setLoginLoading(true);
          const { data } = await publicFetch.post(
            `signup`,
            credentials
          );
    
          authContext.setAuthState(data);
          setSignupSuccess(data.message);
          setSignupError('');
    
          router.push('/dashboard');
        } catch (error) {
          setLoginLoading(false);
          const { data } = error.response;
          setSignupError(data.message);
          setSignupSuccess('');
        }
      };
    
    return (
        <div>
            killa
        </div>
    );
}



