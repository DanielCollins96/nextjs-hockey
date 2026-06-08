import { fetchReadModel, readModelPaths, unwrapReadModel } from '../../../lib/read-models'

function hasPlayerNames(playerIds) {
  return playerIds.some((player) => player?.player_name || player?.name || player?.fullName)
}

export default async function handler(req, res) {
  try {
    const readModel = await fetchReadModel(readModelPaths.playerIds())
    let readModelPlayerIds = null

    if (readModel) {
      const playerIds = unwrapReadModel(readModel, 'playerIds') || []
      readModelPlayerIds = playerIds

      if (hasPlayerNames(playerIds)) {
        res.setHeader('X-Data-Source', 's3-read-model')
        res.setHeader(
          'Cache-Control',
          'public, s-maxage=86400, stale-while-revalidate=172800'
        )

        return res.status(200).json({ playerIds })
      }
    }

    let playerIds = []
    try {
      const { getAllPlayerIds } = await import('../../../lib/queries')
      playerIds = await getAllPlayerIds()
    } catch (error) {
      if (!readModelPlayerIds) throw error
      console.warn('Named player IDs fallback failed:', error.message)
      playerIds = readModelPlayerIds
    }

    res.setHeader('X-Data-Source', playerIds === readModelPlayerIds ? 's3-read-model' : 'postgres')
    res.setHeader(
      'Cache-Control',
      'public, s-maxage=86400, stale-while-revalidate=172800'
    )

    res.status(200).json({ playerIds: playerIds || [] })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error_message: 'Internal Server Error' })
  }
}
