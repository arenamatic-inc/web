// utils/format.ts
export function formatCurrency(value: number, currency = "CAD") {
  return value.toLocaleString("en-CA", { style: "currency", currency });
}

export function formatDateTime(isoString: string) {
  const date = new Date(isoString);
  return date.toLocaleString("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function formatShortDateTime(isoString: string) {
  const date = new Date(isoString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).replace(/, \d{4}/, "");
}
