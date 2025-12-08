/**
 * Search Module Exports (v3.4.0)
 * Phase 4 Task 9.1: Session search & query system
 */

export { SearchEngine } from './engine.js';
export { SearchIndex } from './index.js';
export { Tokenizer, DEFAULT_TOKENIZER_OPTIONS } from './tokenizer.js';
export type { TokenizerOptions } from './tokenizer.js';

export type {
  SearchQuery,
  SearchField,
  SortOptions,
  SortField,
  PaginationOptions,
  SearchResult,
  SearchHighlight,
  SearchResults,
  SearchIndexEntry,
  SearchStats,
  AdvancedQuery,
  FacetedResults,
} from './types.js';
