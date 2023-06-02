import Link from "next/link";
import Head from "next/head";
import {useRouter} from "next/router";
import {useState, useMemo} from "react";
import {useQuery, useQueries} from "react-query";
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
  const [seasonId, setSeasonId] = useState("20222023");
  const router = useRouter();
  const {id} = router.query;

  const team_table_data = useMemo(() => yearly_data, []);

  const roster_table_data = useMemo(
    () => rosters?.[seasonId] || [],
    [rosters, seasonId]
  );

  const team_table_columns = useMemo(
    () => [
      {
        Header: "Year",
        accessor: "year",
      },
      {
        Header: "Wins",
        accessor: "wins",
      },
      {
        Header: "Losses",
        accessor: "losses",
      },
      {
        Header: "OTL",
        accessor: "ot",
      },
      {
        Header: "Points",
        accessor: "pts",
      },
      {
        Header: "GPG",
        accessor: "goalsPerGame",
      },
      {
        Header: "GAPG",
        accessor: "goalsAgainstPerGame",
      },
      {
        Header: "Place",
        accessor: "place",
      },
    ],
    []
  );

  const roster_table_columns = useMemo(
    () => [
      {
        Header: "Team",
        accessor: (d) => d["team.name"],
      },
      {
        Header: "Year",
        accessor: "season",
      },
      {
        Header: "Name",
        accessor: "fullName",
      },
      {
        Header: "Pos.",
        accessor: (d) => d["primaryPosition.code"],
      },
      {
        Header: "GP",
        accessor: (d) => d["stat.games"],
      },
      {
        Header: "G",
        accessor: (d) => d["stat.goals"],
      },
      {
        Header: "A",
        accessor: (d) => d["stat.assists"],
      },
      {
        Header: "P",
        accessor: (d) => d["stat.points"],
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
      <div className="p-2 gap-1 flex flex-col lg:flex-row">
        {roster_table_data && rosters && (
          <div className="border-2 p-1 flex flex-col max-w-lg">
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
            <ReactTable
              data={roster_table_data}
              columns={roster_table_columns}
              sortKey="fullName"
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
              {yearly_data && (
                <ReactTable
                  columns={team_table_columns}
                  data={team_table_data}
                  className="inline-block"
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function test(value) {}

export async function getStaticPaths() {
  const path = "https://statsapi.web.nhl.com/api/v1/teams/";
  const teams = await fetch(path);
  const teamData = await teams.json();
  let paths = teamData.teams.map((team) => ({
    params: {id: team.id.toString()},
  }));
  return {
    paths,
    fallback: false,
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
    let rosters = roster_data.reduce((r, curr) => {
      (r[curr.season] = r[curr.season] || []).push(curr);
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
        seasons.push({
          ...seasonStats.teams[0].teamStats[0].splits[0].stat,
          ...{year: i},
          ...{
            wins: parseInt(
              seasonStats.teams[0].teamStats[0].splits[0].stat.wins,
              10
            ),
          },
          ...{place: seasonStats.teams[0].teamStats[0].splits[1].stat.wins},
          ...{name: seasonStats.teams[0].name},
        });
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
