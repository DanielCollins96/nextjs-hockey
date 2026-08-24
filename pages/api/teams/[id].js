import { fetchReadModel, readModelPaths } from '../../../lib/read-models'
import { extractEntityId } from '../../../lib/routes'
import { normalizeSeasonId } from '../../../lib/season'

const MIN_CONTRACT_SEASON = '20052006'

function getContractSeason(rosterRows, requestedSeason) {
  const requestedSeasonId = normalizeSeasonId(requestedSeason)
  if (requestedSeasonId) return requestedSeasonId

  return rosterRows
    .map((player) => normalizeSeasonId(player?.season))
    .filter(Boolean)
    .sort((a, b) => b.localeCompare(a))[0] || ''
}

function normalizeTeamContractReadModel(payload) {
  if (!payload) return []
  if (Array.isArray(payload)) return payload
  return Array.isArray(payload.teamContracts) ? payload.teamContracts : []
}

async function fetchTeamContracts(skaters, goalies, requestedSeason) {
  const rosterRows = [...(skaters || []), ...(goalies || [])].filter(
    (player) => normalizeSeasonId(player?.season) >= MIN_CONTRACT_SEASON
  )
  const contractSeason = getContractSeason(rosterRows, requestedSeason)
  if (!contractSeason) return []

  const teamId = rosterRows.find((player) => normalizeSeasonId(player?.season) === contractSeason)?.id
  if (!teamId) return []

  const teamContractReadModel = await fetchReadModel(
    readModelPaths.teamContracts(teamId, contractSeason),
    { missStatuses: [403, 404] }
  )
  return normalizeTeamContractReadModel(teamContractReadModel)
}

export default async function handler(req, res) {
  try {
    const id = extractEntityId(req.query.id)
    const contractSeason = Array.isArray(req.query.contractSeason)
      ? req.query.contractSeason[0]
      : req.query.contractSeason
    const contractsOnly = req.query.contractsOnly === '1'
    const readModel = await fetchReadModel(readModelPaths.team(id))

    if (readModel) {
      if (!readModel.team) {
        return res.status(404).json({error_message: "Team not found"})
      }

      let skaters = readModel.skaters || []
      let goalies = readModel.goalies || []
      let teamRecords = readModel.teamRecords || []
      let dataSource = 's3-read-model'

      const teamContracts = await fetchTeamContracts(skaters, goalies, contractSeason)
      if (teamContracts.length) {
        dataSource = `${dataSource}+s3-player-contracts`
      }

      res.setHeader('X-Data-Source', dataSource)
      res.setHeader(
        'Cache-Control',
        'public, s-maxage=43200, stale-while-revalidate=86400'
      )

      if (contractsOnly) {
        return res.status(200).json({ teamContracts })
      }

      return res.status(200).json({
        team: readModel.team,
        teamRecords,
        skaters,
        goalies,
        teamContracts,
        playoffSeasons: readModel.playoffSeasons || []
      })
    }

    const { getTeamInfo, getTeamSeasons, getTeamSkaters, getTeamGoalies, getPlayoffYears } = await import('../../../lib/queries')
    
    const teamInfo = await getTeamInfo(id)
    if (!teamInfo) return res.status(404).json({error_message: "Team not found"})

    const [teamRecords, skaters, goalies] = await Promise.all([
      getTeamSeasons(id),
      getTeamSkaters(id),
      getTeamGoalies(id)
    ])

    const playoffSeasons = await getPlayoffYears(teamInfo.abbreviation)
    const teamContracts = await fetchTeamContracts(skaters, goalies, contractSeason)
    
    res.setHeader('X-Data-Source', teamContracts.length ? 'postgres+s3-player-contracts' : 'postgres')
    // Cache for 12 hours (43200 seconds) at the CDN level
    // stale-while-revalidate serves stale data while fetching fresh data in the background
    res.setHeader(
      'Cache-Control',
      'public, s-maxage=43200, stale-while-revalidate=86400'
    );

    if (contractsOnly) {
      return res.status(200).json({ teamContracts })
    }

    res.status(200).json({
      team: teamInfo,
      teamRecords,
      skaters,
      goalies,
      teamContracts,
      playoffSeasons
    })
  } catch (e) {
    console.log(e)
    res.status(500).json({error_message: "Internal Server Error"})
  }
}
