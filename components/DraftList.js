import React from 'react'
import Link from 'next/link'


export default function DraftList({drafts}) {
  return (
    <div className='border-2'>
        <div className='p-1 bg-indigo-300 border-2'>NHL Amateur Drafts</div>
        <div className='flex flex-wrap max-w-3xl'>
            {drafts && drafts.map((draft, i) => {
                return (
                  <Link href={`/drafts/${draft.draftYear}`}  key={i}>
                    <a>
                    <div className='p-1 border mx-1'>{draft.draftYear}</div>
                    </a>
                </Link>
                )
            })}
        </div>
    </div>
  )
}
