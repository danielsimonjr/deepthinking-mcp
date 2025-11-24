/**
 * Search Engine (v3.4.0)
 * Phase 4 Task 9.1: Main search engine with query execution
 */

import type { ThinkingSession } from '../types/index.js';
import type {
  SearchQuery,
  SearchResults,
  SearchResult,
  SearchHighlight,
  FacetedResults,
  SortField,
} from './types.js';
import { SearchIndex } from './index.js';
import { Tokenizer } from './tokenizer.js';

/**
 * Search engine for session querying
 */
export class SearchEngine {
  private index: SearchIndex;
  private sessions: Map<string, ThinkingSession>;
  private tokenizer: Tokenizer;

  constructor() {
    this.index = new SearchIndex();
    this.sessions = new Map();
    this.tokenizer = new Tokenizer();
  }

  /**
   * Index a session
   */
  indexSession(session: ThinkingSession): void {
    this.index.indexSession(session);
    this.sessions.set(session.id, session);
  }

  /**
   * Remove a session
   */
  removeSession(sessionId: string): void {
    this.index.removeSession(sessionId);
    this.sessions.delete(sessionId);
  }

  /**
   * Update a session (re-index)
   */
  updateSession(session: ThinkingSession): void {
    this.indexSession(session);
  }

  /**
   * Execute a search query
   */
  search(query: SearchQuery & { query?: string; mode?: string }): SearchResults {
    const startTime = Date.now();

    // Handle aliases: query -> text, mode -> modes
    const normalizedQuery: SearchQuery = {
      ...query,
      text: (query as any).query || query.text,
      modes: (query as any).mode ? [(query as any).mode] : query.modes,
    };

    // Start with all sessions
    let resultIds = new Set<string>(this.sessions.keys());

    // Apply filters
    if (normalizedQuery.text && normalizedQuery.text.trim() !== '') {
      const textScores = this.index.searchByText(normalizedQuery.text);
      resultIds = new Set(Array.from(resultIds).filter(id => textScores.has(id)));
    }

    if (normalizedQuery.modes && normalizedQuery.modes.length > 0) {
      const modeResults = this.index.filterByModes(normalizedQuery.modes);
      resultIds = this.intersect(resultIds, modeResults);
    }

    if (normalizedQuery.taxonomyCategories && normalizedQuery.taxonomyCategories.length > 0) {
      const categoryResults = this.index.filterByTaxonomyCategories(normalizedQuery.taxonomyCategories);
      resultIds = this.intersect(resultIds, categoryResults);
    }

    if (normalizedQuery.taxonomyTypes && normalizedQuery.taxonomyTypes.length > 0) {
      const typeResults = this.index.filterByTaxonomyTypes(normalizedQuery.taxonomyTypes);
      resultIds = this.intersect(resultIds, typeResults);
    }

    if (normalizedQuery.author) {
      const authorResults = this.index.filterByAuthor(normalizedQuery.author);
      resultIds = this.intersect(resultIds, authorResults);
    }

    if (normalizedQuery.domain) {
      const domainResults = this.index.filterByDomain(normalizedQuery.domain);
      resultIds = this.intersect(resultIds, domainResults);
    }

    if (normalizedQuery.tags && normalizedQuery.tags.length > 0) {
      const tagResults = this.index.filterByTags(normalizedQuery.tags);
      resultIds = this.intersect(resultIds, tagResults);
    }

    if (normalizedQuery.dateRange) {
      const dateResults = this.index.filterByDateRange(normalizedQuery.dateRange.from, normalizedQuery.dateRange.to);
      resultIds = this.intersect(resultIds, dateResults);
    }

    if (normalizedQuery.thoughtCountRange) {
      const countResults = this.index.filterByThoughtCountRange(
        normalizedQuery.thoughtCountRange.min,
        normalizedQuery.thoughtCountRange.max
      );
      resultIds = this.intersect(resultIds, countResults);
    }

    if (normalizedQuery.completed !== undefined) {
      const completedResults = this.index.filterByCompleted(normalizedQuery.completed);
      resultIds = this.intersect(resultIds, completedResults);
    }

    if (normalizedQuery.minConfidence !== undefined) {
      const confidenceResults = this.index.filterByMinConfidence(normalizedQuery.minConfidence);
      resultIds = this.intersect(resultIds, confidenceResults);
    }

    // Build results with scores
    const results: SearchResult[] = [];
    const textScores = normalizedQuery.text ? this.index.searchByText(normalizedQuery.text) : new Map();

    for (const sessionId of resultIds) {
      const session = this.sessions.get(sessionId);
      if (!session) continue;

      const score = textScores.get(sessionId) || 1.0;
      const highlights = normalizedQuery.text ? this.generateHighlights(session, normalizedQuery.text) : [];
      const matchedFields = this.getMatchedFields(session, normalizedQuery);

      results.push({
        session,
        score,
        highlights,
        matchedFields,
      });
    }

    // Sort results
    this.sortResults(results, normalizedQuery.sort?.field || 'relevance', normalizedQuery.sort?.order || 'desc');

    // Apply pagination
    const page = normalizedQuery.pagination?.page || 1;
    const pageSize = normalizedQuery.pagination?.pageSize || 10;
    const startIdx = (page - 1) * pageSize;
    const endIdx = startIdx + pageSize;
    const paginatedResults = results.slice(startIdx, endIdx);

    const executionTime = Date.now() - startTime;

    return {
      results: paginatedResults,
      sessions: paginatedResults.map(r => r.session), // Convenience property
      total: results.length,
      page,
      pageSize,
      totalPages: Math.ceil(results.length / pageSize),
      query: normalizedQuery,
      executionTime,
    };
  }

  /**
   * Search with faceted results
   */
  searchWithFacets(query: SearchQuery): FacetedResults {
    const basicResults = this.search(query);

    // Re-run search without pagination to get all results for facets
    const fullQuery = { ...query, pagination: undefined };
    const fullResults = this.search(fullQuery);

    const facets = {
      modes: new Map(),
      taxonomyCategories: new Map(),
      authors: new Map(),
      domains: new Map(),
      tags: new Map(),
    };

    for (const result of fullResults.results) {
      const session = result.session;

      // Mode facet
      facets.modes.set(session.mode, (facets.modes.get(session.mode) || 0) + 1);

      // Author facet
      if (session.author) {
        facets.authors.set(session.author, (facets.authors.get(session.author) || 0) + 1);
      }

      // Domain facet
      if (session.domain) {
        facets.domains.set(session.domain, (facets.domains.get(session.domain) || 0) + 1);
      }

      // Tags facet
      if (session.tags) {
        for (const tag of session.tags) {
          facets.tags.set(tag, (facets.tags.get(tag) || 0) + 1);
        }
      }

      // Taxonomy facets
      const indexEntry = this.index.get(session.id);
      if (indexEntry) {
        for (const category of indexEntry.taxonomyCategories) {
          facets.taxonomyCategories.set(
            category,
            (facets.taxonomyCategories.get(category) || 0) + 1
          );
        }
      }
    }

    return {
      ...basicResults,
      facets,
    };
  }

  /**
   * Get autocomplete suggestions
   */
  autocomplete(prefix: string, limit: number = 10): string[] {
    const suggestions = new Set<string>();
    const prefixLower = prefix.toLowerCase();

    // Search in titles
    for (const session of this.sessions.values()) {
      if (session.title && session.title.toLowerCase().includes(prefixLower)) {
        suggestions.add(session.title);
      }

      // Search in thought text (limit to prevent slowdown)
      for (const thought of session.thoughts.slice(0, 5)) {
        const tokens = this.tokenizer.tokenize(thought.content);
        for (const token of tokens) {
          if (token.startsWith(prefixLower)) {
            suggestions.add(token);
            if (suggestions.size >= limit) {
              break;
            }
          }
        }
      }

      if (suggestions.size >= limit) {
        break;
      }
    }

    return Array.from(suggestions).slice(0, limit);
  }

  /**
   * Get search statistics
   */
  getStats() {
    return this.index.getStats();
  }

  /**
   * Clear all indexed data
   */
  clear(): void {
    this.index.clear();
    this.sessions.clear();
  }

  /**
   * Intersect two sets
   */
  private intersect<T>(set1: Set<T>, set2: Set<T>): Set<T> {
    const result = new Set<T>();
    for (const item of set1) {
      if (set2.has(item)) {
        result.add(item);
      }
    }
    return result;
  }

  /**
   * Generate highlights for search results
   */
  private generateHighlights(session: ThinkingSession, query: string): SearchHighlight[] {
    const highlights: SearchHighlight[] = [];
    const queryTokens = this.tokenizer.tokenize(query);

    if (queryTokens.length === 0) {
      return highlights;
    }

    // Highlight in title
    const titleLower = session.title?.toLowerCase() || '';
    for (const token of queryTokens) {
      const idx = titleLower.indexOf(token);
      if (idx >= 0) {
        highlights.push({
          field: 'title',
          text: session.title || '',
          matchedText: token,
          startIndex: idx,
          endIndex: idx + token.length,
        });
      }
    }

    // Highlight in thoughts (limit to first few)
    for (let i = 0; i < Math.min(session.thoughts.length, 10); i++) {
      const thought = session.thoughts[i];
      const thoughtLower = thought.content.toLowerCase();

      for (const token of queryTokens) {
        const idx = thoughtLower.indexOf(token);
        if (idx >= 0) {
          // Extract context around match
          const contextStart = Math.max(0, idx - 30);
          const contextEnd = Math.min(thought.content.length, idx + token.length + 30);
          const context = thought.content.substring(contextStart, contextEnd);

          highlights.push({
            field: `thought_${i}`,
            text: context,
            matchedText: token,
            startIndex: idx - contextStart,
            endIndex: idx - contextStart + token.length,
          });

          break; // Only one highlight per thought
        }
      }
    }

    return highlights.slice(0, 10); // Limit highlights
  }

  /**
   * Get matched fields for a session
   */
  private getMatchedFields(session: ThinkingSession, query: SearchQuery): string[] {
    const fields: string[] = [];

    if (query.text) {
      const tokens = this.tokenizer.tokenize(query.text);
      const titleTokens = this.tokenizer.getUniqueTokens(session.title || '');

      if (tokens.some(t => titleTokens.has(t))) {
        fields.push('title');
      }

      for (let i = 0; i < session.thoughts.length; i++) {
        const thoughtTokens = this.tokenizer.getUniqueTokens(
          session.thoughts[i].content
        );
        if (tokens.some(t => thoughtTokens.has(t))) {
          fields.push(`thought_${i}`);
          break; // Just indicate thoughts matched
        }
      }
    }

    if (query.modes && query.modes.includes(session.mode)) {
      fields.push('mode');
    }

    if (query.author && session.author?.toLowerCase().includes(query.author.toLowerCase())) {
      fields.push('author');
    }

    if (query.domain && session.domain?.toLowerCase().includes(query.domain.toLowerCase())) {
      fields.push('domain');
    }

    return fields;
  }

  /**
   * Sort results
   */
  private sortResults(results: SearchResult[], field: SortField, order: 'asc' | 'desc'): void {
    results.sort((a, b) => {
      let comparison = 0;

      switch (field) {
        case 'relevance':
          comparison = b.score - a.score;
          break;

        case 'createdAt':
          comparison = a.session.createdAt.getTime() - b.session.createdAt.getTime();
          break;

        case 'updatedAt':
          comparison = a.session.updatedAt.getTime() - b.session.updatedAt.getTime();
          break;

        case 'thoughtCount':
          comparison = a.session.thoughts.length - b.session.thoughts.length;
          break;

        case 'confidence':
          // Calculate average confidence from thoughts with uncertainty
          const getAvgConfidence = (session: ThinkingSession): number => {
            const uncertainties = session.thoughts
              .filter((t: any) => typeof t.uncertainty === 'number')
              .map((t: any) => 1 - t.uncertainty);
            return uncertainties.length > 0
              ? uncertainties.reduce((sum, c) => sum + c, 0) / uncertainties.length
              : 0.5;
          };
          comparison = getAvgConfidence(a.session) - getAvgConfidence(b.session);
          break;

        case 'title':
          comparison = (a.session.title || '').localeCompare(b.session.title || '');
          break;
      }

      return order === 'asc' ? comparison : -comparison;
    });
  }
}
