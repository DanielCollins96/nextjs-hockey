import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import PlayerCompareView from "../../../components/PlayerCompareView";
import SEO from "../../../components/SEO";
import { PAGE_CACHE, setPageCache } from "../../../lib/http-cache";
import {
  canonicalComparePath,
  compareQueryIds,
  normalizeCompareSlugs,
  samePlayerRedirect,
} from "../../../lib/player-compare";
import { loadPlayerProfile } from "../../../lib/player-data";
import { careerTotals, isGoaliePosition } from "../../../lib/player-stats";
import { comparePlayersUrl, compareStartUrl, playerUrl } from "../../../lib/routes";
import { usePlayerDetails } from "../../../lib/usePlayerDetails";

function buildSide(person, details) {
  const isGoalie = isGoaliePosition(person?.position);
  return {
    person: details.person || person,
    stats: details.stats,
    awards: details.awards,
    contracts: details.contracts,
    currentContract: details.currentContract,
    loading: details.loading,
    totals: careerTotals(details.stats, isGoalie),
  };
}

export default function PlayerComparePage({
  leftPerson,
  rightPerson,
  leftId,
  rightId,
  canonicalPath,
}) {
  const router = useRouter();
  const leftDetails = usePlayerDetails(leftId, leftPerson);
  const rightDetails = usePlayerDetails(rightId, rightPerson);

  const left = useMemo(
    () => buildSide(leftPerson, leftDetails),
    [leftDetails, leftPerson]
  );
  const right = useMemo(
    () => buildSide(rightPerson, rightDetails),
    [rightDetails, rightPerson]
  );

  const leftName = left.person?.player_name || "Player";
  const rightName = right.person?.player_name || "another player";
  const hasBoth = Boolean(left.person && right.person);

  const goToCompare = (nextLeft, nextRight) => {
    if (nextLeft && nextRight) {
      router.push(
        comparePlayersUrl(
          nextLeft.name || nextLeft.player_name,
          nextLeft.id || nextLeft.playerId,
          nextRight.name || nextRight.player_name,
          nextRight.id || nextRight.playerId
        )
      );
      return;
    }

    const remaining = nextLeft || nextRight;
    if (remaining) {
      router.push(
        compareStartUrl(
          remaining.name || remaining.player_name,
          remaining.id || remaining.playerId
        )
      );
    }
  };

  return (
    <div className="bg-white text-slate-950 dark:bg-gray-900 dark:text-slate-100">
      <SEO
        title={
          hasBoth
            ? `${leftName} vs ${rightName} Comparison`
            : left.person
              ? `Compare ${leftName}`
              : "Compare NHL Players"
        }
        description={
          hasBoth
            ? `Side-by-side NHL comparison of ${leftName} and ${rightName}, including bio, career totals, and season stats.`
            : "Search two NHL players and compare bio, career totals, and season statistics."
        }
        path={canonicalPath}
      />

      <main className="mx-auto max-w-6xl px-2 py-3 sm:px-3">
        <div className="mb-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            <Link href="/players" className="text-blue-700 hover:underline dark:text-blue-300">
              Players
            </Link>
            {left.person && (
              <>
                <span className="px-1.5">/</span>
                <Link
                  href={playerUrl(left.person.player_name, left.person.playerId)}
                  className="text-blue-700 hover:underline dark:text-blue-300"
                >
                  {leftName}
                </Link>
              </>
            )}
            <span className="px-1.5">/</span>
            Compare
          </p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
            {hasBoth ? `${leftName} vs ${rightName}` : "Compare Players"}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-600 dark:text-slate-400">
            <p>Search by name, then share this page URL to keep the matchup.</p>
            {hasBoth && (
              <button
                type="button"
                onClick={() =>
                  goToCompare(
                    { name: rightName, id: right.person.playerId },
                    { name: leftName, id: left.person.playerId }
                  )
                }
                className="font-semibold text-blue-700 hover:underline dark:text-blue-300"
              >
                Swap sides
              </button>
            )}
          </div>
        </div>

        <PlayerCompareView
          left={left}
          right={right}
          onSelectLeft={(player) =>
            goToCompare(player, right.person && {
              name: right.person.player_name,
              id: right.person.playerId,
            })
          }
          onSelectRight={(player) =>
            goToCompare(
              left.person && {
                name: left.person.player_name,
                id: left.person.playerId,
              },
              player
            )
          }
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
  const queryIds = compareQueryIds(query);

  let leftId = slugs[0]?.id || queryIds.left;
  let rightId = slugs[1]?.id || queryIds.right;
  if (!leftId && rightId) {
    leftId = rightId;
    rightId = null;
  }

  if (leftId && rightId && String(leftId) === String(rightId)) {
    const person = await loadComparePerson(leftId);
    if (!person) return { notFound: true };
    return {
      redirect: {
        destination: samePlayerRedirect(person),
        permanent: false,
      },
    };
  }

  const [leftPerson, rightPerson] = await Promise.all([
    loadComparePerson(leftId),
    loadComparePerson(rightId),
  ]);

  if (leftId && !leftPerson) return { notFound: true };
  if (rightId && !rightPerson) return { notFound: true };

  const canonicalPath = canonicalComparePath(leftPerson, rightPerson);
  const incomingPath =
    slugs.length === 0
      ? "/players/compare"
      : `/players/compare/${slugs.map((item) => item.slug).join("/")}`;

  if (
    (leftPerson || rightPerson) &&
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
      leftPerson,
      rightPerson,
      leftId: leftPerson?.playerId ? String(leftPerson.playerId) : null,
      rightId: rightPerson?.playerId ? String(rightPerson.playerId) : null,
      canonicalPath,
    },
  };
}
