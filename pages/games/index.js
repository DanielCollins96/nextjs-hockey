import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { API, graphqlOperation } from 'aws-amplify';
import SEO from '../../components/SEO';
import { UseAuth } from '../../contexts/Auth';
import * as queries from '../../src/graphql/queries';
import { useReactTable, flexRender, getCoreRowModel, getSortedRowModel } from '@tanstack/react-table';
import { FaChevronLeft, FaChevronRight, FaTable, FaTh, FaDownload, FaRegCommentDots } from 'react-icons/fa';

function formatDateShort(dateString) {
  const date = new Date(dateString + 'T12:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getGameStatus(game) {
  const state = game.gameState;

  if (state === 'FINAL' || state === 'OFF') {
    const periodType = game.gameOutcome_lastPeriodType;
    if (periodType === 'OT') return 'FINAL/OT';
    if (periodType === 'SO') return 'FINAL/SO';
    return 'FINAL';
  }

  if (state === 'LIVE' || state === 'CRIT') {
    return 'LIVE';
  }

  if (state === 'FUT' || state === 'PRE') {
    const startTime = new Date(game.startTimeUTC);
    return startTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  return state;
}

function GameCard({ game, commentCount = 0, showCommentMeta = false }) {
  const status = getGameStatus(game);
  const isLive = game.gameState === 'LIVE' || game.gameState === 'CRIT';
  const isScheduled = game.gameState === 'FUT' || game.gameState === 'PRE';

  return (
    <Link href={`/games/${game.id}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 cursor-pointer">
        <div className={`text-sm font-semibold mb-3 ${showCommentMeta ? 'flex items-center justify-between' : 'text-center'} ${isLive ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
          <span>{status}</span>
          {showCommentMeta && (
            <button
              type="button"
              className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
              title="Open game thread"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                window.location.href = `/games/${game.id}#thread`;
              }}
            >
              <FaRegCommentDots className="w-3 h-3" />
              {commentCount}
            </button>
          )}
        </div>

        {/* Away Team */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 relative">
              <Image
                src={game.awayTeam_darkLogo || `https://assets.nhle.com/logos/nhl/svg/${game.awayTeam_abbrev}_dark.svg`}
                alt={game.awayTeam_abbrev}
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <span className="text-lg font-medium dark:text-white">{game.awayTeam_abbrev}</span>
          </div>
          <span className={`font-bold text-xl ${!isScheduled ? 'dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>
            {!isScheduled ? game.awayTeam_score : '-'}
          </span>
        </div>

        {/* Home Team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 relative">
              <Image
                src={game.homeTeam_darkLogo || `https://assets.nhle.com/logos/nhl/svg/${game.homeTeam_abbrev}_dark.svg`}
                alt={game.homeTeam_abbrev}
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <span className="text-lg font-medium dark:text-white">{game.homeTeam_abbrev}</span>
          </div>
          <span className={`font-bold text-xl ${!isScheduled ? 'dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>
            {!isScheduled ? game.homeTeam_score : '-'}
          </span>
        </div>
      </div>
    </Link>
  );
}

function GamesTable({ games, showDate = false }) {
  const [sorting, setSorting] = useState([]);

  const columns = useMemo(() => {
    const cols = [];

    if (showDate) {
      cols.push({
        header: 'Date',
        accessorKey: 'gameDate',
        cell: ({ getValue }) => formatDateShort(getValue()),
      });
    }

    cols.push(
      {
        header: 'Away',
        accessorKey: 'awayTeam_abbrev',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 relative flex-shrink-0">
              <Image
                src={row.original.awayTeam_darkLogo || `https://assets.nhle.com/logos/nhl/svg/${row.original.awayTeam_abbrev}_dark.svg`}
                alt={row.original.awayTeam_abbrev}
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <span className="font-medium">{row.original.awayTeam_abbrev}</span>
          </div>
        ),
      },
      {
        header: 'Score',
        accessorKey: 'awayTeam_score',
        cell: ({ row }) => {
          const isScheduled = row.original.gameState === 'FUT' || row.original.gameState === 'PRE';
          return <span className="font-bold">{!isScheduled ? row.original.awayTeam_score : '-'}</span>;
        },
      },
      {
        header: 'Home',
        accessorKey: 'homeTeam_abbrev',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 relative flex-shrink-0">
              <Image
                src={row.original.homeTeam_darkLogo || `https://assets.nhle.com/logos/nhl/svg/${row.original.homeTeam_abbrev}_dark.svg`}
                alt={row.original.homeTeam_abbrev}
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <span className="font-medium">{row.original.homeTeam_abbrev}</span>
          </div>
        ),
      },
      {
        header: 'Score',
        accessorKey: 'homeTeam_score',
        cell: ({ row }) => {
          const isScheduled = row.original.gameState === 'FUT' || row.original.gameState === 'PRE';
          return <span className="font-bold">{!isScheduled ? row.original.homeTeam_score : '-'}</span>;
        },
      },
      {
        header: 'Status',
        accessorFn: (row) => getGameStatus(row),
        id: 'status',
        enableSorting: false,
        cell: ({ row }) => {
          const isLive = row.original.gameState === 'LIVE' || row.original.gameState === 'CRIT';
          return (
            <span className={isLive ? 'text-red-500 font-semibold' : ''}>
              {getGameStatus(row.original)}
            </span>
          );
        },
      }
    );

    return cols;
  }, [showDate]);

  const table = useReactTable({
    columns,
    data: games,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id} className="border-b border-gray-200 dark:border-gray-700">
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  className={`px-4 py-3 text-left text-sm font-semibold dark:text-white ${
                    header.column.getCanSort() ? 'cursor-pointer select-none hover:bg-gray-50 dark:hover:bg-gray-700' : ''
                  }`}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <div className="flex items-center gap-1">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {{
                      asc: <span className="text-blue-500">▲</span>,
                      desc: <span className="text-blue-500">▼</span>,
                    }[header.column.getIsSorted()] ?? null}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr
              key={row.id}
              className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
              onClick={() => window.location.href = `/games/${row.original.id}`}
            >
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className="px-4 py-3 dark:text-gray-200">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function exportToCSV(games, filename) {
  const headers = ['Date', 'Away Team', 'Away Score', 'Home Team', 'Home Score', 'Status'];
  const rows = games.map(game => [
    game.gameDate,
    game.awayTeam_abbrev,
    game.awayTeam_score ?? '',
    game.homeTeam_abbrev,
    game.homeTeam_score ?? '',
    getGameStatus(game)
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

export default function Games({ games: initialGames, selectedDate, dateRange }) {
  const { user } = UseAuth();
  const router = useRouter();
  const [viewMode, setViewMode] = useState('cards');
  const [showAllDates, setShowAllDates] = useState(!!dateRange);
  const [games, setGames] = useState(initialGames);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(dateRange?.start || selectedDate);
  const [endDate, setEndDate] = useState(dateRange?.end || selectedDate);
  const [commentCounts, setCommentCounts] = useState({});

  // Sync games state when props change (on date navigation)
  useEffect(() => {
    setGames(initialGames);
  }, [initialGames]);

  useEffect(() => {
    async function fetchCommentCounts() {
      if (!user?.username || !games.length) {
        setCommentCounts({});
        return;
      }

      try {
        const response = await API.graphql(
          graphqlOperation(queries.listPosts, {
            limit: 1000,
            filter: {
              subject: {
                beginsWith: 'THREAD#GAME#',
              },
            },
          })
        );

        const posts = response?.data?.listPosts?.items || [];
        const gameIds = new Set(games.map((game) => String(game.id)));
        const counts = {};

        posts.forEach((post) => {
          if (post?._deleted) return;
          const subject = String(post?.subject || '');
          const parts = subject.split('#');
          const gameId = parts[2];

          if (!gameId || !gameIds.has(String(gameId))) return;
          counts[gameId] = (counts[gameId] || 0) + 1;
        });

        setCommentCounts(counts);
      } catch (error) {
        console.error('Error fetching thread comment counts:', error);
        setCommentCounts({});
      }
    }

    fetchCommentCounts();
  }, [games, user?.username]);

  const changeDate = (days) => {
    const date = new Date(selectedDate + 'T12:00:00');
    date.setDate(date.getDate() + days);
    const newDate = date.toISOString().split('T')[0];
    router.push(`/games?date=${newDate}`);
  };

  const toggleAllDates = async () => {
    if (!showAllDates) {
      setShowAllDates(true);
      setViewMode('table');
    } else {
      setShowAllDates(false);
      router.push(`/games?date=${selectedDate}`);
    }
  };

  const loadDateRange = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/games?startDate=${startDate}&endDate=${endDate}`);
      const data = await res.json();
      setGames(data.games || []);
    } catch (error) {
      console.error('Error fetching games:', error);
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <SEO
        title="NHL Games"
        description="View NHL game scores and schedules. Browse games by date and see live scores, final results, and upcoming matchups."
        path="/games"
      />

      {/* Controls Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        {/* Date Navigation */}
        {!showAllDates && (
          <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-4 w-full sm:w-auto">
            <button
              onClick={() => changeDate(-1)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full flex-shrink-0"
              aria-label="Previous day"
            >
              <FaChevronLeft className="w-5 h-5 dark:text-white" />
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => router.push(`/games?date=${e.target.value}`)}
              className="text-lg sm:text-xl font-bold dark:text-white text-center bg-transparent border-none cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-2 py-1 dark:[color-scheme:dark]"
            />
            <button
              onClick={() => changeDate(1)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full flex-shrink-0"
              aria-label="Next day"
            >
              <FaChevronRight className="w-5 h-5 dark:text-white" />
            </button>
          </div>
        )}

        {/* Date Range Picker */}
        {showAllDates && (
          <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2 py-1.5 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm w-32"
            />
            <span className="dark:text-white text-sm">–</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2 py-1.5 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm w-32"
            />
            <button
              onClick={loadDateRange}
              disabled={loading}
              className="px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 text-sm font-medium"
            >
              {loading ? '...' : 'Go'}
            </button>
          </div>
        )}

        {/* View Controls */}
        <div className="flex items-center justify-center sm:justify-end gap-2">
          <button
            onClick={toggleAllDates}
            className={`px-3 py-2 rounded text-sm font-medium whitespace-nowrap ${
              showAllDates
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {showAllDates ? 'Single Day' : 'Multi-Day'}
          </button>

          <div className="flex border rounded dark:border-gray-600">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 ${viewMode === 'cards' ? 'bg-blue-500 text-white' : 'dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              aria-label="Card view"
            >
              <FaTh className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 ${viewMode === 'table' ? 'bg-blue-500 text-white' : 'dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              aria-label="Table view"
            >
              <FaTable className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => exportToCSV(games, `nhl-games-${showAllDates ? `${startDate}-to-${endDate}` : selectedDate}.csv`)}
            className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
            aria-label="Export to CSV"
            title="Export to CSV"
          >
            <FaDownload className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Games Display */}
      {games.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-12">
          No games scheduled {showAllDates ? 'for this date range' : 'for this date'}
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              commentCount={commentCounts[String(game.id)] || 0}
              showCommentMeta={!!user?.username}
            />
          ))}
        </div>
      ) : (
        <GamesTable games={games} showDate={showAllDates} />
      )}
    </div>
  );
}

export async function getServerSideProps({ query, req }) {
  const selectedDate = query.date || new Date().toISOString().split('T')[0];
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host;
  const response = await fetch(`${protocol}://${host}/api/games?date=${selectedDate}`);
  const payload = response.ok ? await response.json() : {};
  const games = payload?.games || [];

  // Serialize Date objects to strings for JSON
  const serializedGames = games.map(game => ({
    ...game,
    gameDate: game.gameDate instanceof Date ? game.gameDate.toISOString().split('T')[0] : game.gameDate,
    startTimeUTC: game.startTimeUTC instanceof Date ? game.startTimeUTC.toISOString() : game.startTimeUTC,
  }));

  return {
    props: {
      games: serializedGames,
      selectedDate,
    },
  };
}
