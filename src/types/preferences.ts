export type TravelStyle = 'Relaxed' | 'Balanced' | 'Packed';
export type DestinationPreference = 'Famous' | 'Moderate' | 'Hidden' | 'Mixed';
export type CrowdPreference = 'Low' | 'Moderate' | 'Any';
export type TransportMode = 'Walking' | 'Two-wheeler' | 'Car' | 'Bus' | 'Train' | 'Cab';
export type AccommodationType = 'Budget' | 'Standard' | 'Premium' | 'Homestay' | 'Resort' | 'No stay';
export type GroupStyle = 'Solo' | 'Couple' | 'Family' | 'Friends';

export type InterestCategory =
  | 'Historical'
  | 'Traditional'
  | 'Cultural'
  | 'Food'
  | 'Nature'
  | 'Beach'
  | 'Rural'
  | 'Spiritual'
  | 'Adventure'
  | 'Photography'
  | 'Shopping'
  | 'Art & Craft';

export interface DestinationMix {
  famous: number;   // e.g. 20
  moderate: number; // e.g. 40
  hidden: number;   // e.g. 40 (must total 100)
}

export interface TravelersCount {
  adults: number;
  children: number;
  seniors: number;
  groupStyle: GroupStyle;
}

export interface FacilityRequirements {
  hospitalNearby: boolean;
  pharmacyNearby: boolean;
  hotelNearby: boolean;
  fuelNearby: boolean;
  publicTransport: boolean;
  avoidIsolatedPlaces: boolean;
  familyFriendly: boolean;
  seniorFriendly: boolean;
  wheelchairAccessible: boolean;
}

export interface TouristPreferences {
  language: 'English' | 'Tamil';
  startLocation: string; // e.g. "Coimbatore", "Chennai", "Madurai"
  destination: string;   // e.g. "Thanjavur-Kumbakonam", "Madurai", "Coimbatore", "Let THADAM Choose"
  startDate: string;     // ISO format YYYY-MM-DD
  endDate: string;       // ISO format YYYY-MM-DD
  daysCount: number;
  travelers: TravelersCount;
  budget: number;        // Total INR e.g. 10000
  interests: InterestCategory[];
  travelStyle: TravelStyle;
  travelPace?: TravelStyle;
  destinationMix: DestinationMix;
  crowdPreference: CrowdPreference;
  transport: TransportMode;
  maxTravelTime: '1 hour' | '2 hours' | '3 hours' | 'Flexible';
  accommodation: AccommodationType;
  foodPreferences: string[]; // e.g. ['Vegetarian', 'Traditional', 'Street Food']
  facilityRequirements: FacilityRequirements;
  notes?: string;
}

export const DEFAULT_PREFERENCES: TouristPreferences = {
  language: 'English',
  startLocation: 'Coimbatore',
  destination: 'Thanjavur-Kumbakonam',
  startDate: '2026-10-15',
  endDate: '2026-10-18',
  daysCount: 4,
  travelers: {
    adults: 2,
    children: 0,
    seniors: 0,
    groupStyle: 'Couple',
  },
  budget: 10000,
  interests: ['Historical', 'Traditional', 'Cultural'],
  travelStyle: 'Balanced',
  travelPace: 'Balanced',
  destinationMix: {
    famous: 20,
    moderate: 40,
    hidden: 40,
  },
  crowdPreference: 'Low',
  transport: 'Car',
  maxTravelTime: '2 hours',
  accommodation: 'Standard',
  foodPreferences: ['Traditional', 'Vegetarian'],
  facilityRequirements: {
    hospitalNearby: true,
    pharmacyNearby: true,
    hotelNearby: true,
    fuelNearby: true,
    publicTransport: false,
    avoidIsolatedPlaces: false,
    familyFriendly: false,
    seniorFriendly: false,
    wheelchairAccessible: false,
  },
};
