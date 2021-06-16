import { motion } from 'framer-motion';
import Ticker from 'react-ticker';
import {useEffect, useState } from 'react';
import Link from 'next/link'
import { supabase } from '../api'


export default function Home() {
const [games, setGames] = useState([]);
// useEffect(async() => {
//   const data = await fetch('https://statsapi.web.nhl.com/api/v1/schedule');
//   let gameSchedule = await data.json();
//   setGames(gameSchedule.dates[0]?.games);
// },[])

const [userPosts, setUserPosts] = useState(null)
// const [posts, setPosts] = useState(null)
const [loading, setLoading] = useState(true)
useEffect(() => {
  fetchPosts()
}, [])
async function fetchPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select()
  console.log(typeof Object.entries(data));
  console.log(data);
  setUserPosts(data)
  setLoading(false)
}

  return (
          <div>
          <div className="flex justify-center">
          <motion.img
            className="" 
            src="/ice-hockey-puck.svg" 
            alt="Puck" 
            width="200" 
            height="200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: .1 }}
            whileTap={{ scale: 0.9 }}
            drag={true}
            />
          </div>
          <div>
          <div className="flex items-center flex-col">
      <h1 className="text-3xl font-semibold tracking-wide mt-6 mb-2">Posts</h1>
      {
        userPosts && userPosts.length ? userPosts.map(post => (
          <Link key={post.id} href={`/posts/${post.id}`}>
            <div className="cursor-pointer border-b border-gray-300	mt-8 pb-4">
              <h2 className="text-xl font-semibold">{post.title}</h2>
              <p className="text-gray-500 mt-2">Author: {post.user_email}</p>
            </div>
          </Link>)
        )
        :
        <p className="text-2xl">No posts.</p>
      }
      <div>{JSON.stringify(userPosts)}</div>
    </div>
          </div>
    </div>
  )
}
