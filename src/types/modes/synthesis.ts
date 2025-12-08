/**
 * Synthesis Mode - Type Definitions (Phase 13 v7.4.0)
 * Literature review, knowledge integration, and multi-source synthesis
 * Designed for academic research and comprehensive knowledge synthesis
 */

import { BaseThought, ThinkingMode } from '../core.js';

// ===== SYNTHESIS THOUGHT TYPES =====

/**
 * Types of synthesis reasoning steps
 */
export type SynthesisThoughtType =
  | 'source_identification'     // Identify relevant sources
  | 'source_evaluation'         // Evaluate source quality and relevance
  | 'theme_extraction'          // Extract key themes across sources
  | 'pattern_integration'       // Integrate patterns across sources
  | 'gap_identification'        // Identify gaps in existing knowledge
  | 'synthesis_construction'    // Construct synthesized understanding
  | 'framework_development';    // Develop conceptual framework

// ===== SOURCE INTERFACES =====

/**
 * Type of academic source
 */
export type SourceType =
  | 'journal_article'
  | 'conference_paper'
  | 'book'
  | 'book_chapter'
  | 'thesis'
  | 'preprint'
  | 'technical_report'
  | 'review_article'
  | 'meta_analysis'
  | 'grey_literature'
  | 'dataset'
  | 'other';

/**
 * Quality assessment criteria for sources
 */
export interface SourceQuality {
  peerReviewed: boolean;
  impactFactor?: number;
  citationCount?: number;
  methodologicalRigor: number;      // 0-1
  relevance: number;                 // 0-1
  recency: number;                   // 0-1 (based on publication date)
  authorCredibility: number;         // 0-1
  overallQuality: number;            // 0-1 weighted average
}

/**
 * Academic source reference
 */
export interface Source {
  id: string;
  type: SourceType;
  title: string;
  authors: string[];
  year: number;
  venue?: string;                    // Journal, conference, publisher
  doi?: string;
  url?: string;
  abstract?: string;
  keywords?: string[];
  quality: SourceQuality;
  notes?: string;
}

// ===== THEME AND CONCEPT INTERFACES =====

/**
 * Key concept extracted from sources
 */
export interface Concept {
  id: string;
  term: string;
  definition: string;
  sourceIds: string[];               // Which sources define/use this
  frequency: number;                 // How often mentioned
  importance: number;                // 0-1 centrality to the topic
  relatedConcepts?: string[];        // IDs of related concepts
  variations?: string[];             // Alternative terms/synonyms
}

/**
 * Theme identified across multiple sources
 */
export interface Theme {
  id: string;
  name: string;
  description: string;
  sourceIds: string[];               // Sources contributing to this theme
  concepts: string[];                // Concept IDs within this theme
  strength: number;                  // 0-1 how well-supported
  consensus: 'strong' | 'moderate' | 'weak' | 'contested';
  evolution?: string;                // How theme developed over time
  subthemes?: Theme[];               // Nested themes
}

/**
 * Finding from literature
 */
export interface Finding {
  id: string;
  statement: string;
  sourceIds: string[];
  evidenceStrength: 'strong' | 'moderate' | 'weak' | 'conflicting';
  methodology?: string;              // How finding was derived
  limitations?: string[];
  implications?: string[];
  replicationStatus?: 'replicated' | 'partial' | 'not_replicated' | 'unknown';
}

// ===== PATTERN AND RELATIONSHIP INTERFACES =====

/**
 * Pattern observed across sources
 */
export interface Pattern {
  id: string;
  name: string;
  description: string;
  type: 'trend' | 'correlation' | 'causal' | 'methodological' | 'theoretical';
  sourceIds: string[];
  confidence: number;                // 0-1
  exceptions?: string[];             // Cases where pattern doesn't hold
  conditions?: string[];             // Conditions under which pattern holds
}

/**
 * Relationship between concepts or themes
 */
export interface ConceptRelation {
  id: string;
  fromId: string;                    // Concept or Theme ID
  toId: string;                      // Concept or Theme ID
  type: 'causes' | 'correlates' | 'contradicts' | 'supports' | 'extends' | 'refines' | 'subsumes';
  strength: number;                  // 0-1
  evidence: string[];                // Source IDs supporting this relation
  description?: string;
}

// ===== GAP AND CONTRADICTION INTERFACES =====

/**
 * Gap in existing literature
 */
export interface LiteratureGap {
  id: string;
  description: string;
  type: 'empirical' | 'theoretical' | 'methodological' | 'population' | 'contextual';
  importance: 'critical' | 'significant' | 'moderate' | 'minor';
  relatedThemes: string[];           // Theme IDs
  suggestedResearch?: string[];      // Potential research directions
  barriers?: string[];               // Why gap exists
}

/**
 * Contradiction or debate in literature
 */
export interface Contradiction {
  id: string;
  description: string;
  position1: {
    statement: string;
    sourceIds: string[];
    reasoning: string;
  };
  position2: {
    statement: string;
    sourceIds: string[];
    reasoning: string;
  };
  possibleResolution?: string;
  methodologicalDifferences?: string[];
  contextualDifferences?: string[];
}

// ===== SYNTHESIS OUTPUT INTERFACES =====

/**
 * Conceptual framework developed from synthesis
 */
export interface ConceptualFramework {
  id: string;
  name: string;
  description: string;
  coreConstructs: Concept[];
  relationships: ConceptRelation[];
  assumptions: string[];
  scope: string;
  limitations: string[];
  applicability: string[];           // Contexts where framework applies
  diagram?: string;                  // Mermaid or other diagram format
}

/**
 * Synthesized conclusion
 */
export interface SynthesisConclusion {
  statement: string;
  confidence: number;                // 0-1
  supportingSources: string[];
  qualifications?: string[];         // Conditions/limitations
  implications: string[];
  futureDirections?: string[];
}

/**
 * Literature review metadata
 */
export interface ReviewMetadata {
  searchStrategy: string[];          // Databases, keywords, filters
  inclusionCriteria: string[];
  exclusionCriteria: string[];
  dateRange?: { from: number; to: number };
  totalSourcesFound?: number;
  sourcesIncluded: number;
  sourcesExcluded?: number;
  lastUpdated: Date;
}

// ===== MAIN THOUGHT INTERFACE =====

/**
 * Synthesis reasoning thought
 */
export interface SynthesisThought extends BaseThought {
  mode: ThinkingMode.SYNTHESIS;
  thoughtType: SynthesisThoughtType;

  // Sources and review metadata
  sources: Source[];
  reviewMetadata?: ReviewMetadata;

  // Extracted knowledge structures
  concepts?: Concept[];
  themes?: Theme[];
  findings?: Finding[];
  patterns?: Pattern[];
  relations?: ConceptRelation[];

  // Gaps and contradictions
  gaps?: LiteratureGap[];
  contradictions?: Contradiction[];

  // Synthesis outputs
  framework?: ConceptualFramework;
  conclusions?: SynthesisConclusion[];

  // Standard fields
  dependencies: string[];
  assumptions: string[];
  uncertainty: number;
  keyInsight?: string;
}

// ===== TYPE GUARD =====

/**
 * Type guard for SynthesisThought
 */
export function isSynthesisThought(thought: BaseThought): thought is SynthesisThought {
  return thought.mode === 'synthesis';
}
