/**
 * Collaboration Module - Index
 * Phase 4C: Collaborative Sessions
 */

// Multi-agent collaboration
export {
  MultiAgentCollaboration,
  type CollaborativeAgent,
  type CollaborativeWorkspace,
  type AgentMessage,
  type AgentAssignment,
  type CoordinationRule,
  type AgentRole,
  type AgentStatus,
  type MessageType,
} from './multi-agent.js';

// Session sharing and merging
export {
  SessionSharingManager,
  type SharedSession,
  type SessionComment,
  type MergeStrategy,
  type MergeMetadata,
  type MergeConflict,
  type ConflictType,
} from './session-sharing.js';

// Collaborative annotations
export {
  AnnotationManager,
  type Annotation,
  type AnnotationType,
  type HighlightColor,
  type AnnotationVisibility,
  type TextRange,
  type AnnotationVote,
  type AnnotationFilter,
  type AnnotationThread,
  type AnnotationStats,
} from './annotations.js';

// Conflict resolution
export {
  ConflictResolutionManager,
  type ThoughtConflict,
  type ConflictResolution,
  type DivergentThought,
  type ResolutionVote,
  type ResolutionStrategy,
  type ResolutionStatus,
  type ConflictSeverity,
  type ConflictCategory,
  type ConsensusRequirement,
  type Evidence,
} from './conflict-resolution.js';
