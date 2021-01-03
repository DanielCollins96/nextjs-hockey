import { useQuery } from 'react-query';
import { useRouter } from 'next/router'

const fetchTeams = async () => {
    const res = fetch('https://statsapi.web.nhl.com/api/v1/teams?expand=team.roster')
};

const PlayerPage = () => {
    const { isLoading, isError, data, error } = useQuery('fetchTeams', )
    const router = useRouter()
    const { pid } = router.query
    return (
        <div>hey</div>
    )
};


export default PlayerPage;