PRODUCT
Thadam TN (tagline: Explore Beyond the Famous. Empower the Local.) turns a tourist's selected preferences into an editable, explainable multi-day Tamil Nadu trip. It then adapts the trip when conditions change. It must not be a chatbot or a directory.
Core journey: SELECT -> GENERATE -> REVIEW -> EDIT -> LIVE TRIP -> ADAPT -> BOOK.
UX principle: selection first. Use chips, cards, counters, sliders, date pickers and bottom sheets. Typing is optional.

STACK (fixed)
Expo (latest stable SDK), Expo Router, TypeScript, Zustand with persist (AsyncStorage), react-native-svg, react-native-maps (with a fallback), expo-location (active trip only), react-native-qrcode-svg, expo-font with @expo-google-fonts/cormorant-garamond and @expo-google-fonts/hind-madurai, jest-expo for engine tests. Enable the web target (react-native-web) so the same app runs in a browser for the demo.

FOLDERS
app/                 Expo Router screens
src/engine/          pure logic: types, config, filters, score, schedule, budget, facilities, explain, generate, replace, adapt
src/services/        interfaces + demo implementations (Destination, Experience, Routing, Facility, Realtime, Notification, Planner)
src/store/           session, preferences, trip, bookings, events, notifications
src/features/        feature components
src/components/ui/   design system components
src/data/            seed data from docs/DATA.md

DATA TRUST
Every record has: source, verificationStatus, updatedAt. Every status value shows a DataBadge: LIVE, RECENT, PREDICTED, ESTIMATED or DEMO. Seeded values are always DEMO. Never present demo data as official or live. Missing data shows 'Information unavailable'.

REALTIME (works with no backend)
RealtimeService has publish(event) and subscribe(type, handler).
Default DemoBus: in-memory, plus BroadcastChannel on web so a second browser tab with the Demo Control screen updates the tourist tab.
On a phone, Demo Control is a protected screen inside the app that publishes to the same bus.
Event types: BOOKING_CREATED, CAPACITY_CHANGED, EXPERIENCE_PAUSED, DESTINATION_OPENED, DESTINATION_CLOSED, PRESSURE_CHANGED, ROUTE_DISRUPTION, ADMIN_ALERT.
Payload: { type, destinationId?, experienceId?, value?, reason?, timestamp }.
A SupabaseRealtime adapter is optional and comes last.

ENGINE CONTRACTS (src/engine)
generateTrip(req, data, cfg) -> Trip, plus a stage log used by the loading screen
replaceStop(trip, stopId, reason, data, cfg) -> up to 3 Alternative objects
applyReplacement(trip, stopId, altId, data, cfg) -> Trip (recomputes only the affected day segment)
adaptTrip(event, trip, prefs, data, cfg) -> AdaptationProposal | null (null when the event does not affect the trip)
explain(stop, factors) -> string[] built only from factors, never free text

GENERATION RULES
1. Hard filters first: unverified, closed, outside opening hours, no capacity, too far for max continuous travel, violates accessibility or facility requirements. Filters override scores.
2. Score weights live in config.ts: intent 30, destination preference 15, capacity 15, pressure 15, trust 10, local value 10, accessibility 5.
3. Destination preference uses the Famous, Moderate, Hidden percentages. They always total 100.
4. Schedule: start 9:00. Relaxed = 2 stops a day, Balanced = 3, Packed = 4. Add a lunch slot. Respect opening hours and maximum continuous travel.
5. Travel time = straight-line distance x 1.3, divided by speed for the transport mode. Label it ESTIMATED.
6. Budget: estimate stay (per room, per night), food (per person, per day), transport (per km), entry fees and experiences. Show total, remaining or over-budget amount.
7. Facility coverage thresholds (config): hospital 20 km, pharmacy 10 km, stay 15 km, fuel 15 km. Remote = hospital over 30 km or three or more thresholds exceeded. Coverage labels: Good, Limited, Remote, always as text.
8. Alerts are travel information, never medical advice.
9. The language model is optional. If an AI adapter is configured it may parse free text into the TripRequest and rephrase explanations. It never picks places. Without it, use templates.

TRIP SCORECARD
estimated cost vs budget, readiness out of 100, hidden discoveries, local experiences, total travel time, facility coverage.

ADAPTATION RULES
Adapt only for: destination closed, experience paused or unavailable, route disruption, high-priority admin alert. Never change the plan silently. Flow: validate, find affected stops, generate alternatives, explain, ask the user, update only the affected section, update the map.

PRIVACY
Use location only during an active trip. Explain why before asking. Stop tracking is always visible. Demo mode uses a simulated position along the route.

## SPEC ADDENDUM (Profile, Saved Trips, Notifications & Home)

### ADDITIONAL ENGINE FUNCTIONS (pure, tested)
- matchScore(place, profile, data, cfg) -> { score: number; factors: Factor[] }
- recommendForYou(profile, data, n) -> Recommendation[]  // verified only, hard filters first, personalisation off returns popular verified
- lowCrowdNow(data, startCity, n) -> Place[]
- hiddenDiscoveries(profile, data, n) -> Place[]
- localExperiences(profile, data, n) -> Experience[]
- nearby(location, data, radiusKm, n) -> Place[]
- trailToRequest(trailId, profile) -> TripRequest
- evaluatePreferenceMatch(event, profile, data, history) -> NotificationDraft | null
- detectTripChanges(savedTrip, data, since) -> Change[]

### NEW STORES
- profileStore: profile state, completeness, privacy settings, trusted contact
- savedTripsStore: autosave with debounce, versions, 4 filters (drafts, saved, upcoming, past)
- notificationStore: items, unread count, settings, history for dedupe and limits

### NEW EVENTS
- NEW_PLACE_VERIFIED { type: 'NEW_PLACE_VERIFIED', destinationId: string, timestamp: string }
- NEW_EXPERIENCE_LIVE { type: 'NEW_EXPERIENCE_LIVE', experienceId: string, timestamp: string }
