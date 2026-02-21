import { getDraft } from '../../../lib/queries'

export default async function handler(req, res) {
  try {
    const { id } = req.query
    const draft = await getDraft(id)

    if (!draft || draft.length === 0) {
      return res.status(404).json({ error_message: 'Draft not found' })
    }

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
