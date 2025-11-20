/**
 * Analytics Types (v3.4.0)
 * Phase 4 Task 9.2: Real-time analytics dashboard types
 */

import type { ThinkingMode } from '../types/index.js';

/**
 * Analytics dashboard data
 */
export interface AnalyticsDashboard {
  /**
   * Overall statistics
   */
  overview: OverviewStats;

  /**
   * Mode distribution
   */
  modeDistribution: ModeDistribution;

  /**
   * Taxonomy distribution
   */
  taxonomyDistribution: TaxonomyDistribution;

  /**
   * Time series data
   */
  timeSeries: TimeSeriesData;

  /**
   * Session metrics
   */
  sessionMetrics: SessionMetrics;

  /**
   * User activity
   */
  userActivity?: UserActivity;

  /**
   * Quality metrics
   */
  qualityMetrics: QualityMetrics;

  /**
   * Last updated timestamp
   */
  lastUpdated: Date;
}

/**
 * Overview statistics
 */
export interface OverviewStats {
  totalSessions: number;
  totalThoughts: number;
  activeUsers: number;
  averageThoughtsPerSession: number;
  averageSessionDuration: number; // in minutes
  completionRate: number; // percentage
  todaySessions: number;
  weekSessions: number;
  monthSessions: number;
}

/**
 * Mode distribution
 */
export interface ModeDistribution {
  /**
   * Count by mode
   */
  counts: Map<ThinkingMode, number>;

  /**
   * Percentage by mode
   */
  percentages: Map<ThinkingMode, number>;

  /**
   * Average thoughts per mode
   */
  averageThoughts: Map<ThinkingMode, number>;

  /**
   * Average confidence per mode
   */
  averageConfidence: Map<ThinkingMode, number>;

  /**
   * Most popular mode
   */
  mostPopular: ThinkingMode;

  /**
   * Trending modes (increasing usage)
   */
  trending: ThinkingMode[];
}

/**
 * Taxonomy distribution
 */
export interface TaxonomyDistribution {
  /**
   * Distribution by category
   */
  categories: Map<string, number>;

  /**
   * Distribution by type (top 20)
   */
  types: Map<string, number>;

  /**
   * Most common reasoning patterns
   */
  topPatterns: ReasoningPattern[];

  /**
   * Cognitive load distribution
   */
  cognitiveLoad: Map<string, number>;

  /**
   * Dual-process distribution
   */
  dualProcess: Map<string, number>;
}

/**
 * Reasoning pattern
 */
export interface ReasoningPattern {
  id: string;
  name: string;
  category: string;
  frequency: number;
  avgQuality: number;
}

/**
 * Time series data
 */
export interface TimeSeriesData {
  /**
   * Sessions over time
   */
  sessionsOverTime: TimeSeriesPoint[];

  /**
   * Thoughts over time
   */
  thoughtsOverTime: TimeSeriesPoint[];

  /**
   * Modes over time
   */
  modesOverTime: ModeTimeSeriesPoint[];

  /**
   * Quality over time
   */
  qualityOverTime: TimeSeriesPoint[];

  /**
   * Time granularity
   */
  granularity: 'hour' | 'day' | 'week' | 'month';
}

/**
 * Time series point
 */
export interface TimeSeriesPoint {
  timestamp: Date;
  value: number;
}

/**
 * Mode time series point
 */
export interface ModeTimeSeriesPoint {
  timestamp: Date;
  mode: ThinkingMode;
  count: number;
}

/**
 * Session metrics
 */
export interface SessionMetrics {
  /**
   * Average session length (thoughts)
   */
  averageLength: number;

  /**
   * Session length distribution
   */
  lengthDistribution: Distribution;

  /**
   * Completion rate by mode
   */
  completionByMode: Map<ThinkingMode, number>;

  /**
   * Session duration distribution
   */
  durationDistribution: Distribution;

  /**
   * Most productive time of day
   */
  productiveHours: number[];
}

/**
 * Distribution data
 */
export interface Distribution {
  buckets: DistributionBucket[];
  mean: number;
  median: number;
  stddev: number;
  min: number;
  max: number;
}

/**
 * Distribution bucket
 */
export interface DistributionBucket {
  range: string;
  count: number;
  percentage: number;
}

/**
 * User activity
 */
export interface UserActivity {
  /**
   * Active users today
   */
  activeToday: number;

  /**
   * Active users this week
   */
  activeThisWeek: number;

  /**
   * Active users this month
   */
  activeThisMonth: number;

  /**
   * New users this week
   */
  newUsersThisWeek: number;

  /**
   * Top contributors
   */
  topContributors: Contributor[];

  /**
   * User retention rate
   */
  retentionRate: number;
}

/**
 * Contributor data
 */
export interface Contributor {
  userId: string;
  name?: string;
  sessionCount: number;
  thoughtCount: number;
  averageQuality: number;
}

/**
 * Quality metrics
 */
export interface QualityMetrics {
  /**
   * Average confidence score
   */
  averageConfidence: number;

  /**
   * Average quality by metric
   */
  averageQualityMetrics: {
    rigor: number;
    clarity: number;
    novelty: number;
    practicality: number;
  };

  /**
   * High quality sessions (>0.8 confidence)
   */
  highQualitySessions: number;

  /**
   * Low quality sessions (<0.4 confidence)
   */
  lowQualitySessions: number;

  /**
   * Quality trend
   */
  qualityTrend: 'improving' | 'stable' | 'declining';
}

/**
 * Real-time analytics event
 */
export interface AnalyticsEvent {
  type: AnalyticsEventType;
  timestamp: Date;
  sessionId?: string;
  userId?: string;
  data: any;
}

/**
 * Analytics event type
 */
export type AnalyticsEventType =
  | 'session_created'
  | 'session_updated'
  | 'session_completed'
  | 'thought_added'
  | 'mode_switched'
  | 'user_joined'
  | 'user_active';

/**
 * Analytics query options
 */
export interface AnalyticsQuery {
  /**
   * Date range
   */
  dateRange?: {
    from: Date;
    to: Date;
  };

  /**
   * Filter by modes
   */
  modes?: ThinkingMode[];

  /**
   * Filter by users
   */
  users?: string[];

  /**
   * Time granularity for series
   */
  granularity?: 'hour' | 'day' | 'week' | 'month';

  /**
   * Include user activity data
   */
  includeUserActivity?: boolean;
}
