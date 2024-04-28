/* eslint-disable react-hooks/rules-of-hooks */
import Link from "next/link";
import Head from "next/head";
import {useRouter} from "next/router";
import {useState, useMemo, useEffect} from "react";
import { MdOutlineChevronLeft, MdOutlineChevronRight } from "react-icons/md";

import ReactTable from "../../components/Table";
import {getTeams} from "../../lib/queries";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function TeamPage({
teamId
  // yearly_data,
  // team_name,
  // team_data,
  // rosters,
  // seasons,
}) {


  const router = useRouter();
  const {id, season} = router.query;
  const [seasonId, setSeasonId] = useState(season || "2022-23");
return (
  <div>Test {teamId}</div>
)

}

export async function getStaticPaths() {
  // const path = "https://statsapi.web.nhl.com/api/v1/teams/";
  const teams = await getTeams();

  let paths = teams.map((team) => ({
    params: {id: team.abbreviation},
  }));
  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({params}) {

  
  return {
    props: {
      teamId: params.id,
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
