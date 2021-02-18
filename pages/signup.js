import { useContext, useState } from 'react';
import * as Yup from 'yup';
import { useForm } from "react-hook-form";
import { useRouter } from 'next/router';
import { publicFetch } from '../utils/fetch';
import { TextField, Button } from "@material-ui/core";
import { Auth } from 'aws-amplify';
import { withAuthenticator, AmplifySignOut } from "@aws-amplify/ui-react";
import s from "./signup.module.css";

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
    
    const { register, handleSubmit } = useForm({
      validationSchema: signupSchema,
    });
    

    const onSubmit = async (data) => {
      console.log(data);

      try {
        console.log(JSON.stringify(data))
        const { email, username, password } = data;
        console.log(data.picture.item(0))
        const picture = data.picture.item(0)
        const user = await Auth.signUp({
          username, 
          password, 
          attributes: {
            picture,
            email, 
            name: "Danny",
          }
        });
        console.log(Object.keys(picture))
        console.log(user)
        // alert(user?.message)
        router.push('/dashboard');
      } catch (error) {
        console.log(error);
        alert(error.message)
        setLoginLoading(false);
      }
    }

    const onChange = (e) => {

      const file = e.target.files[0];
      console.log(file)
    }


    // console.log(errors)
    return (
        <div className={s.center}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <input ref={register} type="file" name="picture" onChange={onChange}/>
            <input ref={register} type="text" name="username" placeholder="Username" />
            <input ref={register} type="email" name="email" placeholder="Email"/>
            <input ref={register} type="password" name="password" placeholder="Password"/>
            <pre>
              {/* {Object.keys(errors).length > 0 && (
                <label>Errors: {JSON.stringify(errors, null, 2)}</label>
              )} */}
            </pre>
            <Button  color="primary" type="submit">Submit</Button>
          </form>
          <AmplifySignOut />
          {/* <p>{JSON.stringify(values, null, 2)}</p>
          <pre>{JSON.stringify(status, null, 2)}</pre> */}
        </div>
    );
}



