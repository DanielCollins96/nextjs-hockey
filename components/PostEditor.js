import { useState } from 'react';
import dynamic from 'next/dynamic';
import "easymde/dist/easymde.min.css";

const SimpleMDE = dynamic(() => import('react-simplemde-editor'), { ssr: false })

export default function PostEditor({post, setPost, savePost}) {

    const changeTitle = (e) => {
        setPost(() => ({...post, [e.target.name] : e.target.value }))
    }
    

    return (
        <div id="post_box" className="border rounded-b p-1">
            <p className="text-2xl my-2">Create Post</p>
            <label htmlFor="title" className="text-3xl my-2">
            <input type="text" onChange={changeTitle} className="p-1" placeholder="Enter title..." value={post?.title} name="title" id="title"/>
            </label>
            <SimpleMDE 
                value={post?.content} 
                onChange={value => setPost({...post, content: value})}

            />
            <button className="bg-blue-200 px-3 py-1 rounded inline-block mb-2" onClick={savePost} type="submit">Save Post</button>
        </div>
    )
}