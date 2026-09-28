import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { MdOutlineChevronLeft, MdOutlineChevronRight } from "react-icons/md";
import ReactTable from "../../components/PaginatedTable";
import SEO from "../../components/SEO";
import { formatSeason } from "../../lib/format";
import {
  compileFormula,
  DEFAULT_FANTASY_FORMULA,
  FANTASY_PRESETS,
  fantasyStatGroups,
  formatFantasyPoints,
  formatFantasyStat,
  projectScore,
} from "../../lib/fantasy-formula";
import { fantasyPageHref } from "../../lib/fantasy-paths";
import { playerUrl, teamUrl } from "../../lib/routes";

const FORMULA_KEY = "hocke.fantasy.formula";
const PACE_KEY = "hocke.fantasy.paceGames";
const MIN_GP_KEY = "hocke.fantasy.minGames";
const PREVIOUS_DEFAULT_FORMULA = "3*G + 2*A + PPP + 0.4*SOG + 3*W + 2*SO";
const STAT_GROUPS = fantasyStatGroups();
const numericColumnMeta = {
  headerClassName: "text-right",
  cellClassName: "text-right tabular-nums",
};
const linkClass = "text-blue-700 hover:underline dark:text-blue-300";

const fieldClass =
  "rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white";

function phaseButtonClass(active) {
  return [
    "rounded px-3 py-1.5 transition",
    active
      ? "bg-blue-600 text-white"
      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700",
  ].join(" ");
}

function seasonIndex(seasons, season) {
  return (seasons || []).findIndex((value) => Number(value) === Number(season));
}

function escapeCsvCell(value) {
  const stringValue = value == null ? "" : String(value);
  return /[",\n\r]/.test(stringValue) ? `"${stringValue.replace(/"/g, '""')}"` : stringValue;
}

function downloadCsv(rows, stats) {
  const headers = ["Rank", "Name", "Pos", "Team", "GP", ...stats, "FP", "FP/82"];
  const body = rows.map((player) => [
    player.rank ?? "",
    player.name,
    player.position,
    player.teamAbbrev || player.teamName,
    player.GP,
    ...stats.map((key) => player[key] ?? ""),
    player.fp ?? "",
    player.fp82 ?? "",
  ]);
  const csv = [headers, ...body].map((row) => row.map(escapeCsvCell).join(",")).join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "fantasy-projections.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function FantasyPage({ players, season, availableSeasons, phase, hitsLoaded }) {
  const router = useRouter();
  const formulaRef = useRef(null);
  const [formula, setFormula] = useState(DEFAULT_FANTASY_FORMULA);
  const [paceGames, setPaceGames] = useState("");
  const [minGames, setMinGames] = useState("");
  const [storedReady, setStoredReady] = useState(false);
  const [search, setSearch] = useState("");
  const [positionGroup, setPositionGroup] = useState("ALL");

  useEffect(() => {
    if (!router.isReady || router.query.year == null || String(router.query.year).trim() === "") return;
    const nextPhase = router.query.phase === "playoffs" ? "playoffs" : "regular";
    router.replace(fantasyPageHref(router.query.year, nextPhase, availableSeasons[0]), undefined, { scroll: false });
  }, [availableSeasons, router]);

  useEffect(() => {
    const savedFormula = window.localStorage.getItem(FORMULA_KEY);
    const savedPace = window.localStorage.getItem(PACE_KEY);
    const savedMinGames = window.localStorage.getItem(MIN_GP_KEY);
    if (savedFormula && savedFormula !== PREVIOUS_DEFAULT_FORMULA) setFormula(savedFormula);
    if (savedPace) setPaceGames(savedPace);
    if (savedMinGames) setMinGames(savedMinGames);
    setStoredReady(true);
  }, []);

  useEffect(() => {
    if (!storedReady) return;
    window.localStorage.setItem(FORMULA_KEY, formula);
    window.localStorage.setItem(PACE_KEY, paceGames);
    window.localStorage.setItem(MIN_GP_KEY, minGames);
  }, [formula, minGames, paceGames, storedReady]);

  const compiled = useMemo(() => compileFormula(formula), [formula]);
  const pace = paceGames.trim() === "" ? null : Number(paceGames);
  const paceActive = Number.isFinite(pace) && pace > 0;
  const visibleStats = useMemo(
    () => compiled.stats.filter((key) => key !== "GP"),
    [compiled.stats]
  );

  const minimumGames = minGames.trim() === "" ? null : Number(minGames);
  const hasMinimum = Number.isFinite(minimumGames) && minimumGames > 0;

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = players.filter((player) => {
      if (hasMinimum && player.GP < minimumGames) return false;
      if (positionGroup !== "ALL" && player.positionGroup !== positionGroup) return false;
      if (!query) return true;
      return (
        player.name.toLowerCase().includes(query) ||
        player.teamAbbrev.toLowerCase().includes(query) ||
        player.teamName.toLowerCase().includes(query)
      );
    });

    const scored = filtered.map((player) => {
      const raw = compiled.ok ? compiled.evaluate(player) : null;
      return {
        ...player,
        fp: projectScore(raw, player.GP, paceActive ? pace : null),
        fp82: projectScore(raw, player.GP, 82),
      };
    });

    scored.sort((a, b) => {
      const aScore = a.fp == null ? Number.NEGATIVE_INFINITY : a.fp;
      const bScore = b.fp == null ? Number.NEGATIVE_INFINITY : b.fp;
      if (bScore !== aScore) return bScore - aScore;
      return a.name.localeCompare(b.name);
    });

    let rank = 0;
    return scored.map((player) => ({
      ...player,
      rank: player.fp == null ? null : ++rank,
    }));
  }, [compiled, hasMinimum, minimumGames, pace, paceActive, players, positionGroup, search]);

  const columns = useMemo(() => {
    const statColumn = (key, label = key) => ({
      id: key,
      header: label,
      accessorFn: (row) => row[key],
      size: key === "AGE" ? 52 : 58,
      meta: numericColumnMeta,
      cell: ({ getValue }) => formatFantasyStat(key, getValue()),
    });

    return [
      {
        id: "rank",
        header: "Rk",
        accessorKey: "rank",
        size: 48,
        meta: numericColumnMeta,
        cell: ({ getValue }) => getValue() ?? "—",
      },
      {
        id: "name",
        header: "Player",
        accessorKey: "name",
        size: 180,
        cell: ({ row }) => (
          <Link href={playerUrl(row.original.name, row.original.playerId)} className={linkClass}>
            {row.original.name}
          </Link>
        ),
      },
      { id: "position", header: "Pos", accessorKey: "position", size: 48 },
      {
        id: "team",
        header: "Team",
        accessorFn: (row) => row.teamAbbrev || row.teamName,
        size: 64,
        cell: ({ row }) => {
          const label = row.original.teamAbbrev || row.original.teamName || "—";
          if (!row.original.teamId || !row.original.teamName) return label;
          return (
            <Link href={teamUrl(row.original.teamName, row.original.teamId)} className={linkClass}>
              {label}
            </Link>
          );
        },
      },
      statColumn("GP"),
      ...visibleStats.map((key) => {
        const stat = STAT_GROUPS.flatMap((group) => group.stats).find((item) => item.key === key);
        return statColumn(key, stat?.label || key);
      }),
      {
        id: "fp",
        header: paceActive ? `FP/${pace}` : "FP",
        accessorKey: "fp",
        size: 72,
        meta: {
          headerClassName: "text-right",
          cellClassName: "text-right tabular-nums font-semibold",
        },
        cell: ({ getValue }) => formatFantasyPoints(getValue()),
      },
      {
        id: "fp82",
        header: "FP/82",
        accessorKey: "fp82",
        size: 72,
        meta: {
          headerClassName: "text-right",
          cellClassName: "text-right tabular-nums font-semibold",
        },
        cell: ({ getValue }) => formatFantasyPoints(getValue()),
      },
    ];
  }, [pace, paceActive, visibleStats]);

  const goToSeason = (year, nextPhase = phase) => {
    router.push(fantasyPageHref(year, nextPhase, availableSeasons[0]), undefined, { scroll: false });
  };

  const insertStat = (key) => {
    const current = formula;
    const element = formulaRef.current;
    const start = element?.selectionStart ?? current.length;
    const end = element?.selectionEnd ?? current.length;
    const prefix = current.slice(0, start);
    const needsSpace = prefix.length > 0 && !/[\s(+\-*/^,(]$/.test(prefix);
    const token = `${needsSpace ? " + " : ""}${key}`;
    const next = prefix + token + current.slice(end);
    setFormula(next);
    requestAnimationFrame(() => {
      if (!formulaRef.current) return;
      const cursor = start + token.length;
      formulaRef.current.focus();
      formulaRef.current.setSelectionRange(cursor, cursor);
    });
  };

  const currentIndex = seasonIndex(availableSeasons, season);
  const matchedPreset = FANTASY_PRESETS.find((preset) => preset.formula === formula.trim());

  return (
    <div className="bg-white text-slate-950 dark:bg-gray-900 dark:text-slate-100">
      <SEO
        title={`Fantasy Point Projections ${formatSeason(season)}`}
        description="Score every NHL player from a season with a spreadsheet-style fantasy formula for goals, assists, power-play points, shots, wins, and shutouts."
        path="/fantasy"
      />
      <div className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-3 py-4">
          <div>
            <h1 className="text-2xl font-bold">Fantasy projections</h1>
            <p className="mt-1 max-w-3xl text-sm text-slate-600 dark:text-slate-300">
              Every player who appeared in an NHL game in {formatSeason(season)}. The formula uses
              that season&apos;s counting stats, the same way a spreadsheet would.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Select season"
              className={`${fieldClass} font-semibold`}
              value={season}
              onChange={(event) => goToSeason(event.target.value)}
            >
              {availableSeasons.map((value) => (
                <option key={value} value={value}>
                  {formatSeason(value)}
                </option>
              ))}
            </select>
            <button
              type="button"
              aria-label="Older season"
              className="rounded-md border border-slate-300 bg-white p-2 shadow-sm transition hover:border-blue-400 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700"
              onClick={() => goToSeason(availableSeasons[currentIndex + 1])}
              disabled={currentIndex < 0 || currentIndex >= availableSeasons.length - 1}
            >
              <MdOutlineChevronLeft size={22} />
            </button>
            <button
              type="button"
              aria-label="Newer season"
              className="rounded-md border border-slate-300 bg-white p-2 shadow-sm transition hover:border-blue-400 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700"
              onClick={() => goToSeason(availableSeasons[currentIndex - 1])}
              disabled={currentIndex <= 0}
            >
              <MdOutlineChevronRight size={22} />
            </button>
            <div role="group" aria-label="Season type" className="inline-flex rounded-md border border-slate-300 bg-white p-0.5 text-sm font-semibold shadow-sm dark:border-slate-600 dark:bg-slate-800">
              <button type="button" className={phaseButtonClass(phase === "regular")} onClick={() => goToSeason(season, "regular")}>
                Regular Season
              </button>
              <button type="button" className={phaseButtonClass(phase === "playoffs")} onClick={() => goToSeason(season, "playoffs")}>
                Playoffs
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl space-y-4 px-3 py-4">
        <section className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <label className="min-w-[16rem] flex-1">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Scoring formula
              </span>
              <span className="flex items-start gap-2">
                <span className="pt-2 font-mono text-sm font-semibold text-slate-500 dark:text-slate-400">fx</span>
                <textarea
                  ref={formulaRef}
                  value={formula}
                  spellCheck={false}
                  rows={2}
                  aria-label="Scoring formula"
                  onChange={(event) => setFormula(event.target.value)}
                  className={`${fieldClass} min-h-[4.25rem] w-full resize-y font-mono`}
                />
              </span>
            </label>
            <label className="w-36">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Project to GP
              </span>
              <input
                type="number"
                min="1"
                max="99"
                inputMode="numeric"
                placeholder="Season"
                aria-label="Project scoring to this many games"
                value={paceGames}
                onChange={(event) => setPaceGames(event.target.value)}
                className={fieldClass}
              />
            </label>
          </div>
          {compiled.error ? (
            <p className="mt-2 text-sm font-medium text-red-700 dark:text-red-300" role="alert">
              {compiled.error}
            </p>
          ) : (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {rows.length.toLocaleString("en-US")} players
              {hasMinimum ? ` with at least ${minimumGames} GP` : ""}
              {paceActive ? `, paced to ${pace} games` : ""}. FP/82 is that same score stretched to an 82-game season. Missing stats count as 0. A player is left blank if the formula divides by zero.
              {hitsLoaded ? "" : " Hits and blocked shots did not load."}
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            {FANTASY_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setFormula(preset.formula)}
                className={phaseButtonClass(matchedPreset?.id === preset.id)}
              >
                {preset.name}
              </button>
            ))}
          </div>

          <div className="mt-3 space-y-2">
            {STAT_GROUPS.map((group) => (
              <div key={group.name} className="flex flex-wrap items-center gap-1.5">
                <span className="w-16 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {group.name}
                </span>
                {group.stats.map((stat) => {
                  const active = compiled.stats.includes(stat.key);
                  return (
                    <button
                      key={stat.key}
                      type="button"
                      title={stat.name}
                      onClick={() => insertStat(stat.key)}
                      className={[
                        "rounded border px-1.5 py-0.5 font-mono text-xs font-semibold",
                        active
                          ? "border-blue-500 bg-blue-600 text-white"
                          : "border-slate-300 bg-white text-slate-700 hover:border-blue-400 hover:text-blue-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100",
                      ].join(" ")}
                    >
                      {stat.label}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Click a stat to insert it. Use + - * / ^, parentheses, comparisons, and IF, MIN, MAX, ABS, ROUND.
            50% means 0.5. Example pace: IF(GP&gt;0, (3*G + 2*A)/GP*82, 0).
            League scoring is 2 per goal, 1 per assist, 0.5 per power-play point and shorthanded point, 0.1 per shot and hit, 0.5 per block, 4 per win, minus 2 per goal against, 0.2 per save, 3 per shutout, and 1 per overtime loss.
          </p>
        </section>

        <div className="flex flex-wrap items-center gap-2">
          <div role="group" aria-label="Position" className="inline-flex rounded-md border border-slate-300 bg-white p-0.5 text-sm font-semibold shadow-sm dark:border-slate-600 dark:bg-slate-800">
            {[
              ["ALL", "All"],
              ["F", "Forwards"],
              ["D", "Defense"],
              ["G", "Goalies"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={phaseButtonClass(positionGroup === value)}
                onClick={() => setPositionGroup(value)}
              >
                {label}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            Min GP
            <input
              type="number"
              min="0"
              max="99"
              inputMode="numeric"
              value={minGames}
              onChange={(event) => setMinGames(event.target.value)}
              placeholder="Any"
              aria-label="Minimum games played"
              className={`${fieldClass} w-20`}
            />
          </label>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search player or team"
            aria-label="Search player or team"
            className={`${fieldClass} w-full sm:w-64`}
          />
          <button
            type="button"
            onClick={() => downloadCsv(rows, ["GP", ...visibleStats])}
            className="ml-auto rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:border-blue-400 hover:text-blue-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          >
            Download CSV
          </button>
        </div>

        {rows.length ? (
          <ReactTable
            key={`${season}-${phase}-${visibleStats.join("-")}-${paceActive ? pace : "season"}`}
            columns={columns}
            data={rows}
            sortKey="fp"
            filterCol={[]}
            pageSize={40}
            modern
            compact
          />
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">No players match this season and filter.</p>
        )}
      </main>
    </div>
  );
}

export async function getStaticPaths() {
  const { fantasyStaticPaths } = await import("../../lib/fantasy-data");
  return {
    paths: await fantasyStaticPaths(),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const { loadStaticFantasyPage } = await import("../../lib/fantasy-data");
  const result = await loadStaticFantasyPage(params?.slug);
  if (result.notFound) return { notFound: true };

  return {
    props: {
      players: result.players,
      season: result.season,
      availableSeasons: result.availableSeasons,
      phase: result.phase,
      hitsLoaded: result.hitsLoaded,
    },
  };
}
