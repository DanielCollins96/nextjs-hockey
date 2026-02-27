import { getTeamIds } from '../../../lib/queries'

export default async function handler(req, res) {
  try {
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
