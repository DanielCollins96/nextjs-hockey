import {useState} from 'react'
import { getAllDraftYears, getDraft } from '../../lib/queries'
import ReactTable from '../../components/Table'
import Link from 'next/link'


export default function Drafts({id,draft}) {

  // usestate for round 1
  const [round, setRound] = useState(1)  

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
      cell: props => props.row.original?.playerId ? (<Link className='whitespace-nowrap' href={`/players/${props.row.original.playerId}`} passHref ><a className=" hover:text-blue-700 visited:text-purple-800">{props.row.original.playerName}</a></Link>) : (props.row.original.playerName)

    },
    {
      header: 'Pos',
      accessorFn: d => d['position']
    },
    {
      header: 'Drafted From',
      // accessorFn: d => d['position']
      cell: ({row}) => <>{row.original.amateurClubName} [{row.original.amateurLeague}]</>
    },
    {
      header: 'GP',
      accessorFn: d => d['games']
    },
    {
      header: 'G',
      accessorFn: d => d['goals']
    },
    {
      header: 'A',
      accessorFn: d => d['assists']
    },
    {
      header: 'P',
      accessorFn: d => d['points']
    },
    {
      header: 'PIM',
      accessorFn: d => d['pim']
    },
    {
      header: 'Last Season',
      accessorFn: d => d['last_season']
    },
  ]
  
  

  return (
  <div>
    <div className='flex p-1 gap-1'>
    <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded '>
      <Link href="/drafts">Back to Drafts</Link>
    </button>
    <br />
    <h3 className='text-lg font-bold grid place-content-center'>{id} NHL Draft</h3> 
      {Object.keys(draft).map((num) => <button className={`p-1 m-1 w-12 border ${round == num ? 'bg-blue-200': ''}`} key={num} onClick={() => setRound(num)}>{num}</button>)}
    </div>
      {draft && draft[round] && <ReactTable columns={columns} data={draft[round]} pageSize={40}/> }
  
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