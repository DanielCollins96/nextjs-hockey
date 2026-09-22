export const serializeDateOnly = (value) => {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString().split("T")[0];
  }

  return value ?? null;
};

export const VIEWER_TIMEZONE_COOKIE = "hocke_tz";
export const DEFAULT_CALENDAR_TIMEZONE = "America/Los_Angeles";

export function calendarDateString(date = new Date(), timeZone) {
  const tz =
    timeZone || (typeof window === "undefined" ? DEFAULT_CALENDAR_TIMEZONE : undefined);

  if (tz) {
    try {
      return new Intl.DateTimeFormat("en-CA", {
        timeZone: tz,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(date);
    } catch {
      if (tz !== DEFAULT_CALENDAR_TIMEZONE) {
        return calendarDateString(date, DEFAULT_CALENDAR_TIMEZONE);
      }
    }
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function viewerTimeZoneFromCookie(cookieHeader) {
  const match = String(cookieHeader || "").match(
    new RegExp(`(?:^|;\\s*)${VIEWER_TIMEZONE_COOKIE}=([^;]+)`)
  );
  if (!match) return null;

  try {
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
}

export function rememberViewerTimeZone() {
  if (typeof document === "undefined") return;

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (!timeZone) return;

  document.cookie = `${VIEWER_TIMEZONE_COOKIE}=${encodeURIComponent(
    timeZone
  )}; Path=/; Max-Age=31536000; SameSite=Lax`;
}

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

export const seasonEndYear = (season) => {
  const seasonValue = String(season || "");
  if (/^\d{8}$/.test(seasonValue)) return Number(seasonValue.slice(4, 8));
  const parsed = Number(seasonValue);
  return Number.isFinite(parsed) && parsed > 1900 ? parsed : null;
};
