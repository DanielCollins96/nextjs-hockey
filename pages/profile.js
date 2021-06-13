import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/Auth';
import dynamic from 'next/dynamic';
import "easymde/dist/easymde.min.css";
import { Auth, Typography, Button } from "@supabase/ui";
import { supabase } from '../api'


const SimpleMDE = dynamic(() => import('react-simplemde-editor'), { ssr: false })


// https://docs.amplify.aws/ui/auth/authenticator/q/framework/react#custom-form-fields
function Profile(props) {
  // const { user } = useAuth();
  const { user } = Auth.useUser();
  const [post, setPost] = useState(null);
  const [posts, setPosts] = useState([]);

  const changePost = (e) => {
    setPost(() => ({...post, [e.target.name] : e.target.value }))
  }

  const savePost = () => {
    console.log(post)
  }

  if(user){
    return (
      <div>
        <h2>Welcome {user.email}</h2> 
        <div className="">
          <div>
            <label htmlFor="title">
              <input type="text" onChange={changePost} placeholder="Title" value={post?.title} name="title" id="title"/>
            </label>
            <SimpleMDE value={post?.content} onChange={value => setPost({...post, content: value})}/>
            <button onClick={savePost} type="submit">Save Post</button>
          </div>
        </div>
      </div>
    )
  }
  return props.children
}

export default function AuthProfile() {
  return (
      <Auth.UserContextProvider supabaseClient={supabase}>
        <Profile supabaseClient={supabase}>
          <Auth supabaseClient={supabase} />
        </Profile>
      </Auth.UserContextProvider>
  )
}

// export default withAuthenticator(Profile)
// export default Profile