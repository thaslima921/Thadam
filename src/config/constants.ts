export const RECOMMENDATION_WEIGHTS = {
  intentMatch: 0.30,
  destinationPref: 0.15,
  capacitySuitability: 0.15,
  crowdSuitability: 0.15,
  trustScore: 0.10,
  localExperienceValue: 0.10,
  accessibility: 0.05,
};

export const DEFAULT_PILOT_PREFERENCES = {
  language: 'English' as const,
  startLocation: 'Coimbatore',
  destination: 'Thanjavur-Kumbakonam',
  startDate: '2026-10-15',
  endDate: '2026-10-18',
  daysCount: 4,
  travelers: {
    adults: 2,
    children: 0,
    seniors: 0,
    groupStyle: 'Couple' as const,
  },
  budget: 10000,
  interests: ['Historical' as const, 'Traditional' as const, 'Cultural' as const],
  travelStyle: 'Balanced' as const,
  destinationMix: {
    famous: 20,
    moderate: 40,
    hidden: 40,
  },
  crowdPreference: 'Low' as const,
  transport: 'Car' as const,
  maxTravelTime: '2 hours' as const,
  accommodation: 'Standard' as const,
  foodPreferences: ['Traditional', 'Vegetarian', 'Local'],
  facilityRequirements: {
    hospitalNearby: true,
    pharmacyNearby: true,
    hotelNearby: true,
    fuelNearby: true,
    publicTransport: false,
    avoidIsolatedPlaces: true,
    familyFriendly: true,
    seniorFriendly: false,
    wheelchairAccessible: false,
  },
  notes: 'Interested in Chola bronze craft and quiet temple architecture.',
};

export const TN_REGIONS = [
  { id: 'thanjavur-kumbakonam', name: 'Thanjavur – Kumbakonam (Chola Heritage Belt)', pilot: true },
  { id: 'madurai', name: 'Madurai & Pandyan Belt', pilot: false },
  { id: 'coimbatore', name: 'Coimbatore & Nilgiris Gateway', pilot: false },
  { id: 'chettinad', name: 'Chettinad Heritage & Crafts', pilot: false },
  { id: 'tirunelveli', name: 'Tirunelveli & Tamirabarani Basin', pilot: false },
];

export const DEMO_USERS = {
  tourist: {
    id: 'usr-tourist-01',
    name: 'Ananya Raman',
    email: 'ananya@tourist.thadam.tn',
    role: 'tourist' as const,
    phone: '+91 98401 23456',
  },
  partner: {
    id: 'prt-swamimalai-01',
    name: 'Master Craftsman Rajan',
    businessName: 'Swamimalai Chola Bronze Heritage Guild',
    email: 'rajan@artisan.thadam.tn',
    role: 'partner' as const,
    phone: '+91 94432 78901',
  },
  admin: {
    id: 'adm-tn-tourism-01',
    name: 'TN Tourism Command Center',
    email: 'admin@tourism.tn.gov.in',
    role: 'admin' as const,
    phone: '+91 44 2536 1234',
  },
};
