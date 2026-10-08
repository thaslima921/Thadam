import { create } from 'zustand';
import { SavedTrip, SavedTripStatus } from '../engine/types';
import { TouristPreferences } from '../types/preferences';
import { Trip } from '../types/database';
import { DEFAULT_PREFERENCES } from '../types/preferences';

let debounceTimer: any = null;

interface SavedTripsState {
  savedTrips: SavedTrip[];
  activeDraft: SavedTrip | null;
  deletedBackup: { trip: SavedTrip; index: number } | null;
  versions: Record<string, Trip[]>;

  // Actions
  autosaveDraft: (step: number, request: Partial<TouristPreferences>) => void;
  saveGeneratedTrip: (trip: Trip, request: TouristPreferences, title?: string) => SavedTrip;
  renameTrip: (id: string, newTitle: string) => void;
  duplicateTrip: (id: string) => void;
  deleteTrip: (id: string) => void;
  undoDelete: () => void;
  clearDeletedBackup: () => void;
  getMostRecentTrip: () => SavedTrip | null;
  storeVersion: (tripId: string, trip: Trip) => void;
  getVersions: (tripId: string) => Trip[];
}

export const useSavedTripsStore = create<SavedTripsState>((set, get) => ({
  savedTrips: [
    {
      id: 'trip-saved-demo-01',
      title: 'Thanjavur & Kumbakonam Heritage Expedition',
      status: 'saved',
      request: DEFAULT_PREFERENCES,
      progressLabel: 'Plan ready, review Day 2',
      createdAt: '2026-10-06T10:00:00Z',
      updatedAt: '2026-10-08T09:00:00Z',
      lastOpenedAt: '2026-10-08T09:00:00Z',
      version: 1,
    },
  ],
  activeDraft: null,
  deletedBackup: null,
  versions: {},

  autosaveDraft: (step, requestPartial) => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const state = get();
      const current = state.activeDraft;
      const updatedReq: TouristPreferences = {
        ...(current?.request || DEFAULT_PREFERENCES),
        ...requestPartial,
      };

      const now = new Date().toISOString();
      const draft: SavedTrip = {
        id: current?.id || `draft-${Date.now()}`,
        title: `${updatedReq.startLocation || 'Coimbatore'} to ${updatedReq.destination || 'Thanjavur'} Draft`,
        status: 'draft',
        request: updatedReq,
        builderStep: step,
        progressLabel: `Step ${step} of 5`,
        createdAt: current?.createdAt || now,
        updatedAt: now,
        lastOpenedAt: now,
        version: (current?.version || 0) + 1,
      };

      set({ activeDraft: draft });
    }, 500);
  },

  saveGeneratedTrip: (trip, request, title) => {
    const now = new Date().toISOString();
    const newSaved: SavedTrip = {
      id: trip.id || `saved-${Date.now()}`,
      title: title || trip.title || 'Smart Tamil Nadu Journey',
      status: 'saved',
      request,
      trip,
      builderStep: 5,
      progressLabel: 'Plan ready',
      createdAt: now,
      updatedAt: now,
      lastOpenedAt: now,
      version: 1,
    };

    set((state) => ({
      savedTrips: [newSaved, ...state.savedTrips.filter((t) => t.id !== newSaved.id)],
      activeDraft: null,
    }));

    get().storeVersion(newSaved.id, trip);
    return newSaved;
  },

  renameTrip: (id, newTitle) => {
    set((state) => ({
      savedTrips: state.savedTrips.map((t) => (t.id === id ? { ...t, title: newTitle, updatedAt: new Date().toISOString() } : t)),
    }));
  },

  duplicateTrip: (id) => {
    const original = get().savedTrips.find((t) => t.id === id);
    if (!original) return;
    const now = new Date().toISOString();
    const copy: SavedTrip = {
      ...original,
      id: `copy-${Date.now()}`,
      title: `${original.title} (Copy)`,
      createdAt: now,
      updatedAt: now,
      lastOpenedAt: now,
      version: 1,
    };
    set((state) => ({ savedTrips: [copy, ...state.savedTrips] }));
  },

  deleteTrip: (id) => {
    const list = get().savedTrips;
    const index = list.findIndex((t) => t.id === id);
    if (index === -1) return;
    const target = list[index];

    set((state) => ({
      deletedBackup: { trip: target, index },
      savedTrips: state.savedTrips.filter((t) => t.id !== id),
    }));

    // Auto-clear backup after 8 seconds (undo window)
    setTimeout(() => {
      get().clearDeletedBackup();
    }, 8000);
  },

  undoDelete: () => {
    const backup = get().deletedBackup;
    if (!backup) return;
    set((state) => {
      const restored = [...state.savedTrips];
      restored.splice(backup.index, 0, backup.trip);
      return { savedTrips: restored, deletedBackup: null };
    });
  },

  clearDeletedBackup: () => set({ deletedBackup: null }),

  getMostRecentTrip: () => {
    const { activeDraft, savedTrips } = get();
    if (activeDraft) return activeDraft;
    if (savedTrips.length > 0) return savedTrips[0];
    return null;
  },

  storeVersion: (tripId, trip) => {
    set((state) => {
      const existing = state.versions[tripId] || [];
      const updated = [trip, ...existing].slice(0, 10); // Keep last 10 versions
      return { versions: { ...state.versions, [tripId]: updated } };
    });
  },

  getVersions: (tripId) => get().versions[tripId] || [],
}));
