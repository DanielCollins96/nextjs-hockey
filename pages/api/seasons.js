import { getPointLeadersBySeason, getGoalieLeadersBySeason, getAvailableSeasons } from '../../lib/queries'

export default async function handler(req, res) {
  try {
    const { year } = req.query
    const season = year ? Number.parseInt(year, 10) : 20252026

    const [players, goalies, availableSeasons] = await Promise.all([
      getPointLeadersBySeason(season),
      getGoalieLeadersBySeason(season),
      getAvailableSeasons()
    ])

    res.setHeader(
      'Cache-Control',
      'public, s-maxage=43200, stale-while-revalidate=86400'
    )

    res.status(200).json({
      players: players || [],
      goalies: goalies || [],
      availableSeasons: availableSeasons || [],
      season
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error_message: 'Internal Server Error' })
  }
}
