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
                        return teamA.team.abbreviation > teamB.team.abbreviation ? 1 : -1
                    })                    
                    .map((team) => <TeamBox team={team} key={team.abbreviation}/>)
                }       
            </div>
        </div>
    )
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const fetchWithRetry = async (url, retries = 3, delay = 250) => {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.status === 429) {
                console.log(`Rate limited, waiting ${delay}ms before retry ${i + 1}`);
                await sleep(delay);
                delay *= 2;
                continue;
            }
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

                const contentType = (response.headers.get('content-type') || '').toLowerCase();
                const text = await response.text();
                if (!contentType.includes('application/json')) {
                    console.error(`Non-JSON response for ${url} (content-type: ${contentType}). Response snippet:`, text.substring(0, 200));
                    throw new Error('Non-JSON response');
                }
                try {
                    return JSON.parse(text);
                } catch (e) {
                    console.error(`Failed to parse JSON for ${url}. Response snippet:`, text.substring(0, 200));
                    throw e;
                }
        } catch (error) {
            console.error(`Attempt ${i + 1} failed for ${url}:`, error.message);
            if (i === retries - 1) throw error;
            await sleep(delay);
            delay *= 2;
        }
    }
};

const fetchRosterInBatches = async (teams, batchSize = 5) => {
    const results = [];
    for (let i = 0; i < teams.length; i += batchSize) {
        const batch = teams.slice(i, i + batchSize);
        const batchPromises = batch.map(async (team) => {
            const url = `https://api-web.nhle.com/v1/roster/${team.abbreviation}/current`;
            console.log(`Fetching ${url}`);
            try {
                const data = await fetchWithRetry(url);
                return {
                    team,
                    roster: ['forwards', 'defensemen', 'goalies'].reduce((acc, position) => {
                        acc[position] = data[position]?.map(person => ({
                            position: position,
                            id: person.id,
                            sweaterNumber: person.sweaterNumber ?? null,
                            firstName: person.firstName?.default,
                            lastName: person.lastName?.default,
                        })) || [];
                        return acc;
                    }, {}),
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
            }
        });
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
        if (i + batchSize < teams.length) {
            // Wait between batches to avoid rate limiting
            await sleep(100);
        }
    }
    return results;
};

export async function getStaticProps() {
    const teams = await getTeams();
    // console.log(teams);
    try {
        const rosters = await fetchRosterInBatches(teams);
        
        console.log(rosters);

        return {
            props: {
                rosters
            },
            revalidate: 3600
        }
    } catch (error) {
        console.error('Error in getStaticProps:', error);
        return {
            props: {
                rosters: [],
                error: 'Failed to fetch rosters'
            },
            revalidate: 60 // Retry sooner on error
        }
    }
}
