import React from 'react'
import { useQuery } from 'react-query'
import DraftList from '../../components/DraftList'
import { getAllDraftYears } from '../../lib/queries'



export default function Drafts({draftYears}) {

  console.log(draftYears)
  return (
    <div className="grid place-content-center">
      <DraftList drafts={draftYears} />
    </div>
  )
}

export async function getStaticProps() {
  try {
    const draftYears = await getAllDraftYears()
    return {
      props: {
        draftYears: draftYears || [],
      },
      // Revalidate every 6 months (you can adjust the time as needed)
      revalidate: 60 * 60 * 24 * 180, // 180 days
    };
  } catch (error) {
    console.log('Database connection failed, returning empty draft years')
    return {
      props: {
        draftYears: [],
      },
      revalidate: 60, // Try again in 1 minute
    };
  }
}
