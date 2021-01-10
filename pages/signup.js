import { useContext, useState } from 'react';
import { Form, Formik, Field, ErrorMessage } from "formik";
import * as Yup from 'yup';
import { useRouter } from 'next/router';

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
          setLoginLoading(true);
          const { data } = await publicFetch.post(
            `signup`,
            credentials
          );
    
          // authContext.setAuthState(data);
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
            <Formik
              initialValues={{ userName: '', email: '', password: ''}}
              onSubmit={(data, {setSubmitting}) => {            
                setTimeout(() => {
                  alert(JSON.stringify(data, null, 2));
                  setSubmitting(false);
                }, 1400);
              }}
              validationSchema={signupSchema}
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
                    </div>
                    <div>
                        <Field 
                            name="email" 
                            type="email"
                            placeholder="Email"/>
                    </div>
                    <div>
                        <Field 
                            name="password" 
                            type="password"
                            placeholder="Password"/>
                    </div>
                    <button type="submit" disabled={isSubmitting}>Submit</button>
                <pre>{JSON.stringify(values, null, 2)}</pre>
                </Form>
              )}
            </Formik>
        </div>
    );
}



