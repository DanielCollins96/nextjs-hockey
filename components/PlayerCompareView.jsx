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

function CompareTable({ players, rows, numeric = false, loading = false }) {
  const count = players.length;
  const template = `minmax(5.5rem,7.5rem) repeat(${count}, minmax(7rem,1fr))`;

  return (
    <div className="overflow-x-auto">
      <div className="min-w-max">
        <div
          className="grid items-end gap-2 border-b border-slate-200 pb-2 dark:border-slate-700"
          style={{ gridTemplateColumns: template }}
        >
          <div />
          {players.map((side) => {
            const name = side.person?.player_name || "Player";
            return (
              <div key={side.person.playerId} className="min-w-0 text-center">
                <Link
                  href={playerUrl(name, side.person.playerId)}
                  className="block truncate text-sm font-bold text-slate-950 hover:underline dark:text-white"
                  title={name}
                >
                  {name}
                </Link>
              </div>
            );
          })}
        </div>
        {rows.map((row) => {
          const winners = numeric && !loading
            ? compareWinners(row.values, { lowerIsBetter: row.lowerIsBetter })
            : players.map(() => false);

          return (
            <div
              key={row.label}
              className="grid items-center gap-2 border-t border-slate-200 py-2 first:border-t-0 dark:border-slate-700"
              style={{ gridTemplateColumns: template }}
            >
              <div className="sticky left-0 z-10 bg-white text-xs font-semibold uppercase text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                {row.label}
              </div>
              {row.values.map((value, index) => (
                <div
                  key={`${row.label}-${players[index].person.playerId}`}
                  className={`min-w-0 text-center ${numeric ? `text-lg tabular-nums ${winnerClass(winners[index])}` : "text-sm text-slate-800 dark:text-slate-100"}`}
                >
                  {loading && numeric
                    ? "—"
                    : row.render
                      ? row.render(value, index)
                      : numeric
                        ? formatStatValue(value, row.digits || 0)
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

export default function PlayerCompareView({
  players = [],
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
  const seasons = sameType ? mergeNhlSeasons(selected.map((side) => side.stats)) : [];
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
        <section className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-950">
          <h2 className="mb-3 text-lg font-bold text-slate-950 dark:text-white">Bio</h2>
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
                label: selected.some((side) => isGoaliePosition(side.person.position)) ? "Hand" : "Shoots",
                values: selected.map((side) => (
                  `${isGoaliePosition(side.person.position) ? "Catches" : "Shoots"} ${side.person.shootsCatches || "-"}`
                )),
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
        <section className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-950">
          <h2 className="mb-3 text-lg font-bold text-slate-950 dark:text-white">
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
                      {side.loading ? "—" : formatStatValue(side.totals?.[row.key], row.digits || 0)}
                    </span>
                  </div>
                ))}
              </div>
            );
          })}
        </section>
      )}

      {selected.length >= 2 && (
        <section className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-950">
          <h2 className="mb-3 text-lg font-bold text-slate-950 dark:text-white">Contract & Awards</h2>
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
          <h2 className="mb-2 text-lg font-bold text-slate-950 dark:text-white">NHL Season by Season</h2>
          {loading ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Loading season stats...</p>
          ) : seasons.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">No NHL seasons to compare.</p>
          ) : (
            <div className="space-y-3">
              {seasons.map((season) => (
                <div
                  key={season.season}
                  className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-950"
                >
                  <p className="mb-2 font-bold">{formatSeason(season.season)}</p>
                  <CompareTable
                    players={selected}
                    numeric
                    rows={seasonColumns.map((column) => ({
                      label: column.label,
                      values: season.rows.map((row) => seasonCellValue(row, column)),
                      digits: column.digits || 0,
                      lowerIsBetter: column.lowerIsBetter,
                    }))}
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
