import type { Conflict, DayPlan, TripConstraints } from "../types";
import { findPlace } from "../data/jaipur";
import { toMin, fmtTime12 } from "../time";
import { activeItems } from "./budget";

/**
 * Deterministic conflict detection for one day:
 *  - overlapping time windows
 *  - insufficient gap for the estimated travel time from the previous stop
 *  - activity outside the traveller's daily window
 *  - activity running past the venue's closing time
 */
export const detectDayConflicts = (day: DayPlan, constraints: TripConstraints): Conflict[] => {
  const items = [...activeItems(day)].sort((a, b) => toMin(a.startTime) - toMin(b.startTime));
  const conflicts: Conflict[] = [];
  const dayStart = toMin(constraints.dayStart);
  const dayEnd = toMin(constraints.dayEnd);

  items.forEach((item, idx) => {
    const start = toMin(item.startTime);
    const end = toMin(item.endTime);
    if (start < dayStart || end > dayEnd) {
      conflicts.push({
        itemId: item.id,
        kind: "window",
        message: `${item.title} falls outside your ${fmtTime12(constraints.dayStart)}–${fmtTime12(constraints.dayEnd)} window.`,
      });
    }
    const place = findPlace(item.placeId);
    if (place && end > toMin(place.closeTime)) {
      conflicts.push({
        itemId: item.id,
        kind: "closed",
        message: `${item.title} runs past closing time (${fmtTime12(place.closeTime)}).`,
      });
    }
    if (idx > 0) {
      const prev = items[idx - 1]!;
      const prevEnd = toMin(prev.endTime);
      if (start < prevEnd) {
        conflicts.push({
          itemId: item.id,
          kind: "overlap",
          message: `${item.title} overlaps with ${prev.title}.`,
        });
      } else if (start - prevEnd < item.estimatedTravelMinutes) {
        conflicts.push({
          itemId: item.id,
          kind: "travel",
          message: `Only ${start - prevEnd} min between ${prev.title} and ${item.title}, but travel needs ~${item.estimatedTravelMinutes} min.`,
        });
      }
    }
  });
  return conflicts;
};

export const detectAllConflicts = (days: DayPlan[], constraints: TripConstraints) =>
  days.flatMap((d) => detectDayConflicts(d, constraints));
