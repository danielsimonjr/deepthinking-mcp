/**
 * Sequential Reasoning Mode - Type Definitions
 * General-purpose iterative reasoning with revision and branching support
 */

import { BaseThought, ThinkingMode } from '../core.js';

export interface SequentialThought extends BaseThought {
  mode: ThinkingMode.SEQUENTIAL;

  // Revision tracking
  revisionReason?: string;
  isRevision?: boolean; // Whether this revises previous thinking

  // Dependency tracking
  buildUpon?: string[]; // Thought IDs this builds upon
  dependencies?: string[]; // Dependencies on other thoughts

  // Branching support
  branchFrom?: string; // Thought ID to branch from
  branchId?: string; // Branch identifier
  branchFromThought?: number; // Branching point thought number

  // Iteration control
  needsMoreThoughts?: boolean; // Whether more iteration is needed
}

export function isSequentialThought(thought: BaseThought): thought is SequentialThought {
  return thought.mode === 'sequential';
}
