import { addDays, eachDayOfInterval, format, parseISO } from "date-fns";

export const toMin = (hhmm: string): number => {
  const [h, m] = hhmm.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
};

export const fromMin = (min: number): string => {
  const clamped = Math.max(0, Math.min(23 * 60 + 59, Math.round(min)));
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

export const roundTo5 = (min: number) => Math.round(min / 5) * 5;

export const fmtTime12 = (hhmm: string) => {
  const m = toMin(hhmm);
  const h = Math.floor(m / 60);
  const mm = String(m % 60).padStart(2, "0");
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${mm} ${suffix}`;
};

export const fmtDuration = (min: number) => {
  if (min < 60) return `${Math.round(min)} min`;
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return m ? `${h}h ${m}m` : `${h}h`;
};

export const tripDates = (start: string, end: string): string[] => {
  const s = parseISO(start);
  const e = parseISO(end);
  if (e < s) return [format(s, "yyyy-MM-dd")];
  return eachDayOfInterval({ start: s, end: e })
    .slice(0, 10)
    .map((d) => format(d, "yyyy-MM-dd"));
};

export const fmtDate = (date: string, pattern = "EEE, d MMM") => format(parseISO(date), pattern);

export const todayISO = () => format(new Date(), "yyyy-MM-dd");
export const plusDaysISO = (days: number) => format(addDays(new Date(), days), "yyyy-MM-dd");

export const timeOfDay = (hhmm: string): "morning" | "afternoon" | "evening" => {
  const m = toMin(hhmm);
  if (m < 12 * 60) return "morning";
  if (m < 17 * 60) return "afternoon";
  return "evening";
};

export const fmtINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
    Math.round(n),
  );
