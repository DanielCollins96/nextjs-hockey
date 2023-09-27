import React from 'react'
import { getAllDraftYears, getDraft } from '../../lib/queries'
import ReactTable from '../../components/PaginatedTable'
import Link from 'next/link'


export default function Drafts({id,draft}) {

  const columns =  [
    {
      header: 'Round',
      accessorFn: d => d['roundNumber']
    },
    {
      header: 'Num.',
      accessorFn: d => d['overallPickNumber']
    },
    {
      header: 'Drafted By',
      accessorFn: d => d['overallPickNumber'],
      cell: ({row}) => (<Link href={`/teams/${row.original.draftedByTeamId}`} passHref ><a className=" hover:text-blue-700 visited:text-purple-800">{row.original.triCode}</a></Link>)
    },
    {
      header: 'Player',
      accessorFn: d => d['playerName'],
      cell: props => props.row.original?.playerId ? (<Link className='w-44' href={`/players/${props.row.original.playerId}`} passHref ><a className=" hover:text-blue-700 visited:text-purple-800">{props.row.original.playerName}</a></Link>) : (props.row.original.playerName)

    },
    {
      header: 'Pos',
      accessorFn: d => d['position']
    },
    {
      header: 'Drafted From',
      // accessorFn: d => d['position']
      cell: ({row}) => (<Link href={`/teams/${row.original.teamId}`} passHref ><a className=" hover:text-blue-700 visited:text-purple-800">{row.original.amateurClubName} [{row.original.amateurLeague}]</a></Link>)
    },
  ]
  
  

  return (
    <div>[{id}]
      {draft && draft[1] && <ReactTable columns={columns} data={draft[1]} pageSize={40}/> }
  
    </div>
  )
}

export async function getStaticPaths() {
    let draftYears = await getAllDraftYears()
    draftYears = draftYears.map(draft => {
        return { params: { id: draft.draftYear } }
    })

  return {
    paths: draftYears,
    fallback: false
  }
}

export async function getStaticProps({params}) {
    const {id} = params
    let draft = await getDraft(id)

    // Group players by round number
    if (draft) {
      draft = draft.reduce((acc, player) => {
      console.log(player)
      if (!acc[player.roundNumber]) {
        acc[player.roundNumber] = [];
      }
      acc[player.roundNumber].push(player);
      return acc
      },{})
    }

    return {
        props: {
            id: params.id,
            draft
        }
    }
}