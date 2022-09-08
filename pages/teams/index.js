import { useState, useEffect } from 'react'
import { useQuery } from 'react-query';
import TeamBox from '../../components/TeamBox'; 
import Head from 'next/head'

const fetchPlayers = async () => {
    const res = await fetch('https://statsapi.web.nhl.com/api/v1/teams?expand=team.roster');
    const resJson = await res.json();

    return resJson.teams
};
export default function Teams() {
    const [playerData, setPlayerData] = useState([]);
    const [loading, setLoading] = useState(true)
    const [filteredPlayers, setFilteredPlayers] = useState([]);
    // const { isLoading, isError, data: playerData, error } = useQuery('team-rosters', fetchPlayers);

    useEffect(() => {
        fetchPlayers()
        .then(res => {            
            setPlayerData(res)
            setLoading(false)
        })
        .catch(err => console.log(err))
    },[])

    useEffect(() => {
        setFilteredPlayers(playerData)
    }, [playerData])
    
    const inputChange = (e) => {
        let searchTerm = e.target.value
        console.log(e.target.value);
        let newList = playerData.filter((team) => team.name.toLowerCase().includes(searchTerm.toLowerCase()) )
        setFilteredPlayers(newList)
    }
    // if (isLoading) {
    //     return <p className="text-xl m-auto">Loading...</p>
    //   }
    
    // if (isError) {
    //     return <span>Error: {error.message}</span>
    //   }
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
            <div className="grid my-2 mx-4 md:grid-cols-2 xl:grid-cols-3">
                {
                    filteredPlayers &&
                    filteredPlayers
                    .sort((teamA, teamB) => {
                        return teamA.name > teamB.name ? 1 : -1
                    })                    
                    .map((team) => <TeamBox team={team} key={team.id}/>)
                }       
            </div>
        </div>
    )
}
