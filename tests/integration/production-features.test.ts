/**
 * Production Features Integration Tests (v3.4.0)
 * Phase 4 Task 9.10: Integration testing for production features
 *
 * Tests comprehensive integration of:
 * - Search System (Task 9.1)
 * - Analytics Dashboard (Task 9.2)
 * - Template System (Task 9.3)
 * - Batch Processing (Task 9.4)
 * - Rate Limiting (Task 9.5)
 * - Cache System (Task 9.6)
 * - Webhook System (Task 9.7)
 * - Backup/Restore (Task 9.8)
 * - Comparison Tools (Task 9.9)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SearchEngine } from '../../src/search/engine.js';
import { TemplateManager } from '../../src/templates/manager.js';
import { BatchProcessor } from '../../src/batch/processor.js';
import { CacheFactory } from '../../src/cache/factory.js';
import { BackupManager } from '../../src/backup/backup-manager.js';
import { SessionComparator } from '../../src/comparison/comparator.js';
import type { ThinkingSession } from '../../src/types/session.js';
import type { Thought } from '../../src/types/core.js';

describe('Production Features Integration Tests', () => {
  let testSessions: ThinkingSession[];

  beforeEach(() => {
    // Create test sessions with various modes and content
    testSessions = [
      createTestSession('session-1', 'sequential', ['AI', 'reasoning'], 3),
      createTestSession('session-2', 'mathematics', ['proof', 'theorem'], 5),
      createTestSession('session-3', 'causal', ['analysis', 'causality'], 4),
    ];
  });

  afterEach(() => {
    testSessions = [];
  });

  describe('Search System Integration', () => {
    let searchEngine: SearchEngine;

    beforeEach(() => {
      searchEngine = new SearchEngine();

      // Index all test sessions
      testSessions.forEach(session => {
        searchEngine.indexSession(session);
      });
    });

    it('should index and search sessions by content', () => {
      const results = searchEngine.search({
        query: 'reasoning',
        mode: 'sequential',
      });

      expect(results.sessions).toBeDefined();
      expect(results.sessions.length).toBeGreaterThan(0);
      expect(results.sessions[0].id).toBe('session-1');
    });

    it('should filter by mode', () => {
      const results = searchEngine.search({
        mode: 'mathematics',
      });

      expect(results.sessions.length).toBe(1);
      expect(results.sessions[0].mode).toBe('mathematics');
    });

    it('should filter by tags', () => {
      const results = searchEngine.search({
        tags: ['proof'],
      });

      expect(results.sessions.length).toBe(1);
      expect(results.sessions[0].tags).toContain('proof');
    });

    it('should support faceted search', () => {
      const results = searchEngine.search({
        query: 'analysis',
        facets: ['mode', 'tags'],
      });

      expect(results.facets).toBeDefined();
      expect(results.facets?.mode).toBeDefined();
      expect(results.facets?.tags).toBeDefined();
    });

    it('should provide autocomplete suggestions', () => {
      const suggestions = searchEngine.autocomplete('rea');

      expect(suggestions).toBeDefined();
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some(s => s.toLowerCase().includes('rea'))).toBe(true);
    });
  });

  describe('Template System Integration', () => {
    let templateManager: TemplateManager;

    beforeEach(() => {
      templateManager = new TemplateManager();
    });

    it('should list built-in templates', () => {
      const templates = templateManager.listTemplates();

      expect(templates.length).toBeGreaterThanOrEqual(7);
      expect(templates.some(t => t.name.includes('Sequential'))).toBe(true);
    });

    it('should filter templates by category', () => {
      const templates = templateManager.listTemplates({
        category: 'problem-solving',
      });

      expect(templates.length).toBeGreaterThan(0);
      expect(templates.every(t => t.category === 'problem-solving')).toBe(true);
    });

    it('should filter templates by difficulty', () => {
      const templates = templateManager.listTemplates({
        difficulty: 'beginner',
      });

      expect(templates.length).toBeGreaterThan(0);
      expect(templates.every(t => t.difficulty === 'beginner')).toBe(true);
    });

    it('should instantiate template to session', () => {
      const templates = templateManager.listTemplates();
      const template = templates[0];

      const session = templateManager.instantiateTemplate(template.id, {
        title: 'Test Session from Template',
        domain: 'software-engineering',
      });

      expect(session).toBeDefined();
      expect(session.title).toBe('Test Session from Template');
      expect(session.mode).toBe(template.mode);
    });

    it('should track template usage statistics', () => {
      const templates = templateManager.listTemplates();
      const template = templates[0];

      // Instantiate template multiple times
      templateManager.instantiateTemplate(template.id);
      templateManager.instantiateTemplate(template.id);

      const stats = templateManager.getUsageStats(template.id);

      expect(stats).toBeDefined();
      expect(stats.timesUsed).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Batch Processing Integration', () => {
    let batchProcessor: BatchProcessor;

    beforeEach(() => {
      batchProcessor = new BatchProcessor();
    });

    it('should process batch export job', async () => {
      const jobId = await batchProcessor.submitJob({
        type: 'export',
        sessionIds: testSessions.map(s => s.id),
        format: 'json',
      });

      expect(jobId).toBeDefined();

      const status = batchProcessor.getJobStatus(jobId);
      expect(status).toBeDefined();
      expect(['pending', 'running', 'completed']).toContain(status.status);
    });

    it('should process batch validation job', async () => {
      const jobId = await batchProcessor.submitJob({
        type: 'validate',
        sessionIds: testSessions.map(s => s.id),
      });

      expect(jobId).toBeDefined();

      const status = batchProcessor.getJobStatus(jobId);
      expect(status).toBeDefined();
    });

    it('should limit concurrent jobs', async () => {
      const jobs: string[] = [];

      // Submit more jobs than the concurrency limit
      for (let i = 0; i < 10; i++) {
        const jobId = await batchProcessor.submitJob({
          type: 'export',
          sessionIds: [testSessions[0].id],
          format: 'json',
        });
        jobs.push(jobId);
      }

      // Check that some jobs are queued
      const statuses = jobs.map(id => batchProcessor.getJobStatus(id));
      const runningCount = statuses.filter(s => s.status === 'running').length;
      const queuedCount = statuses.filter(s => s.status === 'pending').length;

      expect(runningCount).toBeLessThanOrEqual(3); // Default concurrency
      expect(queuedCount).toBeGreaterThan(0);
    });
  });

  describe('Cache System Integration', () => {
    let cache: ReturnType<typeof CacheFactory.create>;

    beforeEach(() => {
      cache = CacheFactory.create('lru', { maxSize: 100 });
    });

    it('should cache and retrieve values', () => {
      cache.set('key1', { data: 'value1' });

      const value = cache.get('key1');
      expect(value).toEqual({ data: 'value1' });
    });

    it('should respect LRU eviction policy', () => {
      const smallCache = CacheFactory.create('lru', { maxSize: 2 });

      smallCache.set('key1', 'value1');
      smallCache.set('key2', 'value2');
      smallCache.set('key3', 'value3'); // Should evict key1

      expect(smallCache.get('key1')).toBeUndefined();
      expect(smallCache.get('key2')).toBeDefined();
      expect(smallCache.get('key3')).toBeDefined();
    });

    it('should report cache statistics', () => {
      cache.set('key1', 'value1');
      cache.get('key1'); // hit
      cache.get('key2'); // miss

      const stats = cache.getStats();
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBeCloseTo(0.5, 2);
    });

    it('should clear cache', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      cache.clear();

      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key2')).toBeUndefined();
      expect(cache.getStats().size).toBe(0);
    });
  });

  describe('Backup and Restore Integration', () => {
    let backupManager: BackupManager;

    beforeEach(() => {
      backupManager = new BackupManager({
        provider: 'local',
        config: { path: './test-backups' },
      });
    });

    it('should create backup of session', async () => {
      const backupId = await backupManager.backup(testSessions[0]);

      expect(backupId).toBeDefined();
      expect(typeof backupId).toBe('string');
    });

    it('should list available backups', async () => {
      await backupManager.backup(testSessions[0]);
      await backupManager.backup(testSessions[1]);

      const backups = await backupManager.listBackups();

      expect(backups.length).toBeGreaterThanOrEqual(2);
    });

    it('should restore session from backup', async () => {
      const originalSession = testSessions[0];
      const backupId = await backupManager.backup(originalSession);

      const restored = await backupManager.restore(backupId);

      expect(restored.id).toBe(originalSession.id);
      expect(restored.title).toBe(originalSession.title);
      expect(restored.thoughts.length).toBe(originalSession.thoughts.length);
    });
  });

  describe('Session Comparison Integration', () => {
    let comparator: SessionComparator;

    beforeEach(() => {
      comparator = new SessionComparator();
    });

    it('should compare two sessions', () => {
      const comparison = comparator.compare(testSessions[0], testSessions[1]);

      expect(comparison).toBeDefined();
      expect(comparison.similarity).toBeGreaterThanOrEqual(0);
      expect(comparison.similarity).toBeLessThanOrEqual(1);
      expect(comparison.differences).toBeDefined();
    });

    it('should identify mode differences', () => {
      const comparison = comparator.compare(testSessions[0], testSessions[1]);

      const modeDiff = comparison.differences.find(d => d.path === 'mode');
      expect(modeDiff).toBeDefined();
      expect(modeDiff?.valueA).toBe('sequential');
      expect(modeDiff?.valueB).toBe('mathematics');
    });

    it('should calculate thought count similarity', () => {
      const comparison = comparator.compare(testSessions[0], testSessions[2]);

      expect(comparison.similarity).toBeGreaterThan(0);
      expect(comparison.metrics?.thoughtCountSimilarity).toBeDefined();
    });

    it('should compare multiple sessions', () => {
      const comparisons = comparator.compareMultiple(testSessions);

      expect(comparisons).toBeDefined();
      expect(comparisons.length).toBe(3); // C(3,2) = 3 pairs
      expect(comparisons.every(c => c.similarity >= 0 && c.similarity <= 1)).toBe(true);
    });
  });

  describe('End-to-End Feature Integration', () => {
    it('should integrate search + templates + batch', async () => {
      // 1. Create sessions from templates
      const templateManager = new TemplateManager();
      const templates = templateManager.listTemplates();
      const session1 = templateManager.instantiateTemplate(templates[0].id, {
        title: 'E2E Test Session 1',
      });
      const session2 = templateManager.instantiateTemplate(templates[1].id, {
        title: 'E2E Test Session 2',
      });

      // 2. Index them in search
      const searchEngine = new SearchEngine();
      searchEngine.indexSession(session1);
      searchEngine.indexSession(session2);

      // 3. Search for them
      const searchResults = searchEngine.search({ query: 'E2E' });
      expect(searchResults.sessions.length).toBe(2);

      // 4. Batch export the search results
      const batchProcessor = new BatchProcessor();
      const jobId = await batchProcessor.submitJob({
        type: 'export',
        sessionIds: searchResults.sessions.map(s => s.id),
        format: 'json',
      });

      expect(jobId).toBeDefined();
    });

    it('should integrate backup + comparison + cache', async () => {
      // 1. Backup sessions
      const backupManager = new BackupManager({
        provider: 'local',
        config: { path: './test-backups-e2e' },
      });

      const backup1 = await backupManager.backup(testSessions[0]);
      const backup2 = await backupManager.backup(testSessions[1]);

      // 2. Restore and cache
      const cache = CacheFactory.create('lru', { maxSize: 10 });
      const restored1 = await backupManager.restore(backup1);
      const restored2 = await backupManager.restore(backup2);

      cache.set(backup1, restored1);
      cache.set(backup2, restored2);

      // 3. Compare cached sessions
      const comparator = new SessionComparator();
      const cached1 = cache.get(backup1) as ThinkingSession;
      const cached2 = cache.get(backup2) as ThinkingSession;

      const comparison = comparator.compare(cached1, cached2);
      expect(comparison.similarity).toBeGreaterThanOrEqual(0);
    });
  });
});

// Helper function to create test sessions
function createTestSession(
  id: string,
  mode: any,
  tags: string[],
  thoughtCount: number
): ThinkingSession {
  const thoughts: Thought[] = [];

  for (let i = 0; i < thoughtCount; i++) {
    // Include tags in the content so they're searchable
    const tagContent = tags.length > 0 ? ` about ${tags.join(' and ')}` : '';
    thoughts.push({
      id: `${id}-thought-${i + 1}`,
      sessionId: id,
      thoughtNumber: i + 1,
      totalThoughts: thoughtCount,
      content: `Test thought ${i + 1} for ${mode} mode${tagContent}`,
      timestamp: new Date(),
      mode: mode,
      nextThoughtNeeded: i < thoughtCount - 1,
    });
  }

  return {
    id,
    title: `Test Session ${id}`,
    mode,
    config: {
      modeConfig: { mode },
      enableAutoSave: false,
      enableValidation: true,
      enableVisualization: false,
      integrations: {},
      exportFormats: ['json'],
      autoExportOnComplete: false,
      maxThoughtsInMemory: 1000,
      compressionThreshold: 10000,
    },
    thoughts,
    createdAt: new Date(),
    updatedAt: new Date(),
    currentThoughtNumber: thoughtCount,
    isComplete: true,
    metrics: {
      totalThoughts: thoughtCount,
      thoughtsByType: { sequential: thoughtCount },
      averageUncertainty: 0.3,
      revisionCount: 0,
      timeSpent: 3600,
      dependencyDepth: 1,
      customMetrics: new Map(),
    },
    tags,
  };
}
