import { useMemo } from 'react';
import Link from 'next/link'
import { useQuery } from 'react-query';
import Table from '../../components/Table';
import s from './team.module.css';


const fetchTeams = async () => {
const res = await fetch('https://statsapi.web.nhl.com/api/v1/teams')
const resJson = await res.json();
return resJson.teams
};

const fetchSchedule = async () => {
    const res = await fetch('https://statsapi.web.nhl.com/api/v1/standings?season=20032004');
    const resJson = await res.json();
    return resJson.records
} 

export default function Teams() {
    const { isLoading, isError, data, error } = useQuery('teams', fetchTeams)
    const { isLoading: standing_loading, data: standing_data} = useQuery('standings', fetchSchedule)
 const columns = useMemo(
   () => [
     {
       Header: 'Conference',
       accessor: 'conference.name', // accessor is the "key" in the data
     },
     {
       Header: 'Team',
       accessor: 'name',
     },
     {
        Header: 'Conference',
        accessor: 'conference.name',
     },
     {
       Header: 'Column 1',
       accessor: 'abbreviation', // accessor is the "key" in the data
     },
   ],
   []
 )
    // console.log(standing_data)
    if (isLoading) {
        return <span>Loading...</span>
      }
    
    if (isError) {
        return <span>Error: {error.message}</span>
    }


    return (
        <div className={s.content}>
            <h2>Teams</h2>
            <div className={s.parent}>
                <ul style={{ columns: 3 }}>
                {data
                  .sort((teamA, teamB) => {
                    return teamA.name > teamB.name ? 1 : -1
                  }) 
                  .map((team) => {
                    return (
                        <li key={team.id} className={s.list}>
                            <Link href={`/teams/${encodeURIComponent(team.id)}`}>
                                <a>{team.name}</a>
                            </Link>
                        </li>                
                    )
                })}
                </ul>
                <div>
                    {/* <Table columns={columns} data={standing_data}/> */}
                </div>
            </div>
        </div>
    )
};
