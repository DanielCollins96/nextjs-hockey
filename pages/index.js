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
  console.log(gameSchedule.dates[0].games) 
  setGames(gameSchedule.dates[0].games);
  // console.log(format(games[0].gameDate, 'YYYY-MM-DD'))
},[])
console.log(format(new Date("2021-03-23T23:00:00Z"), 'ppp'))
// console.log(games[0].gameDate)
const TickerText = () => {
  // <Box bg="yellow" border="2px solid black" padding={2} w={256} display="inline-block">
  return games?.map((game) => {
    return (
      <>
      <Stack spacing={0} p={1} mx={.5}  border="black solid 1px">
        <Text m={0} as="span" fontSize="xs"whiteSpace="nowrap">Home: {game.teams.home.team.name}: {game.teams.home.score}</Text>
        <Text margin="0" as="span" fontSize="xs"whiteSpace="nowrap">Away: {game.teams.away.team.name}: {game.teams.home.score}</Text>
        <Text m={0} as="span" fontSize="xs"whiteSpace="nowrap">{format(new Date(game.gameDate), 'ppp')}</Text>
      </Stack>
    </>
    )
  })
  // return <p>hey</p>
}

  return (
          <Box mt={1}>
            <Box>
          { games.length > 0 ?
            <Ticker>
              {() => <Flex color="red"><TickerText /></Flex>}
              {/* {() => <TickerText />} */}
            </Ticker>
            :
            null
          }
          </Box>
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
