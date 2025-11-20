/**
 * Event Emitter (v3.4.0)
 * Phase 4 Task 9.7: High-level event emission helpers
 */

import type { EventBus } from './event-bus.js';
import type { WebhookManager } from './webhook-manager.js';
import type {
  WebhookEvent,
  SessionEventData,
  ThoughtEventData,
  ValidationEventData,
  ExportEventData,
  SearchEventData,
  AnalyticsEventData,
} from './types.js';

/**
 * Event emitter for creating and dispatching typed events
 */
export class EventEmitter {
  private eventBus: EventBus;
  private webhookManager: WebhookManager;
  private version: string = '3.4.0';
  private source: string = 'deepthinking-mcp';

  constructor(eventBus: EventBus, webhookManager: WebhookManager) {
    this.eventBus = eventBus;
    this.webhookManager = webhookManager;
  }

  /**
   * Emit session.created event
   */
  async emitSessionCreated(
    data: SessionEventData,
    metadata?: { userId?: string }
  ): Promise<void> {
    const event = this.createEvent('session.created', data, {
      ...metadata,
      sessionId: data.sessionId,
    });

    await this.emit(event);
  }

  /**
   * Emit session.updated event
   */
  async emitSessionUpdated(
    data: SessionEventData,
    metadata?: { userId?: string }
  ): Promise<void> {
    const event = this.createEvent('session.updated', data, {
      ...metadata,
      sessionId: data.sessionId,
    });

    await this.emit(event);
  }

  /**
   * Emit session.completed event
   */
  async emitSessionCompleted(
    data: SessionEventData,
    metadata?: { userId?: string }
  ): Promise<void> {
    const event = this.createEvent('session.completed', data, {
      ...metadata,
      sessionId: data.sessionId,
    });

    await this.emit(event);
  }

  /**
   * Emit session.deleted event
   */
  async emitSessionDeleted(
    data: SessionEventData,
    metadata?: { userId?: string }
  ): Promise<void> {
    const event = this.createEvent('session.deleted', data, {
      ...metadata,
      sessionId: data.sessionId,
    });

    await this.emit(event);
  }

  /**
   * Emit thought.added event
   */
  async emitThoughtAdded(
    data: ThoughtEventData,
    metadata?: { userId?: string }
  ): Promise<void> {
    const event = this.createEvent('thought.added', data, {
      ...metadata,
      sessionId: data.sessionId,
    });

    await this.emit(event);
  }

  /**
   * Emit thought.updated event
   */
  async emitThoughtUpdated(
    data: ThoughtEventData,
    metadata?: { userId?: string }
  ): Promise<void> {
    const event = this.createEvent('thought.updated', data, {
      ...metadata,
      sessionId: data.sessionId,
    });

    await this.emit(event);
  }

  /**
   * Emit thought.validated event
   */
  async emitThoughtValidated(
    data: ThoughtEventData,
    metadata?: { userId?: string }
  ): Promise<void> {
    const event = this.createEvent('thought.validated', data, {
      ...metadata,
      sessionId: data.sessionId,
    });

    await this.emit(event);
  }

  /**
   * Emit validation.failed event
   */
  async emitValidationFailed(
    data: ValidationEventData,
    metadata?: { userId?: string }
  ): Promise<void> {
    const event = this.createEvent('validation.failed', data, {
      ...metadata,
      sessionId: data.sessionId,
    });

    await this.emit(event);
  }

  /**
   * Emit export.completed event
   */
  async emitExportCompleted(
    data: ExportEventData,
    metadata?: { userId?: string }
  ): Promise<void> {
    const event = this.createEvent('export.completed', data, {
      ...metadata,
      sessionId: data.sessionId,
    });

    await this.emit(event);
  }

  /**
   * Emit export.failed event
   */
  async emitExportFailed(
    data: ExportEventData,
    metadata?: { userId?: string }
  ): Promise<void> {
    const event = this.createEvent('export.failed', data, {
      ...metadata,
      sessionId: data.sessionId,
    });

    await this.emit(event);
  }

  /**
   * Emit search.performed event
   */
  async emitSearchPerformed(
    data: SearchEventData,
    metadata?: { userId?: string }
  ): Promise<void> {
    const event = this.createEvent('search.performed', data, metadata);

    await this.emit(event);
  }

  /**
   * Emit analytics.generated event
   */
  async emitAnalyticsGenerated(
    data: AnalyticsEventData,
    metadata?: { userId?: string }
  ): Promise<void> {
    const event = this.createEvent('analytics.generated', data, metadata);

    await this.emit(event);
  }

  /**
   * Create a webhook event
   */
  private createEvent<T>(
    type: WebhookEvent['type'],
    data: T,
    metadata?: {
      userId?: string;
      sessionId?: string;
    }
  ): WebhookEvent<T> {
    return {
      id: this.generateEventId(),
      type,
      timestamp: new Date(),
      data,
      metadata: {
        userId: metadata?.userId,
        sessionId: metadata?.sessionId,
        source: this.source,
        version: this.version,
      },
    };
  }

  /**
   * Emit event to both event bus and webhook manager
   */
  private async emit(event: WebhookEvent): Promise<void> {
    // Emit to event bus (local listeners)
    await this.eventBus.emit(event);

    // Deliver to webhooks (external HTTP endpoints)
    await this.webhookManager.deliver(event);
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get event bus
   */
  getEventBus(): EventBus {
    return this.eventBus;
  }

  /**
   * Get webhook manager
   */
  getWebhookManager(): WebhookManager {
    return this.webhookManager;
  }
}
