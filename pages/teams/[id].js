import { useQuery, useQueries } from 'react-query';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  } from 'recharts';
import s from './team.module.css';

export default function TeamPage({id}) {

    const { data: team_data } = useQuery('fetchTeam', async () => {
        const res = await fetch(`https://statsapi.web.nhl.com/api/v1/teams/${id}`);
        const teamRes = await res.json()
        return teamRes.teams
    })
    console.log(!!team_data)
    // console.log(parseInt(team_data[0]?.firstYearOfPlay)+1)
    // console.log(!!team_data[0].firstYearOfPlay)
    
    const { data: yearly_data } = useQuery(['fetchSeasons', id], async () => {
                    console.log('sdhsjjsjsjsj')
                    let seasons = [];
                    // for (let i = parseInt(team_data[0].firstYearOfPlay,10); i < 2019; i++) {
                    for (let i = 2008; i < 2020; i++) {
                        console.log(`https://statsapi.web.nhl.com/api/v1/teams/${id}?expand=team.stats&season=${i}${i+1}`);
                        const res = await fetch(`https://statsapi.web.nhl.com/api/v1/teams/${id}?expand=team.stats&season=${i}${i+1}`);
                        const seasonStats = await res.json()
                        if (!!seasonStats.teams) {
                            console.log(typeof seasonStats.teams[0].teamStats[0])
                            seasons.push({...seasonStats.teams[0].teamStats[0], ...{'year': i}, ...{'wins': parseInt(seasonStats.teams[0].teamStats[0].splits[0].stat.wins, 10)}})
                        }
                    }
                    let val = await Promise.allSettled(seasons)
                    // console.log(val)
                    return val
                },
                {
                    enabled: !!team_data
                    // enabled: true
                })
console.log(yearly_data)

    // const { 
    //     [0]: { data: team_data, isLoading: team_loading, isError: isTErr, error:  tErr}, 
    //     [1]: {data: season_data, isLoading: season_loading, isError: isSErr, error: sErr}, 
    // } = result
    // const { isLoading, isError, data, error } = response
    // console.log(id)
    // console.log(season_data)
    // if (season_loading || team_loading) {
    //     return <span>Loading...</span>
    //   }
    
    // if (isSErr || isTErr) {
    //     return <span>Error: </span>
    // }
    let sumdata = [8,12,5,9,10]
    return (
        <div>
        {!!team_data ? 
        <div>
        <h3>{team_data[0].name}</h3>
        <p>{team_data[0].firstYearOfPlay}</p>
        <p>{team_data[0].officialSiteUrl}</p>
        </div>
        :
        <p>Data Not Found</p>}
        {/* <p>{JSON.stringify(team_data)}</p> */}
        <LineChart
        width={500}
        height={300}
        data={yearly_data}
        margin={{
          top: 5, right: 30, left: 20, bottom: 5,
        }}
        >
            <YAxis />
            <XAxis dataKey="value.year" />
            <Line type="monotone" dataKey="value.wins" stroke="#7FFFD4" />
        </LineChart>
        </div>
    )
};

export async function getServerSideProps({params}) {
    console.log(params)
    return {
        props: params
    }
}