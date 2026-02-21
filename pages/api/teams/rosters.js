import { getTeams, getActiveRosters } from '../../../lib/queries'

export default async function handler(req, res) {
  try {
    const [teams, activeRosters] = await Promise.all([
      getTeams(),
      getActiveRosters()
    ])

    const rostersByTeam = {}

    for (const player of activeRosters) {
      const abbrev = player.teamAbbreviation
      if (!rostersByTeam[abbrev]) {
        rostersByTeam[abbrev] = {
          forwards: [],
          defensemen: [],
          goalies: []
        }
      }

      const playerData = {
        position: player.positionGroup,
        id: player.playerId,
        sweaterNumber: player.sweaterNumber ?? null,
        firstName: player.firstName,
        lastName: player.lastName,
      }

      if (player.positionGroup === 'forwards') {
        rostersByTeam[abbrev].forwards.push(playerData)
      } else if (player.positionGroup === 'defensemen') {
        rostersByTeam[abbrev].defensemen.push(playerData)
      } else if (player.positionGroup === 'goalies') {
        rostersByTeam[abbrev].goalies.push(playerData)
      }
    }

    for (const abbrev of Object.keys(rostersByTeam)) {
      for (const position of ['forwards', 'defensemen', 'goalies']) {
        rostersByTeam[abbrev][position].sort((a, b) => {
          const nameA = `${a.firstName || ''} ${a.lastName || ''}`
          const nameB = `${b.firstName || ''} ${b.lastName || ''}`
          return nameA.localeCompare(nameB)
        })
      }
    }

    const rosters = teams.map(team => ({
      team,
      roster: rostersByTeam[team.abbreviation] || {
        forwards: [],
        defensemen: [],
        goalies: []
      }
    }))

    const validRosters = rosters.filter(roster =>
      roster.roster.forwards.length > 0 ||
      roster.roster.defensemen.length > 0 ||
      roster.roster.goalies.length > 0
    )

    res.setHeader(
      'Cache-Control',
      'public, s-maxage=43200, stale-while-revalidate=86400'
    )

    res.status(200).json({ rosters: validRosters })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error_message: 'Internal Server Error' })
  }
}
