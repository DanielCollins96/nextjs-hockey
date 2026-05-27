import { fetchReadModel, readModelPaths, unwrapReadModel } from '../../../lib/read-models'

export default async function handler(req, res) {
  try {
    const readModel = await fetchReadModel(readModelPaths.teams())

    if (readModel) {
      const teams = unwrapReadModel(readModel, 'teams') || []

      res.setHeader(
        'Cache-Control',
        'public, s-maxage=43200, stale-while-revalidate=86400'
      )

      return res.status(200).json({ teams })
    }

    const { getTeams } = await import('../../../lib/queries')
    const teams = await getTeams()

    res.setHeader(
      'Cache-Control',
      'public, s-maxage=43200, stale-while-revalidate=86400'
    )

    res.status(200).json({ teams })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error_message: 'Internal Server Error' })
  }
}
