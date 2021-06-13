import Link from 'next/link'
import { useQuery, useQueries } from 'react-query';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Label
  } from 'recharts';

export default function TeamPage({id}) {

    const { data: team_data } = useQuery(`fetchTeam-${id}`, async () => {
        const res = await fetch(`https://statsapi.web.nhl.com/api/v1/teams/${id}`);
        const teamRes = await res.json()
        return teamRes.teams
    })
    
    const { data: yearly_data, isLoading: seasonsLoading } = useQuery(['fetchSeasons', id], async () => {
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
                    return val
                },
                {
                    enabled: !!team_data
                })
    return (
        <div>
        {!!team_data ? 
        <div className="text-center border border-black rounded p-2">
        <p className="text-lg">{team_data[0].name}</p>
        <p>{team_data[0].firstYearOfPlay}</p>
        <Link href={`${team_data[0].officialSiteUrl}`}>
            <a>{team_data[0].officialSiteUrl}</a>
        </Link>
        
        </div>
        :
        <p>Data Not Found</p>}
        {/* <p>{JSON.stringify(team_data)}</p> */}
        <div className="flex">
            {seasonsLoading ? 
            <p>Loading...</p>    
            :
            <div>
                <div className="p-2">
                    <p className="text-lg text-center">Wins</p>
                    <LineChart
                        width={500}
                        height={300}
                        data={yearly_data}
                        // margin={{
                            // right: 30, left: 20, bottom:
                            // }}
                            >
                        {/* <CartesianGrid stroke="#f5f5f5" fill="#e6e6e6" /> */}
                        <YAxis>
                        {/* <Label value="Wins"  position="insideLeft" /> */}
                        </YAxis>
                        <XAxis dataKey="value.year">
                            {/* <Label value="Season" offset={0} position="insideBottom" />  */}
                        </XAxis>
                        <Tooltip />
                        <Line type="monotone" dataKey="value.wins" strokeWidth={2} stroke="#009966" />
                        {/* <Tooltip /> */}
                        <Line type="monotone" dataKey="value.splits[0].stat.ot" strokeWidth={2} stroke="#11F" />
                    </LineChart>
                </div>
            </div>
            }
        </div>
        </div>
    )
};

export const getStaticPaths = async () => {
    return {
        paths: [],
        fallback: true
    }
}

export async function getStaticProps({params}) {
    return {
        props: params
    }
}