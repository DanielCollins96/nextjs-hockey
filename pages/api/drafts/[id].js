import { fetchReadModel, readModelPaths, unwrapReadModel } from '../../../lib/read-models'

export default async function handler(req, res) {
  try {
    const { id } = req.query
    const readModel = await fetchReadModel(readModelPaths.draft(id))

    if (readModel) {
      const draft = unwrapReadModel(readModel, 'draft') || []

      if (!draft || draft.length === 0) {
        return res.status(404).json({ error_message: 'Draft not found' })
      }

      res.setHeader('X-Data-Source', 's3-read-model')
      res.setHeader(
        'Cache-Control',
        'public, s-maxage=86400, stale-while-revalidate=172800'
      )

      return res.status(200).json({ draft })
    }

    const { getDraft } = await import('../../../lib/queries')
    const draft = await getDraft(id)

    if (!draft || draft.length === 0) {
      return res.status(404).json({ error_message: 'Draft not found' })
    }

    res.setHeader('X-Data-Source', 'postgres')
    res.setHeader(
      'Cache-Control',
      'public, s-maxage=86400, stale-while-revalidate=172800'
    )

    res.status(200).json({ draft })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error_message: 'Internal Server Error' })
  }
}
