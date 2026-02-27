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

test('players search API returns expected shape and 12-hour cache header', async () => {
  const response = await fetch(`${BASE_URL}/api/players?q=McDavid&limit=10`);
  assert.equal(response.status, 200);

  const cacheControl = response.headers.get('cache-control') || '';
  assert.match(cacheControl, /s-maxage=43200/);

  const payload = await response.json();
  assert.ok(Array.isArray(payload.players), 'players should be an array');
});

test('teams rosters API returns expected shape and 12-hour cache header', async () => {
  const response = await fetch(`${BASE_URL}/api/teams/rosters`);
  assert.equal(response.status, 200);

  const cacheControl = response.headers.get('cache-control') || '';
  assert.match(cacheControl, /s-maxage=43200/);

  const payload = await response.json();
  assert.ok(Array.isArray(payload.rosters), 'rosters should be an array');
});

test('seasons API returns expected shape and 12-hour cache header', async () => {
  const response = await fetch(`${BASE_URL}/api/seasons?year=20232024`);
  assert.equal(response.status, 200);

  const cacheControl = response.headers.get('cache-control') || '';
  assert.match(cacheControl, /s-maxage=43200/);

  const payload = await response.json();
  assert.ok(Array.isArray(payload.players), 'players should be an array');
  assert.ok(Array.isArray(payload.goalies), 'goalies should be an array');
  assert.ok(Array.isArray(payload.availableSeasons), 'availableSeasons should be an array');
});

test('draft years API returns expected shape and 24-hour cache header', async () => {
  const response = await fetch(`${BASE_URL}/api/drafts`);
  assert.equal(response.status, 200);

  const cacheControl = response.headers.get('cache-control') || '';
  assert.match(cacheControl, /s-maxage=86400/);

  const payload = await response.json();
  assert.ok(Array.isArray(payload.years), 'years should be an array');
});

test('draft by year API returns expected shape and 24-hour cache header', async () => {
  const yearsResponse = await fetch(`${BASE_URL}/api/drafts`);
  assert.equal(yearsResponse.status, 200);
  const yearsPayload = await yearsResponse.json();
  assert.ok(Array.isArray(yearsPayload.years) && yearsPayload.years.length > 0, 'years should include at least one draft year');

  const draftYear = yearsPayload.years[0]?.draftYear;
  assert.ok(draftYear, 'draftYear should be present');

  const response = await fetch(`${BASE_URL}/api/drafts/${draftYear}`);
  assert.equal(response.status, 200);

  const cacheControl = response.headers.get('cache-control') || '';
  assert.match(cacheControl, /s-maxage=86400/);

  const payload = await response.json();
  assert.ok(Array.isArray(payload.draft), 'draft should be an array');
});

test('IDs APIs return expected shape and 24-hour cache header', async () => {
  const [playersResp, teamsResp] = await Promise.all([
    fetch(`${BASE_URL}/api/players/ids`),
    fetch(`${BASE_URL}/api/teams/ids`),
  ]);

  assert.equal(playersResp.status, 200);
  assert.equal(teamsResp.status, 200);

  assert.match(playersResp.headers.get('cache-control') || '', /s-maxage=86400/);
  assert.match(teamsResp.headers.get('cache-control') || '', /s-maxage=86400/);

  const playersPayload = await playersResp.json();
  const teamsPayload = await teamsResp.json();
  assert.ok(Array.isArray(playersPayload.playerIds), 'playerIds should be an array');
  assert.ok(Array.isArray(teamsPayload.teamIds), 'teamIds should be an array');
});

test('games APIs return expected shape and cache headers', async (t) => {
  const date = new Date().toISOString().split('T')[0];
  const listResp = await fetch(`${BASE_URL}/api/games?date=${date}`);
  assert.equal(listResp.status, 200);
  assert.match(listResp.headers.get('cache-control') || '', /s-maxage=300/);

  const listPayload = await listResp.json();
  assert.ok(Array.isArray(listPayload.games), 'games should be an array');

  if (listPayload.games.length === 0) {
    t.skip('No games found for selected date to validate /api/games/[id]');
    return;
  }

  const gameId = listPayload.games[0]?.id;
  const detailResp = await fetch(`${BASE_URL}/api/games/${gameId}`);
  assert.equal(detailResp.status, 200);
  assert.match(detailResp.headers.get('cache-control') || '', /s-maxage=300/);

  const detailPayload = await detailResp.json();
  assert.ok(detailPayload.game && typeof detailPayload.game === 'object', 'game should be an object');
});

test('public pages use API paths and avoid direct query imports', async () => {
  const pagePaths = [
    '../pages/index.js',
    '../pages/players/index.js',
    '../pages/players/[id].js',
    '../pages/teams/index.js',
    '../pages/teams/[id].js',
    '../pages/drafts/index.js',
    '../pages/drafts/[id].js',
    '../pages/games/index.js',
    '../pages/games/[id].js',
    '../pages/seasons/index.js',
    '../pages/sitemap.xml.js',
  ];

  for (const pagePath of pagePaths) {
    const content = await readFile(new URL(pagePath, import.meta.url), 'utf8');
    assert.doesNotMatch(
      content,
      /from\s*["'][\.\/]+lib\/queries["']/,
      `${pagePath} should not import direct DB queries`
    );
    assert.match(content, /\/api\//, `${pagePath} should call at least one API path`);
  }
});
