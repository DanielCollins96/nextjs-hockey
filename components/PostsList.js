import { useState } from 'react'
import { formatDistance, format } from 'date-fns'

export default function PostsList({posts}) {

    if (!posts) {
        return (
            <div className="bg-red-300">
                <p className="">No Posts...</p>
            </div>
        )
    }
    return (
        <di className="border">
            {posts.map((post) => {
                return <Post post={post} key={post.id} />
            })}
        </di>
    )
}

const Post = ({post}) => {

    return (
        <div className="p-1 m-1 border flex flex-col">
            <div className="flex justify-between">
            <p className="font-bold mb-1">{post.title}</p>
            <p className="">{formatDistance(new Date(post.updatedAt), new Date())} ago</p>
            {/* <p className="">{post.updatedAt}</p> */}
            </div>
            <p className="">{post.content}</p>
        </div>
    )
}
