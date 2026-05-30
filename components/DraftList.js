import React from 'react'
import Link from 'next/link'

export default function DraftList({drafts, currentYear, compact = false}) {
  const years = drafts || []

  if (compact) {
    return (
      <nav className="rounded-lg border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-2 px-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Drafts
          </p>
          <h2 className="text-sm font-bold text-slate-950 dark:text-white">
            Years
          </h2>
        </div>

        <div className="grid max-h-[calc(100vh-11rem)] grid-cols-2 gap-1 overflow-y-auto pr-1">
          {years.map((draft) => {
            const isCurrent = String(draft.draftYear) === String(currentYear)

            return (
              <Link
                href={`/drafts/${draft.draftYear}`}
                key={draft.draftYear}
                aria-current={isCurrent ? 'page' : undefined}
                className={[
                  'rounded-md border px-2 py-1.5 text-center text-sm font-semibold transition',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900',
                  isCurrent
                    ? 'border-blue-600 bg-blue-600 text-white shadow-sm dark:border-blue-500 dark:bg-blue-500'
                    : 'border-slate-200 bg-slate-50 text-slate-800 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-blue-500 dark:hover:bg-slate-700 dark:hover:text-white',
                ].join(' ')}
              >
                {draft.draftYear}
              </Link>
            )
          })}
        </div>
      </nav>
    )
  }

  return (
    <section className={`rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 ${compact ? 'p-3' : 'p-5 sm:p-6'}`}>
      <div className={compact ? 'mb-3' : 'mb-5'}>
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          NHL Draft Archive
        </p>
        <h1 className={`${compact ? 'text-lg' : 'text-2xl sm:text-3xl'} font-bold text-slate-950 dark:text-white`}>
          Amateur Drafts
        </h1>
        {!compact && (
          <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
            Browse every NHL draft class by year, then drill into rounds, picks, teams, and player career totals.
          </p>
        )}
      </div>

      <div className={compact ? 'flex gap-2 overflow-x-auto pb-1 sm:grid sm:grid-cols-4 sm:overflow-visible lg:grid-cols-5' : 'grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-8'}>
        {years.map((draft) => {
          const isCurrent = String(draft.draftYear) === String(currentYear)

          return (
            <Link
              href={`/drafts/${draft.draftYear}`}
              key={draft.draftYear}
              aria-current={isCurrent ? 'page' : undefined}
              className={[
                'rounded-lg border px-3 py-2 text-center text-sm font-semibold transition',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900',
                compact ? 'min-w-20 sm:min-w-0' : '',
                isCurrent
                  ? 'border-blue-600 bg-blue-600 text-white shadow-sm dark:border-blue-500 dark:bg-blue-500'
                  : 'border-slate-200 bg-slate-50 text-slate-800 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-blue-500 dark:hover:bg-slate-700 dark:hover:text-white',
              ].join(' ')}
            >
              {draft.draftYear}
            </Link>
          )
        })}
      </div>
    </section>
  );
}
