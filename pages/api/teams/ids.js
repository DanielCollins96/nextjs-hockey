import { fetchReadModel, readModelPaths, unwrapReadModel } from '../../../lib/read-models'

function hasTeamNames(teamIds) {
  return teamIds.some((team) => team?.name || team?.fullName || team?.abbreviation)
}

export default async function handler(req, res) {
  try {
    const readModel = await fetchReadModel(readModelPaths.teamIds())
    let readModelTeamIds = null

    if (readModel) {
      const teamIds = unwrapReadModel(readModel, 'teamIds') || []
      readModelTeamIds = teamIds

      if (hasTeamNames(teamIds)) {
        res.setHeader('X-Data-Source', 's3-read-model')
        res.setHeader(
          'Cache-Control',
          'public, s-maxage=86400, stale-while-revalidate=172800'
        )

        return res.status(200).json({ teamIds })
      }
    }

    let teamIds = []
    try {
      const { getTeamIds } = await import('../../../lib/queries')
      teamIds = await getTeamIds()
    } catch (error) {
      if (!readModelTeamIds) throw error
      console.warn('Named team IDs fallback failed:', error.message)
      teamIds = readModelTeamIds
    }

    res.setHeader('X-Data-Source', teamIds === readModelTeamIds ? 's3-read-model' : 'postgres')
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
