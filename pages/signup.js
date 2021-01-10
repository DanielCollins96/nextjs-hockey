import { useContext, useState } from 'react';
import { Form, Formik, Field, ErrorMessage } from "formik";
import * as Yup from 'yup';
import { useRouter } from 'next/router';
import { publicFetch } from '../utils/fetch';



const signupSchema = Yup.object().shape({
    userName: Yup.string().required('Username is required'),
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
            console.log(credentials)
          setLoginLoading(true);
        //   const { message } = await publicFetch.post(
        //     `signup`,
        //     credentials
        //   );
        let message = await fetch('signup', {
            method: 'POST',
            credentials
        })
            console.log(message)
          // authContext.setAuthState(data);
          setSignupSuccess(message);
          setSignupError('');
    
          router.push('/dashboard');
        } catch (error) {
          setLoginLoading(false);
        //   const { data } = error.response;
        //   const data = error;
          console.log(error)
        //   console.log(JSON.stringify(data))
        //   setSignupError(message);
          setSignupSuccess('');
        }
      };
    
    return (
        <div>
            <Formik
              initialValues={{ userName: '', email: '', password: ''}}
              validationSchema={signupSchema}
              onSubmit={(values, {setSubmitting}) => {            console.log('Values:', values)
                //   alert(JSON.stringify(data, null, 2));
                setSubmitting(false);
                submitCredentials(values)
              }}
            >
              {({
                values,
                handleChange,
                handleBlur,
                isSubmitting
              }) => (
                <Form>
                    <div>
                        <Field 
                            name="userName" 
                            type="input" 
                            placeholder="Username"/>
                        <ErrorMessage name="userName" /> 
                    </div>
                    <div>
                        <Field 
                            name="email" 
                            type="email"
                            placeholder="Email"/>
                        <ErrorMessage name="email" /> 
                    </div>
                    <div>
                        <Field 
                            name="password" 
                            type="password"
                            placeholder="Password"/>
                        <ErrorMessage name="password" /> 
                    </div>
                    <div>

                    </div>
                    <button type="submit" disabled={isSubmitting}>Submit</button>
                <pre>{JSON.stringify(values, null, 2)}</pre>
                </Form>
              )}
            </Formik>
        </div>
    );
}



