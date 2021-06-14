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
  const [status, setStatus] = useState('');
  const [post, setPost] = useState(null);
  const [posts, setPosts] = useState([]);

  async function fetchPosts() {
    const { data, error } = await supabase
      .from('countries')
      .select()
    setPosts(data)
    setLoading(false)
  }

  const changePost = (e) => {
    setPost(() => ({...post, [e.target.name] : e.target.value }))
  }

  const savePost = () => {
    console.log(post)
  }


  console.log("user")
  console.log(user)
  if(user){
    const {email, id} = user;
    return (
      <div>
        <h2 className="p-4">Welcome {email}</h2> 
        <div className="flex bg-red-200 p-4 flex-col sm:flex-row">
        <aside className="flex-3">
          <p className="text-xl">Profile</p>
        </aside>
        <div className="max-w-lg flex-1">
          <div>
            <label htmlFor="title">
              <input type="text" onChange={changePost} placeholder="Title" value={post?.title} name="title" id="title"/>
            </label>
            <SimpleMDE value={post?.content} onChange={value => setPost({...post, content: value})}/>
            <button onClick={savePost} type="submit">Save Post</button>
          </div>
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