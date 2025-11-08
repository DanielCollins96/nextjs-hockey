import {motion} from "framer-motion";
import {useRouter} from "next/router";
import {useEffect, useState, useRef} from "react";
import TeamBox from "../components/TeamBox";
import Puck from "../components/Puck";
import {getTeams} from "../lib/queries";
import pLimit from 'p-limit';

export default function Home({teams}) {
  const router = useRouter();

  const [searchedTeams, setSearchedTeams] = useState(teams);
  const [puckKey, setPuckKey] = useState(0);

  const inputRef = useRef();

  const inputChange = (e) => {
    let searchTerm = e.target.value.trim();
    console.log('Search term:', searchTerm);
    
    if (!searchTerm) {
      setSearchedTeams(teams);
      return;
    }
    
    const searchLower = searchTerm.toLowerCase();
    
    // Filter teams by team name OR by player name/number
    let newList = teams.filter((team) => {
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
      
      return allPlayers.some(player => {
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
        
        return nameMatch || numberMatch;
      });
    });
    
    setSearchedTeams(newList);
  };

  function onUpdate(latest) {
    console.log(latest.x, latest.y);
  }

  function onPress() {
    setPuckKey(prev => prev + 1);
  }
  return (
    <div className="">
      <div className="grid place-content-center m-4">
        <button
          className="bg-blue-200 dark:bg-blue-700 dark:text-white px-3 py-1 rounded hover:bg-blue-300 dark:hover:bg-blue-600"
          onClick={() => onPress()}
        >
          Reset Puck
        </button>
      </div>
      <div className="mt-4 p-2">
        <div className="flex justify-around">
          <motion.img
            src="/Hockey-Net.svg"
            alt="Puck"
            width="200"
            height="200"
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            transition={{delay: 0.1}}
            whileTap={{scale: 0.9}}
            // drag={true}
          />
          <div className="grid inset-0 relative w-24 place-content-end">
            {/* Inline motion SVG Puck -- color controlled via text color to avoid CSS filter repaints */}
            <Puck
              key={puckKey}
              ref={inputRef}
              className="absolute bottom-0 text-black dark:text-gray-400 transition-colors duration-150"
              width={100}
              height={100}
              onUpdate={onUpdate}
            />
          </div>
        </div>
      </div>
      <div>
        <div className="relative w-5/6 max-w-sm m-auto box-border">
          <label
            className="absolute left-0 top-0 font-bold m-4 dark:text-white"
            htmlFor="filter"
          >
            Search By Team or Player
          </label>
          <input
            onChange={inputChange}
            className="text-lg rounded-sm px-4 pb-3 pt-8 mt-2 focus:outline-none bg-gray-300 dark:bg-gray-700 dark:text-white w-full"
            type="text"
            name="filter"
            id="filter"
            placeholder="e.g., Bruins, McDavid, 97..."
          />
        </div>
        <div className="grid m-1 md:grid-cols-2 xl:grid-cols-3">
          {searchedTeams &&
            searchedTeams
              .sort((teamA, teamB) => {
                return teamA.team.abbreviation > teamB.team.abbreviation
                  ? 1
                  : -1;
              })
              .map((team) => (
                <TeamBox team={team} key={team.team.abbreviation} />
              ))}
        </div>
      </div>
    </div>
  );
}

export async function getStaticProps() {
  try {
    const teams = await getTeams();
    if (!teams || !Array.isArray(teams)) {
      throw new Error('Failed to fetch teams or invalid teams data');
    }

    // Use more conservative limits in production
    const isProduction = process.env.VERCEL === '1';
    const limit = pLimit(isProduction ? 1 : 3);  // Reduced to 3 concurrent in dev
    const delay = ms => new Promise(res => setTimeout(res, ms));

    const fetchRoster = async (team) => {
      try {
        const url = `https://api-web.nhle.com/v1/roster/${team.abbreviation}/current`;
        console.log(`Fetching roster for ${team.abbreviation}...`);
        const res = await fetch(url);

        if (!res.ok) {
          throw new Error(`Failed to fetch roster for ${team.abbreviation}: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        console.log(`Successfully fetched roster for ${team.abbreviation}`);
        
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
        await delay(isProduction ? 1000 : 600);  // Increased to 600ms in dev
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
      console.error('No valid rosters were fetched successfully');
      return {
        props: {
          teams: [],
          error: 'No valid rosters available'
        },
        revalidate: 60 // Retry sooner when no valid data
      };
    }

    return {
      props: {
        teams: validRosters,
        error: null
      },
      revalidate: 3600
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    return {
      props: {
        teams: [],
        error: error.message || 'Failed to fetch data'
      },
      revalidate: 60 // Retry sooner on error
    };
  }
}
