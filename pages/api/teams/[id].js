import { getTeamInfo, getTeamSeasons, getTeamSkaters, getTeamGoalies, getPlayoffYears } from '../../../lib/queries'

export default async function handler(req, res) {
  try {
    const { id } = req.query
    
    const teamInfo = await getTeamInfo(id)
    if (!teamInfo) return res.status(404).json({error_message: "Team not found"})

    const [teamRecords, skaters, goalies] = await Promise.all([
      getTeamSeasons(id),
      getTeamSkaters(id),
      getTeamGoalies(id)
    ])

    const playoffSeasons = await getPlayoffYears(teamInfo.abbreviation)
    
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
