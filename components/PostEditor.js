import { useState } from 'react';
import dynamic from 'next/dynamic';
import { FaSpinner } from "react-icons/fa";
import "easymde/dist/easymde.min.css";

const SimpleMDE = dynamic(() => import('react-simplemde-editor'), { ssr: false })

export default function PostEditor({post, setPost, savePost}) {
    const [isLoading, setIsLoading] = useState(false)
    const changeValue = (e) => {
        setPost(() => ({...post, [e.target.name] : e.target.value }))
    }

    return (
        <div id="post_box" className="border rounded-b p-1 flex flex-col bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
            <p className="text-2xl my-2 text-gray-900 dark:text-gray-100">Create Post</p>
            {/* <div className="grid grid-cols-2 gap-1 place-items-center"> */}
            <label required htmlFor="name" className="text-lg my-1 text-gray-800 dark:text-gray-200">
                Name
            </label>
            <input type="text" onChange={changeValue} className="p-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" placeholder="Enter name..." value={post?.name} name="name" id="name"/>
            <label htmlFor="subject" className="text-lg my-1 text-gray-800 dark:text-gray-200">
                Subject
            </label>
            <input type="text" onChange={changeValue} className="p-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" placeholder="Enter subject..." value={post?.subject} name="subject" id="subject"/>
            <label htmlFor="content" className="text-lg my-1 text-gray-800 dark:text-gray-200">
                Content
            </label>
            <textarea className="w-full px-3 py-2 text-gray-700 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700" rows="4" id="content" name="content" value={post?.content} onChange={changeValue}></textarea>
            {/* </div> */}
            {/* <SimpleMDE 
                value={post?.content} 
                onChange={value => setPost({...post, content: value})}

            /> */}
            <button className="bg-blue-200 dark:bg-blue-600 dark:text-white px-3 py-1 rounded inline-block my-2 hover:bg-blue-300 dark:hover:bg-blue-500" onClick={savePost} type="submit">
            {isLoading ? <FaSpinner className="m-auto h-6 animate-spin" /> : 'Save Post'}
            </button>
        </div>
    )
}