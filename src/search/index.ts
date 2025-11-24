/**
 * Search Index (v3.4.0)
 * Phase 4 Task 9.1: In-memory search index with full-text and metadata indexing
 */

import type { ThinkingSession, ThinkingMode } from '../types/index.js';
import type { SearchIndexEntry, SearchStats } from './types.js';
import { Tokenizer } from './tokenizer.js';
// import { TaxonomyClassifier } from '../taxonomy/classifier.js'; // TODO: Implement taxonomy classifier

/**
 * In-memory search index
 */
export class SearchIndex {
  private index: Map<string, SearchIndexEntry>;
  private tokenizer: Tokenizer;
  // private classifier: TaxonomyClassifier;
  private lastIndexed: Date;

  constructor() {
    this.index = new Map();
    this.tokenizer = new Tokenizer();
    // this.classifier = new TaxonomyClassifier();
    this.lastIndexed = new Date();
  }

  /**
   * Index a session
   */
  indexSession(session: ThinkingSession): void {
    // Extract all thought texts
    const thoughtTexts = session.thoughts.map(t => t.content);
    const allText = [session.title || '', ...thoughtTexts].join(' ');

    // Tokenize
    const tokens = this.tokenizer.getTokenFrequency(allText);

    // Extract taxonomy data
    const taxonomyCategories = new Set<string>();
    const taxonomyTypes = new Set<string>();

    // TODO: Re-enable taxonomy classification when classifier is implemented
    /*
    for (const thought of session.thoughts) {
      const classification = this.classifier.classifyThought(thought);
      taxonomyCategories.add(classification.primaryCategory);
      taxonomyTypes.add(classification.primaryType.id);

      for (const type of classification.secondaryTypes.slice(0, 3)) {
        taxonomyTypes.add(type.id);
      }
    }
    */

    // Create index entry
    const entry: SearchIndexEntry = {
      sessionId: session.id,
      title: session.title || 'Untitled',
      mode: session.mode,
      author: session.author,
      domain: session.domain,
      tags: session.tags || [],
      thoughtCount: session.thoughts.length,
      completed: session.thoughts.length > 0 && !session.thoughts[session.thoughts.length - 1].nextThoughtNeeded,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      taxonomyCategories,
      taxonomyTypes,
      tokens,
      thoughtTexts,
        // @ts-expect-error - confidence property
      confidence: session.confidence,
    };

    this.index.set(session.id, entry);
    this.lastIndexed = new Date();
  }

  /**
   * Remove a session from the index
   */
  removeSession(sessionId: string): boolean {
    return this.index.delete(sessionId);
  }

  /**
   * Get an indexed session
   */
  get(sessionId: string): SearchIndexEntry | undefined {
    return this.index.get(sessionId);
  }

  /**
   * Check if session is indexed
   */
  has(sessionId: string): boolean {
    return this.index.has(sessionId);
  }

  /**
   * Get all indexed sessions
   */
  getAllEntries(): SearchIndexEntry[] {
    return Array.from(this.index.values());
  }

  /**
   * Search for sessions by text
   */
  searchByText(query: string): Map<string, number> {
    const queryTokens = new Set(this.tokenizer.tokenize(query));
    const scores = new Map<string, number>();

    if (queryTokens.size === 0) {
      return scores;
    }

    for (const [sessionId, entry] of this.index) {
      let score = 0;

      // TF-IDF scoring (simplified)
      for (const queryToken of queryTokens) {
        const tokenFreq = entry.tokens.get(queryToken) || 0;
        if (tokenFreq > 0) {
          // Calculate document frequency
          let docFreq = 0;
          for (const otherEntry of this.index.values()) {
            if (otherEntry.tokens.has(queryToken)) {
              docFreq++;
            }
          }

          // TF-IDF score
          const tf = tokenFreq / entry.tokens.size;
          const idf = Math.log(this.index.size / (docFreq + 1));
          score += tf * idf;
        }
      }

      // Boost title matches
      const titleTokens = this.tokenizer.getUniqueTokens(entry.title);
      for (const queryToken of queryTokens) {
        if (titleTokens.has(queryToken)) {
          score *= 1.5;
        }
      }

      if (score > 0) {
        scores.set(sessionId, score);
      }
    }

    return scores;
  }

  /**
   * Filter by modes
   */
  filterByModes(modes: ThinkingMode[]): Set<string> {
    const results = new Set<string>();
    const modeSet = new Set(modes);

    for (const [sessionId, entry] of this.index) {
      if (modeSet.has(entry.mode)) {
        results.add(sessionId);
      }
    }

    return results;
  }

  /**
   * Filter by taxonomy categories
   */
  filterByTaxonomyCategories(categories: string[]): Set<string> {
    const results = new Set<string>();
    const categorySet = new Set(categories);

    for (const [sessionId, entry] of this.index) {
      for (const category of entry.taxonomyCategories) {
        if (categorySet.has(category)) {
          results.add(sessionId);
          break;
        }
      }
    }

    return results;
  }

  /**
   * Filter by taxonomy types
   */
  filterByTaxonomyTypes(types: string[]): Set<string> {
    const results = new Set<string>();
    const typeSet = new Set(types);

    for (const [sessionId, entry] of this.index) {
      for (const type of entry.taxonomyTypes) {
        if (typeSet.has(type)) {
          results.add(sessionId);
          break;
        }
      }
    }

    return results;
  }

  /**
   * Filter by author
   */
  filterByAuthor(author: string): Set<string> {
    const results = new Set<string>();
    const authorLower = author.toLowerCase();

    for (const [sessionId, entry] of this.index) {
      if (entry.author && entry.author.toLowerCase().includes(authorLower)) {
        results.add(sessionId);
      }
    }

    return results;
  }

  /**
   * Filter by domain
   */
  filterByDomain(domain: string): Set<string> {
    const results = new Set<string>();
    const domainLower = domain.toLowerCase();

    for (const [sessionId, entry] of this.index) {
      if (entry.domain && entry.domain.toLowerCase().includes(domainLower)) {
        results.add(sessionId);
      }
    }

    return results;
  }

  /**
   * Filter by tags
   */
  filterByTags(tags: string[]): Set<string> {
    const results = new Set<string>();
    const tagSet = new Set(tags.map(t => t.toLowerCase()));

    for (const [sessionId, entry] of this.index) {
      const entryTags = entry.tags.map(t => t.toLowerCase());
      const hasMatch = entryTags.some(t => tagSet.has(t));

      if (hasMatch) {
        results.add(sessionId);
      }
    }

    return results;
  }

  /**
   * Filter by date range
   */
  filterByDateRange(from?: Date, to?: Date): Set<string> {
    const results = new Set<string>();

    for (const [sessionId, entry] of this.index) {
      const created = new Date(entry.createdAt);

      if (from && created < from) {
        continue;
      }

      if (to && created > to) {
        continue;
      }

      results.add(sessionId);
    }

    return results;
  }

  /**
   * Filter by thought count range
   */
  filterByThoughtCountRange(min?: number, max?: number): Set<string> {
    const results = new Set<string>();

    for (const [sessionId, entry] of this.index) {
      if (min !== undefined && entry.thoughtCount < min) {
        continue;
      }

      if (max !== undefined && entry.thoughtCount > max) {
        continue;
      }

      results.add(sessionId);
    }

    return results;
  }

  /**
   * Filter by completion status
   */
  filterByCompleted(completed: boolean): Set<string> {
    const results = new Set<string>();

    for (const [sessionId, entry] of this.index) {
      if (entry.completed === completed) {
        results.add(sessionId);
      }
    }

    return results;
  }

  /**
   * Filter by confidence
   */
  filterByMinConfidence(minConfidence: number): Set<string> {
    const results = new Set<string>();

    for (const [sessionId, entry] of this.index) {
      if (entry.confidence !== undefined && entry.confidence >= minConfidence) {
        results.add(sessionId);
      }
    }

    return results;
  }

  /**
   * Get index statistics
   */
  getStats(): SearchStats {
    let totalTokens = 0;
    let estimatedSize = 0;

    for (const entry of this.index.values()) {
      totalTokens += entry.tokens.size;
      // Rough size estimation
      estimatedSize += JSON.stringify({
        sessionId: entry.sessionId,
        title: entry.title,
        tokens: Array.from(entry.tokens.keys()),
      }).length;
    }

    return {
      totalSessions: this.index.size,
      indexedSessions: this.index.size,
      totalTokens,
      averageTokensPerSession: this.index.size > 0 ? totalTokens / this.index.size : 0,
      indexSize: estimatedSize,
      lastIndexed: this.lastIndexed,
      indexHealth: this.index.size === 0 ? 'empty' : 'healthy',
    };
  }

  /**
   * Clear the index
   */
  clear(): void {
    this.index.clear();
    this.lastIndexed = new Date();
  }

  /**
   * Get index size
   */
  size(): number {
    return this.index.size;
  }
}
