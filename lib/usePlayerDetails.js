import { useEffect, useState } from "react";

const emptyDetails = {
  stats: [],
  awards: [],
  contracts: [],
  currentContract: null,
};

export function usePlayerDetails(playerId, initialPerson = null) {
  const [person, setPerson] = useState(initialPerson);
  const [details, setDetails] = useState(emptyDetails);
  const [loading, setLoading] = useState(Boolean(playerId));

  useEffect(() => {
    setPerson(initialPerson);
  }, [initialPerson]);

  useEffect(() => {
    if (!playerId) {
      setDetails(emptyDetails);
      setLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    setDetails(emptyDetails);
    setLoading(true);

    fetch(`/api/players/${encodeURIComponent(playerId)}`, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (!payload) return;
        const nextPerson = Array.isArray(payload.player) ? payload.player[0] : payload.player;
        if (nextPerson) setPerson(nextPerson);
        setDetails({
          stats: Array.isArray(payload.playerStats) ? payload.playerStats : [],
          awards: Array.isArray(payload.awards) ? payload.awards : [],
          contracts: Array.isArray(payload.contracts) ? payload.contracts : [],
          currentContract: payload.currentContract || null,
        });
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          console.warn("Unable to load player details", error);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [playerId]);

  return {
    person,
    ...details,
    loading,
  };
}
