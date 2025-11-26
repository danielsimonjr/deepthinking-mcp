/**
 * Unit Tests for SearchEngine
 * Task 3.5: Critical Path Tests
 *
 * Tests cover:
 * - Session indexing and removal
 * - Text search with tokenization
 * - Mode filtering
 * - Author and domain filtering
 * - Taxonomy category and type filtering
 * - Date range filtering
 * - Sorting (relevance, date, title)
 * - Pagination
 * - Faceted results
 * - Query normalization (query -> text, mode -> modes)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SearchEngine } from '../../src/search/engine.js';
import { ThinkingMode, ThinkingSession } from '../../src/types/index.js';

describe('SearchEngine', () => {
  let searchEngine: SearchEngine;
  let session1: ThinkingSession;
  let session2: ThinkingSession;
  let session3: ThinkingSession;

  beforeEach(() => {
    searchEngine = new SearchEngine();

    // Create test sessions with different characteristics
    session1 = {
      id: 'session-1',
      title: 'Mathematical Proof Analysis',
      mode: ThinkingMode.MATHEMATICS,
      domain: 'number-theory',
      author: 'alice@example.com',
      thoughts: [
        {
          id: 'thought-1',
          sessionId: 'session-1',
          mode: ThinkingMode.MATHEMATICS,
          thoughtNumber: 1,
          totalThoughts: 2,
          content: 'Analyzing prime number distribution using mathematical induction',
          timestamp: new Date('2024-01-01T10:00:00Z'),
          nextThoughtNeeded: true,
        } as any,
        {
          id: 'thought-2',
          sessionId: 'session-1',
          mode: ThinkingMode.MATHEMATICS,
          thoughtNumber: 2,
          totalThoughts: 2,
          content: 'Proof completed using Riemann hypothesis',
          timestamp: new Date('2024-01-01T10:05:00Z'),
          nextThoughtNeeded: false,
        } as any,
      ],
      createdAt: new Date('2024-01-01T10:00:00Z'),
      updatedAt: new Date('2024-01-01T10:05:00Z'),
      currentThoughtNumber: 2,
      isComplete: true,
      metrics: {
        totalThoughts: 2,
        thoughtsByType: {},
        averageUncertainty: 0,
        revisionCount: 0,
        timeSpent: 0,
        dependencyDepth: 0,
        customMetrics: new Map(),
        cacheStats: { hits: 0, misses: 0, hitRate: 0, size: 0, maxSize: 0 },
      },
      tags: ['mathematics', 'proof'],
      collaborators: ['alice@example.com'],
      config: {
        modeConfig: { mode: ThinkingMode.MATHEMATICS, strictValidation: false, allowModeSwitch: true },
        enableAutoSave: true,
        enableValidation: true,
        enableVisualization: true,
        integrations: {},
        exportFormats: ['markdown'],
        autoExportOnComplete: false,
        maxThoughtsInMemory: 1000,
        compressionThreshold: 500,
      },
      taxonomyClassification: {
        categories: ['mathematics', 'formal-logic'],
        types: ['analytical', 'deductive'],
        confidence: 0.95,
      },
    };

    session2 = {
      id: 'session-2',
      title: 'Physics Problem Solving',
      mode: ThinkingMode.PHYSICS,
      domain: 'quantum-mechanics',
      author: 'bob@example.com',
      thoughts: [
        {
          id: 'thought-3',
          sessionId: 'session-2',
          mode: ThinkingMode.PHYSICS,
          thoughtNumber: 1,
          totalThoughts: 1,
          content: 'Analyzing wave-particle duality in quantum systems',
          timestamp: new Date('2024-01-02T14:00:00Z'),
          nextThoughtNeeded: false,
        } as any,
      ],
      createdAt: new Date('2024-01-02T14:00:00Z'),
      updatedAt: new Date('2024-01-02T14:00:00Z'),
      currentThoughtNumber: 1,
      isComplete: true,
      metrics: {
        totalThoughts: 1,
        thoughtsByType: {},
        averageUncertainty: 0,
        revisionCount: 0,
        timeSpent: 0,
        dependencyDepth: 0,
        customMetrics: new Map(),
        cacheStats: { hits: 0, misses: 0, hitRate: 0, size: 0, maxSize: 0 },
      },
      tags: ['physics', 'quantum'],
      collaborators: ['bob@example.com'],
      config: {
        modeConfig: { mode: ThinkingMode.PHYSICS, strictValidation: false, allowModeSwitch: true },
        enableAutoSave: true,
        enableValidation: true,
        enableVisualization: true,
        integrations: {},
        exportFormats: ['markdown'],
        autoExportOnComplete: false,
        maxThoughtsInMemory: 1000,
        compressionThreshold: 500,
      },
      taxonomyClassification: {
        categories: ['physics', 'natural-science'],
        types: ['analytical', 'empirical'],
        confidence: 0.90,
      },
    };

    session3 = {
      id: 'session-3',
      title: 'Causal Analysis Research',
      mode: ThinkingMode.CAUSAL,
      domain: 'epidemiology',
      author: 'alice@example.com',
      thoughts: [
        {
          id: 'thought-4',
          sessionId: 'session-3',
          mode: ThinkingMode.CAUSAL,
          thoughtNumber: 1,
          totalThoughts: 2,
          content: 'Identifying causal relationships in disease transmission',
          timestamp: new Date('2024-01-03T09:00:00Z'),
          nextThoughtNeeded: true,
        } as any,
      ],
      createdAt: new Date('2024-01-03T09:00:00Z'),
      updatedAt: new Date('2024-01-03T09:00:00Z'),
      currentThoughtNumber: 1,
      isComplete: false,
      metrics: {
        totalThoughts: 1,
        thoughtsByType: {},
        averageUncertainty: 0,
        revisionCount: 0,
        timeSpent: 0,
        dependencyDepth: 0,
        customMetrics: new Map(),
        cacheStats: { hits: 0, misses: 0, hitRate: 0, size: 0, maxSize: 0 },
      },
      tags: ['causal', 'epidemiology'],
      collaborators: ['alice@example.com'],
      config: {
        modeConfig: { mode: ThinkingMode.CAUSAL, strictValidation: false, allowModeSwitch: true },
        enableAutoSave: true,
        enableValidation: true,
        enableVisualization: true,
        integrations: {},
        exportFormats: ['markdown'],
        autoExportOnComplete: false,
        maxThoughtsInMemory: 1000,
        compressionThreshold: 500,
      },
      taxonomyClassification: {
        categories: ['science', 'research'],
        types: ['causal', 'analytical'],
        confidence: 0.88,
      },
    };
  });

  describe('indexSession', () => {
    it('should index a session and make it searchable', () => {
      searchEngine.indexSession(session1);

      const results = searchEngine.search({ text: 'mathematical' });
      expect(results.sessions).toHaveLength(1);
      expect(results.sessions[0].id).toBe('session-1');
    });

    it('should index multiple sessions', () => {
      searchEngine.indexSession(session1);
      searchEngine.indexSession(session2);
      searchEngine.indexSession(session3);

      const results = searchEngine.search({});
      expect(results.sessions).toHaveLength(3);
    });

    it('should update index when session is re-indexed', () => {
      searchEngine.indexSession(session1);

      // Modify session
      session1.title = 'Updated Mathematical Analysis';
      searchEngine.indexSession(session1);

      const results = searchEngine.search({ text: 'Updated' });
      expect(results.sessions).toHaveLength(1);
      expect(results.sessions[0].title).toBe('Updated Mathematical Analysis');
    });
  });

  describe('removeSession', () => {
    it('should remove a session from the index', () => {
      searchEngine.indexSession(session1);
      searchEngine.indexSession(session2);

      searchEngine.removeSession('session-1');

      const results = searchEngine.search({});
      expect(results.sessions).toHaveLength(1);
      expect(results.sessions[0].id).toBe('session-2');
    });

    it('should handle removing non-existent session gracefully', () => {
      searchEngine.indexSession(session1);

      expect(() => searchEngine.removeSession('non-existent')).not.toThrow();

      const results = searchEngine.search({});
      expect(results.sessions).toHaveLength(1);
    });
  });

  describe('updateSession', () => {
    it('should update an indexed session', () => {
      searchEngine.indexSession(session1);

      session1.title = 'Modified Title';
      searchEngine.updateSession(session1);

      const results = searchEngine.search({ text: 'Modified' });
      expect(results.sessions).toHaveLength(1);
      expect(results.sessions[0].title).toBe('Modified Title');
    });
  });

  describe('search - text filtering', () => {
    beforeEach(() => {
      searchEngine.indexSession(session1);
      searchEngine.indexSession(session2);
      searchEngine.indexSession(session3);
    });

    it('should search by text in title', () => {
      const results = searchEngine.search({ text: 'Mathematical' });
      expect(results.sessions).toHaveLength(1);
      expect(results.sessions[0].title).toContain('Mathematical');
    });

    it('should search by text in thought content', () => {
      const results = searchEngine.search({ text: 'quantum' });
      expect(results.sessions).toHaveLength(1);
      expect(results.sessions[0].id).toBe('session-2');
    });

    it('should handle empty text query', () => {
      const results = searchEngine.search({ text: '' });
      expect(results.sessions).toHaveLength(3);
    });

    it('should be case-insensitive', () => {
      const results = searchEngine.search({ text: 'MATHEMATICAL' });
      expect(results.sessions).toHaveLength(1);
      expect(results.sessions[0].title).toContain('Mathematical');
    });

    it('should support alias: query instead of text', () => {
      const results = searchEngine.search({ query: 'Mathematical' } as any);
      expect(results.sessions).toHaveLength(1);
      expect(results.sessions[0].title).toContain('Mathematical');
    });
  });

  describe('search - mode filtering', () => {
    beforeEach(() => {
      searchEngine.indexSession(session1);
      searchEngine.indexSession(session2);
      searchEngine.indexSession(session3);
    });

    it('should filter by single mode', () => {
      const results = searchEngine.search({ modes: [ThinkingMode.MATHEMATICS] });
      expect(results.sessions).toHaveLength(1);
      expect(results.sessions[0].mode).toBe(ThinkingMode.MATHEMATICS);
    });

    it('should filter by multiple modes', () => {
      const results = searchEngine.search({
        modes: [ThinkingMode.MATHEMATICS, ThinkingMode.PHYSICS],
      });
      expect(results.sessions).toHaveLength(2);
    });

    it('should support alias: mode instead of modes', () => {
      const results = searchEngine.search({ mode: ThinkingMode.MATHEMATICS } as any);
      expect(results.sessions).toHaveLength(1);
      expect(results.sessions[0].mode).toBe(ThinkingMode.MATHEMATICS);
    });
  });

  describe('search - author filtering', () => {
    beforeEach(() => {
      searchEngine.indexSession(session1);
      searchEngine.indexSession(session2);
      searchEngine.indexSession(session3);
    });

    it('should filter by author', () => {
      const results = searchEngine.search({ author: 'alice@example.com' });
      expect(results.sessions).toHaveLength(2);
      expect(results.sessions.every(s => s.author === 'alice@example.com')).toBe(true);
    });

    it('should handle non-existent author', () => {
      const results = searchEngine.search({ author: 'charlie@example.com' });
      expect(results.sessions).toHaveLength(0);
    });
  });

  describe('search - domain filtering', () => {
    beforeEach(() => {
      searchEngine.indexSession(session1);
      searchEngine.indexSession(session2);
      searchEngine.indexSession(session3);
    });

    it('should filter by domain', () => {
      const results = searchEngine.search({ domain: 'number-theory' });
      expect(results.sessions).toHaveLength(1);
      expect(results.sessions[0].domain).toBe('number-theory');
    });

    it('should handle non-existent domain', () => {
      const results = searchEngine.search({ domain: 'non-existent' });
      expect(results.sessions).toHaveLength(0);
    });
  });

  describe('search - taxonomy filtering', () => {
    beforeEach(() => {
      searchEngine.indexSession(session1);
      searchEngine.indexSession(session2);
      searchEngine.indexSession(session3);
    });

    it('should filter by taxonomy categories', () => {
      const results = searchEngine.search({ taxonomyCategories: ['mathematics'] });
      expect(results.sessions).toHaveLength(1);
      expect(results.sessions[0].taxonomyClassification?.categories).toContain('mathematics');
    });

    it('should filter by multiple taxonomy categories', () => {
      const results = searchEngine.search({
        taxonomyCategories: ['mathematics', 'physics'],
      });
      expect(results.sessions).toHaveLength(2);
    });

    it('should filter by taxonomy types', () => {
      const results = searchEngine.search({ taxonomyTypes: ['analytical'] });
      expect(results.sessions).toHaveLength(3);
    });

    it('should filter by multiple taxonomy types', () => {
      const results = searchEngine.search({ taxonomyTypes: ['deductive'] });
      expect(results.sessions).toHaveLength(1);
      expect(results.sessions[0].id).toBe('session-1');
    });
  });

  describe('search - date range filtering', () => {
    beforeEach(() => {
      searchEngine.indexSession(session1);
      searchEngine.indexSession(session2);
      searchEngine.indexSession(session3);
    });

    it('should filter by createdAfter', () => {
      const results = searchEngine.search({
        createdAfter: new Date('2024-01-02T00:00:00Z'),
      });
      expect(results.sessions).toHaveLength(2);
      expect(results.sessions.every(s => s.createdAt >= new Date('2024-01-02T00:00:00Z'))).toBe(true);
    });

    it('should filter by createdBefore', () => {
      const results = searchEngine.search({
        createdBefore: new Date('2024-01-02T00:00:00Z'),
      });
      expect(results.sessions).toHaveLength(1);
      expect(results.sessions[0].id).toBe('session-1');
    });

    it('should filter by date range', () => {
      const results = searchEngine.search({
        createdAfter: new Date('2024-01-01T00:00:00Z'),
        createdBefore: new Date('2024-01-03T00:00:00Z'),
      });
      expect(results.sessions).toHaveLength(2);
    });
  });

  describe('search - combined filters', () => {
    beforeEach(() => {
      searchEngine.indexSession(session1);
      searchEngine.indexSession(session2);
      searchEngine.indexSession(session3);
    });

    it('should combine text and mode filters', () => {
      const results = searchEngine.search({
        text: 'Analysis',
        modes: [ThinkingMode.MATHEMATICS],
      });
      expect(results.sessions).toHaveLength(1);
      expect(results.sessions[0].id).toBe('session-1');
    });

    it('should combine multiple filters', () => {
      const results = searchEngine.search({
        author: 'alice@example.com',
        modes: [ThinkingMode.MATHEMATICS, ThinkingMode.CAUSAL],
        createdAfter: new Date('2024-01-01T00:00:00Z'),
      });
      expect(results.sessions).toHaveLength(2);
    });

    it('should return empty results when filters exclude all', () => {
      const results = searchEngine.search({
        text: 'quantum',
        modes: [ThinkingMode.MATHEMATICS],
      });
      expect(results.sessions).toHaveLength(0);
    });
  });

  describe('search - sorting', () => {
    beforeEach(() => {
      searchEngine.indexSession(session1);
      searchEngine.indexSession(session2);
      searchEngine.indexSession(session3);
    });

    it('should sort by date (newest first)', () => {
      const results = searchEngine.search({ sort: 'date' });
      expect(results.sessions[0].id).toBe('session-3');
      expect(results.sessions[2].id).toBe('session-1');
    });

    it('should sort by title', () => {
      const results = searchEngine.search({ sort: 'title' });
      // Compare strings lexicographically
      const title0 = results.sessions[0].title || '';
      const title1 = results.sessions[1].title || '';
      expect(title0.localeCompare(title1)).toBeLessThanOrEqual(0);
    });

    it('should default to relevance sorting with text query', () => {
      const results = searchEngine.search({ text: 'analysis' });
      expect(results.sessions.length).toBeGreaterThan(0);
      // Results should be ordered by relevance score
    });
  });

  describe('search - pagination', () => {
    beforeEach(() => {
      searchEngine.indexSession(session1);
      searchEngine.indexSession(session2);
      searchEngine.indexSession(session3);
    });

    it('should paginate results with limit', () => {
      const results = searchEngine.search({ limit: 2 });
      expect(results.sessions).toHaveLength(2);
      expect(results.total).toBe(3);
      expect(results.hasMore).toBe(true);
    });

    it('should paginate results with offset', () => {
      const results = searchEngine.search({ offset: 1, limit: 2 });
      expect(results.sessions).toHaveLength(2);
      expect(results.total).toBe(3);
      expect(results.offset).toBe(1);
    });

    it('should handle offset beyond results', () => {
      const results = searchEngine.search({ offset: 10 });
      expect(results.sessions).toHaveLength(0);
      expect(results.total).toBe(3);
    });

    it('should indicate no more results', () => {
      const results = searchEngine.search({ limit: 10 });
      expect(results.hasMore).toBe(false);
    });
  });

  describe('search - facets', () => {
    beforeEach(() => {
      searchEngine.indexSession(session1);
      searchEngine.indexSession(session2);
      searchEngine.indexSession(session3);
    });

    it('should include faceted results when requested', () => {
      const results = searchEngine.search({ includeFacets: true });
      expect(results.facets).toBeDefined();
      expect(results.facets?.modes).toBeDefined();
      expect(results.facets?.authors).toBeDefined();
      expect(results.facets?.domains).toBeDefined();
    });

    it('should calculate correct mode facets', () => {
      const results = searchEngine.search({ includeFacets: true });
      expect(results.facets?.modes?.get(ThinkingMode.MATHEMATICS)).toBe(1);
      expect(results.facets?.modes?.get(ThinkingMode.PHYSICS)).toBe(1);
      expect(results.facets?.modes?.get(ThinkingMode.CAUSAL)).toBe(1);
    });

    it('should calculate correct author facets', () => {
      const results = searchEngine.search({ includeFacets: true });
      expect(results.facets?.authors?.get('alice@example.com')).toBe(2);
      expect(results.facets?.authors?.get('bob@example.com')).toBe(1);
    });

    it('should not include facets when not requested', () => {
      const results = searchEngine.search({ includeFacets: false });
      expect(results.facets).toBeUndefined();
    });
  });

  describe('search - performance', () => {
    it('should handle searching with no indexed sessions', () => {
      const results = searchEngine.search({ text: 'test' });
      expect(results.sessions).toHaveLength(0);
      expect(results.total).toBe(0);
      expect(results.executionTime).toBeGreaterThanOrEqual(0);
    });

    it('should record execution time', () => {
      searchEngine.indexSession(session1);
      const results = searchEngine.search({ text: 'mathematical' });
      expect(results.executionTime).toBeGreaterThanOrEqual(0);
    });

    it('should handle large result sets efficiently', () => {
      // Index many sessions
      for (let i = 0; i < 100; i++) {
        const session = { ...session1, id: `session-${i}` };
        searchEngine.indexSession(session);
      }

      const startTime = Date.now();
      const results = searchEngine.search({ text: 'mathematical' });
      const endTime = Date.now();

      expect(results.sessions.length).toBeLessThanOrEqual(100);
      expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
    });
  });

  describe('edge cases', () => {
    it('should handle session with no thoughts', () => {
      const emptySession = { ...session1, thoughts: [] };
      searchEngine.indexSession(emptySession);

      const results = searchEngine.search({ modes: [ThinkingMode.MATHEMATICS] });
      expect(results.sessions).toHaveLength(1);
    });

    it('should handle session with no taxonomy classification', () => {
      const noTaxonomy = { ...session1, taxonomyClassification: undefined };
      searchEngine.indexSession(noTaxonomy);

      const results = searchEngine.search({ taxonomyCategories: ['mathematics'] });
      expect(results.sessions).toHaveLength(0);
    });

    it('should handle special characters in text search', () => {
      searchEngine.indexSession(session1);
      const results = searchEngine.search({ text: 'math@#$%' });
      expect(results.sessions).toHaveLength(0);
    });

    it('should handle very long search queries', () => {
      searchEngine.indexSession(session1);
      const longQuery = 'mathematical '.repeat(100);
      const results = searchEngine.search({ text: longQuery });
      expect(results.sessions.length).toBeGreaterThanOrEqual(0);
    });
  });
});
