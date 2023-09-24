import React from 'react'
import Link from 'next/link'


export default function DraftList({drafts}) {
  return (
    <div className='border'>
        <div>NHL Amateur Drafts</div>
        <div>
            {drafts && drafts.map((draft, i) => {
                return (
                  <Link href={`/drafts/${draft.draftYear}`} key={i}>
                    <a>
                    <div>{draft.draftYear}</div>
                    </a>
                </Link>
                )
            })}
        </div>
    </div>
  )
}
