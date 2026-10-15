import { loadSearch } from '../../lib/search-data'
import { PAGE_CACHE, setPageCache } from '../../lib/http-cache'

export default async function handler(req, res) {
  try {
    const { q = '', limit = '8' } = req.query
    const result = await loadSearch(q, limit)

    setPageCache(res, PAGE_CACHE.search)
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
