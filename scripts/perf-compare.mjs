/**
 * perf-compare.mjs
 *
 * Compare API endpoint response times between two deployments.
 *
 * Usage:
 *   MAIN_URL=https://hockeydb.xyz BRANCH_URL=https://branch.vercel.app node scripts/perf-compare.mjs
 *
 * Options (env vars):
 *   MAIN_URL       Base URL for the first deployment  (default: http://localhost:3000)
 *   BRANCH_URL     Base URL for the second deployment (default: http://localhost:3001)
 *   ITERATIONS     Number of requests per endpoint    (default: 5)
 *   PLAYER_ID      Player ID to use in player tests   (default: 8478402)
 *   TEAM_ID        Team ID to use in team tests        (default: 10)
 */

import process from 'node:process';

const MAIN_URL    = (process.env.MAIN_URL    || 'http://localhost:3000').replace(/\/$/, '');
const BRANCH_URL  = (process.env.BRANCH_URL  || 'http://localhost:3001').replace(/\/$/, '');
const ITERATIONS  = Math.max(1, parseInt(process.env.ITERATIONS  || '5', 10));
const PLAYER_ID   = process.env.PLAYER_ID  || '8478402';
const TEAM_ID     = process.env.TEAM_ID    || '10';

const ENDPOINTS = [
  { label: 'GET /api/drafts',                   path: '/api/drafts' },
  { label: `GET /api/drafts/:year`,             path: '/api/drafts/2023' },
  { label: `GET /api/players?q=McDavid`,        path: '/api/players?q=McDavid&limit=10' },
  { label: `GET /api/players/:id`,              path: `/api/players/${PLAYER_ID}` },
  { label: 'GET /api/players/ids',              path: '/api/players/ids' },
  { label: 'GET /api/teams',                    path: '/api/teams' },
  { label: `GET /api/teams/:id`,                path: `/api/teams/${TEAM_ID}` },
  { label: 'GET /api/teams/ids',                path: '/api/teams/ids' },
  { label: 'GET /api/teams/rosters',            path: '/api/teams/rosters' },
  { label: 'GET /api/seasons?year=20232024',    path: '/api/seasons?year=20232024' },
  { label: `GET /api/games?date=<today>`,       path: `/api/games?date=${new Date().toISOString().split('T')[0]}` },
];

// ── helpers ──────────────────────────────────────────────────────────────────

function percentile(sorted, p) {
  if (sorted.length === 0) return NaN;
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.min(Math.max(idx, 0), sorted.length - 1)];
}

function stats(times) {
  if (times.length === 0) return { min: NaN, avg: NaN, p95: NaN, max: NaN };
  const sorted = [...times].sort((a, b) => a - b);
  const sum = sorted.reduce((a, b) => a + b, 0);
  return {
    min: sorted[0],
    avg: Math.round(sum / sorted.length),
    p95: percentile(sorted, 95),
    max: sorted[sorted.length - 1],
  };
}

async function measureOnce(url) {
  // Append a cache-busting parameter so CDN/proxy caches don't serve stale responses
  const sep = url.includes('?') ? '&' : '?';
  const bust = `${sep}_perf=${Date.now()}`;
  const start = performance.now();
  let status = 0;
  try {
    const res = await fetch(`${url}${bust}`);
    status = res.status;
    await res.arrayBuffer(); // consume body so connection is properly closed
  } catch {
    status = -1;
  }
  const elapsed = Math.round(performance.now() - start);
  return { elapsed, status };
}

async function benchmark(baseUrl, path) {
  const url = `${baseUrl}${path}`;
  const times = [];
  const errors = [];

  for (let i = 0; i < ITERATIONS; i++) {
    const { elapsed, status } = await measureOnce(url);
    if (status === -1 || status >= 500) {
      errors.push(status);
    } else {
      times.push(elapsed);
    }
  }

  return { ...stats(times), errors: errors.length, samples: times.length };
}

// ── formatting ────────────────────────────────────────────────────────────────

const COL = {
  label:  28,
  stat:    7,
  delta:   8,
};

function pad(str, len, right = false) {
  const s = String(str);
  return right ? s.padStart(len) : s.padEnd(len);
}

function fmtMs(n) {
  if (isNaN(n)) return '  —  ';
  return `${n}ms`;
}

function fmtDelta(main, branch) {
  if (isNaN(main) || isNaN(branch)) return '   —  ';
  const diff = branch - main;
  const sign = diff > 0 ? '+' : '';
  const pct  = main === 0 ? '∞' : `${sign}${Math.round((diff / main) * 100)}%`;
  return `${sign}${diff}ms (${pct})`;
}

function colorDelta(main, branch, text) {
  if (isNaN(main) || isNaN(branch)) return text;
  const diff = branch - main;
  if (diff > 50)  return `\x1b[31m${text}\x1b[0m`; // red  – branch slower
  if (diff < -50) return `\x1b[32m${text}\x1b[0m`; // green – branch faster
  return text;
}

function hr(char = '─') {
  return char.repeat(COL.label + 2 + (COL.stat + 1) * 3 * 2 + COL.delta + 5);
}

function header() {
  const c = (s, w) => pad(s, w, true);
  return [
    pad('Endpoint', COL.label),
    '  ',
    [c('min', COL.stat), c('avg', COL.stat), c('p95', COL.stat)].join(' '),
    '  ',
    [c('min', COL.stat), c('avg', COL.stat), c('p95', COL.stat)].join(' '),
    '  ',
    pad('avg Δ (branch)', COL.delta + 6),
  ].join('');
}

function row(label, main, branch) {
  const c = (s, w) => pad(s, w, true);
  const delta = fmtDelta(main.avg, branch.avg);
  const colored = colorDelta(main.avg, branch.avg, delta);
  const errNote = (r) => r.errors > 0 ? ` [${r.errors} err]` : '';

  return [
    pad(label, COL.label),
    '  ',
    [c(fmtMs(main.min),  COL.stat), c(fmtMs(main.avg),  COL.stat), c(fmtMs(main.p95),  COL.stat)].join(' ') + errNote(main),
    '  ',
    [c(fmtMs(branch.min), COL.stat), c(fmtMs(branch.avg), COL.stat), c(fmtMs(branch.p95), COL.stat)].join(' ') + errNote(branch),
    '  ',
    colored,
  ].join('');
}

// ── main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n\x1b[1mAPI Performance Comparison\x1b[0m');
  console.log(`  Main   : ${MAIN_URL}`);
  console.log(`  Branch : ${BRANCH_URL}`);
  console.log(`  Runs   : ${ITERATIONS} per endpoint\n`);

  console.log(hr());
  const colHead = (s) => `\x1b[1m${s}\x1b[0m`;
  console.log(
    `${pad('Endpoint', COL.label)}  ` +
    `${colHead(pad('── MAIN ──────────────', COL.stat * 3 + 2, false))}  ` +
    `${colHead(pad('── BRANCH ────────────', COL.stat * 3 + 2, false))}  ` +
    `${colHead('avg Δ (branch vs main)')}`
  );
  console.log(`${pad('', COL.label)}  ${pad('min     avg     p95', COL.stat * 3 + 2)}  ${pad('min     avg     p95', COL.stat * 3 + 2)}`);
  console.log(hr());

  const isTTY = process.stderr.isTTY;
  const results = [];
  for (const ep of ENDPOINTS) {
    if (isTTY) process.stderr.write(`  Benchmarking ${ep.label}…`);
    const [mainStats, branchStats] = await Promise.all([
      benchmark(MAIN_URL,   ep.path),
      benchmark(BRANCH_URL, ep.path),
    ]);
    if (isTTY) process.stderr.write('\r\x1b[K');
    console.log(row(ep.label, mainStats, branchStats));
    results.push({ label: ep.label, main: mainStats, branch: branchStats });
  }

  console.log(hr());

  // Summary line: overall averages
  const mainAvgs   = results.map(r => r.main.avg).filter(n => !isNaN(n));
  const branchAvgs = results.map(r => r.branch.avg).filter(n => !isNaN(n));
  if (mainAvgs.length && branchAvgs.length) {
    const overallMain   = Math.round(mainAvgs.reduce((a,b) => a+b,0) / mainAvgs.length);
    const overallBranch = Math.round(branchAvgs.reduce((a,b) => a+b,0) / branchAvgs.length);
    const delta = overallBranch - overallMain;
    const sign  = delta > 0 ? '+' : '';
    console.log(`\n  Overall avg  →  main: ${overallMain}ms  branch: ${overallBranch}ms  Δ ${sign}${delta}ms\n`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
