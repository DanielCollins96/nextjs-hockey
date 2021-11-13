import { useState } from 'react'
import { formatDistance, format } from 'date-fns'
import { BiSearch } from 'react-icons/bi'

export default function PostsList({posts, search, setSearch}) {

    if (!posts) {
        return (
            <div className="bg-red-300">
                <p className="">No Posts...</p>
            </div>
        )
    }
    return (
        <di className="border">
            <div className="flex justify-between p-1">
                <div className="relative flex w-64">
                    <input className="p-1 w-full border-2 border-gray-300 rounded-l-lg focus:outline-none"
                    type="search" name="search" placeholder="Search" 
                    onChange={event => setSearch(event.target.value)}
                    />
                    {/* <button type="submit" className="absolute right-0 top-0 bottom-0"> */}
                    <div className="bg-gray-300 rounded-r-lg p-2 grid">
                        <BiSearch className="text-gray-600 h-6 w-6 m-auto"/>
                    </div>
                    {/* </button> */}
                </div>
                <button className="px-3 py-1 border bg-white">Sort By Date</button>
            </div>
            {posts.map((post) => {
                return <Post post={post} key={post.id} />
            })}
        </di>
    )
}

const Post = ({post}) => {

    return (
        <div className="p-1 m-1 border flex flex-col bg-white">
            <div className="flex justify-between mb-1">
            <p className="">{post.name}</p>
            <p className="">{formatDistance(new Date(post.updatedAt), new Date())} ago</p>
            {/* <p className="">{post.updatedAt}</p> */}
            </div>
            <p className="">{post.content}</p>
        </div>
    )
}
