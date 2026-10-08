import { Destination, Experience } from '../types/database';
import { TouristPreferences } from '../types/preferences';
import { EngineConfig, EngineDataSet, Profile, TrailRoute } from './types';
import { DEFAULT_ENGINE_CONFIG } from './config';
import { haversineKm } from './schedule';

export const CURATED_TRAILS: TrailRoute[] = [
  {
    id: 'trail-chola',
    title: 'Chola Temples Trail',
    subtitle: 'Great Living Chola Temples & Imperial Capitals',
    description: 'Brihadisvara Temple, Airavatesvara Darasuram, and Gangaikonda Cholapuram.',
    destinationIds: ['p1', 'p4', 'p8'],
    estimatedDays: 3,
    theme: 'Imperial Chola Heritage',
  },
  {
    id: 'trail-craft',
    title: 'Craft and Silk Trail',
    subtitle: 'Master Bronze Casters & Silk Weavers',
    description: 'Swamimalai bronze casting, Thirubuvanam silk weaving, and Thanjavur painting.',
    destinationIds: ['p5', 'p9', 'p2'],
    estimatedDays: 2,
    theme: 'Traditional Artisans',
  },
  {
    id: 'trail-kumbakonam',
    title: 'Kumbakonam Temple Trail',
    subtitle: 'Sacred Architecture of the Cauvery Delta',
    description: 'Sarangapani, Nageswaran, and Darasuram temple sculptures.',
    destinationIds: ['p6', 'p7', 'p4'],
    estimatedDays: 2,
    theme: 'Delta Temple Heritage',
  },
];

export function matchScore(
  place: Destination,
  profile: Profile,
  cfg: EngineConfig = DEFAULT_ENGINE_CONFIG
): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 50;

  // 1. Interests Match
  const userInterests = profile.interests || [];
  const matchedInterests = place.tags.filter((t) => userInterests.includes(t));
  if (matchedInterests.length > 0) {
    score += matchedInterests.length * 15;
    reasons.push(`Matches ${matchedInterests.slice(0, 2).join(' & ')}`);
  }

  // 2. Destination Mix Match
  const mix = profile.destinationMix || { famous: 30, moderate: 40, hidden: 30 };
  if (place.popularityType === 'hidden' && mix.hidden >= 30) {
    score += 15;
    reasons.push('Matches your hidden discoveries preference');
  } else if (place.popularityType === 'famous' && mix.famous >= 30) {
    score += 10;
    reasons.push('Iconic landmark matching your itinerary taste');
  }

  // 3. Crowd Match
  if (profile.crowd === 'low') {
    if (place.pressureLevel === 'LOW') {
      score += 15;
      reasons.push('Comfortable footfall right now');
    } else if (place.pressureLevel === 'HIGH' || place.pressureLevel === 'CRITICAL') {
      score -= 25;
    }
  }

  // 4. Accessibility
  if (profile.accessibility?.includes('Wheelchair accessible') && place.accessibility.wheelchair) {
    score += 10;
  }

  const finalScore = Math.min(99, Math.max(50, Math.round(score)));
  return { score: finalScore, reasons };
}

export function recommendForYou(
  profile: Profile,
  data: EngineDataSet,
  n: number = 5,
  cfg: EngineConfig = DEFAULT_ENGINE_CONFIG
): Array<{ destination: Destination; matchScore: number; reason: string }> {
  // Hard filters: only verified places
  const verified = data.destinations.filter(
    (d) => d.verificationStatus === 'verified' && d.status === 'OPEN'
  );

  if (!profile.personalisation) {
    // Return popular & verified places sorted by trustScore
    return verified
      .slice()
      .sort((a, b) => b.trustScore - a.trustScore)
      .slice(0, n)
      .map((dest) => ({
        destination: dest,
        matchScore: dest.trustScore,
        reason: 'Verified regional heritage site',
      }));
  }

  const scored = verified.map((dest) => {
    const { score, reasons } = matchScore(dest, profile, cfg);
    return {
      destination: dest,
      matchScore: score,
      reason: reasons[0] || 'Curated for your travel profile',
    };
  });

  scored.sort((a, b) => b.matchScore - a.matchScore);
  return scored.slice(0, n);
}

export function lowCrowdNow(
  data: EngineDataSet,
  startCity: string = 'Coimbatore',
  n: number = 4
): Destination[] {
  return data.destinations
    .filter(
      (d) => d.verificationStatus === 'verified' && d.status === 'OPEN' && d.pressureLevel === 'LOW'
    )
    .slice(0, n);
}

export function hiddenDiscoveries(
  profile: Profile,
  data: EngineDataSet,
  n: number = 5
): Destination[] {
  return data.destinations
    .filter(
      (d) =>
        d.verificationStatus === 'verified' &&
        d.status === 'OPEN' &&
        d.popularityType === 'hidden'
    )
    .sort((a, b) => b.discoveryScore - a.discoveryScore)
    .slice(0, n);
}

export function localExperiences(
  profile: Profile,
  data: EngineDataSet,
  n: number = 5
): Experience[] {
  return data.experiences.filter((e) => e.status === 'ACTIVE').slice(0, n);
}

export function nearby(
  lat: number,
  lng: number,
  data: EngineDataSet,
  radiusKm: number = 50,
  n: number = 5
): Array<{ destination: Destination; distanceKm: number }> {
  const verified = data.destinations.filter(
    (d) => d.verificationStatus === 'verified' && d.status === 'OPEN'
  );

  const mapped = verified.map((d) => {
    const dist = haversineKm(lat, lng, d.lat, d.lng);
    return { destination: d, distanceKm: dist };
  });

  return mapped
    .filter((m) => m.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, n);
}

export function trailToRequest(trailId: string, profile: Profile): TouristPreferences {
  const trail = CURATED_TRAILS.find((t) => t.id === trailId) || CURATED_TRAILS[0];
  return {
    language: profile.language === 'ta' ? 'Tamil' : 'English',
    startLocation: profile.homeCity || 'Coimbatore',
    destination: 'Thanjavur-Kumbakonam',
    startDate: '2026-10-15',
    endDate: `2026-10-1${4 + trail.estimatedDays}`,
    daysCount: trail.estimatedDays,
    travelers: { adults: 2, children: 0, seniors: 0, groupStyle: 'Couple' },
    budget: profile.defaultBudget || 10000,
    interests: profile.interests.slice(0, 4) as any,
    travelStyle: (profile.travelStyle === 'relaxed' ? 'Relaxed' : profile.travelStyle === 'packed' ? 'Packed' : 'Balanced'),
    destinationMix: profile.destinationMix,
    crowdPreference: profile.crowd === 'low' ? 'Low' : profile.crowd === 'moderate' ? 'Moderate' : 'Any',
    transport: 'Car',
    maxTravelTime: '2 hours',
    accommodation: 'Standard',
    foodPreferences: profile.food,
    facilityRequirements: {
      hospitalNearby: profile.facilities.includes('Hospital nearby'),
      pharmacyNearby: profile.facilities.includes('Pharmacy nearby'),
      hotelNearby: profile.facilities.includes('Hotel nearby'),
      fuelNearby: profile.facilities.includes('Fuel nearby'),
      publicTransport: profile.facilities.includes('Public transport'),
      avoidIsolatedPlaces: profile.facilities.includes('Avoid isolated places'),
      familyFriendly: profile.accessibility.includes('Family friendly'),
      seniorFriendly: profile.accessibility.includes('Senior friendly'),
      wheelchairAccessible: profile.accessibility.includes('Wheelchair accessible'),
    },
  };
}
