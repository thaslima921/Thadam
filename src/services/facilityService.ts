import { Destination, DestinationFacilityInfo } from '../types/database';
import { FACILITIES, FacilityPoint } from '../data/facilities';
import { calculateDistanceKm } from './aiPlannerService';

export interface NearbyFacilitiesResult {
  hospital: { facility?: FacilityPoint; distanceKm: number };
  pharmacy: { facility?: FacilityPoint; distanceKm: number };
  hotel: { facility?: FacilityPoint; distanceKm: number };
  restaurant: { facility?: FacilityPoint; distanceKm: number };
  fuel: { facility?: FacilityPoint; distanceKm: number };
  police: { facility?: FacilityPoint; distanceKm: number };
  coverage: 'GREEN' | 'YELLOW' | 'RED';
  warningMessage?: string;
}

export function evaluateDestinationFacilities(
  dest: Destination,
  requireHospitalNearby: boolean = true
): NearbyFacilitiesResult {
  const result: NearbyFacilitiesResult = {
    hospital: { distanceKm: dest.facilities.hospitalKm },
    pharmacy: { distanceKm: dest.facilities.pharmacyKm },
    hotel: { distanceKm: dest.facilities.hotelKm },
    restaurant: { distanceKm: dest.facilities.restaurantKm },
    fuel: { distanceKm: dest.facilities.fuelKm },
    police: { distanceKm: dest.facilities.policeKm },
    coverage: dest.facilities.coverage,
  };

  // Find nearest actual points from FACILITIES dataset
  for (const f of FACILITIES) {
    const dist = calculateDistanceKm(dest.lat, dest.lng, f.lat, f.lng);
    if (f.type === 'HOSPITAL' && (!result.hospital.facility || dist < result.hospital.distanceKm)) {
      result.hospital = { facility: f, distanceKm: dist };
    } else if (f.type === 'PHARMACY' && (!result.pharmacy.facility || dist < result.pharmacy.distanceKm)) {
      result.pharmacy = { facility: f, distanceKm: dist };
    } else if (f.type === 'HOTEL' && (!result.hotel.facility || dist < result.hotel.distanceKm)) {
      result.hotel = { facility: f, distanceKm: dist };
    } else if (f.type === 'FUEL' && (!result.fuel.facility || dist < result.fuel.distanceKm)) {
      result.fuel = { facility: f, distanceKm: dist };
    } else if (f.type === 'POLICE' && (!result.police.facility || dist < result.police.distanceKm)) {
      result.police = { facility: f, distanceKm: dist };
    }
  }

  // Check hospital safety threshold
  if (requireHospitalNearby && result.hospital.distanceKm > 6.0) {
    result.warningMessage = `Limited medical access: Nearest hospital is approximately ${result.hospital.distanceKm} km away.`;
  }

  return result;
}
