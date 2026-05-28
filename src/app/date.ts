const kstFallbackLabel = "Time unavailable";

function hasExplicitTimeZone(value: string) {
  return /(?:Z|[+-]\d{2}:?\d{2})$/i.test(value);
}

function formatPartsInKst(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
    hourCycle: "h23",
    minute: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Seoul",
    year: "numeric",
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value;
  const year = value("year");
  const month = value("month");
  const day = value("day");
  const hour = value("hour");
  const minute = value("minute");

  if (!year || !month || !day || !hour || !minute) return kstFallbackLabel;

  return year + "-" + month + "-" + day + " " + hour + ":" + minute + " KST";
}

export function formatKstDateTime(timestamp: string | null | undefined) {
  if (!timestamp) return kstFallbackLabel;

  const trimmed = timestamp.trim();
  if (!trimmed) return kstFallbackLabel;

  const localDisplayMatch = trimmed.match(
    /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/,
  );

  if (localDisplayMatch && !hasExplicitTimeZone(trimmed)) {
    const [, year, month, day, hour, minute] = localDisplayMatch;
    return year + "-" + month + "-" + day + " " + hour + ":" + minute + " KST";
  }

  const parseTarget =
    trimmed.includes("T") && !hasExplicitTimeZone(trimmed) ? trimmed + "Z" : trimmed;
  const date = new Date(parseTarget);

  if (Number.isNaN(date.getTime())) return kstFallbackLabel;

  return formatPartsInKst(date);
}
