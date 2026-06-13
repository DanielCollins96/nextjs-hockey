import {useState} from 'react'
import ReactTable from '../../components/Table'
import Link from 'next/link'
import SEO from '../../components/SEO'
import DraftList from '../../components/DraftList'
import { useRouter } from 'next/router'
import { FaDownload } from 'react-icons/fa'
import { playerUrl, teamUrl } from '../../lib/routes'


export default function Drafts({id,draft,draftYears}) {
  const router = useRouter()

  // usestate for round - 'all' shows all rounds
  const [round, setRound] = useState('all')  

  const rounds = Object.keys(draft).sort((a, b) => Number(a) - Number(b))

  // Get all players combined for 'all' view
  const allPlayers = rounds.flatMap((num) => draft[num])

  const handleYearChange = (event) => {
    router.push(`/drafts/${event.target.value}`)
  }

  const selectedPlayers = round === 'all' ? allPlayers : draft[round] || []

  const escapeCsvCell = (value) => {
    const stringValue = value == null ? '' : String(value)
    return /[",\n\r]/.test(stringValue) ? `"${stringValue.replace(/"/g, '""')}"` : stringValue
  }

  const downloadCsv = () => {
    const headers = ['Pick', 'Drafted From', 'Team', 'Player', 'Pos', 'GP', 'G', 'A', 'P', 'PIM', 'Last Season']
    const rows = selectedPlayers.map((player) => [
      `${player.overallPick} (${player.round})`,
      `${player.amateurClubName || ''} [${player.amateurLeague || ''}]`,
      player.teamAbbrev,
      player.playerName,
      player.positionCode,
      player.games,
      player.goals,
      player.assists,
      player.points,
      player.pim,
      player.last_season,
    ])
    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsvCell).join(','))
      .join('\r\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const filename = round === 'all' ? `${id}-nhl-draft.csv` : `${id}-nhl-draft-round-${round}.csv`

    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  // Alternate row colors when round changes - only when sorted by round, overallPick, or no sort
  const getRowClassName = (row, index, allRows, sorting) => {
    // Apply colors when sorted by round, overallPick, or no sort applied
    const sortId = sorting?.[0]?.id;
    const showColors = !sortId || sortId === 'round' || sortId === 'overallPick';
    if (!showColors) return "bg-white hover:bg-blue-50 dark:bg-slate-900 dark:hover:bg-slate-800";
    
    const roundNum = row.original?.round;
    return roundNum % 2 === 0 
      ? "bg-slate-50 hover:bg-blue-50 dark:bg-slate-800/70 dark:hover:bg-slate-800" 
      : "bg-white hover:bg-blue-50 dark:bg-slate-900 dark:hover:bg-slate-800";
  }

  const columns =  [
    {
      id: 'overallPick',
      header: 'Pick',
      accessorFn: d => d['overallPick'],
      cell: ({row}) => `${row.original.overallPick} (${row.original.round})`,
      size: 72,
      meta: {
        headerClassName: 'text-right',
        cellClassName: 'text-right tabular-nums',
      },
    },
    {
      id: 'draftedFrom',
      header: 'Drafted From',
      accessorFn: d => `${d.amateurClubName || ''} [${d.amateurLeague || ''}]`,
      cell: ({getValue}) => getValue(),
      size: 180,
      meta: {
        truncate: true,
        expandOnDoubleClick: true,
        expandedSize: 270,
      },
    },
    {
      header: 'Team',
      accessorFn: d => d['teamAbbrev'],
      cell: ({row}) => (<Link
        href={teamUrl(row.original.teamAbbrev, row.original.draftedByTeamId || row.original.teamId)}
        className=" hover:text-blue-700 visited:text-purple-800">{row.original.teamAbbrev}</Link>),
      size: 72,
    },
    {
      header: 'Player',
      accessorFn: d => d['playerName'],
      cell: props => props.row.original?.playerId ? (<Link className='whitespace-nowrap' href={playerUrl(props.row.original.playerName, props.row.original.playerId)}>{props.row.original.playerName}</Link>) : (props.row.original.playerName),
      size: 210,
    },
    {
      header: 'Pos',
      accessorFn: d => d['positionCode'],
      size: 56,
    },
    {
      header: 'GP',
      accessorFn: d => d['games'],
      size: 56,
    },
    {
      header: 'G',
      accessorFn: d => d['goals'],
      size: 48,
    },
    {
      header: 'A',
      accessorFn: d => d['assists'],
      size: 48,
    },
    {
      header: 'P',
      accessorFn: d => d['points'],
      size: 48,
    },
    {
      header: 'PIM',
      accessorFn: d => d['pim'],
      size: 56,
    },
    {
      header: 'Last Season',
      accessorFn: d => d['last_season'],
      size: 96,
    },
  ]
  
  

  return (
    <div className="mx-auto w-full max-w-7xl px-2 py-2 sm:px-4 lg:px-5">
      <SEO
        title={`${id} NHL Draft`}
        description={`Complete ${id} NHL Draft results with all picks by round. View career statistics for each drafted player including games played, goals, assists, and points.`}
        path={`/drafts/${id}`}
      />

      <div className="grid gap-3 lg:grid-cols-[11.5rem_minmax(0,1fr)] lg:items-start">
        <aside className="hidden lg:sticky lg:top-2 lg:block">
          <DraftList drafts={draftYears} currentYear={id} compact />
        </aside>

        <section className="min-w-0 rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="border-b border-slate-200 p-3 dark:border-slate-700">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <Link href="/drafts" className="text-sm font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                  Draft archive
                </Link>
                <h1 className="mt-0.5 text-2xl font-bold text-slate-950 dark:text-white">
                  {id} NHL Draft
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {allPlayers.length} picks across {rounds.length} rounds
                </p>
              </div>

              <div className="flex items-center gap-2">
                <label className="sr-only" htmlFor="draft-year">Draft year</label>
                <select
                  id="draft-year"
                  value={id}
                  onChange={handleYearChange}
                  className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm font-semibold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white lg:hidden"
                >
                  {draftYears.map((draft) => (
                    <option value={draft.draftYear} key={draft.draftYear}>
                      {draft.draftYear}
                    </option>
                  ))}
                </select>
                <div className="hidden rounded-md bg-slate-100 px-2.5 py-1.5 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200 sm:block">
                  <span className="font-semibold">{round === 'all' ? 'All rounds' : `Round ${round}`}</span>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <div className="min-w-0 flex-1 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="inline-flex gap-2 sm:flex-wrap">
                  <button
                    type="button"
                    aria-pressed={round === 'all'}
                    className={[
                      'min-h-9 min-w-24 rounded-md px-3 py-1.5 text-sm font-semibold transition',
                      'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900',
                      round === 'all'
                        ? 'bg-blue-600 text-white shadow-sm dark:bg-blue-500'
                        : 'border border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-blue-500 dark:hover:bg-slate-700',
                    ].join(' ')}
                    onClick={() => setRound('all')}
                  >
                    All rounds
                  </button>
                  {rounds.map((num) => (
                    <button
                      type="button"
                      aria-pressed={round === num}
                      className={[
                        'min-h-9 min-w-12 rounded-md px-3 py-1.5 text-sm font-semibold transition',
                        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900',
                        round === num
                          ? 'bg-blue-600 text-white shadow-sm dark:bg-blue-500'
                          : 'border border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-blue-500 dark:hover:bg-slate-700',
                      ].join(' ')}
                      key={num}
                      onClick={() => setRound(num)}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={downloadCsv}
                className="inline-flex h-9 w-10 shrink-0 items-center justify-center rounded-md bg-emerald-500 text-white shadow-sm transition hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                aria-label="Download CSV"
                title="Download CSV"
              >
                <FaDownload className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="p-2">
            {draft && round === 'all' && <ReactTable columns={columns} data={allPlayers} pageSize={50} rowClassName={getRowClassName} sortKey="overallPick" sortDesc={false} modern /> }
            {draft && round !== 'all' && draft[round] && <ReactTable columns={columns} data={draft[round]} pageSize={40} sortKey="overallPick" sortDesc={false} modern /> }
          </div>
        </section>
      </div>
    </div>
  )
}

export async function getServerSideProps({ params, req }) {
    const {id} = params
    const protocol = req.headers['x-forwarded-proto'] || 'http'
    const host = req.headers.host

    let draft = []
    let draftYears = []
    const [response, yearsResponse] = await Promise.all([
      fetch(`${protocol}://${host}/api/drafts/${id}`),
      fetch(`${protocol}://${host}/api/drafts`),
    ])

    if (response.status === 404) {
      return { notFound: true }
    }

    if (response.ok) {
      const payload = await response.json()
      draft = payload?.draft || []
    }

    if (yearsResponse.ok) {
      const payload = await yearsResponse.json()
      draftYears = payload?.years || []
    }

    if (draft) {
      draft = draft.reduce((acc, player) => {
        if (!acc[player.round]) {
          acc[player.round] = []
        }
        acc[player.round].push(player)
        return acc
      },{})
    }

    return {
      props: {
        id: params.id,
        draft,
        draftYears,
      }
    }
}
