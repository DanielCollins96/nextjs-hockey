import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SEO from '../../components/SEO';

function formatDate(dateString) {
  const date = new Date(dateString + 'T12:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function formatTime(utcString) {
  const date = new Date(utcString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
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
    return formatTime(game.startTimeUTC);
  }

  return state;
}

function TeamDisplay({ team, score, dbId, logo, isHome, isScheduled }) {
  const teamContent = (
    <div className="flex flex-col items-center">
      <div className="w-24 h-24 sm:w-32 sm:h-32 relative mb-2">
        <Image
          src={logo}
          alt={team}
          fill
          className="object-contain"
          unoptimized
        />
      </div>
      <span className="text-xl sm:text-2xl font-bold dark:text-white">{team}</span>
      {isHome && <span className="text-sm text-gray-500 dark:text-gray-400">HOME</span>}
    </div>
  );

  return (
    <div className="flex flex-col items-center">
      {dbId ? (
        <Link href={`/teams/${dbId}`} className="hover:opacity-80 transition-opacity">
          {teamContent}
        </Link>
      ) : (
        teamContent
      )}
      <div className={`text-5xl sm:text-6xl font-bold mt-4 ${!isScheduled ? 'dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>
        {!isScheduled ? score : '-'}
      </div>
    </div>
  );
}

export default function GamePage({ game }) {
  if (!game) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold dark:text-white">Game not found</h1>
        <Link href="/games" className="text-blue-500 hover:underline mt-4 inline-block">
          Back to Games
        </Link>
      </div>
    );
  }

  const status = getGameStatus(game);
  const isLive = game.gameState === 'LIVE' || game.gameState === 'CRIT';
  const isScheduled = game.gameState === 'FUT' || game.gameState === 'PRE';
  const pageTitle = `${game.awayTeam_abbrev} @ ${game.homeTeam_abbrev}`;

  return (
    <div className="container mx-auto px-4 py-8">
      <SEO
        title={pageTitle}
        description={`${game.awayTeam_abbrev} vs ${game.homeTeam_abbrev} - ${formatDate(game.gameDate)}. View game details and scores.`}
        path={`/games/${game.id}`}
      />

      {/* Back link */}
      <Link
        href={`/games?date=${game.gameDate}`}
        className="text-blue-500 hover:underline mb-6 inline-block"
      >
        &larr; Back to {formatDate(game.gameDate)}
      </Link>

      {/* Game Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8 mb-8">
        {/* Status */}
        <div className={`text-center text-lg font-semibold mb-6 ${isLive ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
          {status}
        </div>

        {/* Teams and Scores */}
        <div className="flex items-center justify-center gap-8 sm:gap-16">
          <TeamDisplay
            team={game.awayTeam_abbrev}
            score={game.awayTeam_score}
            dbId={game.awayTeam_dbId}
            logo={game.awayTeam_darkLogo || `https://assets.nhle.com/logos/nhl/svg/${game.awayTeam_abbrev}_dark.svg`}
            isHome={false}
            isScheduled={isScheduled}
          />

          <div className="text-3xl sm:text-4xl font-light text-gray-400 dark:text-gray-500">
            @
          </div>

          <TeamDisplay
            team={game.homeTeam_abbrev}
            score={game.homeTeam_score}
            dbId={game.homeTeam_dbId}
            logo={game.homeTeam_darkLogo || `https://assets.nhle.com/logos/nhl/svg/${game.homeTeam_abbrev}_dark.svg`}
            isHome={true}
            isScheduled={isScheduled}
          />
        </div>

        {/* Game Info */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-gray-600 dark:text-gray-300">
            {formatDate(game.gameDate)}
          </p>
          {isScheduled && (
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {formatTime(game.startTimeUTC)}
            </p>
          )}
          {game.gameCenterLink && (
            <a
              href={`https://www.nhl.com${game.gameCenterLink}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline mt-2 inline-block"
            >
              View on NHL.com
            </a>
          )}
        </div>
      </div>

      {/* Comments Section Placeholder */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold dark:text-white mb-4">Comments</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Comments coming soon...
        </p>
      </div>
    </div>
  );
}

export async function getServerSideProps({ params, req }) {
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host;

  const response = await fetch(`${protocol}://${host}/api/games/${params.id}`);
  const payload = response.ok ? await response.json() : {};
  const game = payload?.game || null;

  // Serialize Date objects to strings for JSON
  if (game) {
    if (game.gameDate instanceof Date) {
      game.gameDate = game.gameDate.toISOString().split('T')[0];
    }
    if (game.startTimeUTC instanceof Date) {
      game.startTimeUTC = game.startTimeUTC.toISOString();
    }
  }

  return {
    props: {
      game,
    },
  };
}
