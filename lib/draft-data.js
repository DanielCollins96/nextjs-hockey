import { fetchReadModel, readModelPaths, unwrapReadModel } from "./read-models";

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
    const draft = unwrapReadModel(readModel, "draft") || [];
    if (!draft || draft.length === 0) {
      return { notFound: true };
    }

    return { source: "s3-read-model", draft };
  }

  const { getDraft } = await import("./queries");
  const draft = await getDraft(id);

  if (!draft || draft.length === 0) {
    return { notFound: true };
  }

  return { source: "postgres", draft };
}
