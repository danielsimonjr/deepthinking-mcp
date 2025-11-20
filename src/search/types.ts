/**
 * Search and Query Types (v3.4.0)
 * Phase 4 Task 9.1: Session search & query system types
 */

import type { ThinkingSession, ThinkingMode } from '../types/index.js';

/**
 * Search query parameters
 */
export interface SearchQuery {
  /**
   * Full-text search query
   */
  text?: string;

  /**
   * Filter by thinking modes
   */
  modes?: ThinkingMode[];

  /**
   * Filter by taxonomy categories
   */
  taxonomyCategories?: string[];

  /**
   * Filter by taxonomy types (specific reasoning types)
   */
  taxonomyTypes?: string[];

  /**
   * Filter by author
   */
  author?: string;

  /**
   * Filter by domain
   */
  domain?: string;

  /**
   * Filter by tags
   */
  tags?: string[];

  /**
   * Date range filter
   */
  dateRange?: {
    from?: Date;
    to?: Date;
  };

  /**
   * Thought count range
   */
  thoughtCountRange?: {
    min?: number;
    max?: number;
  };

  /**
   * Filter by completion status
   */
  completed?: boolean;

  /**
   * Minimum confidence score
   */
  minConfidence?: number;

  /**
   * Search in specific fields
   */
  fields?: SearchField[];

  /**
   * Sort options
   */
  sort?: SortOptions;

  /**
   * Pagination
   */
  pagination?: PaginationOptions;
}

/**
 * Fields to search in
 */
export type SearchField =
  | 'title'
  | 'thoughts'
  | 'metadata'
  | 'author'
  | 'domain'
  | 'all';

/**
 * Sort options
 */
export interface SortOptions {
  field: SortField;
  order: 'asc' | 'desc';
}

/**
 * Sort field
 */
export type SortField =
  | 'createdAt'
  | 'updatedAt'
  | 'thoughtCount'
  | 'confidence'
  | 'relevance'
  | 'title';

/**
 * Pagination options
 */
export interface PaginationOptions {
  page: number;
  pageSize: number;
}

/**
 * Search result
 */
export interface SearchResult {
  session: ThinkingSession;
  score: number;
  highlights: SearchHighlight[];
  matchedFields: string[];
}

/**
 * Search highlight
 */
export interface SearchHighlight {
  field: string;
  text: string;
  matchedText: string;
  startIndex: number;
  endIndex: number;
}

/**
 * Paginated search results
 */
export interface SearchResults {
  results: SearchResult[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  query: SearchQuery;
  executionTime: number; // in milliseconds
}

/**
 * Search index entry
 */
export interface SearchIndexEntry {
  sessionId: string;
  title: string;
  mode: ThinkingMode;
  author?: string;
  domain?: string;
  tags: string[];
  thoughtCount: number;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Taxonomy data
  taxonomyCategories: Set<string>;
  taxonomyTypes: Set<string>;

  // Full-text search data
  tokens: Map<string, number>; // token -> frequency
  thoughtTexts: string[];

  // Metrics
  confidence?: number;
}

/**
 * Search statistics
 */
export interface SearchStats {
  totalSessions: number;
  indexedSessions: number;
  totalTokens: number;
  averageTokensPerSession: number;
  indexSize: number; // in bytes
  lastIndexed: Date;
  indexHealth: 'healthy' | 'stale' | 'empty';
}

/**
 * Advanced query operators
 */
export interface AdvancedQuery {
  /**
   * Boolean operator
   */
  operator: 'AND' | 'OR' | 'NOT';

  /**
   * Sub-queries
   */
  queries: (SearchQuery | AdvancedQuery)[];
}

/**
 * Faceted search results
 */
export interface FacetedResults extends SearchResults {
  facets: {
    modes: Map<ThinkingMode, number>;
    taxonomyCategories: Map<string, number>;
    authors: Map<string, number>;
    domains: Map<string, number>;
    tags: Map<string, number>;
  };
}
