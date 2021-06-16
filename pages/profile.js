import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/Auth';
import dynamic from 'next/dynamic';
import "easymde/dist/easymde.min.css";
import { Auth, Typography, Button } from "@supabase/ui";
import { supabase } from '../api'
import {formatDistance} from 'date-fns'
import { ToastContainer, toast } from 'react-toastify';



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
      .from('posts')
      .select()
      .limit(5)
      .order('inserted_at', {ascending: false})
    setPosts(data)
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  const changePost = (e) => {
    setPost(() => ({...post, [e.target.name] : e.target.value }))
  }

  const savePost = () => {
    console.log(post)
  }

  if(user){
    const {email, id} = user;
    return (
      <div>
        <h2 className="p-4">Welcome {email}</h2> 
        <div className="flex bg-red-200 p-4 flex-col sm:flex-row">
        <aside className="flex-3">
          <div>
            <p className="text-xl">Recent Posts</p>
            {
             posts.length > 0 &&
             <div className="max-h-5/6 overflow-scroll">
               {posts.map(({title, content, inserted_at}) => {
                 return (
                   <div className="rounded border border-yellow-400 bg-yellow-100 p-2 m-1 overflow-scroll">
                     <p className="">{title}</p>
                     <p className="">{content}</p>
                     <p className="">{formatDistance(new Date(inserted_at),new Date(),{ addSuffix: true })}</p>
                   </div>
                 )
               })}
             </div> 
            }
          </div>
        </aside>
        <div className="max-w-lg flex-1">
          <p className="text-xl">Watch List</p>
          {
            posts.length > 0 && 
            <div className="overflow-hidden max-h-full">
              {/* {posts.map((country) => {
                return(
                  <div className="bg-blue-100 p-4">
                    <p>{country.name}</p>
                  </div>
                  )
              })} */}
            </div>
          }
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