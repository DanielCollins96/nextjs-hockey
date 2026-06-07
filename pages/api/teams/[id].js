import { fetchReadModel, readModelPaths } from '../../../lib/read-models'

const normalizeSeasonId = (season) =>
  season === null || season === undefined ? '' : String(season)

const appendDataSource = (dataSource, suffix) =>
  dataSource.includes(suffix) ? dataSource : `${dataSource}+${suffix}`

function hasMissingRosterSeasonRecord(skaters, goalies, teamRecords) {
  const rosterSeasonIds = new Set(
    [...skaters, ...goalies]
      .map((player) => normalizeSeasonId(player?.season))
      .filter(Boolean)
  )

  if (!rosterSeasonIds.size) return false

  const teamRecordSeasonIds = new Set(
    teamRecords
      .map((record) => normalizeSeasonId(record?.seasonId))
      .filter(Boolean)
  )

  return [...rosterSeasonIds].some((season) => !teamRecordSeasonIds.has(season))
}

function hasMissingRosterVitals(skaters, goalies) {
  const rosterRows = [...skaters, ...goalies]

  return rosterRows.length > 0 && rosterRows.some((player) => !player?.birthdate)
}

export default async function handler(req, res) {
  try {
    const { id } = req.query
    const readModel = await fetchReadModel(readModelPaths.team(id))

    if (readModel) {
      if (!readModel.team) {
        return res.status(404).json({error_message: "Team not found"})
      }

      let skaters = readModel.skaters || []
      let goalies = readModel.goalies || []
      let teamRecords = readModel.teamRecords || []
      let dataSource = 's3-read-model'

      if ((!skaters.length && !goalies.length) || hasMissingRosterVitals(skaters, goalies)) {
        try {
          const { getTeamSkaters, getTeamGoalies } = await import('../../../lib/queries')
          const [dbSkaters, dbGoalies] = await Promise.all([
            getTeamSkaters(id),
            getTeamGoalies(id)
          ])

          if (dbSkaters?.length || dbGoalies?.length) {
            skaters = dbSkaters || skaters
            goalies = dbGoalies || goalies
            dataSource = appendDataSource(dataSource, 'postgres-team-players')
          }
        } catch (error) {
          console.warn(`Team ${id} player fallback failed:`, error.message)
        }
      }

      if (hasMissingRosterSeasonRecord(skaters, goalies, teamRecords)) {
        try {
          const { getTeamSeasons } = await import('../../../lib/queries')
          const dbTeamRecords = await getTeamSeasons(id)

          if (dbTeamRecords?.length) {
            teamRecords = dbTeamRecords
            dataSource = appendDataSource(dataSource, 'postgres-team-records')
          }
        } catch (error) {
          console.warn(`Team ${id} team records fallback failed:`, error.message)
        }
      }

      res.setHeader('X-Data-Source', dataSource)
      res.setHeader(
        'Cache-Control',
        'public, s-maxage=43200, stale-while-revalidate=86400'
      )

      return res.status(200).json({
        team: readModel.team,
        teamRecords,
        skaters,
        goalies,
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
    
    res.setHeader('X-Data-Source', 'postgres')
    // Cache for 12 hours (43200 seconds) at the CDN level
    // stale-while-revalidate serves stale data while fetching fresh data in the background
    res.setHeader(
      'Cache-Control',
      'public, s-maxage=43200, stale-while-revalidate=86400'
    );

    res.status(200).json({
      team: teamInfo,
      teamRecords,
      skaters,
      goalies,
      playoffSeasons
    })
  } catch (e) {
    console.log(e)
    res.status(500).json({error_message: "Internal Server Error"})
  }
}
