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
import { getContractSeasonRows } from "../../lib/contracts";
import { formatCurrency, formatSeason, formatSeasonStartYear, formatShortSeason, toNumber } from "../../lib/format";
import { extractEntityId, playerUrl, teamUrl } from "../../lib/routes";
import { normalizeSeasonId } from "../../lib/season";
import {
  CartesianGrid,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const numericColumnMeta = {
  headerClassName: "text-right",
  cellClassName: "text-right",
};

const contractCurrencyFooter = (field) => {
  const ContractCurrencyFooter = ({table}) => {
    const total = table
      .getFilteredRowModel()
      .rows
      .reduce((sum, row) => sum + (toNumber(row?.original?.[field]) || 0), 0);

    return <div className="text-right">{total > 0 ? formatCurrency(total) : "-"}</div>;
  };

  return ContractCurrencyFooter;
};

export default function TeamPage({
  seasons = [],
  seasonIds = [],
  abbreviation,
  fullName,
  teamRecords,
  teamContracts = [],
  initialContractSeason,
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
  const [rosterSearch, setRosterSearch] = useState("");
  const [sidePanelTab, setSidePanelTab] = useState("stats");
  const [hiddenTeamChartSeries, setHiddenTeamChartSeries] = useState({});
  const [teamContractsBySeason, setTeamContractsBySeason] = useState(() =>
    initialContractSeason ? {[initialContractSeason]: teamContracts || []} : {}
  );

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

  useEffect(() => {
    if (!router.isReady || !teamId || !seasonId || Object.prototype.hasOwnProperty.call(teamContractsBySeason, seasonId)) return;

    let ignore = false;
    const controller = new AbortController();

    fetch(`/api/teams/${encodeURIComponent(teamId)}?contractsOnly=1&contractSeason=${encodeURIComponent(seasonId)}`, {
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (ignore) return;

        setTeamContractsBySeason((current) => ({
          ...current,
          [seasonId]: payload?.teamContracts || [],
        }));
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          console.warn(`Unable to load ${seasonId} team contracts`, error);
        }
      });

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [router.isReady, seasonId, teamContractsBySeason, teamId]);

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
    if (currentIndex < seasonIds.length - 1) {
      const newIndex = currentIndex + 1;
      selectSeason(seasonIds[newIndex]);
    }
  };

  const handleIncrementSeason = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      selectSeason(seasonIds[newIndex]);
    }
  };

  const toggleTeamChartSeries = useCallback((seriesKey) => {
    setHiddenTeamChartSeries((current) => ({
      ...current,
      [seriesKey]: !current[seriesKey],
    }));
  }, []);

  const filteredSkaters = useMemo(() => {
    const skaters = seasonData?.skaters || [];
    const search = rosterSearch.trim().toLowerCase();
    if (!search) return skaters;

    return skaters.filter((player) =>
      String(player?.fullName || "").toLowerCase().includes(search)
    );
  }, [rosterSearch, seasonData]);

  const filteredGoalies = useMemo(() => {
    const goalies = seasonData?.goalies || [];
    const search = rosterSearch.trim().toLowerCase();
    if (!search) return goalies;

    return goalies.filter((player) =>
      String(player?.fullName || "").toLowerCase().includes(search)
    );
  }, [rosterSearch, seasonData]);

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
            size: 38,
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
            header: "GP",
            accessorFn: (d) => d["playoffGamesPlayed"],
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
            header: "W",
            accessorFn: (d) => d["playoffWins"],
            size: 34,
            meta: numericColumnMeta,
            cell: (props) => (
              <p className="text-right">
                {formatPlayoffValue(props.getValue())}
              </p>
            ),
          },
          {
            header: "L",
            accessorFn: (d) => d["playoffLosses"],
            size: 34,
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
            size: 38,
          },
          {
            header: "Age",
            accessorFn: (d) => calculateSeasonAge(d),
            size: 34,
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
            size: 34,
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
            size: 38,
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
            size: 34,
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
            size: 38,
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
            size: 38,
          },
          {
            header: "Age",
            accessorFn: (d) => calculateSeasonAge(d),
            size: 34,
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
  const selectedTeamRecord = useMemo(
    () =>
      (teamRecords || []).find(
        (record) => normalizeSeasonId(record?.seasonId) === seasonId
      ),
    [teamRecords, seasonId]
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
  const teamPageId = teamId;
  const teamName = fullName || abbreviation;
  const contractsLoadedForSeason = Object.prototype.hasOwnProperty.call(teamContractsBySeason, seasonId);
  const selectedSeasonContracts = useMemo(
    () => (Array.isArray(teamContractsBySeason[seasonId]) ? teamContractsBySeason[seasonId] : []),
    [seasonId, teamContractsBySeason]
  );
  const teamContractRows = useMemo(
    () =>
      selectedSeasonContracts
        .flatMap((playerContract) => {
          const rosterSeasons = Array.isArray(playerContract.rosterSeasons)
            ? playerContract.rosterSeasons.map(String)
            : [];
          if (!rosterSeasons.includes(String(seasonId))) return [];

          const contractRows = getContractSeasonRows(playerContract.contracts);
          const selectedContractRows = contractRows.filter(
            (contract) => String(contract.season) === String(seasonId)
          );
          const fallbackCurrentContract =
            playerContract.currentContract && String(playerContract.currentContract.current_season) === String(seasonId)
              ? [playerContract.currentContract]
              : [];

          return (selectedContractRows.length ? selectedContractRows : fallbackCurrentContract).map((contract) => {
            if (!contract) return null;

            return {
              playerId: playerContract.playerId,
              fullName: playerContract.fullName,
              positionCode: playerContract.positionCode || "-",
              rosterSeason: seasonId,
              cap_hit: contract.cap_hit,
              current_total_salary: contract.current_total_salary || contract.total_salary,
              current_season: contract.current_season || contract.season,
              start_season: contract.start_season,
              end_season: contract.end_season,
              clause: contract.current_clause || contract.clause,
              source_url: contract.source_url,
            };
          });
        })
        .filter(Boolean),
    [seasonId, selectedSeasonContracts]
  );
  const hasTeamContracts = teamContractRows.length > 0;

  const contract_table_columns = useMemo(
    () => [
      {
        header: "Player",
        accessorKey: "fullName",
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
            props.getValue()
          ),
      },
      {
        header: "Pos",
        accessorKey: "positionCode",
        size: 28,
        meta: {
          headerClassName: "text-center",
          cellClassName: "text-center",
        },
      },
      {
        header: "Cap Hit",
        accessorKey: "cap_hit",
        size: 92,
        meta: numericColumnMeta,
        cell: (props) => <p className="text-right">{formatCurrency(props.getValue())}</p>,
        footer: contractCurrencyFooter("cap_hit"),
      },
      {
        header: "Salary",
        accessorKey: "current_total_salary",
        size: 92,
        meta: numericColumnMeta,
        cell: (props) => <p className="text-right">{formatCurrency(props.getValue())}</p>,
        footer: contractCurrencyFooter("current_total_salary"),
      },
      {
        header: "Term",
        id: "term",
        accessorFn: (row) =>
          row.start_season || row.end_season
            ? `${formatShortSeason(row.start_season)} to ${formatShortSeason(row.end_season)}`
            : "-",
        size: 62,
      },
      {
        header: "Season",
        accessorKey: "current_season",
        size: 60,
        cell: (props) => formatShortSeason(props.getValue()),
      },
      {
        header: "Clause",
        accessorKey: "clause",
        size: 54,
        cell: (props) => props.getValue() || "-",
      },
    ],
    []
  );

  const team_table_columns = useMemo(
    () => [
      {
        header: "Year",
        accessorKey: "seasonId",
        size: 68,
        cell: (props) => {
          const season = props.getValue();
          const seasonLabel = formatSeason(season);
          if (!teamPageId || !season) return seasonLabel;

          return (
            <Link
              href={`${teamUrl(teamName, teamPageId)}?season=${encodeURIComponent(season)}`}
              className="font-medium text-slate-800 hover:text-blue-700 dark:text-slate-100 dark:hover:text-blue-300"
            >
              {seasonLabel}
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
                {normalizeSeasonId(selectedTeamRecord.seasonId)}
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
            <div className="flex flex-wrap items-center gap-2 pb-0.5">
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
              <input
                type="search"
                value={rosterSearch}
                onChange={(event) => setRosterSearch(event.target.value)}
                placeholder="Search players..."
                className="min-w-0 flex-1 rounded border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 sm:max-w-xs"
                aria-label="Search roster players"
              />
            </div>

            {seasonData && seasonData?.skaters && (
              <ReactTable
                data={filteredSkaters}
                columns={roster_player_table_columns}
                sortKey="P"
                modern
                compact
              />
            )}
            {seasonData && seasonData?.goalies && (
              <ReactTable
                data={filteredGoalies}
                columns={roster_goalie_table_columns}
                sortKey="P"
                modern
                compact
              />
            )}
          </div>
        )}
        <div className="team-side-column min-w-0 overflow-hidden rounded-md border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-1 flex rounded-md border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-700 dark:bg-slate-900">
            {[
              {id: "stats", label: "Team Stats"},
              {id: "contracts", label: "Contracts"},
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`flex-1 rounded px-3 py-1.5 text-sm font-semibold transition ${
                  sidePanelTab === tab.id
                    ? "bg-white text-blue-700 shadow-sm dark:bg-slate-800 dark:text-blue-300"
                    : "text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
                }`}
                aria-pressed={sidePanelTab === tab.id}
                onClick={() => setSidePanelTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {sidePanelTab === "stats" && (
            <section className="history-card min-w-0 overflow-hidden">
              <div className="grid min-w-0 grid-cols-1 gap-2 2xl:grid-cols-[minmax(24rem,1fr)_auto]">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-1 py-1 text-xs font-medium">
                    {[
                      {key: "points", label: "Points", color: "#2563eb"},
                      {key: "wins", label: "Wins", color: "#009966"},
                      {key: "pointPctPercent", label: "P%", color: "#7c3aed"},
                      {key: "losses", label: "Losses (reg)", color: "#FF0000"},
                    ].map((series) => {
                      const isHidden = Boolean(hiddenTeamChartSeries[series.key]);

                      return (
                        <button
                          key={series.key}
                          type="button"
                          className={`flex items-center gap-1.5 transition ${
                            isHidden ? "opacity-40" : ""
                          }`}
                          style={{color: series.color}}
                          aria-pressed={!isHidden}
                          onClick={() => toggleTeamChartSeries(series.key)}
                        >
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{backgroundColor: series.color}}
                          />
                          {series.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="h-72 min-w-0 xl:h-80">
                    {/* <input type="" /> */}
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={team_chart_data}
                        margin={{ top: 10, right: 32, left: 8, bottom: 18 }}
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
                        {!hiddenTeamChartSeries.points && (
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
                        )}
                        {!hiddenTeamChartSeries.wins && (
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
                        )}
                        {!hiddenTeamChartSeries.pointPctPercent && (
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
                        )}
                        {!hiddenTeamChartSeries.losses && (
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
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
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
            </section>
          )}
          {sidePanelTab === "contracts" && (
            <section className="contracts-card overflow-hidden">
              <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2 px-1">
                <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                  Player Contracts
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Selected season
                </p>
              </div>
              {!contractsLoadedForSeason ? (
                <div className="flex min-h-24 items-center justify-center gap-2 rounded-md border border-slate-200 bg-slate-50 text-sm font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600 dark:border-slate-600 dark:border-t-blue-300" />
                  Loading contracts
                </div>
              ) : hasTeamContracts ? (
                <PaginatedTable
                  columns={contract_table_columns}
                  data={teamContractRows}
                  sortKey="cap_hit"
                  pageSize={20}
                  modern
                  compact
                />
              ) : (
                <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                  No contract data for this season.
                </div>
              )}
            </section>
          )}
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
          gap: 0.125rem;
          max-width: 100%;
          padding: 0;
          width: 100%;
        }

        .history-card,
        .contracts-card,
        .team-side-column {
          max-width: 100%;
          min-width: 0;
          width: 100%;
        }

        .roster-card {
          max-width: none;
          width: max-content;
        }

        .team-side-column {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          min-width: 0;
          overflow: hidden;
        }

        .roster-card :global(th),
        .roster-card :global(td) {
          padding-left: 0.25rem;
          padding-right: 0.25rem;
        }

        .contracts-card :global(th),
        .contracts-card :global(td) {
          padding-left: 0.25rem;
          padding-right: 0.25rem;
        }

        @media (min-width: 1180px) {
          .team-content-grid {
            align-items: start;
            grid-template-columns: max-content minmax(0, 1fr);
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
    const requestedSeason = Array.isArray(query?.season) ? query.season[0] : query?.season;
    const teamApiUrl = new URL(`${protocol}://${host}/api/teams/${id}`);
    if (requestedSeason) {
      teamApiUrl.searchParams.set("contractSeason", requestedSeason);
    }

    const response = await fetch(teamApiUrl.toString());

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
          teamContracts: [],
          initialContractSeason: null,
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
    const teamContracts = payload?.teamContracts || [];
    const playoffSeasons = payload?.playoffSeasons || [];
    const teamName = teamInfo?.fullName || teamInfo?.name || teamInfo?.abbreviation || "";
    const canonicalPath = teamUrl(teamName, id);
    if (params.id !== canonicalPath.split('/').pop()) {
      return {
        redirect: {
          destination: requestedSeason
            ? `${canonicalPath}?season=${encodeURIComponent(requestedSeason)}`
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
    const initialContractSeason = requestedSeason && seasons.includes(requestedSeason)
      ? requestedSeason
      : seasons[0] || null;
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
        teamContracts,
        initialContractSeason,
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
        teamContracts: [],
        initialContractSeason: null,
        teamId: id,
        canonicalPath: teamUrl(null, id),
      },
    };
  }
}
