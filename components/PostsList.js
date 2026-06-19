import { formatDistance } from 'date-fns'
import { BiSearch } from 'react-icons/bi'
import { FaTrashAlt } from 'react-icons/fa'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'

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
        <div>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <label className="relative block w-full sm:max-w-xs">
                    <BiSearch className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"/>
                    <input className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:ring-blue-900/40"
                    type="search" name="search" placeholder="Search" 
                    value={search}
                    onChange={event => setSearch(event.target.value)}
                    />
                </label>
                <button className="self-start rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 sm:self-auto" onClick={() => toggle()}>Sort by date</button>
            </div>
            <div className="space-y-3">
                {posts.map((post) => {
                    return <Post post={post} key={post.id} deletePost={deletePost} />
                })}
            </div>
        </div>
    )
}

const Post = ({post, deletePost}) => {

    return (
        <article className="rounded-lg border border-gray-200 bg-white p-4 text-gray-900 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <p className="truncate font-semibold text-gray-900 dark:text-gray-100">{post.name || "Member"}</p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{formatDistance(new Date(post.updatedAt), new Date())} ago</p>
                </div>
                <button
                    type="button"
                    aria-label="Delete post"
                    title="Delete post"
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                    onClick={() => deletePost(post.id, post._version)}
                >
                    <FaTrashAlt className="h-3.5 w-3.5" />
                </button>
            </div>
            {post.threadLabel && (
                <div className="mt-3 text-sm">
                    {post.threadLink ? (
                        <Link href={post.threadLink} className="text-blue-600 dark:text-blue-400 hover:underline">
                            {post.threadLabel}
                        </Link>
                    ) : (
                        <span className="text-gray-600 dark:text-gray-300">{post.threadLabel}</span>
                    )}
                </div>
            )}
            {post.subject && (
                <p className="mt-3 font-medium text-gray-900 dark:text-gray-100">{post.subject}</p>
            )}
            <div className="prose prose-sm mt-2 max-w-none text-gray-800 dark:prose-invert dark:text-gray-100">
                <ReactMarkdown>{post.content || ""}</ReactMarkdown>
            </div>
        </article>
    )
}
