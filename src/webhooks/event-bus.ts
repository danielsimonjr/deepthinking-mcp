/**
 * Event Bus (v3.4.0)
 * Phase 4 Task 9.7: Central event dispatch system
 */

import type {
  EventBusConfig,
  EventListener,
  EventHandler,
  WebhookEvent,
  WebhookEventType,
} from './types.js';

/**
 * Event bus for managing and dispatching events
 */
export class EventBus {
  private listeners: Map<WebhookEventType, EventListener[]>;
  private config: Required<EventBusConfig>;
  private eventHistory: WebhookEvent[];
  private maxHistorySize: number = 1000;

  constructor(config: Partial<EventBusConfig> = {}) {
    this.listeners = new Map();
    this.config = {
      maxListeners: config.maxListeners || 100,
      enableAsync: config.enableAsync !== false,
      errorHandler: config.errorHandler || this.defaultErrorHandler,
      logEvents: config.logEvents !== false,
    };
    this.eventHistory = [];
  }

  /**
   * Subscribe to an event type
   */
  on(
    eventType: WebhookEventType,
    handler: EventHandler,
    options: { priority?: number; id?: string } = {}
  ): string {
    const listeners = this.listeners.get(eventType) || [];

    if (listeners.length >= this.config.maxListeners) {
      throw new Error(
        `Max listeners (${this.config.maxListeners}) reached for event type: ${eventType}`
      );
    }

    const listener: EventListener = {
      id: options.id || this.generateId(),
      eventType,
      handler,
      priority: options.priority || 0,
      active: true,
    };

    listeners.push(listener);
    // Sort by priority (higher priority first)
    listeners.sort((a, b) => b.priority - a.priority);

    this.listeners.set(eventType, listeners);

    return listener.id;
  }

  /**
   * Subscribe to event once (auto-unsubscribe after first trigger)
   */
  once(
    eventType: WebhookEventType,
    handler: EventHandler,
    options: { priority?: number } = {}
  ): string {
    const wrappedHandler: EventHandler = async event => {
      await handler(event);
      this.off(eventType, listenerId);
    };

    const listenerId = this.on(eventType, wrappedHandler, options);
    return listenerId;
  }

  /**
   * Unsubscribe from an event
   */
  off(eventType: WebhookEventType, listenerId: string): boolean {
    const listeners = this.listeners.get(eventType);
    if (!listeners) return false;

    const index = listeners.findIndex(l => l.id === listenerId);
    if (index === -1) return false;

    listeners.splice(index, 1);

    if (listeners.length === 0) {
      this.listeners.delete(eventType);
    }

    return true;
  }

  /**
   * Unsubscribe all listeners for an event type
   */
  offAll(eventType: WebhookEventType): number {
    const listeners = this.listeners.get(eventType);
    if (!listeners) return 0;

    const count = listeners.length;
    this.listeners.delete(eventType);
    return count;
  }

  /**
   * Emit an event to all listeners
   */
  async emit(event: WebhookEvent): Promise<void> {
    if (this.config.logEvents) {
      this.addToHistory(event);
    }

    const listeners = this.listeners.get(event.type) || [];
    const activeListeners = listeners.filter(l => l.active);

    if (activeListeners.length === 0) {
      return;
    }

    if (this.config.enableAsync) {
      // Execute all handlers concurrently
      await Promise.allSettled(
        activeListeners.map(listener =>
          this.executeHandler(listener, event)
        )
      );
    } else {
      // Execute handlers sequentially
      for (const listener of activeListeners) {
        await this.executeHandler(listener, event);
      }
    }
  }

  /**
   * Execute a single handler with error handling
   */
  private async executeHandler(
    listener: EventListener,
    event: WebhookEvent
  ): Promise<void> {
    try {
      await listener.handler(event);
    } catch (error) {
      this.config.errorHandler(error as Error, event);
    }
  }

  /**
   * Get all listeners for an event type
   */
  getListeners(eventType: WebhookEventType): EventListener[] {
    return [...(this.listeners.get(eventType) || [])];
  }

  /**
   * Get listener count for an event type
   */
  listenerCount(eventType: WebhookEventType): number {
    return this.listeners.get(eventType)?.length || 0;
  }

  /**
   * Get total listener count across all events
   */
  totalListenerCount(): number {
    let count = 0;
    for (const listeners of this.listeners.values()) {
      count += listeners.length;
    }
    return count;
  }

  /**
   * Get all registered event types
   */
  getEventTypes(): WebhookEventType[] {
    return Array.from(this.listeners.keys());
  }

  /**
   * Enable/disable a listener
   */
  setListenerActive(
    eventType: WebhookEventType,
    listenerId: string,
    active: boolean
  ): boolean {
    const listeners = this.listeners.get(eventType);
    if (!listeners) return false;

    const listener = listeners.find(l => l.id === listenerId);
    if (!listener) return false;

    listener.active = active;
    return true;
  }

  /**
   * Clear all listeners
   */
  clear(): void {
    this.listeners.clear();
  }

  /**
   * Get event history
   */
  getHistory(
    filter?: {
      eventType?: WebhookEventType;
      since?: Date;
      limit?: number;
    }
  ): WebhookEvent[] {
    let history = [...this.eventHistory];

    if (filter?.eventType) {
      history = history.filter(e => e.type === filter.eventType);
    }

    if (filter?.since) {
      history = history.filter(e => e.timestamp >= filter.since!);
    }

    if (filter?.limit) {
      history = history.slice(-filter.limit);
    }

    return history;
  }

  /**
   * Clear event history
   */
  clearHistory(): void {
    this.eventHistory = [];
  }

  /**
   * Add event to history
   */
  private addToHistory(event: WebhookEvent): void {
    this.eventHistory.push(event);

    // Trim history if it exceeds max size
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }

  /**
   * Default error handler
   */
  private defaultErrorHandler(error: Error, event: WebhookEvent): void {
    console.error(`Error handling event ${event.type}:`, error);
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `listener_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Get event statistics
   */
  getStats(): {
    totalListeners: number;
    totalEvents: number;
    eventTypes: number;
    eventsPerType: Map<WebhookEventType, number>;
  } {
    const eventsPerType = new Map<WebhookEventType, number>();

    for (const event of this.eventHistory) {
      eventsPerType.set(
        event.type,
        (eventsPerType.get(event.type) || 0) + 1
      );
    }

    return {
      totalListeners: this.totalListenerCount(),
      totalEvents: this.eventHistory.length,
      eventTypes: this.listeners.size,
      eventsPerType,
    };
  }
}
