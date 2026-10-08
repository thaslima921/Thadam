import { Destination, Experience } from '../types/database';
import { TouristPreferences } from '../types/preferences';
import { ScoreFactors } from './score';

export function explainStop(
  dest: Destination,
  prefs: TouristPreferences,
  factors: ScoreFactors,
  experience?: Experience
): string[] {
  const reasons: string[] = [];

  // Factor 1: Intent & Category
  const matched = dest.tags.filter((t) => prefs.interests.includes(t as any));
  if (matched.length > 0) {
    reasons.push(`Matches your interest in ${matched.slice(0, 2).join(' & ')}`);
  } else {
    reasons.push(`Curated for your ${dest.category} journey preference`);
  }

  // Factor 2: Destination Preference & Heritage Mix
  if (dest.popularityType === 'hidden') {
    reasons.push(`Verified lesser-known discovery (${dest.discoveryScore}/100 discovery index)`);
  } else if (dest.popularityType === 'famous') {
    reasons.push(`Iconic Tamil Nadu heritage landmark`);
  } else {
    reasons.push(`Balanced regional cultural stop in ${dest.district}`);
  }

  // Factor 3: Pressure & Flow
  if (dest.pressureLevel === 'LOW') {
    reasons.push(`Low crowd pressure fits your tranquil travel style`);
  } else if (dest.pressureLevel === 'MODERATE') {
    reasons.push(`Moderate footfall with comfortable visitor flow`);
  } else {
    reasons.push(`Scheduled during optimal visiting hours to avoid peak congestion`);
  }

  // Factor 4: Verified Trust & Safety
  if (dest.trustScore >= 90) {
    reasons.push(`Verified heritage record with ${dest.trustScore}% trust index`);
  } else {
    reasons.push(`Essential facilities verified within regional travel corridor`);
  }

  // Factor 5: Local Experience (if applicable)
  if (experience) {
    reasons.push(`Includes verified local workshop with ${experience.providerName}`);
  }

  return reasons;
}
