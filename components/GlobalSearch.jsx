import Image from "next/image";
import {useRouter} from "next/router";
import {useEffect, useMemo, useRef, useState} from "react";
import {FaSearch} from "react-icons/fa";

export default function GlobalSearch({compact = false, className = "", onNavigate}) {
  const router = useRouter();
  const wrapperRef = useRef(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({players: [], teams: []});
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const trimmedQuery = query.trim();
  const hasResults = results.teams.length > 0 || results.players.length > 0;

  useEffect(() => {
    const handleRouteChange = () => {
      setOpen(false);
      onNavigate?.();
    };

    router.events.on("routeChangeStart", handleRouteChange);
    return () => router.events.off("routeChangeStart", handleRouteChange);
  }, [onNavigate, router.events]);

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
      setResults({players: [], teams: []});
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(trimmedQuery)}&limit=5`,
          {signal: controller.signal}
        );
        if (!response.ok) throw new Error("Search failed");
        const payload = await response.json();
        setResults({
          players: payload?.players || [],
          teams: payload?.teams || [],
        });
        setOpen(true);
      } catch (error) {
        if (error.name !== "AbortError") {
          setResults({players: [], teams: []});
        }
      } finally {
        setLoading(false);
      }
    }, 220);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [trimmedQuery]);

  const searchPath = useMemo(() => {
    if (!trimmedQuery) return "/search";
    return `/search?q=${encodeURIComponent(trimmedQuery)}`;
  }, [trimmedQuery]);

  const submitSearch = (event) => {
    event.preventDefault();
    if (!trimmedQuery) return;
    setOpen(false);
    router.push(searchPath);
  };

  const navigateToResult = (href) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <div ref={wrapperRef} className={`relative ${compact ? "w-full" : "w-full max-w-md"} ${className}`}>
      <form onSubmit={submitSearch} className="relative">
        <FaSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => {
            if (trimmedQuery.length >= 2) setOpen(true);
          }}
          placeholder="Search players or teams"
          className="h-10 w-full rounded-md border border-gray-300 bg-white pl-9 pr-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
          aria-label="Search players or teams"
        />
      </form>

      {open && trimmedQuery.length >= 2 && (
        <div className="absolute left-0 right-0 top-12 z-[70] overflow-hidden rounded-md border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900">
          {loading && !hasResults ? (
            <p className="px-3 py-3 text-sm text-gray-500 dark:text-gray-400">
              Searching...
            </p>
          ) : hasResults ? (
            <div className="max-h-96 overflow-y-auto py-2">
              {results.teams.length > 0 && (
                <SearchGroup title="Teams">
                  {results.teams.map((team) => (
                    <SearchResultButton
                      key={`team-${team.id}`}
                      onClick={() => navigateToResult(team.href)}
                    >
                      <span className="relative h-7 w-7 flex-shrink-0">
                        {team.logo ? (
                          <Image
                            src={team.logo}
                            alt={team.abbreviation || team.name}
                            fill
                            className="object-contain"
                            unoptimized
                          />
                        ) : null}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-gray-900 dark:text-white">
                          {team.name}
                        </span>
                        <span className="block text-xs text-gray-500 dark:text-gray-400">
                          {team.abbreviation}
                        </span>
                      </span>
                    </SearchResultButton>
                  ))}
                </SearchGroup>
              )}

              {results.players.length > 0 && (
                <SearchGroup title="Players">
                  {results.players.map((player) => (
                    <SearchResultButton
                      key={`player-${player.id}`}
                      onClick={() => navigateToResult(player.href)}
                    >
                      <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-200">
                        {player.position || "P"}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-gray-900 dark:text-white">
                          {player.name}
                        </span>
                        <span className="block truncate text-xs text-gray-500 dark:text-gray-400">
                          {player.teamName || "NHL player"}
                        </span>
                      </span>
                    </SearchResultButton>
                  ))}
                </SearchGroup>
              )}

              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  router.push(searchPath);
                }}
                className="mt-1 block w-full border-t border-gray-100 px-3 py-2 text-left text-sm font-medium text-blue-600 hover:bg-blue-50 dark:border-gray-800 dark:text-blue-400 dark:hover:bg-gray-800"
              >
                View all results for &ldquo;{trimmedQuery}&rdquo;
              </button>
            </div>
          ) : (
            <p className="px-3 py-3 text-sm text-gray-500 dark:text-gray-400">
              No matches found
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function SearchGroup({title, children}) {
  return (
    <div className="py-1">
      <p className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {title}
      </p>
      <div>{children}</div>
    </div>
  );
}

function SearchResultButton({children, onClick}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
    >
      {children}
    </button>
  );
}
