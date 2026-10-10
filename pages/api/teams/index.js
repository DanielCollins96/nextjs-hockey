import { loadTeams } from '../../../lib/team-data'
import { PAGE_CACHE, setPageCache } from '../../../lib/http-cache'

export default async function handler(req, res) {
  try {
    const result = await loadTeams()

    res.setHeader('X-Data-Source', result.source)
    setPageCache(res, PAGE_CACHE.live)

    return res.status(200).json({ teams: result.teams })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error_message: 'Internal Server Error' })
  }
}
