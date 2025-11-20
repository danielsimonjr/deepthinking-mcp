/**
 * Quota Manager (v3.4.0)
 * Phase 4 Task 9.5: User quota management
 */

import type {
  QuotaConfig,
  QuotaUsage,
  QuotaStatus,
  UserTier,
} from './types.js';
import { TIER_LIMITS } from './types.js';

/**
 * Quota manager for tracking user usage
 */
export class QuotaManager {
  private quotas: Map<string, QuotaConfig>;
  private usage: Map<string, QuotaUsage>;

  constructor() {
    this.quotas = new Map();
    this.usage = new Map();
  }

  /**
   * Set user quota (by tier or custom)
   */
  setQuota(userId: string, tierOrConfig: UserTier | QuotaConfig): void {
    const config = typeof tierOrConfig === 'string'
      ? TIER_LIMITS[tierOrConfig]
      : tierOrConfig;

    this.quotas.set(userId, config);

    // Initialize usage if not exists
    if (!this.usage.has(userId)) {
      this.usage.set(userId, {
        dailyRequests: 0,
        monthlyRequests: 0,
        dailyThoughts: 0,
        monthlyThoughts: 0,
        sessionCount: 0,
        storageUsage: 0,
        lastReset: {},
      });
    }
  }

  /**
   * Get user quota status
   */
  getQuotaStatus(userId: string): QuotaStatus {
    const config = this.quotas.get(userId) || TIER_LIMITS.free;
    const usage = this.usage.get(userId) || this.getDefaultUsage();

    // Check which limits are exceeded
    const exceededLimits: string[] = [];

    if (config.dailyRequests && usage.dailyRequests >= config.dailyRequests) {
      exceededLimits.push('dailyRequests');
    }
    if (config.monthlyRequests && usage.monthlyRequests >= config.monthlyRequests) {
      exceededLimits.push('monthlyRequests');
    }
    if (config.dailyThoughts && usage.dailyThoughts >= config.dailyThoughts) {
      exceededLimits.push('dailyThoughts');
    }
    if (config.monthlyThoughts && usage.monthlyThoughts >= config.monthlyThoughts) {
      exceededLimits.push('monthlyThoughts');
    }
    if (config.maxSessions && usage.sessionCount >= config.maxSessions) {
      exceededLimits.push('sessions');
    }
    if (config.maxStorage && usage.storageUsage >= config.maxStorage) {
      exceededLimits.push('storage');
    }

    // Calculate percentages
    const percentages: any = {};
    if (config.dailyRequests) {
      percentages.dailyRequests = (usage.dailyRequests / config.dailyRequests) * 100;
    }
    if (config.monthlyRequests) {
      percentages.monthlyRequests = (usage.monthlyRequests / config.monthlyRequests) * 100;
    }
    if (config.dailyThoughts) {
      percentages.dailyThoughts = (usage.dailyThoughts / config.dailyThoughts) * 100;
    }
    if (config.monthlyThoughts) {
      percentages.monthlyThoughts = (usage.monthlyThoughts / config.monthlyThoughts) * 100;
    }
    if (config.maxSessions) {
      percentages.sessions = (usage.sessionCount / config.maxSessions) * 100;
    }
    if (config.maxStorage) {
      percentages.storage = (usage.storageUsage / config.maxStorage) * 100;
    }

    return {
      userId,
      config,
      usage,
      exceeded: exceededLimits.length > 0,
      exceededLimits,
      percentages,
    };
  }

  /**
   * Check if user can perform action
   */
  canPerform(userId: string, action: 'request' | 'thought' | 'session' | 'storage', amount: number = 1): boolean {
    const status = this.getQuotaStatus(userId);

    switch (action) {
      case 'request':
        return !status.exceededLimits.includes('dailyRequests') &&
               !status.exceededLimits.includes('monthlyRequests');

      case 'thought':
        return !status.exceededLimits.includes('dailyThoughts') &&
               !status.exceededLimits.includes('monthlyThoughts');

      case 'session':
        return !status.exceededLimits.includes('sessions');

      case 'storage':
        if (!status.config.maxStorage) return true;
        return status.usage.storageUsage + amount <= status.config.maxStorage;

      default:
        return false;
    }
  }

  /**
   * Record usage
   */
  recordUsage(userId: string, type: 'request' | 'thought' | 'session' | 'storage', amount: number = 1): void {
    let usage = this.usage.get(userId);

    if (!usage) {
      usage = this.getDefaultUsage();
      this.usage.set(userId, usage);
    }

    // Check if reset needed
    this.checkAndResetUsage(userId, usage);

    // Record usage
    switch (type) {
      case 'request':
        usage.dailyRequests += amount;
        usage.monthlyRequests += amount;
        break;

      case 'thought':
        usage.dailyThoughts += amount;
        usage.monthlyThoughts += amount;
        break;

      case 'session':
        usage.sessionCount += amount;
        break;

      case 'storage':
        usage.storageUsage += amount;
        break;
    }
  }

  /**
   * Check and reset usage if needed
   */
  private checkAndResetUsage(userId: string, usage: QuotaUsage): void {
    const now = new Date();

    // Check daily reset
    if (usage.lastReset.daily) {
      const lastReset = new Date(usage.lastReset.daily);
      const daysSince = Math.floor((now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24));

      if (daysSince >= 1) {
        usage.dailyRequests = 0;
        usage.dailyThoughts = 0;
        usage.lastReset.daily = now;
      }
    } else {
      usage.lastReset.daily = now;
    }

    // Check monthly reset
    if (usage.lastReset.monthly) {
      const lastReset = new Date(usage.lastReset.monthly);
      const monthsSince = (now.getFullYear() - lastReset.getFullYear()) * 12 +
                         (now.getMonth() - lastReset.getMonth());

      if (monthsSince >= 1) {
        usage.monthlyRequests = 0;
        usage.monthlyThoughts = 0;
        usage.lastReset.monthly = now;
      }
    } else {
      usage.lastReset.monthly = now;
    }
  }

  /**
   * Get default usage
   */
  private getDefaultUsage(): QuotaUsage {
    return {
      dailyRequests: 0,
      monthlyRequests: 0,
      dailyThoughts: 0,
      monthlyThoughts: 0,
      sessionCount: 0,
      storageUsage: 0,
      lastReset: {
        daily: new Date(),
        monthly: new Date(),
      },
    };
  }

  /**
   * Reset user usage
   */
  resetUsage(userId: string, type?: 'daily' | 'monthly' | 'all'): void {
    const usage = this.usage.get(userId);
    if (!usage) return;

    const now = new Date();

    if (!type || type === 'all' || type === 'daily') {
      usage.dailyRequests = 0;
      usage.dailyThoughts = 0;
      usage.lastReset.daily = now;
    }

    if (!type || type === 'all' || type === 'monthly') {
      usage.monthlyRequests = 0;
      usage.monthlyThoughts = 0;
      usage.lastReset.monthly = now;
    }

    if (!type || type === 'all') {
      usage.sessionCount = 0;
      usage.storageUsage = 0;
    }
  }

  /**
   * Check feature access
   */
  hasFeatureAccess(userId: string, feature: keyof QuotaConfig['features']): boolean {
    const config = this.quotas.get(userId) || TIER_LIMITS.free;
    return config.features?.[feature] || false;
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      totalUsers: this.quotas.size,
      totalUsageTracked: this.usage.size,
    };
  }
}
