import { motion } from 'framer-motion';
import { Box, Flex,Text, Stack, Input } from '@chakra-ui/react';
import Ticker from 'react-ticker';
import {useEffect, useState } from 'react';
import { format } from 'date-fns';
// import Puck from '../public/ice-hockey-puck.svg';

export default function Home() {
const [games, setGames] = useState([]);
useEffect(async() => {
  const data = await fetch('https://statsapi.web.nhl.com/api/v1/schedule');
  let gameSchedule = await data.json();
  console.log(gameSchedule.dates[0]?.games) 
  setGames(gameSchedule.dates[0]?.games);
  // console.log(format(games[0].gameDate, 'YYYY-MM-DD'))
},[])
console.log(format(new Date("2021-03-23T23:00:00Z"), 'ppp'))
// console.log(games[0].gameDate)
  return (
          <Box mt={1}>
          <Flex justify="center">
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
          </Flex>
    </Box>
  )
}
