import { extractEntityId } from '../../../lib/routes'
import { loadTeam, loadTeamContractsOnly } from '../../../lib/team-data'

export default async function handler(req, res) {
  try {
    const id = extractEntityId(req.query.id)
    const contractSeason = Array.isArray(req.query.contractSeason)
      ? req.query.contractSeason[0]
      : req.query.contractSeason
    const season = Array.isArray(req.query.season) ? req.query.season[0] : req.query.season
    const contractsOnly = req.query.contractsOnly === '1'

    const result = contractsOnly
      ? await loadTeamContractsOnly(id, contractSeason || season)
      : await loadTeam(id, {
          contractSeason: contractSeason || season,
          rosterSeason: season || undefined,
        })

    if (result.notFound) {
      return res.status(404).json({error_message: "Team not found"})
    }

    res.setHeader('X-Data-Source', result.source)
    res.setHeader(
      'Cache-Control',
      'public, s-maxage=43200, stale-while-revalidate=86400'
    )

    if (contractsOnly) {
      return res.status(200).json({ teamContracts: result.teamContracts })
    }

    return res.status(200).json({
      team: result.team,
      teamRecords: result.teamRecords,
      skaters: result.skaters,
      goalies: result.goalies,
      teamContracts: result.teamContracts,
      playoffSeasons: result.playoffSeasons,
      seasonIds: result.seasonIds || [],
    })
  } catch (e) {
    console.log(e)
    res.status(500).json({error_message: "Internal Server Error"})
  }
}
