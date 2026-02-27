import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ReactTable from '../../components/PaginatedTable';
import SEO from '../../components/SEO';

export default function PlayersIndex({ players, searchTerm }) {
    const router = useRouter();
    const [search, setSearch] = useState(searchTerm || '');

    const handleSearch = (e) => {
        e.preventDefault();
        if (search.trim()) {
            router.push({
                pathname: '/players',
                query: { q: search.trim() }
            });
        } else {
            router.push('/players');
        }
    };

    const columns = useMemo(() => [
        {
            header: 'Name',
            accessorKey: 'player_name',
            cell: ({ row }) => (
                <Link
                    href={`/players/${row.original.playerId}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                    {row.original.player_name}
                </Link>
            )
        },
        {
            header: 'Pos',
            accessorKey: 'position',
        },
        {
            header: 'Team',
            accessorKey: 'team_name',
            cell: ({ row }) => {
                if (row.original.team_id) {
                    return (
                        <Link
                            href={`/teams/${row.original.team_id}`}
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            {row.original.team_name}
                        </Link>
                    );
                }
                const season = row.original.last_season;
                if (season) {
                    const formatted = `${String(season).slice(0, 4)}-${String(season).slice(6, 8)}`;
                    return <span className="text-gray-500 dark:text-gray-400 italic">{formatted}</span>;
                }
                return <span className="text-gray-500 dark:text-gray-400 italic">-</span>;
            }
        },
        {
            header: 'GP',
            accessorKey: 'games',
            cell: props => <p className="text-right">{props.getValue() || '-'}</p>,
        },
        {
            header: 'G',
            accessorKey: 'goals',
            cell: ({ row }) => (
                <p className="text-right">
                    {row.original.position === 'G' ? '-' : (row.original.goals || 0)}
                </p>
            ),
        },
        {
            header: 'A',
            accessorKey: 'assists',
            cell: ({ row }) => (
                <p className="text-right">
                    {row.original.position === 'G' ? '-' : (row.original.assists || 0)}
                </p>
            ),
        },
        {
            header: 'P',
            accessorKey: 'points',
            cell: ({ row }) => (
                <p className="text-right font-semibold">
                    {row.original.position === 'G' ? '-' : (row.original.points || 0)}
                </p>
            ),
        },
        {
            header: 'W',
            accessorKey: 'wins',
            cell: ({ row }) => (
                <p className="text-right">
                    {row.original.position === 'G' ? (row.original.wins || 0) : '-'}
                </p>
            ),
        },
        {
            header: 'L',
            accessorKey: 'losses',
            cell: ({ row }) => (
                <p className="text-right">
                    {row.original.position === 'G' ? (row.original.losses || 0) : '-'}
                </p>
            ),
        },
        {
            header: 'Country',
            accessorKey: 'birthCountry',
        },
    ], []);

    return (
        <div>
            <SEO
                title="NHL Players"
                description="Search and browse NHL player statistics, career stats, and profiles. Find any current or former NHL player."
                path="/players"
            />

            <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 py-2 border-b border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="max-w-6xl mx-auto px-2">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        NHL Players
                    </h1>
                    <form onSubmit={handleSearch} className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search players by name..."
                            className="flex-1 max-w-md px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                        >
                            Search
                        </button>
                    </form>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        <Link href="/seasons" className="text-blue-600 dark:text-blue-400 hover:underline">
                            View Seasonal Stat Leaders
                        </Link>
                    </p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-2 py-4">
                {searchTerm && (
                    <p className="mb-4 text-gray-600 dark:text-gray-400">
                        {players.length} result{players.length !== 1 ? 's' : ''} for &ldquo;{searchTerm}&rdquo;
                    </p>
                )}
                {players && players.length > 0 ? (
                    <ReactTable
                        columns={columns}
                        data={players}
                        pageSize={25}
                    />
                ) : searchTerm ? (
                    <p className="text-gray-500 dark:text-gray-400">
                        No players found matching &ldquo;{searchTerm}&rdquo;
                    </p>
                ) : (
                    <p className="text-gray-500 dark:text-gray-400">
                        Enter a player name to search
                    </p>
                )}
            </div>
        </div>
    );
}

export async function getServerSideProps(context) {
    const { q } = context.query;
    const protocol = context.req.headers['x-forwarded-proto'] || 'http';
    const host = context.req.headers.host;
    const searchTerm = q || '';

    let players = [];
    if (searchTerm) {
        const response = await fetch(`${protocol}://${host}/api/players?q=${encodeURIComponent(searchTerm)}&limit=100`);
        if (response.ok) {
            const payload = await response.json();
            players = payload?.players || [];
        }
    }

    return {
        props: {
            players,
            searchTerm
        }
    };
}
