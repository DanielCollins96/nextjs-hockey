import React from 'react'
import Link from 'next/link'
import { draftTeamUrl } from '../lib/routes'

export default function DraftTeamList({ teams, currentTeamId, compact = false }) {
  const teamList = teams || []

  if (compact) {
    return (
      <nav className="rounded-lg border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-2 px-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Drafts
          </p>
          <h2 className="text-sm font-bold text-slate-950 dark:text-white">
            Teams
          </h2>
        </div>

        <div className="grid max-h-[calc(100vh-11rem)] grid-cols-1 gap-1 overflow-y-auto pr-1">
          {teamList.map((team) => {
            const isCurrent = String(team.id) === String(currentTeamId)

            return (
              <Link
                href={draftTeamUrl(team.name || team.abbreviation, team.id)}
                key={team.id}
                aria-current={isCurrent ? 'page' : undefined}
                className={[
                  'flex items-center gap-2 rounded-md border px-2 py-1.5 text-sm font-semibold transition',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900',
                  isCurrent
                    ? 'border-blue-600 bg-blue-600 text-white shadow-sm dark:border-blue-500 dark:bg-blue-500'
                    : 'border-slate-200 bg-slate-50 text-slate-800 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-blue-500 dark:hover:bg-slate-700 dark:hover:text-white',
                ].join(' ')}
              >
                {team.abbreviation && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`https://assets.nhle.com/logos/nhl/svg/${team.abbreviation}_dark.svg`}
                    alt=""
                    className="h-5 w-5 shrink-0 object-contain"
                    onError={(event) => {
                      event.currentTarget.style.visibility = 'hidden'
                    }}
                  />
                )}
                <span className="truncate">{team.abbreviation || team.name}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    )
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-6">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          NHL Draft Archive
        </p>
        <h1 className="text-2xl font-bold text-slate-950 dark:text-white sm:text-3xl">
          Drafts by Team
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
          Browse every franchise&apos;s draft history, with picks listed by year and career totals for each player.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {teamList.map((team) => {
          const isCurrent = String(team.id) === String(currentTeamId)

          return (
            <Link
              href={draftTeamUrl(team.name || team.abbreviation, team.id)}
              key={team.id}
              aria-current={isCurrent ? 'page' : undefined}
              className={[
                'flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-semibold transition',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900',
                isCurrent
                  ? 'border-blue-600 bg-blue-600 text-white shadow-sm dark:border-blue-500 dark:bg-blue-500'
                  : 'border-slate-200 bg-slate-50 text-slate-800 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-blue-500 dark:hover:bg-slate-700 dark:hover:text-white',
              ].join(' ')}
            >
              {team.abbreviation && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`https://assets.nhle.com/logos/nhl/svg/${team.abbreviation}_dark.svg`}
                  alt=""
                  className="h-6 w-6 shrink-0 object-contain"
                  onError={(event) => {
                    event.currentTarget.style.visibility = 'hidden'
                  }}
                />
              )}
              <span className="min-w-0">
                <span className="block truncate">{team.abbreviation}</span>
                <span className={`block truncate text-xs font-medium ${isCurrent ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                  {team.pickCount} picks
                </span>
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
