/**
 * Routing / distance service abstraction.
 *
 * The demo provider estimates road distance and travel time from structured
 * coordinates (haversine × road factor, mode-specific speeds). A real provider
 * (e.g. Google Routes API via a server function) can implement the same
 * `RoutingProvider` interface and be swapped in.
 */
import type { GeoPoint, TransportMode, TravelEstimate } from "../types";
import { roundTo5 } from "../time";

export interface RoutingProvider {
  readonly name: string;
  readonly source: "demo" | "live";
  estimate(from: GeoPoint, to: GeoPoint, mode: TransportMode): TravelEstimate;
}

const R = 6371;
export const haversineKm = (a: GeoPoint, b: GeoPoint) => {
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

const MODE_PROFILE: Record<
  TransportMode,
  { kmh: number; overheadMin: number; perKm: number; minFare: number; label: string }
> = {
  walk: { kmh: 4.5, overheadMin: 0, perKm: 0, minFare: 0, label: "Walking" },
  auto: { kmh: 17, overheadMin: 6, perKm: 16, minFare: 40, label: "Auto-rickshaw" },
  cab: { kmh: 21, overheadMin: 8, perKm: 22, minFare: 90, label: "Cab" },
  public: { kmh: 13, overheadMin: 12, perKm: 3, minFare: 15, label: "Public transit" },
};

export const transportLabel = (mode: TransportMode) => MODE_PROFILE[mode].label;

export const demoRouting: RoutingProvider = {
  name: "Demo distance model",
  source: "demo",
  estimate(from, to, mode) {
    const straight = haversineKm(from, to);
    const km = Math.round(straight * 1.35 * 10) / 10; // road factor
    if (km < 0.15) return { minutes: 0, km: 0, cost: 0, mode, source: "demo" };

    // Walking is only realistic for short hops — fall back to auto for longer.
    const effectiveMode: TransportMode = mode === "walk" && km > 2.2 ? "auto" : mode;
    const p = MODE_PROFILE[effectiveMode];
    const minutes = roundTo5((km / p.kmh) * 60 + p.overheadMin);
    const cost = effectiveMode === "walk" ? 0 : Math.max(p.minFare, Math.round(km * p.perKm));
    return { minutes: Math.max(minutes, 5), km, cost, mode: effectiveMode, source: "demo" };
  },
};

export const routing: RoutingProvider = demoRouting;
