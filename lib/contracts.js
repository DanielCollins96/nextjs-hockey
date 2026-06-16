export function normalizeContractReadModel(payload) {
  if (!payload) {
    return {
      contracts: [],
      currentContract: null,
    };
  }

  if (Array.isArray(payload)) {
    return {
      contracts: payload,
      currentContract: null,
    };
  }

  return {
    contracts: Array.isArray(payload.contracts) ? payload.contracts : [],
    currentContract: payload.currentContract || payload.current_contract || null,
  };
}

export function hasContractData(contractPayload) {
  return Boolean(contractPayload?.currentContract || contractPayload?.contracts?.length);
}

export function getContractSeasonRows(contracts) {
  return (Array.isArray(contracts) ? contracts : [])
    .flatMap((contract) =>
      (Array.isArray(contract?.seasons) ? contract.seasons : []).map((season) => ({
        ...season,
        start_season: contract.start_season,
        end_season: contract.end_season,
        source_url: season.source_url || contract.source_url,
      }))
    )
    .filter((season) => season?.season);
}
