import { Destination, Experience, PressureLevel, Trip, TripDay, TripStop } from '../types/database';
import { TouristPreferences } from '../types/preferences';

export interface EngineConfig {
  scoreWeights: {
    intent: number;            // 30
    destinationPref: number;   // 15
    capacity: number;          // 15
    pressure: number;          // 15
    trust: number;             // 10
    localValue: number;        // 10
    accessibility: number;     // 5
  };
  facilityThresholds: {
    hospitalKm: number;        // 20 km
    pharmacyKm: number;        // 10 km
    stayKm: number;            // 15 km
    fuelKm: number;            // 15 km
    remoteHospitalKm: number;  // 30 km
  };
  transportSpeedsKmH: {
    Car: number;               // 45 km/h
    Cab: number;               // 45 km/h
    'Two-wheeler': number;     // 40 km/h
    Bus: number;               // 30 km/h
    Train: number;             // 50 km/h
    Walking: number;           // 5 km/h
  };
}

export interface EngineDataSet {
  destinations: Destination[];
  experiences: Experience[];
}

export interface AlternativeOption {
  destination: Destination;
  scoreMatch: number;
  distanceKm: number;
  estimatedCost: number;
  reasons: string[];
  experience?: Experience;
}

export interface AdaptationProposal {
  affectedDayNumber: number;
  affectedStopId: string;
  originalDestinationName: string;
  reason: string;
  alternatives: AlternativeOption[];
}

export interface StageLogItem {
  stage: string;
  detail: string;
  timestamp: string;
}

export interface NotifPrefs {
  recommendations: boolean;
  tripUpdates: boolean;
  bookings: boolean;
  quietFrom: string; // e.g. "21:00"
  quietTo: string;   // e.g. "08:00"
  maxPerWeek: number;// 3
  snoozedUntil?: string;
}

export interface Profile {
  id: string;
  name: string;
  photoUri?: string;
  language: 'en' | 'ta';
  homeCity: string;
  interests: string[];
  travelStyle: 'relaxed' | 'balanced' | 'packed';
  destinationMix: { famous: number; moderate: number; hidden: number };
  crowd: 'low' | 'moderate' | 'any';
  transport: string[];
  accommodation: string;
  food: string[];
  accessibility: string[];
  facilities: string[];
  defaultBudget?: number;
  trustedContact?: { name: string; phone: string };
  notifications: NotifPrefs;
  personalisation: boolean;
  updatedAt: string;
}

export type SavedTripStatus = 'draft' | 'generated' | 'saved' | 'booked' | 'active' | 'completed' | 'archived';

export interface SavedTrip {
  id: string;
  title: string;
  status: SavedTripStatus;
  request: TouristPreferences;
  trip?: Trip;
  builderStep?: number;
  progressLabel: string;
  createdAt: string;
  updatedAt: string;
  lastOpenedAt: string;
  version: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  group: 'FOR_YOU' | 'TRIP_UPDATE' | 'BOOKINGS';
  destinationId?: string;
  experienceId?: string;
  statusBadge?: string;
  createdAt: string;
  read: boolean;
}

export interface DetectedTripChange {
  type: 'DESTINATION_CLOSED' | 'SLOT_CHANGED' | 'DATE_PAST' | 'CAPACITY_REDUCED';
  title: string;
  description: string;
  affectedDestinationId?: string;
}

export interface TrailRoute {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  destinationIds: string[];
  estimatedDays: number;
  theme: string;
}
