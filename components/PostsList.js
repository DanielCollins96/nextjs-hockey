import { useState } from 'react'
import { formatDistance, format } from 'date-fns'
import { BiSearch } from 'react-icons/bi'

export default function PostsList({posts, search, setSearch, error, deletePost, toggle}) {

    if (error) {
        return (
            <div className="bg-red-300 dark:bg-red-700 text-white p-2 rounded">
                <p className="">Error retrieving posts.</p>
            </div>
        )
    }
    
    if (!posts) {
        return (
            <div className="bg-red-300 dark:bg-red-700 text-white p-2 rounded">
                <p className="">No Posts...</p>
            </div>
        )
    }

    return (
        <div className="border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800">
            <div className="flex justify-between p-1">
                <div className="relative flex w-64">
                    <input className="p-1 w-full border-2 border-gray-300 dark:border-gray-600 rounded-l-lg focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    type="search" name="search" placeholder="Search" 
                    value={search}
                    onChange={event => setSearch(event.target.value)}
                    />
                    {/* <button type="submit" className="absolute right-0 top-0 bottom-0"> */}
                    <div className="bg-gray-300 dark:bg-gray-700 rounded-r-lg p-1 grid">
                        <BiSearch className="text-gray-600 dark:text-gray-200 h-8 w-8 m-auto"/>
                    </div>
                    {/* </button> */}
                </div>
                <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600" onClick={() => toggle()}>Sort By Date</button>
            </div>
            {posts.map((post) => {
                return <Post post={post} key={post.id} deletePost={deletePost} />
            })}
        </div>
    )
}

const Post = ({post, deletePost}) => {

    return (
        <div className="p-1 m-1 border border-gray-300 dark:border-gray-700 flex flex-col bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded">
            <div className="flex justify-between mb-1">
            <p className="font-bold text-gray-900 dark:text-gray-100">{post.name}</p>
            <div className="flex gap-2 items-center">
            <p className="text-gray-700 dark:text-gray-400">{formatDistance(new Date(post.updatedAt), new Date())} ago</p>
            <button className="bg-red-500 py-1 px-3 rounded hover:bg-red-400 text-white" onClick={() => deletePost(post.id, post._version)}>X</button>
            </div>
            </div>
            <p className="text-gray-800 dark:text-gray-100">{post.subject}</p>
            <p className="text-gray-800 dark:text-gray-100">{post.content}</p>
        </div>
    )
}
