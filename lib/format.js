export const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

export const formatCurrency = (value) => {
  const number = toNumber(value);
  if (number === null) return "-";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(number);
};

export const formatSeason = (season) => {
  const seasonString = String(season || "");
  if (/^\d{8}$/.test(seasonString)) {
    return `${seasonString.slice(0, 4)}/${seasonString.slice(6, 8)}`;
  }
  return seasonString || "-";
};

export const formatShortSeason = (season) => {
  const formattedSeason = formatSeason(season);
  if (/^\d{4}\/\d{2}$/.test(formattedSeason)) {
    return `${formattedSeason.slice(2, 4)}/${formattedSeason.slice(5, 7)}`;
  }
  return formattedSeason;
};

export const formatSeasonStartYear = (season) => {
  const seasonValue = String(season || "");
  return /^\d{8}$/.test(seasonValue) ? seasonValue.slice(0, 4) : seasonValue;
};
