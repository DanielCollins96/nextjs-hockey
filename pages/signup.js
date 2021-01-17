import { useContext, useState } from 'react';
import { Form, Formik, Field, ErrorMessage, useField } from "formik";
import * as Yup from 'yup';
import { useRouter } from 'next/router';
import { publicFetch } from '../utils/fetch';
import { TextField, Button } from "@material-ui/core";

function MyTextField({ placeholder, ...props}) {
  const [field, meta, helpers] = useField(props);
  const errorText = meta.error && meta.touched ? meta.error : "";
  return (
    <>
      <TextField
        placeholder={placeholder}
        {...field}
        helperText={errorText}
        error={!!errorText}
      />
    </>
  )
}

const signupSchema = Yup.object().shape({
    userName: Yup.string().required('Username is required'),
    email: Yup.string()
      .email('Invalid email')
      .required('Email is required'),
    password: Yup.string().required('Password is required')
});

const submitCredentials = async (credentials, actions) => {
  try {
    // console.log(process.env.NEXT_PUBLIC_API_URL)
    console.log(JSON.stringify(credentials))
    // setLoginLoading(true);
      // const { message } = await publicFetch.post(
      const message = await publicFetch.post(
        `signup`,
        credentials
      );
    actions.setStatus = {
      message: res.data.message
    };
    console.log(message.data)
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

export default function Signup() {
    const router = useRouter();
    const [signupSuccess, setSignupSuccess] = useState();
    const [signupError, setSignupError] = useState();
    const [loginLoading, setLoginLoading] = useState(false);
    
    return (
        <div>
            <Formik
              initialValues={{ userName: '', email: '', password: ''}}
              validationSchema={signupSchema}
              onSubmit={submitCredentials}
              // onSubmit={(values, {setSubmitting, setStatus}) => {            
              //   console.log('Values:', values)
              //   setSubmitting(false);
              //   submitCredentials(values)
              // }}
            >
              {({
                values,
                handleChange,
                handleBlur,
                isSubmitting,
                status
              }) => (
                <Form>
                    <div>
                      <MyTextField
                        name="userName" 
                        type="input" 
                        placeholder="Username"
                      />
                    </div>
                    <div>
                      <MyTextField
                        name="email" 
                        type="email"
                        placeholder="Email"
                      />                        
                    </div>
                    <div>
                      <MyTextField 
                        id="password" 
                        name="password" 
                        type="password" 
                        placeholder="Password"
                      />
                    </div>
                    <div>
                    </div>
                    {status && status.message && (
                      <div className="message">{status.message}</div>
                    )}
                    <Button disabled={isSubmitting} color="primary" type="submit">Submit</Button>
                    {/* <button type="submit" disabled={isSubmitting}>Submit</button> */}
                <pre>{JSON.stringify(values, null, 2)}</pre>
                <pre>{JSON.stringify(status, null, 2)}</pre>
                </Form>
              )}
            </Formik>
        </div>
    );
}



