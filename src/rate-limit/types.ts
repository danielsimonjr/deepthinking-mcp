/**
 * Rate Limiting Types (v3.4.0)
 * Phase 4 Task 9.5: API rate limiting and quota management
 */

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  /**
   * Maximum requests per window
   */
  maxRequests: number;

  /**
   * Time window in milliseconds
   */
  windowMs: number;

  /**
   * Skip successful requests
   */
  skipSuccessful?: boolean;

  /**
   * Skip failed requests
   */
  skipFailed?: boolean;

  /**
   * Custom key generator
   */
  keyGenerator?: (identifier: string) => string;

  /**
   * Handler for rate limit exceeded
   */
  onLimitExceeded?: (identifier: string, limit: RateLimitInfo) => void;
}

/**
 * Rate limit info
 */
export interface RateLimitInfo {
  /**
   * Maximum allowed requests
   */
  limit: number;

  /**
   * Current request count
   */
  current: number;

  /**
   * Remaining requests
   */
  remaining: number;

  /**
   * Reset time
   */
  resetTime: Date;

  /**
   * Retry after (seconds)
   */
  retryAfter: number;
}

/**
 * Quota configuration
 */
export interface QuotaConfig {
  /**
   * Daily request quota
   */
  dailyRequests?: number;

  /**
   * Monthly request quota
   */
  monthlyRequests?: number;

  /**
   * Daily thought quota
   */
  dailyThoughts?: number;

  /**
   * Monthly thought quota
   */
  monthlyThoughts?: number;

  /**
   * Maximum session count
   */
  maxSessions?: number;

  /**
   * Maximum storage (bytes)
   */
  maxStorage?: number;

  /**
   * Feature access
   */
  features?: QuotaFeatures;
}

/**
 * Quota features
 */
export interface QuotaFeatures {
  collaboration?: boolean;
  export?: boolean;
  templates?: boolean;
  analytics?: boolean;
  batch?: boolean;
  customModes?: boolean;
}

/**
 * Quota usage
 */
export interface QuotaUsage {
  /**
   * Current daily requests
   */
  dailyRequests: number;

  /**
   * Current monthly requests
   */
  monthlyRequests: number;

  /**
   * Current daily thoughts
   */
  dailyThoughts: number;

  /**
   * Current monthly thoughts
   */
  monthlyThoughts: number;

  /**
   * Current session count
   */
  sessionCount: number;

  /**
   * Current storage usage (bytes)
   */
  storageUsage: number;

  /**
   * Last reset timestamps
   */
  lastReset: {
    daily?: Date;
    monthly?: Date;
  };
}

/**
 * Quota status
 */
export interface QuotaStatus {
  /**
   * User identifier
   */
  userId: string;

  /**
   * Quota configuration
   */
  config: QuotaConfig;

  /**
   * Current usage
   */
  usage: QuotaUsage;

  /**
   * Is quota exceeded
   */
  exceeded: boolean;

  /**
   * Exceeded limits
   */
  exceededLimits: string[];

  /**
   * Percentage used
   */
  percentages: {
    dailyRequests?: number;
    monthlyRequests?: number;
    dailyThoughts?: number;
    monthlyThoughts?: number;
    sessions?: number;
    storage?: number;
  };
}

/**
 * User tier
 */
export type UserTier = 'free' | 'basic' | 'pro' | 'enterprise';

/**
 * Tier limits
 */
export const TIER_LIMITS: Record<UserTier, QuotaConfig> = {
  free: {
    dailyRequests: 100,
    monthlyRequests: 1000,
    dailyThoughts: 50,
    monthlyThoughts: 500,
    maxSessions: 10,
    maxStorage: 10 * 1024 * 1024, // 10 MB
    features: {
      collaboration: false,
      export: true,
      templates: true,
      analytics: false,
      batch: false,
      customModes: false,
    },
  },
  basic: {
    dailyRequests: 500,
    monthlyRequests: 10000,
    dailyThoughts: 200,
    monthlyThoughts: 2000,
    maxSessions: 50,
    maxStorage: 100 * 1024 * 1024, // 100 MB
    features: {
      collaboration: true,
      export: true,
      templates: true,
      analytics: true,
      batch: false,
      customModes: false,
    },
  },
  pro: {
    dailyRequests: 2000,
    monthlyRequests: 50000,
    dailyThoughts: 1000,
    monthlyThoughts: 10000,
    maxSessions: 200,
    maxStorage: 1024 * 1024 * 1024, // 1 GB
    features: {
      collaboration: true,
      export: true,
      templates: true,
      analytics: true,
      batch: true,
      customModes: true,
    },
  },
  enterprise: {
    dailyRequests: 10000,
    monthlyRequests: 500000,
    dailyThoughts: 10000,
    monthlyThoughts: 100000,
    maxSessions: 1000,
    maxStorage: 10 * 1024 * 1024 * 1024, // 10 GB
    features: {
      collaboration: true,
      export: true,
      templates: true,
      analytics: true,
      batch: true,
      customModes: true,
    },
  },
};
