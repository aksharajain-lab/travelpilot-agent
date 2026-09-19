export type Category =
  | "history"
  | "architecture"
  | "food"
  | "culture"
  | "shopping"
  | "nature"
  | "leisure";

export type TransportMode = "auto" | "cab" | "walk" | "public";
export type Pace = "relaxed" | "balanced" | "packed";
export type TimeOfDay = "morning" | "afternoon" | "evening" | "any";

export type ItemStatus = "planned" | "new" | "adjusted" | "cancelled" | "dropped";

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface Place extends GeoPoint {
  id: string;
  name: string;
  category: Category;
  area: string;
  durationMinutes: number;
  cost: number; // INR per person
  openTime: string; // "HH:MM"
  closeTime: string; // "HH:MM"
  tags: string[];
  description: string;
  bestTime: TimeOfDay;
  indoor: boolean;
  mealSlot?: "lunch" | "dinner" | "snack";
}

export interface ItineraryLocation extends GeoPoint {
  name: string;
  area: string;
}

export interface ItineraryItem {
  id: string;
  placeId: string;
  date: string; // yyyy-MM-dd
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  title: string;
  category: Category;
  location: ItineraryLocation;
  estimatedCost: number;
  estimatedTravelMinutes: number; // travel from previous stop (or hotel)
  estimatedTravelKm: number;
  estimatedTransportCost: number;
  status: ItemStatus;
  notes: string;
  backupPlaceIds: string[];
}

export interface DayWeather {
  date: string;
  condition: "sunny" | "partly-cloudy" | "cloudy" | "showers" | "thunderstorm" | "hazy";
  highC: number;
  lowC: number;
  rainChance: number; // 0-100
  humidity: number;
  advice: string;
  source: "demo" | "live";
}

export interface DayPlan {
  date: string;
  items: ItineraryItem[];
  weather: DayWeather;
}

export interface Hotel extends GeoPoint {
  name: string;
  area: string;
}

export interface TripConstraints {
  destination: string;
  startDate: string;
  endDate: string;
  dayStart: string;
  dayEnd: string;
  budget: number;
  interests: Category[];
  transport: TransportMode;
  hotel: Hotel | null;
  pace: Pace;
  travelers: number;
}

export interface ChangeRecord {
  id: string;
  at: string; // ISO
  date: string; // trip day
  headline: string;
  details: string[];
  budgetDelta: number;
}

export interface TripState {
  constraints: TripConstraints;
  days: DayPlan[];
  generatedAt: string;
  changes: ChangeRecord[];
}

export interface Conflict {
  itemId: string;
  kind: "overlap" | "travel" | "window" | "closed";
  message: string;
}

export interface TravelEstimate {
  minutes: number;
  km: number;
  cost: number;
  mode: TransportMode;
  source: "demo" | "live";
}

export interface AlternativeEvaluation {
  place: Place;
  score: number;
  accepted: boolean;
  reasons: string[];
  rejection?: string;
  travelFromPrevMinutes: number;
  travelToNextMinutes: number;
}

export type AgentStepStatus = "pending" | "running" | "done" | "warning";

export interface AgentStep {
  id: string;
  title: string;
  status: AgentStepStatus;
  lines: string[];
}

export interface DisruptionResult {
  steps: AgentStep[];
  evaluations: AlternativeEvaluation[];
  chosen: Place | null;
  nextState: TripState;
  change: ChangeRecord;
}
