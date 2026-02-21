import { getTeams } from '../../../lib/queries'

export default async function handler(req, res) {
  try {
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
