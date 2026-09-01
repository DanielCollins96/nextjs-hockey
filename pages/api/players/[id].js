import { extractEntityId } from '../../../lib/routes'
import { loadPlayer } from '../../../lib/player-data'

export default async function handler(req, res) {
  try {
    const id = extractEntityId(req.query.id)
    const result = await loadPlayer(id)

    if (result.notFound) {
      return res.status(404).json({error_message: "Player not found"})
    }

    res.setHeader('X-Data-Source', result.source)
    res.setHeader(
      'Cache-Control',
      'public, s-maxage=43200, stale-while-revalidate=86400'
    )

    return res.status(200).json({
      player: result.player,
      playerStats: result.playerStats,
      awards: result.awards,
      contracts: result.contracts,
      currentContract: result.currentContract
    })
  } catch (e) {
    console.log(e)
    res.status(500).json({error_message: "Internal Server Error"})
  }
}
