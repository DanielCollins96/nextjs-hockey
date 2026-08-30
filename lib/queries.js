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

export async function getPointLeadersBySeason(season = 20252026) {
  return query(
    `
      SELECT
          row_number,
          player_name,
          "playerId",
          "position",
          season,
          "team.name",
          "stat.goals",
          "stat.games",
          "stat.assists",
          "stat.points",
          "team.id"
      FROM readmodel.season_point_leaders
      WHERE season = $1
      ORDER BY row_number ASC;
        `,
    [season]
  );
}

export async function getGoalieLeadersBySeason(season = 20252026) {
  return query(
    `
      SELECT
          row_number,
          player_name,
          "playerId",
          season,
          "team.name",
          "stat.games",
          "stat.wins",
          "stat.losses",
          "stat.otl",
          "stat.gaa",
          "stat.savePct",
          "stat.shutouts",
          "team.id"
      FROM readmodel.season_goalie_leaders
      WHERE season = $1
      ORDER BY row_number ASC;
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
