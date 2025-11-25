/**
 * Rate Limiter (v3.4.5)
 * Sprint 2 Task 2.5: Rate limiting for critical operations
 *
 * Implements sliding window rate limiting to prevent abuse and ensure
 * fair resource usage across all clients.
 *
 * FEATURES:
 * - Sliding window algorithm for accurate rate limiting
 * - Per-operation and per-key rate limits
 * - Automatic cleanup of expired entries
 * - Configurable window sizes and limits
 * - Memory-efficient implementation
 *
 * USAGE:
 * ```typescript
 * const limiter = new RateLimiter({
 *   windowMs: 60000,  // 1 minute
 *   maxRequests: 100  // 100 requests per minute
 * });
 *
 * if (await limiter.checkLimit('operation:userId')) {
 *   // Proceed with operation
 * } else {
 *   throw new RateLimitError('Too many requests');
 * }
 * ```
 */

import { RateLimitError } from './errors.js';

/**
 * Rate limiter configuration
 */
export interface RateLimiterConfig {
  /**
   * Time window in milliseconds
   * @default 60000 (1 minute)
   */
  windowMs?: number;

  /**
   * Maximum requests allowed in the time window
   * @default 100
   */
  maxRequests?: number;

  /**
   * Whether to skip failed requests in rate limit
   * @default false
   */
  skipFailedRequests?: boolean;

  /**
   * Interval for cleaning up expired entries (ms)
   * @default 60000 (1 minute)
   */
  cleanupInterval?: number;
}

/**
 * Rate limit status
 */
export interface RateLimitStatus {
  /**
   * Whether the request is allowed
   */
  allowed: boolean;

  /**
   * Current request count in window
   */
  current: number;

  /**
   * Maximum allowed requests
   */
  limit: number;

  /**
   * Remaining requests in current window
   */
  remaining: number;

  /**
   * Time until window resets (ms)
   */
  resetTime: number;

  /**
   * Timestamp when limit will reset
   */
  resetAt: Date;
}

/**
 * Rate Limiter - Sliding window implementation
 *
 * Tracks requests per key (e.g., user ID, IP, operation) and enforces
 * configurable rate limits to prevent abuse.
 *
 * @example
 * ```typescript
 * const limiter = new RateLimiter({
 *   windowMs: 60000,    // 1 minute window
 *   maxRequests: 10     // 10 requests per minute
 * });
 *
 * // Check if request is allowed
 * const status = await limiter.check('user:123');
 * if (!status.allowed) {
 *   throw new RateLimitError('Rate limit exceeded', status.limit, status.resetTime);
 * }
 * ```
 */
export class RateLimiter {
  private config: Required<RateLimiterConfig>;
  private requests: Map<string, number[]>;
  private cleanupTimer?: NodeJS.Timeout;

  /**
   * Creates a new rate limiter instance
   *
   * @param config - Rate limiter configuration
   */
  constructor(config: RateLimiterConfig = {}) {
    this.config = {
      windowMs: config.windowMs ?? 60000,
      maxRequests: config.maxRequests ?? 100,
      skipFailedRequests: config.skipFailedRequests ?? false,
      cleanupInterval: config.cleanupInterval ?? 60000,
    };

    this.requests = new Map();

    // Start periodic cleanup
    this.startCleanup();
  }

  /**
   * Checks if a request is allowed under rate limits
   *
   * @param key - Unique identifier for the rate limit (e.g., 'user:123', 'ip:192.168.1.1')
   * @returns Rate limit status including allowed flag and metrics
   *
   * @example
   * ```typescript
   * const status = await limiter.check('createSession:user123');
   * if (status.allowed) {
   *   console.log(`Remaining: ${status.remaining}/${status.limit}`);
   * } else {
   *   console.log(`Rate limited. Reset in ${status.resetTime}ms`);
   * }
   * ```
   */
  async check(key: string): Promise<RateLimitStatus> {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    // Get existing requests for this key
    let timestamps = this.requests.get(key) || [];

    // Remove expired timestamps (outside current window)
    timestamps = timestamps.filter(ts => ts > windowStart);

    // Calculate current count
    const current = timestamps.length;
    const allowed = current < this.config.maxRequests;

    // If allowed, record this request
    if (allowed) {
      timestamps.push(now);
      this.requests.set(key, timestamps);
    }

    // Calculate when the window will reset (when oldest entry expires)
    const oldestTimestamp = timestamps[0] || now;
    const resetTime = Math.max(0, oldestTimestamp + this.config.windowMs - now);
    const resetAt = new Date(oldestTimestamp + this.config.windowMs);

    return {
      allowed,
      current: allowed ? current + 1 : current,
      limit: this.config.maxRequests,
      remaining: Math.max(0, this.config.maxRequests - current - (allowed ? 1 : 0)),
      resetTime,
      resetAt,
    };
  }

  /**
   * Checks rate limit and throws error if exceeded
   *
   * Convenience method that combines check() with automatic error throwing.
   *
   * @param key - Unique identifier for the rate limit
   * @param operation - Optional operation name for error message
   * @throws {RateLimitError} If rate limit is exceeded
   *
   * @example
   * ```typescript
   * // Will throw RateLimitError if limit exceeded
   * await limiter.checkLimit('user:123', 'create_session');
   * // Continue with operation...
   * ```
   */
  async checkLimit(key: string, operation?: string): Promise<void> {
    const status = await this.check(key);
    if (!status.allowed) {
      throw new RateLimitError(
        operation || key,
        this.config.maxRequests,
        this.config.windowMs
      );
    }
  }

  /**
   * Resets rate limit for a specific key
   *
   * Useful for testing or manual override scenarios.
   *
   * @param key - The key to reset
   *
   * @example
   * ```typescript
   * limiter.reset('user:123');
   * ```
   */
  reset(key: string): void {
    this.requests.delete(key);
  }

  /**
   * Resets all rate limits
   *
   * Clears all tracked requests. Use with caution.
   *
   * @example
   * ```typescript
   * limiter.resetAll();
   * ```
   */
  resetAll(): void {
    this.requests.clear();
  }

  /**
   * Gets current request count for a key
   *
   * @param key - The key to check
   * @returns Current number of requests in the window
   *
   * @example
   * ```typescript
   * const count = limiter.getCount('user:123');
   * console.log(`User has made ${count} requests`);
   * ```
   */
  getCount(key: string): number {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    const timestamps = this.requests.get(key) || [];
    return timestamps.filter(ts => ts > windowStart).length;
  }

  /**
   * Gets statistics about the rate limiter
   *
   * @returns Statistics object
   */
  getStats(): {
    totalKeys: number;
    totalRequests: number;
    config: Required<RateLimiterConfig>;
  } {
    let totalRequests = 0;
    for (const timestamps of this.requests.values()) {
      totalRequests += timestamps.length;
    }

    return {
      totalKeys: this.requests.size,
      totalRequests,
      config: { ...this.config },
    };
  }

  /**
   * Starts periodic cleanup of expired entries
   */
  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);

    // Don't keep Node.js process alive for cleanup
    if (this.cleanupTimer.unref) {
      this.cleanupTimer.unref();
    }
  }

  /**
   * Cleans up expired request entries
   *
   * Removes timestamps outside the current window to prevent memory growth.
   */
  private cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    for (const [key, timestamps] of this.requests.entries()) {
      // Filter out expired timestamps
      const validTimestamps = timestamps.filter(ts => ts > windowStart);

      if (validTimestamps.length === 0) {
        // No valid timestamps, remove key entirely
        this.requests.delete(key);
      } else if (validTimestamps.length < timestamps.length) {
        // Some timestamps expired, update with filtered list
        this.requests.set(key, validTimestamps);
      }
    }
  }

  /**
   * Stops the cleanup timer and clears resources
   *
   * Call this when shutting down to prevent memory leaks.
   *
   * @example
   * ```typescript
   * // On application shutdown
   * limiter.destroy();
   * ```
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
    this.requests.clear();
  }
}

/**
 * Global rate limiter instance for session operations
 *
 * Pre-configured with sensible defaults for session management.
 */
export const sessionRateLimiter = new RateLimiter({
  windowMs: 60000,      // 1 minute
  maxRequests: 100,     // 100 sessions per minute
});

/**
 * Global rate limiter instance for thought operations
 *
 * Pre-configured with higher limits for thought additions.
 */
export const thoughtRateLimiter = new RateLimiter({
  windowMs: 60000,      // 1 minute
  maxRequests: 1000,    // 1000 thoughts per minute
});
