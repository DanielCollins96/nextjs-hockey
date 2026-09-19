import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import SEO from '../../components/SEO';
import { ClickableImage } from '../../components/ImageModal';
import { formatCurrency, formatSeason, toNumber } from '../../lib/format';
import { extractEntityId, playerUrl, teamUrl } from '../../lib/routes';
import { loadPlayer } from '../../lib/player-data';
import { PAGE_CACHE, setPageCache } from '../../lib/http-cache';

const getFirstValue = (row, keys) => {
    for (const key of keys) {
        const value = row?.[key];
        if (value !== null && value !== undefined && value !== '') return value;
    }
    return null;
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

const isNHLDataRow = (row) => row?.['league.name'] === 'NHL' || row?.['league.name'] === 'National Hockey League';

const sumRows = (rows, keys) => (
    (rows || []).reduce((total, row) => total + (toNumber(getFirstValue(row, keys)) || 0), 0)
);

const weightedAverageRows = (rows, valueKeys, weightKeys) => {
    const safeRows = rows || [];
    const totalWeight = sumRows(safeRows, weightKeys);
    if (!totalWeight) return null;
    const weightedTotal = safeRows.reduce((total, row) => {
        const weight = toNumber(getFirstValue(row, weightKeys)) || 0;
        const value = toNumber(getFirstValue(row, valueKeys)) || 0;
        return total + weight * value;
    }, 0);
    return weightedTotal / totalWeight;
};

const hasDraftData = (data) => {
    if (!data) return false;
    const s = String(data).trim();
    if (s === '[null]' || s === 'null' || s === '') return false;
    if (Array.isArray(data) && data.filter(Boolean).length === 0) return false;
    return true;
};

const PlayerSelector = ({ onSelect, excludeId }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (!searchTerm || searchTerm.length < 2) {
            setSearchResults([]);
            return;
        }

        const controller = new AbortController();
        setIsSearching(true);

        fetch(`/api/players?q=${encodeURIComponent(searchTerm)}&limit=10`, { signal: controller.signal })
            .then((response) => (response.ok ? response.json() : null))
            .then((payload) => {
                if (!payload) return;
                const filtered = (payload.players || []).filter((p) => String(p.playerId) !== String(excludeId));
                setSearchResults(filtered);
            })
            .catch((error) => {
                if (error.name !== 'AbortError') {
                    console.warn('Search error', error);
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) setIsSearching(false);
            });

        return () => controller.abort();
    }, [searchTerm, excludeId]);

    return (
        <div className="relative">
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for a player..."
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchTerm.length >= 2 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                    {isSearching ? (
                        <div className="px-4 py-3 text-gray-500 dark:text-gray-400">Searching...</div>
                    ) : searchResults.length > 0 ? (
                        searchResults.map((player) => (
                            <button
                                key={player.playerId}
                                type="button"
                                onClick={() => onSelect(player)}
                                className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                            >
                                <div className="font-semibold text-gray-900 dark:text-white">{player.player_name}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    {player.position} {player.team_name ? `| ${player.team_name}` : ''}
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className="px-4 py-3 text-gray-500 dark:text-gray-400">No players found</div>
                    )}
                </div>
            )}
        </div>
    );
};

const PlayerComparison = ({ player1Data, player2Data }) => {
    const player1 = player1Data?.player?.[0];
    const player2 = player2Data?.player?.[0];
    const stats1 = player1Data?.playerStats || [];
    const stats2 = player2Data?.playerStats || [];

    if (!player1 || !player2) {
        return <div className="text-center py-8">Loading player data...</div>;
    }

    const position1 = player1.position || '';
    const position2 = player2.position || '';
    const isGoalie1 = position1 === 'G';
    const isGoalie2 = position2 === 'G';
    const bothSameType = isGoalie1 === isGoalie2;

    const nhlRows1 = stats1.filter((row) => isNHLDataRow(row));
    const nhlRows2 = stats2.filter((row) => isNHLDataRow(row));

    const currentTeam1 = useMemo(() => {
        if (nhlRows1.length === 0) return null;
        return [...nhlRows1].sort((a, b) => {
            const seasonA = Number(a?.season) || 0;
            const seasonB = Number(b?.season) || 0;
            if (seasonB !== seasonA) return seasonB - seasonA;
            const gamesA = toNumber(getFirstValue(a, regularStatKeys.games)) || 0;
            const gamesB = toNumber(getFirstValue(b, regularStatKeys.games)) || 0;
            return gamesB - gamesA;
        })[0];
    }, [nhlRows1]);

    const currentTeam2 = useMemo(() => {
        if (nhlRows2.length === 0) return null;
        return [...nhlRows2].sort((a, b) => {
            const seasonA = Number(a?.season) || 0;
            const seasonB = Number(b?.season) || 0;
            if (seasonB !== seasonA) return seasonB - seasonA;
            const gamesA = toNumber(getFirstValue(a, regularStatKeys.games)) || 0;
            const gamesB = toNumber(getFirstValue(b, regularStatKeys.games)) || 0;
            return gamesB - gamesA;
        })[0];
    }, [nhlRows2]);

    const getCareerStats = (rows, isGoalie) => {
        if (isGoalie) {
            return [
                { label: 'GP', value: sumRows(rows, regularStatKeys.games) },
                { label: 'W', value: sumRows(rows, regularStatKeys.wins) },
                { label: 'L', value: sumRows(rows, regularStatKeys.losses) },
                { label: 'GAA', value: formatValue(weightedAverageRows(rows, regularStatKeys.gaa, regularStatKeys.games), 2) },
                { label: 'SV%', value: formatValue(weightedAverageRows(rows, regularStatKeys.savePct, regularStatKeys.games), 3) },
                { label: 'SO', value: sumRows(rows, regularStatKeys.shutouts) },
            ];
        }
        return [
            { label: 'GP', value: sumRows(rows, regularStatKeys.games) },
            { label: 'G', value: sumRows(rows, regularStatKeys.goals) },
            { label: 'A', value: sumRows(rows, regularStatKeys.assists) },
            { label: 'P', value: sumRows(rows, regularStatKeys.points) },
            { label: 'PIM', value: sumRows(rows, regularStatKeys.pim) },
            { label: '+/-', value: sumRows(rows, regularStatKeys.plusMinus) },
        ];
    };

    const career1 = getCareerStats(nhlRows1, isGoalie1);
    const career2 = getCareerStats(nhlRows2, isGoalie2);

    const handednessLabel1 = isGoalie1 ? 'Catches' : 'Shoots';
    const handednessLabel2 = isGoalie2 ? 'Catches' : 'Shoots';

    return (
        <div className="bg-white text-slate-950 dark:bg-gray-900 dark:text-slate-100">
            <SEO
                title={`Compare ${player1.player_name} vs ${player2.player_name}`}
                description={`Side-by-side comparison of ${player1.player_name} and ${player2.player_name} NHL career statistics.`}
                path={`/players/compare?players=${player1Data.playerId},${player2Data.playerId}`}
            />

            <main className="mx-auto max-w-7xl px-2 py-3 sm:px-3">
                <div className="mb-4">
                    <Link href="/players" className="text-blue-600 hover:underline dark:text-blue-400">
                        ← Back to Players
                    </Link>
                </div>

                <h1 className="text-2xl font-bold mb-4 text-center sm:text-3xl">Player Comparison</h1>

                {!bothSameType && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg dark:bg-yellow-900/20 dark:border-yellow-800">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            ⚠️ Comparing players with different positions. Stats may not be directly comparable.
                        </p>
                    </div>
                )}

                <div className="grid gap-4 lg:grid-cols-2">
                    <section className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
                        <div className="flex flex-col items-center gap-3 text-center">
                            <ClickableImage
                                src={`https://assets.nhle.com/mugs/nhl/latest/${player1Data.playerId}.png`}
                                alt={`${player1.player_name} headshot`}
                                containerClassName="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-800"
                                className="object-cover"
                            />
                            <div className="min-w-0 w-full">
                                <h2 className="text-xl font-bold">
                                    <Link
                                        href={playerUrl(player1.player_name, player1Data.playerId)}
                                        className="text-blue-700 hover:underline dark:text-blue-300"
                                    >
                                        {player1.player_name}
                                    </Link>
                                </h2>
                                <div className="mt-1 flex flex-wrap items-center justify-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    <span>{position1 || '-'}</span>
                                    <span className="text-slate-400">|</span>
                                    <span>{player1?.sweaterNumber ? `#${player1.sweaterNumber}` : '#-'}</span>
                                    <span className="text-slate-400">|</span>
                                    <span>{handednessLabel1}: {player1?.shootsCatches || '-'}</span>
                                </div>
                                <div className="mt-3 space-y-1 text-sm text-slate-700 dark:text-slate-300">
                                    <p><span className="font-semibold">Born:</span> {player1?.birthdate || '-'}</p>
                                    <p><span className="font-semibold">Nationality:</span> {player1?.birthCountry || '-'}</p>
                                    <p><span className="font-semibold">Height:</span> {formatHeight(player1)}</p>
                                    <p><span className="font-semibold">Weight:</span> {formatWeight(player1)}</p>
                                    <p>
                                        <span className="font-semibold">Team:</span>{' '}
                                        {currentTeam1?.['team.name'] && currentTeam1?.['team.id'] ? (
                                            <Link
                                                href={teamUrl(currentTeam1['team.name'], currentTeam1['team.id'])}
                                                className="text-blue-700 hover:underline dark:text-blue-300"
                                            >
                                                {currentTeam1['team.name']}
                                            </Link>
                                        ) : currentTeam1?.['team.name'] || '-'}
                                    </p>
                                    <p>
                                        {hasDraftData(player1?.draft_seasons) ? (
                                            <>
                                                <span className="font-semibold">Draft:</span>{' '}
                                                <Link
                                                    href={`/drafts/${player1?.draft_seasons}`}
                                                    className="text-blue-700 hover:underline dark:text-blue-300"
                                                >
                                                    {player1?.draft_seasons}
                                                </Link>
                                                {player1?.displayAbbrev ? `, ${player1.displayAbbrev}` : ''}
                                                {player1?.ordinalPick ? ` (${player1.ordinalPick})` : ''}
                                            </>
                                        ) : (
                                            <><span className="font-semibold">Draft:</span> Undrafted</>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <h3 className="text-lg font-semibold mb-3">NHL Career Stats</h3>
                            <div className="grid grid-cols-3 gap-3">
                                {career1.map((stat) => (
                                    <div key={stat.label} className="text-center">
                                        <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">{stat.label}</p>
                                        <p className="text-xl font-bold tabular-nums">{stat.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
                        <div className="flex flex-col items-center gap-3 text-center">
                            <ClickableImage
                                src={`https://assets.nhle.com/mugs/nhl/latest/${player2Data.playerId}.png`}
                                alt={`${player2.player_name} headshot`}
                                containerClassName="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-800"
                                className="object-cover"
                            />
                            <div className="min-w-0 w-full">
                                <h2 className="text-xl font-bold">
                                    <Link
                                        href={playerUrl(player2.player_name, player2Data.playerId)}
                                        className="text-blue-700 hover:underline dark:text-blue-300"
                                    >
                                        {player2.player_name}
                                    </Link>
                                </h2>
                                <div className="mt-1 flex flex-wrap items-center justify-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    <span>{position2 || '-'}</span>
                                    <span className="text-slate-400">|</span>
                                    <span>{player2?.sweaterNumber ? `#${player2.sweaterNumber}` : '#-'}</span>
                                    <span className="text-slate-400">|</span>
                                    <span>{handednessLabel2}: {player2?.shootsCatches || '-'}</span>
                                </div>
                                <div className="mt-3 space-y-1 text-sm text-slate-700 dark:text-slate-300">
                                    <p><span className="font-semibold">Born:</span> {player2?.birthdate || '-'}</p>
                                    <p><span className="font-semibold">Nationality:</span> {player2?.birthCountry || '-'}</p>
                                    <p><span className="font-semibold">Height:</span> {formatHeight(player2)}</p>
                                    <p><span className="font-semibold">Weight:</span> {formatWeight(player2)}</p>
                                    <p>
                                        <span className="font-semibold">Team:</span>{' '}
                                        {currentTeam2?.['team.name'] && currentTeam2?.['team.id'] ? (
                                            <Link
                                                href={teamUrl(currentTeam2['team.name'], currentTeam2['team.id'])}
                                                className="text-blue-700 hover:underline dark:text-blue-300"
                                            >
                                                {currentTeam2['team.name']}
                                            </Link>
                                        ) : currentTeam2?.['team.name'] || '-'}
                                    </p>
                                    <p>
                                        {hasDraftData(player2?.draft_seasons) ? (
                                            <>
                                                <span className="font-semibold">Draft:</span>{' '}
                                                <Link
                                                    href={`/drafts/${player2?.draft_seasons}`}
                                                    className="text-blue-700 hover:underline dark:text-blue-300"
                                                >
                                                    {player2?.draft_seasons}
                                                </Link>
                                                {player2?.displayAbbrev ? `, ${player2.displayAbbrev}` : ''}
                                                {player2?.ordinalPick ? ` (${player2.ordinalPick})` : ''}
                                            </>
                                        ) : (
                                            <><span className="font-semibold">Draft:</span> Undrafted</>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <h3 className="text-lg font-semibold mb-3">NHL Career Stats</h3>
                            <div className="grid grid-cols-3 gap-3">
                                {career2.map((stat) => (
                                    <div key={stat.label} className="text-center">
                                        <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">{stat.label}</p>
                                        <p className="text-xl font-bold tabular-nums">{stat.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default function ComparePlayersPage({ player1Data, player2Data, missingPlayers }) {
    const router = useRouter();
    const [selectedPlayer2, setSelectedPlayer2] = useState(null);

    useEffect(() => {
        if (selectedPlayer2) {
            const newPlayerIds = [player1Data?.playerId, selectedPlayer2.playerId].filter(Boolean).join(',');
            router.push(`/players/compare?players=${newPlayerIds}`);
        }
    }, [selectedPlayer2, player1Data?.playerId, router]);

    if (missingPlayers) {
        return (
            <div className="bg-white text-slate-950 dark:bg-gray-900 dark:text-slate-100 min-h-screen">
                <main className="mx-auto max-w-7xl px-2 py-8 sm:px-3">
                    <div className="mb-4">
                        <Link href="/players" className="text-blue-600 hover:underline dark:text-blue-400">
                            ← Back to Players
                        </Link>
                    </div>
                    <h1 className="text-2xl font-bold mb-4 text-center sm:text-3xl">Compare Players</h1>
                    <div className="text-center py-8">
                        <p className="text-lg mb-4">Select two players to compare their stats</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                            You can start from any player&apos;s profile page
                        </p>
                        <Link
                            href="/players"
                            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Browse Players
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    if (!player1Data && !player2Data) {
        return (
            <div className="bg-white text-slate-950 dark:bg-gray-900 dark:text-slate-100 min-h-screen">
                <main className="mx-auto max-w-7xl px-2 py-8 sm:px-3">
                    <div className="mb-4">
                        <Link href="/players" className="text-blue-600 hover:underline dark:text-blue-400">
                            ← Back to Players
                        </Link>
                    </div>
                    <h1 className="text-2xl font-bold mb-4 text-center sm:text-3xl">Compare Players</h1>
                    <div className="text-center py-8">
                        <p className="text-lg">No players selected for comparison</p>
                    </div>
                </main>
            </div>
        );
    }

    if (player1Data && !player2Data) {
        return (
            <div className="bg-white text-slate-950 dark:bg-gray-900 dark:text-slate-100 min-h-screen">
                <main className="mx-auto max-w-7xl px-2 py-8 sm:px-3">
                    <div className="mb-4">
                        <Link href="/players" className="text-blue-600 hover:underline dark:text-blue-400">
                            ← Back to Players
                        </Link>
                    </div>
                    <h1 className="text-2xl font-bold mb-4 text-center sm:text-3xl">Compare Players</h1>
                    <div className="max-w-2xl mx-auto">
                        <div className="mb-6 p-4 rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
                            <p className="font-semibold mb-2">Selected Player:</p>
                            <p className="text-lg">{player1Data?.player?.[0]?.player_name}</p>
                        </div>
                        <div>
                            <p className="font-semibold mb-3">Select a player to compare with:</p>
                            <PlayerSelector onSelect={setSelectedPlayer2} excludeId={player1Data.playerId} />
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (!player1Data && player2Data) {
        return (
            <div className="bg-white text-slate-950 dark:bg-gray-900 dark:text-slate-100 min-h-screen">
                <main className="mx-auto max-w-7xl px-2 py-8 sm:px-3">
                    <div className="mb-4">
                        <Link href="/players" className="text-blue-600 hover:underline dark:text-blue-400">
                            ← Back to Players
                        </Link>
                    </div>
                    <h1 className="text-2xl font-bold mb-4 text-center sm:text-3xl">Compare Players</h1>
                    <div className="text-center py-8">
                        <p className="text-lg mb-4">First player could not be loaded</p>
                        <Link
                            href="/players"
                            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Browse Players
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    return <PlayerComparison player1Data={player1Data} player2Data={player2Data} />;
}

export async function getServerSideProps({ query, res }) {
    const { players } = query;

    if (!players) {
        setPageCache(res, PAGE_CACHE.hourly);
        return {
            props: {
                player1Data: null,
                player2Data: null,
                missingPlayers: true,
            },
        };
    }

    const playerIds = String(players).split(',').map((id) => extractEntityId(id.trim())).filter(Boolean);

    if (playerIds.length === 0) {
        setPageCache(res, PAGE_CACHE.hourly);
        return {
            props: {
                player1Data: null,
                player2Data: null,
                missingPlayers: true,
            },
        };
    }

    const [player1Result, player2Result] = await Promise.all([
        playerIds[0] ? loadPlayer(playerIds[0]).catch(() => ({ notFound: true })) : { notFound: true },
        playerIds[1] ? loadPlayer(playerIds[1]).catch(() => ({ notFound: true })) : { notFound: true },
    ]);

    if (player1Result.notFound && player2Result.notFound) {
        return { notFound: true };
    }

    setPageCache(res, PAGE_CACHE.hourly);

    return {
        props: {
            player1Data: player1Result.notFound ? null : {
                playerId: playerIds[0],
                player: player1Result.player,
                playerStats: player1Result.playerStats,
                awards: player1Result.awards,
                contracts: player1Result.contracts,
                currentContract: player1Result.currentContract,
            },
            player2Data: player2Result.notFound ? null : {
                playerId: playerIds[1],
                player: player2Result.player,
                playerStats: player2Result.playerStats,
                awards: player2Result.awards,
                contracts: player2Result.contracts,
                currentContract: player2Result.currentContract,
            },
            missingPlayers: false,
        },
    };
}
