import { create } from 'zustand';
import { NotificationItem } from '../engine/types';
import { evaluatePreferenceMatch, NotificationHistory } from '../engine/notify';
import { realtimeService, RealtimeEventPayload } from '../services/realtimeService';
import { useProfileStore } from './useProfileStore';
import { DESTINATIONS } from '../data/destinations';
import { EXPERIENCES } from '../data/experiences';

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  history: NotificationHistory;
  activeBanner: NotificationItem | null;

  // Actions
  addNotification: (item: NotificationItem) => void;
  markAllRead: () => void;
  markAsRead: (id: string) => void;
  dismissBanner: () => void;
  processEvent: (payload: RealtimeEventPayload) => void;
  setupBusSubscription: () => () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [
    {
      id: 'notif-welcome',
      title: 'Welcome to Thadam TN',
      body: 'Your intelligent travel companion for Tamil Nadu heritage. Explore Beyond the Famous.',
      group: 'FOR_YOU',
      statusBadge: 'DEMO',
      createdAt: '2026-10-08T09:00:00Z',
      read: true,
    },
  ],
  unreadCount: 0,
  history: {
    notifiedIds: ['p1'],
    weeklyCount: 0,
  },
  activeBanner: null,

  addNotification: (item) => {
    set((state) => ({
      notifications: [item, ...state.notifications],
      unreadCount: state.unreadCount + 1,
      activeBanner: item,
      history: {
        ...state.history,
        notifiedIds: item.destinationId ? [...state.history.notifiedIds, item.destinationId] : state.history.notifiedIds,
        lastRecommendationDate: new Date().toISOString().slice(0, 10),
        weeklyCount: state.history.weeklyCount + 1,
      },
    }));
  },

  markAllRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },

  markAsRead: (id) => {
    set((state) => {
      const updated = state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
      const unread = updated.filter((n) => !n.read).length;
      return { notifications: updated, unreadCount: unread };
    });
  },

  dismissBanner: () => set({ activeBanner: null }),

  processEvent: (payload) => {
    const profile = useProfileStore.getState().profile;
    const data = {
      destinations: DESTINATIONS,
      experiences: EXPERIENCES,
    };
    const history = get().history;

    const notif = evaluatePreferenceMatch(payload, profile, data, history);
    if (notif) {
      get().addNotification(notif);
    }
  },

  setupBusSubscription: () => {
    return realtimeService.subscribe('*', (event) => {
      get().processEvent(event);
    });
  },
}));
