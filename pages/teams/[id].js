/* eslint-disable react-hooks/rules-of-hooks */
import Link from "next/link";
import Head from "next/head";
import {useRouter} from "next/router";
import {useState, useMemo, useEffect} from "react";
import { MdOutlineChevronLeft, MdOutlineChevronRight } from "react-icons/md";

import ReactTable from "../../components/Table";
import {getTeamIds, getTeamSeasons, getTeamSkaters, getTeamGoalies, getPlayoffYears} from "../../lib/queries";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import conn from "../../lib/db";

export default function TeamPage({
  seasons = [],
  seasonIds = [],
  abbreviation,
  teamRecords
}) {

  const router = useRouter();
  const {id, season: querySeason} = router.query;

  const [seasonId, setSeasonId] = useState(querySeason || "20232024");
  const [currentIndex, setCurrentIndex] = useState(seasonIds.indexOf(seasonId))
  const [seasonData, setSeasonData] = useState(seasons[seasonId]);


  const initialShowPlayoffStats = seasonData && seasonData.madePlayoffs ? true : false;
  const [showPlayoffStats, setShowPlayoffStats] = useState(initialShowPlayoffStats);

const togglePlayoffStats = () => {
  setShowPlayoffStats(prev => !prev);
};

  useEffect(() => {
    if (window.innerWidth < 600) {
      setShowPlayoffStats(false);
    }
  }, []); // Empty dependency array ensures this runs only on mount

  useEffect(() => {
    if (seasons[seasonId]) {
      setSeasonData(seasons[seasonId]);
      setCurrentIndex(seasonIds.indexOf(seasonId));
      if (!seasons[seasonId].madePlayoffs) {
      setShowPlayoffStats(false);
    }
    }

  }, [seasons, seasonId, seasonIds]);

// 
useEffect(() => {
  console.log('URL change detected:', querySeason);

  // if (querySeason && querySeason !== seasonId) {
  //   const newIndex = seasons.findIndex(season => season.season === querySeason);
  //   if (newIndex !== -1) {  // Ensure the season exists
  //     setCurrentIndex(newIndex);
  //     setSeasonId(querySeason);  // This will also update the displayed data via other useEffects
  //   } else {
  //     console.log('Season not found for:', querySeason);
  //   }
  // }
}, [querySeason]);

  useEffect(() => {
    console.log('useEffect router');

    if (router.query.season !== seasonId) {
      router.push({
      pathname: router.pathname, // Current path
      query: { ...router.query, season: seasonId }, // Updated query parameter
      },undefined,{shallow: false})
    }
  }, [seasonId])

  const handleDecrementSeason = () => {
  console.log('Next season');
  if (currentIndex < seasonIds.length - 1) {
    const newIndex = currentIndex + 1;
    setCurrentIndex(newIndex);
    setSeasonId(seasonIds[newIndex]);
  }
  };

  const handleIncrementSeason = () => {
  console.log('Previous season');
  console.log(currentIndex);
  if (currentIndex > 0) {
    const newIndex = currentIndex - 1;
    setCurrentIndex(newIndex);
    setSeasonId(seasonIds[newIndex]);
  }
  };

  const roster_goalie_table_columns = useMemo(
    () => {
    const baseColumns =
    [
      {
        header: "Name",
        accessorFn: (d) =>  (d['firstName']['default'] + " " + d['lastName']['default']),
        cell: props => props.row.original?.playerId ? (<Link
          href={`/players/${props.row.original.playerId}`}
          passHref
          className=" hover:text-blue-700 visited:text-purple-800">{props.row.original.fullName}</Link>) : props.row.original.fullName
      },
      {
        header: "Regular Season",
        columns: [
            {
        header: "GP",
        accessorFn: (d) => d["gamesPlayed"],
        cell: props => <p className="text-right">{props.getValue()}</p>,
        // footer: ({ table }) => table.getFilteredRowModel().rows?.reduce((total, row) => total + row.getValue('GP'), 0),
      },
      {
        header: "G",
        accessorFn: (d) => d["goals"],
        footer: ({ table }) => {
          const total = table.getFilteredRowModel().rows?.reduce((total, row) => {
            const value = Number(row.getValue('G'));
            return total + (isNaN(value) ? 0 : value);
          }, 0);
          return total;
        },        cell: props => <p className="text-right">{props.getValue()}</p>
      },
      {
        header: "A",
        accessorFn: (d) => d["assists"],
        footer: ({ table }) => {
          const total = table.getFilteredRowModel().rows?.reduce((total, row) => {
            const value = Number(row.getValue('A'));
            return total + (isNaN(value) ? 0 : value);
          }, 0);
          return total;
        },        cell: props => <p className="text-right">{props.getValue()}</p>
      },
      {
        header: 'W',
        accessorFn: (d) => d['wins'],
        footer: ({ table }) => {
          const total = table.getFilteredRowModel().rows?.reduce((total, row) => {
            const value = Number(row.getValue('W'));
            return total + (isNaN(value) ? 0 : value);
          }, 0);
          return total;
        },        cell: props => <p className="text-right">{props.getValue()}</p>

    },
      {
        header: 'L',
        accessorFn: (d) => d['losses'],
        footer: ({ table }) => {
          const total = table.getFilteredRowModel().rows?.reduce((total, row) => {
            const value = Number(row.getValue('L'));
            return total + (isNaN(value) ? 0 : value);
          }, 0);
          return total;
        },        cell: props => <p className="text-right">{props.getValue()}</p>

    },
      {
        header: 'GAA',
        accessorFn: (d) => d['goalsAgainstAverage'],
        cell: props =>  <p className="text-right">{props.getValue()?.toFixed(2) || null}</p>,
        footer: ({ table }) => { 
          const nhlGames = table.getFilteredRowModel()?.rows;
          if (!nhlGames || nhlGames.length === 0) return null;

          let gp = nhlGames.reduce((total, row) => {
            const gpValue = Number(row.getValue('GP'));
            return total + (isNaN(gpValue) ? 0 : gpValue);
          }, 0);

          let totalGaa = nhlGames.reduce((total, row) => {
            const gpValue = Number(row.getValue('GP'));
            const gaaValue = Number(row.getValue('GAA'));
            return total + (isNaN(gpValue) || isNaN(gaaValue) ? 0 : gpValue * gaaValue);
          }, 0);

          if (gp === 0) return null;
          let total = totalGaa / gp;
          return total.toFixed(2) || null;
        }
      },
      {
        header: 'SV%',
        accessorFn: (d) => d['savePercentage'],
        cell: props => <p className="text-right">{props.getValue()?.toFixed(3) || null}</p>,
        footer: ({ table }) => {
          const nhlGames = table.getFilteredRowModel()?.rows;
          if (!nhlGames || nhlGames.length === 0) return null;

          let gp = nhlGames.reduce((total, row) => {
            const gpValue = Number(row.getValue('GP'));
            return total + (isNaN(gpValue) ? 0 : gpValue);
          }, 0);

          let totalSvPct = nhlGames.reduce((total, row) => {
            const gpValue = Number(row.getValue('GP'));
            const svPctValue = Number(row.getValue('SV%'));
            return total + (isNaN(gpValue) || isNaN(svPctValue) ? 0 : gpValue * svPctValue);
          }, 0);

          if (gp === 0) return null;
          let total = totalSvPct / gp;
          return total.toFixed(3) || null;
        },
        
    },
      {
        header: "PIM",
        accessorFn: (d) => d["penaltyMinutes"],
        footer: ({ table }) => {
          const total = table.getFilteredRowModel().rows?.reduce((total, row) => {
            const value = Number(row.getValue('PIM'));
            return total + (isNaN(value) ? 0 : value);
          }, 0);
          return total;
        },        cell: props => <p className="text-right">{props.getValue()}</p>
    }]}]
      const playoffColumns = [
      {
      header: "Playoffs",
      columns: [
      {
        header: "PO GP",
        accessorFn: (d) => d["playoffGamesPlayed"],
        cell: props => <p className="text-right">{props.getValue()}</p>,
      },
      {
        header: "PO P",
        accessorFn: (d) => d["playoffPoints"],
        cell: props => <p className="text-right">{props.getValue()}</p>,
      },
      {
        header: "PO W",
        accessorFn: (d) => d["playoffWins"],
        cell: props => <p className="text-right">{props.getValue()}</p>,
      },
      {
        header: "PO L",
        accessorFn: (d) => d["playoffLosses"],
        cell: props => <p className="text-right">{props.getValue()}</p>,
      },]}
    ]
    return showPlayoffStats ? [...baseColumns, ...playoffColumns] : baseColumns;
    },[showPlayoffStats]
    )

  const roster_player_table_columns = useMemo(
    () => {const baseColumns = [
      {
        header: "Name",
        accessorFn: (d) =>  (d['fullName']),
        cell: props => props.row.original?.playerId ? (<Link
          href={`/players/${props.row.original.playerId}`}
          passHref
          className=" hover:text-blue-700 visited:text-purple-800">{props.row.original.fullName}</Link>) : (props.row.original.fullName)
      },
      {
        header: "Regular Season",
        columns: [
      {
        header: "Pos.",
        accessorFn: (d) => d["positionCode"],
      },
      {
        header: "GP",
        accessorFn: (d) => d["gamesPlayed"],
        cell: props => <p className="text-right">{props.getValue()}</p>,
      },
      {
        header: "G",
        accessorFn: (d) => d["goals"],
        footer: ({ table }) => {
          const total = table.getFilteredRowModel().rows?.reduce((total, row) => {
            const value = Number(row.getValue('G'));
            return total + (isNaN(value) ? 0 : value);
          }, 0);
          return total;
        },
        cell: props => <p className="text-right">{props.getValue()}</p>
      },
      {
        header: "A",
        accessorFn: (d) => d["assists"],
       footer: ({ table }) => {
          const total = table.getFilteredRowModel().rows?.reduce((total, row) => {
            const value = Number(row.getValue('A'));
            return total + (isNaN(value) ? 0 : value);
          }, 0);
          return total;
        },        cell: props => <p className="text-right">{props.getValue()}</p>
      },
      {
        header: "P",
        accessorFn: (d) => d["points"],
       footer: ({ table }) => {
          const total = table.getFilteredRowModel().rows?.reduce((total, row) => {
            const value = Number(row.getValue('P'));
            return total + (isNaN(value) ? 0 : value);
          }, 0);
          return total;
        },
        cell: props => <p className="text-right">{props.getValue()}</p>
      },
      {
        header: "PIM",
        accessorFn: (d) => d["penaltyMinutes"],
        footer: ({ table }) => {
            const total = table.getFilteredRowModel().rows?.reduce((total, row) => {
              const value = Number(row.getValue('PIM'));
              return total + (isNaN(value) ? 0 : value);
            }, 0);
            return total;
          },
        cell: props => <p className="text-right">{props.getValue()}</p>
      },
      {
        header: "+/-",
        accessorFn: (d) => d["plusMinus"],
        footer: ({ table }) => {
            const total = table.getFilteredRowModel().rows?.reduce((total, row) => {
              const value = Number(row.getValue('+/-'));
              return total + (isNaN(value) ? 0 : value);
            }, 0);
            return total;
          },  
        cell: props => <p className="text-right">{props.getValue()}</p>
      }]}]
      const playoffColumns= [
      {
      header: "Playoffs",
      columns: [
      {
        header: "GP",
        id: "PO GP",
        accessorFn: (d) => d["playoffGamesPlayed"],
        cell: props => <p className="text-right">{props.getValue()}</p>,
      },
      {
        header: "G",
        id: "PO G",
        accessorFn: (d) => d["playoffGoals"],
        cell: props => <p className="text-right">{props.getValue()}</p>,
      },
      {
        header: "A",
        id: "PO A",
        accessorFn: (d) => d["playoffAssists"],
        cell: props => <p className="text-right">{props.getValue()}</p>,
      },
      {
        header: "P",
        id: "PO P",
        accessorFn: (d) => d["playoffPoints"],
        cell: props => <p className="text-right">{props.getValue()}</p>,
      },
      {
        header: "PIM",
        id: "PO PIM",
        accessorFn: (d) => d["playoffPenaltyMinutes"],
        cell: props => <p className="text-right">{props.getValue()}</p>,
      }]
      }
    ]
    return showPlayoffStats ? [...baseColumns, ...playoffColumns] : baseColumns;

    },
    [showPlayoffStats]
  );

  const team_table_data = useMemo(() => teamRecords, [teamRecords]);

  const team_table_columns = useMemo(
    () => [
      {
        header: "Year",
        accessorKey: "seasonId",
      },
        {
          header: "W",
          accessorKey: "wins",
        },
        {
          header: "L",
          accessorKey: "losses",
        },
        // {
        //   header: "ROW",
        //   accessorKey: "row",
        // },
        // {
        //   header: "S/O W",
        //   accessorKey: "winsInShootout",
        // },
        {
          header: "Pts",
          accessorKey: "points",
        },
        {
          header: "GFPG",
          accessorKey: "goalsForPerGame",
        },
        {
          header: "GAPG",
          accessorKey: "goalsAgainstPerGame",
        },
        // {
        //   header: "Place",
        //   accessorKey: "place",
        // },
    ],
    []
  );

return (
  <div>
          <Head>
        <title>{abbreviation} Roster | hockeydb.xyz</title>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2056923001767627"
          crossOrigin="anonymous"
        ></script>
      </Head>
      <div className="text-center border border-black rounded p-2">
        <p className="text-lg">{abbreviation}</p>
        {/* <p>{team_data[0]?.firstYearOfPlay}</p> */}
        {/* <Link href={`${team_data[0]?.officialSiteUrl}`}>
          <a className="hover:text-blue-700">{team_data[0]?.officialSiteUrl}</a>
        </Link> */}
      </div>
            <div className="gap-1 p-1 flex flex-col lg:flex-row">

          {seasons && (
          <div className="border-2 w-screen p-1 flex flex-col max-w-2xl">
          <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
          <div>
            <label className="px-1" htmlFor="season">Season:</label>
            <select
              className="flex w-32 justify-end"
              value={seasonId}
              onChange={(event) => {
                const newSeasonId = event.target.value;
                const newIndex = seasonIds.indexOf(newSeasonId);
                setSeasonId(newSeasonId);
                setCurrentIndex(newIndex);;
              }}>
              {seasonIds &&
                seasonIds?.map((szn) => {
                  return (
                    <option key={szn} value={szn}>
                      {szn} {seasons && seasons[szn].madePlayoffs ? '(P)' : ''}
                    </option>
                  );
                })
                }
            </select>
          </div>
            <button className="btn-blue m-1 btn-disabled" onClick={handleDecrementSeason} disabled={currentIndex >= seasonIds.length - 1}><MdOutlineChevronLeft size={28}/></button>
            <button className="btn-blue m-1 btn-disabled" onClick={handleIncrementSeason} disabled={currentIndex <= 0}><MdOutlineChevronRight size={28}/></button>
          </div>

          {seasonData && seasonData.madePlayoffs && (<button onClick={togglePlayoffStats} className=" bg-red-500 text-white p-2 rounded">
            {showPlayoffStats ? 'Hide PO Stats' : 'Show PO Stats'}
          </button>)}
          </div>
          
          {seasonData && seasonData?.skaters &&
            <ReactTable
              data={seasonData.skaters}
              columns={roster_player_table_columns}
              sortKey="P"
            />
          }
          {seasonData && seasonData?.goalies &&
            <ReactTable
              data={seasonData.goalies}
              columns={roster_goalie_table_columns}
              sortKey="P"
            />
          }
          </div>
        )}
        <div className="border-2 p-1 flex flex-col">
            <div className="p-2 mx-auto">
              {/* <input type="" /> */}
              <ResponsiveContainer width={450} height={300}>
                <LineChart data={team_table_data}>
                  <YAxis />
                  <XAxis dataKey="year" />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    name="Points"
                    dataKey="points"
                    strokeWidth={2}
                    stroke="#000"
                  />
                  <Line
                    type="monotone"
                    name="Wins"
                    dataKey="wins"
                    strokeWidth={2}
                    stroke="#009966"
                  />
                  <Line
                    type="monotone"
                    name="S/O Wins"
                    dataKey="winsInShootout"
                    strokeWidth={2}
                    stroke="#11F"
                  />
                  <Line
                    type="monotone"
                    name="Losses"
                    dataKey="losses"
                    strokeWidth={2}
                    stroke="#FF0000"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
      <div className="p-2 mx-auto">
              {team_table_data && (
                <ReactTable
                  // columns={newColumns}
                    columns={team_table_columns}
                  data={team_table_data}
                  sortKey="year"
                />
              )}
      </div>
      </div>
      </div>
  </div>
)

}

export async function getStaticPaths() {
  const teams = await getTeamIds();
  let paths = teams?.map((team) => ({
    params: {id: team.id},
  }));
  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({params}) {
  let abbreviation = null
  try {
  const sql = ` 
      SELECT "triCode"
      FROM newapi.team 
      WHERE id = $1
    ` 
    abbreviation = await conn.query(sql,[params.id])  
  } catch (error) {
    console.log(error)
  }

  if (abbreviation) {
    abbreviation = abbreviation.rows[0].triCode
  }

  let skaters = await getTeamSkaters(params.id);
  let goalies = await getTeamGoalies(params.id);
console.log(skaters);
console.log(goalies);
  const combinePlayersBySeason = (skaters, goalies) => {
    const seasonMap = {};

    skaters.forEach(skaters => {
      const season = skaters.season;
      if (!seasonMap[season]) {
        seasonMap[season] = { skaters: [], goalies: [] };
      }
      seasonMap[season].skaters.push(skaters);
    });

    goalies.forEach(goalie => {
      const season = goalie.season;
      if (!seasonMap[season]) {
        seasonMap[season] = { skaters: [], goalies: [] };
      }
      seasonMap[season].goalies.push(goalie);
    });

    return seasonMap;
  };

  const seasonMap = combinePlayersBySeason(skaters, goalies);
  const seasons = Object.keys(seasonMap).sort((a, b) => b.localeCompare(a));
  const playoffSeasons = await getPlayoffYears(abbreviation)
  
  seasons.forEach(season => {
    seasonMap[season].madePlayoffs = playoffSeasons.includes(season);
});
  let teamRecords = await getTeamSeasons(params.id) || [];

  return {
    props: {
      seasons: seasonMap,
      seasonIds: seasons,
      abbreviation,
      teamRecords
      }
    }
  }