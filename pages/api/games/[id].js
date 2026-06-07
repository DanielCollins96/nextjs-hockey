import { fetchReadModel, readModelPaths } from '../../../lib/read-models'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { id } = req.query
    const readModel = await fetchReadModel(readModelPaths.game(id))
    let game
    let goals = []
    let penalties = []
    let threeStars = []

    if (readModel) {
      game = readModel.game
      goals = readModel.goals || []
      penalties = readModel.penalties || []
      threeStars = readModel.threeStars || []
      res.setHeader('X-Data-Source', 's3-read-model')
    } else {
      const { getGameById } = await import('../../../lib/queries')
      game = await getGameById(id)
      res.setHeader('X-Data-Source', 'postgres')
    }

    if (!game) {
      return res.status(404).json({ error_message: 'Game not found' })
    }

    const serializedGame = {
      ...game,
      gameDate: game.gameDate instanceof Date ? game.gameDate.toISOString().split('T')[0] : game.gameDate,
      startTimeUTC: game.startTimeUTC instanceof Date ? game.startTimeUTC.toISOString() : game.startTimeUTC,
    }

    res.setHeader(
      'Cache-Control',
      'public, s-maxage=300, stale-while-revalidate=3600'
    )

    res.status(200).json({
      game: serializedGame,
      goals,
      penalties,
      threeStars,
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error_message: 'Internal Server Error' })
  }
}
