export type RealtimeEventType =
  | 'BOOKING_CREATED'
  | 'CAPACITY_CHANGED'
  | 'EXPERIENCE_PAUSED'
  | 'DESTINATION_OPENED'
  | 'DESTINATION_CLOSED'
  | 'PRESSURE_CHANGED'
  | 'ROUTE_DISRUPTION'
  | 'ADMIN_ALERT'
  | 'NEW_PLACE_VERIFIED'
  | 'NEW_EXPERIENCE_LIVE'
  | '*';

export interface RealtimeEventPayload {
  type: RealtimeEventType;
  destinationId?: string;
  destinationName?: string;
  experienceId?: string;
  experienceName?: string;
  pressureLevel?: string;
  newAvailableSlots?: number;
  totalCapacity?: number;
  priority?: string;
  title?: string;
  alertId?: string;
  message?: string;
  value?: any;
  reason?: string;
  timestamp?: string;
  source?: string;
}

type EventListener = (event: RealtimeEventPayload) => void;

class RealtimeService {
  private listeners: Map<RealtimeEventType | '*', Set<EventListener>> = new Map();
  private broadcastChannel: any = null;

  constructor() {
    this.listeners.set('*', new Set());

    // BroadcastChannel support for cross-tab realtime sync on web
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new (window as any).BroadcastChannel('thadam_tn_bus');
        this.broadcastChannel.onmessage = (ev: MessageEvent) => {
          if (ev.data) {
            this.notifyLocalListeners(ev.data);
          }
        };
      } catch (err) {
        console.warn('BroadcastChannel not initialized:', err);
      }
    }
  }

  public subscribe(eventType: RealtimeEventType | '*', listener: EventListener): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(listener);

    return () => {
      this.listeners.get(eventType)?.delete(listener);
    };
  }

  public publish(event: RealtimeEventPayload): void {
    console.log(`[DEMO_BUS] ${event.type}:`, event);

    this.notifyLocalListeners(event);

    // Cross-tab broadcast on web
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(event);
      } catch (err) {
        console.error('Error posting to broadcast channel:', err);
      }
    }
  }

  private notifyLocalListeners(event: RealtimeEventPayload): void {
    const specificListeners = this.listeners.get(event.type);
    if (specificListeners) {
      specificListeners.forEach((listener) => {
        try {
          listener(event);
        } catch (e) {
          console.error('Error in realtime listener:', e);
        }
      });
    }

    const wildcardListeners = this.listeners.get('*');
    if (wildcardListeners) {
      wildcardListeners.forEach((listener) => {
        try {
          listener(event);
        } catch (e) {
          console.error('Error in wildcard listener:', e);
        }
      });
    }
  }
}

export const realtimeService = new RealtimeService();
