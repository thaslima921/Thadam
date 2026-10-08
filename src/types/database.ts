export type PopularityType = 'famous' | 'moderate' | 'hidden';
export type VerificationStatus = 'verified' | 'pending' | 'unverified';
export type DataStatus = 'LIVE' | 'RECENT' | 'PREDICTED' | 'ESTIMATED' | 'DEMO';
export type PressureLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type DestinationOperationalStatus = 'OPEN' | 'CLOSED' | 'PAUSED' | 'RESTRICTED';

export interface DestinationFacilityInfo {
  hospitalKm: number;
  pharmacyKm: number;
  hotelKm: number;
  restaurantKm: number;
  fuelKm: number;
  policeKm: number;
  transportKm: number;
  coverage: 'GREEN' | 'YELLOW' | 'RED'; // Green = Good, Yellow = Limited, Red = Remote
}

export interface Destination {
  id: string;
  name: string;
  district: string;
  region: string;
  description: string;
  history?: string;
  culturalSignificance?: string;
  lat: number;
  lng: number;
  category: string;
  tags: string[];
  popularityType: PopularityType;
  verificationStatus: VerificationStatus;
  trustScore: number;       // 0 to 100
  discoveryScore: number;   // 0 to 100 (high for hidden, authentic gems)
  capacity: number;
  openingHours: string;     // e.g. "06:00 AM - 08:30 PM"
  entryFee: number;         // INR
  accessibility: {
    wheelchair: boolean;
    seniorFriendly: boolean;
    familyFriendly: boolean;
  };
  facilities: DestinationFacilityInfo;
  image: string;
  source: string;
  sourceUpdatedAt: string;
  confidence: number;
  status: DestinationOperationalStatus;
  pressureLevel: PressureLevel;
  dataFreshness: DataStatus;
}

export interface Experience {
  id: string;
  providerId: string;
  providerName: string;
  destinationId: string;
  destinationName: string;
  name: string;
  title?: string;
  category: 'Artisan' | 'Food' | 'Guide' | 'Rural' | 'Culture' | 'Craft' | 'Homestay';
  description: string;
  price: number;            // INR per person
  durationMinutes: number;
  capacity: number;
  availableSlots: number;
  status: 'ACTIVE' | 'PAUSED' | 'FULL';
  verificationStatus: VerificationStatus;
  rating: number;
  reviewsCount: number;
  languages: string[];
  photos: string[];
  locationNote: string;
}

export interface TripStop {
  id: string;
  tripId: string;
  dayNumber: number;
  destinationId: string;
  destination: Destination;
  experienceId?: string;
  experience?: Experience;
  startTime: string;        // e.g. "09:00 AM"
  endTime: string;          // e.g. "11:30 AM"
  durationMinutes: number;
  orderIndex: number;
  status: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'DISRUPTED' | 'REPLACED';
  estimatedCost: number;
  aiReasons: string[];      // Explainable reasons why THADAM picked this
  explanationReasons?: string[];
  scoreMatch: number;       // e.g. 94%
  crowdStatus: PressureLevel;
  dataFreshness: DataStatus;
  distanceFromPrevKm?: number;
  travelMinutesFromPrev?: number;
}

export interface TripDay {
  dayNumber: number;
  date: string;
  title: string;
  theme: string;
  stops: TripStop[];
  totalTravelMinutes: number;
  totalEstimatedCost: number;
}

export interface Trip {
  id: string;
  userId: string;
  title: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  budget: number;
  estimatedSpend: number;
  hiddenDiscoveriesCount: number;
  localExperiencesCount: number;
  totalTravelMinutes: number;
  facilityReadiness: 'GOOD' | 'LIMITED' | 'REMOTE';
  facilityCoverage?: 'Good' | 'Limited' | 'Remote';
  status: 'DRAFT' | 'SAVED' | 'ACTIVE' | 'COMPLETED';
  days: TripDay[];
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  userId: string;
  experienceId: string;
  experience: Experience;
  date: string;
  timeSlot: string;
  peopleCount: number;
  totalPrice: number;
  status: 'CONFIRMED' | 'CHECKED_IN' | 'CANCELLED';
  bookingReference: string;
  qrToken: string;
  createdAt: string;
}

export interface AlertNotification {
  id: string;
  type: 'DESTINATION_CLOSED' | 'CAPACITY_CHANGED' | 'FACILITY_WARNING' | 'ROUTE_DISRUPTION' | 'ADMIN_ALERT';
  title: string;
  message: string;
  destinationId?: string;
  experienceId?: string;
  timestamp: string;
  read: boolean;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  actionable: boolean;
}
