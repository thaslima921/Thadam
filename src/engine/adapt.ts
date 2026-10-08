import { Trip } from '../types/database';
import { TouristPreferences } from '../types/preferences';
import { AdaptationProposal, EngineConfig, EngineDataSet } from './types';
import { replaceStop } from './replace';

export interface RealtimeEventPayload {
  type: string;
  destinationId?: string;
  destinationName?: string;
  experienceId?: string;
  value?: any;
  reason?: string;
  timestamp?: string;
}

export function adaptTrip(
  event: RealtimeEventPayload,
  trip: Trip,
  prefs: TouristPreferences,
  data: EngineDataSet,
  cfg: EngineConfig
): AdaptationProposal | null {
  // Only adapt for: destination closed, experience paused/unavailable, route disruption, admin alert
  if (
    event.type !== 'DESTINATION_CLOSED' &&
    event.type !== 'EXPERIENCE_PAUSED' &&
    event.type !== 'ROUTE_DISRUPTION'
  ) {
    return null;
  }

  // Find affected stop in the trip
  for (const day of trip.days) {
    for (const stop of day.stops) {
      const isTargetDest = event.destinationId && stop.destination.id === event.destinationId;
      const isTargetExp = event.experienceId && stop.experience?.id === event.experienceId;

      if (isTargetDest || isTargetExp) {
        // Generate up to 3 alternatives
        const alternatives = replaceStop(
          trip,
          stop.id,
          event.reason || 'Destination unavailable',
          data,
          cfg
        );

        return {
          affectedDayNumber: day.dayNumber,
          affectedStopId: stop.id,
          originalDestinationName: stop.destination.name,
          reason: event.reason || 'Temporarily unavailable due to state advisory',
          alternatives,
        };
      }
    }
  }

  // Event does not affect any planned stops in the trip
  return null;
}
