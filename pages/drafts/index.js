import React from 'react'
import DraftList from '../../components/DraftList'
import { useQuery } from 'react-query'

export default function index() {
  
  // use useQuery to getalldraftyears

  const { data: draftYears } = useQuery('draftYears', getDrafts)

  async function getDrafts() {
    const res = await fetch('/api/drafts')
    return res.json()
  }


  console.log(draftYears)
  return (
    <div className="grid place-content-center">
      <DraftList drafts={draftYears} />
    </div>
  )
}


