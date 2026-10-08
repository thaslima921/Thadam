import { Destination } from '../types/database';
import { TouristPreferences } from '../types/preferences';

export function passesHardFilters(
  dest: Destination,
  prefs: TouristPreferences
): boolean {
  // 1. Must not be closed
  if (dest.status === 'CLOSED') {
    return false;
  }

  // 2. Must be verified
  if (dest.verificationStatus === 'unverified') {
    return false;
  }

  // 3. Must have capacity
  if (dest.capacity <= 0) {
    return false;
  }

  // 4. Accessibility constraints
  if (prefs.travelers.seniors > 0 && !dest.accessibility.seniorFriendly) {
    // If seniors are travelling, prioritize senior-friendly access
    return false;
  }

  // 5. Facility requirements (hard filters override scores)
  if (prefs.facilityRequirements.hospitalNearby && dest.facilities.hospitalKm > 20) {
    return false;
  }

  return true;
}
