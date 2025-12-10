import { useMemo } from 'react';
import Head from 'next/head'
import Link from 'next/link';
import Image from 'next/image'
import { useRouter } from 'next/router';
import {getPlayer, getPlayerStats} from '../../lib/queries'
import ReactTable from '../../components/Table';

const Players = ({playerId, stats, person}) => {
    const router = useRouter()
    const { id } = router.query

    const position = person && person['position'] ? person['position'] : 'Center';

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
    return (
        <div className="flex flex-col sm:flex-row mt-2">
            <Head>
                <title>
                   {person?.player_name ? person.player_name : 'Player'} Hockey Stats and Profile | hockeydb.xyz
                </title>
                <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2056923001767627"
     crossOrigin="anonymous"></script>
            </Head>

            <div className="flex flex-row sm:flex-col h-full justify-start items-center p-2 ml-2">
                <Image src={`https://assets.nhle.com/mugs/nhl/latest/${id}.png`} alt="player headshot" width={200} height={0}/>
                <div className="w-56 p-1 m-1">
                <p className="text-2xl font-bold">{person?.player_name}</p>
                <p>Birth Date: {person?.birthdate}</p>
                <p>Nationality: {person?.birthCountry}</p>
                <p>Position: {person?.position}</p>
                <p>Primary Number: {person?.sweaterNumber}</p>
                {/* <p>Age: {person?.currentAge}</p> */}
                </div>
                <div className='border'>
                    <p>Drafted: {person?.draft_seasons ? person?.draft_seasons : 'Undrafted'}</p>
                    <p>Position: {person?.draft_position ? '#' + person?.draft_position : 'N/A'}</p>
                </div>
            </div>
            {stats ? <ReactTable columns={columns} data={data} /> : <h3>Loading...</h3>} 
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

    const stats = await getPlayerStats(id, person[0]["position"])

    return {
        props: {
            playerId: params.id,
            stats,
            person: person ? person[0] : null,
        }
    }
}

export default Players;