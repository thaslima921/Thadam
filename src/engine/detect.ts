import { DetectedTripChange, EngineDataSet, SavedTrip } from './types';

export function detectTripChanges(
  savedTrip: SavedTrip,
  data: EngineDataSet,
  sinceTimestamp: string = savedTrip.lastOpenedAt,
  todayStr: string = new Date().toISOString().slice(0, 10)
): DetectedTripChange[] {
  const changes: DetectedTripChange[] = [];

  // 1. Check if start date is in the past
  if (savedTrip.trip && savedTrip.trip.startDate < todayStr) {
    changes.push({
      type: 'DATE_PAST',
      title: 'Trip dates have passed',
      description: `Planned start date (${savedTrip.trip.startDate}) is earlier than today. Tap to update dates.`,
    });
  }

  // 2. Check if any stop destination is now closed or changed
  if (savedTrip.trip && savedTrip.trip.days) {
    for (const day of savedTrip.trip.days) {
      for (const stop of day.stops) {
        const liveDest = data.destinations.find((d) => d.id === stop.destinationId);
        if (liveDest && liveDest.status === 'CLOSED') {
          changes.push({
            type: 'DESTINATION_CLOSED',
            title: `${liveDest.name} temporarily closed`,
            description: `Closed for temple maintenance or regional crowd diversion. Alternative stop ready.`,
            affectedDestinationId: liveDest.id,
          });
        }
      }
    }
  }

  return changes;
}
