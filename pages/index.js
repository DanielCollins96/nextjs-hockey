import Head from "next/head";
import Link from "next/link";
import HockeyShootout from "../components/HockeyShootout";
import SEO from "../components/SEO";

export default function Home() {
  return (
    <div>
      <Head>
        <link
          rel="preload"
          as="image"
          href="/Hockey-Net.svg"
          type="image/svg+xml"
        />
      </Head>
      <SEO
        title="NHL Scores and Stats"
        description="Browse NHL team rosters, game data, player statistics, standings, and player contract data. Search by team or player name to find stats and profiles."
        path="/"
      />

      <section className="border-b border-gray-200 bg-slate-50 dark:border-gray-700 dark:bg-gray-950">
        <div className="mx-auto max-w-6xl px-3 py-5">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-blue-700 dark:text-blue-300">
              NHL scores and stats
            </p>
            <h1 className="mt-2 text-3xl font-bold text-gray-950 dark:text-white sm:text-4xl">
              Find teams, players, games, and season stats quickly.
            </h1>
            <p className="mt-3 max-w-2xl text-gray-600 dark:text-gray-300">
              Use the nav search for quick player and team lookups, or jump into the core stat sections below.
            </p>
            <div className="mt-5 grid gap-2 sm:grid-cols-5">
              <DashboardLink href="/teams" label="Teams" />
              <DashboardLink href="/players" label="Players" />
              <DashboardLink href="/games" label="Games" />
              <DashboardLink href="/seasons" label="Seasons" />
              <DashboardLink href="/drafts" label="Drafts" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-3 pb-16 pt-6">
        <div className="min-h-[520px] overflow-visible bg-slate-50 py-6 dark:bg-gray-950">
          <HockeyShootout />
        </div>
      </section>
    </div>
  );
}

function DashboardLink({href, label}) {
  return (
    <Link
      href={href}
      className="rounded-md border border-gray-200 bg-white px-3 py-3 text-center text-sm font-semibold text-gray-900 shadow-sm transition hover:border-blue-300 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:border-blue-500 dark:hover:text-blue-300"
    >
      {label}
    </Link>
  );
}
