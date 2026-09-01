import { loadDraftYears } from "../../../lib/draft-data";

export default async function handler(req, res) {
    try {
        const result = await loadDraftYears()

        res.setHeader('X-Data-Source', result.source)
        res.setHeader(
            'Cache-Control',
            'public, s-maxage=86400, stale-while-revalidate=172800'
        )
        res.status(200).json({ years: result.years })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error_message: 'Internal Server Error' })
    }
}
