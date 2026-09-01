import { loadSearch } from '../../lib/search-data'

export default async function handler(req, res) {
  try {
    const { q = '', limit = '8' } = req.query
    const result = await loadSearch(q, limit)

    res.setHeader(
      'Cache-Control',
      'public, s-maxage=43200, stale-while-revalidate=86400'
    )
    res.setHeader('X-Data-Source', result.source)
    return res.status(200).json({
      players: result.players,
      teams: result.teams,
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error_message: 'Internal Server Error' })
  }
}
