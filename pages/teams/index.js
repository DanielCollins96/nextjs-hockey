import { useState, useEffect } from 'react'
import { useQuery } from 'react-query';
import TeamBox from '../../components/TeamBox'; 
import Head from 'next/head'
import { getTeams } from '../../lib/queries';


export default function Teams({rosters}) {

    const [loading, setLoading] = useState(true)
    const [filteredTeams, setFilteredTeams] = useState([]);


    useEffect(() => {
        setFilteredTeams(rosters)
    }, [rosters])
    
    const inputChange = (e) => {
        let searchTerm = e.target.value
        console.log(e.target.value);
        let newList = rosters
        .filter((team) => team.team.name.toLowerCase().includes(searchTerm.toLowerCase()) )
        setFilteredTeams(newList)
    }

    return (
        <div>
            <Head>
               <title>
                NHL Rosters | hockeydb.xyz
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
            {/* <p>{JSON.stringify(filteredTeams)}</p> */}
                {
                    filteredTeams &&
                    filteredTeams
                    .sort((teamA, teamB) => {
                        return teamA.team.fullName > teamB.team.fullName ? 1 : -1
                    })                    
                    .map((team) => <TeamBox team={team} key={team.team.id}/>)
                }       
            </div>
        </div>
    )
}

export async function getStaticProps() {
    // const teams = await fetchPlayers();
  const teams = await getTeams();
    // console.log(teams);
    const fetchRosterPromises = await teams?.map(team => {
        let url = `https://api-web.nhle.com/v1/roster/${team.triCode}/current`
        console.log(url);
        return fetch(url)
            .then(res => res.json())
            .then(data => ({
                team,
                roster: ['forwards', 'defensemen', 'goalies'].reduce((acc,position) =>
                {
                acc[position] = data[position]?.map(person => ({
                    position: position,
                    id: person.id,
                    sweaterNumber: person.sweaterNumber ?? null,
                    firstName: person.firstName?.default,
                    lastName: person.lastName?.default,
                })) || []
                return acc
                }
            ,{}),
            }))
    })

    const rosters = await Promise.all(fetchRosterPromises)

    console.log(rosters);

    return {
        props: {
            rosters
        },
        revalidate: 3600
    }
}
