import { useQuery, useQueries } from 'react-query';
import { useRouter } from 'next/router'


const fetchInfo = async () => {
    const router = useRouter()
    const { id } = router.query
    id = 8474056
    // const res = fetch(`https://statsapi.web.nhl.com/api/v1/people/${id}/?stats=yearByYear`)
    console.log(`https://statsapi.web.nhl.com/api/v1/people/${id}/stats`);
    const res = await fetch(`https://statsapi.web.nhl.com/api/v1/people/${id}`);
    const playerRes = await res.json()
    console.log(playerRes)
    // console.log(playerRes);
    return playerRes
};

const fetchYearByYear = async () => {
    // const router = useRouter()
    // const { id } = router.query
    console.log('wha')
    const res = await fetch(`https://statsapi.web.nhl.com/api/v1/people/${id}/stats?stats=yearByYear`);
    const stats = await res.json()
    return stats
}

const PlayerPage = () => {
    const router = useRouter()
    const { id } = router.query
    const { isLoading, isError, data, error } = useQuery('fetchPlayerw', fetchInfo)
    // const { isLoading, isError, data, error } = 
    // const result = 
    // useQueries
    // ([
    //     // { queryKey: 'fetchPlayerStats', queryFn: fetchYearByYear },
    //     { queryFn: fetchInfo },
    // ])
    // console.log(data?.people)
    
    console.log(id)
    return (
        <div>
        {/* <div>
            <h2>{data?.people[0].fullName}</h2>
            <p>{data?.people[0].birthDate}</p>
            <p>{data?.people[0].birthCountry}</p>
            <p>{data?.people[0].primaryNumber}</p>
            <p>{data?.people[0].currentAge}</p>
        </div> */}
        <table>
            <tr>
                <th>Season</th>
                <th>Team</th>
                <th>League</th>
                <th>GP</th>
                <th>G</th>
                <th>A</th>
                <th>Pts</th>
                <th>PIM</th>
            </tr>
            {
                
            }
        </table>
        </div>
    )
};


export default PlayerPage;