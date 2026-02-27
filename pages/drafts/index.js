import React from 'react'
import { useQuery } from 'react-query'
import DraftList from '../../components/DraftList'
import SEO from '../../components/SEO'



export default function Drafts({draftYears}) {

  console.log(draftYears)
  return (
    <div className="grid place-content-center">
      <SEO
        title="NHL Draft History"
        description="Browse historical NHL draft results by year. View draft picks, player career stats, and draft class analysis."
        path="/drafts"
      />
      <DraftList drafts={draftYears} />
    </div>
  )
}

export async function getServerSideProps({ req }) {
  const protocol = req.headers['x-forwarded-proto'] || 'http'
  const host = req.headers.host

  let draftYears = []
  const response = await fetch(`${protocol}://${host}/api/drafts`)
  if (response.ok) {
    const payload = await response.json()
    draftYears = payload?.years || []
  }

  return {
    props: {
      draftYears,
    }
  }
}
