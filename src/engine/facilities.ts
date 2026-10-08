import { DestinationFacilityInfo } from '../types/database';
import { EngineConfig } from './types';

export type FacilityCoverageLabel = 'Good' | 'Limited' | 'Remote';

export function evaluateFacilityCoverage(
  facilities: DestinationFacilityInfo,
  cfg: EngineConfig
): { label: FacilityCoverageLabel; reason: string; isRemoteAlert: boolean } {
  const t = cfg.facilityThresholds;

  let violations = 0;
  if (facilities.hospitalKm > t.hospitalKm) violations++;
  if (facilities.pharmacyKm > t.pharmacyKm) violations++;
  if (facilities.hotelKm > t.stayKm) violations++;
  if (facilities.fuelKm > t.fuelKm) violations++;

  const isHospitalRemote = facilities.hospitalKm > t.remoteHospitalKm;

  if (isHospitalRemote || violations >= 3) {
    return {
      label: 'Remote',
      reason: `Hospital distance is ${facilities.hospitalKm} km and ${violations} access thresholds exceeded.`,
      isRemoteAlert: true,
    };
  }

  if (violations > 0 || facilities.hospitalKm > t.hospitalKm) {
    return {
      label: 'Limited',
      reason: `Nearest hospital is ${facilities.hospitalKm} km away. Plan travel accordingly.`,
      isRemoteAlert: facilities.hospitalKm > 20,
    };
  }

  return {
    label: 'Good',
    reason: `All essential facilities within corridor safety thresholds.`,
    isRemoteAlert: false,
  };
}
