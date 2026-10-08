# THADAM TN — PROFILE, TRIPS & NOTIFICATIONS SPECIFICATION (docs/PROFILE_TRIPS_NOTIFICATIONS.md)

## PROFILE
Created right after signup in 5 short steps, each skippable:
1. Name and language
2. Home city
3. Interests
4. Travel style, destination mix and crowd
5. Accessibility and facilities

### Fields
- `name`: string
- `photoUri`: optional string
- `language`: 'en' | 'ta'
- `homeCity`: string
- `interests`: string[]
- `travelStyle`: 'relaxed' | 'balanced' | 'packed'
- `destinationMix`: { famous: number; moderate: number; hidden: number }
- `crowd`: 'low' | 'moderate' | 'any'
- `transport`: string[]
- `accommodation`: string
- `food`: string[]
- `accessibility`: string[]
- `facilities`: string[]
- `defaultBudget`: optional number
- `trustedContact`: optional { name: string; phone: string }
- `notifications`: NotifPrefs
- `personalisation`: boolean
- `updatedAt`: string

### Completeness
Show a percentage on Profile and a card on Home ('Your profile is 60 percent complete') that opens the next missing step. Do not nag more than once per session.
Editing a profile updates "Based on you" on Home immediately and the defaults of the next new trip. It never rewrites trips that already exist.

### Privacy controls
- Use my travel history (on or off)
- Turn off personalisation
- Location permission status
- Export my data
- Delete my account

If personalisation is off: Home shows popular and verified places only, notifications about recommendations stop, and profile defaults still prefill the planner.

---

## SAVED TRIPS AND CONTINUE
1. A trip exists from the moment the user changes the first input. It is a draft and autosaves on every change (debounce 500 ms). There is no Save button for drafts.
2. When the engine generates a plan, status becomes `generated`. The user can name it and tap Save plan. Status becomes `saved`. An unsaved generated plan is still kept as a draft so nothing is lost.
3. **Continue**: Home and the Trips tab show a Continue card for the most recently edited draft or saved trip. It reopens at the exact place the user stopped: the same builder step with all answers, or the same day tab on the plan.
4. **Progress label examples**: 'Step 3 of 5', 'Plan ready, review Day 2', 'Booked, starts in 6 days'.
5. **Trips tab filters**: Drafts, Saved, Upcoming, Past. Each trip card has Continue, Rename, Duplicate and Delete. Delete asks for confirmation and offers Undo for 8 seconds.
6. Every edit to a generated plan stores a new version (`itinerary_versions`) so Undo works across sessions. Keep the last 10.
7. When a saved trip is opened, check what changed since `lastOpenedAt`: a destination closed, a booking slot changed, a start date in the past. Show a banner 'N things changed since you last opened this trip' with a list and Review changes. Never change the plan silently.
8. If the start date has passed, offer "Update dates", which recalculates days and keeps the chosen places where possible.
9. **Storage**: AsyncStorage by default. A Supabase adapter syncs the same shape later.

---

## PREFERENCE NOTIFICATIONS
**Purpose**: Tell the user when something new that matches their profile appears. Every message must say why it matched.

### Triggers (typed events)
- `NEW_PLACE_VERIFIED`
- `NEW_EXPERIENCE_LIVE`
- `PRESSURE_DROPPED` (a place on the user's saved list or strong match becomes Comfortable)
- `DRAFT_WAITING` (a draft untouched for 24 hours, sent once)
- `BOOKING_REMINDER` (24 hours and 2 hours before)
- `DESTINATION_CLOSED` (affects a saved or active trip)

### Match Rule (`src/engine/notify.ts`, pure function `evaluatePreferenceMatch`)
Send a recommendation only if all are true:
1. The place or experience is verified and not seen or notified before.
2. `matchScore` is at least 70 (same factors as planner: interests, destination mix, crowd, facilities, accessibility).
3. It shares at least 2 interests with the profile, or 1 interest plus the user's preferred destination type.
4. It is in the user's chosen region or within 150 km of the home city.
5. If crowd preference is Low, its pressure is not High or Very high.

### Limits
- At most 1 recommendation a day and user's weekly limit (default 3).
- No messages during quiet hours (default 21:00 to 08:00); queue them.
- Snooze for 7 days.
- "Not interested" reduces that interest's weight by a small bounded step in config.
- Trip updates and booking reminders are not rate limited but obey user switches.

### Message Format
- Title: a short fact (e.g., 'A new verified place near your route').
- Body: place name plus one reason built from matched factors ('Matches Historical and your hidden-places preference, comfortable right now').
- Status: Show a DataBadge for any status.
- Actions: View place, Add to my trip.
- Tone: Never use words like trending, live or official without a real source.

### Permissions
In-app Notification Center works without any permission. Ask for push permission only after the user saves their first trip, with a one-line reason. Push is optional and sits behind `NotificationService`.

### Notification Center
Bell icon with an unread badge on Home. Groups: Trip updates, For you, Bookings. Each item opens the related screen. Mark all read. Settings link opens switches, quiet hours and weekly limit.

### Demo Trigger
Start with place `p11` (Kallanai) as `verificationStatus: 'pending'` and hidden from the planner. Demo Control has a button 'Verify new place' that sets it verified and publishes `NEW_PLACE_VERIFIED`. The demo profile then receives:
> 'A new verified place near your route. Kallanai (Grand Anicut) matches Historical and your hidden-places preference.'
The notification appears in the bell, in a banner, and in the For you group.
