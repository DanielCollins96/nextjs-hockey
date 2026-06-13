import { fetchReadModel, readModelPaths, unwrapReadModel } from '../../lib/read-models'
import { playerUrl, teamUrl } from '../../lib/routes'

function normalizeSearchTerm(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function normalizeCompact(value) {
  return normalizeSearchTerm(value).replace(/[^a-z0-9]/g, '')
}

function parseLimit(value, fallback = 8, max = 25) {
  const parsed = Number.parseInt(value, 10)
  if (Number.isNaN(parsed)) return fallback
  return Math.min(Math.max(parsed, 1), max)
}

function mapPlayer(player) {
  const name = player.player_name || ''
  const id = player.playerId

  return {
    type: 'player',
    id,
    name,
    teamName: player.team_name || player.team_abbrev || '',
    position: player.position || '',
    href: playerUrl(name, id),
  }
}

function mapTeam(team) {
  const abbreviation = team.abbreviation || team.abbrev || ''
  const name = team.name || team.fullName || abbreviation
  const id = team.id

  return {
    type: 'team',
    id,
    name,
    abbreviation,
    href: teamUrl(name, id),
    logo: abbreviation
      ? `https://assets.nhle.com/logos/nhl/svg/${abbreviation}_dark.svg`
      : '',
  }
}

function sortTeamsByMatch(left, right, compactQuery) {
  const leftAbbrev = normalizeCompact(left.abbreviation || left.abbrev || '')
  const rightAbbrev = normalizeCompact(right.abbreviation || right.abbrev || '')
  const leftName = normalizeCompact(left.name || left.fullName || '')
  const rightName = normalizeCompact(right.name || right.fullName || '')

  const leftRank = leftAbbrev === compactQuery ? 0 : leftAbbrev.startsWith(compactQuery) ? 1 : leftName.startsWith(compactQuery) ? 2 : 3
  const rightRank = rightAbbrev === compactQuery ? 0 : rightAbbrev.startsWith(compactQuery) ? 1 : rightName.startsWith(compactQuery) ? 2 : 3

  return leftRank - rightRank || leftName.localeCompare(rightName)
}

async function searchTeamsFromReadModel(query, limit) {
  const readModel = await fetchReadModel(readModelPaths.teams())
  if (!readModel) return null

  const compactQuery = normalizeCompact(query)
  const teamsIndex = unwrapReadModel(readModel, 'teams') || []
  return teamsIndex
    .filter((team) => {
      const searchText = [
        team.name,
        team.fullName,
        team.abbreviation,
        team.abbrev,
        team.id,
      ].join(' ')
      return normalizeCompact(searchText).includes(compactQuery)
    })
    .sort((left, right) => sortTeamsByMatch(left, right, compactQuery))
    .slice(0, limit)
}

export default async function handler(req, res) {
  try {
    const { q = '', limit = '8' } = req.query
    const query = String(q).trim()
    const safeLimit = parseLimit(limit)
    const compactQuery = normalizeCompact(query)

    res.setHeader(
      'Cache-Control',
      'public, s-maxage=43200, stale-while-revalidate=86400'
    )

    if (!compactQuery || compactQuery.length < 2) {
      res.setHeader('X-Data-Source', 'none')
      return res.status(200).json({ players: [], teams: [] })
    }

    const searchBucket = /^[a-z]/.test(compactQuery) ? compactQuery[0] : null
    const [playerReadModel, readModelTeams] = await Promise.all([
      searchBucket
        ? fetchReadModel(readModelPaths.playerSearch(searchBucket))
        : Promise.resolve(null),
      searchTeamsFromReadModel(query, safeLimit),
    ])

    let players = []
    let teams = readModelTeams
    let dataSource = []

    if (playerReadModel) {
      const playersIndex = unwrapReadModel(playerReadModel, 'players') || []
      players = playersIndex
        .filter((player) => {
          const searchText = normalizeCompact(
            player.searchText || player.player_name || ''
          )
          return searchText.includes(compactQuery)
        })
        .sort((left, right) =>
          (Number(right.games) || 0) - (Number(left.games) || 0)
          || (Number(right.points) || 0) - (Number(left.points) || 0)
          || (Number(right.goals) || 0) - (Number(left.goals) || 0)
        )
        .slice(0, safeLimit)
      dataSource.push('s3-player-search')
    }

    if (teams) {
      dataSource.push('s3-teams')
    }

    if (!playerReadModel || !teams) {
      const { searchPlayers, searchTeams } = await import('../../lib/queries')
      const [dbPlayers, dbTeams] = await Promise.all([
        !playerReadModel ? searchPlayers(query, safeLimit) : Promise.resolve(players),
        !teams ? searchTeams(query, safeLimit) : Promise.resolve(teams),
      ])

      if (!playerReadModel) {
        players = dbPlayers
        dataSource.push('postgres-player-search')
      }
      if (!teams) {
        teams = dbTeams
        dataSource.push('postgres-teams')
      }
    }

    res.setHeader('X-Data-Source', dataSource.join(',') || 'none')
    return res.status(200).json({
      players: players.map(mapPlayer),
      teams: (teams || []).map(mapTeam),
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error_message: 'Internal Server Error' })
  }
}
