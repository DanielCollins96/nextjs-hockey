import Link from "next/link";
import Head from "next/head";
import {useRouter} from "next/router";
import {useState, useMemo} from "react";
import { MdOutlineChevronLeft, MdOutlineChevronRight } from "react-icons/md";

import ReactTable from "../../components/Table";
import {getRoster} from "../../lib/queries";
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
  yearly_data,
  team_name,
  team_data,
  rosters,
  seasons,
}) {
  const router = useRouter();
  const {id, season} = router.query;

  console.log({season});

  const [seasonId, setSeasonId] = useState(season || "2022-23");

  const handleIncrementSeason = () => {
    const currentIndex = seasons.indexOf(seasonId);
    if (currentIndex < seasons.length - 1) {
      setSeasonId(seasons[currentIndex + 1]);
    }
  };
  const handleDecrementSeason = () => {
    const currentIndex = seasons.indexOf(seasonId);
    if (currentIndex > 0) {
      setSeasonId(seasons[currentIndex - 1]);
    }
  };

  const team_table_data = useMemo(() => yearly_data, [yearly_data]);

  const roster_table_data = useMemo(
    () => rosters?.[seasonId] || [],
    [rosters, seasonId]
  );

  const team_table_columns = useMemo(
    () => [
      {
        header: "Year",
        accessorKey: "year",
      },
        {
          header: "W",
          accessorKey: "wins",
        },
        {
          header: "L",
          accessorKey: "losses",
        },
        {
          header: "OTL",
          accessorKey: "ot",
        },
        {
          header: "Pts",
          accessorKey: "pts",
        },
        {
          header: "GFPG",
          accessorKey: "goalsPerGame",
        },
        {
          header: "GAPG",
          accessorKey: "goalsAgainstPerGame",
        },
        {
          header: "Place",
          accessorKey: "place",
        },
    ],
    []
  );

  const roster_table_columns = useMemo(
    () => [
      {
        header: "Name",
        accessorKey: "fullName",
        cell: props => props.row.original?.id ? (<Link href={`/players/${props.row.original.id}`} passHref ><a className=" hover:text-blue-700 visited:text-purple-800">{props.row.original.fullName}</a></Link>) : (props.row.original.fullName)

      },
      {
        header: "Pos.",
        accessorFn: (d) => d["primaryPosition.code"],
      },
      {
        header: "GP",
        accessorFn: (d) => d["stat.games"],
        cell: props => <p className="text-right">{props.getValue()}</p>,
        // footer: ({ table }) => table.getFilteredRowModel().rows?.reduce((total, row) => total + row.getValue('GP'), 0),
      },
      {
        header: "G",
        accessorFn: (d) => d["stat.goals"],
        footer: ({ table }) => table.getFilteredRowModel().rows?.reduce((total, row) => total + row.getValue('G'), 0),
        cell: props => <p className="text-right">{props.getValue()}</p>
      },
      {
        header: "A",
        accessorFn: (d) => d["stat.assists"],
        footer: ({ table }) => table.getFilteredRowModel().rows?.reduce((total, row) => total + row.getValue('A'), 0),
        cell: props => <p className="text-right">{props.getValue()}</p>
      },
      {
        header: "P",
        accessorFn: (d) => d["stat.points"],
        footer: ({ table }) => table.getFilteredRowModel().rows?.reduce((total, row) => total + row.getValue('P'), 0),
        cell: props => <p className="text-right">{props.getValue()}</p>
      },
      {
        header: "PIM",
        accessorFn: (d) => d["stat.pim"],
        footer: ({ table }) => table.getFilteredRowModel().rows?.reduce((total, row) => total + row.getValue('PIM'), 0),
        cell: props => <p className="text-right">{props.getValue()}</p>
      },
      {
        header: "+/-",
        accessorFn: (d) => d["stat.plusMinus"],
        footer: ({ table }) => table.getFilteredRowModel().rows?.reduce((total, row) => total + row.getValue('+/-'), 0),
        cell: props => <p className="text-right">{props.getValue()}</p>
      },
    ],
    []
  );

  return (
    <div className="">
      <Head>
        <title>{team_name} Roster | the-nhl.com</title>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2056923001767627"
          crossOrigin="anonymous"
        ></script>
      </Head>
      <div className="text-center border border-black rounded p-2">
        <p className="text-lg">{team_data[0].name}</p>
        <p>{team_data[0].firstYearOfPlay}</p>
        <Link href={`${team_data[0].officialSiteUrl}`}>
          <a className="hover:text-blue-700">{team_data[0].officialSiteUrl}</a>
        </Link>
      </div>
      <div className="gap-1 p-1 flex flex-col lg:flex-row">
        {roster_table_data && rosters && (
          <div className="border-2  w-screen p-1 flex flex-col max-w-2xl">
          <div className="flex">
          <label className="px-1 text-lg" htmlFor="season">Season:</label>
            <select
              className="flex w-32 justify-end"
              value={seasonId}
              onChange={(event) => setSeasonId(event.target.value)}
            >
              {seasons &&
                seasons?.map((szn) => {
                  return (
                    <option key={szn} value={szn}>
                      {JSON.stringify(szn)}
                    </option>
                  );
                })}
            </select>
            <button onClick={handleIncrementSeason}><MdOutlineChevronLeft size={30} /></button>
            <button onClick={handleDecrementSeason}><MdOutlineChevronRight size={30}/></button>

          </div>
            <ReactTable
              data={roster_table_data}
              columns={roster_table_columns}
              sortKey="P"
            />
          </div>
        )}
        {!yearly_data ? (
          <p className="grid place-self-top">Loading...</p>
        ) : (
          <div className="border-2 p-1 flex flex-col items-center">
            <div className="p-2 flex flex-col">
              {/* <input type="" /> */}
              <ResponsiveContainer width={450} height={300}>
                <LineChart data={yearly_data}>
                  <YAxis />
                  <XAxis dataKey="year" />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    name="Points"
                    dataKey="pts"
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
                    name="OT Wins"
                    dataKey="ot"
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
            <div className="p-2 max-w-48">
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
        )}
      </div>
    </div>
  );
}

export async function getStaticPaths() {
  const path = "https://statsapi.web.nhl.com/api/v1/teams/";
  const teams = await fetch(path);
  const teamData = await teams.json();
  let paths = teamData.teams.map((team) => ({
    params: {id: team.id.toString()},
  }));
  return {
    paths,
    fallback: true,
  };
}

export async function getStaticProps({params}) {
  const fetchSeasons = async () => {
    const team = await fetch(
      `https://statsapi.web.nhl.com/api/v1/teams/${params.id}`
    );
    const data = await team.json();
    const team_data = data.teams;

    const roster_data = await getRoster(params.id);
    let rosters = roster_data
    // .map(r => r.season = r.season.slice(0,4) +'-'+ r.season.slice(6) )
    .reduce((r, curr) => {
      (r[curr.season.slice(0,4)+'-'+curr.season.slice(6)] = r[curr.season.slice(0,4)+'-'+curr.season.slice(6)] || []).push(curr);
      // (r[curr.season] = r[curr.season] || []).push(curr);
      return r;
    }, {});

    let years = "20222023";
    if (rosters) {
      years = Object.keys(rosters);
    }

    let seasons = [];
    for (let i = 2013; i <= 2022; i++) {
      const res = await fetch(
        `https://statsapi.web.nhl.com/api/v1/teams/${
          params.id
        }?expand=team.stats&season=${i}${i + 1}`
      );
      const seasonStats = await res.json();

      if (!!seasonStats.teams) {
        const keysToRetrieve = ['year', 'wins', 'losses','ot', 'pts', 'goalsPerGame', 'goalsAgainstPerGame', 'place'];

        let season = {
          ...seasonStats?.teams[0]?.teamStats[0]?.splits[0]?.stat,
          ...{year: i},
          ...{
            wins: parseInt(
              seasonStats.teams[0].teamStats[0].splits[0].stat.wins,
              10
            ),
          },
          ...{place: seasonStats.teams[0].teamStats[0].splits[1].stat.wins},
          ...{name: seasonStats.teams[0].name},
        }

        const result = keysToRetrieve.reduce((obj, key) => {
          obj[key] = season[key];
          return obj;
        }, {});

        seasons.push(result);
      }
    }
    let season_reqs = await Promise.allSettled(seasons);
    let season_stats = season_reqs.map((season) => {
      if (season.status === "fulfilled") {
        return season.value;
      }
    });
    let team_name = seasons[0]?.name || "Team";
    return {
      props: {
        yearly_data: season_stats,
        team_name,
        team_data,
        rosters,
        seasons: years,
      },
      revalidate: 86400,
    };
  };

  return fetchSeasons();
}
