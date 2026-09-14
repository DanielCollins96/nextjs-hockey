import React from 'react'
import DraftList from '../../components/DraftList'
import DraftTeamList from '../../components/DraftTeamList'
import SEO from '../../components/SEO'
import { PAGE_CACHE, setPageCache } from '../../lib/http-cache'
import Link from 'next/link'

export default function Drafts({ draftYears, draftTeams, view }) {
  const isTeamsView = view === 'teams'

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <SEO
        title={isTeamsView ? 'NHL Draft History by Team' : 'NHL Draft History'}
        description={
          isTeamsView
            ? 'Browse NHL draft history by team. See every franchise pick listed by year with career stats.'
            : 'Browse historical NHL draft results by year. View draft picks, player career stats, and draft class analysis.'
        }
        path={isTeamsView ? '/drafts?view=teams' : '/drafts'}
      />

      <div className="mb-4 inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <Link
          href="/drafts"
          aria-current={!isTeamsView ? 'page' : undefined}
          className={[
            'rounded-md px-3 py-1.5 text-sm font-semibold transition',
            !isTeamsView
              ? 'bg-blue-600 text-white shadow-sm dark:bg-blue-500'
              : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800',
          ].join(' ')}
        >
          By year
        </Link>
        <Link
          href="/drafts?view=teams"
          aria-current={isTeamsView ? 'page' : undefined}
          className={[
            'rounded-md px-3 py-1.5 text-sm font-semibold transition',
            isTeamsView
              ? 'bg-blue-600 text-white shadow-sm dark:bg-blue-500'
              : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800',
          ].join(' ')}
        >
          By team
        </Link>
      </div>

      {isTeamsView ? (
        <DraftTeamList teams={draftTeams} />
      ) : (
        <DraftList drafts={draftYears} />
      )}
    </div>
  )
}

export async function getServerSideProps({ res, query }) {
  const view = query?.view === 'teams' ? 'teams' : 'years'

  try {
    const { loadDraftYears, loadDraftTeams } = await import('../../lib/draft-data')

    if (view === 'teams') {
      const payload = await loadDraftTeams()
      setPageCache(res, PAGE_CACHE.stable)
      return {
        props: {
          view,
          draftYears: [],
          draftTeams: payload?.teams || [],
        },
      }
    }

    const payload = await loadDraftYears()
    setPageCache(res, PAGE_CACHE.stable)
    return {
      props: {
        view,
        draftYears: payload?.years || [],
        draftTeams: [],
      },
    }
  } catch (error) {
    console.log(error)
    setPageCache(res, PAGE_CACHE.error)
    return {
      props: {
        view,
        draftYears: [],
        draftTeams: [],
      },
    }
  }
}
