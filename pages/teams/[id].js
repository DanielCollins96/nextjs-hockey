import { useQuery, useQueries } from 'react-query';
import { useRouter } from 'next/router';
import s from './team.module.css';

export default function TeamPage({id}) {
    const { isLoading, isError, data, error } = useQuery('fetchPlayer', async () => {
        const res = await fetch(`https://statsapi.web.nhl.com/api/v1/teams/${id}`)
        const teamRes = await res.json()
        return teamRes.teams
    })
    console.log(id)
    console.log(data)
    if (isLoading) {
        return <span>Loading...</span>
      }
    
    if (isError) {
        return <span>Error: {error.message}</span>
    }
    return (
        <div>
        <h3>{data[0].name}</h3>
        {/* <p>{JSON.stringify(data[0])}</p> */}
        <p>{data[0].firstYearOfPlay}</p>
        <p>{data[0].officialSiteUrl}</p>
        </div>

    )
};

export async function getServerSideProps({params}) {
    console.log(params)
    return {
        props: params
    }
}