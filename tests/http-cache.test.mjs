import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PAGE_CACHE, setPageCache } from '../lib/http-cache.js';

test('live cache policy is a short max-age with stale-while-revalidate', () => {
  assert.match(PAGE_CACHE.live, /public/);
  assert.match(PAGE_CACHE.live, /max-age=0/);
  assert.match(PAGE_CACHE.live, /s-maxage=300/);
  assert.match(PAGE_CACHE.live, /stale-while-revalidate=3600/);
});

test('shared cache policies keep an explicit max-age so Vercel cannot emit bare public', () => {
  for (const [name, policy] of Object.entries(PAGE_CACHE)) {
    if (name === 'error') {
      assert.match(policy, /no-store/);
      continue;
    }
    assert.match(policy, /max-age=\d+/, `${name} should include max-age`);
  }
});

test('daily and error policies stay suitable for ids/drafts and failures', () => {
  assert.match(PAGE_CACHE.daily, /s-maxage=86400/);
  assert.equal(PAGE_CACHE.error, 'private, no-store');
});

test('setPageCache writes Cache-Control and no-ops after headers are sent', () => {
  const headers = {};
  const res = {
    headersSent: false,
    setHeader(name, value) {
      headers[name] = value;
    },
  };

  setPageCache(res, PAGE_CACHE.live);
  assert.equal(headers['Cache-Control'], PAGE_CACHE.live);

  res.headersSent = true;
  setPageCache(res, PAGE_CACHE.error);
  assert.equal(headers['Cache-Control'], PAGE_CACHE.live);
});

test('S3 read-model fetches disable Next/Vercel fetch caching', async () => {
  const source = await readFile(new URL('../lib/read-models.js', import.meta.url), 'utf8');
  assert.match(source, /cache:\s*["']no-store["']/);
});

test('volatile player/team/game APIs use the live cache helper', async () => {
  const files = [
    '../pages/api/players/[id].js',
    '../pages/api/teams/[id].js',
    '../pages/api/teams/index.js',
    '../pages/api/teams/rosters.js',
    '../pages/api/games/[id].js',
    '../pages/api/games/index.js',
  ];

  for (const file of files) {
    const source = await readFile(new URL(file, import.meta.url), 'utf8');
    assert.match(source, /PAGE_CACHE\.live/, `${file} should set PAGE_CACHE.live`);
    assert.doesNotMatch(source, /s-maxage=43200/, `${file} should not use the 12-hour CDN TTL`);
  }
});
