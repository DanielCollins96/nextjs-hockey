import { getAllPlayerIds } from '../../../lib/queries'

export default async function handler(req, res) {
  try {
    const playerIds = await getAllPlayerIds()

    res.setHeader(
      'Cache-Control',
      'public, s-maxage=86400, stale-while-revalidate=172800'
    )

    res.status(200).json({ playerIds: playerIds || [] })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error_message: 'Internal Server Error' })
  }
}
