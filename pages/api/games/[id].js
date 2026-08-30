import { loadGame } from '../../../lib/game-data'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const result = await loadGame(req.query.id)

    if (result.notFound) {
      return res.status(404).json({ error_message: 'Game not found' })
    }

    res.setHeader('X-Data-Source', result.source)
    res.setHeader(
      'Cache-Control',
      'public, s-maxage=300, stale-while-revalidate=3600'
    )

    res.status(200).json({
      game: result.game,
      goals: result.goals,
      penalties: result.penalties,
      threeStars: result.threeStars,
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error_message: 'Internal Server Error' })
  }
}
