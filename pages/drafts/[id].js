import React from 'react'
import { getAllDraftYears } from '../../lib/queries'

export default function index({id}) {
  return (
    <div>[{id}]</div>
  )
}

export async function getStaticPaths() {
    let draftYears = await getAllDraftYears()
    draftYears = draftYears.map(draft => {
        return { params: { id: draft.draftYear } }
    })

  return {
    paths: draftYears,
    fallback: true
  }
}

export async function getStaticProps({params}) {
    return {
        props: {
            id: params.id
        }
    }
}