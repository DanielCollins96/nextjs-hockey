import {useState} from "react";
import Head from "next/head";
import HockeyShootout from "../components/HockeyShootout";
import TeamBox from "../components/TeamBox";
import SEO from "../components/SEO";
import { getTeamRosters } from "../lib/team-rosters";

export default function Home({teams}) {
  const [searchedTeams, setSearchedTeams] = useState(teams);

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

  return (
    <div className="">
      <Head>
        <link
          rel="preload"
          as="image"
          href="/Hockey-Net.svg"
          type="image/svg+xml"
        />
      </Head>
      <SEO
        title="NHL Scores and Stats"
        description="Browse current NHL team rosters, player statistics, and standings. Search by team or player name to find stats and profiles."
        path="/"
      />
      <HockeyShootout />
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

export async function getServerSideProps() {
  try {
    const { rosters } = await getTeamRosters()

    if (!rosters.length) {
      console.error('No valid rosters were fetched successfully');
      return {
        props: {
          teams: [],
          error: 'No valid rosters available'
        }
      };
    }

    return {
      props: {
        teams: rosters,
        error: null
      }
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    return {
      props: {
        teams: [],
        error: error.message || 'Failed to fetch data'
      }
    };
  }
}
