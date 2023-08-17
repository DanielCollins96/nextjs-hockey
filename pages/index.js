import { motion } from 'framer-motion';
import { useRouter } from 'next/router'
import {useEffect, useState, useRef } from 'react';
import TeamBox from '../components/TeamBox'; 


export default function Home({teams}) {
const router = useRouter();

const [searchedTeams, setSearchedTeams] = useState(teams);

const inputRef = useRef();

const inputChange = (e) => {
  let searchTerm = e.target.value
  console.log(e.target.value);
  let newList = teams.filter((team) => team.name.toLowerCase().includes(searchTerm.toLowerCase()) )
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
                <input autoFocus 
                onChange={inputChange} 
                className="text-lg rounded-sm px-4 pb-3 pt-8 mt-2 focus:outline-none bg-gray-300 w-full" type="text" name="filter" id="filter" />
            </div>
            <div className="grid m-1 md:grid-cols-2 xl:grid-cols-3">
                {
                    searchedTeams &&
                    searchedTeams
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

export async function getStaticProps(){
  const res = await fetch('https://statsapi.web.nhl.com/api/v1/teams?expand=team.roster');
  const resJson = await res.json();
  const teams = resJson.teams
  return {
    props: {
      teams,
    },
    revalidate: 3600
  }

}
