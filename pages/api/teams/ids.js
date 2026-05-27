import { fetchReadModel, readModelPaths, unwrapReadModel } from '../../../lib/read-models'

export default async function handler(req, res) {
  try {
    const readModel = await fetchReadModel(readModelPaths.teamIds())

    if (readModel) {
      const teamIds = unwrapReadModel(readModel, 'teamIds') || []

      res.setHeader(
        'Cache-Control',
        'public, s-maxage=86400, stale-while-revalidate=172800'
      )

      return res.status(200).json({ teamIds })
    }

    const { getTeamIds } = await import('../../../lib/queries')
    const teamIds = await getTeamIds()

    res.setHeader(
      'Cache-Control',
      'public, s-maxage=86400, stale-while-revalidate=172800'
    )

    res.status(200).json({ teamIds: teamIds || [] })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error_message: 'Internal Server Error' })
  }
}
