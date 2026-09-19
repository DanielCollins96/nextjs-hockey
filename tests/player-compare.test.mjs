import test from 'node:test';
import assert from 'node:assert/strict';
import {
  awardCounts,
  canonicalComparePath,
  careerCompareRows,
  compareQueryIds,
  compareWinner,
  mergeNhlSeasons,
  normalizeCompareSlugs,
  seasonCellValue,
  seasonCompareColumns,
  shortPlayerName,
  sortSearchPlayers,
} from '../lib/player-compare.js';
import {
  careerTotals,
  formatDraft,
  formatHeight,
  formatWeight,
  isGoaliePosition,
  nhlSeasonsByYear,
} from '../lib/player-stats.js';
import { comparePlayersUrl, compareStartUrl, extractEntityId } from '../lib/routes.js';

const nhlRow = (overrides) => ({
  season: 20232024,
  'league.name': 'NHL',
  'team.name': 'Edmonton Oilers',
  'team.id': 22,
  'stat.games': 76,
  'stat.goals': 32,
  'stat.assists': 100,
  'stat.points': 132,
  'stat.plusMinus': 35,
  'stat.pim': 30,
  playoffGamesPlayed: 25,
  playoffGoals: 8,
  playoffAssists: 34,
  playoffPoints: 42,
  ...overrides,
});

const goalieRow = (overrides) => ({
  season: 20232024,
  'league.name': 'NHL',
  'team.name': 'Tampa Bay Lightning',
  'team.id': 14,
  'stat.games': 52,
  'stat.wins': 30,
  'stat.losses': 20,
  'stat.shutouts': 4,
  'stat.goalAgainstAverage': 2.5,
  'stat.savePercentage': 0.91,
  playoffGamesPlayed: 10,
  playoffWins: 6,
  ...overrides,
});

test('compare URLs follow the existing player slug style', () => {
  assert.equal(
    comparePlayersUrl('Connor McDavid', 8478402, 'Auston Matthews', 8479318),
    '/players/compare/connor-mcdavid-8478402/auston-matthews-8479318'
  );
  assert.equal(compareStartUrl('Connor McDavid', 8478402), '/players/compare/connor-mcdavid-8478402');
  assert.equal(extractEntityId('connor-mcdavid-8478402'), '8478402');
  assert.equal(shortPlayerName('Connor McDavid'), 'McDavid');
  assert.equal(shortPlayerName('Auston Matthews'), 'Matthews');
});

test('normalizeCompareSlugs and query aliases extract player ids', () => {
  assert.deepEqual(normalizeCompareSlugs(['connor-mcdavid-8478402', 'auston-matthews-8479318']), [
    { slug: 'connor-mcdavid-8478402', id: '8478402' },
    { slug: 'auston-matthews-8479318', id: '8479318' },
  ]);
  assert.deepEqual(compareQueryIds({ a: '8478402', b: '8479318' }), {
    left: '8478402',
    right: '8479318',
  });
  assert.equal(
    canonicalComparePath(
      { player_name: 'Connor McDavid', playerId: 8478402 },
      { player_name: 'Auston Matthews', playerId: 8479318 }
    ),
    '/players/compare/connor-mcdavid-8478402/auston-matthews-8479318'
  );
  assert.equal(
    canonicalComparePath(null, { player_name: 'Auston Matthews', playerId: 8479318 }),
    '/players/compare/auston-matthews-8479318'
  );
});

test('careerTotals sums NHL rows and ignores non-NHL seasons', () => {
  const totals = careerTotals([
    nhlRow(),
    nhlRow({
      season: 20222023,
      'stat.games': 82,
      'stat.goals': 64,
      'stat.assists': 89,
      'stat.points': 153,
      playoffPoints: 20,
    }),
    nhlRow({
      season: 20232024,
      'league.name': 'OHL',
      'stat.points': 999,
    }),
  ], false);

  assert.equal(totals.games, 158);
  assert.equal(totals.goals, 96);
  assert.equal(totals.assists, 189);
  assert.equal(totals.points, 285);
  assert.equal(totals.playoffPoints, 62);
});

test('careerTotals weights goalie rates by games played', () => {
  const totals = careerTotals([
    goalieRow({ 'stat.games': 60, 'stat.goalAgainstAverage': 2.0, 'stat.savePercentage': 0.92, 'stat.wins': 40 }),
    goalieRow({ season: 20222023, 'stat.games': 20, 'stat.goalAgainstAverage': 3.5, 'stat.savePercentage': 0.88, 'stat.wins': 8 }),
  ], true);

  assert.equal(totals.games, 80);
  assert.equal(totals.wins, 48);
  assert.equal(Number(totals.gaa.toFixed(3)), 2.375);
  assert.equal(Number(totals.savePct.toFixed(3)), 0.91);
});

test('mergeNhlSeasons aligns years and aggregates multi-team seasons', () => {
  const seasons = mergeNhlSeasons(
    [
      nhlRow({ season: 20232024, 'stat.points': 50, 'team.name': 'Team A' }),
      nhlRow({ season: 20232024, 'stat.points': 40, 'team.name': 'Team B', 'team.id': 10 }),
    ],
    [nhlRow({ season: 20232024, 'stat.points': 80 })]
  );

  assert.equal(seasons.length, 1);
  assert.equal(seasons[0].left['team.name'], '2TM');
  assert.equal(seasons[0].left['stat.points'], 90);
  assert.equal(seasons[0].right['stat.points'], 80);
});

test('compareWinner highlights higher counting stats and lower GAA', () => {
  assert.equal(compareWinner(132, 107), 'left');
  assert.equal(compareWinner(107, 132), 'right');
  assert.equal(compareWinner(100, 100), 'tie');
  assert.equal(compareWinner(2.1, 2.4, { lowerIsBetter: true }), 'left');
  assert.equal(compareWinner(null, 10), null);
});

test('same-position compare uses matching columns; mixed positions stay separate', () => {
  assert.equal(isGoaliePosition('G'), true);
  assert.equal(isGoaliePosition('C'), false);
  assert.deepEqual(careerCompareRows(false).map((row) => row.key).slice(0, 4), [
    'games',
    'goals',
    'assists',
    'points',
  ]);
  assert.deepEqual(careerCompareRows(true).map((row) => row.key).slice(0, 4), [
    'games',
    'wins',
    'losses',
    'gaa',
  ]);
  assert.ok(seasonCompareColumns(false).some((column) => column.key === 'points'));
  assert.ok(seasonCompareColumns(true).some((column) => column.key === 'savePct'));
});

test('seasonCellValue reads regular-season keys from aggregated rows', () => {
  const [season] = nhlSeasonsByYear([nhlRow()]);
  const pointsColumn = seasonCompareColumns(false).find((column) => column.key === 'points');
  assert.equal(seasonCellValue(season.row, pointsColumn), 132);
});

test('sortSearchPlayers prefers the same position and excludes the current player', () => {
  const players = sortSearchPlayers(
    [
      { id: 1, name: 'Skater', position: 'C', games: 900, points: 1000 },
      { id: 2, name: 'Goalie A', position: 'G', games: 200, points: 0 },
      { id: 3, name: 'Goalie B', position: 'G', games: 400, points: 0 },
      { id: 9, name: 'Current', position: 'G', games: 800, points: 0 },
    ],
    { excludeIds: [9], preferPosition: 'G' }
  );

  assert.deepEqual(players.map((player) => player.id), [3, 2, 1]);
});

test('awardCounts groups trophies and format helpers match player-page style', () => {
  assert.deepEqual(
    awardCounts([
      { trophy_default: 'Art Ross Trophy' },
      { trophy_default: 'Art Ross Trophy' },
      { trophy_default: 'Hart Memorial Trophy' },
    ]),
    [
      { name: 'Art Ross Trophy', count: 2 },
      { name: 'Hart Memorial Trophy', count: 1 },
    ]
  );

  assert.equal(
    formatHeight({ heightInInches: 74 }),
    '6\'2"'
  );
  assert.equal(formatWeight({ weightInPounds: 190 }), '190 lb');
  assert.equal(
    formatDraft({ draft_seasons: [2015], displayAbbrev: 'EDM', ordinalPick: '1st' }),
    '2015, EDM (1st overall)'
  );
  assert.equal(formatDraft({ draft_seasons: [] }), 'Undrafted');
});
