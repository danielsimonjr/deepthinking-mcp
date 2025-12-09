/**
 * Session types for managing thinking sessions
 */

import { Thought, ThinkingMode } from './core.js';

/**
 * Thinking session
 */
export interface ThinkingSession {
  // Identification
  id: string;
  title: string;
  
  // Configuration
  mode: ThinkingMode;
  domain?: string;
  config: SessionConfig;
  
  // Content
  thoughts: Thought[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  author?: string;
  
  // State
  currentThoughtNumber: number;
  isComplete: boolean;
  
  // Analytics
  metrics: SessionMetrics;
  
  // Optional features
  collaborators?: string[];
  tags?: string[];
  attachments?: Attachment[];
}

/**
 * Session configuration
 */
export interface SessionConfig {
  // Mode-specific settings
  modeConfig: ModeConfig;
  
  // Feature flags
  enableAutoSave: boolean;
  enableValidation: boolean;
  enableVisualization: boolean;
  
  // Integration settings
  integrations: {
    mathMcp?: { url: string; enabled: boolean };
    wolfram?: { appId: string; enabled: boolean };
    arxiv?: { enabled: boolean };
  };
  
  // Export preferences
  exportFormats: ExportFormat[];
  autoExportOnComplete: boolean;
  
  // Performance settings
  maxThoughtsInMemory: number;
  compressionThreshold: number;
}

/**
 * Mode-specific configuration
 */
export interface ModeConfig {
  mode: ThinkingMode;
  strictValidation?: boolean;
  allowModeSwitch?: boolean;
  customSettings?: Record<string, unknown>;
}

/**
 * Session metrics
 */
export interface SessionMetrics {
  totalThoughts: number;
  thoughtsByType: Record<string, number>;
  averageUncertainty: number;
  revisionCount: number;
  timeSpent: number;
  dependencyDepth: number;
  customMetrics: Map<string, unknown>;

  // Validation cache statistics
  cacheStats?: {
    hits: number;
    misses: number;
    hitRate: number;
    size: number;
    maxSize: number;
  };

  // Running totals for incremental calculation (internal use)
  // These fields are internal implementation details for O(1) average calculation
  _uncertaintySum?: number;
  _uncertaintyCount?: number;
}

/**
 * Session metadata for listings
 */
export interface SessionMetadata {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  thoughtCount: number;
  mode: ThinkingMode;
  isComplete: boolean;
}

/**
 * Export formats
 */
export type ExportFormat = 'markdown' | 'latex' | 'json' | 'html' | 'jupyter' | 'mermaid';

/**
 * Attachment
 */
export interface Attachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  url?: string;
  data?: Buffer;
}

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  confidence: number;
  
  issues: ValidationIssue[];
  
  strengthMetrics: {
    logicalSoundness: number;
    empiricalSupport: number;
    mathematicalRigor: number;
    physicalConsistency?: number;
  };
  
  tensorValidation?: {
    rankCorrect: boolean;
    symmetriesVerified: boolean;
    invariantsChecked: boolean;
    dimensionsConsistent: boolean;
  };
  
  suggestions?: string[];
}

/**
 * Validation issue
 */
export interface ValidationIssue {
  severity: 'error' | 'warning' | 'info';
  thoughtNumber: number;
  description: string;
  suggestion: string;
  category: 'logical' | 'mathematical' | 'physical' | 'structural' | 'completeness' | 'interpretation';
}
