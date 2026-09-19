import Link from "next/link";
import { ClickableImage } from "./ImageModal";
import PlayerSearchPicker from "./PlayerSearchPicker";
import { formatCurrency, formatSeason } from "../lib/format";
import {
  awardCounts,
  careerCompareRows,
  compareWinner,
  mergeNhlSeasons,
  playerHeadshotUrl,
  seasonCellValue,
  seasonCompareColumns,
} from "../lib/player-compare";
import {
  currentTeamFromStats,
  formatDraft,
  formatHeight,
  formatStatValue,
  formatWeight,
  isGoaliePosition,
} from "../lib/player-stats";
import { playerUrl, teamUrl } from "../lib/routes";

function winnerClass(side, winner) {
  if (winner === "tie") return "text-slate-900 dark:text-white";
  if (winner === side) return "font-bold text-emerald-700 dark:text-emerald-300";
  return "text-slate-700 dark:text-slate-300";
}

function PlayerCard({
  person,
  stats,
  loading,
  onChange,
  excludeIds,
  align = "left",
}) {
  if (!person) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 dark:border-slate-600 dark:bg-slate-900">
        <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
          Choose a player
        </p>
        <PlayerSearchPicker
          onSelect={onChange}
          excludeIds={excludeIds}
          placeholder="Search by name..."
          autoFocus={align === "right"}
        />
      </div>
    );
  }

  const playerId = person.playerId;
  const playerName = person.player_name || "Player";
  const isGoalie = isGoaliePosition(person.position);
  const currentTeam = currentTeamFromStats(stats);

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900">
      <div className={`flex gap-3 ${align === "right" ? "sm:flex-row-reverse sm:text-right" : ""}`}>
        <ClickableImage
          src={playerHeadshotUrl(playerId)}
          alt={`${playerName} headshot`}
          containerClassName="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-800"
          className="object-cover"
        />
        <div className="min-w-0 flex-1">
          <Link
            href={playerUrl(playerName, playerId)}
            className="text-xl font-bold leading-tight text-slate-950 hover:underline dark:text-white"
          >
            {playerName}
          </Link>
          <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
            {person.position || "-"}
            <span className="px-1.5 text-slate-400">|</span>
            {person.sweaterNumber ? `#${person.sweaterNumber}` : "#-"}
            <span className="px-1.5 text-slate-400">|</span>
            {isGoalie ? "Catches" : "Shoots"}: {person.shootsCatches || "-"}
          </p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {currentTeam?.["team.name"] && currentTeam?.["team.id"] ? (
              <Link
                href={teamUrl(currentTeam["team.name"], currentTeam["team.id"])}
                className="text-blue-700 hover:underline dark:text-blue-300"
              >
                {currentTeam["team.name"]}
              </Link>
            ) : (
              currentTeam?.["team.name"] || (loading ? "Loading team..." : "-")
            )}
          </p>
        </div>
      </div>
      <div className="mt-3">
        <p className="mb-1 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
          Change player
        </p>
        <PlayerSearchPicker
          onSelect={onChange}
          excludeIds={excludeIds}
          preferPosition={person.position}
          placeholder="Search another player..."
        />
      </div>
    </div>
  );
}

function BioRow({ label, left, right }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_5.5rem_minmax(0,1fr)] items-center gap-2 border-t border-slate-200 py-2 text-sm dark:border-slate-700 first:border-t-0 first:pt-0">
      <div className="min-w-0 text-left text-slate-800 dark:text-slate-100">{left}</div>
      <div className="text-center text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
        {label}
      </div>
      <div className="min-w-0 text-right text-slate-800 dark:text-slate-100">{right}</div>
    </div>
  );
}

function StatRow({ label, left, right, digits = 0, lowerIsBetter = false, loading }) {
  const winner = loading ? null : compareWinner(left, right, { lowerIsBetter });

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_5.5rem_minmax(0,1fr)] items-center gap-2 border-t border-slate-200 py-2 dark:border-slate-700 first:border-t-0 first:pt-0">
      <p className={`text-left text-lg tabular-nums ${winnerClass("left", winner)}`}>
        {loading ? "—" : formatStatValue(left, digits)}
      </p>
      <p className="text-center text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className={`text-right text-lg tabular-nums ${winnerClass("right", winner)}`}>
        {loading ? "—" : formatStatValue(right, digits)}
      </p>
    </div>
  );
}

function TeamValue({ team }) {
  if (team?.["team.name"] && team?.["team.id"]) {
    return (
      <Link
        href={teamUrl(team["team.name"], team["team.id"])}
        className="text-blue-700 hover:underline dark:text-blue-300"
      >
        {team["team.name"]}
      </Link>
    );
  }

  return team?.["team.name"] || "-";
}

function DraftValue({ person }) {
  if (!person) return "-";
  const label = formatDraft(person);
  if (label === "Undrafted" || !person.draft_seasons) return label;

  return (
    <>
      <Link
        href={`/drafts/${person.draft_seasons}`}
        className="text-blue-700 hover:underline dark:text-blue-300"
      >
        {Array.isArray(person.draft_seasons)
          ? person.draft_seasons.filter(Boolean).join(", ")
          : person.draft_seasons}
      </Link>
      {person.displayAbbrev ? `, ${person.displayAbbrev}` : ""}
      {person.ordinalPick ? ` (${person.ordinalPick} overall)` : ""}
    </>
  );
}

function AwardsList({ awards, loading }) {
  if (loading) return "—";
  const rows = awardCounts(awards);
  if (rows.length === 0) return "None";
  return rows.map((award) => `${award.name}${award.count > 1 ? ` (${award.count})` : ""}`).join(", ");
}

export default function PlayerCompareView({
  left,
  right,
  onSelectLeft,
  onSelectRight,
}) {
  const leftPerson = left?.person || null;
  const rightPerson = right?.person || null;
  const leftGoalie = isGoaliePosition(leftPerson?.position);
  const rightGoalie = isGoaliePosition(rightPerson?.position);
  const mixedPositions = Boolean(leftPerson && rightPerson && leftGoalie !== rightGoalie);
  const sameType = Boolean(leftPerson && rightPerson && leftGoalie === rightGoalie);
  const rows = sameType ? careerCompareRows(leftGoalie) : [];
  const seasonColumns = sameType ? seasonCompareColumns(leftGoalie) : [];
  const seasons = sameType ? mergeNhlSeasons(left?.stats, right?.stats) : [];
  const loading = Boolean(left?.loading || right?.loading);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-start">
        <PlayerCard
          person={leftPerson}
          stats={left?.stats}
          loading={left?.loading}
          onChange={onSelectLeft}
          excludeIds={[rightPerson?.playerId].filter(Boolean)}
          align="left"
        />
        <div className="hidden items-center justify-center self-center text-sm font-bold uppercase tracking-wide text-slate-400 lg:flex">
          vs
        </div>
        <PlayerCard
          person={rightPerson}
          stats={right?.stats}
          loading={right?.loading}
          onChange={onSelectRight}
          excludeIds={[leftPerson?.playerId].filter(Boolean)}
          align="right"
        />
      </div>

      {mixedPositions && (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100">
          These players play different positions. Career numbers stay in each player&apos;s
          own stat set instead of a misleading side-by-side table.
        </p>
      )}

      {leftPerson && rightPerson && (
        <section className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-950">
          <h2 className="mb-3 text-lg font-bold text-slate-950 dark:text-white">Bio</h2>
          <BioRow label="Position" left={leftPerson.position || "-"} right={rightPerson.position || "-"} />
          <BioRow
            label="Team"
            left={<TeamValue team={currentTeamFromStats(left?.stats)} />}
            right={<TeamValue team={currentTeamFromStats(right?.stats)} />}
          />
          <BioRow label="Born" left={leftPerson.birthdate || "-"} right={rightPerson.birthdate || "-"} />
          <BioRow
            label="Nationality"
            left={leftPerson.birthCountry || "-"}
            right={rightPerson.birthCountry || "-"}
          />
          <BioRow label="Height" left={formatHeight(leftPerson)} right={formatHeight(rightPerson)} />
          <BioRow label="Weight" left={formatWeight(leftPerson)} right={formatWeight(rightPerson)} />
          <BioRow
            label={leftGoalie || rightGoalie ? "Hand" : "Shoots"}
            left={`${leftGoalie ? "Catches" : "Shoots"} ${leftPerson.shootsCatches || "-"}`}
            right={`${rightGoalie ? "Catches" : "Shoots"} ${rightPerson.shootsCatches || "-"}`}
          />
          <BioRow
            label="Draft"
            left={<DraftValue person={leftPerson} />}
            right={<DraftValue person={rightPerson} />}
          />
        </section>
      )}

      {sameType && (
        <section className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-950">
          <h2 className="mb-3 text-lg font-bold text-slate-950 dark:text-white">
            Career NHL {leftGoalie ? "Goaltending" : "Scoring"}
          </h2>
          {rows.map((row) => (
            <StatRow
              key={row.key}
              label={row.label}
              left={left?.totals?.[row.key]}
              right={right?.totals?.[row.key]}
              digits={row.digits || 0}
              lowerIsBetter={row.lowerIsBetter}
              loading={loading}
            />
          ))}
        </section>
      )}

      {mixedPositions && (
        <section className="grid gap-3 md:grid-cols-2">
          {[left, right].map((side) => {
            const isGoalie = isGoaliePosition(side.person?.position);
            return (
              <div
                key={side.person.playerId}
                className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-950"
              >
                <h2 className="mb-3 text-lg font-bold text-slate-950 dark:text-white">
                  {side.person.player_name} career
                </h2>
                {careerCompareRows(isGoalie).map((row) => (
                  <div
                    key={row.key}
                    className="flex items-center justify-between border-t border-slate-200 py-2 first:border-t-0 first:pt-0 dark:border-slate-700"
                  >
                    <span className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                      {row.label}
                    </span>
                    <span className="text-lg font-semibold tabular-nums text-slate-900 dark:text-white">
                      {side.loading ? "—" : formatStatValue(side.totals?.[row.key], row.digits || 0)}
                    </span>
                  </div>
                ))}
              </div>
            );
          })}
        </section>
      )}

      {leftPerson && rightPerson && (
        <section className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-950">
          <h2 className="mb-3 text-lg font-bold text-slate-950 dark:text-white">Contract & Awards</h2>
          <BioRow
            label="Cap Hit"
            left={left?.currentContract ? formatCurrency(left.currentContract.cap_hit) : "-"}
            right={right?.currentContract ? formatCurrency(right.currentContract.cap_hit) : "-"}
          />
          <BioRow
            label="Awards"
            left={<AwardsList awards={left?.awards} loading={left?.loading} />}
            right={<AwardsList awards={right?.awards} loading={right?.loading} />}
          />
        </section>
      )}

      {sameType && (
        <section>
          <h2 className="mb-2 text-lg font-bold text-slate-950 dark:text-white">NHL Season by Season</h2>
          {loading ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Loading season stats...</p>
          ) : seasons.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">No NHL seasons to compare.</p>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="min-w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      <th className="px-2 py-2 text-left">Season</th>
                      {seasonColumns.map((column) => (
                        <th key={column.key} className="px-2 py-2 text-center" colSpan={2}>
                          {column.label}
                        </th>
                      ))}
                    </tr>
                    <tr className="border-b border-slate-200 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
                      <th />
                      {seasonColumns.map((column) => (
                        <th key={`${column.key}-names`} className="px-2 py-1" colSpan={2}>
                          <div className="grid grid-cols-2 gap-1">
                            <span className="truncate text-left">{leftPerson.player_name}</span>
                            <span className="truncate text-right">{rightPerson.player_name}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {seasons.map((season) => (
                      <tr
                        key={season.season}
                        className="border-b border-slate-200 odd:bg-white even:bg-slate-50 dark:border-slate-800 dark:odd:bg-slate-950 dark:even:bg-slate-900"
                      >
                        <td className="whitespace-nowrap px-2 py-2 font-semibold">
                          {formatSeason(season.season)}
                        </td>
                        {seasonColumns.map((column) => {
                          const leftValue = seasonCellValue(season.left, column);
                          const rightValue = seasonCellValue(season.right, column);
                          const winner = compareWinner(leftValue, rightValue, {
                            lowerIsBetter: column.lowerIsBetter,
                          });
                          return (
                            <td key={column.key} className="px-2 py-2" colSpan={2}>
                              <div className="grid grid-cols-2 gap-1 tabular-nums">
                                <span className={`text-left ${winnerClass("left", winner)}`}>
                                  {formatStatValue(leftValue, column.digits || 0)}
                                </span>
                                <span className={`text-right ${winnerClass("right", winner)}`}>
                                  {formatStatValue(rightValue, column.digits || 0)}
                                </span>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-3 md:hidden">
                {seasons.map((season) => (
                  <div
                    key={season.season}
                    className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-950"
                  >
                    <p className="mb-2 font-bold">{formatSeason(season.season)}</p>
                    {seasonColumns.map((column) => {
                      const leftValue = seasonCellValue(season.left, column);
                      const rightValue = seasonCellValue(season.right, column);
                      return (
                        <StatRow
                          key={column.key}
                          label={column.label}
                          left={leftValue}
                          right={rightValue}
                          digits={column.digits || 0}
                          lowerIsBetter={column.lowerIsBetter}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}
