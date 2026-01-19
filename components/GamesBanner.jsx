import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

function formatDate(dateString) {
  const date = new Date(dateString + "T12:00:00");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDateForDisplay(dateString) {
  const date = new Date(dateString + "T12:00:00");
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
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
      hour12: true
    });
  }

  return state;
}

function GameCard({ game }) {
  const status = getGameStatus(game);
  const isLive = game.gameState === "LIVE" || game.gameState === "CRIT";
  const isScheduled = game.gameState === "FUT" || game.gameState === "PRE";

  const awayTeamLink = game.awayTeam_dbId ? `/teams/${game.awayTeam_dbId}` : null;
  const homeTeamLink = game.homeTeam_dbId ? `/teams/${game.homeTeam_dbId}` : null;

  return (
    <div className="flex-shrink-0 w-32 sm:w-40 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 px-2 py-1 sm:px-3 sm:py-2">
      <div className={`text-[10px] sm:text-xs font-semibold mb-1 ${isLive ? "text-red-500" : "text-gray-500 dark:text-gray-400"}`}>
        {status}
      </div>

      {/* Away Team */}
      <div className="flex items-center justify-between mb-0.5">
        <Link
          href={awayTeamLink || "#"}
          className={`flex items-center gap-1 sm:gap-2 ${awayTeamLink ? "hover:opacity-70" : ""}`}
        >
          <div className="w-5 h-5 sm:w-6 sm:h-6 relative">
            <Image
              src={game.awayTeam_darkLogo || `https://assets.nhle.com/logos/nhl/svg/${game.awayTeam_abbrev}_dark.svg`}
              alt={game.awayTeam_abbrev}
              fill
              className="object-contain"
              unoptimized
            />
          </div>
          <span className="text-sm sm:text-base font-medium dark:text-white">{game.awayTeam_abbrev}</span>
        </Link>
        <span className={`font-bold text-sm sm:text-lg ${!isScheduled ? "dark:text-white" : "text-gray-400 dark:text-gray-500"}`}>
          {!isScheduled ? game.awayTeam_score : ""}
        </span>
      </div>

      {/* Home Team */}
      <div className="flex items-center justify-between">
        <Link
          href={homeTeamLink || "#"}
          className={`flex items-center gap-1 sm:gap-2 ${homeTeamLink ? "hover:opacity-70" : ""}`}
        >
          <div className="w-5 h-5 sm:w-6 sm:h-6 relative">
            <Image
              src={game.homeTeam_darkLogo || `https://assets.nhle.com/logos/nhl/svg/${game.homeTeam_abbrev}_dark.svg`}
              alt={game.homeTeam_abbrev}
              fill
              className="object-contain"
              unoptimized
            />
          </div>
          <span className="text-sm sm:text-base font-medium dark:text-white">{game.homeTeam_abbrev}</span>
        </Link>
        <span className={`font-bold text-sm sm:text-lg ${!isScheduled ? "dark:text-white" : "text-gray-400 dark:text-gray-500"}`}>
          {!isScheduled ? game.homeTeam_score : ""}
        </span>
      </div>
    </div>
  );
}

export default function GamesBanner() {
  const [games, setGames] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    async function fetchGames() {
      setLoading(true);
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
    setSelectedDate(date.toISOString().split("T")[0]);
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 w-screen max-w-[100vw] overflow-hidden">
      <div className="flex items-center">
        {/* Date selector */}
        <div className="flex-shrink-0 flex items-center self-stretch border-r border-gray-200 dark:border-gray-700 px-1 sm:px-2 bg-white dark:bg-gray-800">
          <button
            onClick={() => changeDate(-1)}
            className="p-0.5 sm:p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            aria-label="Previous day"
          >
            <FaChevronLeft className="w-2.5 h-2.5 sm:w-3 sm:h-3 dark:text-white" />
          </button>
          <div className="text-center px-1 sm:px-2 min-w-14 sm:min-w-20">
            <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 uppercase">
              {formatDateForDisplay(selectedDate).split(",")[0]}
            </div>
            <div className="text-xs sm:text-base font-bold dark:text-white">{formatDate(selectedDate)}</div>
          </div>
          <button
            onClick={() => changeDate(1)}
            className="p-0.5 sm:p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            aria-label="Next day"
          >
            <FaChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 dark:text-white" />
          </button>
        </div>

        {/* Games scroll area */}
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
            {loading ? (
              <div className="flex items-center justify-center w-full py-8">
                <span className="text-gray-500 dark:text-gray-400">Loading...</span>
              </div>
            ) : games.length === 0 ? (
              <div className="flex items-center justify-center w-full py-8">
                <span className="text-gray-500 dark:text-gray-400">No games scheduled</span>
              </div>
            ) : (
              games.map((game) => <GameCard key={game.id} game={game} />)
            )}
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
      </div>
    </div>
  );
}
