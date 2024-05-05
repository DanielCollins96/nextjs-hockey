/* eslint-disable react-hooks/rules-of-hooks */
import Link from "next/link";
import Head from "next/head";
import {useRouter} from "next/router";
import {useState, useMemo, useEffect} from "react";
import { MdOutlineChevronLeft, MdOutlineChevronRight } from "react-icons/md";

import ReactTable from "../../components/Table";
import {getTeamIds} from "../../lib/queries";
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
teamId,
  seasons = [],
  abbreviation
}) {

  const router = useRouter();
  const {id, season: querySeason} = router.query;
  const [seasonId, setSeasonId] = useState(querySeason || "20232024");
  const [currentIndex, setCurrentIndex] = useState(() => {
    const seasonIndex = seasons.findIndex(season => season.season === seasonId);
    return seasonIndex === -1 ? 0 : seasonIndex;
  });
  console.log(currentIndex);

  const [seasonData, setSeasonData] = useState({});

  useEffect(() => {
    const data = seasons.find(season => season.season === seasonId);
    setSeasonData(data);
  }, [seasonId, seasons]);

  useEffect(() => {
    if (seasons[currentIndex]) {
      setSeasonId(seasons[currentIndex].season);
    }
  }, [currentIndex, seasons]);

  const handleDecrementSeason = () => {
    if (currentIndex < seasons.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleIncrementSeason = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const roster_goalie_table_columns = useMemo(
    () => [
      {
        header: "Name",
        accessorFn: (d) =>  (d['firstName']['default'] + " " + d['lastName']['default']),
        cell: props => props.row.original?.playerId ? (<Link href={`/players/${props.row.original.playerId}`} passHref ><a className=" hover:text-blue-700 visited:text-purple-800">{props.row.original.firstName.default + " " + props.row.original.lastName.default}</a></Link>) : (props.row.original.firstName.default + " " + props.row.original.lastName.default)
      },
            {
        header: "GP",
        accessorFn: (d) => d["gamesPlayed"],
        cell: props => <p className="text-right">{props.getValue()}</p>,
        // footer: ({ table }) => table.getFilteredRowModel().rows?.reduce((total, row) => total + row.getValue('GP'), 0),
      },
      {
        header: "G",
        accessorFn: (d) => d["goals"],
        footer: ({ table }) => table.getFilteredRowModel().rows?.reduce((total, row) => total + row.getValue('G'), 0),
        cell: props => <p className="text-right">{props.getValue()}</p>
      },
      {
        header: "A",
        accessorFn: (d) => d["assists"],
        footer: ({ table }) => table.getFilteredRowModel().rows?.reduce((total, row) => total + row.getValue('A'), 0),
        cell: props => <p className="text-right">{props.getValue()}</p>
      },
      {
        header: 'W',
        accessorFn: (d) => d['wins'],
        footer: ({ table }) => table.getFilteredRowModel().rows?.reduce((total, row) => total + row.getValue('W'), 0),
        cell: props => <p className="text-right">{props.getValue()}</p>

    },
      {
        header: 'L',
        accessorFn: (d) => d['losses'],
        footer: ({ table }) => table.getFilteredRowModel().rows?.reduce((total, row) => total + row.getValue('L'), 0),
        cell: props => <p className="text-right">{props.getValue()}</p>

    },
      {
        header: 'GAA',
        accessorFn: (d) => d['goalsAgainstAverage'],
        cell: props =>  <p className="text-right">{props.getValue()?.toFixed(2) || null}</p>,
        footer: ({ table }) => { 
          const nhlGames = table.getFilteredRowModel().rows
          let gp =  nhlGames.reduce((total, row) => total + row.getValue('GP'), 0)
          let totalGaa = nhlGames.reduce((total, row) => total + (row.getValue('GP') * row.getValue('GAA')), 0)
          let total = totalGaa / gp
          return total.toFixed(2) || null
        }
      },
      {
        header: 'SV%',
        accessorFn: (d) => d['savePercentage'],
        cell: props => <p className="text-right">{props.getValue()?.toFixed(3) || null}</p>,
        footer: ({ table }) => { 
          const nhlGames = table.getFilteredRowModel()?.rows
          let gp =  nhlGames.reduce((total, row) => total + row.getValue('GP'), 0)
          let totalSvPct = nhlGames.reduce((total, row) => total + (row.getValue('GP') * row.getValue('SV%')), 0)
          let total = totalSvPct / gp
          return total.toFixed(3) || null
        },
        
    },
      {
        header: "PIM",
        accessorFn: (d) => d["penaltyMinutes"],
        footer: ({ table }) => table.getFilteredRowModel().rows?.reduce((total, row) => total + row.getValue('PIM'), 0),
        cell: props => <p className="text-right">{props.getValue()}</p>
      },
    ])

  const roster_player_table_columns = useMemo(
    () => [
      {
        header: "Name",
        accessorFn: (d) =>  (d['firstName']['default'] + " " + d['lastName']['default']),
        cell: props => props.row.original?.playerId ? (<Link href={`/players/${props.row.original.playerId}`} passHref ><a className=" hover:text-blue-700 visited:text-purple-800">{props.row.original.firstName.default + " " + props.row.original.lastName.default}</a></Link>) : (props.row.original.fullName)
      },
      {
        header: "Pos.",
        accessorFn: (d) => d["positionCode"],
      },
      {
        header: "GP",
        accessorFn: (d) => d["gamesPlayed"],
        cell: props => <p className="text-right">{props.getValue()}</p>,
        // footer: ({ table }) => table.getFilteredRowModel().rows?.reduce((total, row) => total + row.getValue('GP'), 0),
      },
      {
        header: "G",
        accessorFn: (d) => d["goals"],
        footer: ({ table }) => table.getFilteredRowModel().rows?.reduce((total, row) => total + row.getValue('G'), 0),
        cell: props => <p className="text-right">{props.getValue()}</p>
      },
      {
        header: "A",
        accessorFn: (d) => d["assists"],
        footer: ({ table }) => table.getFilteredRowModel().rows?.reduce((total, row) => total + row.getValue('A'), 0),
        cell: props => <p className="text-right">{props.getValue()}</p>
      },
      {
        header: "P",
        accessorFn: (d) => d["points"],
        footer: ({ table }) => table.getFilteredRowModel().rows?.reduce((total, row) => total + row.getValue('P'), 0),
        cell: props => <p className="text-right">{props.getValue()}</p>
      },
      {
        header: "PIM",
        accessorFn: (d) => d["penaltyMinutes"],
        footer: ({ table }) => table.getFilteredRowModel().rows?.reduce((total, row) => total + row.getValue('PIM'), 0),
        cell: props => <p className="text-right">{props.getValue()}</p>
      },
      {
        header: "+/-",
        accessorFn: (d) => d["plusMinus"],
        footer: ({ table }) => table.getFilteredRowModel().rows?.reduce((total, row) => total + row.getValue('+/-'), 0),
        cell: props => <p className="text-right">{props.getValue()}</p>
      },
    ],
    []
  );

return (
  <div>
          <Head>
        <title>{abbreviation} Roster | the-nhl.com</title>
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
          {seasons && (
          <div className="border-2  w-screen p-1 flex flex-col max-w-2xl">
          <div className="flex items-center">
            <label className="px-1 text-lg" htmlFor="season">Season:</label>
            <select
              className="flex w-32 justify-end"
              value={seasonId}
              onChange={(event) => {
                const newSeasonId = event.target.value;
                const newIndex = seasons.findIndex(season => season.season === newSeasonId);
                setCurrentIndex(newIndex);
                router.push({
                  pathname: router.pathname, // Current path
                  query: { ...router.query, season: newSeasonId }, // Updated query parameter
                },undefined,{shallow: true});
              }}>
              {seasons &&
                seasons?.map((szn) => {
                  return (
                    <option key={szn.season} value={szn.season}>
                      {szn.season}
                    </option>
                  );
                })}
            </select>
            <button className="btn-blue m-1 btn-disabled" onClick={handleDecrementSeason} disabled={currentIndex >= seasons.length - 1}><MdOutlineChevronLeft size={28} /></button>
            <button className="btn-blue m-1 btn-disabled" onClick={handleIncrementSeason} disabled={currentIndex <= 0}><MdOutlineChevronRight size={28}/></button>

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
  </div>
)

}

export async function getStaticPaths() {
  // const path = "https://statsapi.web.nhl.com/api/v1/teams/";
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
  let data = null
  try {
  const sql = `
      SELECT abbreviation
      FROM staging1.team 
      WHERE id = ${params.id} 
    ` 
    abbreviation = await conn.query(sql)  
  } catch (error) {
    console.log(error)
  }

  if (abbreviation) {
  let url = `https://api-web.nhle.com/v1/club-stats-season/${abbreviation.rows[0].abbreviation}`
  const response = await fetch(url);
  data = await response.json();
  }

  const fetchRoster = async () => {
    const fetchPromises = data.map(year => {
      const yearUrl = `https://api-web.nhle.com/v1/club-stats/${abbreviation.rows[0].abbreviation}/${year.season}/2`;
      return fetch(yearUrl).then(response => response.json());
    });

    return Promise.all(fetchPromises);
  };

  const rosterData = (await fetchRoster()).sort((a,b) => {
    // return b.season.localeCompare(a.season)
      if (a.season > b.season) {
    return -1; // a comes before b
  }
  if (a.season < b.season) {
    return 1; // b comes before a
  }
  return 0; // a and b are equal
  })
  ;


  return {
    props: {
      teamId: params.id,
      seasons: rosterData,
      abbreviation: abbreviation.rows[0].abbreviation
      // yearly_data: season_stats,
      // team_name,
      // team_data,
      // rosters,
      // seasons: years,
      }
    }
  }
    


// export async function getStaticProps({params}) {
//   const fetchSeasons = async () => {
//     const team = await fetch(
//       `https://statsapi.web.nhl.com/api/v1/teams/${params.id}`
//     );
//     const data = await team.json();
//     const team_data = data.teams;

//     const roster_data = await getRoster(params.id);
//     let rosters = roster_data
//     // .map(r => r.season = r.season.slice(0,4) +'-'+ r.season.slice(6) )
//     .reduce((r, curr) => {
//       (r[curr.season.slice(0,4)+'-'+curr.season.slice(6)] = r[curr.season.slice(0,4)+'-'+curr.season.slice(6)] || []).push(curr);
//       // (r[curr.season] = r[curr.season] || []).push(curr);
//       return r;
//     }, {});

//     let years = "20222023";
//     if (rosters) {
//       years = Object.keys(rosters);
//     }


//     let seasons = [];
//     for (let i = 2013; i <= 2022; i++) {
//       const res = await fetch(
//         `https://statsapi.web.nhl.com/api/v1/teams/${
//           params.id
//         }?expand=team.stats&season=${i}${i + 1}`
//       );
//       const seasonStats = await res.json();

//       if (!!seasonStats.teams) {
//         const keysToRetrieve = ['year', 'wins', 'losses','ot', 'pts', 'goalsPerGame', 'goalsAgainstPerGame', 'place'];

//         let season = {
//           ...seasonStats?.teams[0]?.teamStats[0]?.splits[0]?.stat,
//           ...{year: i},
//           ...{
//             wins: parseInt(
//               seasonStats.teams[0].teamStats[0].splits[0].stat.wins,
//               10
//             ),
//           },
//           ...{place: seasonStats.teams[0].teamStats[0].splits[1].stat.wins},
//           ...{name: seasonStats.teams[0].name},
//         }

//         const result = keysToRetrieve.reduce((obj, key) => {
//           obj[key] = season[key];
//           return obj;
//         }, {});

//         seasons.push(result);
//       }
//     }
//     let season_reqs = await Promise.allSettled(seasons);
//     let season_stats = season_reqs.map((season) => {
//       if (season.status === "fulfilled") {
//         return season.value;
//       }
//     });

//     let team_name = seasons[0]?.name || "Team";
//     return {
//       props: {
//         yearly_data: season_stats,
//         team_name,
//         team_data,
//         rosters,
//         seasons: years,
//       },
//       revalidate: 86400,
//     };
//   };

//   return fetchSeasons();
// }
