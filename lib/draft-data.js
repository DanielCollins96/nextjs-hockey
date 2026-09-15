import { fetchReadModel, readModelPaths, readModelsEnabled, unwrapReadModel } from "./read-models";
import { normalizeTeamName } from "./routes";

let allDraftPicksCache = null;
let allDraftPicksPromise = null;

function teamKey(pick) {
  return String(pick?.draftedByTeamId ?? pick?.teamId ?? "");
}

function asDraftPicks(payload) {
  const draft = unwrapReadModel(payload, "draft");
  return Array.isArray(draft) ? draft : [];
}

function asTeamList(payload) {
  const teams = unwrapReadModel(payload, "teams");
  return Array.isArray(teams) ? teams : [];
}

function resolveTeam(payload, picks, knownTeams = []) {
  if (payload && Object.prototype.hasOwnProperty.call(payload, "team") && payload.team) {
    return payload.team;
  }
  return buildTeamsFromPicks(picks, knownTeams)[0] || null;
}

function sortPicksByYear(picks) {
  return [...(picks || [])].sort((a, b) => {
    const yearDiff = Number(b.draftYear) - Number(a.draftYear);
    if (yearDiff !== 0) return yearDiff;
    return Number(a.overallPick) - Number(b.overallPick);
  });
}

function buildTeamsFromPicks(picks, knownTeams = []) {
  const knownById = new Map(
    (knownTeams || []).map((team) => [String(team.id), team])
  );
  const teams = new Map();

  for (const pick of picks || []) {
    const id = teamKey(pick);
    if (!id) continue;

    const existing = teams.get(id);
    if (existing) {
      existing.pickCount += 1;
      continue;
    }

    const known = knownById.get(id);
    const abbreviation = known?.abbreviation || pick.teamAbbrev || "";
    teams.set(id, {
      id: Number.isFinite(Number(id)) ? Number(id) : id,
      abbreviation,
      name:
        known?.name ||
        known?.fullName ||
        normalizeTeamName(abbreviation) ||
        "Unknown team",
      pickCount: 1,
    });
  }

  return Array.from(teams.values()).sort((a, b) =>
    String(a.name).localeCompare(String(b.name))
  );
}

async function loadKnownTeams() {
  try {
    const { loadTeams } = await import("./team-data");
    return (await loadTeams())?.teams || [];
  } catch (error) {
    console.log(error);
    return [];
  }
}

// Temporary: stitch year files until ETL publishes drafts/teams/{id}.json
// and indexes/draft-teams.json.
async function loadAllDraftPicksFromReadModels() {
  if (allDraftPicksCache) return allDraftPicksCache;
  if (allDraftPicksPromise) return allDraftPicksPromise;

  allDraftPicksPromise = (async () => {
    const yearsResult = await loadDraftYears();
    const years = yearsResult?.years || [];

    const yearPayloads = await Promise.all(
      years.map(async (entry) => {
        const draftYear = entry?.draftYear ?? entry;
        const payload = await fetchReadModel(readModelPaths.draft(draftYear), {
          timeoutMs: 8000,
        });
        if (!payload) return null;
        const draft = asDraftPicks(payload);
        if (!draft.length) return null;
        return draft.map((pick) => ({
          ...pick,
          draftYear: pick.draftYear ?? draftYear,
        }));
      })
    );

    const hits = yearPayloads.filter(Boolean);
    const picks = hits.flat();
    // Only cache a complete stitch so a timeout does not freeze a truncated list.
    if (hits.length === years.length) {
      allDraftPicksCache = picks;
    }
    return picks;
  })();

  try {
    return await allDraftPicksPromise;
  } finally {
    allDraftPicksPromise = null;
  }
}

export async function loadDraftYears() {
  const readModel = await fetchReadModel(readModelPaths.draftYears());

  if (readModel) {
    return {
      source: "s3-read-model",
      years: unwrapReadModel(readModel, "years") || [],
    };
  }

  const { getAllDraftYears } = await import("./queries");
  return {
    source: "postgres",
    years: await getAllDraftYears(),
  };
}

export async function loadDraft(id) {
  const readModel = await fetchReadModel(readModelPaths.draft(id));

  if (readModel) {
    const draft = asDraftPicks(readModel);
    if (!draft.length) return { notFound: true };
    return { source: "s3-read-model", draft };
  }

  if (readModelsEnabled()) {
    return { notFound: true };
  }

  const { getDraft } = await import("./queries");
  const draft = await getDraft(id);

  if (!draft || draft.length === 0) {
    return { notFound: true };
  }

  return { source: "postgres", draft };
}

export async function loadDraftByTeam(teamId) {
  const id = String(teamId || "").trim();
  if (!id) return { notFound: true };

  const readModel = await fetchReadModel(readModelPaths.draftByTeam(id));
  if (readModel) {
    const draft = sortPicksByYear(asDraftPicks(readModel));
    if (!draft.length) return { notFound: true };
    return {
      source: "s3-read-model",
      draft,
      team: resolveTeam(readModel, draft),
    };
  }

  if (readModelsEnabled()) {
    const [picks, knownTeams] = await Promise.all([
      loadAllDraftPicksFromReadModels(),
      loadKnownTeams(),
    ]);
    const draft = sortPicksByYear(picks.filter((pick) => teamKey(pick) === id));
    if (!draft.length) return { notFound: true };
    return {
      source: "s3-read-model-aggregated",
      draft,
      team: buildTeamsFromPicks(draft, knownTeams)[0] || null,
    };
  }

  const { getDraftByTeam } = await import("./queries");
  const draft = sortPicksByYear(await getDraftByTeam(id));
  if (!draft.length) return { notFound: true };

  return {
    source: "postgres",
    draft,
    team: buildTeamsFromPicks(draft)[0] || null,
  };
}

export async function loadDraftTeams() {
  const readModel = await fetchReadModel(readModelPaths.draftTeams());
  if (readModel) {
    return {
      source: "s3-read-model",
      teams: asTeamList(readModel),
    };
  }

  if (readModelsEnabled()) {
    const [picks, knownTeams] = await Promise.all([
      loadAllDraftPicksFromReadModels(),
      loadKnownTeams(),
    ]);
    return {
      source: "s3-read-model-aggregated",
      teams: buildTeamsFromPicks(picks, knownTeams),
    };
  }

  const { getDraftTeams, getTeams } = await import("./queries");
  const [draftTeams, knownTeams] = await Promise.all([
    getDraftTeams(),
    getTeams(),
  ]);
  const knownById = new Map(
    (knownTeams || []).map((team) => [String(team.id), team])
  );

  return {
    source: "postgres",
    teams: (draftTeams || [])
      .map((team) => {
        const known = knownById.get(String(team.id));
        const abbreviation = known?.abbreviation || team.abbreviation || "";
        return {
          id: team.id,
          abbreviation,
          name:
            known?.name ||
            known?.fullName ||
            normalizeTeamName(abbreviation) ||
            "Unknown team",
          pickCount: team.pickCount,
        };
      })
      .sort((a, b) => String(a.name).localeCompare(String(b.name))),
  };
}
