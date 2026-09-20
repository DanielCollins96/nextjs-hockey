import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { playerHeadshotUrl } from "../lib/player-compare";
import { comparePlayersUrl, playerUrl } from "../lib/routes";

export function useSimilarPlayers(playerId, { limit = 6, excludeIds = [] } = {}) {
  const [state, setState] = useState({
    loading: Boolean(playerId),
    players: [],
    source: null,
    group: null,
  });
  const excludeKey = (excludeIds || []).map(String).filter(Boolean).join(",");

  useEffect(() => {
    if (!playerId) {
      setState({ loading: false, players: [], source: null, group: null });
      return undefined;
    }

    const controller = new AbortController();
    setState({ loading: true, players: [], source: null, group: null });
    const params = new URLSearchParams({ limit: String(limit) });
    if (excludeKey) params.set("exclude", excludeKey);

    fetch(`/api/players/similar/${encodeURIComponent(playerId)}?${params}`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Similar players request failed");
        }
        return response.json();
      })
      .then((payload) => {
        if (controller.signal.aborted) return;
        if (!payload) {
          throw new Error("Similar players request failed");
        }
        setState({
          loading: false,
          players: Array.isArray(payload.players) ? payload.players : [],
          source: payload.source || null,
          group: payload.group || null,
        });
      })
      .catch((error) => {
        if (error.name === "AbortError" || controller.signal.aborted) return;
        setState({ loading: false, players: [], source: null, group: null });
      });

    return () => controller.abort();
  }, [excludeKey, limit, playerId]);

  return state;
}

function similarityLabel(player) {
  const reasons = Array.isArray(player.reasons) ? player.reasons.filter(Boolean) : [];
  if (reasons.length === 0) return `${player.similarity}% match`;
  return `${player.similarity}% · ${reasons.join(", ")}`;
}

function playerSummary(player) {
  if (String(player.position || "").toUpperCase() === "G") {
    return `GP ${player.games ?? "-"} · W ${player.wins ?? 0}`;
  }
  return `GP ${player.games ?? "-"} · P ${player.points ?? 0}`;
}

function Headshot({ id, name, sizeClassName }) {
  return (
    <span className={`relative block shrink-0 overflow-hidden rounded-full border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 ${sizeClassName}`}>
      <Image
        src={playerHeadshotUrl(id)}
        alt={`${name} headshot`}
        fill
        className="object-cover"
        unoptimized
      />
    </span>
  );
}

export default function SimilarPlayers({
  playerId,
  playerName,
  excludeIds = [],
  limit = 6,
  onSelect,
  actionLabel = "Compare",
  variant = "cards",
  heading,
  className = "",
}) {
  const { loading, players, source } = useSimilarPlayers(playerId, { limit, excludeIds });

  if (!playerId) return null;
  if (!loading && (source === "none" || players.length === 0)) return null;

  const title = heading || (playerName ? `Similar to ${playerName}` : "Similar player profiles");
  const selectable = typeof onSelect === "function";

  return (
    <section className={`rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-950 ${className}`}>
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-bold text-slate-950 dark:text-white sm:text-base">
          {title}
        </h2>
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
          Career profile match
        </p>
      </div>
      {loading && players.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">Finding similar players...</p>
      ) : variant === "chips" ? (
        <ul className="flex gap-2 overflow-x-auto pb-1">
          {players.map((player) => {
            const content = (
              <>
                <Headshot id={player.id} name={player.name} sizeClassName="h-8 w-8" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-slate-900 dark:text-white">
                    {player.name}
                  </span>
                  <span className="block text-[11px] tabular-nums text-slate-500 dark:text-slate-400">
                    {similarityLabel(player)}
                  </span>
                </span>
              </>
            );
            const chipClassName =
              "flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 py-1 pl-1 pr-3 text-left hover:border-blue-400 hover:bg-blue-50 dark:border-slate-600 dark:bg-slate-900 dark:hover:border-blue-500 dark:hover:bg-slate-800";

            return (
              <li key={player.id} className="shrink-0">
                {selectable ? (
                  <button type="button" onClick={() => onSelect(player)} className={chipClassName}>
                    {content}
                  </button>
                ) : (
                  <Link href={player.href || playerUrl(player.name, player.id)} className={chipClassName}>
                    {content}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {players.map((player) => (
            <li
              key={player.id}
              className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-900"
            >
              <Headshot id={player.id} name={player.name} sizeClassName="h-12 w-12" />
              <div className="min-w-0 flex-1">
                <Link
                  href={player.href || playerUrl(player.name, player.id)}
                  className="block truncate font-semibold text-slate-950 hover:underline dark:text-white"
                >
                  {player.name}
                </Link>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {player.position || "NHL"}
                  {player.teamName ? ` · ${player.teamName}` : ""}
                </p>
                <p className="truncate text-xs tabular-nums text-slate-500 dark:text-slate-400">
                  {similarityLabel(player)} · {playerSummary(player)}
                </p>
              </div>
              {selectable ? (
                <button
                  type="button"
                  onClick={() => onSelect(player)}
                  className="shrink-0 rounded-md bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  {actionLabel}
                </button>
              ) : (
                <Link
                  href={
                    playerName && playerId
                      ? comparePlayersUrl(playerName, playerId, player.name, player.id)
                      : player.href || playerUrl(player.name, player.id)
                  }
                  className="shrink-0 rounded-md bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  {actionLabel}
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
