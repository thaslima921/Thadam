# THADAM TN (தடம்)

> **Explore Beyond the Famous. Empower the Local.**  
> *An Adaptive AI Tourism Platform for Tamil Nadu*

---

## 🏛️ Executive Summary

Existing tourism platforms help tourists decide *where to go*. **THADAM TN helps determine where tourism should flow.**

THADAM TN is an Android-first, cross-platform adaptive AI tourism prototype built for the Tamil Nadu Digital Tourism initiative. Rather than presenting a generic directory or an ungrounded chat interface, THADAM is a **selection-first adaptive journey builder** combining:

1. **Tourist Intent & Travel DNA:** Fast multi-factor selection (chips, sliders, counters) with zero typing required.
2. **Verified Destination Discovery:** Official heritage registry combined with high-value, under-discovered gems (*Pullamangai, Thirubuvanam, Tiruvalanjuli, Nachiyar Kovil*). **Never hallucinated by an LLM.**
3. **Route & Corridor Feasibility:** Multi-day geographic optimization along the Chola Heritage Belt (*Thanjavur–Kumbakonam*).
4. **Local Economic Empowerment:** Integrated booking marketplace for living crafts, master bronze sthapathis, silk weavers, and heritage food trails.
5. **Facility Intelligence Layer:** Proactive hospital, pharmacy, fuel, hotel, and emergency coverage assessment with strict threshold alerts.
6. **Realtime Dynamic Adaptation:** When a destination closes or a disruption occurs, THADAM recalculates **only the affected segment** and presents 3 verified alternatives instantly across all subscriber devices.

---

## 📱 Core Demonstration Sequence (Hackathon Demo)

Follow this 20-step walkthrough to reproduce the flagship demonstration:

1. **Launch App:** View the branded splash screen and welcome portal with tagline *Explore Beyond the Famous. Empower the Local.*
2. **Traveler DNA Onboarding:** Select language (English/Tamil), preferred travel style, crowd sensitivity, transport mode, and hospital distance requirements.
3. **Trip Planning (Create Trip):** 
   - Start: *Coimbatore* (or GPS).
   - Target Region: *Thanjavur–Kumbakonam (Chola Heritage Belt)*.
   - Duration: *4 Days*.
   - Budget: *₹10,000*.
   - Interests: *Historical, Traditional, Cultural*.
   - Destination Mix: *20% Famous • 40% Moderate • 40% Hidden Gems*.
   - Crowd: *Low*.
   - Facilities: *Hospital nearby & Hotel nearby checked*.
4. **AI Generation Pipeline:** Tap **`BUILD MY SMART TRIP`** to view the multi-stage deterministic planning sequence.
5. **Inspect Itinerary:** Review the Day 1–4 schedule, metrics, spend estimates, hidden discoveries count, and evidence-based explainability (*"Why THADAM chose this"*).
6. **Replace Destination Flow:**
   - On Day 2, tap **`🔄 Replace`** on a stop.
   - Select reason: *"Too crowded"*.
   - View **exactly 3 verified alternative candidates** with Match %, distance, entry fee, trust, and facility coverage.
   - Tap **`USE THIS PLACE`** — watch only the affected segment update with zero recalculation of unaffected days!
7. **GIS Map & Facility Layers:**
   - Tap **`🗺️ View Route & Facilities`** or switch to the **Map** tab.
   - Filter layers by *All Stops*, *✦ Hidden Gems*, *Hospitals*, *Hotels*, and *Fuel*.
   - Tap any pin to inspect verified details and nearby medical distance.
8. **Live Travel Mode:**
   - Tap **`START LIVE TRIP →`**.
   - Review live navigation ETA, current stop, next stop, and active facility safety indicators.
   - Tap *Emergency Directory* for 24x7 local police and hospital contacts.
9. **Admin Realtime Closure (The Core Demo Moment):**
   - Tap **`⚡ DEMO`** in the header or switch role to **Admin**.
   - Under Scenario 1, tap **`Trigger Closure Now ⚠️`** to simulate government closure of *Brihadeeswarar Temple*.
   - Switch back to Tourist role: Notice the **Disruption Alert Banner** immediately pops down:  
     `⚠️ Realtime Disruption: Brihadeeswarar Temple has been temporarily closed.`
10. **Adaptive Rerouting Acceptance:**
    - Tap **`ADAPT TRIP (3 ALTERNATIVES)`**.
    - Review the 3 candidate replacements calculated by THADAM to preserve route corridor and budget.
    - Tap **`ACCEPT THIS ALTERNATIVE & UPDATE DAY`**.
    - Day schedule and map update seamlessly in real time!
11. **Local Experience Booking:**
    - Switch to **Explore** or inspect Day 2's stop.
    - Open **`Swamimalai Chola Bronze Sculpting Masterclass`** by Master Craftsman Rajan.
    - Reserve 2 seats for ₹1,300.
    - View the generated **Digital Pass** with unique reference code and verification QR token.
12. **Partner Realtime Capacity Update:**
    - Switch role to **Local Partner** (*Master Craftsman Rajan*).
    - Notice available seats dropped from 5 to 4 or manually adjust seats (+ / −).
    - The change propagates across the entire platform in real time without refreshing.

---

## 🛠️ Tech Stack & Architecture

- **Mobile Framework:** React Native with Expo (SDK 57) & TypeScript.
- **State Management:** Zustand for lightweight reactive stores (`useTripStore`, `useAuthStore`, `useDemoStore`).
- **Database & Backend:** Supabase (PostgreSQL 15), Supabase Auth, Row Level Security (RLS), Supabase Realtime channels.
- **Mapping & GIS:** Cross-platform interactive GIS corridor canvas with coordinates, layer toggles, and marker selection.
- **AI Recommendation Engine:** Deterministic rule-based scoring engine operating over verified datasets with configurable weights:
  - 30% Intent Match
  - 15% Destination Preference (Famous/Moderate/Hidden mix)
  - 15% Capacity Suitability
  - 15% Crowd / Pressure Suitability
  - 10% Trust Score
  - 10% Local Experience Value
  - 5% Accessibility & Facility Readiness

---

## 📂 Project Directory Structure

```text
src/
├── types/
│   ├── database.ts         # Destinations, experiences, trips, stops, bookings
│   ├── preferences.ts      # Tourist DNA, travel styles, facility requirements
│   └── realtime.ts         # Typed realtime payloads (DESTINATION_CLOSED, CAPACITY_CHANGED)
├── config/
│   ├── theme.ts            # Design system tokens (Deep Indigo, Warm Sand, Subtle Gold)
│   ├── constants.ts        # Configurable scoring weights, pilot regions, demo credentials
│   └── env.ts              # Environment abstractions & service mode fallbacks
├── data/
│   ├── destinations.ts     # Verified registry: Thanjavur, Kumbakonam, Madurai, Coimbatore
│   ├── experiences.ts      # GI-tagged bronze sthapathis, silk handlooms, culinary trails
│   └── facilities.ts       # 24x7 hospitals, pharmacies, heritage stays, fuel, police
├── services/
│   ├── aiPlannerService.ts # Recommendation engine, 3-alternative replacement, explainability
│   ├── facilityService.ts  # Road network distances, Green/Yellow/Red readiness, medical alerts
│   ├── realtimeService.ts  # In-memory & Supabase Realtime publish-subscribe event bus
│   └── supabaseClient.ts   # Supabase client initialization
├── store/
│   ├── useTripStore.ts     # Current trip, preferences, bookings, active trip session
│   ├── useAuthStore.ts     # Tourist, Partner, Admin roles and switcher
│   └── useDemoStore.ts     # Realtime simulation triggers, status overrides, seat counters
├── components/
│   ├── common/             # Badges, Header, DisruptionAlertBanner
│   ├── itinerary/          # StopCard, ReplaceModal, PlaceDetailsModal, AdaptiveRerouteModal
│   ├── map/                # InteractiveMapView with GIS layers
│   └── experiences/        # BookingModal, DigitalTicketModal
└── features/
    ├── splash/             # Branded splash screen
    ├── welcome/            # Welcome hero & value propositions
    ├── onboarding/         # Selection-first travel DNA setup
    ├── home/               # Tourism dashboard, AI search, verified hidden gems
    ├── planner/            # CreateTripScreen (Sections A through N)
    ├── generation/         # Animated AI planning sequence
    ├── itinerary/          # Day tabs, editable stops, summary metrics, live trip CTA
    ├── explore/            # Smart filter sections & verified marketplace
    ├── map/                # Full-screen GIS corridor & facility map
    ├── liveTrip/           # Live travel session, ETA, facility warnings, emergency directory
    ├── partner/            # Local partner portal (slot controls, QR check-in, guild earnings)
    ├── admin/              # Government command center (closures, alerts, demand analytics)
    └── demoCenter/         # 1-tap hackathon demo control center
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18 or higher)
- npm / npx

### 2. Installation
```bash
# Navigate to workspace
cd "d:/projects/Thadam TN"

# Dependencies are already installed!
# Verify TypeScript build
npx tsc --noEmit
```

### 3. Running Locally
```bash
# Start Expo development server
npm start

# Run in Web preview (instant browser demo)
npm run web

# Or run on Android / iOS via Expo Go
npm run android
```

---

## 🗄️ Database & Supabase Setup

The complete PostgreSQL normalized schema with Row Level Security (RLS) policies is located at:
[`supabase/schema.sql`](file:///d:/projects/Thadam%20TN/supabase/schema.sql)

To apply to your live Supabase project:
1. Open your Supabase Dashboard -> **SQL Editor**.
2. Paste the contents of `supabase/schema.sql` and run.
3. Configure your `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` in `.env`.

---

## 🛡️ Data Trust & Honesty Layer

THADAM TN enforces strict data transparency:
- **`LIVE`**: Direct live signal.
- **`RECENT`**: Verified inspection updated recently.
- **`PREDICTED`**: Forecast/model calculation.
- **`ESTIMATED`**: Calculated approximation.
- **`DEMO`**: Hackathon prototype simulation.

*AI never invents destination names, government statistics, or medical access figures.*

---

**THADAM TN — Explore Beyond the Famous. Empower the Local.**
# Thadam
