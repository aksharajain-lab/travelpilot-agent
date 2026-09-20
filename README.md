# TravelPilot Agent

### Intelligent Trip Planning & Disruption Management Agent

> **TravelPilot doesn't just create a trip plan — it manages the plan when reality changes.**

TravelPilot is an agentic AI travel assistant that generates personalized itineraries and dynamically replans them when activities become unavailable or schedules change.

Unlike a conventional travel chatbot, TravelPilot maintains a structured itinerary state, detects conflicts, evaluates alternatives against user constraints, and updates the affected portion of the trip.

---

## The Problem

Travel itineraries are highly interconnected.

A cancelled activity can affect:

- Schedule and time windows
- Travel routes and durations
- Budget allocation
- Downstream activities
- User preferences

Most travel planners stop after generating an itinerary.

**TravelPilot manages what happens next.**

---

## How It Works

```text
User Constraints
       ↓
Generate Itinerary
       ↓
Monitor Trip State
       ↓
Activity Disrupted
       ↓
Analyze Impact
       ↓
Detect Conflicts
       ↓
Evaluate Alternatives
       ↓
Recalculate Time + Cost
       ↓
Apply Revised Itinerary

The system preserves unaffected activities and replans only the portion of the itinerary that needs to change.

Core Features
Personalized day-by-day itinerary generation
Dynamic budget tracking
Location and travel-time awareness
Weather estimates
Schedule conflict detection
Automatic itinerary replanning
Constraint-based alternative selection
Natural-language trip assistant
Interactive trip dashboard
Agentic Workflow

For example, when Hawa Mahal becomes unavailable, TravelPilot:

Identifies the affected activity and time slot
Inspects the existing itinerary
Detects downstream conflicts
Evaluates alternative activities using interests, timing, location, transport and budget
Recalculates travel time and cost
Updates the affected itinerary segment
Explains what changed
Architecture

TravelPilot uses a structured itinerary state instead of treating every request as an independent AI response.

User Input
    ↓
Itinerary Engine
    ↓
Structured Trip State
    ↓
Conflict Detection
    ↓
Constraint Evaluation
    ↓
Agentic Replanner
    ↓
Updated Itinerary
    ↓
Dashboard + Assistant

Each itinerary activity is represented using structured attributes including:

id · date · startTime · endTime · title · category · location · estimatedCost · estimatedTravelMinutes · status

This allows the system to reason over the existing trip state and make targeted modifications rather than regenerating the entire itinerary.

Tech Stack
Frontend
React — Component-based UI architecture
TypeScript — Type-safe application logic and data models
Vite — Development server and production build tooling
Tailwind CSS — Utility-first styling and responsive layouts
shadcn/ui — Accessible, reusable interface components
Agent & Application Logic
Structured itinerary state — Centralized representation of trip constraints and activities
Constraint-based reasoning — Time, budget, location and scheduling checks
Agentic replanning workflow — Disruption analysis, conflict detection, alternative evaluation and itinerary updates
Natural-language interaction — Conversational interface operating against the current itinerary state
Data & Service Layer
Demo activity dataset — Structured Jaipur activities used for reliable hackathon demonstrations
Weather service abstraction — Allows integration with a live weather provider
Routing service abstraction — Supports travel-time and distance estimation
Environment variables — Designed for securely configuring external API integrations
Development & Deployment
Lovable — AI-assisted application development
GitHub — Source control and collaboration
Vercel / Lovable deployment — Production deployment ready
Demo

The MVP is seeded with Jaipur, India, with activities spanning:

History
Architecture
Food
Culture

The complete workflow can be demonstrated without requiring external API keys:

Create Trip
    ↓
Generate Itinerary
    ↓
Trigger Activity Disruption
    ↓
Agent Analyzes Impact
    ↓
Alternative Selected
    ↓
Itinerary Replanned
    ↓
Budget + Schedule Updated
Running Locally
git clone https://github.com/aksharajain-lab/travelpilot-agent.git
cd travelpilot-agent
npm install
npm run dev
Hackathon

TravelPilot was developed as a 48-hour Agentic AI Hackathon prototype.

The project focuses on a functional agentic workflow rather than a static AI interface, with structured state, constraint evaluation, decision-making and application-state updates at its core.

Built by

Akshara Jain and Daksh Sharma 

AI-assisted development tools were used during implementation. Product direction, architecture, workflow design, testing and iteration were human-directed.

Plan the trip. Adapt when reality changes.
