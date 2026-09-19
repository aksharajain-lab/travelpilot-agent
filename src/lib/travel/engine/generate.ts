import { JAIPUR_CENTER, JAIPUR_PLACES } from "../data/jaipur";
import { routing, haversineKm } from "../services/routing";
import { weather } from "../services/weather";
import { fromMin, timeOfDay, toMin, tripDates } from "../time";
import type {
  DayPlan,
  DayWeather,
  GeoPoint,
  ItineraryItem,
  Pace,
  Place,
  TravelEstimate,
  TripConstraints,
  TripState,
} from "../types";

export const PACE_CONFIG: Record<Pace, { maxStops: number; bufferMin: number; label: string }> = {
  relaxed: { maxStops: 3, bufferMin: 25, label: "Relaxed" },
  balanced: { maxStops: 5, bufferMin: 15, label: "Balanced" },
  packed: { maxStops: 7, bufferMin: 10, label: "Packed" },
};

export const originFor = (c: TripConstraints): GeoPoint => c.hotel ?? JAIPUR_CENTER;

export interface Scored {
  place: Place;
  travel: TravelEstimate;
  start: number;
  end: number;
  score: number;
  reasons: string[];
}

interface ScoreCtx {
  constraints: TripConstraints;
  prevLoc: GeoPoint;
  prevCategory?: Place["category"];
  weather?: DayWeather;
  remainingBudget: number;
}

/** Score a place for a slot beginning at `cursor` (minutes) — shared by generation and replanning. */
export const scorePlace = (
  place: Place,
  cursor: number,
  latestEnd: number,
  ctx: ScoreCtx,
): Scored | { place: Place; rejection: string } => {
  const { constraints, prevLoc } = ctx;
  const travel = routing.estimate(prevLoc, place, constraints.transport);
  const arrival = cursor + travel.minutes;
  const start = Math.max(arrival, toMin(place.openTime));
  const end = start + place.durationMinutes;
  const wait = start - arrival;

  if (end > toMin(place.closeTime)) return { place, rejection: `closes at ${place.closeTime}` };
  if (end > latestEnd) return { place, rejection: "does not fit the time available" };
  if (wait > 75) return { place, rejection: `opens too late (${place.openTime})` };

  const cost = place.cost * constraints.travelers + travel.cost;
  if (cost > ctx.remainingBudget && cost > 0)
    return { place, rejection: "exceeds remaining budget" };

  const reasons: string[] = [];
  let score = 0;

  const interests = constraints.interests;
  if (interests.length === 0) score += 1;
  else if (interests.includes(place.category)) {
    score += 3;
    reasons.push(`matches your interest in ${place.category}`);
  }
  const tagHits = place.tags.filter((t) => interests.some((i) => t.includes(i))).length;
  score += tagHits * 0.4;

  const tod = timeOfDay(fromMin(start));
  if (place.bestTime === tod) {
    score += 1.2;
    reasons.push(`best in the ${tod}`);
  } else if (place.bestTime === "any") score += 0.4;

  const km = haversineKm(prevLoc, place);
  score -= km * 0.32;
  if (km < 1.5) reasons.push("close to the previous stop");
  else if (km > 9) reasons.push(`${Math.round(km)} km away`);

  score -= wait / 60;
  if (ctx.prevCategory && ctx.prevCategory === place.category) score -= 0.8;

  const budgetShare = ctx.remainingBudget > 0 ? cost / ctx.remainingBudget : 1;
  if (budgetShare > 0.35) {
    score -= 1.5;
    reasons.push("pricey for the remaining budget");
  } else if (cost === 0) {
    score += 0.3;
    reasons.push("free entry");
  }

  if (ctx.weather && (ctx.weather.condition === "showers" || ctx.weather.condition === "thunderstorm")) {
    if (place.indoor) {
      score += 1;
      reasons.push("indoor — rain-safe");
    } else score -= 1.2;
  }
  if (ctx.weather && ctx.weather.highC >= 36 && !place.indoor && tod === "afternoon") score -= 1;

  return { place, travel, start, end, score, reasons };
};

export const buildItem = (
  place: Place,
  date: string,
  start: number,
  travel: TravelEstimate,
  status: ItineraryItem["status"],
  notes: string,
  backupPlaceIds: string[] = [],
): ItineraryItem => ({
  id: `${date}-${place.id}`,
  placeId: place.id,
  date,
  startTime: fromMin(start),
  endTime: fromMin(start + place.durationMinutes),
  title: place.name,
  category: place.category,
  location: { name: place.name, area: place.area, lat: place.lat, lng: place.lng },
  estimatedCost: place.cost,
  estimatedTravelMinutes: travel.minutes,
  estimatedTravelKm: travel.km,
  estimatedTransportCost: travel.cost,
  status,
  notes,
  backupPlaceIds,
});

type Want = "lunch" | "dinner" | "activity";

export const generateItinerary = (constraints: TripConstraints): TripState => {
  const dates = tripDates(constraints.startDate, constraints.endDate);
  const forecasts = weather.forecast(constraints.destination, dates);
  const pace = PACE_CONFIG[constraints.pace];
  const used = new Set<string>();
  const origin = originFor(constraints);
  let remaining = constraints.budget;
  const dayStart = toMin(constraints.dayStart);
  const dayEnd = toMin(constraints.dayEnd);

  const days: DayPlan[] = dates.map((date, dayIdx) => {
    const wx = forecasts[dayIdx]!;
    const items: ItineraryItem[] = [];
    let cursor = dayStart;
    let prevLoc: GeoPoint = origin;
    let prevCategory: Place["category"] | undefined;
    let hadLunch = false;
    let hadDinner = false;
    const dayBudgetCap = remaining / (dates.length - dayIdx);
    let daySpent = 0;

    while (cursor < dayEnd - 30 && items.length < pace.maxStops + 2) {
      const want: Want =
        !hadLunch && cursor >= toMin("12:00") && cursor <= toMin("14:30")
          ? "lunch"
          : !hadDinner && cursor >= toMin("18:30")
            ? "dinner"
            : "activity";

      const nonMealCount = items.filter((i) => i.category !== "food").length;
      if (want === "activity" && nonMealCount >= pace.maxStops) {
        // Enough sightseeing — jump ahead to dinner window if there is one.
        if (!hadDinner && dayEnd >= toMin("19:30")) {
          cursor = Math.max(cursor, toMin("18:30"));
          continue;
        }
        break;
      }

      const pool = JAIPUR_PLACES.filter((p) => {
        if (used.has(p.id)) return false;
        if (want === "lunch") return p.mealSlot === "lunch";
        if (want === "dinner") return p.mealSlot === "dinner";
        return p.category !== "food" || (p.mealSlot === "snack" && timeOfDay(fromMin(cursor)) !== "afternoon");
      });

      const scored = pool
        .map((p) =>
          scorePlace(p, cursor, dayEnd, {
            constraints,
            prevLoc,
            prevCategory,
            weather: wx,
            remainingBudget: Math.max(0, dayBudgetCap * 1.25 - daySpent),
          }),
        )
        .filter((s): s is Scored => "score" in s)
        .sort((a, b) => b.score - a.score);

      if (scored.length === 0) {
        if (want !== "activity") {
          // No meal fits — skip the meal and try a normal activity.
          if (want === "lunch") hadLunch = true;
          else hadDinner = true;
          continue;
        }
        break;
      }

      const best = scored[0]!;
      const backups = scored.slice(1, 3).map((s) => s.place.id);
      const item = buildItem(
        best.place,
        date,
        best.start,
        best.travel,
        "planned",
        best.reasons.length ? `Chosen because it ${best.reasons.slice(0, 2).join(" and ")}.` : "",
        backups,
      );
      items.push(item);
      used.add(best.place.id);
      const cost = best.place.cost * constraints.travelers + best.travel.cost;
      daySpent += cost;
      remaining -= cost;
      if (best.place.mealSlot === "lunch") hadLunch = true;
      if (best.place.mealSlot === "dinner") hadDinner = true;
      prevLoc = best.place;
      prevCategory = best.place.category;
      cursor = best.end + pace.bufferMin;
    }

    return { date, items, weather: wx };
  });

  return {
    constraints,
    days,
    generatedAt: new Date().toISOString(),
    changes: [],
  };
};
