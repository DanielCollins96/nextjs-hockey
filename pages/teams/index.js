import { useState, useEffect } from 'react'
import { useQuery } from 'react-query';
import TeamBox from '../../components/TeamBox'; 
import Head from 'next/head'
import { getTeams } from '../../lib/queries';
import pLimit from 'p-limit';


export default function Teams({rosters}) {

    const [loading, setLoading] = useState(true)
    const [filteredTeams, setFilteredTeams] = useState(rosters || []);


    useEffect(() => {
        if (rosters && rosters.length > 0) {
            setFilteredTeams(rosters)
        }
    }, [rosters])
    
    const inputChange = (e) => {
        let searchTerm = e.target.value.trim();
        console.log('Search term:', searchTerm);
        
        if (!searchTerm) {
            setFilteredTeams(rosters);
            return;
        }
        
        const searchLower = searchTerm.toLowerCase();
        
        // Filter teams by team name OR by player name/number
        let newList = rosters.filter((team) => {
            // Check if team name matches
            if (team.team.name.toLowerCase().includes(searchLower)) {
                return true;
            }
            
            // Check if any player name or number matches
            const allPlayers = [
                ...(team.roster?.forwards || []),
                ...(team.roster?.defensemen || []),
                ...(team.roster?.goalies || [])
            ];
            
            const hasMatch = allPlayers.some(player => {
                // Check name matches
                const fullName = `${player.firstName || ''} ${player.lastName || ''}`.toLowerCase();
                const lastName = (player.lastName || '').toLowerCase();
                const firstName = (player.firstName || '').toLowerCase();
                
                const nameMatch = fullName.includes(searchLower) || 
                       lastName.includes(searchLower) || 
                       firstName.includes(searchLower);
                
                // Check number match - convert both to strings for comparison
                const sweaterStr = player.sweaterNumber != null ? String(player.sweaterNumber) : '';
                const numberMatch = sweaterStr.includes(searchTerm);
                
                if (numberMatch) {
                    console.log(`Number match: ${player.firstName} ${player.lastName} #${player.sweaterNumber} on ${team.team.name}`);
                }
                
                return nameMatch || numberMatch;
            });
            
            return hasMatch;
        });
        
        console.log(`Found ${newList.length} teams matching "${searchTerm}"`);
        setFilteredTeams(newList);
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
                <label className="absolute left-0 top-0 font-bold m-4 dark:text-white" htmlFor="filter">Search By Team or Player</label>
                <input autoFocus onChange={inputChange} className="text-lg rounded-sm px-4 pb-3 pt-8 mt-2 focus:outline-none bg-gray-300 dark:bg-gray-700 dark:text-white w-full" type="text" name="filter" id="filter" placeholder="e.g., Bruins, McDavid, 97..." />
            </div>
            {/* <div className="flex flex-wrap justify-center my-2 mx-4"> */}
            <div className="grid m-1 md:grid-cols-2 xl:grid-cols-3">
            {/* <p>{JSON.stringify(filteredTeams)}</p> */}
                {
                    filteredTeams &&
                    filteredTeams
                    .sort((teamA, teamB) => {
                        return teamA.team.abbreviation > teamB.team.abbreviation ? 1 : -1
                    })                    
                    .map((team) => <TeamBox team={team} key={team.abbreviation}/>)
                }       
            </div>
        </div>
    )
}

export async function getStaticProps() {
    try {
        const teams = await getTeams();
        if (!teams || !Array.isArray(teams)) {
            throw new Error('Failed to fetch teams or invalid teams data');
        }

        // Use more conservative limits in production
        const isProduction = process.env.VERCEL === '1';
        const limit = pLimit(isProduction ? 1 : 2);  // Same limits as home page
        const delay = ms => new Promise(res => setTimeout(res, ms));

        const fetchRoster = async (team) => {
            try {
                const url = `https://api-web.nhle.com/v1/roster/${team.abbreviation}/current`;
                const res = await fetch(url);

                if (!res.ok) {
                    throw new Error(`Failed to fetch roster for ${team.abbreviation}: ${res.status} ${res.statusText}`);
                }

                const data = await res.json();
                return {
                    team,
                    roster: ['forwards', 'defensemen', 'goalies'].reduce((acc, position) => {
                        const players = data[position]?.map(person => ({
                            position,
                            id: person.id,
                            sweaterNumber: person.sweaterNumber ?? null,
                            firstName: person.firstName?.default,
                            lastName: person.lastName?.default,
                        })) || [];
                        
                        // Sort alphabetically by full name
                        acc[position] = players.sort((a, b) => {
                            const nameA = `${a.firstName || ''} ${a.lastName || ''}`;
                            const nameB = `${b.firstName || ''} ${b.lastName || ''}`;
                            return nameA.localeCompare(nameB);
                        });
                        return acc;
                    }, {})
                };
            } catch (error) {
                console.error(`Error fetching roster for ${team.abbreviation}:`, error);
                return {
                    team,
                    roster: {
                        forwards: [],
                        defensemen: [],
                        goalies: []
                    }
                };
            } finally {
                // Longer delay in production to avoid rate limits
                await delay(isProduction ? 1000 : 500);  // Same delay as home page
            }
        };

        // Use p-limit to limit concurrent requests
        const rosterPromises = teams.map(team => limit(() => fetchRoster(team)));
        const rosters = await Promise.all(rosterPromises);
        
        // Filter out completely empty rosters
        const validRosters = rosters.filter(roster => 
            roster.roster.forwards.length > 0 || 
            roster.roster.defensemen.length > 0 || 
            roster.roster.goalies.length > 0
        );

        if (!validRosters.length) {
            throw new Error('No valid rosters were fetched successfully');
        }

        return {
            props: {
                rosters: validRosters
            },
            revalidate: 3600
        };
    } catch (error) {
        console.error('Error in getStaticProps:', error);
        return {
            props: {
                rosters: []
            },
            revalidate: 60 // Retry sooner on error
        };
    }
}
