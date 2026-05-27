import { fetchReadModel, readModelPaths, unwrapReadModel } from "../../../lib/read-models";

export default async function handler(req, res) {
    try {
        const readModel = await fetchReadModel(readModelPaths.draftYears())

        if (readModel) {
            const years = unwrapReadModel(readModel, 'years') || []

            res.setHeader(
                'Cache-Control',
                'public, s-maxage=86400, stale-while-revalidate=172800'
            )

            return res.status(200).json({ years })
        }

        const { getAllDraftYears } = await import("../../../lib/queries")
        const years = await getAllDraftYears()
        res.setHeader(
            'Cache-Control',
            'public, s-maxage=86400, stale-while-revalidate=172800'
        )
        res.status(200).json({ years })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error_message: 'Internal Server Error' })
    }
}
