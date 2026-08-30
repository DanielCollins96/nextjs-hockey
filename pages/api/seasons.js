import { loadSeason } from '../../lib/season-data'

export default async function handler(req, res) {
  try {
    const result = await loadSeason(req.query.year)

    if (result.notFound) {
      return res.status(404).json({ error_message: "Season not found" })
    }

    if (result.error) {
      return res.status(400).json({ error_message: result.error })
    }

    res.setHeader('X-Data-Source', result.source)
    res.setHeader(
      'Cache-Control',
      'public, s-maxage=43200, stale-while-revalidate=86400'
    )

    res.status(200).json({
      players: result.players,
      goalies: result.goalies,
      availableSeasons: result.availableSeasons,
      season: result.season
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error_message: 'Internal Server Error' })
  }
}
