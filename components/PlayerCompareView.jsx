import Link from "next/link";
import { ClickableImage } from "./ImageModal";
import PlayerSearchPicker from "./PlayerSearchPicker";
import { formatCurrency, formatSeason } from "../lib/format";
import {
  awardCounts,
  careerCompareRows,
  compareWinners,
  majorityPosition,
  MAX_COMPARE_PLAYERS,
  mergeNhlSeasons,
  mergeNhlSeasonsByAge,
  playerHeadshotUrl,
  playersMissingAge,
  seasonCellValue,
  seasonCompareColumns,
} from "../lib/player-compare";
import {
  currentTeamFromStats,
  formatDraft,
  formatHeight,
  formatStatValue,
  formatToi,
  formatWeight,
  isGoaliePosition,
} from "../lib/player-stats";
import { playerUrl, teamUrl } from "../lib/routes";

function formatCompareStat(value, row) {
  if (row?.format === "toi") return formatToi(value);
  return formatStatValue(value, row?.digits || 0);
}

function winnerClass(isWinner) {
  if (isWinner) return "font-bold text-emerald-700 dark:text-emerald-300";
  return "text-slate-800 dark:text-slate-100";
}

function PlayerCard({
  person,
  stats,
  loading,
  onChange,
  onRemove,
  canRemove,
  excludeIds,
  preferPosition,
}) {
  if (!person) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 dark:border-slate-600 dark:bg-slate-900">
        <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
          Add a player
        </p>
        <PlayerSearchPicker
          onSelect={onChange}
          excludeIds={excludeIds}
          preferPosition={preferPosition}
          placeholder="Search by name..."
          autoFocus
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
      <div className="flex gap-3">
        <ClickableImage
          src={playerHeadshotUrl(playerId)}
          alt={`${playerName} headshot`}
          containerClassName="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-800"
          className="object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <Link
              href={playerUrl(playerName, playerId)}
              className="text-lg font-bold leading-tight text-slate-950 hover:underline dark:text-white"
            >
              {playerName}
            </Link>
            {canRemove && (
              <button
                type="button"
                onClick={onRemove}
                className="shrink-0 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
              >
                Remove
              </button>
            )}
          </div>
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

function TeamValue({ team }) {
  if (team?.["team.name"] && team?.["team.id"]) {
    return (
      <Link
        href={teamUrl(team["team.name"], team["team.id"])}
        className="break-words leading-snug text-blue-700 hover:underline dark:text-blue-300"
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
    <span className="break-words leading-snug">
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
    </span>
  );
}

function AwardsList({ awards, loading }) {
  if (loading) return "—";
  const rows = awardCounts(awards);
  if (rows.length === 0) return "None";
  return rows.map((award) => `${award.name}${award.count > 1 ? ` (${award.count})` : ""}`).join(", ");
}

function compareTableTemplate(count) {
  return `var(--compare-label) repeat(${count}, var(--compare-player))`;
}

function CompareTable({ players, rows, numeric = false, loading = false }) {
  const count = players.length;
  const compactFit = count <= 2;
  const template = compareTableTemplate(count);

  return (
    <div className={compactFit ? "min-w-0" : "overflow-x-auto"}>
      <div
        className={[
          compactFit ? "min-w-0" : "min-w-max",
          "[--compare-label:minmax(3.4rem,4.4rem)] sm:[--compare-label:minmax(5.25rem,6.5rem)]",
          compactFit
            ? "[--compare-player:minmax(0,1fr)]"
            : "[--compare-player:minmax(4.5rem,1fr)] sm:[--compare-player:minmax(5.75rem,1fr)]",
        ].join(" ")}
      >
        <div
          className="grid items-end gap-x-1 border-b border-slate-200 pb-1.5 sm:gap-x-2 sm:pb-2 dark:border-slate-700"
          style={{ gridTemplateColumns: template }}
        >
          <div />
          {players.map((side) => {
            const name = side.person?.player_name || "Player";
            return (
              <div key={side.person.playerId} className="min-w-0 px-0.5 text-center">
                <Link
                  href={playerUrl(name, side.person.playerId)}
                  className="block text-xs font-bold leading-snug text-balance break-words text-slate-950 hover:underline sm:text-sm dark:text-white"
                >
                  {name}
                </Link>
              </div>
            );
          })}
        </div>
        {rows.map((row) => {
          const rowIsNumeric = row.numeric ?? numeric;
          const winners = rowIsNumeric && !loading
            ? compareWinners(row.values, { lowerIsBetter: row.lowerIsBetter })
            : players.map(() => false);

          return (
            <div
              key={row.label}
              className="grid items-center gap-x-1 border-t border-slate-200 py-1.5 first:border-t-0 sm:gap-x-2 sm:py-2 dark:border-slate-700"
              style={{ gridTemplateColumns: template }}
            >
              <div
                className={`pr-1 text-[10px] font-semibold uppercase leading-tight text-slate-500 sm:text-xs dark:text-slate-400 ${
                  compactFit ? "" : "sticky left-0 z-10 bg-white dark:bg-slate-950"
                }`}
              >
                {row.label}
              </div>
              {row.values.map((value, index) => (
                <div
                  key={`${row.label}-${players[index].person.playerId}`}
                  className={`min-w-0 px-0.5 text-center break-words leading-snug ${
                    rowIsNumeric
                      ? `text-base tabular-nums sm:text-lg ${winnerClass(winners[index])}`
                      : "text-xs text-slate-800 sm:text-sm dark:text-slate-100"
                  }`}
                >
                  {loading && rowIsNumeric
                    ? "—"
                    : row.render
                      ? row.render(value, index)
                      : rowIsNumeric
                        ? formatCompareStat(value, row)
                        : value}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AlignToggle({ align, onAlignChange }) {
  return (
    <div className="inline-flex rounded-md border border-slate-300 p-0.5 dark:border-slate-600" role="group" aria-label="Compare seasons by">
      {[
        { id: "season", label: "By season" },
        { id: "age", label: "By age" },
      ].map((option) => {
        const active = align === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onAlignChange?.(option.id)}
            className={`rounded px-3 py-1 text-sm font-semibold ${
              active
                ? "bg-blue-600 text-white"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
            aria-pressed={active}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export default function PlayerCompareView({
  players = [],
  align = "season",
  onAlignChange,
  onChangePlayer,
  onAddPlayer,
  onRemovePlayer,
}) {
  const selected = players.filter((side) => side?.person);
  const excludeIds = selected.map((side) => side.person.playerId);
  const preferPosition = majorityPosition(selected);
  const canAdd = selected.length < MAX_COMPARE_PLAYERS;
  const showEmptySlot = selected.length === 0 || canAdd;
  const emptySlots = selected.length === 0 ? 2 : 1;
  const goalieFlags = selected.map((side) => isGoaliePosition(side.person.position));
  const mixedPositions = selected.length >= 2 && goalieFlags.some(Boolean) !== goalieFlags.every(Boolean);
  const sameType = selected.length >= 2 && !mixedPositions;
  const allGoalies = sameType && goalieFlags[0];
  const careerRows = sameType ? careerCompareRows(allGoalies) : [];
  const seasonColumns = sameType ? seasonCompareColumns(allGoalies) : [];
  const seasonRows = sameType ? mergeNhlSeasons(selected.map((side) => side.stats)) : [];
  const ageRows = sameType
    ? mergeNhlSeasonsByAge(
      selected.map((side) => side.stats),
      selected.map((side) => side.person?.birthdate || side.person?.birthDate)
    )
    : [];
  const alignedRows = align === "age" ? ageRows : seasonRows;
  const missingAgePlayers = align === "age" ? playersMissingAge(selected, ageRows) : [];
  const loading = selected.some((side) => side.loading);
  const cardCount = selected.length + (showEmptySlot ? emptySlots : 0);

  return (
    <div className="space-y-4">
      <div className={`grid gap-3 ${cardCount >= 3 ? "md:grid-cols-2 xl:grid-cols-4" : "md:grid-cols-2"}`}>
        {selected.map((side, index) => (
          <PlayerCard
            key={side.person.playerId}
            person={side.person}
            stats={side.stats}
            loading={side.loading}
            excludeIds={excludeIds.filter((id) => String(id) !== String(side.person.playerId))}
            preferPosition={preferPosition}
            canRemove={selected.length > 1}
            onChange={(player) => onChangePlayer(index, player)}
            onRemove={() => onRemovePlayer(index)}
          />
        ))}
        {showEmptySlot && Array.from({ length: emptySlots }).map((_, index) => (
          <PlayerCard
            key={`empty-${index}`}
            excludeIds={excludeIds}
            preferPosition={preferPosition}
            onChange={onAddPlayer}
          />
        ))}
      </div>

      {mixedPositions && (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100">
          These players play different positions. Career numbers stay in each player&apos;s
          own stat set instead of a misleading side-by-side table.
        </p>
      )}

      {selected.length >= 2 && (
        <section className="rounded-lg border border-slate-200 bg-white p-2 sm:p-3 dark:border-slate-700 dark:bg-slate-950">
          <h2 className="mb-2 text-lg font-bold text-slate-950 dark:text-white sm:mb-3">Bio</h2>
          <CompareTable
            players={selected}
            rows={[
              { label: "Position", values: selected.map((side) => side.person.position || "-") },
              {
                label: "Team",
                values: selected.map((side) => currentTeamFromStats(side.stats)),
                render: (team) => <TeamValue team={team} />,
              },
              { label: "Born", values: selected.map((side) => side.person.birthdate || "-") },
              { label: "Nationality", values: selected.map((side) => side.person.birthCountry || "-") },
              { label: "Height", values: selected.map((side) => formatHeight(side.person)) },
              { label: "Weight", values: selected.map((side) => formatWeight(side.person)) },
              {
                label: "Shoots / Catches",
                values: selected.map((side) => side.person.shootsCatches || "-"),
              },
              {
                label: "Draft",
                values: selected.map((side) => side.person),
                render: (person) => <DraftValue person={person} />,
              },
            ]}
          />
        </section>
      )}

      {sameType && (
        <section className="rounded-lg border border-slate-200 bg-white p-2 sm:p-3 dark:border-slate-700 dark:bg-slate-950">
          <h2 className="mb-2 text-lg font-bold text-slate-950 dark:text-white sm:mb-3">
            Career NHL {allGoalies ? "Goaltending" : "Scoring"}
          </h2>
          <CompareTable
            players={selected}
            numeric
            loading={loading}
            rows={careerRows.map((row) => ({
              label: row.label,
              values: selected.map((side) => side.totals?.[row.key]),
              digits: row.digits || 0,
              format: row.format,
              lowerIsBetter: row.lowerIsBetter,
            }))}
          />
        </section>
      )}

      {mixedPositions && (
        <section className={`grid gap-3 ${selected.length > 2 ? "md:grid-cols-2 xl:grid-cols-4" : "md:grid-cols-2"}`}>
          {selected.map((side) => {
            const isGoalie = isGoaliePosition(side.person.position);
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
                      {side.loading ? "—" : formatCompareStat(side.totals?.[row.key], row)}
                    </span>
                  </div>
                ))}
              </div>
            );
          })}
        </section>
      )}

      {selected.length >= 2 && (
        <section className="rounded-lg border border-slate-200 bg-white p-2 sm:p-3 dark:border-slate-700 dark:bg-slate-950">
          <h2 className="mb-2 text-lg font-bold text-slate-950 dark:text-white sm:mb-3">Contract & Awards</h2>
          <CompareTable
            players={selected}
            rows={[
              {
                label: "Cap Hit",
                values: selected.map((side) => (
                  side.currentContract ? formatCurrency(side.currentContract.cap_hit) : "-"
                )),
              },
              {
                label: "Awards",
                values: selected.map((side) => side),
                render: (side) => (
                  <span className="line-clamp-3">
                    <AwardsList awards={side.awards} loading={side.loading} />
                  </span>
                ),
              },
            ]}
          />
        </section>
      )}

      {sameType && (
        <section>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">
              {align === "age" ? "NHL Seasons by Age" : "NHL Season by Season"}
            </h2>
            <AlignToggle align={align} onAlignChange={onAlignChange} />
          </div>
          {align === "age" && missingAgePlayers.length > 0 && (
            <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
              Age is unavailable for {missingAgePlayers.map((side) => side.person.player_name).join(", ")}; their columns stay blank in this view.
            </p>
          )}
          {loading ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Loading season stats...</p>
          ) : alignedRows.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {align === "age"
                ? "No age-aligned NHL seasons to compare. Birthdate or season age is missing."
                : "No NHL seasons to compare."}
            </p>
          ) : (
            <div className="space-y-3">
              {alignedRows.map((entry) => (
                <div
                  key={align === "age" ? `age-${entry.age}` : entry.season}
                  className="rounded-lg border border-slate-200 bg-white p-2 sm:p-3 dark:border-slate-700 dark:bg-slate-950"
                >
                  <p className="mb-1.5 font-bold sm:mb-2">
                    {align === "age" ? entry.label : formatSeason(entry.season)}
                  </p>
                  <CompareTable
                    players={selected}
                    rows={[
                      ...(align === "age"
                        ? [{
                          label: "Season",
                          values: entry.rows.map((row) => (row ? formatSeason(row.season) : "-")),
                        }]
                        : []),
                      ...seasonColumns.map((column) => ({
                        label: column.label,
                        values: entry.rows.map((row) => seasonCellValue(row, column)),
                        digits: column.digits || 0,
                        format: column.format,
                        lowerIsBetter: column.lowerIsBetter,
                        numeric: true,
                      })),
                    ]}
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
