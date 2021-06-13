import { useContext, useState } from 'react';
import * as Yup from 'yup';
import { useForm } from "react-hook-form";
import { useRouter } from 'next/router';
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
    const [loginLoading, setLoginLoading] = useState(false);
    

    const onSubmit = async (data) => {

      try {
        // const { email, username, password } = data;
        // console.log(data.picture.item(0))
        // const picture = data.picture.item(0)
        // const user = await Auth.signUp({
        //   username, 
        //   password, 
        //   attributes: {
        //     picture,
        //     email, 
        //     name: "Danny",
        //   }
        // });
        // console.log(Object.keys(picture))
        // console.log(user)
        // // alert(user?.message)
        // router.push('/dashboard');
      } catch (error) {
        console.log(error);
        alert(error.message)
        setLoginLoading(false);
      }
    }


    // console.log(errors)
    return (
        <div className={s.center}>
            <pre>
              {/* {Object.keys(errors).length > 0 && (
                <label>Errors: {JSON.stringify(errors, null, 2)}</label>
              )} */}
            </pre>
            <Button  color="primary" type="submit">Submit</Button>
          {/* <p>{JSON.stringify(values, null, 2)}</p>
          <pre>{JSON.stringify(status, null, 2)}</pre> */}
        </div>
    );
}



