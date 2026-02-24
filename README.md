## A React (Next.js) Hockey Website

This project uses Amplify (AWS) to implement user sign-in, and API functionality.

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## TODOs

- [ ] unit/integration tests (CI/CD Build)
- [ ] user file uploads
- [ ] add forum to team page, news stories, and games
- [ ] add tags to posts
- [ ] Caphit scrape to add to page

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

## API Testing Logic

This project includes integration tests for API replacement and caching behavior.

### Scripts

- `npm run test:api-replacement`
	- Starts a temporary Next.js dev server automatically (default port `3100`)
	- Waits for the server to be ready
	- Runs integration tests in `tests/api-replacement.test.mjs`
	- Shuts the temporary server down automatically (no lingering port)
- `npm run test:api-replacement:direct`
	- Runs tests directly with no server lifecycle management
	- Use this only if you already have a server running and set `TEST_BASE_URL`
- `npm run perf:compare`
	- Benchmarks all API endpoints against two deployments and prints a comparison table
	- See [Performance Comparison](#performance-comparison) below

### Environment Variables for Tests

- `TEST_PORT` (optional): port used by the auto-managed server (default: `3100`)
- `TEST_BASE_URL` (optional): base URL tests call (default: `http://localhost:${TEST_PORT}`)

### Notes

- The games detail test is conditionally skipped if no games exist for the selected date.
- Tests validate response shape and `Cache-Control` headers for the API routes.

## Performance Comparison

Use `npm run perf:compare` to benchmark all API endpoints between two deployments (e.g. the `main` branch on Vercel vs the `api-endpoints` branch on Vercel) and compare their response times side-by-side.

```sh
MAIN_URL=https://hockeydb.xyz \
BRANCH_URL=https://<branch-preview-url>.vercel.app \
ITERATIONS=5 \
npm run perf:compare
```

### Output

```
API Performance Comparison
  Main   : https://hockeydb.xyz
  Branch : https://<branch>.vercel.app
  Runs   : 5 per endpoint

──────────────────────────────────────────────────────────────────────────────────────
Endpoint                      ── MAIN ──────────────   ── BRANCH ────────────   avg Δ (branch vs main)
                              min     avg     p95      min     avg     p95
──────────────────────────────────────────────────────────────────────────────────────
GET /api/drafts                 45ms   52ms   58ms      38ms   41ms   47ms   -11ms (-21%)
GET /api/teams/rosters         310ms  340ms  380ms     120ms  135ms  160ms   -205ms (-60%)
...
```

- **Green** delta = branch is >50 ms faster than main
- **Red** delta = branch is >50 ms slower than main
- `[N err]` = N requests returned HTTP 5xx or failed to connect

### Environment Variables

| Variable     | Default                  | Description                                      |
|--------------|--------------------------|--------------------------------------------------|
| `MAIN_URL`   | `http://localhost:3000`  | Base URL for the first deployment (main)         |
| `BRANCH_URL` | `http://localhost:3001`  | Base URL for the second deployment (branch)      |
| `ITERATIONS` | `5`                      | Number of requests per endpoint (higher = more accurate) |
| `PLAYER_ID`  | `8478402`                | Player ID used in `/api/players/:id` test        |
| `TEAM_ID`    | `10`                     | Team ID used in `/api/teams/:id` test            |

## API Routes (Cached)

Public pages now load data through API routes instead of importing DB query functions directly.

### 12-hour cache (`s-maxage=43200`)

- `GET /api/players/:id` - Player profile, stats, awards
- `GET /api/players?q=<term>&limit=<n>` - Player search
- `GET /api/teams` - Team list
- `GET /api/teams/:id` - Team details, roster stats, records, playoff seasons
- `GET /api/teams/rosters` - Team + grouped active roster data
- `GET /api/seasons?year=<seasonId>` - Skater/goalie leaders + available seasons

### 24-hour cache (`s-maxage=86400`)

- `GET /api/drafts` - Draft year list
- `GET /api/drafts/:id` - Draft picks for a specific year
- `GET /api/players/ids` - Player IDs (for sitemap)
- `GET /api/teams/ids` - Team IDs (for sitemap)

### Short cache for frequently changing data

- `GET /api/games?date=<yyyy-mm-dd>` or `GET /api/games?startDate=<yyyy-mm-dd>&endDate=<yyyy-mm-dd>`
- `GET /api/games/:id`
- Cache policy: `s-maxage=300, stale-while-revalidate=3600`

## Amplify Stuff

### Commands

- `amplify console api`
- `amplify codegen`
- `amplify console api`
- `amplify mock api`
- `amplify env add`
- `amplify update auth`

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/import?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
