import { useMemo, useState } from 'react';
import { useQuery, useQueries } from 'react-query';
import { useRouter } from 'next/router';
import ReactTable from '../../components/Table';
import { setNestedObjectValues } from 'formik';

// https://statsapi.web.nhl.com/api/v1/people/8474056/stats/?stats=statsSingleSeason&season=20122013

const PlayerPage = ({id}) => {
    const [player, setPlayer] = useState(null)
    const [playerStats, setPlayerStats] = useState(null)
    const result = 
    useQueries
    ([
        { queryKey: `fetch${id}Stats`, queryFn: async () => {
            const res = await fetch(`https://statsapi.web.nhl.com/api/v1/people/${id}/stats?stats=yearByYear`);
            const playerRes = await res.json()
            console.log(`PLAYER RES`)
            console.log(playerRes)
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
            console.log('fulll')
            console.log(playerStats);

            return playerStats
            } 
        },
        { queryKey: 'fetchPlayer', queryFn: async () => {
            const res = await fetch(`https://statsapi.web.nhl.com/api/v1/people/${id}`);
            const playerRes = await res.json()
            return playerRes
            } 
        },
    ])
    setPlayerStats(result[0].data)
    setPlayer(result[1].data)

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
        <div className="">
            <p className="text-2xl font-bold">Player Stats</p>
                {/* {player ? (
                    <div className="">
                     <h2>{player.people[0].fullName}</h2>
                     <p>Birth Date: {player.people[0].birthDate}</p>
                     <p>Nationality: {player.people[0].birthCountry}</p>
                     <p>Primary Number: {player.people[0].primaryNumber}</p>
                     <p>Age: {player.people[0].currentAge}</p>
                    </div>
                ) :
                <p>Loading...</p>    
            } */}
            {/* {JSON.stringify(stat_data.stats[0].splits)} */}
            {data ? <ReactTable columns={columns} data={data} /> : <p>Lookin</p>}
            
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