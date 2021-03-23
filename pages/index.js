import { motion } from 'framer-motion';
import { Box, Flex,Text } from '@chakra-ui/react';
import Ticker from 'react-ticker';
import {useEffect, useState } from 'react';
// import Puck from '../public/ice-hockey-puck.svg';

export default function Home() {
const [games, setGames] = useState([]);
useEffect(async() => {
  const data = await fetch('https://statsapi.web.nhl.com/api/v1/schedule');
  let gameSchedule = await data.json();
  // console.log(gameSchedule.dates[0].games) 
  setGames(gameSchedule.dates[0].games);
},[])
console.log(JSON.stringify(games))
const TickerText = () => {
  return games?.map((game) => {
    return (
      <Box bg="yellow" border="2px solid black" padding={2}>
        <Text as="span">{game.teams.home.team.name} vs. {game.teams.away.team.name}</Text>
       </Box>
    )
  })
  // return <p>hey</p>
}

  return (
          <Box>
            <Box>
          { games.length > 0 ?
            <Ticker>
              {() => <Flex color="red"><TickerText /></Flex>}
            </Ticker>
            :
            null
          }
          </Box>
          <Box>
          <motion.img 
            src="/ice-hockey-puck.svg" 
            alt="Puck" 
            width="200" 
            height="200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: .1 }}
            whileTap={{ scale: 0.9 }}
            drag={true}
            />
          </Box>
    </Box>
  )
}
