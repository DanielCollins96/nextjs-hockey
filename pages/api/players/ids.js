import { loadPlayerIds } from '../../../lib/player-data'

export default async function handler(req, res) {
  try {
    const result = await loadPlayerIds()

    res.setHeader('X-Data-Source', result.source)
    res.setHeader(
      'Cache-Control',
      'public, s-maxage=86400, stale-while-revalidate=172800'
    )

    return res.status(200).json({ playerIds: result.playerIds })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error_message: 'Internal Server Error' })
  }
}
