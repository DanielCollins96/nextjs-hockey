import { motion } from 'framer-motion';
import { useRouter } from 'next/router'
import Ticker from 'react-ticker';
import {useEffect, useState, useRef } from 'react';
import { format } from 'date-fns';
// import Puck from '../public/ice-hockey-puck.svg';

export default function Home() {
const router = useRouter();
const [games, setGames] = useState([]);

const inputRef = useRef();
let refGuy = ''
useEffect(() => {
  console.log(inputRef.current.getClientRects())
  let refGuy = inputRef.current;
  const loadGames = async () => {
    const data = await fetch('https://statsapi.web.nhl.com/api/v1/schedule');
    const gameSchedule = await data.json();
    setGames(gameSchedule.dates[0]?.games);
  }
  loadGames();
  console.log('LOLOLO')

  // console.log(format(games[0].gameDate, 'YYYY-MM-DD'))
},[])

function onUpdate(latest) {
  console.log(latest.x, latest.y)
}

function onPress() {
  console.log('whaththahh');
  router.reload()
  // window.location.reload(false);
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

        </div>
    </div>
  )
}
