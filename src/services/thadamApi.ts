/**
 * THADAM AI Backend API Service
 *
 * Connects the existing TouristPreferences → POST /api/recommend
 * Returns ranked destinations from the trained THADAM encoder.
 *
 * The backend URL is read from EXPO_PUBLIC_THADAM_API_URL (falls back to localhost).
 * No UI changes are needed — this service is called from the store.
 */

import { TouristPreferences } from '../types/preferences';

// ─────────────────────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────────────────────
const THADAM_API_URL =
  process.env.EXPO_PUBLIC_THADAM_API_URL || 'http://localhost:8000';

// ─────────────────────────────────────────────────────────────────────────────
// Response types
// ─────────────────────────────────────────────────────────────────────────────
export interface ThadamRecommendation {
  rank: number;
  destination_name: string;
  district: string;
  destination_category: string;
  latitude: number;
  longitude: number;
  entry_cost_inr: number;
  average_visit_duration_hours: number;
  average_visitor_rating_5: number;
  core_interest_score: number;
  preference_score: number;
  crowd_score: number;
  transport_score: number;
  accommodation_score: number;
  food_score: number;
  facility_score: number;
  ai_similarity: number;
  final_score: number;
  matched_interests: string[];
  match_reasons: string[];
}

export interface ThadamRecommendResponse {
  success: boolean;
  recommendations: ThadamRecommendation[];
}

export interface ThadamHealthResponse {
  status: string;
  model_loaded: boolean;
  dataset_rows: number;
  feature_count: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers: map TouristPreferences fields to API request
// ─────────────────────────────────────────────────────────────────────────────

function mapMaxTravelHours(maxTravelTime: string): number {
  switch (maxTravelTime) {
    case '1 hour': return 1;
    case '2 hours': return 2;
    case '3 hours': return 3;
    case 'Flexible': return 8;
    default: return 3;
  }
}

function mapFacilities(req: TouristPreferences['facilityRequirements']): string[] {
  const facilities: string[] = [];
  if (req.hospitalNearby) facilities.push('Hospital nearby');
  if (req.pharmacyNearby) facilities.push('Pharmacy nearby');
  if (req.hotelNearby) facilities.push('Hotel nearby');
  if (req.fuelNearby) facilities.push('Fuel nearby');
  if (req.publicTransport) facilities.push('Public transport');
  if (req.avoidIsolatedPlaces) facilities.push('Avoid isolated places');
  if (req.familyFriendly) facilities.push('Family friendly');
  if (req.seniorFriendly) facilities.push('Senior friendly');
  if (req.wheelchairAccessible) facilities.push('Wheelchair accessible');
  return facilities;
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calls POST /api/recommend with the existing TouristPreferences.
 * Returns the ranked list of THADAM AI recommendations.
 * Throws on network error or non-2xx HTTP response.
 */
export async function fetchThadamRecommendations(
  prefs: TouristPreferences
): Promise<ThadamRecommendResponse> {
  const body = {
    start_location: prefs.startLocation,
    destination: prefs.destination,
    start_date: prefs.startDate,
    end_date: prefs.endDate,
    adults: prefs.travelers.adults,
    children: prefs.travelers.children,
    seniors: prefs.travelers.seniors,
    total_budget: prefs.budget,
    interests: prefs.interests,
    // Pass the destinationMix so the backend can derive Famous/Moderate/Hidden/Mixed
    destination_mix: {
      famous: prefs.destinationMix.famous,
      moderate: prefs.destinationMix.moderate,
      hidden: prefs.destinationMix.hidden,
    },
    crowd: prefs.crowdPreference,
    transport: [prefs.transport],
    max_continuous_travel_hours: mapMaxTravelHours(prefs.maxTravelTime),
    accommodation: [prefs.accommodation],
    food: prefs.foodPreferences,
    facilities: mapFacilities(prefs.facilityRequirements),
    optional_text: prefs.notes ?? '',
  };

  const response = await fetch(`${THADAM_API_URL}/api/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`THADAM API error ${response.status}: ${text}`);
  }

  return response.json() as Promise<ThadamRecommendResponse>;
}

/**
 * Calls GET /api/health to verify the backend is up and model is loaded.
 */
export async function checkThadamHealth(): Promise<ThadamHealthResponse> {
  const response = await fetch(`${THADAM_API_URL}/api/health`);
  if (!response.ok) throw new Error(`Health check failed: ${response.status}`);
  return response.json() as Promise<ThadamHealthResponse>;
}
