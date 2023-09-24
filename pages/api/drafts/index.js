//write a nextjs function that calls the lib getAllDraftYears
//and returns a list of years
import { getAllDraftYears } from "../../../lib/queries";

export default async function handler(req, res) {
try {
    const years = await getAllDraftYears()
    console.log(years);
    res.status(200).json(years)
    
} catch (error) {
    
}
}