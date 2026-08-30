import React from 'react'
import DraftList from '../../components/DraftList'
import SEO from '../../components/SEO'
import { PAGE_CACHE, setPageCache } from '../../lib/http-cache'



export default function Drafts({draftYears}) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <SEO
        title="NHL Draft History"
        description="Browse historical NHL draft results by year. View draft picks, player career stats, and draft class analysis."
        path="/drafts"
      />
      <DraftList drafts={draftYears} />
    </div>
  )
}

export async function getServerSideProps({ res }) {
  try {
    const { loadDraftYears } = await import('../../lib/draft-data')
    const payload = await loadDraftYears()
    const draftYears = payload?.years || []

    setPageCache(res, PAGE_CACHE.stable)
    return {
      props: {
        draftYears,
      }
    }
  } catch (error) {
    console.log(error)
    setPageCache(res, PAGE_CACHE.error)
    return {
      props: {
        draftYears: [],
      }
    }
  }
}
