# CLAUDE.md - Hockey Stats Application

## Project Overview
**hockeydb.xyz** - NHL statistics and roster management application featuring player/team data, draft history, and seasonal statistics.

**Tech Stack:** Next.js 13 | React 18 | PostgreSQL (Supabase) | Tailwind CSS | AWS Amplify (Auth) | TanStack Table | Recharts

## Quick Commands
```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Project Structure
```
pages/              # Next.js pages and API routes
  api/              # Backend endpoints (limited use - most data via SSR)
  players/          # Player list and detail pages
  teams/            # Team list and detail pages
  drafts/           # Draft year list and detail pages
components/         # React components
  Table.jsx         # TanStack table with sorting/footers
  PaginatedTable.jsx # Table with pagination and filtering
  TeamBox.jsx       # Collapsible team roster display
  Layout.js         # Page wrapper with header
  header.js         # Navigation (responsive with mobile sidebar)
lib/                # Database and utilities
  db.js             # PostgreSQL connection pool
  queries.js        # All database query functions
contexts/           # React Context (Auth.js for AWS Amplify)
styles/             # CSS (globals.css, modules)
```

## Database (Supabase PostgreSQL)

**Connection:** Supabase pooler at `aws-0-ca-central-1.pooler.supabase.com:6543`

**Schema:** All tables in `newapi` schema:
- `newapi.players` - Player bio (playerId, firstName, lastName, position)
- `newapi.season_skater` - Skater seasonal stats (goals, assists, points)
- `newapi.season_goalie` - Goalie seasonal stats (wins, GAA, save%)
- `newapi.teams` - Team info (id, triCode, fullName, active)
- `newapi.team_season` - Historical team records
- `newapi.rosters_active` - Current active rosters
- `newapi.drafts` - Draft history with picks

**Key Query Functions** (lib/queries.js):
- `getPlayerStats(id, position)` - Player seasonal stats
- `getPlayer(id)` - Player bio + draft info
- `getTeamSkaters(id)` / `getTeamGoalies(id)` - Team roster stats
- `getDraft(seasonId)` - Draft picks with career stats
- `getPointLeadersBySeason(season)` - Top scorers by season

## Key Patterns

**Data Fetching:** Uses `getServerSideProps` and `getStaticProps` for SSR/SSG. Direct database queries via lib/queries.js - minimal API route usage.

**Tables:** TanStack React Table v8 with column definitions including:
- `accessorKey` / `accessorFn` for data access
- `cell` for custom rendering
- `footer` for aggregate calculations
- Sorting enabled by default

**Styling:** Tailwind CSS with dark mode support (class-based). Dark mode toggle in header.

**Auth:** AWS Amplify Cognito via contexts/Auth.js. Methods: `signUp`, `signIn`, `logout`, `currentAuthenticatedUser`

## Environment Variables (.env.local)
```
DB_URL=aws-0-ca-central-1.pooler.supabase.com
DB_USER=postgres.lxcmlufcsxsdgwjptvgg
DB_PASS=<password>
DB_NAME=postgres
PORT=6543
```

## Important Files
- [lib/queries.js](lib/queries.js) - All database queries (modify here for data changes)
- [lib/db.js](lib/db.js) - Database connection pool config
- [pages/teams/[id].js](pages/teams/[id].js) - Team detail page with roster/charts
- [pages/players/[id].js](pages/players/[id].js) - Player profile with stats
- [components/Table.jsx](components/Table.jsx) - Reusable stats table component
- [next.config.js](next.config.js) - Next.js config with Sentry/image domains

## External APIs
- Player headshots: `https://assets.nhle.com/mugs/nhl/20232024/{team}/{playerId}.png`
- Team logos: `https://assets.nhle.com/logos/nhl/svg/{triCode}_dark.svg`

## Recent Work
- Fixed `is_active` filter in queries
- Updated draft query and table
- Replaced old `player_stats` table with new queries
- Updated players page for leading scorers

## Incomplete Features (from README)
- Playoff Stats pages
- Player search page (all players by name/team)
- Unit/integration tests
- Forum on team pages
- Caphit scrape integration
