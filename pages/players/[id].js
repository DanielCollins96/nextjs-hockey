import { useQuery, useQueries } from 'react-query';
import { useRouter } from 'next/router';
import s from './player.module.css';

// https://statsapi.web.nhl.com/api/v1/people/8474056/stats/?stats=statsSingleSeason&season=20122013

const PlayerPage = ({id}) => {
    console.log('why')
    console.log(id)
    // console.log(pathname)
    // const router = useRouter()
    // const { id } = router.query
    // console.log(query)
    // const { isLoading, isError, data, error } = useQuery('fetchPlayer', async () => {
    //     const res = await fetch(`https://statsapi.web.nhl.com/api/v1/people/${id}`);
    //     const playerRes = await res.json()
    //     return playerRes
    // })

    const result = 
    useQueries
    ([
        { queryKey: 'fetchPlayerStats', queryFn: async () => {
            const res = await fetch(`https://statsapi.web.nhl.com/api/v1/people/${id}/stats?stats=yearByYear`);
            const playerRes = await res.json()
            return playerRes
            } 
        },
        { queryKey: 'fetchPlayer', queryFn: async () => {
            const res = await fetch(`https://statsapi.web.nhl.com/api/v1/people/${id}`);
            const playerRes = await res.json()
            return playerRes
            } 
        },
    ])
    const { [0]: {data: stat_data, isLoading: stat_loading}, [1]: { data: person_data, isLoading: person_loading } } = result
    // console.log(player)
    // console.log(stats)
    console.log(result)
    console.log(stat_loading)
    return (
        <div className={s.main}>
            <h1>Player Stats</h1>
            <div>
                {!person_loading && person_data ? (
                    <div>
                    <h2>{person_data.people[0].fullName}</h2>
                    <p>{person_data.people[0].birthDate}</p>
                    <p>{person_data.people[0].birthCountry}</p>
                    <p>{person_data.people[0].primaryNumber}</p>
                    <p>{person_data.people[0].currentAge}</p>
                    </div>
                ) :
                <p>Loading...</p>    
            }
            </div>
            {/* {JSON.stringify(stat_data.stats[0].splits)} */}
            <table className={s.table}>
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
                {!stat_loading && !!stat_data.stats[0] ? stat_data.stats[0].splits.map((szn) => {
                        return (
                        <tr>
                            <td>{szn.season.substring(0,4)+'/'+szn.season.substring(4,8)}</td>
                            <td>{szn.team.name}</td>
                            <td>{szn.league.name}</td>
                            <td>{szn.stat.games}</td>
                            <td>{szn.stat.goals}</td>
                            <td>{szn.stat.assists}</td>
                            <td>{szn.stat.points}</td>
                            <td>{szn.stat.pim}</td>
                        </tr>)          
                }) :
                <p>Loading...</p>
                }
            </table>
        </div>
    )
};

export async function getServerSideProps ({params}) {
    console.log(params)

    return { 
        props: params 
    }
}


export default PlayerPage;