/**
 * Session types for managing thinking sessions
 */

import { Thought, ThinkingMode } from "./core.js";
import type {
  AtomicStatement,
  CircularPath,
  ImplicitAssumption,
  Inconsistency,
  ProofGap,
} from "./modes/mathematics.js";

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

  /**
   * Run advisory proof analysis on thoughts that carry proof content.
   *
   * Defaults to `true`. It costs nothing for the 32 modes that cannot carry a
   * proof, and only a proof-bearing mathematics or formal-logic thought pays
   * for it. Set `false` to opt out entirely — see `src/proof/advisory.ts`.
   */
  enableProofAnalysis?: boolean;

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
export type ExportFormat =
  "markdown" | "latex" | "json" | "html" | "jupyter" | "mermaid";

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
 * Advisory validation attached to a stored thought and returned to the client.
 *
 * Advisory means exactly that: nothing in the request path gates on `isValid`.
 * A thought that fails validation is still created, stored and returned.
 *
 * `issues` and `suggestions` are bounded (see `src/validation/advisory.ts`) so
 * that a mode with many issue sites cannot dominate the response payload.
 */
export interface AdvisoryValidationResult extends ValidationResult {
  available: true;

  /** Issue count before truncation; `issues.length` is the bounded count. */
  totalIssues: number;

  /** True when `issues` holds fewer entries than `totalIssues`. */
  issuesTruncated: boolean;
}

/**
 * Returned when the validator itself failed. The request still succeeded —
 * a broken validator must never take down thought creation.
 */
export interface AdvisoryValidationUnavailable {
  available: false;

  /** Why validation could not be produced. */
  reason: string;
}

export type AdvisoryValidation =
  AdvisoryValidationResult | AdvisoryValidationUnavailable;

/**
 * Where the analysed proof content was found on the thought.
 */
export type ProofAnalysisSource =
  | "formallogic.proof.steps"
  | "theorem.proof"
  | "proofStrategy.steps"
  | "thought.content"
  | "caller.decomposition";

/** Per-list truncation flags for one proof analysis. */
export interface ProofAnalysisTruncation {
  /** Proof steps beyond the analysis budget were never fed to the decomposer. */
  input: boolean;
  atoms: boolean;
  gaps: boolean;
  implicitAssumptions: boolean;
  inconsistencies: boolean;
  cycles: boolean;
  suggestions: boolean;
  unjustifiedSteps: boolean;

  /** True when any other flag in this object is true. */
  any: boolean;
}

/** Pre-truncation counts, so a bounded list is never mistaken for a total. */
export interface ProofAnalysisTotals {
  steps: number;
  atoms: number;
  gaps: number;
  implicitAssumptions: number;
  inconsistencies: number;
  cycles: number;
  suggestions: number;
  unjustifiedSteps: number;
}

/**
 * Advisory proof analysis attached to a stored thought and returned to the
 * client.
 *
 * Advisory means exactly that: a gap, a circular chain, or an inconsistency is
 * feedback. Nothing in the request path gates on it, and a thought whose proof
 * is full of holes is still created, stored and returned.
 *
 * Every list is bounded (see `src/proof/advisory.ts`). `totals` carries the
 * pre-truncation counts and `truncated` says which lists were capped, so a
 * truncated result can never be read as a complete one.
 */
export interface ProofAnalysisResult {
  available: true;

  /** Where the proof content came from. */
  source: ProofAnalysisSource;

  /**
   * `caller-supplied` when the thought already carried a `decomposition`. That
   * decomposition is reused as-is and never overwritten; only the downstream
   * gap, circularity, and consistency analyses are added.
   */
  decompositionSource: "caller-supplied" | "derived";

  theorem?: string;

  /** Decomposition completeness, 0-1. */
  completeness: number;

  rigorLevel: "informal" | "textbook" | "rigorous" | "formal";

  maxDependencyDepth: number;

  /** Gap-analysis completeness, 0-1. Distinct from `completeness`. */
  gapCompleteness: number;

  /** Proof steps actually fed to the decomposer. */
  stepsAnalyzed: number;

  atoms: AtomicStatement[];
  gaps: ProofGap[];
  implicitAssumptions: ImplicitAssumption[];
  suggestions: string[];
  unjustifiedSteps: string[];

  hasCircularReasoning: boolean;
  circularSummary: string;
  cycles: CircularPath[];

  inconsistencies: Inconsistency[];

  totals: ProofAnalysisTotals;
  truncated: ProofAnalysisTruncation;
}

/**
 * Returned when a proof analyser itself failed. The request still succeeded —
 * a broken analyser must never take down thought creation.
 */
export interface ProofAnalysisUnavailable {
  available: false;

  /** Why the proof analysis could not be produced. */
  reason: string;
}

export type AdvisoryProofAnalysis =
  ProofAnalysisResult | ProofAnalysisUnavailable;

/**
 * Validation issue
 */
export interface ValidationIssue {
  severity: "error" | "warning" | "info";
  thoughtNumber: number;
  description: string;
  suggestion: string;
  category:
    | "logical"
    | "mathematical"
    | "physical"
    | "structural"
    | "completeness"
    | "interpretation";
}
