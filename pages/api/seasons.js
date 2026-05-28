import { fetchReadModel, readModelPaths } from '../../lib/read-models'

export default async function handler(req, res) {
  try {
    const { year } = req.query
    const season = year ? Number.parseInt(year, 10) : 20252026

    if (Number.isNaN(season)) {
      return res.status(400).json({ error_message: 'Invalid season year' })
    }

    const readModel = await fetchReadModel(readModelPaths.season(season))

    if (readModel) {
      res.setHeader('X-Data-Source', 's3-read-model')
      res.setHeader(
        'Cache-Control',
        'public, s-maxage=43200, stale-while-revalidate=86400'
      )

      return res.status(200).json({
        players: readModel.players || [],
        goalies: readModel.goalies || [],
        availableSeasons: readModel.availableSeasons || [],
        season: readModel.season || season
      })
    }

    const { getPointLeadersBySeason, getGoalieLeadersBySeason, getAvailableSeasons } = await import('../../lib/queries')
    const [players, goalies, availableSeasons] = await Promise.all([
      getPointLeadersBySeason(season),
      getGoalieLeadersBySeason(season),
      getAvailableSeasons()
    ])

    res.setHeader('X-Data-Source', 'postgres')
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
