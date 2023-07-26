import conn from '../../lib/db'
import { getAllPlayerIds } from '../../lib/queries'

export default async function handler(req, res) {
    try {
        const playerIds = await getAllPlayerIds()
        res.status(200).json(playerIds)
        }
        catch (e) {
            res.status(500).json({ message: e.message })
        }
}

