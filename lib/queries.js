// Prefer Aurora Data API automatically when its required env vars are present.
const hasAuroraDataApiConfig = Boolean(
  process.env.AURORA_CLUSTER_ARN && process.env.AURORA_SECRET_ARN
);
const USE_AURORA =
  process.env.USE_AURORA === "true" ||
  (process.env.USE_AURORA !== "false" && hasAuroraDataApiConfig);

let pool;
if (USE_AURORA) {
  pool = (await import("./db-aurora.js")).default;
  console.log(
    hasAuroraDataApiConfig && process.env.USE_AURORA !== "true"
      ? "🔵 Using Aurora Serverless Data API (auto-detected from env)"
      : "🔵 Using Aurora Serverless Data API"
  );
} else {
  pool = (await import("./db.js")).default;
  console.log("🟢 Using PostgreSQL over TCP");
}

// Throws on connection/query failure instead of returning []. Shared data
// loaders propagate failures to their API/page callers, which decide how to
// represent the failure.
async function query(sql, params) {
  try {
    const result = await pool.query(sql, params);
    return result.rows;
  } catch (error) {
    console.error("Database query failed:", error);
    throw error;
  }
}

/**
 * @typedef {Object} PlayerSeasonStats
 * @property {string} season
 * @property {string} leagueName
 * @property {number} teamId
 * @property {string} teamName
 * @property {number} games
 * @property {number} wins
 * @property {number} losses
 * @property {number} goals
 * @property {number} savePercentage
 * @property {number} goalAgainstAverage
 * @property {number} shutouts
 * @property {number} pim
 * @property {number} plusMinus
 * @property {number} points
 * @property {number} assists
 */

/**
 * @param {number} id
 * @param {string} position
 * @returns {Promise<PlayerSeasonStats[]>}
 */
export async function getPlayerStats(id, position) {
  const sql =
    position === "G"
      ? `
        SELECT
            "season",
            "league.name",
            "team.id",
            "team.name",
            "stat.games",
            "stat.wins",
            "stat.losses",
            "stat.goals",
            "stat.savePercentage",
            "stat.goalAgainstAverage",
            "stat.shutouts",
            "stat.pim",
            "stat.otl",
            "stat.assists"
        FROM readmodel.player_goalie_stats
        WHERE "playerId" = $1`
      : `
        SELECT
            "season",
            "league.name",
            "team.id",
            "team.name",
            "stat.games",
            "stat.goals",
            "stat.pim",
            "stat.plusMinus",
            "stat.points",
            "stat.assists"
        FROM readmodel.player_skater_stats
        WHERE "playerId" = $1`;

  return query(sql, [id]);
}

/**
 * @param {number} id
 * @returns {Promise<Object[]>}
 */
export async function getPlayer(id) {
  return query(
    `
        SELECT
            "playerId",
            player_name,
            "birthDate" AS birthdate,
            "birthCountry",
            "position",
            "sweaterNumber",
            "shootsCatches",
            "heightInInches",
            "weightInPounds",
            "heightInCentimeters",
            "weightInKilograms",
            "displayAbbrev",
            "ordinalPick",
            draft_seasons,
            draft_position
        FROM readmodel.players
        WHERE "playerId" = $1
        `,
    [id]
  );
}

export async function getAllPlayerIds() {
  return query(`
        SELECT DISTINCT "playerId", player_name
        FROM readmodel.players
        `);
}

export async function getAllDraftYears() {
  return query(`
        SELECT DISTINCT "draftYear"
        FROM readmodel.draft_years
        ORDER BY "draftYear" desc
        `);
}

export async function getDraft(seasonId) {
  return query(
    `
      SELECT
          "playerId",
          "overallPick",
          "pickInRound",
          "round",
          "playerName",
          "positionCode",
          "amateurLeague",
          "amateurClubName",
          "teamAbbrev",
          "teamId",
          "draftedByTeamId",
          games,
          goals,
          assists,
          points,
          pim,
          last_season
      FROM readmodel.draft_picks
      WHERE "draftYear" = $1
      ORDER BY "overallPick" ASC
    `,
    [seasonId]
  );
}

export async function getDraftByTeam(teamId) {
  return query(
    `
      SELECT
          "draftYear",
          "playerId",
          "overallPick",
          "pickInRound",
          "round",
          "playerName",
          "positionCode",
          "amateurLeague",
          "amateurClubName",
          "teamAbbrev",
          "teamId",
          "draftedByTeamId",
          games,
          goals,
          assists,
          points,
          pim,
          last_season
      FROM readmodel.draft_picks
      WHERE COALESCE("draftedByTeamId", "teamId") = $1
      ORDER BY "draftYear" DESC, "overallPick" ASC
    `,
    [teamId]
  );
}

export async function getDraftTeams() {
  return query(`
      SELECT
          COALESCE("draftedByTeamId", "teamId") AS id,
          MAX("teamAbbrev") AS abbreviation,
          COUNT(*)::int AS "pickCount"
      FROM readmodel.draft_picks
      WHERE COALESCE("draftedByTeamId", "teamId") IS NOT NULL
      GROUP BY COALESCE("draftedByTeamId", "teamId")
      ORDER BY abbreviation ASC
  `);
}

export async function getTeams() {
  return query(`
        SELECT abbreviation, name, id
        FROM readmodel.teams;
        `);
}

export async function getTeamIds() {
  return query(`
        SELECT id, name
        FROM readmodel.teams
        `);
}

export async function getTeamInfo(id) {
  const rows = await query(
    `
        SELECT DISTINCT abbreviation, "fullName"
        FROM readmodel.team_info
        WHERE id = $1
        `,
    [id]
  );
  return rows[0] || null;
}

export async function getTeamSeasons(id) {
  return query(
    `
        SELECT "seasonId", "wins", "losses", "points"
        ,"goalsAgainstPerGame","goalsForPerGame", "row"
        , "pointPct", "winsInShootout", "otLosses"
        FROM readmodel.team_seasons
        WHERE "teamId" = $1
        ORDER BY "seasonId" desc 
        `,
    [id]
  );
}

export async function getTeamSkaters(id) {
  return query(
    `
SELECT DISTINCT
  s.id,
  s."playerId",
  s.season,
  s."triCode",
  s."fullName",
  s."gamesPlayed",
  s."playoffGamesPlayed",
  s."goals",
  s."playoffGoals",
  s."assists",
  s."playoffAssists",
  s."points",
  s."playoffPoints",
  s."penaltyMinutes",
  s."playoffPenaltyMinutes",
  s."plusMinus",
  s."playoffPlusMinus",
  s."positionCode",
  s."birthDate" AS birthdate,
  s."birthCountry",
  s.age
FROM readmodel.team_skaters s
WHERE s.id = $1;
        `,
    [id]
  );
}

export async function getTeamGoalies(id) {
  return query(
    `
SELECT DISTINCT
  g.id,
  g."playerId",
  g.season,
  g."team",
  g."fullName",
  g."gamesPlayed",
  g."playoffGamesPlayed",
  g."goals",
  g."playoffGoals",
  g."assists",
  g."playoffAssists",
  g."points",
  g."playoffPoints",
  g."wins",
  g."playoffWins",
  g."losses",
  g."playoffLosses",
  g."goalsAgainstAverage",
  g."playoffGoalsAgainstAverage",
  g."savePercentage",
  g."playoffSavePercentage",
  g."penaltyMinutes",
  g."playoffPenaltyMinutes",
  g."birthDate" AS birthdate,
  g."birthCountry",
  g.age
FROM readmodel.team_goalies g
WHERE g.id = $1;
        `,
    [id]
  );
}

export async function getPlayoffYears(abbreviation) {
  const rows = await query(
    `
        SELECT season
        FROM readmodel.team_playoff_years
        WHERE abbreviation = $1
        `,
    [abbreviation]
  );
  return rows.map((row) => row.season);
}

export async function getActiveRosters() {
  return query(`
        SELECT id, "teamAbbreviation", "positionGroup", "playerId", headshot, 
               "firstName", "lastName", "sweaterNumber", "positionCode", 
               "shootsCatches", "heightInInches", "weightInPounds", 
               "heightInCentimeters", "weightInKilograms", "birthDate", 
               "birthCity", "birthCountry", "birthStateProvince", active, 
               occurrence_number, data_hash, created_at, updated_at
        FROM readmodel.active_rosters;
        `);
}

export async function getAvailableSeasons() {
  const rows = await query(`
      SELECT DISTINCT season
      FROM readmodel.available_seasons
      ORDER BY season DESC
    `);
  return rows.map((row) => parseInt(row.season, 10));
}

function nhlGameTypeId(gameTypeId) {
  return Number(gameTypeId) === 3 ? 3 : 2;
}

export async function getPointLeadersBySeason(season = 20252026, gameTypeId = 2) {
  return query(
    `
      WITH skater_totals AS (
          SELECT
              s."playerId",
              s.season,
              SUM(s.goals) AS goals,
              SUM(s."gamesPlayed") AS "gamesPlayed",
              SUM(s.assists) AS assists,
              SUM(s.points) AS points,
              (ARRAY_AGG(s."teamName.default" ORDER BY s."gamesPlayed" DESC))[1] AS "teamName"
          FROM newapi.season_skater s
          WHERE s."leagueAbbrev" = 'NHL'
            AND s.is_active = true
            AND s.season = $1
            AND s."gameTypeId" = $2
          GROUP BY s."playerId", s.season
      ),
      goalie_totals AS (
          SELECT
              g."playerId",
              g.season,
              SUM(g.goals) AS goals,
              SUM(g."gamesPlayed") AS "gamesPlayed",
              SUM(g.assists) AS assists,
              (ARRAY_AGG(g."teamName.default" ORDER BY g."gamesPlayed" DESC))[1] AS "teamName"
          FROM newapi.season_goalie g
          WHERE g."leagueAbbrev" = 'NHL'
            AND g.is_active = true
            AND g.season = $1
            AND g."gameTypeId" = $2
          GROUP BY g."playerId", g.season
      ),
      combined AS (
          SELECT
              COALESCE(s."playerId", g."playerId") AS "playerId",
              COALESCE(s.season, g.season) AS season,
              COALESCE(s.goals, g.goals, 0) AS goals,
              COALESCE(s."gamesPlayed", g."gamesPlayed", 0) AS "gamesPlayed",
              COALESCE(s.assists, g.assists, 0) AS assists,
              COALESCE(s.points, (g.goals + g.assists), 0) AS points,
              COALESCE(s."teamName", g."teamName") AS "teamName"
          FROM skater_totals s
          FULL OUTER JOIN goalie_totals g
            ON s."playerId" = g."playerId"
           AND s.season = g.season
      ),
      ranked AS (
          SELECT
              ROW_NUMBER() OVER (
                  ORDER BY c.points DESC NULLS LAST, c.goals DESC NULLS LAST
              ) AS row_number,
              CONCAT(p."firstName", ' ', p."lastName") AS player_name,
              p."playerId",
              p."position",
              c.season,
              c."teamName" AS "team.name",
              c.goals AS "stat.goals",
              c."gamesPlayed" AS "stat.games",
              c.assists AS "stat.assists",
              c.points AS "stat.points",
              t.id AS "team.id",
              t.abbreviation AS "team.abbreviation"
          FROM combined c
          JOIN (
              SELECT DISTINCT ON ("playerId")
                  "playerId",
                  "firstName",
                  "lastName",
                  "position"
              FROM newapi.players
              ORDER BY "playerId"
          ) p ON p."playerId" = c."playerId"
          LEFT JOIN readmodel.teams t ON t.name = c."teamName"
      )
      SELECT *
      FROM ranked
      WHERE row_number <= 200
      ORDER BY row_number ASC;
    `,
    [season, nhlGameTypeId(gameTypeId)]
  );
}

export async function getGoalieLeadersBySeason(season = 20252026, gameTypeId = 2) {
  return query(
    `
      WITH goalie_totals AS (
          SELECT
              g."playerId",
              g.season,
              SUM(g."gamesPlayed") AS "gamesPlayed",
              SUM(g.wins) AS wins,
              SUM(g.losses) AS losses,
              SUM(g."otLosses") AS "otLosses",
              SUM(g."goalsAgainstAvg" * g."gamesPlayed") / NULLIF(SUM(g."gamesPlayed"), 0) AS "goalsAgainstAvg",
              SUM(g."savePctg" * g."gamesPlayed") / NULLIF(SUM(g."gamesPlayed"), 0) AS "savePctg",
              SUM(g.shutouts) AS shutouts,
              (ARRAY_AGG(g."teamName.default" ORDER BY g."gamesPlayed" DESC))[1] AS "teamName"
          FROM newapi.season_goalie g
          WHERE g."leagueAbbrev" = 'NHL'
            AND g.is_active = true
            AND g.season = $1
            AND g."gameTypeId" = $2
          GROUP BY g."playerId", g.season
      ),
      ranked AS (
          SELECT
              ROW_NUMBER() OVER (
                  ORDER BY g.wins DESC NULLS LAST, g."savePctg" DESC NULLS LAST
              ) AS row_number,
              CONCAT(p."firstName", ' ', p."lastName") AS player_name,
              p."playerId",
              g.season,
              g."teamName" AS "team.name",
              g."gamesPlayed" AS "stat.games",
              g.wins AS "stat.wins",
              g.losses AS "stat.losses",
              g."otLosses" AS "stat.otl",
              g."goalsAgainstAvg" AS "stat.gaa",
              g."savePctg" AS "stat.savePct",
              g.shutouts AS "stat.shutouts",
              t.id AS "team.id",
              t.abbreviation AS "team.abbreviation"
          FROM goalie_totals g
          JOIN (
              SELECT DISTINCT ON ("playerId")
                  "playerId",
                  "firstName",
                  "lastName"
              FROM newapi.players
              ORDER BY "playerId"
          ) p ON p."playerId" = g."playerId"
          LEFT JOIN readmodel.teams t ON t.name = g."teamName"
      )
      SELECT *
      FROM ranked
      WHERE row_number <= 100
      ORDER BY row_number ASC;
    `,
    [season, nhlGameTypeId(gameTypeId)]
  );
}

export async function getSeasonAwards(season) {
  return query(
    `
      SELECT
        awards.trophy_default,
        awards."seasonId",
        awards."playerId",
        players.player_name
      FROM readmodel.player_awards awards
      LEFT JOIN readmodel.players players ON players."playerId" = awards."playerId"
      WHERE awards."seasonId" = $1
      ORDER BY awards.trophy_default, players.player_name;
    `,
    [season]
  );
}

export async function getPlayerAwards(playerId) {
  return query(
    `
      SELECT
        "playerId",
        trophy_default,
        "seasonId",
        "gamesPlayed",
        goals,
        assists,
        points,
        "plusMinus",
        pim
      FROM readmodel.player_awards
      WHERE "playerId" = $1
      ORDER BY "seasonId" DESC;
    `,
    [playerId]
  );
}

export async function getSitemapPlayers(minGames = 1) {
  return query(
    `
      SELECT "playerId", player_name, games
      FROM readmodel.player_search
      WHERE COALESCE(games, 0) >= $1
    `,
    [minGames]
  );
}

export async function getPlayerSimilarityCorpus(minGames = 1) {
  return query(
    `
      SELECT DISTINCT ON (s."playerId")
        s."playerId",
        s.player_name,
        s."position",
        s.team_name,
        s.team_abbrev,
        s.games,
        s.goals,
        s.assists,
        s.points,
        s.wins,
        s.losses,
        s.last_season,
        p."heightInInches",
        p."weightInPounds",
        p."heightInCentimeters",
        p."weightInKilograms"
      FROM readmodel.player_search s
      LEFT JOIN readmodel.players p ON p."playerId" = s."playerId"
      WHERE COALESCE(s.games, 0) >= $1
      ORDER BY
        s."playerId",
        (p."heightInInches" IS NULL AND p."heightInCentimeters" IS NULL),
        (p."weightInPounds" IS NULL AND p."weightInKilograms" IS NULL),
        COALESCE(s.games, 0) DESC
    `,
    [minGames]
  );
}

export async function searchPlayers(searchTerm = "", limit = 100) {
  return query(
    `
      SELECT
        "playerId",
        player_name,
        "position",
        "birthCountry",
        team_abbrev,
        team_id,
        team_name,
        games,
        goals,
        assists,
        points,
        wins,
        losses,
        last_season,
        "searchText"
      FROM readmodel.player_search
      WHERE player_name ILIKE $1
         OR "searchText" ILIKE $1
         OR "playerId"::TEXT ILIKE $1
      ORDER BY games DESC, points DESC, goals DESC
      LIMIT $2;
    `,
    [`%${searchTerm}%`, limit]
  );
}

export async function searchTeams(searchTerm = "", limit = 20) {
  return query(
    `
      SELECT abbreviation, name, id
      FROM readmodel.teams
      WHERE name ILIKE $1
         OR abbreviation ILIKE $1
         OR id::TEXT ILIKE $1
      ORDER BY
        CASE
          WHEN abbreviation ILIKE $2 THEN 0
          WHEN name ILIKE $2 THEN 1
          ELSE 2
        END,
        name ASC
      LIMIT $3;
    `,
    [`%${searchTerm}%`, `${searchTerm}%`, limit]
  );
}

const GAME_COLUMNS = `
        id,
        "gameDate",
        "gameState",
        "awayTeam_id",
        "awayTeam_abbrev",
        "awayTeam_score",
        "awayTeam_logo",
        "awayTeam_darkLogo",
        "homeTeam_id",
        "homeTeam_abbrev",
        "homeTeam_score",
        "homeTeam_logo",
        "homeTeam_darkLogo",
        "periodDescriptor_periodType",
        "gameOutcome_lastPeriodType",
        "startTimeUTC",
        "gameCenterLink",
        "awayTeam_dbId",
        "homeTeam_dbId"
`;

export async function getGamesByDate(date) {
  return query(
    `
      SELECT ${GAME_COLUMNS}
      FROM readmodel.games
      WHERE "gameDate" = CAST($1 AS DATE)
      ORDER BY "startTimeUTC" ASC;
    `,
    [date]
  );
}

export async function getGameById(gameId) {
  const rows = await query(
    `
      SELECT ${GAME_COLUMNS}
      FROM readmodel.games
      WHERE id = $1
    `,
    [gameId]
  );
  return rows[0] || null;
}

export async function getGamesByDateRange(startDate, endDate) {
  return query(
    `
      SELECT ${GAME_COLUMNS}
      FROM readmodel.games
      WHERE "gameDate" >= CAST($1 AS DATE) AND "gameDate" <= CAST($2 AS DATE)
      ORDER BY "gameDate" ASC, "startTimeUTC" ASC;
    `,
    [startDate, endDate]
  );
}

export async function getGameDateRange() {
  const rows = await query(`
      SELECT
        TO_CHAR(MIN("gameDate"), 'YYYY-MM-DD') AS "minDate",
        TO_CHAR(MAX("gameDate"), 'YYYY-MM-DD') AS "maxDate"
      FROM readmodel.games;
    `);
  return rows[0] || null;
}
