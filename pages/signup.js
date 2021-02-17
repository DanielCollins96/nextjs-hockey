import { useContext, useState } from 'react';
import { Form, Formik, Field, ErrorMessage, useField } from "formik";
import * as Yup from 'yup';
import { useRouter } from 'next/router';
import { publicFetch } from '../utils/fetch';
import { TextField, Button } from "@material-ui/core";
import { Auth } from 'aws-amplify';
import s from "./signup.module.css";

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
    username: Yup.string().required('Username is required'),
    email: Yup.string()
      .email('Invalid email')
      .required('Email is required'),
});

export default function Signup() {
    const router = useRouter();
    // const [signupSuccess, setSignupSuccess] = useState();
    // const [signupError, setSignupError] = useState();
    const [loginLoading, setLoginLoading] = useState(false);
    
    return (
        <div className={s.center}>
            <Formik
              initialValues={{ username: '', email: ''}}
              validationSchema={signupSchema}
              onSubmit={ (values) => 
                
                {
                  try {
                    console.log(JSON.stringify(values))
                    // alert(JSON.stringify(credentials))
                    //   const message = await publicFetch.post(
                    //     `signup`,
                    //     credentials
                    //   );
                    // actions.setStatus = {
                    //   message: res.data.message
                    // };
                    // const user = await Auth.signup({
                    //   email, username
                    // });
                
                    // setSignupSuccess(message);
                    // setSignupError('');
                
                    router.push('/dashboard');
                  } catch (error) {
                    console.log(error);
                    setLoginLoading(false);
                    // setSignupSuccess('');
                  }
                }
              }
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
                  {/* <div>
                    <TextField
                      color="secondary"
                    />
                  </div> */}
                    <div>
                      <MyTextField
                        name="username" 
                        type="input" 
                        placeholder="Username"
                        color="secondary"

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
                    </div>
                    {status && status.message && (
                      <div className="message">{status.message}</div>
                    )}
                    <Button disabled={isSubmitting} color="primary" type="submit">Submit</Button>
                <p>{JSON.stringify(values, null, 2)}</p>
                <pre>{JSON.stringify(status, null, 2)}</pre>
                </Form>
              )}
            </Formik>
        </div>
    );
}



