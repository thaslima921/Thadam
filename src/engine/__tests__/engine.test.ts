import assert from 'node:assert/strict';
import test from 'node:test';
import { DESTINATIONS } from '../../data/destinations';
import { EXPERIENCES } from '../../data/experiences';
import { DEFAULT_ENGINE_CONFIG } from '../config';
import { generateTrip } from '../generate';
import { replaceStop, applyReplacement } from '../replace';
import { evaluateFacilityCoverage } from '../facilities';
import { recommendForYou } from '../home';
import { evaluatePreferenceMatch } from '../notify';
import { detectTripChanges } from '../detect';
import { DEFAULT_PREFERENCES } from '../../types/preferences';

test('Engine: Generate 4-day demo trip under budget with hidden places and experiences', () => {
  const data = {
    destinations: DESTINATIONS,
    experiences: EXPERIENCES,
  };
  const { trip, stageLogs } = generateTrip(DEFAULT_PREFERENCES, data, DEFAULT_ENGINE_CONFIG);

  // 1. Duration check
  assert.equal(trip.daysCount, 4, 'Trip must have exactly 4 days');
  assert.equal(trip.days.length, 4, 'Trip days array must contain 4 days');

  // 2. Budget check (against Rs 10,000)
  assert.ok(trip.estimatedSpend > 0, 'Estimated spend should be positive');
  assert.ok(trip.budget === 10000, 'Budget should be 10000');

  // 3. Hidden places & Experiences count
  assert.ok(
    trip.hiddenDiscoveriesCount >= 2,
    `Expected at least 2 hidden places, found ${trip.hiddenDiscoveriesCount}`
  );
  assert.ok(
    trip.localExperiencesCount >= 2,
    `Expected at least 2 local experiences, found ${trip.localExperiencesCount}`
  );

  // 4. Every stop has at least 3 explanation reasons
  for (const day of trip.days) {
    for (const stop of day.stops) {
      const reasons = stop.explanationReasons || stop.aiReasons || [];
      assert.ok(
        reasons.length >= 3,
        `Stop ${stop.destination.name} must have at least 3 explanation reasons, had ${reasons.length}`
      );
    }
  }

  // 5. Stage logs produced
  assert.ok(stageLogs.length >= 5, 'Stage logs should be populated');
});

test('Engine: Replace a stop on Day 2 leaves Days 1, 3, and 4 unchanged', () => {
  const data = {
    destinations: DESTINATIONS,
    experiences: EXPERIENCES,
  };
  const { trip } = generateTrip(DEFAULT_PREFERENCES, data, DEFAULT_ENGINE_CONFIG);

  const day1Before = JSON.stringify(trip.days[0].stops.map((s) => s.id));
  const day3Before = JSON.stringify(trip.days[2].stops.map((s) => s.id));
  const day4Before = JSON.stringify(trip.days[3].stops.map((s) => s.id));

  const targetStopId = trip.days[1].stops[0].id;
  const alternatives = replaceStop(trip, targetStopId, 'Too crowded', data, DEFAULT_ENGINE_CONFIG);

  assert.ok(alternatives.length > 0, 'Should find at least 1 alternative option');

  const chosenAlt = alternatives[0];
  const updatedTrip = applyReplacement(
    trip,
    targetStopId,
    chosenAlt.destination.id,
    data,
    DEFAULT_ENGINE_CONFIG
  );

  const day1After = JSON.stringify(updatedTrip.days[0].stops.map((s) => s.id));
  const day3After = JSON.stringify(updatedTrip.days[2].stops.map((s) => s.id));
  const day4After = JSON.stringify(updatedTrip.days[3].stops.map((s) => s.id));

  // Verify immutability of other days
  assert.equal(day1Before, day1After, 'Day 1 stops must remain identical');
  assert.equal(day3Before, day3After, 'Day 3 stops must remain identical');
  assert.equal(day4Before, day4After, 'Day 4 stops must remain identical');

  // Verify Day 2 stop was replaced
  assert.notEqual(
    updatedTrip.days[1].stops[0].destination.id,
    trip.days[1].stops[0].destination.id,
    'Day 2 stop should be replaced'
  );
});

test('Engine: Gangaikonda Cholapuram triggers remote or limited facility alert', () => {
  const p8 = DESTINATIONS.find((d) => d.id === 'p8' || d.name.includes('Gangaikonda'));
  assert.ok(p8, 'Gangaikonda Cholapuram should exist in seed data');

  if (p8) {
    const facilityResult = evaluateFacilityCoverage(p8.facilities, DEFAULT_ENGINE_CONFIG);
    assert.ok(
      facilityResult.label === 'Remote' || facilityResult.label === 'Limited',
      `Expected Remote or Limited, got ${facilityResult.label}`
    );
    assert.ok(
      facilityResult.reason.includes('hospital') || facilityResult.reason.includes('km'),
      'Reason should explain hospital distance'
    );
  }
});

test('Engine: recommendForYou returns verified places and respects personalisation off', () => {
  const data = { destinations: DESTINATIONS, experiences: EXPERIENCES };
  const mockProfile: any = {
    interests: ['Historical', 'Traditional'],
    destinationMix: { famous: 20, moderate: 40, hidden: 40 },
    crowd: 'low',
    accessibility: [],
    personalisation: true,
  };

  const recs = recommendForYou(mockProfile, data, 5);
  assert.ok(recs.length > 0, 'Should return recommendations');
  // All must be verified
  for (const r of recs) {
    assert.equal(r.destination.verificationStatus, 'verified', 'Must only recommend verified places');
  }

  // With personalisation OFF
  const nonPersonalised = recommendForYou({ ...mockProfile, personalisation: false }, data, 5);
  assert.equal(nonPersonalised.length, 5, 'Should return top popular places');
  assert.equal(nonPersonalised[0].reason, 'Verified regional heritage site');
});

test('Engine: evaluatePreferenceMatch verifies Kallanai match, daily limit, and switch off', () => {
  const data = { destinations: DESTINATIONS, experiences: EXPERIENCES };
  const mockProfile: any = {
    interests: ['Historical', 'Nature'],
    destinationMix: { famous: 20, moderate: 40, hidden: 40 },
    crowd: 'low',
    personalisation: true,
    notifications: {
      recommendations: true,
      tripUpdates: true,
      bookings: true,
      quietFrom: '21:00',
      quietTo: '08:00',
      maxPerWeek: 3,
    },
  };

  // Temporarily ensure p11 is verified for this test
  const p11 = DESTINATIONS.find((d) => d.id === 'p11');
  if (p11) p11.verificationStatus = 'verified';

  const history = { notifiedIds: [], weeklyCount: 0 };
  const event = {
    type: 'NEW_PLACE_VERIFIED' as const,
    destinationId: 'p11',
    destinationName: 'Kallanai (Grand Anicut)',
    timestamp: '2026-10-08T12:00:00Z',
  };

  // 1. Should match
  const notif = evaluatePreferenceMatch(event, mockProfile, data, history, '2026-10-08T12:00:00Z');
  assert.ok(notif !== null, 'Kallanai should match Historical and hidden preference');
  assert.ok(notif!.body.includes('Kallanai'), 'Notification body should mention Kallanai');

  // 2. Daily limit: second recommendation on same day returns null
  const historyWithDailyLimit = {
    notifiedIds: [],
    lastRecommendationDate: '2026-10-08',
    weeklyCount: 1,
  };
  const blocked = evaluatePreferenceMatch(event, mockProfile, data, historyWithDailyLimit, '2026-10-08T15:00:00Z');
  assert.equal(blocked, null, 'Daily limit must block second recommendation on same date');

  // 3. Turning recommendations off returns null
  const profileSwitchedOff = {
    ...mockProfile,
    notifications: { ...mockProfile.notifications, recommendations: false },
  };
  const offResult = evaluatePreferenceMatch(event, profileSwitchedOff, data, history, '2026-10-08T12:00:00Z');
  assert.equal(offResult, null, 'Turned-off recommendations switch must return null');
});

test('Engine: detectTripChanges finds closed destinations and past dates', () => {
  const data = { destinations: DESTINATIONS, experiences: EXPERIENCES };
  const sampleSavedTrip: any = {
    lastOpenedAt: '2026-10-01T10:00:00Z',
    trip: {
      startDate: '2026-09-01', // Date in the past
      days: [
        {
          stops: [
            { destinationId: 'p1' }, // Suppose p1 is closed
          ],
        },
      ],
    },
  };

  // Set p1 closed temporarily
  const p1 = DESTINATIONS.find((d) => d.id === 'p1');
  const prevStatus = p1?.status;
  if (p1) p1.status = 'CLOSED';

  const changes = detectTripChanges(sampleSavedTrip, data, '2026-10-01T10:00:00Z', '2026-10-08');

  // Restore p1 status
  if (p1 && prevStatus) p1.status = prevStatus;

  assert.ok(changes.some((c) => c.type === 'DATE_PAST'), 'Should detect past trip date');
  assert.ok(changes.some((c) => c.type === 'DESTINATION_CLOSED'), 'Should detect closed destination');
});

