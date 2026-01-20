import React from 'react'
import { useQuery } from 'react-query'
import DraftList from '../../components/DraftList'
import { getAllDraftYears } from '../../lib/queries'
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

export async function getStaticProps() {
;
  const draftYears = await getAllDraftYears()
  // const draftYears = await res.json();

  return {
    props: {
      draftYears,
    },
    // Revalidate every 6 months (you can adjust the time as needed)
    revalidate: 60 * 60 * 24 * 180, // 180 days
  };
}
