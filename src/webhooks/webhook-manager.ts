/**
 * Webhook Manager (v3.4.0)
 * Phase 4 Task 9.7: Webhook delivery and management system
 */

import crypto from 'crypto';
import type {
  WebhookConfig,
  WebhookEvent,
  WebhookDelivery,
  WebhookStats,
  WebhookStatus,
  WebhookValidation,
  WebhookEventType,
} from './types.js';

/**
 * Webhook manager for registering and delivering webhooks
 */
export class WebhookManager {
  private webhooks: Map<string, WebhookConfig>;
  private deliveries: Map<string, WebhookDelivery>;
  private validation: WebhookValidation;
  private deliveryQueue: string[];
  private processing: boolean;

  constructor(validation: Partial<WebhookValidation> = {}) {
    this.webhooks = new Map();
    this.deliveries = new Map();
    this.validation = {
      validateSignature: validation.validateSignature !== false,
      requireHttps: validation.requireHttps !== false,
      allowedDomains: validation.allowedDomains,
      blockedDomains: validation.blockedDomains,
    };
    this.deliveryQueue = [];
    this.processing = false;
  }

  /**
   * Register a new webhook
   */
  register(config: Omit<WebhookConfig, 'id' | 'createdAt'>): WebhookConfig {
    // Validate URL
    this.validateUrl(config.url);

    const webhook: WebhookConfig = {
      id: this.generateId('webhook'),
      ...config,
      createdAt: new Date(),
    };

    this.webhooks.set(webhook.id, webhook);
    return webhook;
  }

  /**
   * Update webhook configuration
   */
  update(
    webhookId: string,
    updates: Partial<Omit<WebhookConfig, 'id' | 'createdAt'>>
  ): WebhookConfig | null {
    const webhook = this.webhooks.get(webhookId);
    if (!webhook) return null;

    if (updates.url) {
      this.validateUrl(updates.url);
    }

    const updated = {
      ...webhook,
      ...updates,
    };

    this.webhooks.set(webhookId, updated);
    return updated;
  }

  /**
   * Delete a webhook
   */
  delete(webhookId: string): boolean {
    return this.webhooks.delete(webhookId);
  }

  /**
   * Get webhook by ID
   */
  get(webhookId: string): WebhookConfig | null {
    return this.webhooks.get(webhookId) || null;
  }

  /**
   * Get all webhooks
   */
  getAll(filter?: { active?: boolean; events?: WebhookEventType[] }): WebhookConfig[] {
    let webhooks = Array.from(this.webhooks.values());

    if (filter?.active !== undefined) {
      webhooks = webhooks.filter(w => w.active === filter.active);
    }

    if (filter?.events) {
      webhooks = webhooks.filter(w =>
        filter.events!.some(e => w.events.includes(e))
      );
    }

    return webhooks;
  }

  /**
   * Deliver event to matching webhooks
   */
  async deliver(event: WebhookEvent): Promise<WebhookDelivery[]> {
    const matchingWebhooks = this.getAll({
      active: true,
      events: [event.type],
    });

    const deliveries: WebhookDelivery[] = [];

    for (const webhook of matchingWebhooks) {
      const delivery = this.createDelivery(webhook, event);
      this.deliveries.set(delivery.id, delivery);
      this.deliveryQueue.push(delivery.id);
      deliveries.push(delivery);
    }

    // Start processing queue if not already processing
    if (!this.processing) {
      this.processQueue();
    }

    return deliveries;
  }

  /**
   * Process delivery queue
   */
  private async processQueue(): Promise<void> {
    if (this.processing || this.deliveryQueue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.deliveryQueue.length > 0) {
      const deliveryId = this.deliveryQueue.shift()!;
      const delivery = this.deliveries.get(deliveryId);

      if (!delivery) continue;

      await this.executeDelivery(delivery);
    }

    this.processing = false;
  }

  /**
   * Execute a single webhook delivery
   */
  private async executeDelivery(delivery: WebhookDelivery): Promise<void> {
    const webhook = this.webhooks.get(delivery.webhookId);
    if (!webhook) return;

    delivery.status = 'retrying';
    delivery.attempts++;
    delivery.lastAttempt = new Date();

    try {
      const event = await this.getEventForDelivery(delivery.eventId);
      if (!event) {
        delivery.status = 'failed';
        delivery.error = 'Event not found';
        return;
      }

      const response = await this.sendWebhook(webhook, event);

      delivery.response = response;

      if (response.statusCode >= 200 && response.statusCode < 300) {
        delivery.status = 'delivered';
        delivery.deliveredAt = new Date();
        webhook.lastUsed = new Date();
      } else {
        throw new Error(`HTTP ${response.statusCode}: ${response.body}`);
      }
    } catch (error) {
      delivery.status = 'failed';
      delivery.error = (error as Error).message;

      // Retry if attempts < max
      if (delivery.attempts < webhook.retryCount) {
        delivery.status = 'retrying';
        delivery.nextRetry = new Date(
          Date.now() + webhook.retryDelay * delivery.attempts * 1000
        );

        // Re-queue with delay
        setTimeout(() => {
          this.deliveryQueue.push(delivery.id);
          this.processQueue();
        }, webhook.retryDelay * delivery.attempts * 1000);
      }
    }
  }

  /**
   * Send webhook HTTP request
   */
  private async sendWebhook(
    webhook: WebhookConfig,
    event: WebhookEvent
  ): Promise<{
    statusCode: number;
    body: string;
    headers: Record<string, string>;
    duration: number;
  }> {
    const startTime = Date.now();

    const payload = JSON.stringify(event);
    const signature = this.generateSignature(payload, webhook.secret);

    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'DeepThinking-MCP-Webhook/1.0',
      'X-Webhook-Signature': signature,
      'X-Webhook-ID': webhook.id,
      'X-Event-Type': event.type,
      'X-Event-ID': event.id,
      ...webhook.headers,
    };

    // Use fetch or http module (simplified for example)
    const response = await fetch(webhook.url, {
      method: webhook.method,
      headers,
      body: payload,
      signal: AbortSignal.timeout(webhook.timeout * 1000),
    });

    const body = await response.text();
    const duration = Date.now() - startTime;

    return {
      statusCode: response.status,
      body,
      headers: Object.fromEntries(response.headers.entries()),
      duration,
    };
  }

  /**
   * Generate HMAC signature for webhook payload
   */
  private generateSignature(payload: string, secret: string): string {
    return crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
  }

  /**
   * Verify webhook signature
   */
  verifySignature(
    payload: string,
    signature: string,
    secret: string
  ): boolean {
    const expected = this.generateSignature(payload, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected)
    );
  }

  /**
   * Get delivery by ID
   */
  getDelivery(deliveryId: string): WebhookDelivery | null {
    return this.deliveries.get(deliveryId) || null;
  }

  /**
   * Get deliveries for a webhook
   */
  getDeliveries(
    webhookId: string,
    filter?: {
      status?: WebhookStatus;
      since?: Date;
      limit?: number;
    }
  ): WebhookDelivery[] {
    let deliveries = Array.from(this.deliveries.values()).filter(
      d => d.webhookId === webhookId
    );

    if (filter?.status) {
      deliveries = deliveries.filter(d => d.status === filter.status);
    }

    if (filter?.since) {
      deliveries = deliveries.filter(d => d.createdAt >= filter.since!);
    }

    // Sort by creation date (newest first)
    deliveries.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    if (filter?.limit) {
      deliveries = deliveries.slice(0, filter.limit);
    }

    return deliveries;
  }

  /**
   * Get webhook statistics
   */
  getStats(webhookId: string): WebhookStats | null {
    const webhook = this.webhooks.get(webhookId);
    if (!webhook) return null;

    const deliveries = this.getDeliveries(webhookId);

    const stats: WebhookStats = {
      webhookId,
      totalEvents: deliveries.length,
      delivered: deliveries.filter(d => d.status === 'delivered').length,
      failed: deliveries.filter(d => d.status === 'failed').length,
      pending: deliveries.filter(d => d.status === 'pending').length,
      retrying: deliveries.filter(d => d.status === 'retrying').length,
      successRate: 0,
      avgDeliveryTime: 0,
      lastDelivery: undefined,
      eventTypeBreakdown: new Map(),
    };

    if (stats.totalEvents > 0) {
      stats.successRate = (stats.delivered / stats.totalEvents) * 100;
    }

    // Calculate average delivery time
    const deliveredDeliveries = deliveries.filter(
      d => d.status === 'delivered' && d.response
    );
    if (deliveredDeliveries.length > 0) {
      const totalTime = deliveredDeliveries.reduce(
        (sum, d) => sum + (d.response?.duration || 0),
        0
      );
      stats.avgDeliveryTime = totalTime / deliveredDeliveries.length;
    }

    // Get last delivery
    if (deliveries.length > 0) {
      stats.lastDelivery = deliveries[0].deliveredAt;
    }

    return stats;
  }

  /**
   * Validate webhook URL
   */
  private validateUrl(url: string): void {
    const parsed = new URL(url);

    // Check HTTPS requirement
    if (this.validation.requireHttps && parsed.protocol !== 'https:') {
      throw new Error('Webhook URL must use HTTPS');
    }

    // Check allowed domains
    if (
      this.validation.allowedDomains &&
      !this.validation.allowedDomains.includes(parsed.hostname)
    ) {
      throw new Error(`Domain ${parsed.hostname} is not allowed`);
    }

    // Check blocked domains
    if (
      this.validation.blockedDomains &&
      this.validation.blockedDomains.includes(parsed.hostname)
    ) {
      throw new Error(`Domain ${parsed.hostname} is blocked`);
    }
  }

  /**
   * Create delivery record
   */
  private createDelivery(
    webhook: WebhookConfig,
    event: WebhookEvent
  ): WebhookDelivery {
    return {
      id: this.generateId('delivery'),
      webhookId: webhook.id,
      eventId: event.id,
      status: 'pending',
      attempts: 0,
      createdAt: new Date(),
    };
  }

  /**
   * Get event for delivery (stub - should integrate with event storage)
   */
  private async getEventForDelivery(eventId: string): Promise<WebhookEvent | null> {
    // In real implementation, this would fetch from event storage
    // For now, return null
    return null;
  }

  /**
   * Generate unique ID
   */
  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Retry failed delivery
   */
  async retryDelivery(deliveryId: string): Promise<boolean> {
    const delivery = this.deliveries.get(deliveryId);
    if (!delivery || delivery.status !== 'failed') return false;

    delivery.status = 'pending';
    delivery.attempts = 0;
    delivery.error = undefined;

    this.deliveryQueue.push(deliveryId);
    this.processQueue();

    return true;
  }

  /**
   * Clear delivery history
   */
  clearDeliveries(webhookId?: string, olderThan?: Date): number {
    let count = 0;

    for (const [id, delivery] of this.deliveries) {
      if (webhookId && delivery.webhookId !== webhookId) continue;
      if (olderThan && delivery.createdAt >= olderThan) continue;

      this.deliveries.delete(id);
      count++;
    }

    return count;
  }
}
