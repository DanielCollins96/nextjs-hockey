import conn from '../../../lib/db'
import { getPlayer } from '../../../lib/queries'


export default async function handler(req, res) {
  try {
    const { id } = req.query
    let result = await getPlayer(id)
    console.log(result);
    res.status(200).json(result)
  } catch (e) {
    console.log(e)
  }
}