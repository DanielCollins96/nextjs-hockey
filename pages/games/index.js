import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { getGamesByDate } from '../../lib/queries';
import SEO from '../../components/SEO';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

function formatDateForDisplay(dateString) {
  const date = new Date(dateString + 'T12:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
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

function GameCard({ game }) {
  const status = getGameStatus(game);
  const isLive = game.gameState === 'LIVE' || game.gameState === 'CRIT';
  const isScheduled = game.gameState === 'FUT' || game.gameState === 'PRE';

  return (
    <Link href={`/games/${game.id}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 cursor-pointer">
        <div className={`text-sm font-semibold mb-3 text-center ${isLive ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
          {status}
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

export default function Games({ games, selectedDate }) {
  const router = useRouter();

  const changeDate = (days) => {
    const date = new Date(selectedDate + 'T12:00:00');
    date.setDate(date.getDate() + days);
    const newDate = date.toISOString().split('T')[0];
    router.push(`/games?date=${newDate}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <SEO
        title="NHL Games"
        description="View NHL game scores and schedules. Browse games by date and see live scores, final results, and upcoming matchups."
        path="/games"
      />

      {/* Date Navigation */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <button
          onClick={() => changeDate(-1)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          aria-label="Previous day"
        >
          <FaChevronLeft className="w-5 h-5 dark:text-white" />
        </button>
        <h1 className="text-2xl font-bold dark:text-white text-center w-80">
          {formatDateForDisplay(selectedDate)}
        </h1>
        <button
          onClick={() => changeDate(1)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          aria-label="Next day"
        >
          <FaChevronRight className="w-5 h-5 dark:text-white" />
        </button>
      </div>

      {/* Games Grid */}
      {games.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-12">
          No games scheduled for this date
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </div>
  );
}

export async function getServerSideProps({ query }) {
  const selectedDate = query.date || new Date().toISOString().split('T')[0];
  const games = await getGamesByDate(selectedDate);

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
