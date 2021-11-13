import { useState } from 'react';
import dynamic from 'next/dynamic';
import "easymde/dist/easymde.min.css";

const SimpleMDE = dynamic(() => import('react-simplemde-editor'), { ssr: false })

export default function PostEditor({post, setPost, savePost}) {

    const changeValue = (e) => {
        setPost(() => ({...post, [e.target.name] : e.target.value }))
    }

    return (
        <div id="post_box" className="border rounded-b p-1 flex flex-col">
            <p className="text-2xl my-2">Create Post</p>
            {/* <div className="grid grid-cols-2 gap-1 place-items-center"> */}
            <label htmlFor="name" className="text-lg my-1">
                Name
            </label>
            <input type="text" onChange={changeValue} className="p-1 rounded" placeholder="Enter name..." value={post?.name} name="name" id="name"/>
            <label htmlFor="subject" className="text-lg my-1">
                Subject
            </label>
            <input type="text" onChange={changeValue} className="p-1 rounded" placeholder="Enter subject..." value={post?.subject} name="subject" id="subject"/>
            <label htmlFor="content" className="text-lg my-1">
                Content
            </label>
            <textarea className="w-full px-3 py-2 text-gray-700 border rounded-lg " rows="4" id="content" name="content" value={post?.content} onChange={changeValue}></textarea>
            {/* </div> */}
            {/* <SimpleMDE 
                value={post?.content} 
                onChange={value => setPost({...post, content: value})}

            /> */}
            <button className="bg-blue-200 px-3 py-1 rounded inline-block my-2" onClick={savePost} type="submit">Save Post</button>
        </div>
    )
}