import {useState} from 'react'
import { getAllDraftYears, getDraft } from '../../lib/queries'
import ReactTable from '../../components/Table'
import Link from 'next/link'
import SEO from '../../components/SEO'


export default function Drafts({id,draft}) {

  // usestate for round - 'all' shows all rounds
  const [round, setRound] = useState('all')  

  // Get all players combined for 'all' view
  const allPlayers = Object.values(draft).flat()

  // Alternate row colors when round changes - only when sorted by round, overallPick, or no sort
  const getRowClassName = (row, index, allRows, sorting) => {
    // Apply colors when sorted by round, overallPick, or no sort applied
    const sortId = sorting?.[0]?.id;
    const showColors = !sortId || sortId === 'round' || sortId === 'overallPick';
    if (!showColors) return "dark:bg-gray-800";
    
    const roundNum = row.original?.round;
    return roundNum % 2 === 0 
      ? "bg-slate-200 dark:bg-gray-700" 
      : "bg-white dark:bg-gray-800";
  }

  const columns =  [
    {
      id: 'round',
      header: 'Round',
      accessorFn: d => d['round']
    },
    {
      id: 'overallPick',
      header: 'Num.',
      accessorFn: d => d['overallPick']
    },
    {
      header: 'Drafted By',
      accessorFn: d => d['teamAbbrev'],
      cell: ({row}) => (<Link
        href={`/teams/${row.original.draftedByTeamId}`}
        passHref
        className=" hover:text-blue-700 visited:text-purple-800">{row.original.teamAbbrev}</Link>)
    },
    {
      header: 'Player',
      accessorFn: d => d['playerName'],
      cell: props => props.row.original?.playerId ? (<Link className='whitespace-nowrap' href={`/players/${props.row.original.playerId}`} passHref >{props.row.original.playerName}</Link>) : (props.row.original.playerName)

    },
    {
      header: 'Pos',
      accessorFn: d => d['positionCode']
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
    <SEO
      title={`${id} NHL Draft`}
      description={`Complete ${id} NHL Draft results with all picks by round. View career statistics for each drafted player including games played, goals, assists, and points.`}
      path={`/drafts/${id}`}
    />
    <div className='flex p-1 gap-1'>
    <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded '>
      <Link href="/drafts">Back to Drafts</Link>
    </button>
    <br />
    <h3 className='text-lg font-bold grid place-content-center'>{id} NHL Draft</h3> 
      <button className={`p-1 m-1 w-12 border ${round === 'all' ? 'bg-blue-200 dark:bg-blue-800': ''}`} onClick={() => setRound('all')}>All</button>
      {Object.keys(draft).map((num) => <button className={`p-1 m-1 w-12 border ${round == num ? 'bg-blue-200 dark:bg-blue-800': ''}`} key={num} onClick={() => setRound(num)}>{num}</button>)}
    </div>
      {draft && round === 'all' && <ReactTable columns={columns} data={allPlayers} pageSize={50} rowClassName={getRowClassName} sortKey="overallPick" sortDesc={false}/> }
      {draft && round !== 'all' && draft[round] && <ReactTable columns={columns} data={draft[round]} pageSize={40} sortKey="overallPick" sortDesc={false}/> }
  
  </div>
  )
}

export async function getStaticPaths() {
    let draftYears = await getAllDraftYears()
    draftYears = draftYears.map(draft => {
        return { params: { id: String(draft.draftYear) } }
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
      if (!acc[player.round]) {
        acc[player.round] = [];
      }
      acc[player.round].push(player);
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