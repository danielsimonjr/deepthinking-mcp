/**
 * Handler Input/Output Types - Phase 15 Type Safety Initiative
 *
 * Provides strongly-typed interfaces for all MCP handler functions,
 * eliminating the use of `any` in the API layer.
 */

import { ThinkingMode } from './core.js';
import type { SessionActionInput } from '../tools/schemas/base.js';
import type { AnalyzeInput } from '../tools/schemas/analyze.js';

// ============================================================================
// MCP Response Types
// ============================================================================

/**
 * Standard MCP content block
 */
export interface MCPTextContent {
  type: 'text';
  text: string;
}

/**
 * Standard MCP response structure - extensible for SDK compatibility
 */
export interface MCPResponse {
  content: MCPTextContent[];
  [key: string]: unknown;
}

// ============================================================================
// Handler Input Types (refined from Zod schemas)
// ============================================================================

/**
 * Input for handleAddThought - extends base thought with mode
 * Uses string for mode to be compatible with Zod schema output
 */
export interface AddThoughtInput {
  sessionId?: string;
  thought: string;
  thoughtNumber: number;
  totalThoughts: number;
  nextThoughtNeeded: boolean;
  mode?: string; // Compatible with ThinkingMode enum values
  isRevision?: boolean;
  revisesThought?: string;
  revisionReason?: string;
  branchFrom?: string;
  branchId?: string;
  uncertainty?: number;
  dependencies?: string[];
  assumptions?: string[];
  // Allow additional mode-specific properties
  [key: string]: unknown;
}

/**
 * Input for handleSummarize
 */
export interface SummarizeInput {
  sessionId: string;
  action: 'summarize';
}

/**
 * Input for handleExport
 */
export interface ExportInput {
  sessionId: string;
  action: 'export';
  exportFormat?: 'markdown' | 'latex' | 'json' | 'html' | 'jupyter' | 'mermaid' | 'dot' | 'ascii';
  exportProfile?: 'academic' | 'presentation' | 'documentation' | 'archive' | 'minimal';
}

/**
 * Input for handleExportAll
 */
export interface ExportAllInput {
  sessionId: string;
  action: 'export_all';
  exportProfile?: 'academic' | 'presentation' | 'documentation' | 'archive' | 'minimal';
  includeContent?: boolean;
}

/**
 * Input for handleSwitchMode
 */
export interface SwitchModeInput {
  sessionId: string;
  action: 'switch_mode';
  newMode: string;
}

/**
 * Input for handleGetSession
 */
export interface GetSessionInput {
  sessionId: string;
  action: 'get_session';
}

/**
 * Input for handleRecommendMode
 */
export interface RecommendModeInput {
  action: 'recommend_mode';
  problemType?: string;
  problemCharacteristics?: {
    domain: string;
    complexity: 'low' | 'medium' | 'high';
    uncertainty: 'low' | 'medium' | 'high';
    timeDependent: boolean;
    multiAgent: boolean;
    requiresProof: boolean;
    requiresQuantification: boolean;
    hasIncompleteInfo: boolean;
    requiresExplanation: boolean;
    hasAlternatives: boolean;
  };
  includeCombinations?: boolean;
}

/**
 * Input for handleDeleteSession
 */
export interface DeleteSessionInput {
  sessionId: string;
  action: 'delete_session';
}

// ============================================================================
// Handler Response Types
// ============================================================================

/**
 * Mode status included in thought responses
 */
export interface ModeStatus {
  mode: ThinkingMode;
  isFullyImplemented: boolean;
  hasSpecializedHandler: boolean;
  note?: string;
}

/**
 * Response from handleAddThought
 */
export interface AddThoughtResponse {
  sessionId: string;
  thoughtId: string;
  thoughtNumber: number;
  mode: ThinkingMode;
  nextThoughtNeeded: boolean;
  sessionComplete: boolean;
  totalThoughts: number;
  modeStatus: ModeStatus;
  decomposition?: unknown;
  consistencyReport?: unknown;
  gapAnalysis?: unknown;
}

/**
 * Response from handleAnalyze
 */
export interface AnalyzeResponse {
  success: boolean;
  sessionId: string;
  analysisId: string;
  modesUsed: number;
  contributingModes: string[];
  synthesizedConclusion: string;
  confidenceScore: number;
  primaryInsights: Array<{
    id: string;
    content: string;
    sourceMode: string;
    confidence: number;
    category?: string;
    priority?: number;
  }>;
  conflictsDetected: number;
  conflictsResolved: number;
  mergeStrategy: string;
  executionTime: number;
  errors?: unknown[];
  statistics: {
    totalInsightsBefore: number;
    totalInsightsAfter: number;
    duplicatesRemoved: number;
    averageConfidence: number;
    mergeTime: number;
  };
  exportable: boolean;
  exportHint: string;
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard for AddThoughtInput
 */
export function isAddThoughtInput(input: unknown): input is AddThoughtInput {
  if (typeof input !== 'object' || input === null) return false;
  const obj = input as Record<string, unknown>;
  return (
    typeof obj.thought === 'string' &&
    typeof obj.thoughtNumber === 'number' &&
    typeof obj.totalThoughts === 'number' &&
    typeof obj.nextThoughtNeeded === 'boolean'
  );
}

/**
 * Type guard for session action inputs
 */
export function isSessionActionInput(input: unknown): input is SessionActionInput {
  if (typeof input !== 'object' || input === null) return false;
  const obj = input as Record<string, unknown>;
  return typeof obj.action === 'string';
}

/**
 * Type guard for analyze inputs
 */
export function isAnalyzeInput(input: unknown): input is AnalyzeInput {
  if (typeof input !== 'object' || input === null) return false;
  const obj = input as Record<string, unknown>;
  return typeof obj.thought === 'string';
}

// ============================================================================
// Re-exports for convenience
// ============================================================================

export type { SessionActionInput } from '../tools/schemas/base.js';
export type { AnalyzeInput } from '../tools/schemas/analyze.js';
