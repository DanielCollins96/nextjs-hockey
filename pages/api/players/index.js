import { searchPlayersList } from '../../../lib/player-data'
import { PAGE_CACHE, setPageCache } from '../../../lib/http-cache'

export default async function handler(req, res) {
    try {
        const { q = '', limit = '100' } = req.query
        const result = await searchPlayersList(q, limit)

        res.setHeader('X-Data-Source', result.source)
        setPageCache(res, PAGE_CACHE.search)

        res.status(200).json({ players: result.players })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error_message: 'Internal Server Error' })
    }
}
