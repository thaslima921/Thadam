# THADAM TN — HOME PAGE SPECIFICATION (docs/HOME.md)

## PURPOSE
Home answers one question: what do you want to experience?
It must get a first-time user to a generated trip in 3 taps, and bring a returning user back to their trip in 1 tap.
It is the only screen where the Arch hero is used.

## LAYOUT (Top to Bottom, 20 px side padding, scrolls, bottom tabs fixed)

1. **Top bar**
   - Left: greeting by time of day with profile name ('Vanakkam, Sanjay'; 'Good evening' in English).
   - Right: language toggle (EN | தமிழ்), notification bell with unread badge, avatar that opens Profile.

2. **Live trip pill** (only if a trip is active)
   - Full-width, primary colour: 'Your journey is live' with next stop and Resume button.
   - Moves above everything else when active.

3. **Arch hero**
   - Heading (H1): *What do you want to experience?*
   - Primary button: *Plan my trip* (opens planner at step 1)
   - Secondary button: *Near me* (opens Explore filtered to Nearby; asks for location with reason; shows city picker if denied)

4. **Quick starts** (horizontal chips, 4 presets from docs/INPUTS.md)
   - *Weekend getaway*, *Heritage trail*, *Hidden gems*, *Family trip*.
   - Tap fills planner with preset and opens the first step that still needs input.

5. **Continue card** (only if draft or saved trip exists)
   - Title: *Continue your <destination> trip*.
   - Shows progress label ('Step 3 of 5' or 'Plan ready, review Day 2'), last edited time, and *Resume* button.
   - Most recent shown with 'See all trips' link.
   - If changes detected (closed place, slot change), show 'N changes' badge.

6. **Profile prompt** (only if completeness < 100%, once per session, dismissible)
   - 'Your profile is 60 percent complete. Add your interests to personalise Thadam.'
   - Button: *Complete profile*.

7. **Based on you** (carousel, up to 5 cards)
   - Source: `recommendForYou(profile, data, 5)`.
   - Card: image/gradient, name, area, tier badge (Famous, Moderate, Hidden), StatusBadge for pressure with DataBadge, Match percentage, reason chip ('Matches Historical').
   - Tap opens place details. Heart saves.
   - If personalisation is off: title becomes 'Popular and verified', no match percentages.

8. **Low crowd right now** (list, up to 4)
   - Verified places with Comfortable pressure.
   - Shows StatusBadge, DataBadge (DEMO) and distance from start city.
   - Note: 'Pressure is estimated' when source is not live.

9. **Hidden discoveries** (carousel, up to 5)
   - Title: *Beyond the usual route*. Subtitle: *A verified place beyond the usual route*.
   - Verified lesser-discovered places with Verified badge and plain-word reason ('Few visitors, strong cultural value').

10. **Trails** (horizontal cards, 3 curated routes from seed data)
    - *Chola temples trail* (Thanjavur, Darasuram, Gangaikonda Cholapuram)
    - *Craft and silk trail* (Swamimalai, Thirubuvanam, Thanjavur painting)
    - *Kumbakonam temple trail* (Sarangapani, Nageswaran, Darasuram)
    - Button: *Start this trail* (generates trip from route and opens plan).

11. **Local experiences** (carousel, up to 5)
    - Title: *Meet the people behind the place*.
    - Card: title, price, duration, seats left (updates live from bus), provider with Verified badge.
    - Tap opens booking.

12. **Nearby** (list, only after location permission)
    - Places within 50 km, sorted by distance.
    - Shows city picker if permission denied.

## STATES
- **First-time user**: sections 1, 3, 4, 6 (profile prompt), 9, 10, 11. Hide 5 and 7 personalised content, show 'Popular and verified' in place of 7.
- **Returning with a draft**: 5 appears right under quick starts.
- **Active trip**: 2 appears first; 3 and 4 remain below.
- **Offline**: show banner 'Live information is temporarily unavailable. Your saved trip is still accessible.'
- **Loading**: skeleton cards. No full-screen spinners.
- **Section error**: inline message with Retry button for that section only.

## DATA AND REFRESH
Compute all sections from pure engine functions in `src/engine/`: `recommendForYou`, `lowCrowdNow`, `hiddenDiscoveries`, `localExperiences`, `nearby`, `trails`. Cache for 10 minutes. Update affected card on realtime event.
