import { loadTeamIds } from '../../../lib/team-data'
import { PAGE_CACHE, setPageCache } from '../../../lib/http-cache'

export default async function handler(req, res) {
  try {
    const result = await loadTeamIds()

    res.setHeader('X-Data-Source', result.source)
    setPageCache(res, PAGE_CACHE.daily)

    return res.status(200).json({ teamIds: result.teamIds })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error_message: 'Internal Server Error' })
  }
}
