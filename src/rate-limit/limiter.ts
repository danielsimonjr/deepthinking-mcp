/**
 * Rate Limiter (v3.4.0)
 * Phase 4 Task 9.5: Token bucket rate limiting
 */

import type { RateLimitConfig, RateLimitInfo } from './types.js';

/**
 * Rate limit entry
 */
interface RateLimitEntry {
  count: number;
  resetTime: Date;
}

/**
 * Rate limiter using sliding window algorithm
 */
export class RateLimiter {
  private limits: Map<string, RateLimitEntry>;
  private config: Required<RateLimitConfig>;

  constructor(config: RateLimitConfig) {
    this.limits = new Map();
    this.config = {
      maxRequests: config.maxRequests,
      windowMs: config.windowMs,
      skipSuccessful: config.skipSuccessful || false,
      skipFailed: config.skipFailed || false,
      keyGenerator: config.keyGenerator || ((id: string) => id),
      onLimitExceeded: config.onLimitExceeded || (() => {}),
    };

    // Periodic cleanup of expired entries
    setInterval(() => this.cleanup(), this.config.windowMs);
  }

  /**
   * Check if request is allowed
   */
  async check(identifier: string): Promise<{ allowed: boolean; info: RateLimitInfo }> {
    const key = this.config.keyGenerator(identifier);
    const now = new Date();

    let entry = this.limits.get(key);

    // Create new entry if doesn't exist or expired
    if (!entry || entry.resetTime < now) {
      entry = {
        count: 0,
        resetTime: new Date(now.getTime() + this.config.windowMs),
      };
      this.limits.set(key, entry);
    }

    const info: RateLimitInfo = {
      limit: this.config.maxRequests,
      current: entry.count,
      remaining: Math.max(0, this.config.maxRequests - entry.count),
      resetTime: entry.resetTime,
      retryAfter: Math.ceil((entry.resetTime.getTime() - now.getTime()) / 1000),
    };

    if (entry.count >= this.config.maxRequests) {
      // Limit exceeded
      if (this.config.onLimitExceeded) {
        this.config.onLimitExceeded(identifier, info);
      }

      return {
        allowed: false,
        info,
      };
    }

    // Increment count
    entry.count++;

    return {
      allowed: true,
      info: {
        ...info,
        current: entry.count,
        remaining: Math.max(0, this.config.maxRequests - entry.count),
      },
    };
  }

  /**
   * Record a request
   */
  async record(identifier: string, success: boolean = true): Promise<void> {
    if ((success && this.config.skipSuccessful) || (!success && this.config.skipFailed)) {
      return;
    }

    await this.check(identifier);
  }

  /**
   * Get current limit info
   */
  async getInfo(identifier: string): Promise<RateLimitInfo> {
    const key = this.config.keyGenerator(identifier);
    const now = new Date();
    const entry = this.limits.get(key);

    if (!entry || entry.resetTime < now) {
      return {
        limit: this.config.maxRequests,
        current: 0,
        remaining: this.config.maxRequests,
        resetTime: new Date(now.getTime() + this.config.windowMs),
        retryAfter: 0,
      };
    }

    return {
      limit: this.config.maxRequests,
      current: entry.count,
      remaining: Math.max(0, this.config.maxRequests - entry.count),
      resetTime: entry.resetTime,
      retryAfter: Math.ceil((entry.resetTime.getTime() - now.getTime()) / 1000),
    };
  }

  /**
   * Reset limit for identifier
   */
  async reset(identifier: string): Promise<void> {
    const key = this.config.keyGenerator(identifier);
    this.limits.delete(key);
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = new Date();
    for (const [key, entry] of this.limits) {
      if (entry.resetTime < now) {
        this.limits.delete(key);
      }
    }
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      totalKeys: this.limits.size,
      config: {
        maxRequests: this.config.maxRequests,
        windowMs: this.config.windowMs,
      },
    };
  }

  /**
   * Clear all limits
   */
  clear(): void {
    this.limits.clear();
  }
}
