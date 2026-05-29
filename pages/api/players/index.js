import { fetchReadModel, readModelPaths, unwrapReadModel } from '../../../lib/read-models'

function normalizeSearchTerm(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '')
}

function comparePlayerSearchResults(left, right) {
    return (Number(right.games) || 0) - (Number(left.games) || 0)
        || (Number(right.points) || 0) - (Number(left.points) || 0)
        || (Number(right.goals) || 0) - (Number(left.goals) || 0)
}

export default async function handler(req, res) {
    try {
        const { q = '', limit = '100' } = req.query
        const parsedLimit = Number.parseInt(limit, 10)
        const safeLimit = Number.isNaN(parsedLimit) ? 100 : Math.min(Math.max(parsedLimit, 1), 200)
        const normalizedSearchTerm = normalizeSearchTerm(q)
        const searchBucket = /^[a-z]/.test(normalizedSearchTerm)
            ? normalizedSearchTerm[0]
            : null

        if (!normalizedSearchTerm || normalizedSearchTerm.length < 2) {
            res.setHeader('X-Data-Source', 'none')
            res.setHeader(
                'Cache-Control',
                'public, s-maxage=43200, stale-while-revalidate=86400'
            )

            return res.status(200).json({ players: [] })
        }

        const readModel = searchBucket
            ? await fetchReadModel(readModelPaths.playerSearch(searchBucket))
            : null

        if (readModel) {
            const playersIndex = unwrapReadModel(readModel, 'players') || []
            const players = normalizedSearchTerm
                ? playersIndex
                    .filter((player) => {
                        const searchText = normalizeSearchTerm(
                            player.searchText || player.player_name || ''
                        )
                        return searchText.includes(normalizedSearchTerm)
                    })
                    .sort(comparePlayerSearchResults)
                    .slice(0, safeLimit)
                : []

            res.setHeader('X-Data-Source', 's3-read-model')
            res.setHeader(
                'Cache-Control',
                'public, s-maxage=43200, stale-while-revalidate=86400'
            )

            return res.status(200).json({ players })
        }

        const { searchPlayers } = await import('../../../lib/queries')
        const players = q ? await searchPlayers(String(q), safeLimit) : []

        res.setHeader('X-Data-Source', 'postgres')
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
