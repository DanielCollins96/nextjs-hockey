import { useMemo } from 'react';
import { useQuery, useQueries } from 'react-query';
import { useRouter } from 'next/router';
import {Box, Flex, Heading, Text, Button, Divider} from '@chakra-ui/react';
import ReactTable from '../../components/Table';
import s from './player.module.css';

// https://statsapi.web.nhl.com/api/v1/people/8474056/stats/?stats=statsSingleSeason&season=20122013

const PlayerPage = ({id}) => {
    console.log(id)

    const result = 
    useQueries
    ([
        { queryKey: 'fetchPlayerStats', queryFn: async () => {
            const res = await fetch(`https://statsapi.web.nhl.com/api/v1/people/${id}/stats?stats=yearByYear`);
            const playerRes = await res.json()
            // console.log(typeof playerRes.stats[0])
            // console.log(`playerss ${JSON.stringify(playerRes.stats[0])}`)
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
            console.log(Object.keys(playerStats))
            console.log(Object.stringify(playerStats))
            console.log(Object.stringify(playerRes))

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
    const { [0]: {data: stat_data, isLoading: stat_loading}, [1]: { data: person_data, isLoading: person_loading } } = result

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
    console.log(typeof stat_data)
    const data = useMemo(
        () => stat_data, []
    )
    console.log(stat_loading)
    return (
        <div className={s.main}>
            <Heading>Player Stats</Heading>
            <Divider orientation="horizontal" />
                {!person_loading && person_data ? (
                    // <div>
                    // <h2>{person_data.people[0].fullName}</h2>
                    // <p>{person_data.people[0].birthDate}</p>
                    // <p>{person_data.people[0].birthCountry}</p>
                    // <p>{person_data.people[0].primaryNumber}</p>
                    // <p>{person_data.people[0].currentAge}</p>
                    // </div>
                    <Box borderWidth="2px" p={3} m={2} display="flex" flexDir="column" alignItems="left"justifyContent="space-between"
                        borderRadius="lg" >
                     <h2>{person_data.people[0].fullName}</h2>
                     <p>Birth Date: {person_data.people[0].birthDate}</p>
                     <p>Nationality: {person_data.people[0].birthCountry}</p>
                     <p>Primary Number: {person_data.people[0].primaryNumber}</p>
                     <p>Age: {person_data.people[0].currentAge}</p>
                    </Box>
                ) :
                <p>Loading...</p>    
            }
            {/* {JSON.stringify(stat_data.stats[0].splits)} */}
            <Divider orientation="horizontal" />
            {!stat_loading && data ? <ReactTable columns={columns} data={data} /> : <div>Loaded</div>}
            
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