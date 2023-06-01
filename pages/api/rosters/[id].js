/* eslint-disable import/no-anonymous-default-export */
import conn from '../../../lib/db'
import { getRoster } from '../../../lib/queries'

export default async (req, res) => {
    try {
        const {id} = req.query
        const stats = `
        SELECT p."fullName", p.id, p."primaryPosition.code", f."seasonId", ps."team.name",ps.season, p."fullName", ps."stat.games",ps."stat.goals",ps."stat.assists",ps."stat.points"
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

        let result = await getRoster(id)

        let rosters = result.reduce((r,curr) => {
            (r[curr.season] = r[curr.season] || []).push(curr);
            return r
        }, {})

        if (rosters) {
        var years = Object.keys(rosters)
        var teamName = rosters[years[0]][0]['team.name']
        }

        // const {rosters, years, teamName} = await getRoster(id);
        res.status(200).json({name: teamName, rosters, seasons: years})
    
    } catch(err) {
        console.log({roster_error: err});
        res.status(500).send({success: false})
    }
}