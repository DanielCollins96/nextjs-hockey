import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SEO from '../../components/SEO';
import ThreadMessageBoard from '../../components/ThreadMessageBoard';
import { playerUrl, teamUrl } from '../../lib/routes';

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

function formatGoalPeriod(goal) {
  if (goal.period_type === 'OT') return 'OT';
  if (goal.period_type === 'SO') return 'SO';
  return `P${goal.period_number}`;
}

function formatGoalMinute(goal) {
  if (goal.period_type === 'SO') return 'SO';

  const [minutePart, secondPart] = String(goal.time_in_period || '').split(':');
  const minute = Number(minutePart);
  const second = Number(secondPart);

  if (!Number.isFinite(minute) || !Number.isFinite(second)) {
    return formatGoalTimeFallback(goal);
  }

  const displayMinute = minute + (second > 0 ? 1 : 0);
  if (goal.period_type === 'OT') return `OT ${displayMinute}'`;

  const period = Number(goal.period_number) || 1;
  const elapsedMinute = ((period - 1) * 20) + displayMinute;
  return `${elapsedMinute}'`;
}

function formatGoalTimeFallback(goal) {
  return `${formatGoalPeriod(goal)} ${goal.time_in_period}`;
}

function TeamDisplay({ team, score, shots, dbId, logo, isHome, isScheduled }) {
  const teamContent = (
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 sm:w-16 sm:h-16 relative mb-1">
        <Image
          src={logo}
          alt={team}
          fill
          className="object-contain"
          unoptimized
        />
      </div>
      <span className="text-sm sm:text-base font-bold dark:text-white">{team}</span>
      {isHome && <span className="text-xs text-gray-500 dark:text-gray-400">HOME</span>}
    </div>
  );

  return (
    <div className="flex flex-col items-center">
      {dbId ? (
        <Link href={teamUrl(team, dbId)} className="hover:opacity-80 transition-opacity">
          {teamContent}
        </Link>
      ) : (
        teamContent
      )}
      <div className={`text-3xl sm:text-4xl font-bold mt-1 ${!isScheduled ? 'dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>
        {!isScheduled ? score : '-'}
      </div>
      {!isScheduled && shots != null && (
        <div className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          {shots} shots
        </div>
      )}
    </div>
  );
}

function TeamScorers({ goals, align = 'left' }) {
  if (!goals?.length) return null;

  return (
    <div className={`space-y-1 text-sm text-gray-600 dark:text-gray-300 ${align === 'right' ? 'text-right' : 'text-left'}`}>
      {goals.map((goal) => (
        <div key={`${goal.period_number}-${goal.time_in_period}-${goal.event_id}`} className="truncate">
          <span className="font-medium">{goal.scoring_player_name}</span>
          <span className="ml-1 text-gray-500 dark:text-gray-400">{formatGoalMinute(goal)}</span>
        </div>
      ))}
    </div>
  );
}

function ScoringLine({ goals }) {
  if (!goals?.length) return null;

  const awayGoals = goals.filter((goal) => !goal.is_home);
  const homeGoals = goals.filter((goal) => goal.is_home);

  return (
    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
      <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-3">
        <TeamScorers goals={awayGoals} align="left" />
        <div className="mt-0.5 text-gray-400 dark:text-gray-500 text-sm" aria-hidden="true">
          &#9679;
        </div>
        <TeamScorers goals={homeGoals} align="right" />
      </div>
    </div>
  );
}

function GoalSummary({ goals }) {
  if (!goals?.length) return null;

  return (
    <section>
      <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
        Goals
      </h2>
      <div className="space-y-2">
        {goals.map((goal) => {
          const assists = [goal.assist1_player_name, goal.assist2_player_name].filter(Boolean);

          return (
            <div
              key={`${goal.period_number}-${goal.time_in_period}-${goal.event_id}`}
              className="grid grid-cols-[auto_1fr_auto] items-center gap-3 text-sm"
            >
              <div className="text-gray-500 dark:text-gray-400 whitespace-nowrap">
                {formatGoalPeriod(goal)} {goal.time_in_period}
              </div>
              <div className="min-w-0">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {goal.team_abbrev} {goal.scoring_player_name}
                </span>
                {goal.strength && (
                  <span className="ml-1 uppercase text-xs text-gray-500 dark:text-gray-400">
                    {goal.strength}
                  </span>
                )}
                {assists.length > 0 && (
                  <div className="truncate text-xs text-gray-500 dark:text-gray-400">
                    Assists: {assists.join(', ')}
                  </div>
                )}
              </div>
              <div className="font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap">
                {goal.away_score}-{goal.home_score}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function formatPenaltyDescription(value) {
  if (!value) return 'Penalty';
  return String(value)
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function PenaltySummary({ penalties }) {
  if (!penalties?.length) return null;

  return (
    <section>
      <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
        Penalties
      </h2>
      <div className="space-y-2">
        {penalties.map((penalty) => (
          <div
            key={`${penalty.period_number}-${penalty.time_in_period}-${penalty.team_abbrev}-${penalty.penalty_index}`}
            className="grid grid-cols-[auto_1fr_auto] items-center gap-3 text-sm"
          >
            <div className="text-gray-500 dark:text-gray-400 whitespace-nowrap">
              {formatGoalPeriod(penalty)} {penalty.time_in_period}
            </div>
            <div className="min-w-0">
              <span className="font-semibold text-gray-900 dark:text-white">
                {penalty.team_abbrev} {penalty.committed_by_player_name || penalty.served_by_name || 'Team penalty'}
              </span>
              <div className="truncate text-xs text-gray-500 dark:text-gray-400">
                {formatPenaltyDescription(penalty.desc_key)} {penalty.penalty_type ? `(${penalty.penalty_type})` : ''}
              </div>
            </div>
            <div className="font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap">
              {penalty.duration} min
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ThreeStars({ threeStars }) {
  if (!threeStars?.length) return null;

  return (
    <div>
      <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2 text-center lg:text-left">
        3 Stars
      </h2>
      <div className="grid grid-cols-3 lg:grid-cols-1 gap-2">
        {threeStars.map((player) => (
          <Link
            key={`${player.star}-${player.player_id}`}
            href={playerUrl(player.player_name, player.player_id)}
            className="rounded-md border border-gray-200 dark:border-gray-700 px-2 py-2 text-center lg:text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              {player.star === 1 ? '1st Star' : player.star === 2 ? '2nd Star' : '3rd Star'}
            </div>
            <div className="mt-0.5 text-sm font-semibold text-gray-900 dark:text-white truncate">
              {player.player_name}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {player.team_abbrev}
              {player.position ? ` | ${player.position}` : ''}
              {player.sweater_number ? ` | #${player.sweater_number}` : ''}
            </div>
            {(player.goals != null || player.assists != null || player.points != null) && (
              <div className="mt-0.5 text-xs text-gray-600 dark:text-gray-300">
                {player.goals ?? 0}G {player.assists ?? 0}A {player.points ?? 0}P
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function GamePage({ game, goals, penalties, threeStars }) {
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
  const hasGoals = goals?.length > 0;
  const hasPenalties = penalties?.length > 0;
  const eventGridClass = hasGoals && hasPenalties ? 'lg:grid-cols-2' : 'lg:grid-cols-1';

  return (
    <div className="container mx-auto px-4 py-5">
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 mb-5">
        {/* Status */}
        <div className={`text-center text-sm font-semibold mb-3 ${isLive ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
          {status}
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_260px] lg:items-center">
          <div>
            {/* Teams and Scores */}
            <div className="flex items-center justify-center gap-5 sm:gap-10">
              <TeamDisplay
                team={game.awayTeam_abbrev}
                score={game.awayTeam_score}
                shots={game.awayTeam_sog}
                dbId={game.awayTeam_dbId}
                logo={game.awayTeam_darkLogo || `https://assets.nhle.com/logos/nhl/svg/${game.awayTeam_abbrev}_dark.svg`}
                isHome={false}
                isScheduled={isScheduled}
              />

              <div className="text-xl sm:text-2xl font-light text-gray-400 dark:text-gray-500">
                @
              </div>

              <TeamDisplay
                team={game.homeTeam_abbrev}
                score={game.homeTeam_score}
                shots={game.homeTeam_sog}
                dbId={game.homeTeam_dbId}
                logo={game.homeTeam_darkLogo || `https://assets.nhle.com/logos/nhl/svg/${game.homeTeam_abbrev}_dark.svg`}
                isHome={true}
                isScheduled={isScheduled}
              />
            </div>

            <ScoringLine goals={goals} />

            {/* Game Info */}
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {formatDate(game.gameDate)}
              </p>
              {isScheduled && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {formatTime(game.startTimeUTC)}
                </p>
              )}
              {game.gameCenterLink && (
                <a
                  href={`https://www.nhl.com${game.gameCenterLink}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline mt-1 inline-block"
                >
                  View on NHL.com
                </a>
              )}
            </div>
          </div>

          <ThreeStars threeStars={threeStars} />
        </div>

        {(hasGoals || hasPenalties) && (
          <div className={`mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid gap-5 ${eventGridClass}`}>
            <GoalSummary goals={goals} />
            <PenaltySummary penalties={penalties} />
          </div>
        )}
      </div>

      <ThreadMessageBoard
        threadType="game"
        threadId={game.id}
        title={`${game.awayTeam_abbrev} @ ${game.homeTeam_abbrev} Game Thread`}
        emptyMessage="No posts yet for this game."
        anchorId="thread"
      />
    </div>
  );
}

export async function getServerSideProps({ params, req }) {
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host;

  const response = await fetch(`${protocol}://${host}/api/games/${params.id}`);
  const payload = response.ok ? await response.json() : {};
  const game = payload?.game || null;
  const goals = payload?.goals || [];
  const penalties = payload?.penalties || [];
  const threeStars = payload?.threeStars || [];

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
      goals,
      penalties,
      threeStars,
    },
  };
}
