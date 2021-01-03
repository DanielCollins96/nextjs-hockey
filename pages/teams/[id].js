import { useQuery, useQueries } from 'react-query';

import s from './team.module.css';

export default function TeamPage({id}) {
    // const response = useQuery('fetchPlayer', async () => {
    //     const res = await fetch(`https://statsapi.web.nhl.com/api/v1/teams/${id}`)
    //     const teamRes = await res.json()
    //     return teamRes.teams
    // })
    const result = 
    useQueries
    ([
        { queryKey: 'fetchYearlyStats', queryFn: async () => {
            const res = await fetch(`https://statsapi.web.nhl.com/api/v1/teams/${id}?expand=team.stats&`);
            const seasonStats = await res.json()
            return seasonStats.teams
            } 
        },
        { queryKey: 'fetchTeam', queryFn: async () => {
            const res = await fetch(`https://statsapi.web.nhl.com/api/v1/teams/${id}`);
            const teamRes = await res.json()
            return teamRes.teams
            } 
        },
    ])
    const { [0]: {data: season_data, isLoading: season_loading, isError: isSErr, error: sErr}, [1]: { data: team_data, isLoading: team_loading, isError: isTErr, error:  tErr} } = result
    // const { isLoading, isError, data, error } = response
    // console.log(id)
    console.log(result)
    // if (season_loading || team_loading) {
    //     return <span>Loading...</span>
    //   }
    
    // if (isSErr || isTErr) {
    //     return <span>Error: </span>
    // }
    return (
        <div>
        {!isTErr && team_data[0] ? 
        <div>
        <h3>{team_data[0].name}</h3>
        {/* <p>{JSON.stringify(team_data)}</p> */}
        <p>{team_data[0].firstYearOfPlay}</p>
        <p>{team_data[0].officialSiteUrl}</p>
        </div>
        :
        <p>Data Not Found</p>}


        </div>
    )
};

export async function getServerSideProps({params}) {
    console.log(params)
    return {
        props: params
    }
}