import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { FaTrophy } from "react-icons/fa";
import { MdOutlineChevronLeft, MdOutlineChevronRight } from "react-icons/md";
import ReactTable from "../../components/PaginatedTable";
import SEO from "../../components/SEO";
import { formatSeason, toNumber } from "../../lib/format";
import { PAGE_CACHE, setPageCache } from "../../lib/http-cache";
import { playerUrl, teamAbbrevFromName, teamUrl } from "../../lib/routes";

const MAJOR_AWARDS = [
  "Hart Memorial Trophy",
  "Ted Lindsay Award",
  "Art Ross Trophy",
  'Maurice "Rocket" Richard Trophy',
  "Maurice Richard Trophy",
  "Calder Memorial Trophy",
  "James Norris Memorial Trophy",
  "Vezina Trophy",
  "William M. Jennings Trophy",
  "Frank J. Selke Trophy",
  "Lady Byng Memorial Trophy",
  "Conn Smythe Trophy",
  "King Clancy Memorial Trophy",
  "Bill Masterton Memorial Trophy",
  "Mark Messier NHL Leadership Award",
  "Jack Adams Award",
];

const linkClass = "text-blue-700 hover:underline dark:text-blue-300";
const numericColumnMeta = {
  headerClassName: "text-right",
  cellClassName: "text-right tabular-nums",
};
const emphasizedNumericColumnMeta = {
  headerClassName: "text-right",
  cellClassName: "text-right tabular-nums font-semibold",
};

const formatValue = (value, digits) => {
  const number = toNumber(value);
  if (number === null) return "-";
  return digits == null ? String(number) : number.toFixed(digits);
};

const numberCell = (digits) => {
  function StatNumberCell(props) {
    return <p className="text-right">{formatValue(props.getValue(), digits)}</p>;
  }
  return StatNumberCell;
};

function seasonIndex(seasons, season) {
  return (seasons || []).findIndex((value) => Number(value) === Number(season));
}

function seasonPhaseFromQuery(query) {
  return query?.phase === "playoffs" ? "playoffs" : "regular";
}

function phaseButtonClass(active) {
  return [
    "rounded px-3 py-1.5 transition",
    active
      ? "bg-blue-600 text-white"
      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700",
  ].join(" ");
}

function teamLabel(row) {
  return (
    row["team.abbreviation"] ||
    row.teamAbbrev ||
    row.abbreviation ||
    teamAbbrevFromName(row["team.name"], row.season) ||
    row["team.name"] ||
    "-"
  );
}

function trophyName(award) {
  return String(award?.trophy_default || award?.trophy || award?.name || "").trim();
}

function isMinorHonor(name) {
  return /all[-\s]?star|three stars|star of the|player of the (week|month)|first star|second star|third star|olympic|world (cup|championship)|world juniors/i.test(
    name
  );
}

function isTeamTrophy(name) {
  return /stanley cup|prince of wales|campbell bowl|presidents'? trophy/i.test(name);
}

function isStanleyCupTrophy(name) {
  return /stanley\s*cup/i.test(name) && !/world\s*cup/i.test(name);
}

function stanleyCupWinnerIds(awards) {
  const ids = new Set();
  (Array.isArray(awards) ? awards : []).forEach((award) => {
    if (!isStanleyCupTrophy(trophyName(award)) || award.playerId == null) return;
    ids.add(String(award.playerId));
  });
  return ids;
}

function championTeamFromRows(winnerIds, rows, season) {
  const counts = new Map();

  (Array.isArray(rows) ? rows : []).forEach((row) => {
    if (!winnerIds.has(String(row.playerId))) return;

    const name = row["team.name"] || "";
    const abbrev =
      row["team.abbreviation"] ||
      row.teamAbbrev ||
      teamAbbrevFromName(name, row.season || season) ||
      "";
    const key = abbrev || name;
    if (!key) return;

    const existing = counts.get(key);
    if (existing) {
      existing.count += 1;
      if (!existing.id && row["team.id"]) existing.id = row["team.id"];
      if (!existing.name && name) existing.name = name;
      if (!existing.abbrev && abbrev) existing.abbrev = abbrev;
      return;
    }

    counts.set(key, {
      count: 1,
      name: name || abbrev,
      id: row["team.id"] || null,
      abbrev,
    });
  });

  const ranked = [...counts.values()].sort((left, right) => right.count - left.count);
  if (ranked.length === 0) return null;
  if (ranked.length > 1 && ranked[0].count === ranked[1].count) return null;
  if (ranked[0].count < 2) return null;
  return ranked[0];
}

function inferStanleyCupChampion(awards, playoffPlayers, playoffGoalies, players, goalies, season) {
  const winnerIds = stanleyCupWinnerIds(awards);
  if (winnerIds.size === 0) {
    return { winnerIds, team: null };
  }

  const playoffTeam = championTeamFromRows(
    winnerIds,
    [...(playoffPlayers || []), ...(playoffGoalies || [])],
    season
  );
  const team =
    playoffTeam ||
    championTeamFromRows(winnerIds, [...(players || []), ...(goalies || [])], season);

  return { winnerIds, team };
}

function groupSeasonAwards(awards) {
  const byTrophy = new Map();

  (Array.isArray(awards) ? awards : []).forEach((award) => {
    const name = trophyName(award);
    if (!name || isTeamTrophy(name) || isMinorHonor(name)) return;

    const key = name.toLowerCase();
    if (!byTrophy.has(key)) {
      byTrophy.set(key, { trophy: name, winners: [] });
    }

    byTrophy.get(key).winners.push({
      playerId: award.playerId,
      player_name: award.player_name || award.playerName || award.player || null,
    });
  });

  const rank = (name) => {
    const index = MAJOR_AWARDS.findIndex((trophy) => trophy.toLowerCase() === name.toLowerCase());
    return index === -1 ? MAJOR_AWARDS.length : index;
  };

  return [...byTrophy.values()]
    .filter((group) => group.winners.length > 0 && group.winners.length <= 4)
    .sort((left, right) => rank(left.trophy) - rank(right.trophy) || left.trophy.localeCompare(right.trophy));
}

function TeamCell({ row }) {
  const name = row.original["team.name"];
  const id = row.original["team.id"];
  const label = teamLabel(row.original);
  const className = `${linkClass} block max-w-[3.25rem] truncate`;

  if (name && id) {
    return (
      <Link href={teamUrl(name, id)} className={className} title={name}>
        {label}
      </Link>
    );
  }

  return (
    <span className="block max-w-[3.25rem] truncate" title={name}>
      {label}
    </span>
  );
}

function CupMark() {
  return (
    <FaTrophy
      size={11}
      className="shrink-0 text-amber-500 dark:text-amber-300"
      title="Stanley Cup champion"
      aria-label="Stanley Cup champion"
    />
  );
}

function playerCell(cupWinnerIds) {
  function SeasonPlayerCell({ row }) {
    const wonCup = cupWinnerIds.has(String(row.original.playerId));

    return (
      <span className="inline-flex min-w-0 items-center gap-1.5">
        <Link href={playerUrl(row.original.player_name, row.original.playerId)} className={linkClass}>
          {row.original.player_name}
        </Link>
        {wonCup ? <CupMark /> : null}
      </span>
    );
  }

  return SeasonPlayerCell;
}

function WinnerList({ winners }) {
  const named = (winners || []).filter((winner) => winner.player_name);
  if (named.length === 0) {
    return <span className="text-slate-500 dark:text-slate-400">Winner unavailable</span>;
  }

  return named.map((winner, index) => (
    <span key={`${winner.playerId || winner.player_name}-${index}`}>
      {index > 0 ? ", " : ""}
      {winner.playerId ? (
        <Link href={playerUrl(winner.player_name, winner.playerId)} className={linkClass}>
          {winner.player_name}
        </Link>
      ) : (
        winner.player_name
      )}
    </span>
  ));
}

export default function Seasons({
  players = [],
  playoffPlayers = [],
  goalies = [],
  playoffGoalies = [],
  awards,
  season,
  availableSeasons,
}) {
  const router = useRouter();
  const [selectedSeason, setSelectedSeason] = useState(season);
  const [currentIndex, setCurrentIndex] = useState(seasonIndex(availableSeasons, season));
  const [phase, setPhase] = useState(seasonPhaseFromQuery(router.query));
  const awardRows = useMemo(() => groupSeasonAwards(awards), [awards]);
  const { winnerIds: cupWinnerIds, team: cupChampion } = useMemo(
    () => inferStanleyCupChampion(awards, playoffPlayers, playoffGoalies, players, goalies, season),
    [awards, playoffPlayers, playoffGoalies, players, goalies, season]
  );
  const showAwardsSidebar = awardRows.length > 0 || Boolean(cupChampion);
  const skaterRows = phase === "playoffs" ? playoffPlayers : players;
  const goalieRows = phase === "playoffs" ? playoffGoalies : goalies;

  useEffect(() => {
    setSelectedSeason(season);
    setCurrentIndex(seasonIndex(availableSeasons, season));
  }, [availableSeasons, season]);

  useEffect(() => {
    setPhase(seasonPhaseFromQuery(router.query));
  }, [router.query]);

  const skaterColumns = useMemo(
    () => [
      { header: "Rk", accessorKey: "row_number", size: 44 },
      {
        header: "Name",
        accessorKey: "player_name",
        size: 180,
        cell: playerCell(cupWinnerIds),
      },
      {
        header: "Team",
        accessorFn: teamLabel,
        size: 56,
        cell: TeamCell,
      },
      { header: "Pos", accessorFn: (row) => row.position, size: 44 },
      {
        header: "GP",
        accessorFn: (row) => row["stat.games"],
        size: 48,
        meta: numericColumnMeta,
        cell: numberCell(),
      },
      {
        header: "G",
        accessorFn: (row) => row["stat.goals"],
        size: 48,
        meta: numericColumnMeta,
        cell: numberCell(),
      },
      {
        header: "A",
        accessorFn: (row) => row["stat.assists"],
        size: 48,
        meta: numericColumnMeta,
        cell: numberCell(),
      },
      {
        id: "P",
        header: "P",
        accessorFn: (row) => row["stat.points"],
        size: 48,
        meta: emphasizedNumericColumnMeta,
        cell: numberCell(),
      },
      {
        header: "P/GP",
        accessorFn: (row) => (row["stat.games"] > 0 ? row["stat.points"] / row["stat.games"] : 0),
        size: 56,
        meta: numericColumnMeta,
        cell: numberCell(2),
        sortingFn: "basic",
      },
    ],
    [cupWinnerIds]
  );

  const goalieColumns = useMemo(
    () => [
      { header: "Rk", accessorKey: "row_number", size: 44 },
      {
        header: "Name",
        accessorKey: "player_name",
        size: 180,
        cell: playerCell(cupWinnerIds),
      },
      {
        id: "Team",
        header: "Team",
        accessorFn: teamLabel,
        size: 56,
        cell: TeamCell,
      },
      {
        id: "GP",
        header: "GP",
        accessorFn: (row) => row["stat.games"],
        size: 48,
        meta: numericColumnMeta,
        cell: numberCell(),
      },
      {
        id: "W",
        header: "W",
        accessorFn: (row) => row["stat.wins"],
        size: 48,
        meta: emphasizedNumericColumnMeta,
        cell: numberCell(),
      },
      {
        id: "L",
        header: "L",
        accessorFn: (row) => row["stat.losses"],
        size: 48,
        meta: numericColumnMeta,
        cell: numberCell(),
      },
      {
        id: "OTL",
        header: "OTL",
        accessorFn: (row) => row["stat.otl"],
        size: 48,
        meta: numericColumnMeta,
        cell: numberCell(),
      },
      {
        id: "GAA",
        header: "GAA",
        accessorFn: (row) => row["stat.gaa"],
        size: 56,
        meta: numericColumnMeta,
        cell: numberCell(2),
      },
      {
        id: "SV%",
        header: "SV%",
        accessorFn: (row) => row["stat.savePct"],
        size: 60,
        meta: numericColumnMeta,
        cell: numberCell(3),
      },
      {
        id: "SO",
        header: "SO",
        accessorFn: (row) => row["stat.shutouts"],
        size: 48,
        meta: numericColumnMeta,
        cell: numberCell(),
      },
    ],
    [cupWinnerIds]
  );

  const seasonQuery = (nextSeason, nextPhase = phase) => {
    const query = { year: nextSeason };
    if (nextPhase === "playoffs") query.phase = "playoffs";
    return query;
  };

  const goToSeason = (nextSeason) => {
    setSelectedSeason(nextSeason);
    setCurrentIndex(seasonIndex(availableSeasons, nextSeason));
    router.push({ pathname: router.pathname, query: seasonQuery(nextSeason) }, undefined, {
      scroll: false,
    });
  };

  const goToPhase = (nextPhase) => {
    if (nextPhase === phase) return;
    setPhase(nextPhase);
    router.replace(
      { pathname: router.pathname, query: seasonQuery(selectedSeason, nextPhase) },
      undefined,
      { scroll: false, shallow: true }
    );
  };

  const handleSeasonChange = (event) => {
    goToSeason(event.target.value);
  };

  const handlePreviousSeason = () => {
    if (currentIndex > 0) goToSeason(availableSeasons[currentIndex - 1]);
  };

  const handleNextSeason = () => {
    if (currentIndex < availableSeasons.length - 1) goToSeason(availableSeasons[currentIndex + 1]);
  };

  const seasonDisplay = formatSeason(selectedSeason);

  return (
    <div className="bg-white text-slate-950 dark:bg-gray-900 dark:text-slate-100">
      <SEO
        title={`NHL Season Leaders ${seasonDisplay}`}
        description={`NHL ${seasonDisplay} ${
          phase === "playoffs" ? "playoff" : "regular season"
        } statistical leaders. View top scorers, awards, and goaltending stats.`}
        path="/seasons"
      />

      <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 py-2 backdrop-blur dark:border-slate-700 dark:bg-gray-900/95">
        <div className="mx-auto max-w-7xl px-2 sm:px-3">
          <h1 className="text-2xl font-bold sm:text-3xl">NHL Stat Leaders {seasonDisplay}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <select
              aria-label="Select season"
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              value={selectedSeason}
              onChange={handleSeasonChange}
            >
              {(availableSeasons || []).map((szn) => (
                <option key={szn} value={szn}>
                  {formatSeason(szn)}
                </option>
              ))}
            </select>
            <button
              type="button"
              aria-label="Older season"
              className="rounded-md border border-slate-300 bg-white p-2 shadow-sm transition hover:border-blue-400 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700"
              onClick={handleNextSeason}
              disabled={currentIndex < 0 || currentIndex >= availableSeasons.length - 1}
            >
              <MdOutlineChevronLeft size={22} className="text-slate-700 dark:text-slate-200" />
            </button>
            <button
              type="button"
              aria-label="Newer season"
              className="rounded-md border border-slate-300 bg-white p-2 shadow-sm transition hover:border-blue-400 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700"
              onClick={handlePreviousSeason}
              disabled={currentIndex <= 0}
            >
              <MdOutlineChevronRight size={22} className="text-slate-700 dark:text-slate-200" />
            </button>
            <div
              role="group"
              aria-label="Season type"
              className="inline-flex rounded-md border border-slate-300 bg-white p-0.5 text-sm font-semibold shadow-sm dark:border-slate-600 dark:bg-slate-800"
            >
              <button
                type="button"
                aria-pressed={phase === "regular"}
                className={phaseButtonClass(phase === "regular")}
                onClick={() => goToPhase("regular")}
              >
                Regular Season
              </button>
              <button
                type="button"
                aria-pressed={phase === "playoffs"}
                className={phaseButtonClass(phase === "playoffs")}
                onClick={() => goToPhase("playoffs")}
              >
                Playoffs
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-2 py-4 sm:px-3">
        <div
          className={
            showAwardsSidebar
              ? "grid gap-4 lg:grid-cols-[minmax(0,1fr)_17.5rem] lg:items-start"
              : ""
          }
        >
          <div className="grid min-w-0 grid-cols-1 gap-4 2xl:grid-cols-2">
            <section className="min-w-0">
              <h2 className="mb-2 text-lg font-bold text-slate-950 dark:text-white">Skating Leaders</h2>
              {skaterRows?.length ? (
                <ReactTable
                  key={`skaters-${selectedSeason}-${phase}`}
                  columns={skaterColumns}
                  data={skaterRows}
                  sortKey="P"
                  filterCol={["player_name"]}
                  pageSize={25}
                  modern
                  compact
                />
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {phase === "playoffs"
                    ? "No playoff skating stats for this season."
                    : "Error loading skater stats..."}
                </p>
              )}
            </section>

            <section className="min-w-0">
              <h2 className="mb-2 text-lg font-bold text-slate-950 dark:text-white">Goaltending Leaders</h2>
              {goalieRows?.length ? (
                <ReactTable
                  key={`goalies-${selectedSeason}-${phase}`}
                  columns={goalieColumns}
                  data={goalieRows}
                  sortKey="W"
                  filterCol={["player_name"]}
                  pageSize={25}
                  modern
                  compact
                />
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {phase === "playoffs"
                    ? "No playoff goaltending stats for this season."
                    : "Error loading goalie stats..."}
                </p>
              )}
            </section>
          </div>

          {showAwardsSidebar && (
            <aside className="min-w-0 lg:sticky lg:top-[5.75rem] lg:max-h-[calc(100vh-6.5rem)] lg:overflow-y-auto lg:pr-0.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <h2 className="mb-2 text-lg font-bold text-slate-950 dark:text-white">Season awards</h2>
              {cupChampion ? (
                <div className="mb-3 overflow-hidden rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 dark:border-amber-900/60 dark:bg-amber-950/40">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-300">
                    Stanley Cup
                  </p>
                  <div className="mt-1.5 flex items-center gap-2">
                    {cupChampion.abbrev ? (
                      <img
                        src={`https://assets.nhle.com/logos/nhl/svg/${cupChampion.abbrev}_dark.svg`}
                        alt=""
                        className="h-8 w-8 object-contain"
                      />
                    ) : (
                      <FaTrophy className="h-5 w-5 text-amber-500 dark:text-amber-300" aria-hidden="true" />
                    )}
                    {cupChampion.id && cupChampion.name ? (
                      <Link
                        href={teamUrl(cupChampion.name, cupChampion.id)}
                        className={`${linkClass} text-sm font-semibold`}
                      >
                        {cupChampion.name}
                      </Link>
                    ) : (
                      <span className="text-sm font-semibold text-slate-950 dark:text-white">
                        {cupChampion.name}
                      </span>
                    )}
                  </div>
                </div>
              ) : null}
              {awardRows.length > 0 ? (
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
                  <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                    {awardRows.map((award) => (
                      <li key={award.trophy} className="px-3 py-2">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          {award.trophy}
                        </p>
                        <p className="mt-0.5 text-sm font-medium text-slate-950 dark:text-white">
                          <WinnerList winners={award.winners} />
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}

export async function getServerSideProps(context) {
  const { year } = context.query;
  const hasYearQuery = year != null && String(year).trim() !== "";
  const season = hasYearQuery ? parseInt(year, 10) : null;

  if (hasYearQuery && Number.isNaN(season)) {
    return { notFound: true };
  }

  const { loadSeason } = await import("../../lib/season-data");
  const payload = await loadSeason(season);

  if (payload.notFound || payload.error) {
    return { notFound: true };
  }

  const availableSeasons = payload?.availableSeasons || [];
  const resolvedSeason = payload?.season || season;
  const seasonKnown = availableSeasons.some((value) => Number(value) === Number(resolvedSeason));

  if (hasYearQuery && availableSeasons.length && !seasonKnown) {
    return { notFound: true };
  }

  setPageCache(context.res, PAGE_CACHE.hourly);
  return {
    props: {
      players: payload?.players || [],
      playoffPlayers: payload?.playoffPlayers || [],
      goalies: payload?.goalies || [],
      playoffGoalies: payload?.playoffGoalies || [],
      awards: payload?.awards || [],
      season: resolvedSeason,
      availableSeasons,
    },
  };
}
