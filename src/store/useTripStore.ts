import { create } from 'zustand';
import { TouristPreferences } from '../types/preferences';
import { Booking, Destination, Experience, Trip, TripStop } from '../types/database';
import { DEFAULT_PILOT_PREFERENCES } from '../config/constants';
import {
  generateItinerary,
  generateItineraryFromRanked,
  replaceTripStop,
  removeTripStop,
  findAlternatives,
} from '../services/aiPlannerService';
import { fetchThadamRecommendations } from '../services/thadamApi';
import { EXPERIENCES } from '../data/experiences';
import { realtimeService } from '../services/realtimeService';

interface DisruptionAlert {
  id: string;
  destinationId: string;
  destinationName: string;
  reason: string;
  affectedStop?: TripStop;
  affectedDayNumber?: number;
  alternatives: Array<{
    destination: Destination;
    scoreMatch: number;
    distanceKm: number;
    estimatedCost: number;
    reasons: string[];
    experience?: Experience;
  }>;
}

interface TripStoreState {
  preferences: TouristPreferences;
  currentTrip: Trip | null;
  savedTrips: Trip[];
  activeTripSession: {
    isActive: boolean;
    currentStopIndex: number;
    currentDayNumber: number;
    startedAt?: string;
  } | null;
  bookings: Booking[];
  savedPlaceIds: string[];
  disruptionAlert: DisruptionAlert | null;

  // Actions
  setPreferences: (partial: Partial<TouristPreferences>) => void;
  generateTrip: () => Trip;
  generateTripWithAI: () => Promise<Trip>;
  setTrip: (trip: Trip) => void;
  replaceStop: (dayNumber: number, stopId: string, newDest: Destination, newExp?: Experience) => void;
  removeStop: (dayNumber: number, stopId: string) => void;
  startLiveTrip: () => void;
  endLiveTrip: () => void;
  nextLiveStop: () => void;
  bookExperience: (exp: Experience, date: string, timeSlot: string, peopleCount: number) => Booking;
  toggleSavePlace: (destId: string) => void;
  handleRealtimeClosure: (destinationId: string, destinationName: string, reason: string) => void;
  resolveDisruption: (chosenAltDestination: Destination, chosenAltExperience?: Experience) => void;
  dismissDisruptionAlert: () => void;
}

export const useTripStore = create<TripStoreState>((set, get) => {
  // Generate initial default pilot trip so app loads with ready-to-view itinerary
  const initialTrip = generateItinerary(DEFAULT_PILOT_PREFERENCES);

  return {
    preferences: DEFAULT_PILOT_PREFERENCES,
    currentTrip: initialTrip,
    savedTrips: [],
    activeTripSession: null,
    bookings: [
      {
        id: 'book-sample-01',
        userId: 'usr-tourist-01',
        experienceId: 'exp-swamimalai-bronze',
        experience: EXPERIENCES[0],
        date: '2026-10-16',
        timeSlot: '12:00 PM',
        peopleCount: 2,
        totalPrice: 1300,
        status: 'CONFIRMED',
        bookingReference: 'THD-BRONZE-8842',
        qrToken: 'QR-THADAM-BRONZE-8842-VERIFIED',
        createdAt: '2026-10-06T10:00:00Z',
      },
    ],
    savedPlaceIds: ['dest-pullamangai', 'dest-swamimalai-craft'],
    disruptionAlert: null,

    setPreferences: (partial) => {
      set((state) => ({
        preferences: {
          ...state.preferences,
          ...partial,
        },
      }));
    },

    generateTrip: () => {
      const { preferences } = get();
      const trip = generateItinerary(preferences);
      set({ currentTrip: trip, disruptionAlert: null });
      return trip;
    },

    generateTripWithAI: async () => {
      const { preferences } = get();
      try {
        const response = await fetchThadamRecommendations(preferences);
        if (response.success && response.recommendations.length > 0) {
          const trip = generateItineraryFromRanked(preferences, response.recommendations);
          set({ currentTrip: trip, disruptionAlert: null });
          return trip;
        }
      } catch {
        // Backend unreachable — fall back to local engine silently
      }
      const fallbackTrip = generateItinerary(preferences);
      set({ currentTrip: fallbackTrip, disruptionAlert: null });
      return fallbackTrip;
    },

    setTrip: (trip) => set({ currentTrip: trip }),

    replaceStop: (dayNumber, stopId, newDest, newExp) => {
      const { currentTrip } = get();
      if (!currentTrip) return;
      const updated = replaceTripStop(currentTrip, dayNumber, stopId, newDest, newExp);
      set({ currentTrip: updated });
    },

    removeStop: (dayNumber, stopId) => {
      const { currentTrip } = get();
      if (!currentTrip) return;
      const updated = removeTripStop(currentTrip, dayNumber, stopId);
      set({ currentTrip: updated });
    },

    startLiveTrip: () => {
      set({
        activeTripSession: {
          isActive: true,
          currentDayNumber: 1,
          currentStopIndex: 0,
          startedAt: new Date().toISOString(),
        },
      });
    },

    endLiveTrip: () => {
      set({ activeTripSession: null });
    },

    nextLiveStop: () => {
      const { activeTripSession, currentTrip } = get();
      if (!activeTripSession || !currentTrip) return;
      const currentDay = currentTrip.days.find((d) => d.dayNumber === activeTripSession.currentDayNumber);
      if (!currentDay) return;

      if (activeTripSession.currentStopIndex < currentDay.stops.length - 1) {
        set({
          activeTripSession: {
            ...activeTripSession,
            currentStopIndex: activeTripSession.currentStopIndex + 1,
          },
        });
      } else if (activeTripSession.currentDayNumber < currentTrip.days.length) {
        set({
          activeTripSession: {
            ...activeTripSession,
            currentDayNumber: activeTripSession.currentDayNumber + 1,
            currentStopIndex: 0,
          },
        });
      }
    },

    bookExperience: (exp, date, timeSlot, peopleCount) => {
      const newBooking: Booking = {
        id: `book-${Date.now()}`,
        userId: 'usr-tourist-01',
        experienceId: exp.id,
        experience: exp,
        date,
        timeSlot,
        peopleCount,
        totalPrice: exp.price * peopleCount,
        status: 'CONFIRMED',
        bookingReference: `THD-${exp.category.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
        qrToken: `QR-THADAM-${exp.id}-${Date.now()}-CONFIRMED`,
        createdAt: new Date().toISOString(),
      };

      set((state) => ({
        bookings: [newBooking, ...state.bookings],
      }));

      // Broadcast booking to realtime event bus
      realtimeService.publish({
        type: 'CAPACITY_CHANGED',
        experienceId: exp.id,
        experienceName: exp.name,
        newAvailableSlots: Math.max(0, exp.availableSlots - peopleCount),
        totalCapacity: exp.capacity,
        timestamp: new Date().toISOString(),
        source: 'PARTNER',
      });

      return newBooking;
    },

    toggleSavePlace: (destId) => {
      set((state) => {
        const exists = state.savedPlaceIds.includes(destId);
        return {
          savedPlaceIds: exists
            ? state.savedPlaceIds.filter((id) => id !== destId)
            : [...state.savedPlaceIds, destId],
        };
      });
    },

    handleRealtimeClosure: (destinationId, destinationName, reason) => {
      const { currentTrip, preferences } = get();
      if (!currentTrip) return;

      // Find if this closed destination is in user's itinerary
      let foundStop: TripStop | undefined;
      let foundDayNumber: number | undefined;

      for (const day of currentTrip.days) {
        for (const stop of day.stops) {
          if (stop.destinationId === destinationId) {
            foundStop = stop;
            foundDayNumber = day.dayNumber;
            break;
          }
        }
        if (foundStop) break;
      }

      if (foundStop && foundDayNumber !== undefined) {
        // Generate alternatives
        const alternatives = findAlternatives(foundStop, 'Closure', preferences, currentTrip);
        set({
          disruptionAlert: {
            id: `alert-disrupt-${Date.now()}`,
            destinationId,
            destinationName,
            reason,
            affectedStop: foundStop,
            affectedDayNumber: foundDayNumber,
            alternatives,
          },
        });
      }
    },

    resolveDisruption: (chosenAltDestination, chosenAltExperience) => {
      const { disruptionAlert, currentTrip, replaceStop } = get();
      if (!disruptionAlert || !currentTrip || !disruptionAlert.affectedStop || disruptionAlert.affectedDayNumber === undefined) {
        set({ disruptionAlert: null });
        return;
      }

      replaceStop(
        disruptionAlert.affectedDayNumber,
        disruptionAlert.affectedStop.id,
        chosenAltDestination,
        chosenAltExperience
      );

      set({ disruptionAlert: null });
    },

    dismissDisruptionAlert: () => set({ disruptionAlert: null }),
  };
});
