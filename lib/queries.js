import conn from './db.js'

export async function getRoster(id) {
try {
// const {id} = req.query
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
WHERE t.id = ${id}
AND p.id is not null
ORDER BY "seasonId" desc
-- LIMIT 1
`

// console.log('rosters api getRoster');

let result = await conn.query(stats)
result = result.rows

return result

} catch (error) {
console.log(error);
}

}


export async function getPlayerStats(id) {
// write a function that queries the player stats database for all stats from the player id
// and returns the stats in an array
try {
const stats = `
SELECT 
CONCAT(
    SUBSTRING(CAST(season AS VARCHAR), 1, 4),
    '-',
    SUBSTRING(CAST(season AS VARCHAR), 7, 2)
  ) AS season ,"league.name", "team.id", "team.name", "stat.games", "stat.wins",  "stat.losses", "stat.goals", "stat.savePercentage", "stat.goalAgainstAverage", "stat.shutouts", "stat.pim", "stat.plusMinus", "stat.points", "stat.assists"
FROM staging1.player_stats_new ps
WHERE ps."person.id" = ${id}
`

// console.log('player api getPlayerStats');

let result = await conn.query(stats)
result = result.rows

return result


}
catch (error) {
console.log(error);
}
}

export async function getPlayer(id) {
    // write a function that queries the player database for all players and returns the players in an array
try {
const stats = `
SELECT *
FROM staging1.player p
WHERE p.id = ${id}
`

// console.log('player api getPlayer');

let result = await conn.query(stats)
result = result.rows

return result


}
catch (error) {
console.log({tst_er: error});
}
}

export async function getAllPlayerIds(){
    // write a function that queries the player database for all players and returns the players in an array
try {
const stats = `
SELECT DISTINCT id
FROM staging1.player p
WHERE active = true
-- LIMIT 100
`

// console.log('player api allPlaya');

let result = await conn.query(stats)
result = result.rows

return result


}
catch (error) {
console.log({tst_er: error});
}

}
