/* eslint-disable react-hooks/rules-of-hooks */
import Link from "next/link";
import {useRouter} from "next/router";
import {useState, useMemo, useEffect, useCallback} from "react";
import {MdOutlineChevronLeft, MdOutlineChevronRight} from "react-icons/md";

import ReactTable from "../../components/Table";
import PaginatedTable from "../../components/PaginatedTable";
import { ClickableImage } from "../../components/ImageModal";
import ThreadMessageBoard from "../../components/ThreadMessageBoard";
import SEO, { generateTeamJsonLd } from "../../components/SEO";
import { extractEntityId, playerUrl, teamUrl } from "../../lib/routes";
import {
  CartesianGrid,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const numericColumnMeta = {
  headerClassName: "text-right",
  cellClassName: "text-right",
};

export default function TeamPage({
  seasons = [],
  seasonIds = [],
  abbreviation,
  fullName,
  teamRecords,
  teamId,
  canonicalPath,
}) {
  const router = useRouter();
  const {season: querySeason} = router.query;
  const defaultSeasonId = seasonIds[0] || "";
  const getValidSeasonId = useCallback(
    (season) => {
      const seasonValue = Array.isArray(season) ? season[0] : season;
      return seasonIds.includes(seasonValue) ? seasonValue : defaultSeasonId;
    },
    [defaultSeasonId, seasonIds]
  );

  const [seasonId, setSeasonId] = useState(() => getValidSeasonId(querySeason));
  const [currentIndex, setCurrentIndex] = useState(seasonIds.indexOf(seasonId));
  const [seasonData, setSeasonData] = useState(seasons[seasonId]);

  useEffect(() => {
    if (seasonId && seasons[seasonId]) {
      setSeasonData(seasons[seasonId]);
      setCurrentIndex(seasonIds.indexOf(seasonId));
    } else {
      setSeasonData(null);
      setCurrentIndex(-1);
    }
  }, [seasons, seasonId, seasonIds]);

  useEffect(() => {
    if (!router.isReady) return;

    const nextSeasonId = getValidSeasonId(querySeason);
    if (nextSeasonId) {
      setSeasonId((currentSeasonId) =>
        currentSeasonId === nextSeasonId ? currentSeasonId : nextSeasonId
      );
    }
  }, [getValidSeasonId, querySeason, router.isReady]);

  const selectSeason = useCallback(
    (nextSeasonId) => {
      if (!nextSeasonId) return;

      setSeasonId(nextSeasonId);
      setCurrentIndex(seasonIds.indexOf(nextSeasonId));

      if (!router.isReady) return;

      const querySeasonValue = Array.isArray(router.query.season)
        ? router.query.season[0]
        : router.query.season;

      if (querySeasonValue === nextSeasonId) return;

      router.replace(
        {
          pathname: router.pathname,
          query: {...router.query, season: nextSeasonId},
        },
        undefined,
        {shallow: true}
      );
    },
    [router, seasonIds]
  );

  const handleDecrementSeason = () => {
    console.log("Next season");
    if (currentIndex < seasonIds.length - 1) {
      const newIndex = currentIndex + 1;
      selectSeason(seasonIds[newIndex]);
    }
  };

  const handleIncrementSeason = () => {
    console.log("Previous season");
    console.log(currentIndex);
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      selectSeason(seasonIds[newIndex]);
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

  const hasPlayoffStats = Boolean(seasonData?.madePlayoffs);
  const formatPlayoffValue = useCallback(
    (value) => {
      if (!hasPlayoffStats) return "--";
      return value === null || value === undefined || value === ""
        ? "--"
        : value;
    },
    [hasPlayoffStats]
  );

  const calculateSeasonAge = useCallback((player) => {
    if (player?.age !== null && player?.age !== undefined) {
      return player.age;
    }

    const birthDateValue = player?.birthdate;
    if (!birthDateValue) return "-";

    const birthDate = new Date(birthDateValue);
    if (Number.isNaN(birthDate.getTime())) return "-";

    const season = String(player?.season || "");
    const seasonStartYear = /^\d{8}$/.test(season)
      ? Number(season.slice(0, 4))
      : new Date().getFullYear();
    const seasonDate = new Date(seasonStartYear, 9, 1);

    let age = seasonDate.getFullYear() - birthDate.getFullYear();
    const hasHadBirthday =
      seasonDate.getMonth() > birthDate.getMonth() ||
      (seasonDate.getMonth() === birthDate.getMonth() &&
        seasonDate.getDate() >= birthDate.getDate());

    if (!hasHadBirthday) age -= 1;

    return age;
  }, []);

  const roster_goalie_table_columns = useMemo(() => {
    const baseColumns = [
      {
        header: "Name",
        accessorFn: (d) => d["fullName"],
        size: 150,
        cell: (props) =>
          props.row.original?.playerId ? (
            <Link
              href={playerUrl(props.row.original.fullName, props.row.original.playerId)}
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
            size: 38,
            meta: numericColumnMeta,
            cell: (props) => <p className="text-right">{props.getValue()}</p>,
            // footer: ({ table }) => table.getFilteredRowModel().rows?.reduce((total, row) => total + row.getValue('GP'), 0),
          },
          {
            header: "G",
            accessorFn: (d) => d["goals"],
            size: 34,
            meta: numericColumnMeta,
            footer: ({table}) => {
              const total = sumFromRows(table.getFilteredRowModel().rows, "goals");
              return <div className="text-right pr-1">{total}</div>;
            },
            cell: (props) => <p className="text-right">{props.getValue()}</p>,
          },
          {
            header: "A",
            accessorFn: (d) => d["assists"],
            size: 34,
            meta: numericColumnMeta,
            footer: ({table}) => {
              const total = sumFromRows(table.getFilteredRowModel().rows, "assists");
              return <div className="text-right pr-1">{total}</div>;
            },
            cell: (props) => <p className="text-right">{props.getValue()}</p>,
          },
          {
            header: "W",
            accessorFn: (d) => d["wins"],
            size: 34,
            meta: numericColumnMeta,
            footer: ({table}) => {
              const total = sumFromRows(table.getFilteredRowModel().rows, "wins");
              return <div className="text-right pr-1">{total}</div>;
            },
            cell: (props) => <p className="text-right">{props.getValue()}</p>,
          },
          {
            header: "L",
            accessorFn: (d) => d["losses"],
            size: 34,
            meta: numericColumnMeta,
            footer: ({table}) => {
              const total = sumFromRows(table.getFilteredRowModel().rows, "losses");
              return <div className="text-right pr-1">{total}</div>;
            },
            cell: (props) => <p className="text-right">{props.getValue()}</p>,
          },
          {
            header: "GAA",
            accessorFn: (d) => d["goalsAgainstAverage"],
            size: 48,
            meta: numericColumnMeta,
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
            size: 48,
            meta: numericColumnMeta,
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
            size: 42,
            meta: numericColumnMeta,
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
            size: 44,
            meta: numericColumnMeta,
            cell: (props) => (
              <p className="text-right">
                {formatPlayoffValue(props.getValue())}
              </p>
            ),
          },
          {
            header: "PO P",
            accessorFn: (d) => d["playoffPoints"],
            size: 42,
            meta: numericColumnMeta,
            cell: (props) => (
              <p className="text-right">
                {formatPlayoffValue(props.getValue())}
              </p>
            ),
          },
          {
            header: "PO W",
            accessorFn: (d) => d["playoffWins"],
            size: 42,
            meta: numericColumnMeta,
            cell: (props) => (
              <p className="text-right">
                {formatPlayoffValue(props.getValue())}
              </p>
            ),
          },
          {
            header: "PO L",
            accessorFn: (d) => d["playoffLosses"],
            size: 42,
            meta: numericColumnMeta,
            cell: (props) => (
              <p className="text-right">
                {formatPlayoffValue(props.getValue())}
              </p>
            ),
          },
        ],
      },
    ];
    const vitalsColumns = [
      {
        header: "Vitals",
        columns: [
          {
            header: "Nat.",
            accessorFn: (d) => d?.birthCountry || "-",
            size: 42,
          },
          {
            header: "Age",
            accessorFn: (d) => calculateSeasonAge(d),
            size: 38,
            meta: numericColumnMeta,
            cell: (props) => <p className="text-right">{props.getValue()}</p>,
          },
        ],
      },
    ];
    return [...baseColumns, ...playoffColumns, ...vitalsColumns];
  }, [
    calculateSeasonAge,
    formatPlayoffValue,
    sumFromRows,
    weightedAverageFromRows,
  ]);

  const roster_player_table_columns = useMemo(() => {
    const baseColumns = [
      {
        header: "Name",
        accessorFn: (d) => d["fullName"],
        size: 150,
        cell: (props) =>
          props.row.original?.playerId ? (
            <Link
              href={playerUrl(props.row.original.fullName, props.row.original.playerId)}
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
            size: 42,
          },
          {
            header: "GP",
            accessorFn: (d) => d["gamesPlayed"],
            size: 38,
            meta: numericColumnMeta,
            cell: (props) => <p className="text-right">{props.getValue()}</p>,
          },
          {
            header: "G",
            accessorFn: (d) => d["goals"],
            size: 34,
            meta: numericColumnMeta,
            footer: ({table}) => {
              const total = sumFromRows(table.getFilteredRowModel().rows, "goals");
              return <div className="text-right pr-1">{total}</div>;
            },
            cell: (props) => <p className="text-right">{props.getValue()}</p>,
          },
          {
            header: "A",
            accessorFn: (d) => d["assists"],
            size: 34,
            meta: numericColumnMeta,
            footer: ({table}) => {
              const total = sumFromRows(table.getFilteredRowModel().rows, "assists");
              return <div className="text-right pr-1">{total}</div>;
            },
            cell: (props) => <p className="text-right">{props.getValue()}</p>,
          },
          {
            header: "P",
            accessorFn: (d) => d["points"],
            size: 36,
            meta: numericColumnMeta,
            footer: ({table}) => {
              const total = sumFromRows(table.getFilteredRowModel().rows, "points");
              return <div className="text-right pr-1">{total}</div>;
            },
            cell: (props) => <p className="text-right">{props.getValue()}</p>,
          },
          {
            header: "PIM",
            accessorFn: (d) => d["penaltyMinutes"],
            size: 42,
            meta: numericColumnMeta,
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
            size: 38,
            meta: numericColumnMeta,
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
            size: 38,
            meta: numericColumnMeta,
            cell: (props) => (
              <p className="text-right">
                {formatPlayoffValue(props.getValue())}
              </p>
            ),
          },
          {
            header: "G",
            id: "PO G",
            accessorFn: (d) => d["playoffGoals"],
            size: 34,
            meta: numericColumnMeta,
            cell: (props) => (
              <p className="text-right">
                {formatPlayoffValue(props.getValue())}
              </p>
            ),
          },
          {
            header: "A",
            id: "PO A",
            accessorFn: (d) => d["playoffAssists"],
            size: 34,
            meta: numericColumnMeta,
            cell: (props) => (
              <p className="text-right">
                {formatPlayoffValue(props.getValue())}
              </p>
            ),
          },
          {
            header: "P",
            id: "PO P",
            accessorFn: (d) => d["playoffPoints"],
            size: 34,
            meta: numericColumnMeta,
            cell: (props) => (
              <p className="text-right">
                {formatPlayoffValue(props.getValue())}
              </p>
            ),
          },
          {
            header: "PIM",
            id: "PO PIM",
            accessorFn: (d) => d["playoffPenaltyMinutes"],
            size: 42,
            meta: numericColumnMeta,
            cell: (props) => (
              <p className="text-right">
                {formatPlayoffValue(props.getValue())}
              </p>
            ),
          },
        ],
      },
    ];
    const vitalsColumns = [
      {
        header: "Vitals",
        columns: [
          {
            header: "Nat.",
            accessorFn: (d) => d?.birthCountry || "-",
            size: 42,
          },
          {
            header: "Age",
            accessorFn: (d) => calculateSeasonAge(d),
            size: 38,
            meta: numericColumnMeta,
            cell: (props) => <p className="text-right">{props.getValue()}</p>,
          },
        ],
      },
    ];
    return [...baseColumns, ...playoffColumns, ...vitalsColumns];
  }, [calculateSeasonAge, formatPlayoffValue, sumFromRows]);

  const team_table_data = useMemo(() => teamRecords || [], [teamRecords]);
  const [visibleTeamTableRows, setVisibleTeamTableRows] = useState([]);
  const handleTeamTablePageRowsChange = useCallback((rows) => {
    setVisibleTeamTableRows(rows);
  }, []);

  useEffect(() => {
    setVisibleTeamTableRows([]);
  }, [team_table_data]);

  const team_chart_data = useMemo(
    () =>
      (visibleTeamTableRows.length
        ? visibleTeamTableRows
        : team_table_data.slice(0, 8)
      )
        .slice()
        .reverse()
        .map((row) => ({
          ...row,
          pointPctPercent:
            row?.pointPct == null ? null : Number(row.pointPct) * 100,
        })),
    [team_table_data, visibleTeamTableRows]
  );
  const normalizeTeamSeasonId = useCallback(
    (season) => (season === null || season === undefined ? "" : String(season)),
    []
  );
  const selectedTeamRecord = useMemo(
    () =>
      (teamRecords || []).find(
        (record) => normalizeTeamSeasonId(record?.seasonId) === seasonId
      ),
    [normalizeTeamSeasonId, teamRecords, seasonId]
  );
  const formatStat = (value, digits = 0) => {
    const number = Number(value);
    if (!Number.isFinite(number)) return "-";
    return number.toFixed(digits);
  };
  const formatPointPct = (value) => {
    const number = Number(value);
    if (!Number.isFinite(number)) return "-";
    return `${(number * 100).toFixed(1)}%`;
  };
  const formatSeasonStartYear = (season) => {
    const seasonValue = String(season || "");
    return /^\d{8}$/.test(seasonValue) ? seasonValue.slice(0, 4) : seasonValue;
  };
  const teamPageId = teamId;
  const teamName = fullName || abbreviation;

  const team_table_columns = useMemo(
    () => [
      {
        header: "Year",
        accessorKey: "seasonId",
        size: 78,
        cell: (props) => {
          const season = props.getValue();
          if (!teamPageId || !season) return season;

          return (
            <Link
              href={`${teamUrl(teamName, teamPageId)}?season=${encodeURIComponent(season)}`}
              className="font-medium text-slate-800 hover:text-blue-700 dark:text-slate-100 dark:hover:text-blue-300"
            >
              {season}
            </Link>
          );
        },
      },
      {
        header: "W",
        accessorKey: "wins",
        size: 36,
        meta: { headerClassName: "text-right", cellClassName: "text-right" },
      },
      {
        header: "L",
        accessorKey: "losses",
        size: 36,
        meta: { headerClassName: "text-right", cellClassName: "text-right" },
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
        size: 42,
        meta: { headerClassName: "text-right", cellClassName: "text-right" },
      },
      {
        header: "Pts",
        accessorKey: "points",
        size: 44,
        meta: { headerClassName: "text-right", cellClassName: "text-right" },
      },
      {
        header: "P%",
        accessorKey: "pointPct",
        size: 52,
        cell: (props) => (
          <p className="text-right">
            {props.getValue() != null
              ? `${(Number(props.getValue()) * 100).toFixed(1)}`
              : "-"}
          </p>
        ),
        meta: { headerClassName: "text-right" },
      },
      {
        header: "GFPG",
        accessorKey: "goalsForPerGame",
        size: 56,
        cell: (props) => (
          <p className="text-right">
            {props.getValue() != null ? Number(props.getValue()).toFixed(2) : "-"}
          </p>
        ),
        meta: { headerClassName: "text-right" },
      },
      {
        header: "GAPG",
        accessorKey: "goalsAgainstPerGame",
        size: 56,
        cell: (props) => (
          <p className="text-right">
            {props.getValue() != null ? Number(props.getValue()).toFixed(2) : "-"}
          </p>
        ),
        meta: { headerClassName: "text-right" },
      },
      // {
      //   header: "Place",
      //   accessorKey: "place",
      // },
    ],
    [teamName, teamPageId]
  );

  const logoUrl = `https://assets.nhle.com/logos/nhl/svg/${abbreviation}_dark.svg`;
  const jsonLd = generateTeamJsonLd({
    name: teamName,
    logo: logoUrl,
  });

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <SEO
        title={`${teamName} Roster & Stats`}
        description={`${teamName} current roster, player statistics, and team history. View skaters, goalies, and historical team records.`}
        path={canonicalPath}
        ogImage={logoUrl}
        jsonLd={jsonLd}
      />
      <div className="p-0.5 flex items-center gap-2">
        <ClickableImage
          src={`https://assets.nhle.com/logos/nhl/svg/${abbreviation}_dark.svg`}
          alt={fullName}
          containerClassName="w-12 h-12 relative flex-shrink-0"
          className="object-contain"
        />
        <div className="min-w-0 flex flex-col sm:flex-row sm:items-baseline sm:gap-3">
          <p className="text-2xl font-bold">{fullName}</p>
          {selectedTeamRecord && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium text-gray-800 dark:text-gray-100">
                {normalizeTeamSeasonId(selectedTeamRecord.seasonId)}
              </span>
              <span>
                {formatStat(selectedTeamRecord.wins)}-
                {formatStat(selectedTeamRecord.losses)}-
                {formatStat(selectedTeamRecord.otLosses)}
              </span>
              <span>{formatStat(selectedTeamRecord.points)} Pts</span>
              <span>P% {formatPointPct(selectedTeamRecord.pointPct)}</span>
              <span>
                GF/G {formatStat(selectedTeamRecord.goalsForPerGame, 2)}
              </span>
              <span>
                GA/G {formatStat(selectedTeamRecord.goalsAgainstPerGame, 2)}
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="team-content-grid">
        {seasons && (
          <div className="roster-card min-w-0 overflow-hidden border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 p-0.5 flex flex-col items-start">
            <div className="flex items-center justify-between pb-0.5">
              <div className="flex items-center gap-1">
                <div>
                  <label className="pr-1 dark:text-white font-medium" htmlFor="season">
                    Season:
                  </label>
                  <select
                    className="w-36 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={seasonId}
                    onChange={(event) => {
                      selectSeason(event.target.value);
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
                  className="btn-blue m-0 btn-disabled"
                  onClick={handleDecrementSeason}
                  disabled={currentIndex >= seasonIds.length - 1}
                >
                  <MdOutlineChevronLeft size={28} />
                </button>
                <button
                  className="btn-blue m-0 btn-disabled"
                  onClick={handleIncrementSeason}
                  disabled={currentIndex <= 0}
                >
                  <MdOutlineChevronRight size={28} />
                </button>
              </div>
            </div>

            {seasonData && seasonData?.skaters && (
              <ReactTable
                data={seasonData.skaters}
                columns={roster_player_table_columns}
                sortKey="P"
                modern
                compact
              />
            )}
            {seasonData && seasonData?.goalies && (
              <ReactTable
                data={seasonData.goalies}
                columns={roster_goalie_table_columns}
                sortKey="P"
                modern
                compact
              />
            )}
          </div>
        )}
        <div className="history-card min-w-0 overflow-hidden border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 p-1">
          <div className="grid min-w-0 grid-cols-1 gap-2 2xl:grid-cols-[minmax(0,1fr)_auto]">
            <div className="h-64 min-w-0 xl:h-72">
              {/* <input type="" /> */}
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={team_chart_data}
                  margin={{ top: 6, right: 28, left: 8, bottom: 18 }}
                >
                  <CartesianGrid stroke="#e5e7eb" strokeOpacity={0.8} />
                  <YAxis
                    yAxisId="record"
                    width={44}
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    label={{
                      value: "Points / Wins / Losses",
                      angle: -90,
                      position: "insideLeft",
                      offset: 0,
                      style: { fontSize: 11, fill: "#334155" },
                    }}
                  />
                  <YAxis
                    yAxisId="pct"
                    orientation="right"
                    domain={[0, 100]}
                    width={44}
                    tick={{ fontSize: 11, fill: "#7c3aed" }}
                    tickFormatter={(value) => `${value}%`}
                    label={{
                      value: "P%",
                      angle: 90,
                      position: "insideRight",
                      offset: 0,
                      style: { fontSize: 11, fill: "#7c3aed" },
                    }}
                  />
                  <XAxis
                    dataKey="seasonId"
                    tickFormatter={formatSeasonStartYear}
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    tickMargin={8}
                    label={{
                      value: "Season start year",
                      position: "insideBottom",
                      offset: -12,
                      style: { fontSize: 11, fill: "#334155" },
                    }}
                  />
                  <Tooltip
                    labelFormatter={(label) => formatSeasonStartYear(label)}
                    formatter={(value, name) => [
                      name === "P%" && Number.isFinite(Number(value))
                        ? `${Number(value).toFixed(1)}%`
                        : value,
                      name,
                    ]}
                  />
                  <Legend
                    align="left"
                    verticalAlign="top"
                    height={28}
                    iconType="circle"
                    wrapperStyle={{ fontSize: 12 }}
                  />
                  <Line
                    type="linear"
                    name="Points"
                    dataKey="points"
                    yAxisId="record"
                    strokeWidth={2}
                    stroke="#2563eb"
                    dot={{ r: 3, strokeWidth: 2, fill: "#fff" }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="linear"
                    name="Wins"
                    dataKey="wins"
                    yAxisId="record"
                    strokeWidth={2}
                    stroke="#009966"
                    strokeDasharray="4 3"
                    dot={{ r: 3, strokeWidth: 2, fill: "#fff" }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="linear"
                    name="P%"
                    dataKey="pointPctPercent"
                    yAxisId="pct"
                    strokeWidth={2}
                    stroke="#7c3aed"
                    strokeDasharray="6 2 2 2"
                    dot={{ r: 3, strokeWidth: 2, fill: "#fff" }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="linear"
                    name="Losses (reg)"
                    dataKey="losses"
                    yAxisId="record"
                    strokeWidth={2}
                    stroke="#FF0000"
                    strokeDasharray="1 4"
                    dot={{ r: 3, strokeWidth: 2, fill: "#fff" }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="min-w-0 overflow-x-auto">
              {team_table_data && (
                <PaginatedTable
                  // columns={newColumns}
                  columns={team_table_columns}
                  data={team_table_data}
                  sortKey="seasonId"
                  pageSize={10}
                  onPageRowsChange={handleTeamTablePageRowsChange}
                  fillLastPage
                  modern
                  compact
                />
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="p-1 mt-2">
        <ThreadMessageBoard
          threadType="team"
          threadId={teamId}
          title={`${teamName} Message Board`}
          emptyMessage={`No posts yet for ${teamName}.`}
        />
      </div>
      <style jsx>{`
        .team-content-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 0.25rem;
          max-width: 100%;
          padding: 0.125rem;
          width: 100%;
        }

        .roster-card,
        .history-card {
          width: 100%;
        }

        @media (min-width: 1280px) {
          .team-content-grid {
            align-items: start;
            grid-template-columns: max-content minmax(0, 1fr);
          }

          .roster-card {
            max-width: 100%;
            width: max-content;
          }
        }
      `}</style>
    </div>
  );
}

export async function getServerSideProps({params, req, query}) {
  const id = extractEntityId(params.id);
  const protocol = req.headers["x-forwarded-proto"] || "http";
  const host = req.headers.host;

  try {
    const response = await fetch(`${protocol}://${host}/api/teams/${id}`);

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
          teamId: id,
          canonicalPath: teamUrl(null, id),
        },
      };
    }

    const payload = await response.json();
    const teamInfo = payload?.team || null;
    const skaters = payload?.skaters || [];
    const goalies = payload?.goalies || [];
    const teamRecords = payload?.teamRecords || [];
    const playoffSeasons = payload?.playoffSeasons || [];
    const normalizeSeasonId = (season) =>
      season === null || season === undefined ? "" : String(season);

    const teamName = teamInfo?.fullName || teamInfo?.name || teamInfo?.abbreviation || "";
    const canonicalPath = teamUrl(teamName, id);
    if (params.id !== canonicalPath.split('/').pop()) {
      const season = Array.isArray(query?.season) ? query.season[0] : query?.season;
      return {
        redirect: {
          destination: season
            ? `${canonicalPath}?season=${encodeURIComponent(season)}`
            : canonicalPath,
          permanent: false,
        },
      };
    }

    const combinePlayersBySeason = (allSkaters, allGoalies) => {
      const seasonMap = {};

      allSkaters.forEach((skater) => {
        const season = normalizeSeasonId(skater.season);
        if (!seasonMap[season]) {
          seasonMap[season] = {skaters: [], goalies: []};
        }
        seasonMap[season].skaters.push(skater);
      });

      allGoalies.forEach((goalie) => {
        const season = normalizeSeasonId(goalie.season);
        if (!seasonMap[season]) {
          seasonMap[season] = {skaters: [], goalies: []};
        }
        seasonMap[season].goalies.push(goalie);
      });

      return seasonMap;
    };

    const seasonMap = combinePlayersBySeason(skaters, goalies);
    const seasons = Object.keys(seasonMap).sort((a, b) => b.localeCompare(a));
    const playoffSeasonIds = new Set(playoffSeasons.map(normalizeSeasonId));

    seasons.forEach((season) => {
      seasonMap[season].madePlayoffs = playoffSeasonIds.has(season);
    });

    return {
      props: {
        seasons: seasonMap,
        seasonIds: seasons,
        abbreviation: teamInfo?.abbreviation || null,
        fullName: teamInfo?.fullName || teamInfo?.name || null,
        teamRecords,
        teamId: id,
        canonicalPath,
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
        teamId: id,
        canonicalPath: teamUrl(null, id),
      },
    };
  }
}
