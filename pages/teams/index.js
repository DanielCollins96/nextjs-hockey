import { useState, useEffect } from 'react'
import { useQuery } from 'react-query';
import TeamBox from '../../components/TeamBox'; 
import Head from 'next/head'
import { getTeams, getActiveRosters } from '../../lib/queries';


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
        const [teams, activeRosters] = await Promise.all([
            getTeams(),
            getActiveRosters()
        ]);

        if (!teams || !Array.isArray(teams)) {
            throw new Error('Failed to fetch teams or invalid teams data');
        }

        // Group roster players by team abbreviation and position
        const rostersByTeam = {};
        
        for (const player of activeRosters) {
            const abbrev = player.teamAbbreviation;
            if (!rostersByTeam[abbrev]) {
                rostersByTeam[abbrev] = {
                    forwards: [],
                    defensemen: [],
                    goalies: []
                };
            }

            const playerData = {
                position: player.positionGroup,
                id: player.playerId,
                sweaterNumber: player.sweaterNumber ?? null,
                firstName: player.firstName,
                lastName: player.lastName,
            };

            // Map positionGroup to the roster category
            if (player.positionGroup === 'forwards') {
                rostersByTeam[abbrev].forwards.push(playerData);
            } else if (player.positionGroup === 'defensemen') {
                rostersByTeam[abbrev].defensemen.push(playerData);
            } else if (player.positionGroup === 'goalies') {
                rostersByTeam[abbrev].goalies.push(playerData);
            }
        }

        // Sort players alphabetically within each position group
        for (const abbrev of Object.keys(rostersByTeam)) {
            for (const position of ['forwards', 'defensemen', 'goalies']) {
                rostersByTeam[abbrev][position].sort((a, b) => {
                    const nameA = `${a.firstName || ''} ${a.lastName || ''}`;
                    const nameB = `${b.firstName || ''} ${b.lastName || ''}`;
                    return nameA.localeCompare(nameB);
                });
            }
        }

        // Combine teams with their rosters
        const rosters = teams.map(team => ({
            team,
            roster: rostersByTeam[team.abbreviation] || {
                forwards: [],
                defensemen: [],
                goalies: []
            }
        }));
        
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
