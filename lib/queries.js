// Prefer Aurora Data API automatically when its required env vars are present.
const hasAuroraDataApiConfig = Boolean(
  process.env.AURORA_CLUSTER_ARN && process.env.AURORA_SECRET_ARN
);
const USE_AURORA =
  process.env.USE_AURORA === "true" ||
  (process.env.USE_AURORA !== "false" && hasAuroraDataApiConfig);

// Dynamic import based on configuration
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

/**
 * Represents a player's statistics for a season.
 * @typedef {Object} PlayerSeasonStats
 * @property {string} season - The season in the format "YYYY-YY".
 * @property {string} leagueName - The name of the league.
 * @property {number} teamId - The ID of the team.
 * @property {string} teamName - The name of the team.
 * @property {number} games - The number of games played.
 * @property {number} wins - The number of games won.
 * @property {number} losses - The number of games lost.
 * @property {number} goals - The number of goals scored.
 * @property {number} savePercentage - The save percentage.
 * @property {number} goalAgainstAverage - The goal against average.
 * @property {number} shutouts - The number of shutouts.
 * @property {number} pim - Penalty minutes.
 * @property {number} plusMinus - The plus/minus rating.
 * @property {number} points - The total points.
 * @property {number} assists - The number of assists.
 * Add more properties as needed.
 */

/**
 * Get a player's statistics by their ID.
 * @param {number} id - The player's ID.
 * @param {string} position - The player's position.
 * @returns {Promise<PlayerSeasonStats[]>} A promise that resolves to an array of PlayerSeasonStats objects.
 */
export async function getPlayerStats(id, position) {
  // write a function that queries the player stats database for all stats from the player id
  // and returns the stats in an array
  try {
    // Define the columns to select based on position
        let query;
    if (position === "G") {
      query = `
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
        WHERE "playerId" = $1`;
    } else {
      query = `
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
    }

    // Run the query
    let result = await pool.query(query, [id]);
    return result.rows;
  } catch (error) {
    console.log(error);
  }
}

/**
 * Get a player by ID.
 * @param {number} id - The player's ID.
 * @returns {Promise<Player|null>} A promise that resolves to a Player object or null if not found.
 */
export async function getPlayer(id) {
  try {
    const stats = `
        SELECT
            "playerId",
            player_name,
            "birthDate" AS birthdate,
            "birthCountry",
            "position",
            "sweaterNumber",
            "shootsCatches",
            "displayAbbrev",
            "ordinalPick",
            draft_seasons,
            draft_position
        FROM readmodel.players
        WHERE "playerId" = $1
        `;
    let result = await pool.query(stats, [id]);
    result = result.rows;
    // console.log({resultTst: result});
    return result;
  } catch (error) {
    console.log({tst_er: error});
  }
}

/**
 * Get all active player IDs.
 * @returns {Promise<number[]>} A promise that resolves to an array of player IDs.
 */
export async function getAllPlayerIds() {
  try {
    const stats = `
        SELECT DISTINCT "playerId"
        FROM readmodel.player_ids
        `;

    let result = await pool.query(stats);
    result = result.rows;

    return result;
  } catch (error) {
    console.log({tst_er: error});
  }
}

/**
 * Represents a draft year.
 * @typedef {string} DraftYear
 */

/**
 * Get all distinct draft years.
 * @returns {Promise<DraftYear[]>} A promise that resolves to an array of distinct draft years.
 */
export async function getAllDraftYears() {
  try {
    const stats = `
        SELECT DISTINCT "draftYear"
        FROM readmodel.draft_years
        ORDER BY "draftYear" desc
        `;
    let result = await pool.query(stats);
    result = result.rows;

    return result;
  } catch (error) {
    console.log({tst_er: error});
  }
}

export async function getDraft(seasonId) {
  try {
    const sql = `
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

    `;
    let result = await pool.query(sql, [seasonId]);
    result = result.rows;
    return result;
  } catch (error) {
    console.log({tst_er: error});
    throw error;
  }
}

export async function getTeams() {
  try {
    const sql = `
        SELECT abbreviation, name, id
        FROM readmodel.teams;
        `;
    let result = await pool.query(sql);
    result = result.rows;
    return result;
  } catch (error) {
    console.log({tst_er: error});
  }
  // finally {
  //     client.release()
  // }
}

export async function getTeamIds() {
  try {
    const sql = `
        SELECT id
        FROM readmodel.team_ids
        `;
    let result = await pool.query(sql);
    result = result.rows;
    return result;
  } catch (error) {
    console.log({tst_er: error});
  }
}

export async function getTeamInfo(id) {
  try {
    const sql = `
        SELECT DISTINCT abbreviation, "fullName"
        FROM readmodel.team_info
        WHERE id = $1
        `;
    let result = await pool.query(sql, [id]);
    return result.rows[0] || null;
  } catch (error) {
    console.log({tst_er: error});
    return null;
  }
}

export async function getTeamSeasons(id) {
  try {
    const sql = `
        SELECT "seasonId", "wins", "losses", "points"
        ,"goalsAgainstPerGame","goalsForPerGame", "row"
        , "pointPct", "winsInShootout", "otLosses"
        FROM readmodel.team_seasons
        WHERE "teamId" = $1
        AND season_rank <= 8
        ORDER BY "seasonId" desc 
        `;
    let result = await pool.query(sql, [id]);
    result = result.rows;
    return result;
  } catch (error) {
    console.log({tst_er: error});
  }
}

export async function getTeamSkaters(id) {
  try {
    const sql = `
SELECT DISTINCT
  id,
  "playerId",
  season,
  "triCode",
  "fullName",
  "gamesPlayed",
  "playoffGamesPlayed",
  "goals",
  "playoffGoals",
  "assists",
  "playoffAssists",
  "points",
  "playoffPoints",
  "penaltyMinutes",
  "playoffPenaltyMinutes",
  "plusMinus",
  "playoffPlusMinus",
  "positionCode"
FROM readmodel.team_skaters
WHERE id = $1;
        `;
    let result = await pool.query(sql, [id]);
    result = result.rows;
    return result;
  } catch (error) {
    console.log(error);
  }
}
export async function getTeamGoalies(id) {
  try {
    const sql = `
SELECT DISTINCT
  id,
  "playerId",
  season,
  "team",
  "fullName",
  "gamesPlayed",
  "playoffGamesPlayed",
  "goals",
  "playoffGoals",
  "assists",
  "playoffAssists",
  "points",
  "playoffPoints",
  "wins",
  "playoffWins",
  "losses",
  "playoffLosses",
  "goalsAgainstAverage",
  "playoffGoalsAgainstAverage",
  "savePercentage",
  "playoffSavePercentage",
  "penaltyMinutes",
  "playoffPenaltyMinutes"
FROM readmodel.team_goalies
WHERE id = $1;
        `;
    let result = await pool.query(sql, [id]);
    result = result.rows;
    return result;
  } catch (error) {
    // return a error code
    console.log({tst_er: error});
  }
}

export async function getPlayoffYears(abbreviation) {
  try {
    const sql = `
        SELECT season
        FROM readmodel.team_playoff_years
        WHERE abbreviation = $1
        `;
    let result = await pool.query(sql, [abbreviation]);
    result = result.rows.map((row) => row.season);
    return result;
  } catch (error) {
    console.log({tst_er: error});
  }
}

/**
 * Get all active rosters from the database.
 * @returns {Promise<Object[]>} A promise that resolves to an array of roster entries grouped by team.
 */
export async function getActiveRosters() {
  try {
    const sql = `
        SELECT id, "teamAbbreviation", "positionGroup", "playerId", headshot, 
               "firstName", "lastName", "sweaterNumber", "positionCode", 
               "shootsCatches", "heightInInches", "weightInPounds", 
               "heightInCentimeters", "weightInKilograms", "birthDate", 
               "birthCity", "birthCountry", "birthStateProvince", active, 
               occurrence_number, data_hash, created_at, updated_at
        FROM readmodel.active_rosters;
        `;
    let result = await pool.query(sql);
    return result.rows;
  } catch (error) {
    console.log({tst_er: error});
    return [];
  }
}

export async function getAvailableSeasons() {
  try {
    const sql = `
      SELECT DISTINCT season
      FROM readmodel.available_seasons
      ORDER BY season DESC
    `;
    let result = await pool.query(sql);
    return result.rows.map(row => parseInt(row.season));
  } catch (error) {
    console.log({tst_er: error});
    return [];
  }
}

export async function getPointLeadersBySeason(season = 20252026) {
  try {
    const sql = `
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
        `;
    let result = await pool.query(sql, [season]);
    result = result.rows;
    return result;
  } catch (error) {
    console.log({tst_er: error});
  }
}

export async function getGoalieLeadersBySeason(season = 20252026) {
  try {
    const sql = `
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
        `;
    let result = await pool.query(sql, [season]);
    result = result.rows;
    return result;
  } catch (error) {
    console.log({tst_er: error});
  }
}

export async function getPlayerAwards(playerId) {
  try {
    const sql = `
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
    `;
    const result = await pool.query(sql, [playerId]);
    return result.rows;
  } catch (error) {
    console.log({tst_er: error});
    return [];
  }
}

export async function searchPlayers(searchTerm = '', limit = 100) {
  try {
    const sql = `
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
      ORDER BY games DESC, player_name
      LIMIT $2;
    `;
    const result = await pool.query(sql, [`%${searchTerm}%`, limit]);
    return result.rows;
  } catch (error) {
    console.log({tst_er: error});
    return [];
  }
}

export async function getGamesByDate(date) {
  try {
    const sql = `
      SELECT
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
      FROM readmodel.games
      WHERE "gameDate" = CAST($1 AS DATE)
      ORDER BY "startTimeUTC" ASC;
    `;
    const result = await pool.query(sql, [date]);
    return result.rows;
  } catch (error) {
    console.log({tst_er: error});
    return [];
  }
}

export async function getGameById(gameId) {
  try {
    const sql = `
      SELECT
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
      FROM readmodel.games
      WHERE id = $1
    `;
    const result = await pool.query(sql, [gameId]);
    return result.rows[0] || null;
  } catch (error) {
    console.log({tst_er: error});
    return null;
  }
}

export async function getGamesByDateRange(startDate, endDate) {
  try {
    const sql = `
      SELECT
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
      FROM readmodel.games
      WHERE "gameDate" >= CAST($1 AS DATE) AND "gameDate" <= CAST($2 AS DATE)
      ORDER BY "gameDate" ASC, "startTimeUTC" ASC;
    `;
    const result = await pool.query(sql, [startDate, endDate]);
    return result.rows;
  } catch (error) {
    console.log({tst_er: error});
    return [];
  }
}
