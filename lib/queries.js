// Toggle between Supabase (pg) and Aurora Data API
const USE_AURORA = process.env.USE_AURORA === "true";

// Dynamic import based on configuration
let pool;
if (USE_AURORA) {
  pool = (await import("./db-aurora.js")).default;
  console.log("🔵 Using Aurora Serverless Data API");
} else {
  pool = (await import("./db.js")).default;
  console.log("🟢 Using Supabase PostgreSQL");
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
            "leagueAbbrev" as "league.name",
            t.id as "team.id",
            "teamName.default" as "team.name",
            "gamesPlayed" as "stat.games",
            "wins" as "stat.wins",
            "losses" as "stat.losses",
            "goals" as "stat.goals",
            "savePctg" as "stat.savePercentage",
            "goalsAgainstAvg" as "stat.goalAgainstAverage",
            "shutouts" as "stat.shutouts",
            "pim" as "stat.pim",
            "otLosses" as "stat.otl",
            "assists" as "stat.assists"
        FROM newapi.season_goalie g
        LEFT JOIN newapi.teams t 
        ON g."teamName.default" = t."fullName"
        LEFT JOIN newapi.franchises f 
        ON t."franchiseId" = f."id"
        WHERE "playerId" = $1 AND g.is_active = true
        AND "gameTypeId" = 2`; // Regular season only;
    } else {
      query = `
        SELECT 
            "season",
            "leagueAbbrev" as "league.name",
            t.id as "team.id",
            "teamName.default" as "team.name",
            "gamesPlayed" as "stat.games",
            "goals" as "stat.goals",
            "pim" as "stat.pim",
            "plusMinus" as "stat.plusMinus",
            "points" as "stat.points",
            "assists" as "stat.assists"
        FROM newapi.season_skater s
        LEFT JOIN newapi.teams t 
        ON s."teamName.default" = t."fullName"  
        LEFT JOIN newapi.franchises f 
        ON t."franchiseId" = f."id" 
        WHERE "playerId" = $1 AND s.is_active = true
        AND "gameTypeId" = 2`; // Regular season only;
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
        SELECT p."playerId",CONCAT(p."firstName", ' ', p."lastName") AS player_name,TO_CHAR(p."birthDate", 'YYYY-MM-DD') AS birthDate,p."birthCountry"
			 ,p."position"
			 ,p."sweaterNumber"
       ,p."shootsCatches"
       ,d."displayAbbrev"
       ,d."ordinalPick"
			 ,ARRAY_AGG(d."draftYear") AS draft_seasons
       ,ARRAY_AGG(d."overallPick") AS draft_position
        FROM newapi.players p
        LEFT JOIN newapi.drafts d ON p."playerId" = d."playerId"
        WHERE p."playerId" = $1
        GROUP BY
            p."playerId",
            CONCAT(p."firstName", ' ', p."lastName"),
            TO_CHAR(p."birthDate", 'YYYY-MM-DD'),
            p."birthCountry",
            p."position",
            p."sweaterNumber",
            p."shootsCatches",
            d."displayAbbrev",
            d."ordinalPick"
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
        FROM newapi.players p
        WHERE "isActive" = true
        LIMIT 150
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
        FROM newapi.drafts
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
          d."playerId",
          d."overallPick",
          d."pickInRound",
          d."round",
          CONCAT(d."firstName", ' ', d."lastName") AS "playerName",
          d."positionCode",
          d."amateurLeague",
          d."amateurClubName",
          d."teamAbbrev",
          d."teamId",
          SUM(COALESCE(s."gamesPlayed", g."gamesPlayed", NULL)) as games,
          SUM(COALESCE(s.goals, g.goals, NULL)) as goals,
          SUM(COALESCE(s.assists, g.assists, NULL)) as assists,
          SUM(COALESCE(s.points, g.points, NULL)) as points,
          SUM(COALESCE(s."penaltyMinutes", g."penaltyMinutes", NULL)) as pim,
          CASE
              WHEN MAX(COALESCE(s.season, g.season)) IS NOT NULL THEN
              CONCAT(SUBSTRING(CAST(MAX(COALESCE(s.season, g.season)) AS text), 1, 4), '-', SUBSTRING(CAST(MAX(COALESCE(s.season, g.season)) AS text), 5))
              ELSE
              CAST(MAX(COALESCE(s.season, g.season)) AS text)
          END AS last_season
      FROM newapi.drafts d
      LEFT JOIN newapi.skaters s ON d."playerId" = s."playerId" AND s."gameType" = 2 AND s.is_active = true
      LEFT JOIN newapi.goalies g ON d."playerId" = g."playerId" AND g."gameType" = 2 AND g.is_active = true
      WHERE d."draftYear" = $1
      GROUP BY d."playerId", d."overallPick", d."pickInRound", d."round", d."positionCode", d."amateurLeague", d."amateurClubName", d."teamAbbrev", d."teamId", d."firstName", d."lastName"
      ORDER BY d."overallPick"  ASC 

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
        SELECT "rawTricode" AS abbreviation, "fullName" AS name, id
        FROM newapi.teams
        WHERE "active" = true;
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
        FROM newapi.teams
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
        SELECT DISTINCT "rawTricode" AS abbreviation, "fullName"
        FROM newapi.teams
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
        ,"goalsAgainstPerGame","goalsForPerGame", "regulationAndOtWins" as "row"
        , "pointPct", "winsInShootout", "otLosses"
        FROM newapi.team_season
        WHERE "teamId" = $1
        ORDER BY "seasonId" desc 
        LIMIT 8
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
WITH combined_data AS (
  SELECT
    t.id,
    sk."playerId",
    sk.season,
    sk."triCode",
    CONCAT(sk."firstName", ' ', sk."lastName") AS "fullName",
    SUM(CASE WHEN sk."gameType" = 2 THEN sk."gamesPlayed" ELSE 0 END) AS "gamesPlayed",
    SUM(CASE WHEN sk."gameType" = 3 THEN sk."gamesPlayed" ELSE 0 END) AS "playoffGamesPlayed",
    SUM(CASE WHEN sk."gameType" = 2 THEN sk."goals" ELSE 0 END) AS "goals",
    SUM(CASE WHEN sk."gameType" = 3 THEN sk."goals" ELSE 0 END) AS "playoffGoals",
    SUM(CASE WHEN sk."gameType" = 2 THEN sk."assists" ELSE 0 END) AS "assists",
    SUM(CASE WHEN sk."gameType" = 3 THEN sk."assists" ELSE 0 END) AS "playoffAssists",
    SUM(CASE WHEN sk."gameType" = 2 THEN sk."points" ELSE 0 END) AS "points",
    SUM(CASE WHEN sk."gameType" = 3 THEN sk."points" ELSE 0 END) AS "playoffPoints",
    SUM(CASE WHEN sk."gameType" = 2 THEN sk."penaltyMinutes" ELSE 0 END) AS "penaltyMinutes",
    SUM(CASE WHEN sk."gameType" = 3 THEN sk."penaltyMinutes" ELSE 0 END) AS "playoffPenaltyMinutes",
    SUM(CASE WHEN sk."gameType" = 2 THEN sk."plusMinus" ELSE 0 END) AS "plusMinus",
    SUM(CASE WHEN sk."gameType" = 3 THEN sk."plusMinus" ELSE 0 END) AS "playoffPlusMinus",
    sk."positionCode"
  FROM newapi.skaters sk
  JOIN newapi.teams t ON sk."triCode" = t."triCode"
  WHERE t.id = $1 AND sk.is_active = true
  GROUP BY t.id, sk."playerId", sk.season, sk."triCode", sk."firstName", sk."lastName", sk."positionCode"
)
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
FROM combined_data;
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
    WITH combined_goalie_data AS (
  SELECT
    t.id,
    g."playerId",
    g.season,
    g."team",
    CONCAT(g."firstName", ' ', g."lastName") AS "fullName",
    SUM(CASE WHEN g."gameType" = 2 THEN g."gamesPlayed" ELSE 0 END) AS "gamesPlayed",
    SUM(CASE WHEN g."gameType" = 3 THEN g."gamesPlayed" ELSE 0 END) AS "playoffGamesPlayed",
    SUM(CASE WHEN g."gameType" = 2 THEN g."goals" ELSE 0 END) AS "goals",
    SUM(CASE WHEN g."gameType" = 3 THEN g."goals" ELSE 0 END) AS "playoffGoals",
    SUM(CASE WHEN g."gameType" = 2 THEN g."assists" ELSE 0 END) AS "assists",
    SUM(CASE WHEN g."gameType" = 3 THEN g."assists" ELSE 0 END) AS "playoffAssists",
    SUM(CASE WHEN g."gameType" = 2 THEN g."points" ELSE 0 END) AS "points",
    SUM(CASE WHEN g."gameType" = 3 THEN g."points" ELSE 0 END) AS "playoffPoints",
    SUM(CASE WHEN g."gameType" = 2 THEN g."wins" ELSE 0 END) AS "wins",
    SUM(CASE WHEN g."gameType" = 3 THEN g."wins" ELSE 0 END) AS "playoffWins",
    SUM(CASE WHEN g."gameType" = 2 THEN g."losses" ELSE 0 END) AS "losses",
    SUM(CASE WHEN g."gameType" = 3 THEN g."losses" ELSE 0 END) AS "playoffLosses",
    AVG(CASE WHEN g."gameType" = 2 THEN g."goalsAgainstAverage" END) AS "goalsAgainstAverage",
    AVG(CASE WHEN g."gameType" = 3 THEN g."goalsAgainstAverage" END) AS "playoffGoalsAgainstAverage",
    AVG(CASE WHEN g."gameType" = 2 THEN g."savePercentage" END) AS "savePercentage",
    AVG(CASE WHEN g."gameType" = 3 THEN g."savePercentage" END) AS "playoffSavePercentage",
    SUM(CASE WHEN g."gameType" = 2 THEN g."penaltyMinutes" ELSE 0 END) AS "penaltyMinutes",
    SUM(CASE WHEN g."gameType" = 3 THEN g."penaltyMinutes" ELSE 0 END) AS "playoffPenaltyMinutes"
  FROM newapi.goalies g
  JOIN newapi.teams t ON g."team" = t."triCode"
  WHERE t.id = $1 AND g.is_active = true
  GROUP BY t.id, g."playerId", g.season, g.team, g."firstName", g."lastName"
)
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
FROM combined_goalie_data;
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
        FROM staging1."team.gametypes"
        WHERE 3 = ANY("gameTypes")
        AND "triCode" = $1
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
        FROM newapi.rosters_active;
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
      FROM newapi.season_skater
      WHERE "leagueAbbrev" = 'NHL'
      UNION
      SELECT DISTINCT season
      FROM newapi.season_goalie
      WHERE "leagueAbbrev" = 'NHL'
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
        WHERE s.season = $1 AND s."leagueAbbrev" = 'NHL' AND s.is_active = true
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
        WHERE g.season = $1 AND g."leagueAbbrev" = 'NHL' AND g.is_active = true
        GROUP BY g."playerId", g.season
      )
      SELECT
          ROW_NUMBER() OVER (ORDER BY COALESCE(s.points, (g.goals + g.assists), 0) DESC NULLS LAST, COALESCE(s.goals, g.goals, 0) DESC NULLS LAST) AS row_number,
          CONCAT(p."firstName", ' ', p."lastName") AS player_name,
          p."playerId",
          p."position",
          COALESCE(s.season, g.season) AS season,
          COALESCE(s."teamName", g."teamName") AS "team.name",
          COALESCE(s.goals, g.goals, 0) AS "stat.goals",
          COALESCE(s."gamesPlayed", g."gamesPlayed", 0) AS "stat.games",
          COALESCE(s.assists, g.assists, 0) AS "stat.assists",
          COALESCE(s.points, (g.goals + g.assists), 0) AS "stat.points",
          COALESCE(ts.id, tg.id) AS "team.id"
      FROM (SELECT DISTINCT ON ("playerId") "playerId", "firstName", "lastName", "position" FROM newapi.players) p
      LEFT JOIN skater_totals s ON p."playerId" = s."playerId"
      LEFT JOIN goalie_totals g ON p."playerId" = g."playerId"
      LEFT JOIN newapi.teams ts ON ts."fullName" = s."teamName" AND ts.active = true
      LEFT JOIN newapi.teams tg ON tg."fullName" = g."teamName" AND tg.active = true
      WHERE (s."playerId" IS NOT NULL OR g."playerId" IS NOT NULL)
      ORDER BY COALESCE(s.points, (g.goals + g.assists), 0) DESC NULLS LAST, COALESCE(s.goals, g.goals, 0) DESC NULLS LAST
      LIMIT 200;
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
        WHERE g.season = $1 AND g."leagueAbbrev" = 'NHL' AND g.is_active = true
        GROUP BY g."playerId", g.season
      )
      SELECT
          ROW_NUMBER() OVER (ORDER BY g.wins DESC NULLS LAST, g."savePctg" DESC NULLS LAST) AS row_number,
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
          t.id AS "team.id"
      FROM (SELECT DISTINCT ON ("playerId") "playerId", "firstName", "lastName" FROM newapi.players) p
      JOIN goalie_totals g ON p."playerId" = g."playerId"
      LEFT JOIN newapi.teams t ON t."fullName" = g."teamName" AND t.active = true
      ORDER BY g.wins DESC NULLS LAST, g."savePctg" DESC NULLS LAST
      LIMIT 100;
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
      FROM staging1.award
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
      WITH skater_stats AS (
        SELECT
          "playerId",
          SUM(CASE WHEN "gameType" = 2 THEN "gamesPlayed" ELSE 0 END) AS games,
          SUM(CASE WHEN "gameType" = 2 THEN goals ELSE 0 END) AS goals,
          SUM(CASE WHEN "gameType" = 2 THEN assists ELSE 0 END) AS assists,
          SUM(CASE WHEN "gameType" = 2 THEN points ELSE 0 END) AS points,
          MAX(season) AS last_season
        FROM newapi.skaters
        WHERE is_active = true
        GROUP BY "playerId"
      ),
      goalie_stats AS (
        SELECT
          "playerId",
          SUM(CASE WHEN "gameType" = 2 THEN "gamesPlayed" ELSE 0 END) AS games,
          SUM(CASE WHEN "gameType" = 2 THEN wins ELSE 0 END) AS wins,
          SUM(CASE WHEN "gameType" = 2 THEN losses ELSE 0 END) AS losses,
          MAX(season) AS last_season
        FROM newapi.goalies
        WHERE is_active = true
        GROUP BY "playerId"
      )
      SELECT * FROM (
        SELECT DISTINCT ON (p."playerId")
          p."playerId",
          CONCAT(p."firstName", ' ', p."lastName") AS player_name,
          p."position",
          p."birthCountry",
          r."teamAbbreviation" AS team_abbrev,
          t.id AS team_id,
          t."fullName" AS team_name,
          COALESCE(sk.games, g.games, 0) AS games,
          COALESCE(sk.goals, 0) AS goals,
          COALESCE(sk.assists, 0) AS assists,
          COALESCE(sk.points, 0) AS points,
          COALESCE(g.wins, 0) AS wins,
          COALESCE(g.losses, 0) AS losses,
          COALESCE(sk.last_season, g.last_season) AS last_season
        FROM newapi.players p
        LEFT JOIN newapi.rosters_active r ON p."playerId" = r."playerId"
        LEFT JOIN newapi.teams t ON r."teamAbbreviation" = t."rawTricode"
        LEFT JOIN skater_stats sk ON p."playerId" = sk."playerId"
        LEFT JOIN goalie_stats g ON p."playerId" = g."playerId"
        WHERE
          CONCAT(p."firstName", ' ', p."lastName") ILIKE $1
        ORDER BY p."playerId"
      ) AS unique_players
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
        g.id,
        g."gameDate",
        g."gameState",
        g."awayTeam_id",
        g."awayTeam_abbrev",
        g."awayTeam_score",
        g."awayTeam_logo",
        g."awayTeam_darkLogo",
        g."homeTeam_id",
        g."homeTeam_abbrev",
        g."homeTeam_score",
        g."homeTeam_logo",
        g."homeTeam_darkLogo",
        g."periodDescriptor_periodType",
        g."gameOutcome_lastPeriodType",
        g."startTimeUTC",
        g."gameCenterLink",
        ta.id AS "awayTeam_dbId",
        th.id AS "homeTeam_dbId"
      FROM newapi.games g
      LEFT JOIN newapi.teams ta ON g."awayTeam_abbrev" = ta."rawTricode" AND ta.active = true
      LEFT JOIN newapi.teams th ON g."homeTeam_abbrev" = th."rawTricode" AND th.active = true
      WHERE g."gameDate" = $1
      ORDER BY g."startTimeUTC" ASC;
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
        g.id,
        g."gameDate",
        g."gameState",
        g."awayTeam_id",
        g."awayTeam_abbrev",
        g."awayTeam_score",
        g."awayTeam_logo",
        g."awayTeam_darkLogo",
        g."homeTeam_id",
        g."homeTeam_abbrev",
        g."homeTeam_score",
        g."homeTeam_logo",
        g."homeTeam_darkLogo",
        g."periodDescriptor_periodType",
        g."gameOutcome_lastPeriodType",
        g."startTimeUTC",
        g."gameCenterLink",
        ta.id AS "awayTeam_dbId",
        th.id AS "homeTeam_dbId"
      FROM newapi.games g
      LEFT JOIN newapi.teams ta ON g."awayTeam_abbrev" = ta."rawTricode" AND ta.active = true
      LEFT JOIN newapi.teams th ON g."homeTeam_abbrev" = th."rawTricode" AND th.active = true
      WHERE g.id = $1
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
        g.id,
        g."gameDate",
        g."gameState",
        g."awayTeam_id",
        g."awayTeam_abbrev",
        g."awayTeam_score",
        g."awayTeam_logo",
        g."awayTeam_darkLogo",
        g."homeTeam_id",
        g."homeTeam_abbrev",
        g."homeTeam_score",
        g."homeTeam_logo",
        g."homeTeam_darkLogo",
        g."periodDescriptor_periodType",
        g."gameOutcome_lastPeriodType",
        g."startTimeUTC",
        g."gameCenterLink",
        ta.id AS "awayTeam_dbId",
        th.id AS "homeTeam_dbId"
      FROM newapi.games g
      LEFT JOIN newapi.teams ta ON g."awayTeam_abbrev" = ta."rawTricode" AND ta.active = true
      LEFT JOIN newapi.teams th ON g."homeTeam_abbrev" = th."rawTricode" AND th.active = true
      WHERE g."gameDate" >= $1 AND g."gameDate" <= $2
      ORDER BY g."gameDate" ASC, g."startTimeUTC" ASC;
    `;
    const result = await pool.query(sql, [startDate, endDate]);
    return result.rows;
  } catch (error) {
    console.log({tst_er: error});
    return [];
  }
}
