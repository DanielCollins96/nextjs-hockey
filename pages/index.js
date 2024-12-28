import { motion } from 'framer-motion';
import { useRouter } from 'next/router'
import {useEffect, useState, useRef } from 'react';
import TeamBox from '../components/TeamBox'; 
import { getTeams } from '../lib/queries';


export default function Home({teams}) {
const router = useRouter();

const [searchedTeams, setSearchedTeams] = useState(teams);

const inputRef = useRef();

const inputChange = (e) => {
  let searchTerm = e.target.value
  console.log(e.target.value);
  let newList = teams.filter((team) => team.team.name.toLowerCase().includes(searchTerm.toLowerCase()) )
  setSearchedTeams(newList)
}

function onUpdate(latest) {
  console.log(latest.x, latest.y)
}

function onPress() {
  router.reload()
}
  return (
    <div className="">
      <div className="grid place-content-center m-4">
        <button className='bg-blue-200 px-3 py-1 rounded' onClick={() => onPress()}>Reset Puck</button>
      </div>
        <div className="mt-4 p-2">
          <div className="flex justify-around">
            <motion.img 
              src="/Hockey-Net.svg" 
              alt="Puck" 
              width="200" 
              height="200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: .1 }}
              whileTap={{ scale: 0.9 }}
              // drag={true}
            />
          <div className='grid inset-0 relative w-24 place-content-end'>
            <motion.img 
                ref={inputRef}
                className="absolute bottom-0"
                src="/ice-hockey-puck.svg" 
                alt="Puck" 
                width="100" 
                height="100"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: .1 }}
                whileTap={{ scale: 0.9 }}
                drag={true}
                onUpdate={onUpdate} 
              />
            </div>
            </div>
        </div>
        <div>
        <div className="relative w-5/6 max-w-sm m-auto box-border">
                <label className="absolute left-0 top-0 font-bold m-4" htmlFor="filter">Search By Team</label>
                <input 
                onChange={inputChange} 
                className="text-lg rounded-sm px-4 pb-3 pt-8 mt-2 focus:outline-none bg-gray-300 w-full" type="text" name="filter" id="filter" />
            </div>
            <div className="grid m-1 md:grid-cols-2 xl:grid-cols-3">
                {
                    searchedTeams && searchedTeams
                    .sort((teamA, teamB) => {
                        return teamA.name > teamB.name ? 1 : -1
                    })                    
                    .map((team) => <TeamBox team={team} key={team.id}/>)
                }       
            </div>
        </div>
    </div>
  )
}

export async function getStaticProps() {
    // const teams = await fetchPlayers();
    
  try {
    const teams = await getTeams();
    if (!teams) {
      console.error('Teams data is undefined');
      return {
          props: {
              rosters: [],
              error: 'Failed to fetch teams'
          }
      }
    }
    const fetchRosterPromises = await teams?.map(team => {
        // let url = `https://api-web.nhle.com/v1/club-stats/${team.abbreviation}/now`
        let url = `https://api-web.nhle.com/v1/roster/${team.abbreviation}/current`
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

    return {
        props: {
            teams: rosters
        },
        revalidate: 3600
    }
  } catch (error) {
            console.error('Error in getStaticProps:', error);
        return {
            props: {
                rosters: [],
                error: 'Failed to fetch data'
            }
        }
  }
    
}
