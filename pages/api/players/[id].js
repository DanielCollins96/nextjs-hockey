import { fetchReadModel, readModelPaths } from '../../../lib/read-models'
import { extractEntityId } from '../../../lib/routes'

const hasPositiveNumber = (value) => {
  const number = Number(value)
  return Number.isFinite(number) && number > 0
}

const needsMeasurementData = (player) =>
  (!hasPositiveNumber(player?.heightInInches) &&
    !hasPositiveNumber(player?.heightInCentimeters)) ||
  (!hasPositiveNumber(player?.weightInPounds) &&
    !hasPositiveNumber(player?.weightInKilograms))

async function fetchNhlPlayerMeasurements(id) {
  try {
    const response = await fetch(`https://api-web.nhle.com/v1/player/${id}/landing`)
    if (!response.ok) return {}

    const player = await response.json()
    return {
      heightInInches: player.heightInInches,
      weightInPounds: player.weightInPounds,
      heightInCentimeters: player.heightInCentimeters,
      weightInKilograms: player.weightInKilograms,
    }
  } catch (error) {
    console.log('Unable to fetch NHL player measurements', error)
    return {}
  }
}

async function hydratePlayerMeasurements(id, playerRows) {
  const safePlayerRows = Array.isArray(playerRows) ? playerRows : []
  if (!safePlayerRows.some(needsMeasurementData)) return safePlayerRows

  const measurements = await fetchNhlPlayerMeasurements(id)
  return safePlayerRows.map((player) =>
    needsMeasurementData(player)
      ? {
          ...player,
          ...measurements,
        }
      : player
  )
}

export default async function handler(req, res) {
  try {
    const id = extractEntityId(req.query.id)
    const readModel = await fetchReadModel(readModelPaths.player(id))

    if (readModel) {
      let playerRows = []
      if (Array.isArray(readModel.player)) {
        playerRows = readModel.player
      } else if (readModel.player) {
        playerRows = [readModel.player]
      }

      const player = playerRows.map((playerRow) => ({
        ...playerRow,
        birthdate: playerRow.birthdate || playerRow.birthDate || null
      }))
      const hydratedPlayer = await hydratePlayerMeasurements(id, player)

      res.setHeader('X-Data-Source', 's3-read-model')
      res.setHeader(
        'Cache-Control',
        'public, s-maxage=43200, stale-while-revalidate=86400'
      )

      return res.status(200).json({
        player: hydratedPlayer,
        playerStats: readModel.playerStats || readModel.stats || [],
        awards: readModel.awards || []
      })
    }

    const { getPlayerStats, getPlayer, getPlayerAwards } = await import('../../../lib/queries')
    const player = await hydratePlayerMeasurements(id, await getPlayer(id))
    if(!player || player.length === 0) return res.status(404).json({error_message: "Player not found"})
    // console.log({player});

    let result = await getPlayerStats(id, player[0]?.position)
    let awards = await getPlayerAwards(id)
    
    res.setHeader('X-Data-Source', 'postgres')
    // Cache for 12 hours (43200 seconds) at the CDN level
    // stale-while-revalidate serves stale data while fetching fresh data in the background
    res.setHeader(
      'Cache-Control',
      'public, s-maxage=43200, stale-while-revalidate=86400'
    );

    res.status(200).json({player, playerStats: result, awards})
  } catch (e) {
    console.log(e)
    res.status(500).json({error_message: "Internal Server Error"})
  }
}
