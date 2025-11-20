/**
 * Template System Types (v3.4.0)
 * Phase 4 Task 9.3: Session templates system
 */

import type { ThinkingMode, SessionConfig } from '../types/index.js';

/**
 * Session template
 */
export interface SessionTemplate {
  /**
   * Unique template ID
   */
  id: string;

  /**
   * Template name
   */
  name: string;

  /**
   * Template description
   */
  description: string;

  /**
   * Template category
   */
  category: TemplateCategory;

  /**
   * Primary thinking mode
   */
  mode: ThinkingMode;

  /**
   * Template structure
   */
  structure: TemplateStructure;

  /**
   * Suggested domains
   */
  domains?: string[];

  /**
   * Example use cases
   */
  useCases?: string[];

  /**
   * Difficulty level
   */
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';

  /**
   * Estimated time to complete
   */
  estimatedTime?: string;

  /**
   * Tags
   */
  tags: string[];

  /**
   * Author
   */
  author?: string;

  /**
   * Created date
   */
  createdAt: Date;

  /**
   * Is built-in template
   */
  builtIn: boolean;
}

/**
 * Template category
 */
export type TemplateCategory =
  | 'problem-solving'
  | 'research'
  | 'design'
  | 'analysis'
  | 'planning'
  | 'learning'
  | 'creativity'
  | 'decision-making';

/**
 * Template structure
 */
export interface TemplateStructure {
  /**
   * Initial setup
   */
  setup: TemplateStep;

  /**
   * Main steps
   */
  steps: TemplateStep[];

  /**
   * Final wrap-up
   */
  conclusion: TemplateStep;

  /**
   * Optional configuration
   */
  config?: Partial<SessionConfig>;
}

/**
 * Template step
 */
export interface TemplateStep {
  /**
   * Step number
   */
  number: number;

  /**
   * Step title
   */
  title: string;

  /**
   * Step description
   */
  description: string;

  /**
   * Thinking mode for this step
   */
  mode?: ThinkingMode;

  /**
   * Suggested prompts
   */
  prompts: string[];

  /**
   * Expected outputs
   */
  expectedOutputs?: string[];

  /**
   * Validation criteria
   */
  validation?: string[];

  /**
   * Skip if optional
   */
  optional?: boolean;

  /**
   * Estimated thought count
   */
  estimatedThoughts?: number;
}

/**
 * Template usage statistics
 */
export interface TemplateStats {
  templateId: string;
  usageCount: number;
  averageCompletionRate: number;
  averageThoughts: number;
  averageConfidence: number;
  successRate: number;
  lastUsed?: Date;
}

/**
 * Template search query
 */
export interface TemplateQuery {
  /**
   * Search text
   */
  text?: string;

  /**
   * Filter by category
   */
  categories?: TemplateCategory[];

  /**
   * Filter by modes
   */
  modes?: ThinkingMode[];

  /**
   * Filter by difficulty
   */
  difficulties?: Array<'beginner' | 'intermediate' | 'advanced' | 'expert'>;

  /**
   * Filter by tags
   */
  tags?: string[];

  /**
   * Only built-in templates
   */
  builtInOnly?: boolean;

  /**
   * Sort by
   */
  sortBy?: 'name' | 'popularity' | 'recent' | 'difficulty';
}

/**
 * Template instantiation options
 */
export interface TemplateInstantiationOptions {
  /**
   * Template ID to instantiate
   */
  templateId: string;

  /**
   * Session title override
   */
  title?: string;

  /**
   * Domain override
   */
  domain?: string;

  /**
   * Author
   */
  author?: string;

  /**
   * Additional context
   */
  context?: Record<string, any>;

  /**
   * Skip optional steps
   */
  skipOptional?: boolean;
}
