import Link from 'next/link'
import { useQuery } from 'react-query';

const fetchPlayers = async () => {
    const res = await fetch('https://statsapi.web.nhl.com/api/v1/teams?expand=team.roster');
    const resJson = await res.json();

    return resJson.teams
};
export default function Players() {
    const { isLoading, isError, data, error } = useQuery('players', fetchPlayers)
    console.log(data)
    if (isLoading) {
        return <span>Loading...</span>
      }
    
    if (isError) {
        return <span>Error: {error.message}</span>
      }
    return (
        <div>
            {
                data.map((team) => {
                    return (
                        <div>
                        <p>{team.name}</p>
                        <ul style={{ columns: 2}}>
                            {team.roster.roster.map((person) => {
                                return (
                                    <li key={person.person.id}>
                                        {/* <p>{person.person.fullName}</p> */}
                                        <Link href={`/players/${encodeURIComponent(person.person.id)}`}>
                                            <a>{person.person.fullName}</a>
                                        </Link>
                                    </li>
                                )
                            })}
                        </ul>
                        </div>
                    )
                })
            }
            
        </div>
    )
}
