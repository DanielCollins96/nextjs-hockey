import { useMemo, useState } from 'react';
import { useQuery, useQueries } from 'react-query';
import { useRouter } from 'next/router';
import ReactTable from '../../components/Table';
// https://statsapi.web.nhl.com/api/v1/people/8474056/stats/?stats=statsSingleSeason&season=20122013


const PlayerPage = () => {
    const router = useRouter()
    const { id } = router.query
    const fetchPlayer = async () => {
        const res = await fetch(`https://statsapi.web.nhl.com/api/v1/people/${id}`);
        const playerRes = await res.json()
        return playerRes
    }
    
    const fetchPlayerStats = async () => {
        const res = await fetch(`https://statsapi.web.nhl.com/api/v1/people/${id}/stats?stats=yearByYear`);
        const playerRes = await res.json()
        const playerStats = playerRes.stats[0].splits.map((szn) => {
            return (
                {
                    season: szn.season.substring(0,4)+'/'+szn.season.substring(4,8),
                    team: szn.team.name,
                    league: szn.league.name,
                    gp: szn.stat.games,
                    g: szn.stat.goals,
                    a: szn.stat.assists,
                    pts: szn.stat.points,
                    pim: szn.stat.pim,
                }
            )
        })
        return playerStats
    }

    const { data: player, status: player_status } = useQuery(`player-${id}`, fetchPlayer);
    const { data: playerStats, status: stats_status } = useQuery(`playerStats-${id}`, fetchPlayerStats);

    const columns = useMemo(
        () => [
             {
                 Header: 'Season',
                 accessor: 'season' 
             },
             {
                 Header: 'Team',
                 accessor: 'team'
             },
            {
                 Header: 'League',
                 accessor: 'league'
             },
            {
                 Header: 'GP',
                 accessor: 'gp'
             },
            {
                 Header: 'Goals',
                 accessor: 'g'
             },
            {
                 Header: 'Assists',
                 accessor: 'a'
             },
            {
                 Header: 'Points',
                 accessor: 'pts'
             },
             {
                 Header: 'PIM',
                 accessor: 'pim'
             },
        ]
    )
    const data = useMemo(
        () => playerStats, []
    )
    return (
        <div className="flex mt-2">
            <div className="flex flex-col h-full justify-start items-center w-56 p-2 ml-2">
                    {player_status === 'success' && player ? (
                        <div className="">
                        <p className="text-2xl font-bold">{player.people[0].fullName}</p>
                        <p>Birth Date: {player.people[0].birthDate}</p>
                        <p>Nationality: {player.people[0].birthCountry}</p>
                        <p>Primary Number: {player.people[0].primaryNumber}</p>
                        <p>Age: {player.people[0].currentAge}</p>
                        </div>
                    ) :
                    <p>Loading...</p>    
                }
            </div>
            {stats_status === 'success' ? <ReactTable columns={columns} data={playerStats} /> : <p>Loading...</p>}
            {stats_status === 'error' ? <p>Error Fetching Stats.</p> : null}
        </div>
    )
};


export default PlayerPage;