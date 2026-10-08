import { create } from 'zustand';
import { Profile } from '../engine/types';

const INITIAL_DEMO_PROFILE: Profile = {
  id: 'usr-tourist-demo',
  name: 'Sanjay',
  photoUri: undefined,
  language: 'en',
  homeCity: 'Coimbatore',
  interests: ['Historical', 'Traditional', 'Cultural'],
  travelStyle: 'balanced',
  destinationMix: {
    famous: 20,
    moderate: 40,
    hidden: 40,
  },
  crowd: 'low',
  transport: ['Car'],
  accommodation: 'Standard',
  food: ['Traditional', 'Vegetarian'],
  accessibility: ['Family friendly'],
  facilities: ['Hospital nearby', 'Hotel nearby', 'Pharmacy nearby', 'Fuel nearby'],
  defaultBudget: 10000,
  trustedContact: {
    name: 'Ananya (Sister)',
    phone: '+91 98401 23456',
  },
  notifications: {
    recommendations: true,
    tripUpdates: true,
    bookings: true,
    quietFrom: '21:00',
    quietTo: '08:00',
    maxPerWeek: 3,
  },
  personalisation: true,
  updatedAt: new Date().toISOString(),
};

export function calculateCompleteness(p: Profile): number {
  let score = 0;
  if (p.name) score += 15;
  if (p.homeCity) score += 15;
  if (p.interests && p.interests.length >= 2) score += 20;
  if (p.travelStyle) score += 15;
  if (p.destinationMix) score += 10;
  if (p.transport && p.transport.length > 0) score += 10;
  if (p.facilities && p.facilities.length > 0) score += 10;
  if (p.trustedContact?.phone) score += 5;
  return Math.min(100, score);
}

interface ProfileState {
  profile: Profile;
  completeness: number;
  promptDismissedThisSession: boolean;
  updateProfile: (partial: Partial<Profile>) => void;
  togglePersonalisation: () => void;
  dismissPrompt: () => void;
  resetToProfileDefaults: () => void;
  exportData: () => string;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: INITIAL_DEMO_PROFILE,
  completeness: calculateCompleteness(INITIAL_DEMO_PROFILE),
  promptDismissedThisSession: false,

  updateProfile: (partial) => {
    set((state) => {
      const updated = {
        ...state.profile,
        ...partial,
        updatedAt: new Date().toISOString(),
      };
      return {
        profile: updated,
        completeness: calculateCompleteness(updated),
      };
    });
  },

  togglePersonalisation: () => {
    set((state) => {
      const updated = {
        ...state.profile,
        personalisation: !state.profile.personalisation,
        updatedAt: new Date().toISOString(),
      };
      return { profile: updated };
    });
  },

  dismissPrompt: () => set({ promptDismissedThisSession: true }),

  resetToProfileDefaults: () => {
    set({
      profile: INITIAL_DEMO_PROFILE,
      completeness: calculateCompleteness(INITIAL_DEMO_PROFILE),
    });
  },

  exportData: () => {
    return JSON.stringify(get().profile, null, 2);
  },
}));
