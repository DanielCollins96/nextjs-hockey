import { useMemo, useState } from 'react';
import Head from 'next/head'
import Link from 'next/link';
import { useQuery, useQueries } from 'react-query';
import { useRouter } from 'next/router';
// import Image from 'next/image'
import ReactTable from '../../components/Table';
// https://statsapi.web.nhl.com/api/v1/people/8474056/stats/?stats=statsSingleSeason&season=20122013


const Players = () => {

    const router = useRouter()
    const { id } = router.query

    const fetchPlayer = async () => {

        const res = await fetch(`https://statsapi.web.nhl.com/api/v1/people/${id}`);
        const playerRes = await res.json()

        return playerRes
    }
    
    const fetchPlayerStats = async (position) => {
        const res = await fetch(`https://statsapi.web.nhl.com/api/v1/people/${id}/stats?stats=yearByYear`);
        const playerRes = await res.json()
        const playerStats = {}
        if (position == 'G') {
            playerStats = playerRes.stats[0].splits.map((szn) => {
            const league = szn.league.name === 'National Hockey League' ? 'NHL' : szn.league.name;
              return (
                  {
                      season: szn.season.substring(0,4)+'-'+szn.season.substring(6,8),
                      id: szn.team?.id,
                      team: {name: szn.team.name, id: szn.team?.id},
                      // team: szn.team.name,
                      league: league,
                      gp: szn.stat.games,
                      w: szn.stat.wins,
                      l: szn.stat.losses,
                      gaa: szn.stat.goalAgainstAverage,
                      svPct: szn.stat.savePercentage,
                      so: szn.stat.shutouts,
                  }
              )
          })
        } else {
            playerStats = playerRes.stats[0].splits.map((szn) => {
            const league = szn.league.name === 'National Hockey League' ? 'NHL' : szn.league.name;
            return (
                {
                    season: szn.season.substring(0,4)+'-'+szn.season.substring(6,8),
                    team: {name: szn.team.name, id: szn.team?.id},

                    // team: szn.team.name,
                    league: league,
                    gp: szn.stat.games,
                    g: szn.stat.goals,
                    a: szn.stat.assists,
                    pts: szn.stat.points,
                    pim: szn.stat.pim,
                    plusMinus: szn.stat.plusMinus
                }
            )
        })
        }
        console.log({playerStats})

        playerStats.sort((a,b) => {
            let fa = a.season.toLowerCase(),
            fb = b.season.toLowerCase();
            if (fa > fb) {
                return -1;
            }
            if (fa < fb) {
                return 1;
            }
        })

        return playerStats
    }
    const { data: player, status: player_status } = useQuery(`player-${id}`, fetchPlayer);
    const position = player?.people[0]?.primaryPosition?.code || 'C';

    const { data: playerStats, status: stats_status } = useQuery([`playerStats`, id], () => fetchPlayerStats(position), {enabled: !!player});
    
    let playerStuff = position !== 'G' ? [
      {
        header: 'G',
        accessorKey: 'g',
        footer: ({ table }) => table.getFilteredRowModel().rows?.filter((row) => row.getValue('gp') !== null && row.getValue('league').includes('NHL')).reduce((total, row) => total + row.getValue('g'), 0),
    },
   {
        header: 'A',
        accessorKey: 'a',
        footer: ({ table }) => table.getFilteredRowModel().rows?.filter((row) => row.getValue('gp') !== null && row.getValue('league').includes('NHL')).reduce((total, row) => total + row.getValue('a'), 0),

    },
      {
        header: 'P',
        accessorKey: 'pts',
        footer: ({ table }) => table.getFilteredRowModel().rows?.filter((row) => row.getValue('gp') !== null && row.getValue('league').includes('NHL')).reduce((total, row) => total + row.getValue('pts'), 0),

    },
    {
        header: 'PIM',
        accessorKey: 'pim',
        footer: ({ table }) => table.getFilteredRowModel().rows?.filter((row) => row.getValue('gp') !== null && row.getValue('league').includes('NHL')).reduce((total, row) => total + row.getValue('pim'), 0),
    },
    {
        header: '+/-',
        accessorKey: 'plusMinus',
        footer: ({ table }) => table.getFilteredRowModel().rows?.filter((row) => row.getValue('gp') !== null && row.getValue('league').includes('NHL')).reduce((total, row) => total + row.getValue('plusMinus'), 0),
    },
    ] : [
      {
        header: 'W',
        accessorKey: 'w',
        footer: ({ table }) => table.getFilteredRowModel().rows?.filter((row) => row.getValue('gp') !== null && row.getValue('league').includes('NHL')).reduce((total, row) => total + row.getValue('w'), 0),

    },
      {
        header: 'L',
        accessorKey: 'l',
        footer: ({ table }) => table.getFilteredRowModel().rows?.filter((row) => row.getValue('gp') !== null && row.getValue('league').includes('NHL')).reduce((total, row) => total + row.getValue('l'), 0),

    },
      {
        header: 'GAA',
        accessorKey: 'gaa',
        cell: props => props.getValue()?.toFixed(2) || null,
        footer: ({ table }) => { 
          const nhlGames = table.getFilteredRowModel().rows?.filter((row) => row.getValue('gp') !== null && row.getValue('league').includes('NHL'));
          let gp =  nhlGames.reduce((total, row) => total + row.getValue('gp'), 0)
          let totalGaa = nhlGames.reduce((total, row) => total + (row.getValue('gp') * row.getValue('gaa')), 0)
          let total = totalGaa / gp
          return total.toFixed(2) || null
        }
      },
      {
        header: 'SV%',
        accessorKey: 'svPct',
        cell: props => props.getValue()?.toFixed(3) || null,
        footer: ({ table }) => { 
          const nhlGames = table.getFilteredRowModel().rows?.filter((row) => row.getValue('gp') !== null && row.getValue('league').includes('NHL'));
          let gp =  nhlGames.reduce((total, row) => total + row.getValue('gp'), 0)
          let totalSvPct = nhlGames.reduce((total, row) => total + (row.getValue('gp') * row.getValue('svPct')), 0)
          let total = totalSvPct / gp
          return total.toFixed(3) || null
        }
   },
    ]

    const columns = useMemo(
        () => [
             {
                 header: 'Season',
                 accessorKey: 'season',
             },
             {
                 header: 'Team',
                 accessorKey: 'team',
                 cell: props => props.row.original.league == 'NHL' ? (<Link href={`/teams/${props.row.original.team.id}?season=${props.row.original.season}`} passHref ><a className=" hover:text-blue-700 visited:text-purple-800">{props.row.original.team.name}</a></Link>) : (props.row.original.team.name)
             },
            {
                 header: 'League',
                 accessorKey: 'league',
                 footer: 'NHL',
             },
            {
                 header: 'GP',
                 accessorKey: 'gp',
                 footer: ({ table }) => table.getFilteredRowModel().rows?.filter((row) => row.getValue('gp') !== null && row.getValue('league').includes('NHL')).reduce((total, row) => total + row.getValue('gp'), 0),
             },
            ...playerStuff
        ],
        [position]
    )
    const data = useMemo(
        () => playerStats
    , [])
    return (
        <div className="flex flex-col sm:flex-row mt-2">
            <Head>
                <title>
                   {player?.people[0]?.fullName ? player?.people[0]?.fullName : 'Player'} Hockey Stats and Profile | the-nhl.com
                </title>
                <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2056923001767627"
     crossOrigin="anonymous"></script>
            </Head>
            <div className="flex flex-row sm:flex-col h-full justify-start items-center p-2 ml-2">
                <img src={`http://nhl.bamcontent.com/images/headshots/current/168x168/${id}.jpg`} alt="" />
                    {player_status === 'success' ? (
                        <div className="w-56 p-1 m-1">
                        <p className="text-2xl font-bold">{player.people[0].fullName}</p>
                        <p>Birth Date: {player.people[0].birthDate}</p>
                        <p>Nationality: {player.people[0].birthCountry}</p>
                        <p>Position: {player.people[0].primaryPosition.name}</p>
                        <p>Primary Number: {player.people[0].primaryNumber}</p>
                        <p>Age: {player.people[0].currentAge}</p>
                        </div>
                    ) :
                    <p className='w-56'>Loading...</p>    
                }
            </div>
            {stats_status === 'success' ? <ReactTable columns={columns} data={playerStats} /> : <p>Loading...</p>}
            {stats_status === 'error' ? <p>Error Fetching Stats.</p> : null}
        </div>
    )
};

// export async function getStaticProps() {
    
// }

export default Players;