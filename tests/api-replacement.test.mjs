import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const PLAYER_ID = process.env.TEST_PLAYER_ID || '8478402';
const TEAM_ID = process.env.TEST_TEAM_ID || '10';

test('players API returns expected shape and 12-hour cache header', async () => {
  const response = await fetch(`${BASE_URL}/api/players/${PLAYER_ID}`);
  assert.equal(response.status, 200);

  const cacheControl = response.headers.get('cache-control') || '';
  assert.match(cacheControl, /s-maxage=43200/);

  const payload = await response.json();
  assert.ok(Array.isArray(payload.player), 'player should be an array');
  assert.ok(Array.isArray(payload.playerStats), 'playerStats should be an array');
  assert.ok(Array.isArray(payload.awards), 'awards should be an array');
});

test('teams API returns expected shape and 12-hour cache header', async () => {
  const response = await fetch(`${BASE_URL}/api/teams/${TEAM_ID}`);
  assert.equal(response.status, 200);

  const cacheControl = response.headers.get('cache-control') || '';
  assert.match(cacheControl, /s-maxage=43200/);

  const payload = await response.json();
  assert.ok(payload.team && typeof payload.team === 'object', 'team should be an object');
  assert.ok(Array.isArray(payload.teamRecords), 'teamRecords should be an array');
  assert.ok(Array.isArray(payload.skaters), 'skaters should be an array');
  assert.ok(Array.isArray(payload.goalies), 'goalies should be an array');
  assert.ok(Array.isArray(payload.playoffSeasons), 'playoffSeasons should be an array');
});

test('teams list API returns expected shape and 12-hour cache header', async () => {
  const response = await fetch(`${BASE_URL}/api/teams`);
  assert.equal(response.status, 200);

  const cacheControl = response.headers.get('cache-control') || '';
  assert.match(cacheControl, /s-maxage=43200/);

  const payload = await response.json();
  assert.ok(Array.isArray(payload.teams), 'teams should be an array');
});

test('player and team pages now reference API endpoints instead of direct query imports', async () => {
  const playersPage = await readFile(new URL('../pages/players/[id].js', import.meta.url), 'utf8');
  const teamsPage = await readFile(new URL('../pages/teams/[id].js', import.meta.url), 'utf8');

  assert.match(playersPage, /\/api\/players\//, 'players page should call players API');
  assert.match(teamsPage, /\/api\/teams\//, 'teams page should call teams API');

  assert.doesNotMatch(
    playersPage,
    /import\s*\{[^}]*getPlayer[^}]*\}\s*from\s*["']\.\.\/\.\.\/lib\/queries["']/,
    'players page should not import direct player queries'
  );

  assert.doesNotMatch(
    teamsPage,
    /from\s*["']\.\.\/\.\.\/lib\/queries["']/,
    'teams page should not import direct team queries'
  );
});
