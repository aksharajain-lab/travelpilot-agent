# TravelPilot Agent

Build the MVP of a product called TravelPilot: Intelligent Trip Planning & Disruption Management Agent.

IMPORTANT: This is a functional hackathon prototype, not a static mockup. Prioritize a complete working end-to-end experience over extra features. Do not add authentication, payments, social features, admin panels, or unnecessary complexity.

PRODUCT GOAL
TravelPilot creates a day-by-day trip itinerary from user constraints and then continuously manages that itinerary when circumstances change. The core differentiator is disruption handling: when an activity is cancelled/unavailable, the system must detect conflicts, evaluate alternatives, replan the affected itinerary while preserving unaffected items, recalculate budget, and clearly explain what changed.

MVP USER FLOW
1. Landing/home screen with a polished travel-planning interface and a clear CTA to plan a trip.
2. Trip input form collecting:
   - destination
   - start date and end date
   - daily available start/end timings
   - total budget
   - interests/preferences
   - preferred transport mode
   - optional hotel/accommodation location
   - optional pace preference
3. Generate itinerary.
4. Show a trip dashboard with:
   - trip summary
   - weather estimate/forecast for each day
   - day-by-day itinerary
   - activity times and locations
   - estimated travel time between activities
   - activity/transport estimated costs
   - daily spend and total estimated spend vs budget
   - important timings
   - backup/alternative options where relevant
5. Provide an interactive disruption action for an itinerary activity, such as “Activity unavailable”.
6. When disruption is triggered, the TravelPilot agent must:
   - identify the affected activity and time slot
   - inspect the existing itinerary state
   - detect downstream scheduling conflicts
   - evaluate alternative activities based on the user's interests, timing, location, transport preference and remaining budget
   - select a suitable alternative
   - replan only the affected portion where possible
   - recalculate costs/travel timing
   - update the dashboard state
   - show a concise “What changed” explanation
7. Provide a natural-language trip assistant on the dashboard that can answer questions about the current itinerary and make simple itinerary modifications, including examples like:
   - “What should I do tomorrow morning?”
   - “Can I fit this activity into today's schedule?”
   - “Which activities are close to my hotel?”
   - “What happens if this activity is cancelled?”
The assistant should operate on the current structured itinerary state rather than inventing a separate itinerary.

AGENTIC BEHAVIOR
Implement a real, inspectable agent-like workflow in the prototype rather than a purely decorative chatbot. Keep the implementation practical for a 48-hour hackathon. Use structured itinerary data/state and deterministic constraint checks alongside an LLM where appropriate. The disruption workflow should visibly progress through stages such as:
Analyze disruption → Check conflicts → Find/evaluate alternatives → Recalculate → Apply revised itinerary.
Do not hardcode one fixed “cancel museum = replace with cafe” response. Generate alternatives from structured destination/activity data and score/filter them against constraints. If external APIs are not configured, provide a clean mock/demo data layer so the full workflow still works reliably.

WEATHER
Include weather estimates/forecast in the dashboard. Use a clean service abstraction so a real weather API can be connected later. For the MVP, if no API key is available, use clearly labeled demo forecast data rather than pretending it is live real-time weather.

LOCATION/TRAVEL
Include travel-time and distance estimates between activities. Use a service abstraction for maps/routing. If no API key is available, use reasonable demo estimates based on structured activity locations rather than pretending they came from a live maps API.

ITINERARY ENGINE
Represent the itinerary with structured objects containing at minimum:
id, date, startTime, endTime, title, category, location, estimatedCost, estimatedTravelMinutes, status, notes.
Keep trip constraints in structured state.
Implement basic conflict detection based on overlapping time windows and travel time.
Budget calculations must be derived from itinerary data, not hardcoded summary numbers.
When replanning, preserve unaffected itinerary items and update only what is necessary.

DESIGN / UX
Create a premium modern travel-tech interface, not a generic AI chatbot.
Use a clean editorial SaaS aesthetic, strong typography, generous spacing, subtle gradients, cards, timeline/schedule components and clear status badges.
The dashboard should feel like an actual travel command center.
Make the disruption flow visually obvious.
Use responsive design for desktop and mobile.
Avoid excessive animations.
Use accessible contrast, clear labels and usable forms.

TECHNICAL
Use the default Lovable full-stack TypeScript stack.
Keep components modular and maintainable.
Keep API keys/secrets server-side if external integrations are added.
Use environment variables for integrations.
Do not expose fake “live API” claims.
Add loading, empty, error and success states.
Seed the prototype with realistic demo activity data for at least one destination so the evaluator can immediately test the full workflow without external API setup.
Make the initial demo experience work end-to-end immediately.

DEMO DESTINATION
Seed Jaipur, India as the primary demo destination with realistic example activities covering history/architecture/food, varied locations and estimated costs. The user should be able to generate a sample trip and then trigger an activity disruption to demonstrate automatic replanning.

SUCCESS CRITERIA
A judge should be able to open the app, enter trip constraints, generate an itinerary, see budget/weather/travel information, trigger an activity cancellation, watch the agent analyze and replan, and see the updated itinerary plus a clear explanation of changes.

Do not stop at UI generation. Implement the functional state, itinerary generation logic, conflict detection, alternative selection and replanning workflow needed for the above MVP.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c0774b92-0335-4a8a-923a-3f15b1510a10).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
