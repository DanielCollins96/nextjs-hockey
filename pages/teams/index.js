import Link from 'next/link'
import { useQuery } from 'react-query';

const fetchTeams = async () => {
const res = await fetch('https://statsapi.web.nhl.com/api/v1/teams')
const resJson = await res.json();
return resJson.teams
};

export default function Teams() {
    const { isLoading, isError, data, error } = useQuery('teams', fetchTeams)
    console.log(data)
    if (isLoading) {
        return <span>Loading...</span>
      }
    
    if (isError) {
        return <span>Error: {error.message}</span>
    }

    return (
        <div>

        <h2>Teams</h2>
        <ul>
        {data.map((team) => {
            return (
                <li key={team.id}>
                    <Link href={`/teams/${encodeURIComponent(team.id)}`}>
                        <a>{team.name}</a>
                    </Link>
                </li>                
            )
        })}
        </ul>
        </div>
    )
};
