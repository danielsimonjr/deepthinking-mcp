/**
 * Analytics Module Exports (v3.4.0)
 * Phase 4 Task 9.2: Real-time analytics dashboard
 *
 * STATUS: Type definitions exported, runtime implementation disabled
 * REASON: Analytics engine temporarily disabled due to type safety issues
 * ROADMAP: Planned for v3.5.0 after Sprint 3 refactoring completes
 *
 * Current capabilities:
 * - Type definitions available for integration
 * - Dashboard, time-series, quality metrics, and distribution types exported
 * - Implementation exists in ./engine.js, ./dashboard.js, ./time-series.js, etc.
 *
 * To re-enable:
 * 1. Fix type errors in analytics implementation files
 * 2. Add comprehensive test coverage (target: 80%)
 * 3. Uncomment exports below
 * 4. Update README.md to list as active feature
 */

// ===== Runtime Exports (Currently Disabled) =====
// TODO: Re-enable after type fixes and testing (Sprint 3 Task 3.7)
// export { AnalyticsEngine } from './engine.js';
// export { AnalyticsDashboard } from './dashboard.js';
// export { TimeSeriesAnalyzer } from './time-series.js';
// export { QualityMetrics } from './quality-metrics.js';
// export { DistributionAnalyzer } from './distribution.js';

// ===== Type Exports (Active) =====
export type {
  AnalyticsDashboard,
  OverviewStats,
  ModeDistribution,
  TaxonomyDistribution,
  TimeSeriesData,
  TimeSeriesPoint,
  ModeTimeSeriesPoint,
  SessionMetrics,
  UserActivity,
  Contributor,
  QualityMetrics,
  Distribution,
  DistributionBucket,
  ReasoningPattern,
  AnalyticsEvent,
  AnalyticsEventType,
  AnalyticsQuery,
} from './types.js';
