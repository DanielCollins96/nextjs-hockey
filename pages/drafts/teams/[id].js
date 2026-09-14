import { useState } from 'react'
import ReactTable from '../../../components/Table'
import Link from 'next/link'
import { useRouter } from 'next/router'
import SEO from '../../../components/SEO'
import DraftTeamList from '../../../components/DraftTeamList'
import { FaDownload } from 'react-icons/fa'
import { draftTeamUrl, extractEntityId, playerUrl, teamUrl } from '../../../lib/routes'
import { PAGE_CACHE, setPageCache } from '../../../lib/http-cache'

export default function DraftByTeam({ team, draft, draftTeams }) {
  const router = useRouter()
  const [year, setYear] = useState('all')

  const years = Object.keys(draft)
    .map(Number)
    .sort((a, b) => b - a)
    .map(String)

  const allPlayers = years.flatMap((draftYear) => draft[draftYear] || [])
  const selectedPlayers = year === 'all' ? allPlayers : draft[year] || []

  const teamName = team?.name || team?.abbreviation || 'Team'
  const teamAbbrev = team?.abbreviation || ''
  const logoUrl = teamAbbrev
    ? `https://assets.nhle.com/logos/nhl/svg/${teamAbbrev}_dark.svg`
    : null

  const escapeCsvCell = (value) => {
    const stringValue = value == null ? '' : String(value)
    return /[",\n\r]/.test(stringValue) ? `"${stringValue.replace(/"/g, '""')}"` : stringValue
  }

  const downloadCsv = () => {
    const headers = ['Year', 'Pick', 'Drafted From', 'Player', 'Pos', 'GP', 'G', 'A', 'P', 'PIM', 'Last Season']
    const rows = selectedPlayers.map((player) => [
      player.draftYear,
      `${player.overallPick} (${player.round})`,
      `${player.amateurClubName || ''} [${player.amateurLeague || ''}]`,
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
    const filename =
      year === 'all'
        ? `${teamAbbrev || team.id}-nhl-draft-history.csv`
        : `${teamAbbrev || team.id}-${year}-nhl-draft.csv`

    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  const getRowClassName = (row, index, allRows, sorting) => {
    const sortId = sorting?.[0]?.id
    const showColors = !sortId || sortId === 'draftYear' || sortId === 'overallPick'
    if (!showColors) return 'bg-white hover:bg-blue-50 dark:bg-slate-900 dark:hover:bg-slate-800'

    const yearNum = Number(row.original?.draftYear)
    return yearNum % 2 === 0
      ? 'bg-slate-50 hover:bg-blue-50 dark:bg-slate-800/70 dark:hover:bg-slate-800'
      : 'bg-white hover:bg-blue-50 dark:bg-slate-900 dark:hover:bg-slate-800'
  }

  const columns = [
    {
      id: 'draftYear',
      header: 'Year',
      accessorFn: (d) => d.draftYear,
      cell: ({ row }) => (
        <Link
          href={`/drafts/${row.original.draftYear}`}
          className="hover:text-blue-700 visited:text-purple-800"
        >
          {row.original.draftYear}
        </Link>
      ),
      size: 72,
      meta: {
        headerClassName: 'text-right',
        cellClassName: 'text-right tabular-nums',
      },
    },
    {
      id: 'overallPick',
      header: 'Pick',
      accessorFn: (d) => d.overallPick,
      cell: ({ row }) => `${row.original.overallPick} (${row.original.round})`,
      size: 72,
      meta: {
        headerClassName: 'text-right',
        cellClassName: 'text-right tabular-nums',
      },
    },
    {
      id: 'draftedFrom',
      header: 'Drafted From',
      accessorFn: (d) => `${d.amateurClubName || ''} [${d.amateurLeague || ''}]`,
      cell: ({ getValue }) => getValue(),
      size: 180,
      meta: {
        truncate: true,
        expandOnDoubleClick: true,
        expandedSize: 270,
      },
    },
    {
      header: 'Player',
      accessorFn: (d) => d.playerName,
      cell: (props) =>
        props.row.original?.playerId ? (
          <Link
            className="whitespace-nowrap"
            href={playerUrl(props.row.original.playerName, props.row.original.playerId)}
          >
            {props.row.original.playerName}
          </Link>
        ) : (
          props.row.original.playerName
        ),
      size: 210,
    },
    {
      header: 'Pos',
      accessorFn: (d) => d.positionCode,
      size: 56,
    },
    {
      header: 'GP',
      accessorFn: (d) => d.games,
      size: 56,
    },
    {
      header: 'G',
      accessorFn: (d) => d.goals,
      size: 48,
    },
    {
      header: 'A',
      accessorFn: (d) => d.assists,
      size: 48,
    },
    {
      header: 'P',
      accessorFn: (d) => d.points,
      size: 48,
    },
    {
      header: 'PIM',
      accessorFn: (d) => d.pim,
      size: 56,
    },
    {
      header: 'Last Season',
      accessorFn: (d) => d.last_season,
      size: 96,
    },
  ]

  return (
    <div className="mx-auto w-full max-w-7xl px-2 py-2 sm:px-4 lg:px-5">
      <SEO
        title={`${teamName} Draft History`}
        description={`Complete NHL draft history for the ${teamName}. View every pick by year with career statistics including games, goals, assists, and points.`}
        path={draftTeamUrl(teamName, team.id)}
      />

      <div className="grid gap-3 lg:grid-cols-[11.5rem_minmax(0,1fr)] lg:items-start">
        <aside className="hidden lg:sticky lg:top-2 lg:block">
          <DraftTeamList teams={draftTeams} currentTeamId={team.id} compact />
        </aside>

        <section className="min-w-0 rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="border-b border-slate-200 p-3 dark:border-slate-700">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <Link
                  href="/drafts?view=teams"
                  className="text-sm font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Draft archive
                </Link>
                <div className="mt-0.5 flex items-center gap-3">
                  {logoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={logoUrl}
                      alt=""
                      className="h-10 w-10 object-contain"
                      onError={(event) => {
                        event.currentTarget.style.display = 'none'
                      }}
                    />
                  )}
                  <div>
                    <h1 className="text-2xl font-bold text-slate-950 dark:text-white">
                      {teamName} Drafts
                    </h1>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {allPlayers.length} picks across {years.length} drafts
                      {' · '}
                      <Link
                        href={teamUrl(teamName, team.id)}
                        className="font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400"
                      >
                        Team page
                      </Link>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="sr-only" htmlFor="draft-team">
                  Draft team
                </label>
                <select
                  id="draft-team"
                  value={team.id}
                  onChange={(event) => {
                    const selected = draftTeams.find(
                      (entry) => String(entry.id) === String(event.target.value)
                    )
                    if (selected) {
                      router.push(
                        draftTeamUrl(
                          selected.name || selected.abbreviation,
                          selected.id
                        )
                      )
                    }
                  }}
                  className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm font-semibold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white lg:hidden"
                >
                  {draftTeams.map((entry) => (
                    <option value={entry.id} key={entry.id}>
                      {entry.abbreviation || entry.name}
                    </option>
                  ))}
                </select>
                <div className="hidden rounded-md bg-slate-100 px-2.5 py-1.5 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200 sm:block">
                  <span className="font-semibold">
                    {year === 'all' ? 'All years' : year}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <div className="min-w-0 flex-1 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="inline-flex gap-2 sm:flex-wrap">
                  <button
                    type="button"
                    aria-pressed={year === 'all'}
                    className={[
                      'min-h-9 min-w-24 rounded-md px-3 py-1.5 text-sm font-semibold transition',
                      'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900',
                      year === 'all'
                        ? 'bg-blue-600 text-white shadow-sm dark:bg-blue-500'
                        : 'border border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-blue-500 dark:hover:bg-slate-700',
                    ].join(' ')}
                    onClick={() => setYear('all')}
                  >
                    All years
                  </button>
                  {years.map((draftYear) => (
                    <button
                      type="button"
                      aria-pressed={year === draftYear}
                      className={[
                        'min-h-9 min-w-14 rounded-md px-3 py-1.5 text-sm font-semibold transition',
                        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900',
                        year === draftYear
                          ? 'bg-blue-600 text-white shadow-sm dark:bg-blue-500'
                          : 'border border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-blue-500 dark:hover:bg-slate-700',
                      ].join(' ')}
                      key={draftYear}
                      onClick={() => setYear(draftYear)}
                    >
                      {draftYear}
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
            {selectedPlayers.length > 0 && (
              <ReactTable
                columns={columns}
                data={selectedPlayers}
                pageSize={50}
                rowClassName={getRowClassName}
                sortKey={year === 'all' ? 'draftYear' : 'overallPick'}
                sortDesc={year === 'all'}
                modern
              />
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export async function getServerSideProps({ params, res }) {
  const id = extractEntityId(params.id)
  const { loadDraftByTeam, loadDraftTeams } = await import('../../../lib/draft-data')

  const [draftResult, teamsResult] = await Promise.allSettled([
    loadDraftByTeam(id),
    loadDraftTeams(),
  ])

  if (draftResult.status !== 'fulfilled') {
    throw draftResult.reason
  }

  if (draftResult.value?.notFound) {
    return { notFound: true }
  }

  let picks = draftResult.value?.draft || []
  if (!picks.length) {
    return { notFound: true }
  }

  let draftTeams = []
  if (teamsResult.status === 'fulfilled') {
    draftTeams = teamsResult.value?.teams || []
    setPageCache(res, PAGE_CACHE.stable)
  } else {
    console.log(teamsResult.reason)
    setPageCache(res, PAGE_CACHE.error)
  }

  const team =
    draftResult.value?.team ||
    draftTeams.find((entry) => String(entry.id) === String(id)) || {
      id,
      abbreviation: picks[0]?.teamAbbrev || '',
      name: picks[0]?.teamAbbrev || 'Team',
    }

  const slimPicks = picks.map((player) => ({
    draftYear: player.draftYear,
    playerId: player.playerId,
    overallPick: player.overallPick,
    round: player.round,
    playerName: player.playerName,
    positionCode: player.positionCode,
    amateurLeague: player.amateurLeague,
    amateurClubName: player.amateurClubName,
    games: player.games,
    goals: player.goals,
    assists: player.assists,
    points: player.points,
    pim: player.pim,
    last_season: player.last_season,
  }))

  const draft = slimPicks.reduce((acc, player) => {
    const draftYear = String(player.draftYear)
    if (!acc[draftYear]) acc[draftYear] = []
    acc[draftYear].push(player)
    return acc
  }, {})

  return {
    props: {
      team: {
        id: team.id,
        name: team.name || team.abbreviation || 'Team',
        abbreviation: team.abbreviation || '',
      },
      draft,
      draftTeams: draftTeams.map((entry) => ({
        id: entry.id,
        name: entry.name,
        abbreviation: entry.abbreviation,
      })),
    },
  }
}
