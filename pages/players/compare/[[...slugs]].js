import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import PlayerCompareView from "../../../components/PlayerCompareView";
import SEO from "../../../components/SEO";
import { PAGE_CACHE, setPageCache } from "../../../lib/http-cache";
import {
  canonicalComparePath,
  compareQueryIds,
  MAX_COMPARE_PLAYERS,
  normalizeCompareSlugs,
  samePlayerRedirect,
  uniquePlayerIds,
} from "../../../lib/player-compare";
import { loadPlayerProfile } from "../../../lib/player-data";
import { careerTotals, isGoaliePosition } from "../../../lib/player-stats";
import { comparePlayersUrl, playerUrl } from "../../../lib/routes";
import { usePlayerDetails } from "../../../lib/usePlayerDetails";

function buildSide(person, details) {
  const resolved = details.person || person;
  if (!resolved) return null;
  const isGoalie = isGoaliePosition(resolved.position);
  return {
    person: resolved,
    stats: details.stats,
    awards: details.awards,
    contracts: details.contracts,
    currentContract: details.currentContract,
    loading: details.loading,
    totals: careerTotals(details.stats, isGoalie),
  };
}

function toPlayerRef(player) {
  if (!player) return null;
  return {
    name: player.name || player.player_name,
    id: player.id || player.playerId,
  };
}

export default function PlayerComparePage({ people, ids, canonicalPath }) {
  const router = useRouter();
  const slot0 = usePlayerDetails(ids[0] || null, people[0] || null);
  const slot1 = usePlayerDetails(ids[1] || null, people[1] || null);
  const slot2 = usePlayerDetails(ids[2] || null, people[2] || null);
  const slot3 = usePlayerDetails(ids[3] || null, people[3] || null);

  const players = useMemo(
    () => [slot0, slot1, slot2, slot3]
      .map((details, index) => buildSide(people[index] || null, details))
      .filter(Boolean),
    [people, slot0, slot1, slot2, slot3]
  );

  const names = players.map((side) => side.person.player_name || "Player");
  const titleNames = names.join(" vs ");
  const hasMatchup = players.length >= 2;

  const goToPlayers = (nextPlayers) => {
    const refs = nextPlayers.map(toPlayerRef).filter(Boolean);
    router.push(comparePlayersUrl(refs));
  };

  return (
    <div className="bg-white text-slate-950 dark:bg-gray-900 dark:text-slate-100">
      <SEO
        title={
          hasMatchup
            ? `${titleNames} Comparison`
            : players[0]
              ? `Compare ${names[0]}`
              : "Compare NHL Players"
        }
        description={
          hasMatchup
            ? `Side-by-side NHL comparison of ${titleNames}, including bio, career totals, and season stats.`
            : "Search two to four NHL players and compare bio, career totals, and season statistics."
        }
        path={canonicalPath}
      />

      <main className="mx-auto max-w-7xl px-2 py-3 sm:px-3">
        <div className="mb-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            <Link href="/players" className="text-blue-700 hover:underline dark:text-blue-300">
              Players
            </Link>
            {players[0] && (
              <>
                <span className="px-1.5">/</span>
                <Link
                  href={playerUrl(players[0].person.player_name, players[0].person.playerId)}
                  className="text-blue-700 hover:underline dark:text-blue-300"
                >
                  {names[0]}
                </Link>
              </>
            )}
            <span className="px-1.5">/</span>
            Compare
          </p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
            {hasMatchup ? titleNames : "Compare Players"}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-600 dark:text-slate-400">
            <p>
              Search up to {MAX_COMPARE_PLAYERS} players, then share this page URL to keep the matchup.
            </p>
            {hasMatchup && (
              <button
                type="button"
                onClick={() => goToPlayers([...players].reverse())}
                className="font-semibold text-blue-700 hover:underline dark:text-blue-300"
              >
                Reverse order
              </button>
            )}
          </div>
        </div>

        <PlayerCompareView
          players={players}
          onChangePlayer={(index, player) => {
            const next = players.map((side) => side.person);
            next[index] = player;
            goToPlayers(next);
          }}
          onAddPlayer={(player) => goToPlayers([...players.map((side) => side.person), player])}
          onRemovePlayer={(index) => {
            goToPlayers(players.filter((_, playerIndex) => playerIndex !== index).map((side) => side.person));
          }}
        />
      </main>
    </div>
  );
}

async function loadComparePerson(id) {
  if (!id) return null;
  const payload = await loadPlayerProfile(id);
  if (payload?.notFound) return null;
  return payload?.player?.[0] || null;
}

export async function getServerSideProps({ params, query, res }) {
  const slugs = normalizeCompareSlugs(params.slugs);
  const ids = uniquePlayerIds([
    ...slugs.map((item) => item.id),
    ...compareQueryIds(query),
  ]);

  if (slugs.length >= 2 && ids.length === 1) {
    const person = await loadComparePerson(ids[0]);
    if (!person) return { notFound: true };
    return {
      redirect: {
        destination: samePlayerRedirect(person),
        permanent: false,
      },
    };
  }

  const people = await Promise.all(ids.map((id) => loadComparePerson(id)));
  if (ids.some((id, index) => id && !people[index])) {
    return { notFound: true };
  }

  const validPeople = people.filter(Boolean);
  const canonicalPath = canonicalComparePath(validPeople);
  const incomingPath =
    slugs.length === 0
      ? "/players/compare"
      : `/players/compare/${slugs.map((item) => item.slug).join("/")}`;

  if (
    validPeople.length > 0 &&
    decodeURIComponent(incomingPath) !== decodeURIComponent(canonicalPath)
  ) {
    return {
      redirect: {
        destination: canonicalPath,
        permanent: false,
      },
    };
  }

  setPageCache(res, PAGE_CACHE.hourly);
  return {
    props: {
      people: validPeople,
      ids: validPeople.map((person) => String(person.playerId)),
      canonicalPath,
    },
  };
}
