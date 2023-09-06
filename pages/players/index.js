import { useState, useEffect } from 'react'
import { useQuery, useQueries } from 'react-query';
import TeamBox from '../../components/TeamBox'; 

export default function Players() {
    // Write a query with useQuery to fetch from api/players
    const [filteredPlayers, setFilteredPlayers] = useState([]);

    const fetchPlayers = async () => {
        const res = await fetch('/api/players');
        const resJson = await res.json();
        return resJson;
    }

    const { isLoading, isError, data } = useQuery('players', fetchPlayers);

    return (
        <div>
            <p>{JSON.stringify(data)}</p>
        </div>
    )
}
