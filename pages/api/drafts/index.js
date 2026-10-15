import { loadDraftYears } from "../../../lib/draft-data";
import { PAGE_CACHE, setPageCache } from "../../../lib/http-cache";

export default async function handler(req, res) {
    try {
        const result = await loadDraftYears()

        res.setHeader('X-Data-Source', result.source)
        setPageCache(res, PAGE_CACHE.daily)
        res.status(200).json({ years: result.years })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error_message: 'Internal Server Error' })
    }
}
