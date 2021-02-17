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
    password: Yup.string().required('Password is required')
      .min(8)

});

export default function Signup() {
    const router = useRouter();
    // const [signupSuccess, setSignupSuccess] = useState();
    // const [signupError, setSignupError] = useState();
    const [loginLoading, setLoginLoading] = useState(false);
    
    return (
        <div className={s.center}>
            <Formik
              initialValues={{ username: '', email: '', password: ''}}
              validationSchema={signupSchema}
              onSubmit={ async (values) => {
                  try {
                    console.log(JSON.stringify(values.username))
                    // alert(JSON.stringify(credentials))
                    const { email, username, password } = values;
                    const user = await Auth.signUp({
                      email, username, password
                    });
                    console.log(user)
                    alert(user?.message)
                    router.push('/dashboard');
                  } catch (error) {
                    console.log(error);
                    alert(error.message)
                    setLoginLoading(false);
                  }
                }
              }
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
                      <MyTextField 
                        id="password" 
                        name="password" 
                        type="password" 
                        placeholder="Password"
                      />
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



