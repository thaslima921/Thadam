export type RealtimeEventType =
  | 'BOOKING_CREATED'
  | 'BOOKING_UPDATED'
  | 'CAPACITY_CHANGED'
  | 'EXPERIENCE_PAUSED'
  | 'DESTINATION_OPENED'
  | 'DESTINATION_CLOSED'
  | 'PRESSURE_CHANGED'
  | 'ADMIN_ALERT'
  | 'ROUTE_DISRUPTION';

export interface BaseRealtimePayload {
  type: RealtimeEventType;
  timestamp: string;
  source: 'ADMIN' | 'PARTNER' | 'SYSTEM' | 'DEMO';
}

export interface DestinationClosedPayload extends BaseRealtimePayload {
  type: 'DESTINATION_CLOSED';
  destinationId: string;
  destinationName: string;
  reason: string;
}

export interface DestinationOpenedPayload extends BaseRealtimePayload {
  type: 'DESTINATION_OPENED';
  destinationId: string;
  destinationName: string;
}

export interface CapacityChangedPayload extends BaseRealtimePayload {
  type: 'CAPACITY_CHANGED';
  experienceId: string;
  experienceName: string;
  newAvailableSlots: number;
  totalCapacity: number;
}

export interface PressureChangedPayload extends BaseRealtimePayload {
  type: 'PRESSURE_CHANGED';
  destinationId: string;
  destinationName: string;
  pressureLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
}

export interface AdminAlertPayload extends BaseRealtimePayload {
  type: 'ADMIN_ALERT';
  alertId: string;
  title: string;
  message: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface RouteDisruptionPayload extends BaseRealtimePayload {
  type: 'ROUTE_DISRUPTION';
  region: string;
  corridor: string;
  delayMinutes: number;
  reason: string;
}

export type RealtimeEventPayload =
  | DestinationClosedPayload
  | DestinationOpenedPayload
  | CapacityChangedPayload
  | PressureChangedPayload
  | AdminAlertPayload
  | RouteDisruptionPayload;
