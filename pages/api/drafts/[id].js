import { loadDraft } from '../../../lib/draft-data'
import { PAGE_CACHE, setPageCache } from '../../../lib/http-cache'

export default async function handler(req, res) {
  try {
    const result = await loadDraft(req.query.id)

    if (result.notFound) {
      return res.status(404).json({ error_message: 'Draft not found' })
    }

    res.setHeader('X-Data-Source', result.source)
    setPageCache(res, PAGE_CACHE.daily)

    return res.status(200).json({ draft: result.draft })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error_message: 'Internal Server Error' })
  }
}
