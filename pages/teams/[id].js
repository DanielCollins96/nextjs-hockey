import Link from 'next/link'
import { useState } from 'react';
import { useQuery, useQueries } from 'react-query';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Label
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
    
    const { data: yearly_data, isLoading: seasonsLoading } = useQuery(['fetchSeasons', id], async () => {
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
console.log(seasonsLoading)

    // const { 
    //     [0]: { data: team_data, isLoading: team_loading, isError: isTErr, error:  tErr}, 
    //     [1]: {data: season_data, isLoading: season_loading, isError: isSErr, error: sErr}, 
    // } = result
    // const { isLoading, isError, data, error } = response

    return (
        <div>
        {!!team_data ? 
        <div style={{'textAlign': 'center'}}>
        <h3>{team_data[0].name}</h3>
        <p>{team_data[0].firstYearOfPlay}</p>
        <Link href={`${team_data[0].officialSiteUrl}`}>
            <a>{team_data[0].officialSiteUrl}</a>
        </Link>
        
        </div>
        :
        <p>Data Not Found</p>}
        {/* <p>{JSON.stringify(team_data)}</p> */}
        <div className={s.flexCenter}>
            {seasonsLoading ? 
            <div className={s.spinner}>
                <div className={s.bounce1}></div>
                <div className={s.bounce2}></div>
                <div className={s.bounce3}></div>
            </div> :

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
                <Label value="Wins" angle={-90} position="insideLeft" />
                </YAxis>
                <XAxis dataKey="value.year">
                    <Label value="Season" offset={0} position="insideBottom" /> 
                </XAxis>
                <Tooltip />
                <Line type="monotone" dataKey="value.wins" strokeWidth={2} stroke="#009966" />
            </LineChart>
            }
        </div>
        </div>
    )
};

export async function getServerSideProps({params}) {
    console.log(params)
    return {
        props: params
    }
}