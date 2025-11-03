import {motion} from "framer-motion";
import {useRouter} from "next/router";
import {useEffect, useState, useRef} from "react";
import TeamBox from "../components/TeamBox";
import {getTeams} from "../lib/queries";

export default function Home({teams}) {
  const router = useRouter();

  const [searchedTeams, setSearchedTeams] = useState(teams);

  const inputRef = useRef();

  const inputChange = (e) => {
    let searchTerm = e.target.value;
    // If teams is undefined, guard
    const source = teams || [];
    let newList = source.filter((team) =>
      team.team.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSearchedTeams(newList);
  };

  function onUpdate(latest) {
    // optional debug
  }

  function onPress() {
    router.reload();
  }
  return (
    <div className="">
      <div className="grid place-content-center m-4">
        <button
          className="bg-blue-200 px-3 py-1 rounded"
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
          />
          <div className="grid inset-0 relative w-24 place-content-end">
            <motion.img
              ref={inputRef}
              className="absolute bottom-0"
              src="/ice-hockey-puck.svg"
              alt="Puck"
              width="100"
              height="100"
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              transition={{delay: 0.1}}
              whileTap={{scale: 0.9}}
              drag={true}
              dragElastic={0.2}
              dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
              onDrag={(event, info) => {
                // debug drag
              }}
            />
          </div>
        </div>
      </div>
      <div>
        <div className="relative w-5/6 max-w-sm m-auto box-border">
          <label
            className="absolute left-0 top-0 font-bold m-4"
            htmlFor="filter"
          >
            Search By Team
          </label>
          <input
            onChange={inputChange}
            className="text-lg rounded-sm px-4 pb-3 pt-8 mt-2 focus:outline-none bg-gray-300 w-full"
            type="text"
            name="filter"
            id="filter"
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
  // const teams = await fetchPlayers();

  const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

  const fetchWithRetry = async (url, retries = 3, delay = 250) => {
    for (let i = 0; i < retries; i++) {
      try {
        const res = await fetch(url, { headers: { Accept: 'application/json' } });
        if (res.status === 429) {
          console.warn(`Rate limited (${url}), backing off ${delay}ms (attempt ${i + 1})`);
          await sleep(delay);
          delay *= 2;
          continue;
        }
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const contentType = (res.headers.get('content-type') || '').toLowerCase();
        const text = await res.text();
        if (!contentType.includes('application/json')) {
          console.error(`Non-JSON response for ${url} (content-type: ${contentType}). Snippet:`, text.substring(0, 200));
          throw new Error('Non-JSON response');
        }
        try {
          return JSON.parse(text);
        } catch (e) {
          console.error(`Failed to parse JSON for ${url}. Snippet:`, text.substring(0, 200));
          throw e;
        }
      } catch (err) {
        if (i === retries - 1) throw err;
        await sleep(delay);
        delay *= 2;
      }
    }
  };

  const fetchRosterInBatches = async (teams, batchSize = 5) => {
    const results = [];
    for (let i = 0; i < teams.length; i += batchSize) {
      const batch = teams.slice(i, i + batchSize);
      const promises = batch.map(async (team) => {
        const url = `https://api-web.nhle.com/v1/roster/${team.abbreviation}/current`;
        try {
          const data = await fetchWithRetry(url);
          return {
            team,
            roster: ['forwards', 'defensemen', 'goalies'].reduce((acc, position) => {
              acc[position] = data[position]?.map((person) => ({
                position,
                id: person.id,
                sweaterNumber: person.sweaterNumber ?? null,
                firstName: person.firstName?.default,
                lastName: person.lastName?.default,
              })) || [];
              return acc;
            }, {}),
          };
        } catch (error) {
          console.error(`Error fetching roster for ${team.abbreviation}:`, error.message || error);
          return { team, roster: { forwards: [], defensemen: [], goalies: [] } };
        }
      });
      const batchResults = await Promise.all(promises);
      results.push(...batchResults);
      if (i + batchSize < teams.length) await sleep(100);
    }
    return results;
  };

  try {
    const teams = await getTeams();
    if (!teams || !Array.isArray(teams)) {
      console.error('Teams data is undefined');
      return { props: { teams: [], error: 'Failed to fetch teams' }, revalidate: 3600 };
    }

    const rosters = await fetchRosterInBatches(teams);
    return { props: { teams: rosters }, revalidate: 3600 };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    return { props: { teams: [], error: 'Failed to fetch data' }, revalidate: 60 };
  }
}
