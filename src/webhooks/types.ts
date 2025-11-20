/**
 * Webhook and Event System Types (v3.4.0)
 * Phase 4 Task 9.7: Event-driven architecture with 8+ event types
 */

/**
 * Webhook event types (8+ events)
 */
export type WebhookEventType =
  | 'session.created'
  | 'session.updated'
  | 'session.completed'
  | 'session.deleted'
  | 'thought.added'
  | 'thought.updated'
  | 'thought.validated'
  | 'validation.failed'
  | 'export.completed'
  | 'export.failed'
  | 'search.performed'
  | 'analytics.generated';

/**
 * Webhook delivery status
 */
export type WebhookStatus =
  | 'pending'
  | 'delivered'
  | 'failed'
  | 'retrying';

/**
 * HTTP method for webhook
 */
export type HttpMethod = 'POST' | 'PUT' | 'PATCH';

/**
 * Webhook configuration
 */
export interface WebhookConfig {
  id: string;
  url: string;
  secret: string;
  events: WebhookEventType[];
  active: boolean;
  method: HttpMethod;
  headers: Record<string, string>;
  timeout: number;
  retryCount: number;
  retryDelay: number;
  createdAt: Date;
  lastUsed?: Date;
  description?: string;
}

/**
 * Webhook event payload
 */
export interface WebhookEvent<T = any> {
  id: string;
  type: WebhookEventType;
  timestamp: Date;
  data: T;
  metadata: {
    userId?: string;
    sessionId?: string;
    source: string;
    version: string;
  };
}

/**
 * Session event data
 */
export interface SessionEventData {
  sessionId: string;
  mode: string;
  title?: string;
  thoughtCount: number;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Thought event data
 */
export interface ThoughtEventData {
  thoughtId: string;
  sessionId: string;
  thoughtNumber: number;
  mode: string;
  content: string;
  validated: boolean;
  confidence?: number;
}

/**
 * Validation event data
 */
export interface ValidationEventData {
  sessionId: string;
  thoughtId?: string;
  validationId: string;
  isValid: boolean;
  issues: Array<{
    category: string;
    message: string;
    severity: 'error' | 'warning' | 'info';
  }>;
  timestamp: Date;
}

/**
 * Export event data
 */
export interface ExportEventData {
  sessionId: string;
  format: string;
  exportId: string;
  fileSize?: number;
  filePath?: string;
  duration: number;
  error?: string;
}

/**
 * Search event data
 */
export interface SearchEventData {
  queryId: string;
  query: string;
  resultCount: number;
  executionTime: number;
  filters: Record<string, any>;
}

/**
 * Analytics event data
 */
export interface AnalyticsEventData {
  dashboardId: string;
  dateRange?: { from: Date; to: Date };
  sessionCount: number;
  thoughtCount: number;
  generationTime: number;
}

/**
 * Webhook delivery attempt
 */
export interface WebhookDelivery {
  id: string;
  webhookId: string;
  eventId: string;
  status: WebhookStatus;
  attempts: number;
  lastAttempt?: Date;
  nextRetry?: Date;
  response?: {
    statusCode: number;
    body: string;
    headers: Record<string, string>;
    duration: number;
  };
  error?: string;
  createdAt: Date;
  deliveredAt?: Date;
}

/**
 * Webhook statistics
 */
export interface WebhookStats {
  webhookId: string;
  totalEvents: number;
  delivered: number;
  failed: number;
  pending: number;
  retrying: number;
  successRate: number;
  avgDeliveryTime: number;
  lastDelivery?: Date;
  eventTypeBreakdown: Map<WebhookEventType, number>;
}

/**
 * Event listener configuration
 */
export interface EventListener {
  id: string;
  eventType: WebhookEventType;
  handler: EventHandler;
  priority: number;
  active: boolean;
}

/**
 * Event handler function
 */
export type EventHandler = (event: WebhookEvent) => void | Promise<void>;

/**
 * Event bus configuration
 */
export interface EventBusConfig {
  maxListeners: number;
  enableAsync: boolean;
  errorHandler?: (error: Error, event: WebhookEvent) => void;
  logEvents: boolean;
}

/**
 * Webhook validation options
 */
export interface WebhookValidation {
  validateSignature: boolean;
  requireHttps: boolean;
  allowedDomains?: string[];
  blockedDomains?: string[];
}

/**
 * Webhook batch delivery
 */
export interface WebhookBatch {
  id: string;
  webhookId: string;
  events: WebhookEvent[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  processedAt?: Date;
}
