import { useState, useEffect } from 'react'
import { useQuery } from 'react-query';
import TeamBox from '../../components/TeamBox'; 
import Head from 'next/head'
import { getTeams } from '../../lib/queries';

const fetchPlayers = async () => {
  let teams = []
  try {
    const res = await fetch('https://statsapi.web.nhl.com/api/v1/teams?expand=team.roster');
    if (!res.ok) {
      throw new Error(`Failed to fetch, status: ${res.status}`)
    }
    const resJson = await res.json();
    teams = resJson.teams
  } catch (error) {
    console.log("Error Fetching Teams:", error.message);
  }
    return teams
};

export default function Teams({playerData}) {

    const [loading, setLoading] = useState(true)
    const [filteredPlayers, setFilteredPlayers] = useState([]);


    useEffect(() => {
        setFilteredPlayers(playerData)
    }, [playerData])
    
    const inputChange = (e) => {
        let searchTerm = e.target.value
        console.log(e.target.value);
        let newList = playerData.filter((team) => team.abbreviation.toLowerCase().includes(searchTerm.toLowerCase()) )
        setFilteredPlayers(newList)
    }

    return (
        <div>
            <Head>
               <title>
                NHL Rosters | the-nhl.com
                </title> 
                <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2056923001767627"
     crossOrigin="anonymous"></script>
            </Head>
            <div className="relative w-5/6 max-w-sm m-auto box-border">
                <label className="absolute left-0 top-0 font-bold m-4" htmlFor="filter">Search By Team</label>
                <input autoFocus onChange={inputChange} className="text-lg rounded-sm px-4 pb-3 pt-8 mt-2 focus:outline-none bg-gray-300 w-full" type="text" name="filter" id="filter" />
            </div>
            {/* <div className="flex flex-wrap justify-center my-2 mx-4"> */}
            <div className="grid m-1 md:grid-cols-2 xl:grid-cols-3">
            <p>{JSON.stringify(filteredPlayers)}</p>
                {
                    filteredPlayers &&
                    filteredPlayers
                    .sort((teamA, teamB) => {
                        return teamA.abbreviation > teamB.abbreviation ? 1 : -1
                    })                    
                    .map((team) => <TeamBox team={team} key={team.abbreviation}/>)
                }       
            </div>
        </div>
    )
}

export async function getStaticProps() {
    // const teams = await fetchPlayers();
  const teams = await getTeams();
    console.log(teams);

    return {
        props: {
            playerData: teams
        },
        revalidate: 3600
    }
}
