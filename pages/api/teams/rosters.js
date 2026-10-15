import { getTeamRosters } from '../../../lib/team-rosters'
import { PAGE_CACHE, setPageCache } from '../../../lib/http-cache'

export default async function handler(req, res) {
  try {
    const { rosters, source } = await getTeamRosters()

    res.setHeader('X-Data-Source', source)
    setPageCache(res, PAGE_CACHE.live)

    res.status(200).json({ rosters })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error_message: 'Internal Server Error' })
  }
}
