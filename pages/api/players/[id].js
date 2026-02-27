import { getPlayerStats, getPlayer, getPlayerAwards } from '../../../lib/queries'


export default async function handler(req, res) {
  try {
    const { id } = req.query
    const player = await getPlayer(id)
    if(player.length === 0) return res.status(404).json({error_message: "Player not found"})
    // console.log({player});

    let result = await getPlayerStats(id, player[0]?.position)
    let awards = await getPlayerAwards(id)
    
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