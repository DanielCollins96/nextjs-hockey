import Link from "next/link";
import { gamesForTeam } from "../../lib/forum-boards";

export default function GameThreadLinks({ games, abbreviation }) {
  const teamGames = gamesForTeam(games, abbreviation);
  if (!teamGames.length) return null;

  return (
    <div className="mt-3 flex flex-col gap-1">
      {teamGames.map((game) => {
        const away = game.awayTeam_abbrev || "Away";
        const home = game.homeTeam_abbrev || "Home";
        return (
          <Link
            key={game.id}
            href={`/games/${game.id}#thread`}
            className="text-sm font-medium text-blue-700 hover:underline dark:text-blue-300"
          >
            Game thread · {away} @ {home}
          </Link>
        );
      })}
    </div>
  );
}
