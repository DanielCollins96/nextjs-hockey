# S3/CloudFront Read Models

Set `READ_MODEL_BASE_URL` to a CloudFront or S3 static website base URL. API routes will try these JSON files first and fall back to Postgres when a file is missing or the env var is not set.

Example:

```bash
READ_MODEL_BASE_URL=https://cdn.example.com/hockey-read-models
```

## First Payloads To Publish

These are the highest-value read models because they replace expensive joins and aggregations in `lib/queries.js`.

### `players/{playerId}.json`

Used by `GET /api/players/:id`.

```json
{
  "player": [],
  "playerStats": [],
  "awards": []
}
```

`player` comes from `getPlayer()`:

- `playerId`
- `player_name`
- `birthdate`
- `birthCountry`
- `position`
- `sweaterNumber`
- `shootsCatches`
- `displayAbbrev`
- `ordinalPick`
- `draft_seasons`
- `draft_position`

`playerStats` comes from `getPlayerStats()`:

- `season`
- `league.name`
- `team.id`
- `team.name`
- `stat.games`
- skaters: `stat.goals`, `stat.pim`, `stat.plusMinus`, `stat.points`, `stat.assists`
- goalies: `stat.wins`, `stat.losses`, `stat.goals`, `stat.savePercentage`, `stat.goalAgainstAverage`, `stat.shutouts`, `stat.pim`, `stat.otl`, `stat.assists`

`awards` comes from `getPlayerAwards()`:

- `playerId`
- `trophy_default`
- `seasonId`
- `gamesPlayed`
- `goals`
- `assists`
- `points`
- `plusMinus`
- `pim`

### `teams/{teamId}.json`

Used by `GET /api/teams/:id`.

```json
{
  "team": {},
  "teamRecords": [],
  "skaters": [],
  "goalies": [],
  "playoffSeasons": []
}
```

`team` comes from `getTeamInfo()`:

- `abbreviation`
- `fullName`

`teamRecords` comes from `getTeamSeasons()`:

- `seasonId`
- `wins`
- `losses`
- `points`
- `goalsAgainstPerGame`
- `goalsForPerGame`
- `row`
- `pointPct`
- `winsInShootout`
- `otLosses`

`skaters` comes from `getTeamSkaters()`:

- `id`
- `playerId`
- `season`
- `triCode`
- `fullName`
- `gamesPlayed`
- `playoffGamesPlayed`
- `goals`
- `playoffGoals`
- `assists`
- `playoffAssists`
- `points`
- `playoffPoints`
- `penaltyMinutes`
- `playoffPenaltyMinutes`
- `plusMinus`
- `playoffPlusMinus`
- `positionCode`

`goalies` comes from `getTeamGoalies()`:

- `id`
- `playerId`
- `season`
- `team`
- `fullName`
- `gamesPlayed`
- `playoffGamesPlayed`
- `goals`
- `playoffGoals`
- `assists`
- `playoffAssists`
- `points`
- `playoffPoints`
- `wins`
- `playoffWins`
- `losses`
- `playoffLosses`
- `goalsAgainstAverage`
- `playoffGoalsAgainstAverage`
- `savePercentage`
- `playoffSavePercentage`
- `penaltyMinutes`
- `playoffPenaltyMinutes`

`playoffSeasons` is an array of season values from `getPlayoffYears()`.

### `seasons/{seasonId}.json`

Used by `GET /api/seasons?year=`.

```json
{
  "season": 20252026,
  "players": [],
  "goalies": [],
  "availableSeasons": []
}
```

`players` comes from `getPointLeadersBySeason()`:

- `row_number`
- `player_name`
- `playerId`
- `position`
- `season`
- `team.name`
- `team.id`
- `stat.goals`
- `stat.games`
- `stat.assists`
- `stat.points`

`goalies` comes from `getGoalieLeadersBySeason()`:

- `row_number`
- `player_name`
- `playerId`
- `season`
- `team.name`
- `team.id`
- `stat.games`
- `stat.wins`
- `stat.losses`
- `stat.otl`
- `stat.gaa`
- `stat.savePct`
- `stat.shutouts`

`availableSeasons` is an array of season IDs from `getAvailableSeasons()`.

### `drafts/{draftYear}.json`

Used by `GET /api/drafts/:id`.

```json
{
  "draft": []
}
```

`draft` comes from `getDraft()`:

- `playerId`
- `overallPick`
- `pickInRound`
- `round`
- `playerName`
- `positionCode`
- `amateurLeague`
- `amateurClubName`
- `teamAbbrev`
- `teamId`
- `draftedByTeamId`
- `games`
- `goals`
- `assists`
- `points`
- `pim`
- `last_season`

## Index Payloads

### `indexes/teams.json`

Used by `GET /api/teams`.

```json
{
  "teams": [
    {
      "abbreviation": "EDM",
      "name": "Edmonton Oilers",
      "id": 22
    }
  ]
}
```

Fields come from `getTeams()`: `abbreviation`, `name`, `id`.

### `indexes/team-rosters.json`

Used by `GET /api/teams/rosters`.

```json
{
  "rosters": [
    {
      "team": {},
      "roster": {
        "forwards": [],
        "defensemen": [],
        "goalies": []
      }
    }
  ]
}
```

Each roster player should include:

- `position`
- `id`
- `sweaterNumber`
- `firstName`
- `lastName`

### `indexes/draft-years.json`

Used by `GET /api/drafts`.

```json
{
  "years": [
    {
      "draftYear": 2024
    }
  ]
}
```

### `indexes/player-ids.json`

Used by `GET /api/players/ids`.

```json
{
  "playerIds": [
    {
      "playerId": 8478402
    }
  ]
}
```

### `indexes/team-ids.json`

Used by `GET /api/teams/ids`.

```json
{
  "teamIds": [
    {
      "id": 22
    }
  ]
}
```

### `indexes/player-search/{bucket}.json`

Used by `GET /api/players?q=`.

Use one-character normalized search buckets, for example:

- `indexes/player-search/m.json`
- `indexes/player-search/c.json`

```json
{
  "players": []
}
```

Fields come from `searchPlayers()`:

- `playerId`
- `player_name`
- `position`
- `birthCountry`
- `team_abbrev`
- `team_id`
- `team_name`
- `games`
- `goals`
- `assists`
- `points`
- `wins`
- `losses`
- `last_season`
- `searchText`

The API requires at least two normalized query characters, loads the matching one-character bucket, filters by `searchText` or `player_name`, and applies the requested `limit`.

Recommended `searchText` value:

```text
connor mcdavid mcdavid connor edm edmonton oilers 8478402
```

To preserve useful matches without one huge file, duplicate a player into each bucket that should find them. For Connor McDavid, useful buckets would include at least:

- `c` from first name
- `m` from last name
- `e` from team/city if you want team-aware search

Queries shorter than two normalized characters return an empty result set instead of loading a broad index. Numeric-leading searches, including player ID searches, skip S3 search buckets and fall through to Postgres. This keeps the S3 object count to `a-z` buckets while avoiding a single all-player JSON file.
