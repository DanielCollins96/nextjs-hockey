import { extractEntityId } from '../../../../lib/routes'
import { loadDraftByTeam } from '../../../../lib/draft-data'

export default async function handler(req, res) {
  try {
    const id = extractEntityId(req.query.id)
    const result = await loadDraftByTeam(id)

    if (result.notFound) {
      return res.status(404).json({ error_message: 'Team draft history not found' })
    }

    res.setHeader('X-Data-Source', result.source)
    res.setHeader(
      'Cache-Control',
      'public, s-maxage=86400, stale-while-revalidate=172800'
    )

    return res.status(200).json({
      team: result.team,
      draft: result.draft,
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error_message: 'Internal Server Error' })
  }
}
