import { useEffect, useId, useRef, useState } from "react";
import { sortSearchPlayers } from "../lib/player-compare";

export default function PlayerSearchPicker({
  onSelect,
  excludeIds = [],
  preferPosition = "",
  placeholder = "Search players by name...",
  autoFocus = false,
  className = "",
  buttonLabel = "Select",
}) {
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const inputId = useId();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const trimmedQuery = query.trim();
  const excludeKey = (excludeIds || []).map(String).join(",");

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (trimmedQuery.length < 2) {
      setResults([]);
      setLoading(false);
      setActiveIndex(0);
      return undefined;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(trimmedQuery)}&limit=8`,
          { signal: controller.signal }
        );
        if (!response.ok) throw new Error("Search failed");
        const payload = await response.json();
        const players = sortSearchPlayers(payload?.players || [], {
          excludeIds: excludeKey ? excludeKey.split(",") : [],
          preferPosition,
        });
        setResults(players);
        setActiveIndex(0);
        setOpen(true);
      } catch (error) {
        if (error.name !== "AbortError") {
          setResults([]);
        }
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [excludeKey, preferPosition, trimmedQuery]);

  const choosePlayer = (player) => {
    if (!player) return;
    setQuery("");
    setResults([]);
    setOpen(false);
    onSelect?.(player);
  };

  const handleKeyDown = (event) => {
    if (!open || results.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      choosePlayer(results[activeIndex]);
    }
  };

  const playerSummary = (player) => {
    const games = player.games ?? "-";
    if (player.position === "G") {
      return `GP ${games} | W ${player.wins ?? 0} | L ${player.losses ?? 0}`;
    }
    return `GP ${games} | G ${player.goals ?? 0} | A ${player.assists ?? 0} | P ${player.points ?? 0}`;
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <label className="sr-only" htmlFor={inputId}>
        {placeholder}
      </label>
      <input
        id={inputId}
        ref={inputRef}
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => {
          if (trimmedQuery.length >= 2) setOpen(true);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
      />

      {open && trimmedQuery.length >= 2 && (
        <div className="absolute left-0 right-0 top-11 z-30 overflow-hidden rounded-md border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
          {loading && results.length === 0 ? (
            <p className="px-3 py-3 text-sm text-slate-500 dark:text-slate-400">Searching...</p>
          ) : results.length > 0 ? (
            <ul className="max-h-80 overflow-y-auto py-1" role="listbox">
              {results.map((player, index) => {
                const samePosition =
                  preferPosition &&
                  String(player.position || "").toUpperCase() === String(preferPosition).toUpperCase();

                return (
                  <li key={player.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={index === activeIndex}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => choosePlayer(player)}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm ${
                        index === activeIndex
                          ? "bg-slate-100 dark:bg-slate-800"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-200">
                        {player.position || "P"}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium text-slate-900 dark:text-white">
                          {player.name}
                        </span>
                        <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                          {player.teamName || "NHL player"}
                          {samePosition ? " · same position" : ""}
                        </span>
                        <span className="block truncate text-xs tabular-nums text-slate-500 dark:text-slate-400">
                          {playerSummary(player)}
                        </span>
                      </span>
                      <span className="flex-shrink-0 text-xs font-semibold text-blue-700 dark:text-blue-300">
                        {buttonLabel}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="px-3 py-3 text-sm text-slate-500 dark:text-slate-400">No players found</p>
          )}
        </div>
      )}
    </div>
  );
}
