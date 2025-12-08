/**
 * Analysis Mode - Type Definitions (Phase 13 v7.4.0)
 * Qualitative analysis including thematic analysis, grounded theory,
 * discourse analysis, content analysis, and phenomenological approaches
 * Designed for rigorous qualitative research methodology
 */

import { BaseThought, ThinkingMode } from '../core.js';

// ===== ANALYSIS THOUGHT TYPES =====

/**
 * Types of qualitative analysis reasoning steps
 */
export type AnalysisThoughtType =
  | 'data_familiarization'       // Initial engagement with data
  | 'initial_coding'             // Generate initial codes
  | 'focused_coding'             // Develop focused/selective codes
  | 'theme_development'          // Develop themes from codes
  | 'theme_refinement'           // Refine and review themes
  | 'theoretical_integration'    // Integrate into theoretical framework
  | 'memo_writing'               // Analytical memo documentation
  | 'saturation_assessment';     // Assess theoretical saturation

/**
 * Qualitative analysis methodology
 */
export type AnalysisMethodology =
  | 'thematic_analysis'          // Braun & Clarke
  | 'grounded_theory'            // Glaser & Strauss, Charmaz
  | 'discourse_analysis'         // Foucauldian, Critical
  | 'content_analysis'           // Qualitative content analysis
  | 'phenomenological'           // IPA, Descriptive
  | 'narrative_analysis'         // Narrative inquiry
  | 'framework_analysis'         // Ritchie & Spencer
  | 'template_analysis'          // King
  | 'mixed_qualitative';         // Combined approaches

// ===== DATA INTERFACES =====

/**
 * Data source for analysis
 */
export interface DataSource {
  id: string;
  type: 'interview' | 'focus_group' | 'observation' | 'document' | 'artifact' | 'field_notes' | 'survey_open_ended' | 'social_media' | 'other';
  description: string;
  participantId?: string;
  dateCollected?: Date;
  duration?: number;             // minutes
  wordCount?: number;
  context: string;
  quality: number;               // 0-1 data quality assessment
}

/**
 * Data segment/excerpt for coding
 */
export interface DataSegment {
  id: string;
  sourceId: string;
  text: string;
  startPosition?: number;
  endPosition?: number;
  context?: string;              // Surrounding context
  participantId?: string;
  codes: string[];               // Code IDs applied
  memos?: string[];              // Memo IDs attached
}

// ===== CODING INTERFACES =====

/**
 * Code type classification
 */
export type CodeType =
  | 'descriptive'                // Describes content
  | 'in_vivo'                    // Participant's own words
  | 'process'                    // Actions/processes
  | 'initial'                    // Open/initial coding
  | 'focused'                    // Selective/focused
  | 'axial'                      // Grounded theory axial
  | 'theoretical'                // Theoretical coding
  | 'emotion'                    // Emotional expressions
  | 'value'                      // Values/beliefs
  | 'versus'                     // Comparisons
  | 'evaluation';                // Evaluative statements

/**
 * Qualitative code
 */
export interface Code {
  id: string;
  label: string;
  definition: string;
  type: CodeType;
  examples: string[];            // Example quotes
  dataSegmentIds: string[];      // Segments coded with this
  frequency: number;             // How many times applied
  parentCodeId?: string;         // For hierarchical coding
  childCodeIds?: string[];
  relatedCodeIds?: string[];
  createdAt: Date;
  modifiedAt?: Date;
  memoIds?: string[];
}

/**
 * Code co-occurrence relationship
 */
export interface CodeCooccurrence {
  codeId1: string;
  codeId2: string;
  frequency: number;
  segmentIds: string[];          // Where they co-occur
  relationship?: string;         // Nature of relationship
}

/**
 * Codebook structure
 */
export interface Codebook {
  id: string;
  name: string;
  version: number;
  codes: Code[];
  codeHierarchy: {
    rootCodeIds: string[];
    parentChildMap: Record<string, string[]>;
  };
  cooccurrences: CodeCooccurrence[];
  intercoderReliability?: number; // 0-1 if multiple coders
  lastUpdated: Date;
}

// ===== THEME INTERFACES =====

/**
 * Theme level
 */
export type ThemeLevel = 'initial' | 'candidate' | 'refined' | 'final';

/**
 * Qualitative theme
 */
export interface QualitativeTheme {
  id: string;
  name: string;
  definition: string;
  level: ThemeLevel;
  codeIds: string[];             // Codes contributing to theme
  dataSegmentIds: string[];      // Supporting data
  subthemeIds?: string[];
  parentThemeId?: string;
  prevalence: number;            // 0-1 how prevalent in data
  richness: number;              // 0-1 depth of data
  keyQuotes: {
    quote: string;
    sourceId: string;
    significance: string;
  }[];
  narrative: string;             // Thematic narrative/description
  boundaryConditions?: string[]; // When theme applies/doesn't
  memoIds?: string[];
}

/**
 * Thematic map/structure
 */
export interface ThematicMap {
  id: string;
  name: string;
  themes: QualitativeTheme[];
  relationships: {
    themeId1: string;
    themeId2: string;
    type: 'hierarchical' | 'associative' | 'causal' | 'temporal' | 'contrast';
    description: string;
  }[];
  overarchingNarrative: string;
  diagramNotation?: string;      // Mermaid/visual representation
}

// ===== MEMO INTERFACES =====

/**
 * Memo type
 */
export type MemoType =
  | 'code_memo'                  // About specific code
  | 'theoretical_memo'           // Theoretical ideas
  | 'operational_memo'           // Methodological decisions
  | 'analytical_memo'            // Analytical insights
  | 'reflective_memo';           // Researcher reflexivity

/**
 * Analytical memo
 */
export interface AnalyticalMemo {
  id: string;
  type: MemoType;
  title: string;
  content: string;
  linkedCodes?: string[];
  linkedThemes?: string[];
  linkedSegments?: string[];
  date: Date;
  stage: AnalysisThoughtType;    // Analysis stage when written
  insights: string[];
  questions: string[];           // Questions raised
  nextSteps?: string[];
}

// ===== GROUNDED THEORY SPECIFIC =====

/**
 * Category for grounded theory
 */
export interface GTCategory {
  id: string;
  name: string;
  definition: string;
  properties: {
    name: string;
    dimensions: [string, string]; // Dimensional range
  }[];
  codes: string[];
  isCore: boolean;               // Core category?
  saturation: 'saturated' | 'developing' | 'sparse';
  relationships: {
    categoryId: string;
    type: 'causal' | 'contextual' | 'consequential' | 'strategy';
    description: string;
  }[];
}

/**
 * Theoretical sampling decision
 */
export interface TheoreticalSampling {
  id: string;
  currentGaps: string[];
  samplingDecision: string;
  rationale: string;
  categoryTargeted: string;
  dateDecided: Date;
  outcome?: string;
}

// ===== DISCOURSE ANALYSIS SPECIFIC =====

/**
 * Discourse pattern
 */
export interface DiscoursePattern {
  id: string;
  name: string;
  description: string;
  type: 'interpretive_repertoire' | 'subject_position' | 'ideological_dilemma' | 'rhetorical_device' | 'power_relation';
  examples: DataSegment[];
  function: string;              // What it accomplishes
  effects: string[];             // Social/political effects
}

// ===== QUALITY INDICATORS =====

/**
 * Qualitative rigor assessment
 */
export interface QualitativeRigor {
  credibility: {
    rating: number;              // 0-1
    strategies: string[];        // Member checking, triangulation, etc.
  };
  transferability: {
    rating: number;
    thickDescription: boolean;
    contextProvided: boolean;
  };
  dependability: {
    rating: number;
    auditTrail: boolean;
    codebookStability: number;
  };
  confirmability: {
    rating: number;
    reflexivity: boolean;
    peerDebriefing: boolean;
  };
  saturation: {
    achieved: boolean;
    evidence: string;
    newCodesLastN: number;       // New codes in last N segments
  };
}

// ===== MAIN THOUGHT INTERFACE =====

/**
 * Qualitative Analysis reasoning thought
 */
export interface AnalysisThought extends BaseThought {
  mode: ThinkingMode.ANALYSIS;
  thoughtType: AnalysisThoughtType;
  methodology: AnalysisMethodology;

  // Data
  dataSources: DataSource[];
  dataSegments?: DataSegment[];
  totalSegments?: number;

  // Coding
  codebook?: Codebook;
  currentCodes?: Code[];
  codingProgress?: {
    segmentsCoded: number;
    totalSegments: number;
    percentComplete: number;
  };

  // Themes
  themes?: QualitativeTheme[];
  thematicMap?: ThematicMap;

  // Memos
  memos?: AnalyticalMemo[];

  // Method-specific
  gtCategories?: GTCategory[];
  theoreticalSampling?: TheoreticalSampling[];
  discoursePatterns?: DiscoursePattern[];

  // Quality
  rigorAssessment?: QualitativeRigor;

  // Standard fields
  dependencies: string[];
  assumptions: string[];
  uncertainty: number;
  keyInsight?: string;
}

// ===== TYPE GUARD =====

/**
 * Type guard for AnalysisThought
 */
export function isAnalysisThought(thought: BaseThought): thought is AnalysisThought {
  return thought.mode === 'analysis';
}
