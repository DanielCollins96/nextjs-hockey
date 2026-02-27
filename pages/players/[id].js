import { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ReactTable from '../../components/Table';
import { ClickableImage } from '../../components/ImageModal';
import SEO, { generatePlayerJsonLd } from '../../components/SEO';

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

    const formatSeason = (season) => {
        const seasonString = String(season || '');
        if (/^\d{8}$/.test(seasonString)) {
            return `${seasonString.slice(0, 4)}/${seasonString.slice(6, 8)}`;
        }
        return seasonString;
    };

    const currentTeam = useMemo(() => {
        if (!Array.isArray(stats)) return null;

        const nhlRows = stats.filter((row) => row?.['league.name'] === 'NHL' && row?.['team.name']);
        if (nhlRows.length === 0) return null;

        const sortedNhlRows = [...nhlRows].sort((a, b) => {
            const seasonA = Number(a?.season) || 0;
            const seasonB = Number(b?.season) || 0;
            if (seasonB !== seasonA) return seasonB - seasonA;

            const gamesA = Number(a?.['stat.games']) || 0;
            const gamesB = Number(b?.['stat.games']) || 0;
            return gamesB - gamesA;
        });

        return sortedNhlRows[0]?.['team.name'] || null;
    }, [stats]);

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
                 cell: props => formatSeason(props.getValue()),
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

    const playerName = person?.player_name || 'Player';
    const headshotUrl = `https://assets.nhle.com/mugs/nhl/latest/${id}.png`;
    const jsonLd = person ? generatePlayerJsonLd({
        name: playerName,
        image: headshotUrl,
        birthDate: person.birthdate,
        birthPlace: person.birthCountry,
    }) : null;

    return (
        <div className="mt-2">
            <SEO
                title={`${playerName} Stats & Profile`}
                description={`${playerName}'s NHL career statistics, draft info, and season-by-season stats. View games played, goals, assists, points, and more.`}
                path={`/players/${id}`}
                ogImage={headshotUrl}
                ogType="profile"
                jsonLd={jsonLd}
            />

            <div className="mx-2 border border-gray-300 dark:border-gray-700 p-3 sm:p-4">
                <div className="flex flex-col items-center text-center">
                    <ClickableImage
                        src={`https://assets.nhle.com/mugs/nhl/latest/${id}.png`}
                        alt={`${playerName} headshot`}
                        containerClassName="relative w-28 h-28 sm:w-36 sm:h-36 overflow-hidden border border-gray-300 dark:border-gray-700 rounded-full"
                        className="object-cover"
                    />
                    <p className="mt-3 text-3xl font-bold leading-tight">{person?.player_name}</p>
                    <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-sm sm:text-base font-semibold">
                        <span>{person?.position}</span>
                        <span className="text-gray-500 dark:text-gray-400">•</span>
                        <span>#{person?.sweaterNumber}</span>
                        <span className="text-gray-500 dark:text-gray-400">•</span>
                        <span>{person?.shootsCatches}</span>
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm sm:text-base">
                    <p><span className="font-semibold">Birth Date:</span> {person?.birthdate}</p>
                    <p><span className="font-semibold">Nationality:</span> {person?.birthCountry}</p>
                    <p className="col-span-2 sm:col-span-1"><span className="font-semibold">Team:</span> {currentTeam || '-'}</p>
                </div>

                <div className='border border-gray-300 dark:border-gray-700 p-2 w-full mt-3 text-sm sm:text-base'>
                    <p className="leading-snug text-center sm:text-left">
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

            <div className="min-w-0 mt-2 px-2">
                {/* Stats Table */}
                {stats ? <ReactTable columns={columns} data={data} mobileFit={true} /> : <h3>Loading...</h3>}
            </div>

            <div className="p-2 mt-2">
                {awardsTable}
            </div>
        </div>
    )
};

export async function getServerSideProps({params, req}) {
    const { id } = params
    const protocol = req.headers['x-forwarded-proto'] || 'http'
    const host = req.headers.host

    try {
        const response = await fetch(`${protocol}://${host}/api/players/${id}`)

        if (!response.ok) {
            return {
                props: {
                    playerId: params.id,
                    stats: null,
                    person: null,
                }
            }
        }

        const payload = await response.json()
        const person = payload?.player?.[0] || null

        if (!person) {
            return {
                props: {
                    playerId: params.id,
                    stats: null,
                    person: null,
                    awards: [],
                }
            }
        }

        return {
            props: {
                playerId: params.id,
                stats: payload?.playerStats || [],
                person,
                awards: payload?.awards || [],
            }
        }
    } catch (error) {
        console.log(error);
        return {
            props: {
                playerId: params.id,
                stats: null,
                person: null,
                awards: [],
            }
        }
    }
}

export default Players;