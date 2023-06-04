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
              return (
                  {
                      season: szn.season.substring(0,4)+'/'+szn.season.substring(4,8),
                      id: szn.team?.id,
                      team: {name: szn.team.name, id: szn.team?.id},
                      // team: szn.team.name,
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
                    team: {name: szn.team.name, id: szn.team?.id},

                    // team: szn.team.name,
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
        header: 'G',
        accessorKey: 'g',
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

           return <>{total ? total : 0}</>
         },
    },
   {
        header: 'A',
        accessorKey: 'a',
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

           return <>{total ? total : 0}</>
         },
    },
      {
        header: 'P',
        accessorKey: 'pts',
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
        header: 'PIM',
        accessorKey: 'pim',
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
        header: 'W',
        accessorKey: 'w',
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
        header: 'L',
        accessorKey: 'l',
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
        header: 'GAA',
        accessorKey: 'gaa',
        cell: props => props.value?.toFixed(2) || null,
        Footer: info => {
          // Only calculate total visits if rows change
          const total = useMemo(
            () => {
              let nhlGames = info.rows
                .filter((row) => {
                    return row.values.gp !== null && row.values.league.includes('National Hockey League')
                })
              let gamesPlayed = nhlGames.reduce((sum,row) => row.values.gp + sum, 0)

              let totalSvPct = nhlGames
                .reduce((sum, row) => (row.values.gaa * row.values.gp) + sum, 0)
              let total = totalSvPct / gamesPlayed
              console.log({total});
              return total.toFixed(2)
            },
            [info.rows]
          )

          return <>{total ? total : 'no'}</>
        },
    },
      {
        header: 'SV%',
        accessorKey: 'svPct',
        cell: props => props.value?.toFixed(3) || null,
        Footer: info => {
          // Only calculate total visits if rows change
          const total = useMemo(
            () => {
              let nhlGames = info.rows
                .filter((row) => {
                    return row.values.gp !== null && row.values.league.includes('National Hockey League')
                })
              let gamesPlayed = nhlGames.reduce((sum,row) => row.values.gp + sum, 0)

              let totalSvPct = nhlGames
                .reduce((sum, row) => (row.values.svPct * row.values.gp) + sum, 0)
              let total = totalSvPct / gamesPlayed
              console.log({total});
              return total.toFixed(3)
            },
            [info.rows]
          )

          return <>{total ? total : 'no'}</>
        },
   },
    // },
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
                 cell: props => props.row.original.team.id ? (<Link href={`/teams/${props.row.original.team.id}`} passHref ><a className=" hover:text-blue-700 visited:text-purple-800">{props.row.original.team.name}</a></Link>) : (props.row.original.team.name)
             },
            {
                 header: 'League',
                 accessorKey: 'league',
                 Footer: 'NHL',
             },
            {
                 header: 'GP',
                 accessorKey: 'gp',
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