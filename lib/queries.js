import pool from './db.js'

/**
 * Represents a player in the roster.
 * @typedef {Object} RosterPlayer
 * @property {number} id - The player's ID.
 * @property {string} fullName - The player's full name.
 * @property {string} primaryPosition - The player's primary position.
 * @property {string} seasonId - The season ID.
 * @property {string} teamName - The team name.
 * @property {string} season - The season.
 * @property {number} games - The number of games played.
 * @property {number} goals - The number of goals scored.
 * @property {number} assists - The number of assists.
 * @property {number} points - The total points.
 * @property {number} pim - Penalty minutes.
 * @property {number} plusMinus - The plus/minus rating.
 * Add more properties as needed.
 */

/**
 * Get the roster for a team by ID.
 * @param {number} id - The team's ID.
 * @returns {Promise<RosterPlayer[]>} A promise that resolves to an array of RosterPlayer objects.
 */
export async function getRoster(id) {
    try {
        const stats = `
        SELECT p."fullName", p.id, p."primaryPosition.code", f."seasonId", ps."team.name",ps.season, p."fullName",
        ps."stat.games",ps."stat.goals",ps."stat.assists",ps."stat.points", ps."stat.pim", ps."stat.plusMinus"
        FROM staging1.team t
        inner JOIN staging1.franchise f
        ON t.id = f."teamId"
        AND "gameTypeId" = 2
        INNER JOIN staging1.player_stats ps
        ON f."seasonId" = ps."season"
        AND f."teamId" = ps."team.id"
        LEFT JOIN staging1.player p
        ON p.id = ps."person.id"
        WHERE t.id = $1
        AND p.id is not null
        ORDER BY "seasonId" desc
        -- LIMIT 1
        `

        // console.log('rosters api getRoster');

        let result = await pool.query(stats,[id])
        result = result.rows

        return result

    } catch (error) {
        console.log(error);
    }

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
    const columns = position !== 'Goalie' ?
      ['"season"', '"league.name"', '"team.id"', '"team.name"', '"stat.games"', '"stat.goals"', '"stat.pim"', '"stat.plusMinus"', '"stat.points"', '"stat.assists"'] :
      ['"season"', '"league.name"', '"team.id"', '"team.name"', '"stat.games"', '"stat.wins"', '"stat.losses"', '"stat.goals"', '"stat.savePercentage"', '"stat.goalAgainstAverage"', '"stat.shutouts"', '"stat.pim"', '"stat.plusMinus"', '"stat.points"', '"stat.assists"'];
    
    // Build the base query
    let query = `SELECT ${columns.join(", ")}
                 FROM staging1.player_stats_new ps
                 WHERE ps."person.id" = $1`;
    
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
        SELECT p.id,"fullName",p."birthDate",p."birthCountry"
			 ,p."primaryPosition.name"
			 ,p."primaryNumber"
			 ,p."currentAge"
			 ,ARRAY_AGG(d."draftYear") AS draft_seasons,ARRAY_AGG(d."overallPickNumber") AS draft_position
        FROM staging1.player p
        LEFT JOIN staging1.drafts d 
        ON d."playerId" = p.id
        WHERE p.id = $1
        GROUP BY
            p.id,
            p."fullName",
            p."birthDate",
            p."birthCountry",
            p."primaryPosition.name",
            p."primaryNumber",
            p."currentAge";
        `
        let result = await pool.query(stats,[id])
        result = result.rows
    // console.log({resultTst: result});
        return result
    }
    catch (error) {
        console.log({tst_er: error});
    }
}

/**
 * Get all active player IDs.
 * @returns {Promise<number[]>} A promise that resolves to an array of player IDs.
 */
export async function getAllPlayerIds(){
    try {
        const stats = `
        SELECT DISTINCT id
        FROM staging1.player p
        WHERE active = true
        LIMIT 150
        `

        let result = await pool.query(stats)
        result = result.rows

        return result

    }
    catch (error) {
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
export async function getAllDraftYears(){
try {
    const stats = `
        SELECT DISTINCT "draftYear"
        FROM staging1.drafts
        ORDER BY "draftYear" desc
        `    
    let result = await pool.query(stats)
    result = result.rows

    return result

} catch (error) {
    console.log({tst_er: error});
}

}

export async function getDraft(seasonId) {

try {
    const sql = `
    select "playerId","overallPickNumber","pickInRound","roundNumber","playerName","position","amateurLeague","amateurClubName","triCode","birthPlace","draftedByTeamId"
    , SUM("stat.games") as games
    , SUM(ps."stat.goals") as goals
    , SUM(ps."stat.assists") as assists
    , SUM("stat.points") as points
    , SUM("stat.pim") as pim
    ,CASE
        WHEN MAX("season") IS NOT NULL THEN
        CONCAT(SUBSTRING(CAST(MAX("season") AS text), 1, 4), '-', SUBSTRING(CAST(MAX("season") AS text), 5))
        ELSE
        CAST(MAX("season") AS text)
    END AS last_season
    -- ,*
    from staging1.drafts d
    LEFT JOIN staging1.player_stats ps ON d."playerId" = ps."person.id" AND "league.id" = 133
    WHERE "draftYear" = $1
    GROUP BY "playerId","overallPickNumber","pickInRound","roundNumber","playerName","position","amateurLeague","amateurClubName","triCode","birthPlace","draftedByTeamId"
    ORDER BY "overallPickNumber" 

    `
    let result = await pool.query(sql,[seasonId])
    result = result.rows
    return result

} catch (error) {
    console.log({tst_er: error});
}

}


export async function getTeams() {
    try {
        const sql = `
        SELECT abbreviation, name, id
        FROM staging1.team
        ORDER BY name;
        `
        let result = await pool.query(sql)
        result = result.rows
        return result
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
        FROM staging1.team
        `
        let result = await pool.query(sql)
        result = result.rows
        return result
    } catch (error) {
        console.log({tst_er: error});
    }
}

export async function getTeamSeasons(id) {
    try {
        const sql = `
        SELECT "seasonId", "wins", "losses", "points"
        ,"goalsAgainstPerGame","goalsForPerGame", "regulationAndOtWins" as "row"
        , "pointPct", "winsInShootout"
        FROM Staging1.team_season
        WHERE "teamId" = $1
        ORDER BY "seasonId" desc 
        LIMIT 8
        `
        let result = await pool.query(sql, [id])
        result = result.rows
        return result
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
    sk.abbreviation, 
    CONCAT(sk."firstName.default", ' ', sk."lastName.default") AS "fullName",
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
  FROM staging1.skaters sk
  JOIN staging1.team t ON sk.abbreviation = t.abbreviation
  WHERE t.id = $1
  GROUP BY t.id, sk."playerId", sk.season, sk.abbreviation, sk."firstName.default", sk."lastName.default", sk."positionCode"
)
SELECT DISTINCT 
  id, 
  "playerId", 
  season, 
  abbreviation, 
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
        `
        let result = await pool.query(sql, [id])
        result = result.rows
        return result
    } catch (error) {
     console.log(error)
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
    g.abbreviation, 
    CONCAT(g."firstName.default", ' ', g."lastName.default") AS "fullName",
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
  FROM staging1.goalies g
  JOIN staging1.team t ON g.abbreviation = t.abbreviation
  WHERE t.id = $1
  GROUP BY t.id, g."playerId", g.season, g.abbreviation, g."firstName.default", g."lastName.default"
)
SELECT DISTINCT 
  id, 
  "playerId", 
  season, 
  abbreviation, 
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

        `
        let result = await pool.query(sql, [id])
        result = result.rows
        return result
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
        AND abbreviation = $1
        `
        let result = await pool.query(sql, [abbreviation])
        result = result.rows.map(row => row.season)
        return result
    } catch (error) {
        console.log({tst_er: error});
    }
}

export async function getPointLeadersBySeason(season = 20222023) {
    try {
        const sql = `
        SELECT     ROW_NUMBER() OVER (ORDER BY ps."stat.points" DESC NULLS LAST, ps."stat.goals" DESC NULLS LAST) AS row_number,
        p."fullName", p.id, p."primaryPosition.code", ps."season", ps."team.name", ps."stat.goals", ps."stat.games",ps."stat.assists", ps."stat.points", ps."team.id"
        FROM staging1.player_stats_new ps
        INNER JOIN staging1.player p
        ON p.id = ps."person.id" AND ps.season = $1
        WHERE ps."league.id" = 133
        ORDER BY ps."stat.points" DESC NULLS LAST,ps."stat.goals" DESC NULLS LAST
        LIMIT 200
        `
        let result = await pool.query(sql, [season])
        result = result.rows
        return result
    } catch (error) {
        console.log({tst_er: error});
    }
}