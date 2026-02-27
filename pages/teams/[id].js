/* eslint-disable react-hooks/rules-of-hooks */
import Link from "next/link";
import {useRouter} from "next/router";
import {useState, useMemo, useEffect, useCallback} from "react";
import {MdOutlineChevronLeft, MdOutlineChevronRight} from "react-icons/md";

import ReactTable from "../../components/Table";
import { ClickableImage } from "../../components/ImageModal";
import ThreadMessageBoard from "../../components/ThreadMessageBoard";
import SEO, { generateTeamJsonLd } from "../../components/SEO";
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
  seasons = [],
  seasonIds = [],
  abbreviation,
  fullName,
  teamRecords,
  teamId,
}) {
  const router = useRouter();
  const {id, season: querySeason} = router.query;

  const [seasonId, setSeasonId] = useState(querySeason || "20252026");
  const [currentIndex, setCurrentIndex] = useState(seasonIds.indexOf(seasonId));
  const [seasonData, setSeasonData] = useState(seasons[seasonId]);

  const initialShowPlayoffStats =
    seasonData && seasonData.madePlayoffs ? true : false;
  const [showPlayoffStats, setShowPlayoffStats] = useState(
    initialShowPlayoffStats
  );

  const togglePlayoffStats = () => {
    setShowPlayoffStats((prev) => !prev);
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
    console.log("URL change detected:", querySeason);

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
    console.log("useEffect router");

    if (router.query.season !== seasonId) {
      router.push(
        {
          pathname: router.pathname, // Current path
          query: {...router.query, season: seasonId}, // Updated query parameter
        },
        undefined,
        {shallow: false}
      );
    }
  }, [seasonId]);

  const handleDecrementSeason = () => {
    console.log("Next season");
    if (currentIndex < seasonIds.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setSeasonId(seasonIds[newIndex]);
    }
  };

  const handleIncrementSeason = () => {
    console.log("Previous season");
    console.log(currentIndex);
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setSeasonId(seasonIds[newIndex]);
    }
  };

  const sumFromRows = useCallback(
    (rows, field) =>
      (rows || []).reduce(
        (total, row) => total + (Number(row?.original?.[field]) || 0),
        0
      ),
    []
  );

  const weightedAverageFromRows = useCallback(
    (rows, valueField, weightField = "gamesPlayed") => {
      const safeRows = rows || [];
      const totalWeight = sumFromRows(safeRows, weightField);
      if (!totalWeight) return null;

      const weightedTotal = safeRows.reduce((total, row) => {
        const weight = Number(row?.original?.[weightField]) || 0;
        const value = Number(row?.original?.[valueField]) || 0;
        return total + weight * value;
      }, 0);

      return weightedTotal / totalWeight;
    },
    [sumFromRows]
  );

  const roster_goalie_table_columns = useMemo(() => {
    const baseColumns = [
      {
        header: "Name",
        accessorFn: (d) =>
          d["firstName"]["default"] + " " + d["lastName"]["default"],
        cell: (props) =>
          props.row.original?.playerId ? (
            <Link
              href={`/players/${props.row.original.playerId}`}
              passHref
              className="hover:text-blue-700 visited:text-purple-700 dark:visited:text-purple-300"
            >
              {props.row.original.fullName}
            </Link>
          ) : (
            props.row.original.fullName
          ),
      },
      {
        header: "Regular Season",
        columns: [
          {
            header: "GP",
            accessorFn: (d) => d["gamesPlayed"],
            cell: (props) => <p className="text-right">{props.getValue()}</p>,
            // footer: ({ table }) => table.getFilteredRowModel().rows?.reduce((total, row) => total + row.getValue('GP'), 0),
          },
          {
            header: "G",
            accessorFn: (d) => d["goals"],
            footer: ({table}) => {
              const total = sumFromRows(table.getFilteredRowModel().rows, "goals");
              return <div className="text-right pr-1">{total}</div>;
            },
            cell: (props) => <p className="text-right">{props.getValue()}</p>,
          },
          {
            header: "A",
            accessorFn: (d) => d["assists"],
            footer: ({table}) => {
              const total = sumFromRows(table.getFilteredRowModel().rows, "assists");
              return <div className="text-right pr-1">{total}</div>;
            },
            cell: (props) => <p className="text-right">{props.getValue()}</p>,
          },
          {
            header: "W",
            accessorFn: (d) => d["wins"],
            footer: ({table}) => {
              const total = sumFromRows(table.getFilteredRowModel().rows, "wins");
              return <div className="text-right pr-1">{total}</div>;
            },
            cell: (props) => <p className="text-right">{props.getValue()}</p>,
          },
          {
            header: "L",
            accessorFn: (d) => d["losses"],
            footer: ({table}) => {
              const total = sumFromRows(table.getFilteredRowModel().rows, "losses");
              return <div className="text-right pr-1">{total}</div>;
            },
            cell: (props) => <p className="text-right">{props.getValue()}</p>,
          },
          {
            header: "GAA",
            accessorFn: (d) => d["goalsAgainstAverage"],
            cell: (props) => (
              <p className="text-right">
                {props.getValue()?.toFixed(2) || null}
              </p>
            ),
            footer: ({table}) => {
              const total = weightedAverageFromRows(
                table.getFilteredRowModel().rows,
                "goalsAgainstAverage"
              );
              return (
                <div className="text-right pr-1">
                  {total != null ? total.toFixed(2) : "-"}
                </div>
              );
            },
          },
          {
            header: "SV%",
            accessorFn: (d) => d["savePercentage"],
            cell: (props) => (
              <p className="text-right">
                {props.getValue()?.toFixed(3) || null}
              </p>
            ),
            footer: ({table}) => {
              const total = weightedAverageFromRows(
                table.getFilteredRowModel().rows,
                "savePercentage"
              );
              return (
                <div className="text-right pr-1">
                  {total != null ? total.toFixed(3) : "-"}
                </div>
              );
            },
          },
          {
            header: "PIM",
            accessorFn: (d) => d["penaltyMinutes"],
            footer: ({table}) => {
              const total = sumFromRows(
                table.getFilteredRowModel().rows,
                "penaltyMinutes"
              );
              return <div className="text-right pr-1">{total}</div>;
            },
            cell: (props) => <p className="text-right">{props.getValue()}</p>,
          },
        ],
      },
    ];
    const playoffColumns = [
      {
        header: "Playoffs",
        columns: [
          {
            header: "PO GP",
            accessorFn: (d) => d["playoffGamesPlayed"],
            cell: (props) => <p className="text-right">{props.getValue()}</p>,
          },
          {
            header: "PO P",
            accessorFn: (d) => d["playoffPoints"],
            cell: (props) => <p className="text-right">{props.getValue()}</p>,
          },
          {
            header: "PO W",
            accessorFn: (d) => d["playoffWins"],
            cell: (props) => <p className="text-right">{props.getValue()}</p>,
          },
          {
            header: "PO L",
            accessorFn: (d) => d["playoffLosses"],
            cell: (props) => <p className="text-right">{props.getValue()}</p>,
          },
        ],
      },
    ];
    return showPlayoffStats ? [...baseColumns, ...playoffColumns] : baseColumns;
  }, [showPlayoffStats, sumFromRows, weightedAverageFromRows]);

  const roster_player_table_columns = useMemo(() => {
    const baseColumns = [
      {
        header: "Name",
        accessorFn: (d) => d["fullName"],
        cell: (props) =>
          props.row.original?.playerId ? (
            <Link
              href={`/players/${props.row.original.playerId}`}
              passHref
              className="hover:text-blue-700 visited:text-purple-700 dark:visited:text-purple-300"
            >
              {props.row.original.fullName}
            </Link>
          ) : (
            props.row.original.fullName
          ),
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
            cell: (props) => <p className="text-right">{props.getValue()}</p>,
          },
          {
            header: "G",
            accessorFn: (d) => d["goals"],
            footer: ({table}) => {
              const total = sumFromRows(table.getFilteredRowModel().rows, "goals");
              return <div className="text-right pr-1">{total}</div>;
            },
            cell: (props) => <p className="text-right">{props.getValue()}</p>,
          },
          {
            header: "A",
            accessorFn: (d) => d["assists"],
            footer: ({table}) => {
              const total = sumFromRows(table.getFilteredRowModel().rows, "assists");
              return <div className="text-right pr-1">{total}</div>;
            },
            cell: (props) => <p className="text-right">{props.getValue()}</p>,
          },
          {
            header: "P",
            accessorFn: (d) => d["points"],
            footer: ({table}) => {
              const total = sumFromRows(table.getFilteredRowModel().rows, "points");
              return <div className="text-right pr-1">{total}</div>;
            },
            cell: (props) => <p className="text-right">{props.getValue()}</p>,
          },
          {
            header: "PIM",
            accessorFn: (d) => d["penaltyMinutes"],
            footer: ({table}) => {
              const total = sumFromRows(
                table.getFilteredRowModel().rows,
                "penaltyMinutes"
              );
              return <div className="text-right pr-1">{total}</div>;
            },
            cell: (props) => <p className="text-right">{props.getValue()}</p>,
          },
          {
            header: "+/-",
            accessorFn: (d) => d["plusMinus"],
            footer: ({table}) => {
              const total = sumFromRows(table.getFilteredRowModel().rows, "plusMinus");
              return <div className="text-right pr-1">{total}</div>;
            },
            cell: (props) => <p className="text-right">{props.getValue()}</p>,
          },
        ],
      },
    ];
    const playoffColumns = [
      {
        header: "Playoffs",
        columns: [
          {
            header: "GP",
            id: "PO GP",
            accessorFn: (d) => d["playoffGamesPlayed"],
            cell: (props) => <p className="text-right">{props.getValue()}</p>,
          },
          {
            header: "G",
            id: "PO G",
            accessorFn: (d) => d["playoffGoals"],
            cell: (props) => <p className="text-right">{props.getValue()}</p>,
          },
          {
            header: "A",
            id: "PO A",
            accessorFn: (d) => d["playoffAssists"],
            cell: (props) => <p className="text-right">{props.getValue()}</p>,
          },
          {
            header: "P",
            id: "PO P",
            accessorFn: (d) => d["playoffPoints"],
            cell: (props) => <p className="text-right">{props.getValue()}</p>,
          },
          {
            header: "PIM",
            id: "PO PIM",
            accessorFn: (d) => d["playoffPenaltyMinutes"],
            cell: (props) => <p className="text-right">{props.getValue()}</p>,
          },
        ],
      },
    ];
    return showPlayoffStats ? [...baseColumns, ...playoffColumns] : baseColumns;
  }, [showPlayoffStats, sumFromRows]);

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
        header: "OTL",
        accessorKey: "otLosses",
      },
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

  const teamName = fullName || abbreviation;
  const logoUrl = `https://assets.nhle.com/logos/nhl/svg/${abbreviation}_dark.svg`;
  const jsonLd = generateTeamJsonLd({
    name: teamName,
    logo: logoUrl,
  });

  return (
    <div>
      <SEO
        title={`${teamName} Roster & Stats`}
        description={`${teamName} current roster, player statistics, and team history. View skaters, goalies, and historical team records.`}
        path={`/teams/${id}`}
        ogImage={logoUrl}
        jsonLd={jsonLd}
      />
      <div className="p-1 flex items-center gap-3">
        <ClickableImage
          src={`https://assets.nhle.com/logos/nhl/svg/${abbreviation}_dark.svg`}
          alt={fullName}
          containerClassName="w-12 h-12 relative flex-shrink-0"
          className="object-contain"
        />
        <p className="text-2xl font-bold">{fullName}</p>
      </div>
      <div className="gap-1 p-1 flex flex-col lg:flex-row">
        {seasons && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 w-full p-1 flex flex-col max-w-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div>
                  <label className="px-1 dark:text-white font-medium" htmlFor="season">
                    Season:
                  </label>
                  <select
                    className="w-40 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={seasonId}
                    onChange={(event) => {
                      const newSeasonId = event.target.value;
                      const newIndex = seasonIds.indexOf(newSeasonId);
                      setSeasonId(newSeasonId);
                      setCurrentIndex(newIndex);
                    }}
                  >
                    {seasonIds &&
                      seasonIds?.map((szn) => {
                        return (
                          <option key={szn} value={szn}>
                            {szn}{" "}
                            {seasons && seasons[szn].madePlayoffs ? "(P)" : ""}
                          </option>
                        );
                      })}
                  </select>
                </div>
                <button
                  className="btn-blue m-1 btn-disabled"
                  onClick={handleDecrementSeason}
                  disabled={currentIndex >= seasonIds.length - 1}
                >
                  <MdOutlineChevronLeft size={28} />
                </button>
                <button
                  className="btn-blue m-1 btn-disabled"
                  onClick={handleIncrementSeason}
                  disabled={currentIndex <= 0}
                >
                  <MdOutlineChevronRight size={28} />
                </button>
              </div>

              {seasonData && seasonData.madePlayoffs && (
                <button
                  onClick={togglePlayoffStats}
                  className=" bg-red-500 text-white p-2 rounded"
                >
                  {showPlayoffStats ? "Hide PO Stats" : "Show PO Stats"}
                </button>
              )}
            </div>

            {seasonData && seasonData?.skaters && (
              <ReactTable
                data={seasonData.skaters}
                columns={roster_player_table_columns}
                sortKey="P"
              />
            )}
            {seasonData && seasonData?.goalies && (
              <ReactTable
                data={seasonData.goalies}
                columns={roster_goalie_table_columns}
                sortKey="P"
              />
            )}
          </div>
        )}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 p-1 flex flex-col">
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
      <div className="p-1 mt-2">
        <ThreadMessageBoard
          threadType="team"
          threadId={teamId || id}
          title={`${teamName} Message Board`}
          emptyMessage={`No posts yet for ${teamName}.`}
        />
      </div>
    </div>
  );
}

export async function getServerSideProps({params, req}) {
  const protocol = req.headers["x-forwarded-proto"] || "http";
  const host = req.headers.host;

  try {
    const response = await fetch(`${protocol}://${host}/api/teams/${params.id}`);

    if (!response.ok) {
      if (response.status === 404) {
        return { notFound: true };
      }
      return {
        props: {
          seasons: {},
          seasonIds: [],
          abbreviation: null,
          fullName: null,
          teamRecords: [],
          teamId: params.id,
        },
      };
    }

    const payload = await response.json();
    const teamInfo = payload?.team || null;
    const skaters = payload?.skaters || [];
    const goalies = payload?.goalies || [];
    const teamRecords = payload?.teamRecords || [];
    const playoffSeasons = payload?.playoffSeasons || [];

    const combinePlayersBySeason = (allSkaters, allGoalies) => {
      const seasonMap = {};

      allSkaters.forEach((skater) => {
        const season = skater.season;
        if (!seasonMap[season]) {
          seasonMap[season] = {skaters: [], goalies: []};
        }
        seasonMap[season].skaters.push(skater);
      });

      allGoalies.forEach((goalie) => {
        const season = goalie.season;
        if (!seasonMap[season]) {
          seasonMap[season] = {skaters: [], goalies: []};
        }
        seasonMap[season].goalies.push(goalie);
      });

      return seasonMap;
    };

    const seasonMap = combinePlayersBySeason(skaters, goalies);
    const seasons = Object.keys(seasonMap).sort((a, b) => b.localeCompare(a));

    seasons.forEach((season) => {
      seasonMap[season].madePlayoffs = playoffSeasons?.includes(season) || false;
    });

    return {
      props: {
        seasons: seasonMap,
        seasonIds: seasons,
        abbreviation: teamInfo?.abbreviation || null,
        fullName: teamInfo?.fullName || null,
        teamRecords,
        teamId: params.id,
      },
    };
  } catch (error) {
    console.log(error);
    return {
      props: {
        seasons: {},
        seasonIds: [],
        abbreviation: null,
        fullName: null,
        teamRecords: [],
        teamId: params.id,
      },
    };
  }
}
