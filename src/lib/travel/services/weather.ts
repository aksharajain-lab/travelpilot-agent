/**
 * Weather service abstraction.
 *
 * `demoWeather` produces deterministic, clearly-labelled demo forecasts derived
 * from the date and destination so the dashboard is stable across reloads.
 * A live provider (e.g. Google Weather API via a server function) can implement
 * `WeatherProvider` and be swapped in without touching the UI.
 */
import { parseISO, getMonth } from "date-fns";
import type { DayWeather } from "../types";

export interface WeatherProvider {
  readonly name: string;
  readonly source: "demo" | "live";
  forecast(destination: string, dates: string[]): DayWeather[];
}

const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
};

// Monthly climate normals for Jaipur (approximate).
const JAIPUR_NORMALS: { high: number; low: number; rain: number; humidity: number }[] = [
  { high: 22, low: 8, rain: 5, humidity: 45 },
  { high: 26, low: 11, rain: 5, humidity: 40 },
  { high: 32, low: 16, rain: 5, humidity: 30 },
  { high: 38, low: 22, rain: 5, humidity: 22 },
  { high: 41, low: 26, rain: 10, humidity: 25 },
  { high: 39, low: 27, rain: 25, humidity: 45 },
  { high: 34, low: 26, rain: 55, humidity: 75 },
  { high: 32, low: 25, rain: 55, humidity: 80 },
  { high: 33, low: 24, rain: 30, humidity: 65 },
  { high: 34, low: 19, rain: 8, humidity: 40 },
  { high: 29, low: 13, rain: 4, humidity: 40 },
  { high: 24, low: 9, rain: 4, humidity: 45 },
];

const pickCondition = (rain: number, r: number): DayWeather["condition"] => {
  if (r < rain / 100) return r < rain / 300 ? "thunderstorm" : "showers";
  if (r < 0.45) return "sunny";
  if (r < 0.75) return "partly-cloudy";
  if (r < 0.9) return "cloudy";
  return "hazy";
};

const adviceFor = (c: DayWeather["condition"], high: number) => {
  if (c === "thunderstorm") return "Afternoon storms likely — keep indoor options ready.";
  if (c === "showers") return "Passing showers; carry a light rain layer.";
  if (high >= 38) return "Extreme heat — schedule forts early, hydrate often.";
  if (high >= 34) return "Hot afternoon; plan indoor stops between 1–4 PM.";
  if (c === "hazy") return "Hazy skies; sunset views may be muted.";
  return "Comfortable sightseeing weather.";
};

export const demoWeather: WeatherProvider = {
  name: "Demo climate model",
  source: "demo",
  forecast(destination, dates) {
    return dates.map((date) => {
      const month = getMonth(parseISO(date));
      const n = JAIPUR_NORMALS[month]!;
      const r1 = hash(`${destination}|${date}|a`);
      const r2 = hash(`${destination}|${date}|b`);
      const condition = pickCondition(n.rain, r1);
      const highC = Math.round(n.high + (r2 - 0.5) * 5 - (condition === "showers" ? 2 : 0));
      const lowC = Math.round(n.low + (r1 - 0.5) * 3);
      const rainChance =
        condition === "thunderstorm" ? 80 : condition === "showers" ? 60 : Math.round(n.rain * r2);
      return {
        date,
        condition,
        highC,
        lowC,
        rainChance,
        humidity: Math.round(n.humidity + (r1 - 0.5) * 10),
        advice: adviceFor(condition, highC),
        source: "demo",
      };
    });
  },
};

export const weather: WeatherProvider = demoWeather;
