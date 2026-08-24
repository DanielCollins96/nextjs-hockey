import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { API, graphqlOperation } from "aws-amplify";
import { FaChevronLeft, FaChevronRight, FaRegCommentDots } from "react-icons/fa";
import { UseAuth } from "../contexts/Auth";
import * as queries from "../src/graphql/queries";
import { teamUrl } from "../lib/routes";

function formatDate(dateString) {
  const date = new Date(dateString + "T12:00:00");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDateForDisplay(dateString) {
  const date = new Date(dateString + "T12:00:00");
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getGameStatus(game) {
  const state = game.gameState;

  if (state === "FINAL" || state === "OFF") {
    const periodType = game.gameOutcome_lastPeriodType;
    if (periodType === "OT") return "FINAL/OT";
    if (periodType === "SO") return "FINAL/SO";
    return "FINAL";
  }

  if (state === "LIVE" || state === "CRIT") {
    return "LIVE";
  }

  if (state === "FUT" || state === "PRE") {
    const startTime = new Date(game.startTimeUTC);
    return startTime.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZoneName: "short"
    });
  }

  return state;
}

function GameCard({ game, showCommentMeta = false, commentCount = 0 }) {
  const router = useRouter();
  const gamePath = `/games/${game.id}`;
  const status = getGameStatus(game);
  const isLive = game.gameState === "LIVE" || game.gameState === "CRIT";
  const isScheduled = game.gameState === "FUT" || game.gameState === "PRE";

  const awayTeamLink = game.awayTeam_dbId ? teamUrl(game.awayTeam_abbrev, game.awayTeam_dbId) : null;
  const homeTeamLink = game.homeTeam_dbId ? teamUrl(game.homeTeam_abbrev, game.homeTeam_dbId) : null;

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => router.push(gamePath)}
      onFocus={() => router.prefetch(gamePath)}
      onMouseEnter={() => router.prefetch(gamePath)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          router.push(gamePath);
        }
      }}
      className="flex-shrink-0 w-32 sm:w-40 cursor-pointer bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 px-2 py-1 sm:px-3 sm:py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
    >
      <div className={`text-[10px] sm:text-xs font-semibold mb-1 ${isLive ? "text-red-500" : "text-gray-500 dark:text-gray-400"} ${showCommentMeta ? "flex items-center justify-between" : ""}`}>
        <span>{status}</span>
        {showCommentMeta && (
          <button
            type="button"
            className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
            title="Open game thread"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              router.push(`${gamePath}#thread`);
            }}
          >
            <FaRegCommentDots className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            {commentCount}
          </button>
        )}
      </div>

      {/* Away Team */}
      <div className="flex items-center justify-between mb-0.5">
        {awayTeamLink ? (
          <Link
            href={awayTeamLink}
            className="flex items-center gap-1 sm:gap-2 hover:opacity-70"
            onClick={(event) => event.stopPropagation()}
          >
            <TeamLogo logo={game.awayTeam_darkLogo} abbrev={game.awayTeam_abbrev} />
            <span className="text-sm sm:text-base font-medium dark:text-white">{game.awayTeam_abbrev}</span>
          </Link>
        ) : (
          <span className="flex items-center gap-1 sm:gap-2">
            <TeamLogo logo={game.awayTeam_darkLogo} abbrev={game.awayTeam_abbrev} />
            <span className="text-sm sm:text-base font-medium dark:text-white">{game.awayTeam_abbrev}</span>
          </span>
        )}
        <span className={`font-bold text-sm sm:text-lg ${!isScheduled ? "dark:text-white" : "text-gray-400 dark:text-gray-500"}`}>
          {!isScheduled ? game.awayTeam_score : ""}
        </span>
      </div>

      {/* Home Team */}
      <div className="flex items-center justify-between">
        {homeTeamLink ? (
          <Link
            href={homeTeamLink}
            className="flex items-center gap-1 sm:gap-2 hover:opacity-70"
            onClick={(event) => event.stopPropagation()}
          >
            <TeamLogo logo={game.homeTeam_darkLogo} abbrev={game.homeTeam_abbrev} />
            <span className="text-sm sm:text-base font-medium dark:text-white">{game.homeTeam_abbrev}</span>
          </Link>
        ) : (
          <span className="flex items-center gap-1 sm:gap-2">
            <TeamLogo logo={game.homeTeam_darkLogo} abbrev={game.homeTeam_abbrev} />
            <span className="text-sm sm:text-base font-medium dark:text-white">{game.homeTeam_abbrev}</span>
          </span>
        )}
        <span className={`font-bold text-sm sm:text-lg ${!isScheduled ? "dark:text-white" : "text-gray-400 dark:text-gray-500"}`}>
          {!isScheduled ? game.homeTeam_score : ""}
        </span>
      </div>
    </div>
  );
}

function TeamLogo({ logo, abbrev }) {
  return (
    <span className="w-5 h-5 sm:w-6 sm:h-6 relative">
      <Image
        src={logo || `https://assets.nhle.com/logos/nhl/svg/${abbrev}_dark.svg`}
        alt={abbrev}
        fill
        className="object-contain"
        unoptimized
      />
    </span>
  );
}

export default function GamesBanner() {
  const { user } = UseAuth();
  const [games, setGames] = useState([]);
  const [selectedDate, setSelectedDate] = useState(getLocalDateString());
  const [loading, setLoading] = useState(true);
  const [commentCounts, setCommentCounts] = useState({});
  const [isBannerHovered, setIsBannerHovered] = useState(false);
  const [keepBannerExpanded, setKeepBannerExpanded] = useState(false);
  const [isDatePickerFocused, setIsDatePickerFocused] = useState(false);
  const scrollContainerRef = useRef(null);
  const dateInputRef = useRef(null);

  useEffect(() => {
    async function fetchGames() {
      setLoading(true);
      setGames([]);
      try {
        const res = await fetch(`/api/games?date=${selectedDate}`);
        const data = await res.json();
        setGames(data.games || []);
      } catch (error) {
        console.error("Error fetching games:", error);
        setGames([]);
      }
      setLoading(false);
    }
    fetchGames();
  }, [selectedDate]);

  useEffect(() => {
    async function fetchCommentCounts() {
      if (!user?.username || !games.length) {
        setCommentCounts({});
        return;
      }

      try {
        const response = await API.graphql(
          graphqlOperation(queries.listPosts, {
            limit: 1000,
            filter: {
              subject: {
                beginsWith: "THREAD#GAME#",
              },
            },
          })
        );

        const posts = response?.data?.listPosts?.items || [];
        const gameIds = new Set(games.map((game) => String(game.id)));
        const counts = {};

        posts.forEach((post) => {
          if (post?._deleted) return;
          const subject = String(post?.subject || "");
          const parts = subject.split("#");
          const gameId = parts[2];

          if (!gameId || !gameIds.has(String(gameId))) return;
          counts[gameId] = (counts[gameId] || 0) + 1;
        });

        setCommentCounts(counts);
      } catch (error) {
        console.error("Error fetching thread comment counts:", error);
        setCommentCounts({});
      }
    }

    fetchCommentCounts();
  }, [games, user?.username]);

  useEffect(() => {
    if (games.length > 0) {
      setKeepBannerExpanded(true);
    }
  }, [games.length]);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const changeDate = (days) => {
    const date = new Date(selectedDate + "T12:00:00");
    date.setDate(date.getDate() + days);
    setSelectedDate(getLocalDateString(date));
  };

  return (
    <div
      className="bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 w-full max-w-none overflow-hidden"
      onMouseEnter={() => setIsBannerHovered(true)}
      onMouseLeave={() => {
        setIsBannerHovered(false);
        if (!isDatePickerFocused) {
          setKeepBannerExpanded(false);
        }
      }}
    >
      <div className={`flex ${games.length > 0 || (keepBannerExpanded && (isBannerHovered || isDatePickerFocused)) ? "h-[88px] min-h-[88px]" : "h-10 min-h-10"} items-center transition-[height] duration-150 ease-out`}>
        {/* Date selector */}
        <div className="flex-shrink-0 flex items-center self-stretch border-r border-gray-200 dark:border-gray-700 px-1 sm:px-2 bg-white dark:bg-gray-800">
          <button
            onClick={() => changeDate(-1)}
            className="p-0.5 sm:p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            aria-label="Previous day"
          >
            <FaChevronLeft className="w-2.5 h-2.5 sm:w-3 sm:h-3 dark:text-white" />
          </button>
          <label className="relative flex min-w-24 flex-col items-center px-1 sm:min-w-32 sm:px-2">
            <span className="text-[10px] uppercase text-gray-500 dark:text-gray-400">
              {formatDateForDisplay(selectedDate).split(",")[0]}
            </span>
            <span className="text-xs font-bold dark:text-white sm:text-base">{formatDate(selectedDate)}</span>
            <input
              ref={dateInputRef}
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              onClick={(event) => event.currentTarget.showPicker?.()}
              onFocus={() => setIsDatePickerFocused(true)}
              onBlur={() => {
                setIsDatePickerFocused(false);
                setKeepBannerExpanded(false);
              }}
              aria-label="Select date"
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
          </label>
          <button
            onClick={() => changeDate(1)}
            className="p-0.5 sm:p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            aria-label="Next day"
          >
            <FaChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 dark:text-white" />
          </button>
        </div>

        {/* Games scroll area */}
        {games.length > 0 ? (
          <div className="relative flex-1 min-w-0 overflow-hidden">
            {/* Left scroll button */}
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-0 bottom-0 z-10 bg-gradient-to-r from-gray-100 dark:from-gray-900 to-transparent px-2 hover:from-gray-200 dark:hover:from-gray-800"
              aria-label="Scroll left"
            >
              <FaChevronLeft className="w-4 h-4 dark:text-white" />
            </button>

            {/* Scrollable games container */}
            <div
              ref={scrollContainerRef}
              className="flex overflow-x-scroll scroll-smooth pl-8 sm:pl-10"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
            >
              <style jsx>{`div::-webkit-scrollbar { display: none; }`}</style>
              {games.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  showCommentMeta={!!user?.username}
                  commentCount={commentCounts[String(game.id)] || 0}
                />
              ))}
            </div>

            {/* Right scroll button */}
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-0 bottom-0 z-10 bg-gradient-to-l from-gray-100 dark:from-gray-900 to-transparent px-2 hover:from-gray-200 dark:hover:from-gray-800"
              aria-label="Scroll right"
            >
              <FaChevronRight className="w-4 h-4 dark:text-white" />
            </button>
          </div>
        ) : (
          <div className="flex h-full flex-1 items-center justify-center border-l border-gray-200 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400" aria-label="No games scheduled">
            {loading ? "Loading..." : "No games scheduled"}
          </div>
        )}
      </div>
    </div>
  );
}
