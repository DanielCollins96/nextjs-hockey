import Image from 'next/image'
import Link from 'next/link'
import SEO from '../components/SEO'

export default function SearchPage({ query, players, teams }) {
  const hasQuery = query.trim().length > 0
  const hasResults = players.length > 0 || teams.length > 0

  return (
    <div className="mx-auto max-w-6xl px-3 py-6">
      <SEO
        title={hasQuery ? `Search results for ${query}` : 'Search NHL Stats'}
        description="Search NHL players and teams."
        path="/search"
      />

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Search
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {hasQuery
            ? `${players.length + teams.length} result${players.length + teams.length === 1 ? '' : 's'} for "${query}"`
            : 'Use the search bar in the navigation to find players and teams.'}
        </p>
      </div>

      {!hasQuery ? null : hasResults ? (
        <div className="space-y-8">
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Teams
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {teams.length}
              </span>
            </div>
            {teams.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {teams.map((team) => (
                  <Link
                    key={team.id}
                    href={team.href}
                    className="flex items-center gap-3 rounded-md border border-gray-200 bg-white p-3 shadow-sm transition hover:border-blue-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-500"
                  >
                    <span className="relative h-10 w-10 flex-shrink-0">
                      {team.logo ? (
                        <Image
                          src={team.logo}
                          alt={team.abbreviation || team.name}
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      ) : null}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-gray-900 dark:text-white">
                        {team.name}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {team.abbreviation}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No team matches.</p>
            )}
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Players
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {players.length}
              </span>
            </div>
            {players.length > 0 ? (
              <div className="overflow-hidden rounded-md border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Name</th>
                      <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Pos</th>
                      <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Team</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {players.map((player) => (
                      <tr key={player.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-3 py-2">
                          <Link href={player.href} className="font-medium text-blue-600 hover:underline dark:text-blue-400">
                            {player.name}
                          </Link>
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">{player.position || '-'}</td>
                        <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">{player.teamName || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No player matches.</p>
            )}
          </section>
        </div>
      ) : (
        <p className="rounded-md border border-gray-200 bg-white p-4 text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
          No results found for &ldquo;{query}&rdquo;.
        </p>
      )}
    </div>
  )
}

export async function getServerSideProps(context) {
  const { q = '' } = context.query
  const query = String(q || '').trim()
  const protocol = context.req.headers['x-forwarded-proto'] || 'http'
  const host = context.req.headers.host

  let players = []
  let teams = []

  if (query) {
    const response = await fetch(
      `${protocol}://${host}/api/search?q=${encodeURIComponent(query)}&limit=25`
    )
    if (response.ok) {
      const payload = await response.json()
      players = payload?.players || []
      teams = payload?.teams || []
    }
  }

  return {
    props: {
      query,
      players,
      teams,
    },
  }
}
