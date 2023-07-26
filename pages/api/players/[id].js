import conn from '../../../lib/db'
import { getPlayerStats, getPlayer } from '../../../lib/queries'


export default async function handler(req, res) {
  try {
    const { id } = req.query
    const player = await getPlayer(id)
    if(player.length === 0) return res.status(404).json({error_message: "Player not found"})
    console.log({player});

    let result = await getPlayerStats(id)
    res.status(200).json({player, playerStats: result})
  } catch (e) {
    console.log(e)
  }
}