import { fetchReadModel, readModelPaths } from '../../../lib/read-models'


export default async function handler(req, res) {
  try {
    const { id } = req.query
    const readModel = await fetchReadModel(readModelPaths.player(id))

    if (readModel) {
      let playerRows = []
      if (Array.isArray(readModel.player)) {
        playerRows = readModel.player
      } else if (readModel.player) {
        playerRows = [readModel.player]
      }

      const player = playerRows.map((playerRow) => ({
        ...playerRow,
        birthdate: playerRow.birthdate || playerRow.birthDate || null
      }))

      res.setHeader('X-Data-Source', 's3-read-model')
      res.setHeader(
        'Cache-Control',
        'public, s-maxage=43200, stale-while-revalidate=86400'
      )

      return res.status(200).json({
        player,
        playerStats: readModel.playerStats || readModel.stats || [],
        awards: readModel.awards || []
      })
    }

    const { getPlayerStats, getPlayer, getPlayerAwards } = await import('../../../lib/queries')
    const player = await getPlayer(id)
    if(!player || player.length === 0) return res.status(404).json({error_message: "Player not found"})
    // console.log({player});

    let result = await getPlayerStats(id, player[0]?.position)
    let awards = await getPlayerAwards(id)
    
    res.setHeader('X-Data-Source', 'postgres')
    // Cache for 12 hours (43200 seconds) at the CDN level
    // stale-while-revalidate serves stale data while fetching fresh data in the background
    res.setHeader(
      'Cache-Control',
      'public, s-maxage=43200, stale-while-revalidate=86400'
    );

    res.status(200).json({player, playerStats: result, awards})
  } catch (e) {
    console.log(e)
    res.status(500).json({error_message: "Internal Server Error"})
  }
}
