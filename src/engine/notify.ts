import { EngineDataSet, NotificationItem, Profile } from './types';
import { matchScore } from './home';
import { RealtimeEventPayload } from '../services/realtimeService';

export interface NotificationHistory {
  notifiedIds: string[];
  lastRecommendationDate?: string; // YYYY-MM-DD
  weeklyCount: number;
}

export function isQuietHour(timeStr: string, quietFrom: string = '21:00', quietTo: string = '08:00'): boolean {
  // e.g. quiet from 21:00 to 08:00
  if (quietFrom > quietTo) {
    return timeStr >= quietFrom || timeStr < quietTo;
  }
  return timeStr >= quietFrom && timeStr < quietTo;
}

export function evaluatePreferenceMatch(
  event: RealtimeEventPayload,
  profile: Profile,
  data: EngineDataSet,
  history: NotificationHistory,
  currentTime: string = new Date().toISOString()
): NotificationItem | null {
  // Check user preference switches
  if (event.type === 'NEW_PLACE_VERIFIED' || event.type === 'NEW_EXPERIENCE_LIVE' || event.type === 'PRESSURE_CHANGED') {
    if (!profile.notifications.recommendations || !profile.personalisation) {
      return null;
    }
  }

  const todayStr = currentTime.slice(0, 10);
  const hourMin = currentTime.slice(11, 16);

  // Handle NEW_PLACE_VERIFIED
  if (event.type === 'NEW_PLACE_VERIFIED') {
    const destId = event.destinationId;
    if (!destId) return null;

    const dest = data.destinations.find((d) => d.id === destId);
    if (!dest || dest.verificationStatus !== 'verified') return null;

    // 1. Not seen or notified before
    if (history.notifiedIds.includes(dest.id)) return null;

    // 2. Daily limit (1 per day) and weekly limit
    if (history.lastRecommendationDate === todayStr) return null;
    if (history.weeklyCount >= (profile.notifications.maxPerWeek || 3)) return null;

    // 3. Quiet hours check
    if (isQuietHour(hourMin, profile.notifications.quietFrom, profile.notifications.quietTo)) {
      // In quiet hours, queue or suppress recommendation
      return null;
    }

    // 4. Match score >= 70
    const { score, reasons } = matchScore(dest, profile);
    if (score < 70) return null;

    // 5. Shares at least 2 interests OR 1 interest + preferred destination type
    const matchedInterests = dest.tags.filter((t) => profile.interests.includes(t));
    const prefMixMatch =
      (dest.popularityType === 'hidden' && profile.destinationMix.hidden >= 30) ||
      (dest.popularityType === 'famous' && profile.destinationMix.famous >= 30);

    const qualifies = matchedInterests.length >= 2 || (matchedInterests.length >= 1 && prefMixMatch);
    if (!qualifies) return null;

    // 6. Crowd check
    if (profile.crowd === 'low' && (dest.pressureLevel === 'HIGH' || dest.pressureLevel === 'CRITICAL')) {
      return null;
    }

    // Build explanation reason
    const reasonParts: string[] = [];
    if (matchedInterests.length > 0) {
      reasonParts.push(`matches ${matchedInterests.slice(0, 2).join(' & ')}`);
    }
    if (dest.popularityType === 'hidden') {
      reasonParts.push('your hidden-places preference');
    }
    const reasonText = reasonParts.join(' and ');

    return {
      id: `notif-${Date.now()}`,
      title: 'A new verified place near your route',
      body: `${dest.name} ${reasonText}. Comfortable footfall right now.`,
      group: 'FOR_YOU',
      destinationId: dest.id,
      statusBadge: 'DEMO',
      createdAt: currentTime,
      read: false,
    };
  }

  // Handle DESTINATION_CLOSED
  if (event.type === 'DESTINATION_CLOSED') {
    if (!profile.notifications.tripUpdates) return null;
    return {
      id: `notif-closed-${Date.now()}`,
      title: 'Planned destination temporarily unavailable',
      body: `${event.destinationName || 'Destination'} is currently closed (${event.reason || 'Safety maintenance'}). Review alternatives.`,
      group: 'TRIP_UPDATE',
      destinationId: event.destinationId,
      statusBadge: 'DEMO',
      createdAt: currentTime,
      read: false,
    };
  }

  // Handle BOOKING_CREATED
  if (event.type === 'BOOKING_CREATED') {
    if (!profile.notifications.bookings) return null;
    return {
      id: `notif-book-${Date.now()}`,
      title: 'Experience Booking Confirmed',
      body: `Your pass for ${event.experienceName || 'Local craft experience'} is ready. View digital ticket with QR pass.`,
      group: 'BOOKINGS',
      experienceId: event.experienceId,
      statusBadge: 'DEMO',
      createdAt: currentTime,
      read: false,
    };
  }

  return null;
}
