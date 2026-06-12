import { useMemo } from 'react';
import Link from 'next/link';
import ReactTable from '../../components/Table';
import { ClickableImage } from '../../components/ImageModal';
import SEO, { generatePlayerJsonLd } from '../../components/SEO';
import { extractEntityId, playerUrl, teamUrl } from '../../lib/routes';

const numericColumnMeta = {
    headerClassName: 'text-right',
    cellClassName: 'text-right',
};

const regularStatKeys = {
    games: ['stat.games', 'gamesPlayed'],
    goals: ['stat.goals', 'goals'],
    assists: ['stat.assists', 'assists'],
    points: ['stat.points', 'points'],
    pim: ['stat.pim', 'penaltyMinutes'],
    plusMinus: ['stat.plusMinus', 'plusMinus'],
    wins: ['stat.wins', 'wins'],
    losses: ['stat.losses', 'losses'],
    gaa: ['stat.goalAgainstAverage', 'goalsAgainstAverage'],
    savePct: ['stat.savePercentage', 'savePercentage'],
    shutouts: ['stat.shutouts', 'shutouts'],
};

const playoffStatKeys = {
    games: ['playoffGamesPlayed'],
    goals: ['playoffGoals'],
    assists: ['playoffAssists'],
    points: ['playoffPoints'],
    pim: ['playoffPenaltyMinutes'],
    plusMinus: ['playoffPlusMinus'],
    wins: ['playoffWins'],
    losses: ['playoffLosses'],
    gaa: ['playoffGoalsAgainstAverage'],
    savePct: ['playoffSavePercentage'],
};

const getFirstValue = (row, keys) => {
    for (const key of keys) {
        const value = row?.[key];
        if (value !== null && value !== undefined && value !== '') return value;
    }

    return null;
};

const toNumber = (value) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
};

const formatSeason = (season) => {
    const seasonString = String(season || '');
    if (/^\d{8}$/.test(seasonString)) {
        return `${seasonString.slice(0, 4)}/${seasonString.slice(6, 8)}`;
    }
    return seasonString || '-';
};

const formatValue = (value, digits = 0) => {
    const number = toNumber(value);
    if (number === null) return '-';
    return digits > 0 ? number.toFixed(digits) : String(number);
};

const getPersonValue = (person, keys) => {
    for (const key of keys) {
        const value = person?.[key];
        if (value !== null && value !== undefined && value !== '') return value;
    }

    return null;
};

const formatHeight = (person) => {
    const inches = toNumber(getPersonValue(person, ['heightInInches', 'heightInches', 'height_in_inches', 'height']));
    if (inches !== null && inches > 0) {
        return `${Math.floor(inches / 12)}'${inches % 12}"`;
    }

    const centimeters = toNumber(getPersonValue(person, ['heightInCentimeters', 'heightCentimeters', 'height_in_centimeters']));
    return centimeters === null || centimeters <= 0 ? '-' : `${centimeters} cm`;
};

const formatWeight = (person) => {
    const pounds = toNumber(getPersonValue(person, ['weightInPounds', 'weightPounds', 'weight_in_pounds', 'weight']));
    if (pounds !== null && pounds > 0) return `${pounds} lb`;

    const kilograms = toNumber(getPersonValue(person, ['weightInKilograms', 'weightKilograms', 'weight_in_kilograms']));
    return kilograms === null || kilograms <= 0 ? '-' : `${kilograms} kg`;
};

const isNHLDataRow = (row) => row?.['league.name'] === 'NHL' || row?.['league.name'] === 'National Hockey League';
const isNHLTableRow = (row) => isNHLDataRow(row?.original);
const hasPlayoffGames = (row) => (toNumber(getFirstValue(row, playoffStatKeys.games)) || 0) > 0;

const hasDraftData = (data) => {
    if (!data) return false;
    const s = String(data).trim();
    if (s === '[null]' || s === 'null' || s === '') return false;
    if (Array.isArray(data) && data.filter(Boolean).length === 0) return false;
    return true;
};

const hasAnyStat = (row, statMap) => (
    Object.values(statMap).some((keys) => toNumber(getFirstValue(row, keys)) !== null)
);

const sumRows = (rows, keys) => (
    (rows || []).reduce((total, row) => total + (toNumber(getFirstValue(row.original || row, keys)) || 0), 0)
);

const weightedAverageRows = (rows, valueKeys, weightKeys) => {
    const safeRows = rows || [];
    const totalWeight = sumRows(safeRows, weightKeys);
    if (!totalWeight) return null;

    const weightedTotal = safeRows.reduce((total, row) => {
        const source = row.original || row;
        const weight = toNumber(getFirstValue(source, weightKeys)) || 0;
        const value = toNumber(getFirstValue(source, valueKeys)) || 0;
        return total + weight * value;
    }, 0);

    return weightedTotal / totalWeight;
};

const numberCell = (digits = 0) => {
    function StatNumberCell(props) {
        return <p className="text-right">{formatValue(props.getValue(), digits)}</p>;
    }

    return StatNumberCell;
};

const playoffCell = (digits = 0) => {
    function PlayoffStatCell(props) {
        return <p className="text-right">{hasPlayoffGames(props.row.original) ? formatValue(props.getValue(), digits) : '--'}</p>;
    }

    return PlayoffStatCell;
};

const totalFooter = (keys) => {
    function StatTotalFooter({ table }) {
        const rows = table.getFilteredRowModel().rows?.filter(isNHLTableRow) || [];
        return <div className="text-right pr-1">{sumRows(rows, keys)}</div>;
    }

    return StatTotalFooter;
};

const weightedAverageFooter = (valueKeys, weightKeys, digits) => {
    function StatAverageFooter({ table }) {
        const rows = table.getFilteredRowModel().rows?.filter(isNHLTableRow) || [];
        const average = weightedAverageRows(rows, valueKeys, weightKeys);
        return <div className="text-right pr-1">{average === null ? '-' : average.toFixed(digits)}</div>;
    }

    return StatAverageFooter;
};

const columnId = (prefix, header) => `${prefix}-${String(header).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

const makeStatColumn = ({ header, keys, size = 44, digits = 0, footer = true }) => ({
    id: columnId('regular', header),
    header,
    accessorFn: (row) => getFirstValue(row, keys),
    size,
    meta: numericColumnMeta,
    cell: numberCell(digits),
    footer: footer ? totalFooter(keys) : undefined,
});

const makePlayoffColumn = ({ header, keys, size = 44, digits = 0, footer = true }) => ({
    id: columnId('playoff', header),
    header,
    accessorFn: (row) => getFirstValue(row, keys),
    size,
    meta: numericColumnMeta,
    cell: playoffCell(digits),
    footer: footer ? totalFooter(keys) : undefined,
});

const makeAverageColumn = ({ header, keys, weightKeys, size = 54, digits }) => ({
    id: columnId('regular', header),
    header,
    accessorFn: (row) => getFirstValue(row, keys),
    size,
    meta: numericColumnMeta,
    cell: numberCell(digits),
    footer: weightedAverageFooter(keys, weightKeys, digits),
});

const makePlayoffAverageColumn = ({ header, keys, weightKeys, size = 54, digits }) => ({
    id: columnId('playoff', header),
    header,
    accessorFn: (row) => getFirstValue(row, keys),
    size,
    meta: numericColumnMeta,
    cell: playoffCell(digits),
    footer: weightedAverageFooter(keys, weightKeys, digits),
});

const Players = ({ playerId, stats, person, awards, canonicalPath }) => {
    const id = playerId;
    const rows = useMemo(() => (Array.isArray(stats) ? stats : []), [stats]);
    const position = person?.position || '';
    const isGoalie = position === 'G';
    const getRowClassName = (row) => {
        if (isNHLTableRow(row)) {
            return 'player-stat-row player-stat-row--nhl';
        }

        return 'player-stat-row';
    };

    const currentTeam = useMemo(() => {
        const nhlRows = rows.filter((row) => isNHLDataRow(row) && row?.['team.name']);
        if (nhlRows.length === 0) return null;

        return [...nhlRows].sort((a, b) => {
            const seasonA = Number(a?.season) || 0;
            const seasonB = Number(b?.season) || 0;
            if (seasonB !== seasonA) return seasonB - seasonA;

            const gamesA = toNumber(getFirstValue(a, regularStatKeys.games)) || 0;
            const gamesB = toNumber(getFirstValue(b, regularStatKeys.games)) || 0;
            return gamesB - gamesA;
        })[0];
    }, [rows]);

    const columns = useMemo(() => {
        const baseColumns = [
            {
                header: 'Season',
                accessorKey: 'season',
                size: 76,
                footer: 'NHL',
                cell: (props) => formatSeason(props.getValue()),
            },
            {
                id: 'team',
                header: 'Team',
                accessorFn: (row) => row['team.name'],
                size: 154,
                cell: ({ row }) => {
                    const teamName = row.original['team.name'] || '-';
                    if (!isNHLDataRow(row.original) || !row.original['team.id']) return teamName;

                    return (
                        <Link
                            href={`${teamUrl(teamName, row.original['team.id'])}?season=${encodeURIComponent(row.original.season)}`}
                            passHref
                            className="text-blue-700 hover:underline visited:text-purple-700 dark:text-blue-300 dark:visited:text-purple-300"
                        >
                            {teamName}
                        </Link>
                    );
                },
            },
            {
                id: 'league',
                header: 'Lge',
                accessorFn: (row) => row['league.name'],
                size: 78,
            },
        ];

        if (isGoalie) {
            return [
                ...baseColumns,
                {
                    header: 'Regular Season',
                    columns: [
                        makeStatColumn({ header: 'GP', keys: regularStatKeys.games, size: 42 }),
                        makeStatColumn({ header: 'W', keys: regularStatKeys.wins, size: 38 }),
                        makeStatColumn({ header: 'L', keys: regularStatKeys.losses, size: 38 }),
                        makeAverageColumn({
                            header: 'GAA',
                            keys: regularStatKeys.gaa,
                            weightKeys: regularStatKeys.games,
                            digits: 2,
                        }),
                        makeAverageColumn({
                            header: 'SV%',
                            keys: regularStatKeys.savePct,
                            weightKeys: regularStatKeys.games,
                            digits: 3,
                        }),
                        makeStatColumn({ header: 'SO', keys: regularStatKeys.shutouts, size: 38 }),
                        makeStatColumn({ header: 'G', keys: regularStatKeys.goals, size: 38 }),
                        makeStatColumn({ header: 'A', keys: regularStatKeys.assists, size: 38 }),
                        makeStatColumn({ header: 'PIM', keys: regularStatKeys.pim, size: 44 }),
                    ],
                },
                {
                    header: 'Playoffs',
                    columns: [
                        makePlayoffColumn({ header: 'GP', keys: playoffStatKeys.games, size: 42 }),
                        makePlayoffColumn({ header: 'W', keys: playoffStatKeys.wins, size: 38 }),
                        makePlayoffColumn({ header: 'L', keys: playoffStatKeys.losses, size: 38 }),
                        makePlayoffAverageColumn({
                            header: 'GAA',
                            keys: playoffStatKeys.gaa,
                            weightKeys: playoffStatKeys.games,
                            digits: 2,
                        }),
                        makePlayoffAverageColumn({
                            header: 'SV%',
                            keys: playoffStatKeys.savePct,
                            weightKeys: playoffStatKeys.games,
                            digits: 3,
                        }),
                        makePlayoffColumn({ header: 'G', keys: playoffStatKeys.goals, size: 38 }),
                        makePlayoffColumn({ header: 'A', keys: playoffStatKeys.assists, size: 38 }),
                        makePlayoffColumn({ header: 'PIM', keys: playoffStatKeys.pim, size: 44 }),
                    ],
                },
            ];
        }

        return [
            ...baseColumns,
            {
                header: 'Regular Season',
                columns: [
                    makeStatColumn({ header: 'GP', keys: regularStatKeys.games, size: 42 }),
                    makeStatColumn({ header: 'G', keys: regularStatKeys.goals, size: 38 }),
                    makeStatColumn({ header: 'A', keys: regularStatKeys.assists, size: 38 }),
                    makeStatColumn({ header: 'P', keys: regularStatKeys.points, size: 38 }),
                    makeStatColumn({ header: 'PIM', keys: regularStatKeys.pim, size: 44 }),
                    makeStatColumn({ header: '+/-', keys: regularStatKeys.plusMinus, size: 44 }),
                ],
            },
            {
                header: 'Playoffs',
                columns: [
                    makePlayoffColumn({ header: 'GP', keys: playoffStatKeys.games, size: 42 }),
                    makePlayoffColumn({ header: 'G', keys: playoffStatKeys.goals, size: 38 }),
                    makePlayoffColumn({ header: 'A', keys: playoffStatKeys.assists, size: 38 }),
                    makePlayoffColumn({ header: 'P', keys: playoffStatKeys.points, size: 38 }),
                    makePlayoffColumn({ header: 'PIM', keys: playoffStatKeys.pim, size: 44 }),
                    makePlayoffColumn({ header: '+/-', keys: playoffStatKeys.plusMinus, size: 44 }),
                ],
            },
        ];
    }, [isGoalie]);

    const nhlRows = useMemo(
        () => rows.filter((row) => isNHLDataRow(row) && hasAnyStat(row, regularStatKeys)),
        [rows]
    );

    const regularSummary = useMemo(() => {
        if (isGoalie) {
            return [
                { label: 'NHL GP', value: sumRows(nhlRows, regularStatKeys.games) },
                { label: 'Wins', value: sumRows(nhlRows, regularStatKeys.wins) },
                { label: 'GAA', value: formatValue(weightedAverageRows(nhlRows, regularStatKeys.gaa, regularStatKeys.games), 2) },
                { label: 'SV%', value: formatValue(weightedAverageRows(nhlRows, regularStatKeys.savePct, regularStatKeys.games), 3) },
            ];
        }

        return [
            { label: 'NHL GP', value: sumRows(nhlRows, regularStatKeys.games) },
            { label: 'Goals', value: sumRows(nhlRows, regularStatKeys.goals) },
            { label: 'Assists', value: sumRows(nhlRows, regularStatKeys.assists) },
            { label: 'Points', value: sumRows(nhlRows, regularStatKeys.points) },
        ];
    }, [isGoalie, nhlRows]);

    if (!person) {
        return (
            <p className="text-center text-lg font-bold">
                Player Not Found... Return{' '}
                <Link href="/" className="text-blue-600 hover:text-blue-800">
                    Home
                </Link>
            </p>
        );
    }

    const playerName = person?.player_name || 'Player';
    const headshotUrl = `https://assets.nhle.com/mugs/nhl/latest/${id}.png`;
    const handednessLabel = isGoalie ? 'Catches' : 'Shoots';
    const jsonLd = generatePlayerJsonLd({
        name: playerName,
        image: headshotUrl,
        birthDate: person.birthdate,
        birthPlace: person.birthCountry,
        team: currentTeam?.['team.name'],
    });

    return (
        <div className="bg-white text-slate-950 dark:bg-gray-900 dark:text-slate-100">
            <style jsx global>{`
                .player-stat-row > td {
                    background-color: #ffffff;
                }

                .player-stat-row:hover > td {
                    background-color: #f8fafc;
                }

                .player-stat-row--nhl > td {
                    background-color: #e2e8f0;
                }

                .player-stat-row--nhl:hover > td {
                    background-color: #cbd5e1;
                }

                .dark .player-stat-row > td {
                    background-color: #0f172a;
                }

                .dark .player-stat-row:hover > td {
                    background-color: #1e293b;
                }

                .dark .player-stat-row--nhl > td {
                    background-color: #334155;
                }

                .dark .player-stat-row--nhl:hover > td {
                    background-color: #475569;
                }
            `}</style>
            <SEO
                title={`${playerName} Stats & Profile`}
                description={`${playerName}'s NHL career statistics, draft info, regular season stats, and playoff stats.`}
                path={canonicalPath}
                ogImage={headshotUrl}
                ogType="profile"
                jsonLd={jsonLd}
            />

            <main className="mx-auto max-w-7xl px-2 py-3 sm:px-3">
                <section className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900">
                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-center">
                        <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
                            <ClickableImage
                                src={headshotUrl}
                                alt={`${playerName} headshot`}
                                containerClassName="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-800 sm:h-28 sm:w-28"
                                className="object-cover"
                            />
                            <div className="min-w-0">
                                <h1 className="text-2xl font-bold leading-tight sm:text-3xl">{playerName}</h1>
                                <div className="mt-1 flex flex-wrap items-center justify-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 sm:justify-start">
                                    <span>{position || '-'}</span>
                                    <span className="text-slate-400">|</span>
                                    <span>{person?.sweaterNumber ? `#${person.sweaterNumber}` : '#-'}</span>
                                    <span className="text-slate-400">|</span>
                                    <span>{handednessLabel}: {person?.shootsCatches || '-'}</span>
                                </div>
                                <div className="mt-3 grid gap-x-5 gap-y-1 text-sm text-slate-700 dark:text-slate-300 sm:grid-cols-2">
                                    <p><span className="font-semibold text-slate-900 dark:text-white">Born:</span> {person?.birthdate || '-'}</p>
                                    <p><span className="font-semibold text-slate-900 dark:text-white">Nationality:</span> {person?.birthCountry || '-'}</p>
                                    <p><span className="font-semibold text-slate-900 dark:text-white">Height:</span> {formatHeight(person)}</p>
                                    <p><span className="font-semibold text-slate-900 dark:text-white">Weight:</span> {formatWeight(person)}</p>
                                    <p>
                                        <span className="font-semibold text-slate-900 dark:text-white">Team:</span>{' '}
                                        {currentTeam?.['team.name'] && currentTeam?.['team.id'] ? (
                                            <Link
                                                href={teamUrl(currentTeam['team.name'], currentTeam['team.id'])}
                                                className="text-blue-700 hover:underline dark:text-blue-300"
                                            >
                                                {currentTeam['team.name']}
                                            </Link>
                                        ) : currentTeam?.['team.name'] || '-'}
                                    </p>
                                    <p>
                                        {hasDraftData(person?.draft_seasons) ? (
                                            <>
                                                <span className="font-semibold text-slate-900 dark:text-white">Draft:</span>{' '}
                                                <Link
                                                    href={`/drafts/${person?.draft_seasons}`}
                                                    className="text-blue-700 hover:underline dark:text-blue-300"
                                                >
                                                    {person?.draft_seasons}
                                                </Link>
                                                {person?.displayAbbrev ? `, ${person.displayAbbrev}` : ''}
                                                {person?.ordinalPick ? ` (${person.ordinalPick} overall)` : ''}
                                            </>
                                        ) : (
                                            <><span className="font-semibold text-slate-900 dark:text-white">Draft:</span> Undrafted</>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-slate-200 pt-3 dark:border-slate-700 sm:grid-cols-4 lg:grid-cols-2 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
                            {regularSummary.map((stat) => (
                                <div key={stat.label}>
                                    <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">{stat.label}</p>
                                    <p className="text-2xl font-bold tabular-nums">{stat.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="mt-4">
                    <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
                        <div>
                            <h2 className="text-lg font-bold text-slate-950 dark:text-white">Season Stats</h2>
                        </div>
                    </div>
                    {rows.length > 0 ? (
                        <ReactTable
                            columns={columns}
                            data={rows}
                            sortKey="season"
                            sortDesc
                            modern
                            compact
                            rowClassName={getRowClassName}
                        />
                    ) : (
                        <p className="text-sm text-slate-500 dark:text-slate-400">No regular season stats available.</p>
                    )}
                </section>

                {awards?.length > 0 && (
                    <section className="mt-4">
                        <h2 className="mb-2 text-lg font-bold text-slate-950 dark:text-white">Awards</h2>
                        <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                                    <tr>
                                        <th className="px-3 py-2 text-left">Trophy</th>
                                        <th className="px-3 py-2 text-right">Season</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {awards.map((award, idx) => (
                                        <tr key={`${award.trophy_default}-${award.seasonId}-${idx}`} className="border-t border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
                                            <td className="px-3 py-2">{award.trophy_default}</td>
                                            <td className="px-3 py-2 text-right tabular-nums">
                                                {formatSeason(award.seasonId)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
};

export async function getServerSideProps({ params, req }) {
    const id = extractEntityId(params.id);
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host;

    try {
        const response = await fetch(`${protocol}://${host}/api/players/${id}`);

        if (!response.ok) {
            return {
                props: {
                    playerId: id,
                    stats: null,
                    person: null,
                    awards: [],
                    canonicalPath: playerUrl(null, id),
                },
            };
        }

        const payload = await response.json();
        const person = payload?.player?.[0] || null;

        if (!person) {
            return {
                props: {
                    playerId: id,
                    stats: null,
                    person: null,
                    awards: [],
                    canonicalPath: playerUrl(null, id),
                },
            };
        }

        const canonicalPath = playerUrl(person.player_name, id);
        if (params.id !== canonicalPath.split('/').pop()) {
            return {
                redirect: {
                    destination: canonicalPath,
                    permanent: false,
                },
            };
        }

        return {
            props: {
                playerId: id,
                stats: payload?.playerStats || [],
                person,
                awards: payload?.awards || [],
                canonicalPath,
            },
        };
    } catch (error) {
        console.log(error);
        return {
            props: {
                playerId: id,
                stats: null,
                person: null,
                awards: [],
                canonicalPath: playerUrl(null, id),
            },
        };
    }
}

export default Players;
