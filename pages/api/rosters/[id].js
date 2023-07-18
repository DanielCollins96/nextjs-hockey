/* eslint-disable import/no-anonymous-default-export */
import conn from '../../../lib/db'
import { getRoster } from '../../../lib/queries'

export default async (req, res) => {
    try {
        const {id} = req.query

        let result = await getRoster(id)

        let rosters = result.reduce((r,curr) => {
            (r[curr.season.slice(0,4)+'-'+curr.season.slice(6)] = r[curr.season.slice(0,4)+'-'+curr.season.slice(6)] || []).push(curr);
            return r
        }, {})

        if (rosters) {
        var years = Object.keys(rosters)
        var teamName = rosters[years[0]][0]['team.name']
        }

        res.status(200).json({name: teamName, rosters, seasons: years})
    
    } catch(err) {
        console.log({roster_error: err});
        res.status(500).send({success: false})
    }
}