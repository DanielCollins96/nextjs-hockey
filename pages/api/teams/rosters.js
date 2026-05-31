import { getTeamRosters } from '../../../lib/team-rosters'

export default async function handler(req, res) {
  try {
    const { rosters, source } = await getTeamRosters()

    res.setHeader('X-Data-Source', source)
    res.setHeader(
      'Cache-Control',
      'public, s-maxage=43200, stale-while-revalidate=86400'
    )

    res.status(200).json({ rosters })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error_message: 'Internal Server Error' })
  }
}
