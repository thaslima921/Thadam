import { DESTINATIONS } from '../data/destinations';
import { EXPERIENCES } from '../data/experiences';
import { TouristPreferences } from '../types/preferences';
import { Destination, Experience, Trip, TripDay, TripStop } from '../types/database';
import { RECOMMENDATION_WEIGHTS } from '../config/constants';

// Calculate Haversine distance in km
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function scoreDestination(dest: Destination, prefs: TouristPreferences): { score: number; reasons: string[] } {
  const weights = RECOMMENDATION_WEIGHTS;
  const reasons: string[] = [];

  // 1. Intent Match (Tags match user interests)
  let matchingTagsCount = 0;
  for (const interest of prefs.interests) {
    if (dest.tags.includes(interest)) {
      matchingTagsCount++;
    }
  }
  const intentMatchScore = prefs.interests.length > 0
    ? (matchingTagsCount / prefs.interests.length) * 100
    : 70;
  if (matchingTagsCount > 0) {
    reasons.push(`Matches your interest in ${prefs.interests.slice(0, 2).join(' & ')}`);
  }

  // 2. Destination Preference (Famous vs Moderate vs Hidden match)
  let destPrefScore = 50;
  if (dest.popularityType === 'famous') {
    destPrefScore = prefs.destinationMix.famous;
  } else if (dest.popularityType === 'moderate') {
    destPrefScore = prefs.destinationMix.moderate;
  } else if (dest.popularityType === 'hidden') {
    destPrefScore = prefs.destinationMix.hidden;
    if (dest.discoveryScore >= 80) {
      reasons.push(`High discovery value (${dest.discoveryScore}/100) — verified lesser-known heritage`);
    }
  }

  // 3. Capacity Suitability
  const capacityScore = Math.min(100, (dest.capacity / 2000) * 100);

  // 4. Crowd Suitability
  let crowdScore = 70;
  if (prefs.crowdPreference === 'Low') {
    if (dest.pressureLevel === 'LOW') {
      crowdScore = 100;
      reasons.push('Low crowd pressure fits your tranquil travel style');
    } else if (dest.pressureLevel === 'MODERATE') {
      crowdScore = 60;
    } else {
      crowdScore = 30;
    }
  } else if (prefs.crowdPreference === 'Moderate') {
    crowdScore = dest.pressureLevel === 'HIGH' ? 50 : 85;
  } else {
    crowdScore = 80;
  }

  // 5. Trust Score
  const trustScore = dest.trustScore;
  if (dest.verificationStatus === 'verified' && dest.trustScore >= 95) {
    reasons.push(`Verified official heritage record (${dest.trustScore}% trust index)`);
  }

  // 6. Local Experience Value
  const hasLocalExp = EXPERIENCES.some((e) => e.destinationId === dest.id && e.status === 'ACTIVE');
  const localExpScore = hasLocalExp ? 100 : 40;
  if (hasLocalExp) {
    reasons.push('Verified local artisan / guide experience available nearby');
  }

  // 7. Accessibility & Facilities
  let accessScore = 80;
  if (prefs.facilityRequirements.hospitalNearby && dest.facilities.hospitalKm <= 5.0) {
    accessScore += 10;
    reasons.push(`Emergency hospital access within ${dest.facilities.hospitalKm} km`);
  }
  if (prefs.facilityRequirements.wheelchairAccessible && dest.accessibility.wheelchair) {
    accessScore += 10;
  }

  const finalScore = Math.round(
    intentMatchScore * weights.intentMatch +
    destPrefScore * weights.destinationPref +
    capacityScore * weights.capacitySuitability +
    crowdScore * weights.crowdSuitability +
    trustScore * weights.trustScore +
    localExpScore * weights.localExperienceValue +
    accessScore * weights.accessibility
  );

  return {
    score: Math.min(99, Math.max(40, finalScore)),
    reasons: reasons.slice(0, 4),
  };
}

export function generateItinerary(prefs: TouristPreferences): Trip {
  // 1. Filter eligible destinations by region & operational status
  const candidates = DESTINATIONS.filter((d) => {
    if (d.status === 'CLOSED') return false;
    if (prefs.facilityRequirements.wheelchairAccessible && !d.accessibility.wheelchair) {
      // soft filter or prefer accessible
    }
    return true;
  });

  // 2. Score candidates
  const scored = candidates.map((dest) => {
    const { score, reasons } = scoreDestination(dest, prefs);
    return { dest, score, reasons };
  });

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  // Group by popularity type to satisfy destination mix
  const famous = scored.filter((s) => s.dest.popularityType === 'famous');
  const moderate = scored.filter((s) => s.dest.popularityType === 'moderate');
  const hidden = scored.filter((s) => s.dest.popularityType === 'hidden');

  const days: TripDay[] = [];
  const daysCount = prefs.daysCount || 4;

  let totalHiddenCount = 0;
  let totalLocalExpCount = 0;
  let totalEstimatedSpend = 0;

  // Timings for typical days
  const timeSlots = [
    { start: '09:00 AM', end: '11:30 AM', duration: 150 },
    { start: '12:00 PM', end: '01:30 PM', duration: 90 }, // Midday / craft or food
    { start: '03:30 PM', end: '05:30 PM', duration: 120 },
    { start: '06:00 PM', end: '08:00 PM', duration: 120 },
  ];

  const usedDestIds = new Set<string>();

  for (let d = 1; d <= daysCount; d++) {
    const dayStops: TripStop[] = [];
    let dayCost = 0;
    let dayTravelMinutes = 0;

    // Determine target selection for this day based on requested destinationMix
    // e.g. Day 1: Famous + Moderate, Day 2: Hidden + Craft Experience, Day 3: Famous + Hidden, Day 4: Moderate + Hidden
    const dayTheme =
      d === 1
        ? 'Chola Imperial Foundations & Royal Court'
        : d === 2
        ? 'Living Bronze Crafts & Chariot Temples'
        : d === 3
        ? 'Hidden Micro-Sculptures & Pure Silk Weaving'
        : 'Sacred Water Tanks, Sacred Architecture & Coffee Culture';

    const numStopsThisDay = prefs.travelStyle === 'Relaxed' ? 2 : prefs.travelStyle === 'Balanced' ? 3 : 4;

    for (let s = 0; s < numStopsThisDay; s++) {
      // Pick next best unused destination matching mix
      let pick = scored.find((item) => !usedDestIds.has(item.dest.id));
      if (!pick) {
        pick = scored[s % scored.length];
      }
      usedDestIds.add(pick.dest.id);

      if (pick.dest.popularityType === 'hidden') {
        totalHiddenCount++;
      }

      // Check if an experience matches this destination
      const matchedExp = EXPERIENCES.find((e) => e.destinationId === pick.dest.id && e.status === 'ACTIVE');
      if (matchedExp) {
        totalLocalExpCount++;
      }

      const slot = timeSlots[s % timeSlots.length];
      const stopCost = pick.dest.entryFee + (matchedExp ? matchedExp.price : 0);
      dayCost += stopCost;

      const stop: TripStop = {
        id: `stop-${d}-${s + 1}-${pick.dest.id}`,
        tripId: `trip-thadam-${Date.now()}`,
        dayNumber: d,
        destinationId: pick.dest.id,
        destination: pick.dest,
        experienceId: matchedExp?.id,
        experience: matchedExp,
        startTime: slot.start,
        endTime: slot.end,
        durationMinutes: slot.duration,
        orderIndex: s,
        status: 'PLANNED',
        estimatedCost: stopCost,
        aiReasons: pick.reasons,
        scoreMatch: pick.score,
        crowdStatus: pick.dest.pressureLevel,
        dataFreshness: pick.dest.dataFreshness,
        distanceFromPrevKm: s === 0 ? 0 : 8.4,
        travelMinutesFromPrev: s === 0 ? 0 : 20,
      };

      dayStops.push(stop);
      dayTravelMinutes += stop.travelMinutesFromPrev || 0;
    }

    totalEstimatedSpend += dayCost;

    days.push({
      dayNumber: d,
      date: `2026-10-${14 + d}`,
      title: `Day ${d}: ${dayTheme}`,
      theme: dayTheme,
      stops: dayStops,
      totalTravelMinutes: dayTravelMinutes,
      totalEstimatedCost: dayCost,
    });
  }

  return {
    id: `trip-thadam-${Date.now()}`,
    userId: 'usr-tourist-01',
    title: `Tamil Nadu Heritage & Living Crafts — ${prefs.destination}`,
    startDate: prefs.startDate,
    endDate: prefs.endDate,
    daysCount,
    budget: prefs.budget,
    estimatedSpend: Math.min(prefs.budget, totalEstimatedSpend + daysCount * 1200), // add estimated transport/lodging
    hiddenDiscoveriesCount: totalHiddenCount,
    localExperiencesCount: totalLocalExpCount,
    totalTravelMinutes: days.reduce((sum, d) => sum + d.totalTravelMinutes, 0),
    facilityReadiness: 'GOOD',
    status: 'DRAFT',
    days,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function findAlternatives(
  currentStop: TripStop,
  reason: string,
  prefs: TouristPreferences,
  currentTrip: Trip
): Array<{
  destination: Destination;
  scoreMatch: number;
  distanceKm: number;
  estimatedCost: number;
  reasons: string[];
  experience?: Experience;
}> {
  // Collect currently used destination IDs
  const usedIds = new Set<string>();
  currentTrip.days.forEach((day) => {
    day.stops.forEach((s) => usedIds.add(s.destinationId));
  });

  // Candidate pool: not current stop, not already in trip, and OPEN
  const candidates = DESTINATIONS.filter(
    (d) => d.id !== currentStop.destinationId && !usedIds.has(d.id) && d.status === 'OPEN'
  );

  const scoredAlternatives = candidates.map((dest) => {
    const dist = calculateDistanceKm(
      currentStop.destination.lat,
      currentStop.destination.lng,
      dest.lat,
      dest.lng
    );

    let baseScore = 80;
    const reasons: string[] = [];

    if (reason === 'Too crowded') {
      if (dest.pressureLevel === 'LOW') {
        baseScore += 18;
        reasons.push('Significantly lower crowd pressure (Tranquil atmosphere)');
      } else if (dest.pressureLevel === 'MODERATE') {
        baseScore += 5;
        reasons.push('Balanced visitor density');
      }
    } else if (reason === 'Need more hidden places') {
      if (dest.popularityType === 'hidden') {
        baseScore += 20;
        reasons.push(`Verified lesser-known discovery (${dest.discoveryScore}/100 discovery gap)`);
      }
    } else if (reason === 'Too expensive') {
      if (dest.entryFee === 0) {
        baseScore += 15;
        reasons.push('Free entry fits tighter daily budget');
      }
    }

    if (dist <= 15) {
      baseScore += 10;
      reasons.push(`Within convenient travel radius (${dist} km away)`);
    }

    const matchedExp = EXPERIENCES.find((e) => e.destinationId === dest.id && e.status === 'ACTIVE');
    if (matchedExp) {
      baseScore += 8;
      reasons.push(`Features verified local experience: ${matchedExp.name}`);
    }

    if (dest.facilities.coverage === 'GREEN') {
      reasons.push(`Excellent nearby facility readiness (Hospital ${dest.facilities.hospitalKm} km)`);
    }

    return {
      destination: dest,
      scoreMatch: Math.min(99, baseScore),
      distanceKm: dist,
      estimatedCost: dest.entryFee + (matchedExp ? matchedExp.price : 0),
      reasons: reasons.slice(0, 3),
      experience: matchedExp,
    };
  });

  // Sort descending and return EXACTLY 3 strong candidates as per Specification Section 18!
  scoredAlternatives.sort((a, b) => b.scoreMatch - a.scoreMatch);
  return scoredAlternatives.slice(0, 3);
}

export function replaceTripStop(
  trip: Trip,
  dayNumber: number,
  targetStopId: string,
  newDestination: Destination,
  newExperience?: Experience
): Trip {
  const updatedDays = trip.days.map((day) => {
    if (day.dayNumber !== dayNumber) return day;

    const updatedStops = day.stops.map((stop) => {
      if (stop.id !== targetStopId) return stop;

      const newCost = newDestination.entryFee + (newExperience ? newExperience.price : 0);
      return {
        ...stop,
        destinationId: newDestination.id,
        destination: newDestination,
        experienceId: newExperience?.id,
        experience: newExperience,
        estimatedCost: newCost,
        crowdStatus: newDestination.pressureLevel,
        dataFreshness: newDestination.dataFreshness,
        status: 'PLANNED' as const,
        scoreMatch: 95,
        aiReasons: [
          `Adaptive replacement chosen for lower crowd and high heritage authenticity`,
          `Maintains scheduled arrival at ${stop.startTime}`,
          `Nearby facility coverage: ${newDestination.facilities.coverage}`,
        ],
      };
    });

    const dayCost = updatedStops.reduce((sum, s) => sum + s.estimatedCost, 0);

    return {
      ...day,
      stops: updatedStops,
      totalEstimatedCost: dayCost,
    };
  });

  // Recalculate summary totals
  let hiddenCount = 0;
  let localExpCount = 0;
  let totalCost = 0;

  updatedDays.forEach((day) => {
    day.stops.forEach((s) => {
      if (s.destination.popularityType === 'hidden') hiddenCount++;
      if (s.experience) localExpCount++;
      totalCost += s.estimatedCost;
    });
  });

  return {
    ...trip,
    days: updatedDays,
    hiddenDiscoveriesCount: hiddenCount,
    localExperiencesCount: localExpCount,
    estimatedSpend: totalCost + trip.daysCount * 1200,
    updatedAt: new Date().toISOString(),
  };
}

export function removeTripStop(trip: Trip, dayNumber: number, stopId: string): Trip {
  const updatedDays = trip.days.map((day) => {
    if (day.dayNumber !== dayNumber) return day;
    const remainingStops = day.stops.filter((s) => s.id !== stopId);
    // Re-index remaining stops
    const reindexed = remainingStops.map((s, idx) => ({ ...s, orderIndex: idx }));
    return {
      ...day,
      stops: reindexed,
      totalEstimatedCost: reindexed.reduce((sum, s) => sum + s.estimatedCost, 0),
    };
  });

  return {
    ...trip,
    days: updatedDays,
    updatedAt: new Date().toISOString(),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// generateItineraryFromRanked
//
// Called when the THADAM AI backend returns ranked destinations.
// Converts backend recommendations into Destination objects (matched by name
// against the local seed dataset, or synthesised as stubs for unknowns).
// Then delegates to the existing scheduling / itinerary generation logic so
// the result UI is completely preserved.
// ─────────────────────────────────────────────────────────────────────────────
export function generateItineraryFromRanked(
  prefs: import('../types/preferences').TouristPreferences,
  rankedNames: Array<{
    destination_name: string;
    district: string;
    destination_category: string;
    latitude: number;
    longitude: number;
    entry_cost_inr: number;
    average_visit_duration_hours: number;
    average_visitor_rating_5: number;
    final_score: number;
    match_reasons: string[];
    matched_interests: string[];
  }>
): Trip {
  // Map backend ranked destinations to Destination objects
  const mapped: Array<{ dest: Destination; score: number; reasons: string[] }> =
    rankedNames.map((rec) => {
      // Try to find a matching local seed destination by name (case-insensitive)
      const nameLower = rec.destination_name.toLowerCase();
      const found = DESTINATIONS.find(
        (d) =>
          d.name.toLowerCase() === nameLower ||
          d.name.toLowerCase().includes(nameLower.slice(0, 15))
      );

      if (found) {
        return {
          dest: found,
          score: Math.round(rec.final_score * 100),
          reasons: rec.match_reasons,
        };
      }

      // Synthesise a stub Destination for backend entries not in the local seed
      const stubDest: Destination = {
        id: `ai-${rec.destination_name.toLowerCase().replace(/\s+/g, '-')}`,
        name: rec.destination_name,
        district: rec.district,
        region: rec.district,
        description: `${rec.destination_category} destination in ${rec.district}, Tamil Nadu.`,
        lat: rec.latitude,
        lng: rec.longitude,
        category: rec.destination_category,
        tags: rec.matched_interests,
        popularityType: 'moderate',
        verificationStatus: 'verified',
        trustScore: Math.round(rec.average_visitor_rating_5 * 20),
        discoveryScore: 60,
        capacity: 500,
        openingHours: '06:00 AM - 06:00 PM',
        entryFee: rec.entry_cost_inr,
        accessibility: { wheelchair: false, seniorFriendly: true, familyFriendly: true },
        facilities: {
          hospitalKm: 5,
          pharmacyKm: 3,
          hotelKm: 2,
          restaurantKm: 1,
          fuelKm: 3,
          policeKm: 4,
          transportKm: 2,
          coverage: 'GREEN',
        },
        image:
          'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
        source: 'thadam-ai',
        sourceUpdatedAt: new Date().toISOString().split('T')[0],
        confidence: 90,
        status: 'OPEN',
        pressureLevel: 'LOW',
        dataFreshness: 'DEMO',
      };

      return {
        dest: stubDest,
        score: Math.round(rec.final_score * 100),
        reasons: rec.match_reasons,
      };
    });

  // Delegate to the existing scheduling logic using our AI-ranked order
  return _buildTripFromScored(prefs, mapped);
}

/**
 * Internal: shared scheduling logic extracted from generateItinerary.
 * Builds a Trip from pre-scored destinations in ranked order.
 */
function _buildTripFromScored(
  prefs: import('../types/preferences').TouristPreferences,
  scored: Array<{ dest: Destination; score: number; reasons: string[] }>
): Trip {
  const timeSlots = [
    { start: '09:00 AM', end: '11:30 AM', duration: 150 },
    { start: '12:00 PM', end: '01:30 PM', duration: 90 },
    { start: '03:30 PM', end: '05:30 PM', duration: 120 },
    { start: '06:00 PM', end: '08:00 PM', duration: 120 },
  ];

  const usedDestIds = new Set<string>();
  const days: TripDay[] = [];
  const daysCount = prefs.daysCount || 4;
  let totalHiddenCount = 0;
  let totalLocalExpCount = 0;
  let totalEstimatedSpend = 0;

  const dayThemes = [
    'Heritage & Discovery',
    'Living Crafts & Culture',
    'Hidden Gems & Local Life',
    'Sacred Spaces & Scenic Routes',
  ];

  for (let d = 1; d <= daysCount; d++) {
    const dayStops: TripStop[] = [];
    let dayCost = 0;
    let dayTravelMinutes = 0;

    const numStopsThisDay =
      prefs.travelStyle === 'Relaxed' ? 2 : prefs.travelStyle === 'Balanced' ? 3 : 4;

    for (let s = 0; s < numStopsThisDay; s++) {
      let pick = scored.find((item) => !usedDestIds.has(item.dest.id));
      if (!pick) {
        pick = scored[s % scored.length];
      }
      usedDestIds.add(pick.dest.id);

      if (pick.dest.popularityType === 'hidden') totalHiddenCount++;

      const matchedExp = EXPERIENCES.find(
        (e) => e.destinationId === pick!.dest.id && e.status === 'ACTIVE'
      );
      if (matchedExp) totalLocalExpCount++;

      const slot = timeSlots[s % timeSlots.length];
      const stopCost = pick.dest.entryFee + (matchedExp ? matchedExp.price : 0);
      dayCost += stopCost;

      const stop: TripStop = {
        id: `stop-${d}-${s + 1}-${pick.dest.id}`,
        tripId: `trip-thadam-${Date.now()}`,
        dayNumber: d,
        destinationId: pick.dest.id,
        destination: pick.dest,
        experienceId: matchedExp?.id,
        experience: matchedExp,
        startTime: slot.start,
        endTime: slot.end,
        durationMinutes: slot.duration,
        orderIndex: s,
        status: 'PLANNED',
        estimatedCost: stopCost,
        aiReasons: pick.reasons,
        scoreMatch: pick.score,
        crowdStatus: pick.dest.pressureLevel,
        dataFreshness: pick.dest.dataFreshness,
        distanceFromPrevKm: s === 0 ? 0 : 8.4,
        travelMinutesFromPrev: s === 0 ? 0 : 20,
      };

      dayStops.push(stop);
      dayTravelMinutes += stop.travelMinutesFromPrev || 0;
    }

    totalEstimatedSpend += dayCost;

    const theme = dayThemes[(d - 1) % dayThemes.length];
    days.push({
      dayNumber: d,
      date: prefs.startDate
        ? new Date(
            new Date(prefs.startDate).getTime() + (d - 1) * 86400000
          )
            .toISOString()
            .split('T')[0]
        : `2026-10-${14 + d}`,
      title: `Day ${d}: ${theme}`,
      theme,
      stops: dayStops,
      totalTravelMinutes: dayTravelMinutes,
      totalEstimatedCost: dayCost,
    });
  }

  return {
    id: `trip-thadam-${Date.now()}`,
    userId: 'usr-tourist-01',
    title: `Tamil Nadu — ${prefs.destination}`,
    startDate: prefs.startDate,
    endDate: prefs.endDate,
    daysCount,
    budget: prefs.budget,
    estimatedSpend: Math.min(prefs.budget, totalEstimatedSpend + daysCount * 1200),
    hiddenDiscoveriesCount: totalHiddenCount,
    localExperiencesCount: totalLocalExpCount,
    totalTravelMinutes: days.reduce((sum, d) => sum + d.totalTravelMinutes, 0),
    facilityReadiness: 'GOOD',
    status: 'DRAFT',
    days,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
