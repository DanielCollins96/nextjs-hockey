import { extractEntityId } from '../../../lib/routes'
import { loadPlayer } from '../../../lib/player-data'
import { PAGE_CACHE, setPageCache } from '../../../lib/http-cache'

export default async function handler(req, res) {
  try {
    const id = extractEntityId(req.query.id)
    const result = await loadPlayer(id)

    if (result.notFound) {
      return res.status(404).json({error_message: "Player not found"})
    }

    res.setHeader('X-Data-Source', result.source)
    setPageCache(res, PAGE_CACHE.live)

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
