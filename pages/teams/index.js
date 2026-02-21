import { useState, useEffect } from 'react'
import { useQuery } from 'react-query';
import TeamBox from '../../components/TeamBox';
import SEO from '../../components/SEO';


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
            <SEO
                title="NHL Teams & Rosters"
                description="Browse all NHL team rosters and player statistics. Search by team name or player to find current roster information."
                path="/teams"
            />
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

export async function getServerSideProps({ req }) {
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host;

    try {
        const response = await fetch(`${protocol}://${host}/api/teams/rosters`);
        const payload = response.ok ? await response.json() : {};
        const validRosters = payload?.rosters || [];

        if (!validRosters.length) {
            throw new Error('No valid rosters were fetched successfully');
        }

        return {
            props: {
                rosters: validRosters
            }
        };
    } catch (error) {
        console.error('Error in getStaticProps:', error);
        return {
            props: {
                rosters: []
            }
        };
    }
}
