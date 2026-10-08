import { create } from 'zustand';
import { DESTINATIONS } from '../data/destinations';
import { EXPERIENCES } from '../data/experiences';
import { DestinationOperationalStatus, PressureLevel } from '../types/database';
import { realtimeService } from '../services/realtimeService';
import { useTripStore } from './useTripStore';

interface DemoStoreState {
  destinationStatusMap: Record<string, DestinationOperationalStatus>;
  destinationPressureMap: Record<string, PressureLevel>;
  experienceSlotsMap: Record<string, number>;
  activeSystemAlerts: Array<{ id: string; title: string; message: string; priority: 'HIGH' | 'MEDIUM' | 'LOW' }>;

  // Demo Actions
  closeDestination: (destinationId: string, reason: string) => void;
  openDestination: (destinationId: string) => void;
  setDestinationPressure: (destinationId: string, level: PressureLevel) => void;
  adjustExperienceSlots: (experienceId: string, newSlots: number) => void;
  publishAdminAlert: (title: string, message: string, priority: 'HIGH' | 'MEDIUM' | 'LOW') => void;
  resetDemoOverrides: () => void;
}

// Initial status maps
const initialStatus: Record<string, DestinationOperationalStatus> = {};
const initialPressure: Record<string, PressureLevel> = {};
DESTINATIONS.forEach((d) => {
  initialStatus[d.id] = d.status;
  initialPressure[d.id] = d.pressureLevel;
});

const initialSlots: Record<string, number> = {};
EXPERIENCES.forEach((e) => {
  initialSlots[e.id] = e.availableSlots;
});

export const useDemoStore = create<DemoStoreState>((set, get) => ({
  destinationStatusMap: initialStatus,
  destinationPressureMap: initialPressure,
  experienceSlotsMap: initialSlots,
  activeSystemAlerts: [],

  closeDestination: (destinationId: string, reason: string) => {
    const dest = DESTINATIONS.find((d) => d.id === destinationId);
    const destName = dest ? dest.name : 'Planned Destination';

    set((state) => ({
      destinationStatusMap: {
        ...state.destinationStatusMap,
        [destinationId]: 'CLOSED',
      },
    }));

    // Broadcast Realtime Event
    realtimeService.publish({
      type: 'DESTINATION_CLOSED',
      destinationId,
      destinationName: destName,
      reason,
      timestamp: new Date().toISOString(),
      source: 'ADMIN',
    });

    // Notify trip store directly so tourist app immediately pops adaptive notification!
    useTripStore.getState().handleRealtimeClosure(destinationId, destName, reason);
  },

  openDestination: (destinationId: string) => {
    const dest = DESTINATIONS.find((d) => d.id === destinationId);
    const destName = dest ? dest.name : 'Planned Destination';

    set((state) => ({
      destinationStatusMap: {
        ...state.destinationStatusMap,
        [destinationId]: 'OPEN',
      },
    }));

    realtimeService.publish({
      type: 'DESTINATION_OPENED',
      destinationId,
      destinationName: destName,
      timestamp: new Date().toISOString(),
      source: 'ADMIN',
    });
  },

  setDestinationPressure: (destinationId: string, level: PressureLevel) => {
    const dest = DESTINATIONS.find((d) => d.id === destinationId);
    set((state) => ({
      destinationPressureMap: {
        ...state.destinationPressureMap,
        [destinationId]: level,
      },
    }));

    realtimeService.publish({
      type: 'PRESSURE_CHANGED',
      destinationId,
      destinationName: dest ? dest.name : '',
      pressureLevel: level,
      timestamp: new Date().toISOString(),
      source: 'DEMO',
    });
  },

  adjustExperienceSlots: (experienceId: string, newSlots: number) => {
    const exp = EXPERIENCES.find((e) => e.id === experienceId);
    const safeSlots = Math.max(0, newSlots);

    set((state) => ({
      experienceSlotsMap: {
        ...state.experienceSlotsMap,
        [experienceId]: safeSlots,
      },
    }));

    realtimeService.publish({
      type: 'CAPACITY_CHANGED',
      experienceId,
      experienceName: exp ? exp.name : '',
      newAvailableSlots: safeSlots,
      totalCapacity: exp ? exp.capacity : 6,
      timestamp: new Date().toISOString(),
      source: 'PARTNER',
    });
  },

  publishAdminAlert: (title: string, message: string, priority: 'HIGH' | 'MEDIUM' | 'LOW') => {
    const newAlert = {
      id: `alert-${Date.now()}`,
      title,
      message,
      priority,
    };

    set((state) => ({
      activeSystemAlerts: [newAlert, ...state.activeSystemAlerts],
    }));

    realtimeService.publish({
      type: 'ADMIN_ALERT',
      alertId: newAlert.id,
      title,
      message,
      priority,
      timestamp: new Date().toISOString(),
      source: 'ADMIN',
    });
  },

  resetDemoOverrides: () => {
    set({
      destinationStatusMap: { ...initialStatus },
      destinationPressureMap: { ...initialPressure },
      experienceSlotsMap: { ...initialSlots },
      activeSystemAlerts: [],
    });
  },
}));
