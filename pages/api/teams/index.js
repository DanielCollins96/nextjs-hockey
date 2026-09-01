import { loadTeams } from '../../../lib/team-data'

export default async function handler(req, res) {
  try {
    const result = await loadTeams()

    res.setHeader('X-Data-Source', result.source)
    res.setHeader(
      'Cache-Control',
      'public, s-maxage=43200, stale-while-revalidate=86400'
    )

    return res.status(200).json({ teams: result.teams })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error_message: 'Internal Server Error' })
  }
}
