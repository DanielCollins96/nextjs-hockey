import { useState, useMemo } from 'react'
import Link from 'next/link';
import { useRouter } from 'next/router';
import { MdOutlineChevronLeft, MdOutlineChevronRight } from 'react-icons/md';
import { getPointLeadersBySeason, getGoalieLeadersBySeason, getAvailableSeasons } from '../../lib/queries';
import ReactTable from '../../components/PaginatedTable';

export default function Seasons({players, goalies, season, availableSeasons}) {
    const router = useRouter();
    const [selectedSeason, setSelectedSeason] = useState(season);
    const [currentIndex, setCurrentIndex] = useState(availableSeasons.indexOf(season));

    const formatSeasonDisplay = (szn) => {
        return `${String(szn).slice(0, 4)}-${String(szn).slice(6, 8)}`;
    };

    const skaterColumns = useMemo(() => [
        {
            header: 'Rk',
            accessorKey: 'row_number',
            cell: ({row}) => <div>{row.original.row_number}</div>
        },
        {
            header: 'Name',
            accessorKey: 'player_name',
            cell: ({row}) => (
                <Link
                    href={`/players/${row.original["playerId"]}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                    {row.original.player_name}
                </Link>
            )
        },
        {
            header: 'Team',
            accessorFn: (d) => d['team.name'],
            cell: ({row}) => (
                <Link
                    href={`/teams/${row.original['team.id']}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                    {row.original['team.name']}
                </Link>
            )
        },
        {
            header: "Pos",
            accessorFn: (d) => d["position"],
        },
        {
            header: 'GP',
            accessorFn: (d) => d["stat.games"],
            cell: props => <p className="text-right">{props.getValue()}</p>,
        },
        {
            header: 'G',
            accessorFn: (d) => d["stat.goals"],
            cell: props => <p className="text-right">{props.getValue()}</p>
        },
        {
            header: 'A',
            accessorFn: (d) => d["stat.assists"],
            cell: props => <p className="text-right">{props.getValue()}</p>
        },
        {
            header: 'P',
            accessorFn: (d) => d["stat.points"],
            cell: props => <p className="text-right font-semibold">{props.getValue()}</p>
        },
        {
            header: 'P/GP',
            accessorFn: (d) => d["stat.games"] > 0 ? d["stat.points"] / d["stat.games"] : 0,
            cell: props => <p className="text-right">{props.getValue().toFixed(2)}</p>,
            sortingFn: 'basic',
        },
    ], [])

    const goalieColumns = useMemo(() => [
        {
            header: 'Rk',
            accessorKey: 'row_number',
            cell: ({row}) => <div>{row.original.row_number}</div>
        },
        {
            header: 'Name',
            accessorKey: 'player_name',
            cell: ({row}) => (
                <Link
                    href={`/players/${row.original["playerId"]}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                    {row.original.player_name}
                </Link>
            )
        },
        {
            id: 'Team',
            header: 'Team',
            accessorFn: (d) => d['team.name'],
            cell: ({row}) => (
                <Link
                    href={`/teams/${row.original['team.id']}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                    {row.original['team.name']}
                </Link>
            )
        },
        {
            id: 'GP',
            header: 'GP',
            accessorFn: (d) => d["stat.games"],
            cell: props => <p className="text-right">{props.getValue()}</p>,
        },
        {
            id: 'W',
            header: 'W',
            accessorFn: (d) => d["stat.wins"],
            cell: props => <p className="text-right font-semibold">{props.getValue()}</p>
        },
        {
            id: 'L',
            header: 'L',
            accessorFn: (d) => d["stat.losses"],
            cell: props => <p className="text-right">{props.getValue()}</p>
        },
        {
            id: 'OTL',
            header: 'OTL',
            accessorFn: (d) => d["stat.otl"],
            cell: props => <p className="text-right">{props.getValue()}</p>
        },
        {
            id: 'GAA',
            header: 'GAA',
            accessorFn: (d) => d["stat.gaa"],
            cell: props => <p className="text-right">{props.getValue()?.toFixed(2)}</p>
        },
        {
            id: 'SV%',
            header: 'SV%',
            accessorFn: (d) => d["stat.savePct"],
            cell: props => <p className="text-right">{props.getValue()?.toFixed(3)}</p>
        },
        {
            id: 'SO',
            header: 'SO',
            accessorFn: (d) => d["stat.shutouts"],
            cell: props => <p className="text-right">{props.getValue()}</p>
        },
    ], [])

    const handleSeasonChange = (event) => {
        const newSeason = event.target.value;
        setSelectedSeason(newSeason);
        const newIndex = availableSeasons.indexOf(parseInt(newSeason));
        setCurrentIndex(newIndex);
        router.push(
            {
                pathname: router.pathname,
                query: { year: newSeason }
            },
            undefined,
            { scroll: false }
        );
    };

    const handlePreviousSeason = () => {
        if (currentIndex > 0) {
            const newIndex = currentIndex - 1;
            const newSeason = availableSeasons[newIndex];
            setCurrentIndex(newIndex);
            setSelectedSeason(newSeason);
            router.push(
                {
                    pathname: router.pathname,
                    query: { year: newSeason }
                },
                undefined,
                { scroll: false }
            );
        }
    };

    const handleNextSeason = () => {
        if (currentIndex < availableSeasons.length - 1) {
            const newIndex = currentIndex + 1;
            const newSeason = availableSeasons[newIndex];
            setCurrentIndex(newIndex);
            setSelectedSeason(newSeason);
            router.push(
                {
                    pathname: router.pathname,
                    query: { year: newSeason }
                },
                undefined,
                { scroll: false }
            );
        }
    };

    return (
        <div>
            {/* Sticky Season Selector */}
            <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 py-2 border-b border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="max-w-6xl mx-auto px-2">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        NHL Stat Leaders {formatSeasonDisplay(selectedSeason)}
                    </h1>
                    <div className="flex items-center space-x-2">
                        <select
                            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={selectedSeason}
                            onChange={handleSeasonChange}
                        >
                            {availableSeasons &&
                                availableSeasons.map((szn) => (
                                    <option key={szn} value={szn}>
                                        {formatSeasonDisplay(szn)} Regular Season
                                    </option>
                                ))}
                        </select>
                        <button
                            className="p-2 rounded-lg bg-red-400 dark:bg-red-600 hover:bg-red-200 dark:hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            onClick={handleNextSeason}
                            disabled={currentIndex >= availableSeasons.length - 1}
                        >
                            <MdOutlineChevronLeft size={24} className="text-blue-700 dark:text-blue-300" />
                        </button>
                        <button
                            className="p-2 rounded-lg bg-red-400 dark:bg-red-600 hover:bg-red-200 dark:hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            onClick={handlePreviousSeason}
                            disabled={currentIndex <= 0}
                        >
                            <MdOutlineChevronRight size={24} className="text-blue-700 dark:text-blue-300" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Tables Grid */}
            <div className="max-w-6xl mx-auto px-2 grid grid-cols-1 xl:grid-cols-2 p-1 gap-2">
                {/* Skating Leaders */}
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b-2 border-red-600 pb-2 mb-2">
                        Skating Leaders
                    </h2>
                    {players ? (
                        <ReactTable
                            columns={skaterColumns}
                            data={players}
                            sortKey='P'
                            filterCol={['player_name']}
                            pageSize={25}
                        />
                    ) : (
                        <p className="text-gray-500">Error loading skater stats...</p>
                    )}
                </div>

                {/* Goaltending Leaders */}
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b-2 border-blue-600 pb-2 mb-2">
                        Goaltending Leaders
                    </h2>
                    {goalies ? (
                        <ReactTable
                            columns={goalieColumns}
                            data={goalies}
                            sortKey='W'
                            filterCol={['player_name']}
                            pageSize={25}
                        />
                    ) : (
                        <p className="text-gray-500">Error loading goalie stats...</p>
                    )}
                </div>
            </div>
        </div>
    )
}

export async function getServerSideProps(context) {
    const { year } = context.query;
    const season = year ? parseInt(year) : 20252026;

    const [result, goalieResult, availableSeasons] = await Promise.all([
        getPointLeadersBySeason(season),
        getGoalieLeadersBySeason(season),
        getAvailableSeasons()
    ]);

    return {
        props: {
            players: result,
            goalies: goalieResult,
            season: season,
            availableSeasons: availableSeasons
        }
    }
}
