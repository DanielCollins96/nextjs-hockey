import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState, useMemo } from 'react'
import { useQuery, useQueries } from 'react-query';
import ReactTable from '../../components/Table';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Label
  } from 'recharts';

export default function TeamPage() {
    const [seasonStats, setSeasonstats] = useState([])
    const router = useRouter()
    const { id } = router.query
    const { data: team_data } = useQuery(`fetchTeam-${id}`, async () => {
        const res = await fetch(`https://statsapi.web.nhl.com/api/v1/teams/${id}`);
        const teamRes = await res.json()
        return teamRes.teams
    })
    
    const fetchSeasons = async () => {
        let seasons = [];
        // for (let i = parseInt(team_data[0].firstYearOfPlay,10); i < 2019; i++) {
        for (let i = 2008; i <= 2020; i++) {
            console.log(`https://statsapi.web.nhl.com/api/v1/teams/${id}?expand=team.stats&season=${i}${i+1}`);
            const res = await fetch(`https://statsapi.web.nhl.com/api/v1/teams/${id}?expand=team.stats&season=${i}${i+1}`);
            const seasonStats = await res.json()
            if (!!seasonStats.teams) {
                console.log(typeof seasonStats.teams[0].teamStats[0])
                seasons.push({...seasonStats.teams[0].teamStats[0].splits[0].stat, ...{'year': i}, ...{'wins': parseInt(seasonStats.teams[0].teamStats[0].splits[0].stat.wins, 10)}})
            }
        }
        let season_reqs = await Promise.allSettled(seasons)
        let season_stats = season_reqs.map(season => {
            if (season.status === 'fulfilled') {
            return season.value
            }
        })
        return season_stats
    }

    const { data: yearly_data, isLoading: seasonsLoading } = useQuery(['fetchSeasons', id], fetchSeasons, { enabled: !!team_data })

    const table_data = useMemo(
        () => yearly_data
    )

    const table_columns = useMemo(
        () => [
            {
                Header: 'Year',
                accessor: 'year',
            },
            {
                Header: 'Wins',
                accessor: 'wins',
            },
            {
                Header: 'Losses',
                accessor: 'losses',
            },
            {
                Header: 'OTL',
                accessor: 'ot',
            },
            {
                Header: 'Points',
                accessor: 'pts',
            },
            {
                Header: 'Goals Per Game',
                accessor: 'goalsPerGame',
            },
            {
                Header: 'Goals Against Per Game',
                accessor: 'goalsAgainstPerGame',
            },
        ]
    )
    console.log({yearly_data});
    return (
        <div>
        {
        !!team_data 
        ? 
            <div className="text-center border border-black rounded p-2">
                <p className="text-lg">{team_data[0].name}</p>
                <p>{team_data[0].firstYearOfPlay}</p>
                <Link href={`${team_data[0].officialSiteUrl}`}>
                    <a>{team_data[0].officialSiteUrl}</a>
                </Link>
            </div>
            :
            <p>Data Not Found</p>
        }
        {/* <p>{JSON.stringify(team_data)}</p> */}
        {/* <div className="flex"> */}
            {seasonsLoading ? 
            <p>Loading...</p>    
            :
            <div>
                <div className="p-2">
                {yearly_data && <ReactTable columns={table_columns} data={table_data} className="inline-block"/>}
                </div>
                <div className="p-2 flex flex-col absolute">
                    <p className="text-lg text-center">Wins by Season</p>
                    <LineChart
                        width={500}
                        height={300}
                        data={yearly_data}
                    >
                        <YAxis />
                        <XAxis dataKey="value.year" />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" name="Wins" dataKey="wins" strokeWidth={2} stroke="#009966" />
                        <Line type="monotone" name="OT Wins" dataKey="ot" strokeWidth={2} stroke="#11F" />
                    </LineChart>
                </div>
            </div>
            }
        </div>
        // </div>
    )
};
