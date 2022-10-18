import { useMemo, useState } from 'react';
import Head from 'next/head'
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
              return (
                  {
                      season: szn.season.substring(0,4)+'/'+szn.season.substring(4,8),
                      team: szn.team.name,
                      league: szn.league.name,
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
            return (
                {
                    season: szn.season.substring(0,4)+'/'+szn.season.substring(4,8),
                    team: szn.team.name,
                    league: szn.league.name,
                    gp: szn.stat.games,
                    g: szn.stat.goals,
                    a: szn.stat.assists,
                    pts: szn.stat.points,
                    pim: szn.stat.pim,
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
        Header: 'G',
        accessor: 'g',
        Footer: info => {
           // Only calculate total visits if rows change
           const total = useMemo(
             () =>
               info.rows
               .filter((row) => {
                   return row.values.g !== null && row.values.league.includes('National Hockey League')
               })
               .reduce((sum, row) => row.values.g + sum, 0),
             [info.rows]
           )

           return <>{total ? total : ''}</>
         },
    },
   {
        Header: 'A',
        accessor: 'a',
        Footer: info => {
           const total = useMemo(
             () =>
               info.rows
               .filter((row) => {
                   return row.values.a !== null && row.values.league.includes('National Hockey League')
               })
               .reduce((sum, row) => row.values.a + sum, 0),
             [info.rows]
           )

           return <>{total ? total : ''}</>
         },
    },
      {
        Header: 'P',
        accessor: 'pts',
        Footer: info => {
           const total = useMemo(
             () =>
               info.rows
               .filter((row) => {
                   return row.values.pts !== null && row.values.league.includes('National Hockey League')
               })
               .reduce((sum, row) => row.values.pts + sum, 0),
             [info.rows]
           )

           return <>{total ? total : ''}</>
         },
    },
    {
        Header: 'PIM',
        accessor: 'pim',
        Footer: info => {
           const total = useMemo(
             () =>
               info.rows
               .filter((row) => {
                   return row.values.pim !== null && row.values.league.includes('National Hockey League')
               })
               .reduce((sum, row) => row.values.pim + sum, 0),
             [info.rows]
           )

           return <>{total ? total : ''}</>
         },
    },
    ] : [
      {
        Header: 'W',
        accessor: 'w',
        Footer: info => {
          const total = useMemo(
            () =>
              info.rows
              .filter((row) => {
                  return row.values.w !== null && row.values.league.includes('National Hockey League')
              })
              .reduce((sum, row) => row.values.w + sum, 0),
            [info.rows]
          )

          return <>{total ? total : ''}</>
        },
    },
      {
        Header: 'L',
        accessor: 'l',
        Footer: info => {
          // Only calculate total visits if rows change
          const total = useMemo(
            () =>
              info.rows
              .filter((row) => {
                  return row.values.l !== null && row.values.league.includes('National Hockey League')
              })
              .reduce((sum, row) => row.values.l + sum, 0),
            [info.rows]
          )

          return <>{total ? total : ''}</>
        },
    },
      {
        Header: 'GAA',
        accessor: 'gaa',
        Cell: props => props.value?.toFixed(2),
        Footer: '',
    },
      {
        Header: 'SV%',
        accessor: 'svPct',
        Cell: props => props.value?.toFixed(3) || null,
        // Footer: info => {
        //   // Only calculate total visits if rows change
        //   const total = useMemo(
        //     () =>{
        //       let nhlGames = info.rows
        //         .filter((row) => {
        //             return row.values.gp !== null && row.values.league.includes('National Hockey League')
        //         })

        //       return nhlGames  
        //       .reduce((sum, row) => row.values.svPct + sum, 0) / nhlGames.length
        //     },
        //     [info.rows]
        //   )

        //   return <>{total ? total : ''}</>
        // },
   },
    // },
    ]

    const columns = useMemo(
        () => [
             {
                 Header: 'Season',
                 accessor: 'season' 
             },
             {
                 Header: 'Team',
                 accessor: 'team',
             },
            {
                 Header: 'League',
                 accessor: 'league',
                 Footer: 'NHL',
             },
            {
                 Header: 'GP',
                 accessor: 'gp',
                 Footer: info => {
                    // Only calculate total visits if rows change
                    const total = useMemo(
                      () =>
                        info.rows
                        .filter((row) => {
                            return row.values.gp !== null && row.values.league.includes('National Hockey League')
                        })
                        .reduce((sum, row) => row.values.gp + sum, 0),
                      [info.rows]
                    )
      
                    return <>{total ? total : ''}</>
                  },
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
                    <p>Loading...</p>    
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