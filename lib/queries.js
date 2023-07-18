
import conn from './db.js'
export async function getRoster(id) {  
    try {
        // const {id} = req.query
        const stats = `
        SELECT p."fullName", p.id, p."primaryPosition.code", f."seasonId", ps."team.name",ps.season, p."fullName", ps."stat.games",ps."stat.goals",ps."stat.assists",ps."stat.points", ps."stat.pim", ps."stat.plusMinus"
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
        ORDER BY "seasonId" desc
        -- LIMIT 1	
        `
    
        console.log('rosters api');

        let result = await conn.query(stats)
        result = result.rows

        return result

    } catch (error) {
        console.log(error);
    }
    
    }