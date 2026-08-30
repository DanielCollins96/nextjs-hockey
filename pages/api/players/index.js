import { searchPlayersList } from '../../../lib/player-data'

export default async function handler(req, res) {
    try {
        const { q = '', limit = '100' } = req.query
        const result = await searchPlayersList(q, limit)

        res.setHeader('X-Data-Source', result.source)
        res.setHeader(
            'Cache-Control',
            'public, s-maxage=43200, stale-while-revalidate=86400'
        )

        res.status(200).json({ players: result.players })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error_message: 'Internal Server Error' })
    }
}
