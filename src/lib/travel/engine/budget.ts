import type { DayPlan, ItineraryItem, TripState } from "../types";

export const isActive = (item: ItineraryItem) =>
  item.status !== "cancelled" && item.status !== "dropped";

export const activeItems = (day: DayPlan) => day.items.filter(isActive);

export const itemTotal = (item: ItineraryItem, travelers: number) =>
  item.estimatedCost * travelers + item.estimatedTransportCost;

export interface DaySpend {
  date: string;
  activities: number;
  transport: number;
  total: number;
}

export const daySpend = (day: DayPlan, travelers: number): DaySpend => {
  const items = activeItems(day);
  const activities = items.reduce((s, i) => s + i.estimatedCost * travelers, 0);
  const transport = items.reduce((s, i) => s + i.estimatedTransportCost, 0);
  return { date: day.date, activities, transport, total: activities + transport };
};

export interface BudgetSummary {
  budget: number;
  spent: number;
  remaining: number;
  activities: number;
  transport: number;
  utilisation: number; // 0..1+
  perDay: DaySpend[];
  status: "healthy" | "tight" | "over";
}

export const summarizeBudget = (state: TripState): BudgetSummary => {
  const { budget, travelers } = state.constraints;
  const perDay = state.days.map((d) => daySpend(d, travelers));
  const activities = perDay.reduce((s, d) => s + d.activities, 0);
  const transport = perDay.reduce((s, d) => s + d.transport, 0);
  const spent = activities + transport;
  const utilisation = budget > 0 ? spent / budget : 0;
  return {
    budget,
    spent,
    remaining: budget - spent,
    activities,
    transport,
    utilisation,
    perDay,
    status: utilisation > 1 ? "over" : utilisation > 0.9 ? "tight" : "healthy",
  };
};
