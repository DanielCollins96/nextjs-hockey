import { useMemo } from 'react';
import Head from 'next/head'
import Link from 'next/link';
import Image from 'next/image'
import { useRouter } from 'next/router';
import {getPlayer, getPlayerStats, getPlayerAwards} from '../../lib/queries'
import ReactTable from '../../components/Table';

const Players = ({playerId, stats, person, awards}) => {
    const router = useRouter()
    const { id } = router.query

    const position = person && person['position'] ? person['position'] : 'Center';

    const hasDraftData = (data) => {
        if (!data) return false;
        const s = String(data).trim();
        if (s === '[null]' || s === 'null' || s === '') return false;
        if (Array.isArray(data) && data.filter(Boolean).length === 0) return false;
        return true;
    };

    // Helper to check NHL league as returned by SQL (leagueAbbrev)
    const isNHLRow = (row) => row?.original && row.original['league.name'] === 'NHL';

        const positionalColumns = useMemo(() => position !== 'G' ? [
            {
                header: 'G',
                accessorFn: (d) => d["stat.goals"],
                footer: ({ table }) => {
                                const sum = table.getFilteredRowModel().rows?.filter((row) => 
                                    row.original['stat.games'] != null && isNHLRow(row)
                                ).reduce((total, row) => total + (Number(row.original['stat.goals']) || 0), 0) || 0;
                                return <div className="text-right pr-1">{sum}</div>
                            },
                cell: props => <p className="text-right">{props.getValue()}</p>
        },
     {
                header: 'A',
                accessorFn: (d) => d["stat.assists"],
                footer: ({ table }) => {
                                const sum = table.getFilteredRowModel().rows?.filter((row) => 
                                    row.original['stat.games'] != null && isNHLRow(row)
                                ).reduce((total, row) => total + (Number(row.original['stat.assists']) || 0), 0) || 0;
                                return <div className="text-right pr-1">{sum}</div>
                            },
                cell: props => <p className="text-right">{props.getValue()}</p>
        },
            {
                header: 'P',
                accessorFn: (d) => d["stat.points"],
                footer: ({ table }) => {
                                const sum = table.getFilteredRowModel().rows?.filter((row) => 
                                    row.original['stat.games'] != null && isNHLRow(row)
                                ).reduce((total, row) => total + (Number(row.original['stat.points']) || 0), 0) || 0;
                                return <div className="text-right pr-1">{sum}</div>
                            },
                cell: props => <p className="text-right">{props.getValue()}</p>
        },
        {
                header: 'PIM',
                accessorFn: (d) => d["stat.pim"],
                footer: ({ table }) => {
                                const sum = table.getFilteredRowModel().rows?.filter((row) => 
                                    row.original['stat.games'] != null && isNHLRow(row)
                                ).reduce((total, row) => total + (Number(row.original['stat.pim']) || 0), 0) || 0;
                                return <div className="text-right pr-1">{sum}</div>
                            },
                cell: props => <p className="text-right">{props.getValue()}</p>
        },
        {
                header: '+/-',
                accessorFn: (d) => d["stat.plusMinus"],
                footer: ({ table }) => {
                                const sum = table.getFilteredRowModel().rows?.filter((row) => 
                                    row.original['stat.games'] != null && isNHLRow(row)
                                ).reduce((total, row) => total + (Number(row.original['stat.plusMinus']) || 0), 0) || 0;
                                return <div className="text-right pr-1">{sum}</div>
                            },
                cell: props => <p className="text-right">{props.getValue()}</p>    },
        ] : [
            {
                header: 'W',
                accessorFn: (d) => d['stat.wins'],
                footer: ({ table }) => {
                                                const sum = table.getFilteredRowModel().rows?.filter((row) => 
                                                        row.original['stat.games'] != null && isNHLRow(row)
                                                ).reduce((total, row) => total + (Number(row.original['stat.wins']) || 0), 0) || 0;
                                                return <div className="text-right pr-1">{sum}</div>
                                        },
                cell: props => <p className="text-right">{props.getValue()}</p>,
            },
            {
                header: 'L',
                accessorFn: (d) => d['stat.losses'],
                footer: ({ table }) => {
                        const sum = table.getFilteredRowModel().rows?.filter((row) => 
                            row.original['stat.games'] != null && isNHLRow(row)
                        ).reduce((total, row) => total + (Number(row.original['stat.losses']) || 0), 0) || 0;
                        return <div className="text-right pr-1">{sum}</div>
                    },
                cell: props => <p className="text-right">{props.getValue()}</p>,
        },
            {
                header: 'GAA',
                accessorFn: (d) => d['stat.goalAgainstAverage'],
                cell: props => <p className="text-right">{props.getValue() != null ? Number(props.getValue()).toFixed(2) : null}</p>,
                footer: ({ table }) => { 
                    const nhlGames = table.getFilteredRowModel().rows?.filter((row) => 
                                                row.original['stat.games'] != null && isNHLRow(row)
                                        ) || [];
                    const gp = nhlGames.reduce((total, row) => total + (Number(row.original['stat.games']) || 0), 0);
                    const totalGaa = nhlGames.reduce((total, row) => total + ((Number(row.original['stat.games']) || 0) * (Number(row.original['stat.goalAgainstAverage']) || 0)), 0);
                    const avg = gp ? totalGaa / gp : null;
                    return avg != null ? <div className="text-right pr-1">{avg.toFixed(2)}</div> : <div className="text-right pr-1">-</div>;
                }
            },
            {
                header: 'SV%',
                accessorFn: (d) => d['stat.savePercentage'],
                cell: props => <p className="text-right">{props.getValue() != null ? Number(props.getValue()).toFixed(3) : null}</p>,
                footer: ({ table }) => { 
                    const nhlGames = table.getFilteredRowModel().rows?.filter((row) => 
                                                row.original['stat.games'] != null && isNHLRow(row)
                                        ) || [];
                    const gp = nhlGames.reduce((total, row) => total + (Number(row.original['stat.games']) || 0), 0);
                    const totalSvPct = nhlGames.reduce((total, row) => total + ((Number(row.original['stat.games']) || 0) * (Number(row.original['stat.savePercentage']) || 0)), 0);
                    const avg = gp ? totalSvPct / gp : null;
                    return avg != null ? <div className="text-right 1">{avg.toFixed(3)}</div> : <div className="text-right pr-1">-</div>;
                }
        },
        ], [position]);

    const columns = useMemo(
        () => [
             {
                 header: 'Season',
                 accessorKey: 'season',
             },
             {
                 header: 'Team',
                 accessorFn: (d) => d['team.name'],
                 cell: ({row}) => row.original['league.name'] === 'NHL' ? (<Link
                     href={`/teams/${row.original['team.id']}?season=${row.original.season}`}
                     passHref
                     className="hover:text-blue-700 visited:text-purple-700 dark:visited:text-purple-300">{row.original['team.name']}</Link>) : (row.original['team.name'])
             },
            {
                 header: 'Lge',
                 accessorFn: (d) => d['league.name'],
                 footer: 'NHL',
             },
            {
                 header: 'GP',
                 accessorFn: (d) => d["stat.games"],
                 cell: props => <p className="text-right">{props.getValue()}</p>,
                footer: ({ table }) => {
                   const filteredRows = table.getFilteredRowModel().rows?.filter((row) => 
                        row.original['stat.games'] != null && isNHLRow(row)
                    ) || [];

                    const sum = filteredRows.reduce((total, row) => total + (Number(row.original['stat.games']) || 0), 0)
                    return <div className="text-right pr-1">{sum}</div>
                },    
             },
            ...positionalColumns
        ],
        [positionalColumns]
    )
    const data = useMemo(() => stats, [stats])

    if (!person) {
        return (
            <p className='text-lg font-bold text-center'>Player Not Found... Return {' '}
        <Link href="/" className='text-blue-600 hover:text-blue-800'>
          Home
        </Link>
            </p>
        );
    }
    const awardsTable = awards && awards.length > 0 ? (
        <div className='border p-2 w-full'>
            <p className="font-semibold mb-2">Awards ({awards.length})</p>
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b">
                        <th className="text-left py-1">Trophy</th>
                        <th className="text-right py-1">Season</th>
                    </tr>
                </thead>
                <tbody>
                    {awards.map((award, idx) => (
                        <tr key={idx} className="border-b border-gray-200 dark:border-gray-700">
                            <td className="py-1 text-sm">{award.trophy_default}</td>
                            <td className="text-right py-1 whitespace-nowrap text-sm">
                                {String(award.seasonId).slice(0, 4)}-{String(award.seasonId).slice(6, 8)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    ) : null;

    return (
        <div className="flex flex-col sm:flex-row mt-2">
            <Head>
                <title>
                   {person?.player_name ? person.player_name : 'Player'} Hockey Stats and Profile | hockeydb.xyz
                </title>
                <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2056923001767627"
     crossOrigin="anonymous"></script>
            </Head>

            {/* Sidebar: Photo, Bio, Draft, Awards (desktop only) */}
            <div className="flex flex-row sm:flex-col items-start sm:items-center p-2 ml-2 sm:w-60 shrink-0">
                <Image src={`https://assets.nhle.com/mugs/nhl/latest/${id}.png`} alt="player headshot" width={200} height={0} className="shrink-0"/>
                <div className="flex flex-col ml-2 sm:ml-0">
                    <div className="w-full p-1 m-1">
                        <p className="text-2xl font-bold">{person?.player_name}</p>
                        <p>Birth Date: {person?.birthdate}</p>
                        <p>Nationality: {person?.birthCountry}</p>
                        <p>Position: {person?.position}</p>
                        <p>Primary Number: {person?.sweaterNumber}</p>
                        <p>Shoots/Catches: {person?.shootsCatches}</p>
                    </div>
                    <div className='border p-2 w-full'>
                        <p className="text-sm">
                            {hasDraftData(person?.draft_seasons) ? (
                                <>
                                    <span className="font-semibold">Draft:</span>{' '}
                                    <Link
                                        href={`/drafts/${person?.draft_seasons}`}
                                        className="text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                        {person?.draft_seasons}
                                    </Link>
                                    , {person?.displayAbbrev} {person?.ordinalPick ? `(${person?.ordinalPick} overall)` : ''}
                                </>
                            ) : (
                                <span className="font-semibold">Undrafted</span>
                            )}
                        </p>
                    </div>
                </div>
                {/* Awards - desktop only (hidden on mobile) */}
                <div className="hidden sm:block mt-2 w-full">
                    {awardsTable}
                </div>
            </div>

            {/* Main content area */}
            <div className="flex-1 min-w-0">
                {/* Stats Table */}
                {stats ? <ReactTable columns={columns} data={data} /> : <h3>Loading...</h3>}

                {/* Awards - mobile only (hidden on desktop) */}
                <div className="sm:hidden p-2 mt-2">
                    {awardsTable}
                </div>
            </div>
        </div>
    )
};

export async function getServerSideProps({params}) {
    const { id } = params
    let person = []
    
    try {
        person = await getPlayer(id)
        if (!person || person.length === 0) {
            return {
                props: {
                    playerId: params.id,
                    stats: null,
                    person: null,
                }
            }
        }
    } catch (error) {
        console.log(error);
        return {
            props: {
                playerId: params.id,
                stats: null,
                person: null,
            }
        }
    }
    console.log(person[0]);

    const [stats, awards] = await Promise.all([
        getPlayerStats(id, person[0]["position"]),
        getPlayerAwards(id)
    ]);

    return {
        props: {
            playerId: params.id,
            stats,
            person: person ? person[0] : null,
            awards,
        }
    }
}

export default Players;