import { searchPlayers } from '../../../lib/queries'

export default async function handler(req, res) {
    try {
        const { q = '', limit = '100' } = req.query
        const parsedLimit = Number.parseInt(limit, 10)
        const safeLimit = Number.isNaN(parsedLimit) ? 100 : Math.min(Math.max(parsedLimit, 1), 200)

        const players = q ? await searchPlayers(String(q), safeLimit) : []

        res.setHeader(
            'Cache-Control',
            'public, s-maxage=43200, stale-while-revalidate=86400'
        )

        res.status(200).json({ players })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error_message: 'Internal Server Error' })
    }
}