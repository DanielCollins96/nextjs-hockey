import conn from '../../../lib/db'

export default async function handler(req, res) {
console.log('whwhhwhwhwhhwhwhw');
try {
    
    const sql = `

    SELECT     ROW_NUMBER() OVER (ORDER BY ps."stat.points" DESC NULLS LAST, ps."stat.goals" DESC NULLS LAST) AS row_number,
    p."fullName", p.id, p."primaryPosition.code", ps."season", ps."team.name", ps."stat.goals", ps."stat.games",ps."stat.assists", ps."stat.points"
    FROM staging1.player_stats_new ps
    INNER JOIN staging1.player p
    ON p.id = ps."person.id" AND p.active = true AND ps.season = 20222023
    WHERE ps."league.id" = 133
    ORDER BY ps."stat.points" DESC NULLS LAST,ps."stat.goals" DESC NULLS LAST
    LIMIT 100
    `
    let result = await conn.query(sql)
    result = result.rows
    res.status(200).json(result)
} catch (error) {
    console.log('errrrrrroooor');
    console.log(error);
}
}