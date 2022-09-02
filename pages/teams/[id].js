import Link from 'next/link'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState, useMemo } from 'react'
import { useQuery, useQueries } from 'react-query';
import ReactTable from '../../components/Table';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Label
  } from 'recharts';

  export async function getStaticPaths() {
    const path = 'https://statsapi.web.nhl.com/api/v1/teams/'
    const teams = await fetch(path);
    const teamData = await teams.json();
    let paths = teamData.teams.map((team) => ({
        params: {id: team.id.toString()}
    }))
    return {
        paths,
        fallback: false,
    }
  }
export async function getStaticProps({params}) {
    const fetchSeasons = async () => {
        let seasons = [];
        for (let i = 2010; i <= 2021; i++) {
            const res = await fetch(`https://statsapi.web.nhl.com/api/v1/teams/${params.id}?expand=team.stats&season=${i}${i+1}`);
            const seasonStats = await res.json()
            if (!!seasonStats.teams) {
                // console.log(typeof seasonStats.teams[0].teamStats[0])
                seasons.push({...seasonStats.teams[0].teamStats[0].splits[0].stat, ...{'year': i}, ...{'wins': parseInt(seasonStats.teams[0].teamStats[0].splits[0].stat.wins, 10)}, ...{'name': seasonStats.teams[0].name}})
            }
        }
        let season_reqs = await Promise.allSettled(seasons)
        let season_stats = season_reqs.map(season => {
            if (season.status === 'fulfilled') {
            return season.value
            }
        })
        let team_name = seasons[0]?.name || 'Team'
        return {
            props: {
                yearly_data: season_stats,
                team_name
            },
            revalidate: 3600,
        }
    
    }

    return fetchSeasons()
}

export default function TeamPage({yearly_data, team_name}) {
    const [seasonStats, setSeasonstats] = useState([])
    const router = useRouter()
    const { id } = router.query
    const { data: team_data } = useQuery(`fetchTeam-${id}`, async () => {
        const res = await fetch(`https://statsapi.web.nhl.com/api/v1/teams/${id}`);
        const teamRes = await res.json()
        return teamRes.teams
    })
    

    // const { data: yearly_data, isLoading: seasonsLoading } = useQuery(['fetchSeasons', id], fetchSeasons, { enabled: !!team_data })

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
    console.log(!!yearly_data);
    return (
        <div className=''>
            <Head>
                <title>{team_name} Roster | the-nhl.com</title>
                <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2056923001767627"
     crossOrigin="anonymous"></script>
            </Head>
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
            {!yearly_data ? 
            <p className='grid place-self-center'>Loading...</p>    
            :
            <div className='flex flex-col md:flex-row '>
                <div className="p-2 max-w-48">
                {yearly_data && <ReactTable columns={table_columns} data={table_data} className="inline-block"/>}
                </div>
                <div className="p-2 flex flex-col">
                    <p className="text-lg text-center">Wins by Season</p>
                    <LineChart
                        width={500}
                        height={300}
                        data={yearly_data}
                    >
                        <YAxis />
                        <XAxis dataKey="value.year"  />
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
