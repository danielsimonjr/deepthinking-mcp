/**
 * FileSessionStore Unit Tests
 *
 * Tests the file-based session persistence implementation
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FileSessionStore } from '../../src/session/storage/file-store.js';
import { ThinkingMode, ThinkingSession } from '../../src/types/index.js';
import { promises as fs } from 'fs';
import { randomUUID } from 'crypto';
import * as path from 'path';
import * as os from 'os';

/**
 * Helper to create a test session
 */
function createTestSession(id?: string): ThinkingSession {
  const sessionId = id || randomUUID();
  return {
    id: sessionId,
    title: 'Test Session',
    mode: ThinkingMode.SEQUENTIAL,
    domain: 'testing',
    config: {
      modeConfig: {
        mode: ThinkingMode.SEQUENTIAL,
        strictValidation: false,
        allowModeSwitch: true,
      },
      enableAutoSave: true,
      enableValidation: true,
      enableVisualization: true,
      integrations: {},
      exportFormats: ['markdown', 'json'],
      autoExportOnComplete: false,
      maxThoughtsInMemory: 1000,
      compressionThreshold: 500,
    },
    thoughts: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    currentThoughtNumber: 0,
    isComplete: false,
    metrics: {
      totalThoughts: 0,
      thoughtsByType: {},
      averageUncertainty: 0,
      revisionCount: 0,
      timeSpent: 0,
      dependencyDepth: 0,
      customMetrics: new Map(),
    },
    collaborators: [],
    tags: [],
  };
}

describe('FileSessionStore', () => {
  let store: FileSessionStore;
  let tempDir: string;

  beforeEach(async () => {
    // Create temporary directory for tests
    tempDir = path.join(os.tmpdir(), `deepthinking-test-${randomUUID()}`);
    store = new FileSessionStore(tempDir);
    await store.initialize();
  });

  afterEach(async () => {
    // Clean up temporary directory
    await store.close();
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('initialization', () => {
    it('should create necessary directories', async () => {
      const sessionsDir = path.join(tempDir, 'sessions');
      const metadataDir = path.join(tempDir, 'metadata');

      // Check directories exist
      await expect(fs.access(sessionsDir)).resolves.not.toThrow();
      await expect(fs.access(metadataDir)).resolves.not.toThrow();
    });

    it('should handle multiple initialization calls', async () => {
      await store.initialize();
      await store.initialize();
      // Should not throw
    });
  });

  describe('saveSession', () => {
    it('should save a session to disk', async () => {
      const session = createTestSession();

      await store.saveSession(session);

      // Verify file was created
      const sessionPath = path.join(tempDir, 'sessions', `${session.id}.json`);
      await expect(fs.access(sessionPath)).resolves.not.toThrow();
    });

    it('should save session with correct content', async () => {
      const session = createTestSession();
      session.title = 'Unique Title 12345';

      await store.saveSession(session);

      // Read and verify content
      const sessionPath = path.join(tempDir, 'sessions', `${session.id}.json`);
      const content = await fs.readFile(sessionPath, 'utf-8');
      const saved = JSON.parse(content);

      expect(saved.id).toBe(session.id);
      expect(saved.title).toBe('Unique Title 12345');
      expect(saved.mode).toBe(ThinkingMode.SEQUENTIAL);
    });

    it('should update metadata index', async () => {
      const session = createTestSession();

      await store.saveSession(session);

      const sessions = await store.listSessions();
      expect(sessions).toHaveLength(1);
      expect(sessions[0].id).toBe(session.id);
      expect(sessions[0].title).toBe('Test Session');
    });

    it('should overwrite existing session', async () => {
      const session = createTestSession();
      session.title = 'Original Title';

      await store.saveSession(session);

      // Update and save again
      session.title = 'Updated Title';
      await store.saveSession(session);

      const loaded = await store.loadSession(session.id);
      expect(loaded?.title).toBe('Updated Title');
    });
  });

  describe('loadSession', () => {
    it('should load an existing session', async () => {
      const session = createTestSession();
      await store.saveSession(session);

      const loaded = await store.loadSession(session.id);

      expect(loaded).not.toBeNull();
      expect(loaded?.id).toBe(session.id);
      expect(loaded?.title).toBe(session.title);
      expect(loaded?.mode).toBe(session.mode);
    });

    it('should return null for non-existent session', async () => {
      const loaded = await store.loadSession('non-existent-id');

      expect(loaded).toBeNull();
    });

    it('should preserve Date objects', async () => {
      const session = createTestSession();
      const originalCreatedAt = session.createdAt;

      await store.saveSession(session);
      const loaded = await store.loadSession(session.id);

      expect(loaded?.createdAt).toBeInstanceOf(Date);
      expect(loaded?.createdAt.toISOString()).toBe(originalCreatedAt.toISOString());
    });

    it('should preserve Map objects', async () => {
      const session = createTestSession();
      session.metrics.customMetrics = new Map([
        ['key1', 'value1'],
        ['key2', 42],
      ]);

      await store.saveSession(session);
      const loaded = await store.loadSession(session.id);

      expect(loaded?.metrics.customMetrics).toBeInstanceOf(Map);
      expect(loaded?.metrics.customMetrics.get('key1')).toBe('value1');
      expect(loaded?.metrics.customMetrics.get('key2')).toBe(42);
    });
  });

  describe('deleteSession', () => {
    it('should delete an existing session', async () => {
      const session = createTestSession();
      await store.saveSession(session);

      const deleted = await store.deleteSession(session.id);

      expect(deleted).toBe(true);

      // Verify file was removed
      const sessionPath = path.join(tempDir, 'sessions', `${session.id}.json`);
      await expect(fs.access(sessionPath)).rejects.toThrow();
    });

    it('should return false for non-existent session', async () => {
      const deleted = await store.deleteSession('non-existent-id');

      expect(deleted).toBe(false);
    });

    it('should update metadata index after deletion', async () => {
      const session = createTestSession();
      await store.saveSession(session);

      await store.deleteSession(session.id);

      const sessions = await store.listSessions();
      expect(sessions).toHaveLength(0);
    });
  });

  describe('listSessions', () => {
    it('should list all sessions', async () => {
      const session1 = createTestSession();
      const session2 = createTestSession();
      const session3 = createTestSession();

      await store.saveSession(session1);
      await store.saveSession(session2);
      await store.saveSession(session3);

      const sessions = await store.listSessions();

      expect(sessions).toHaveLength(3);
      expect(sessions.map((s) => s.id)).toContain(session1.id);
      expect(sessions.map((s) => s.id)).toContain(session2.id);
      expect(sessions.map((s) => s.id)).toContain(session3.id);
    });

    it('should return empty array when no sessions exist', async () => {
      const sessions = await store.listSessions();

      expect(sessions).toHaveLength(0);
      expect(Array.isArray(sessions)).toBe(true);
    });

    it('should include correct metadata fields', async () => {
      const session = createTestSession();
      session.thoughts = [
        {
          id: randomUUID(),
          sessionId: session.id,
          mode: ThinkingMode.SEQUENTIAL,
          content: 'Test thought',
          thoughtNumber: 1,
          totalThoughts: 1,
          timestamp: new Date(),
          nextThoughtNeeded: false,
        },
      ];

      await store.saveSession(session);

      const sessions = await store.listSessions();
      const metadata = sessions[0];

      expect(metadata).toHaveProperty('id');
      expect(metadata).toHaveProperty('title');
      expect(metadata).toHaveProperty('createdAt');
      expect(metadata).toHaveProperty('updatedAt');
      expect(metadata).toHaveProperty('thoughtCount');
      expect(metadata).toHaveProperty('mode');
      expect(metadata).toHaveProperty('isComplete');

      expect(metadata.thoughtCount).toBe(1);
    });
  });

  describe('exists', () => {
    it('should return true for existing session', async () => {
      const session = createTestSession();
      await store.saveSession(session);

      const exists = await store.exists(session.id);

      expect(exists).toBe(true);
    });

    it('should return false for non-existent session', async () => {
      const exists = await store.exists('non-existent-id');

      expect(exists).toBe(false);
    });
  });

  describe('getStats', () => {
    it('should return storage statistics', async () => {
      const session1 = createTestSession();
      const session2 = createTestSession();

      await store.saveSession(session1);
      await store.saveSession(session2);

      const stats = await store.getStats();

      expect(stats.totalSessions).toBe(2);
      expect(stats.totalThoughts).toBe(0);
      expect(stats.storageSize).toBeGreaterThan(0);
      expect(stats.averageSessionSize).toBeGreaterThan(0);
      expect(stats.storageHealth).toBe('healthy');
    });

    it('should calculate total thoughts correctly', async () => {
      const session1 = createTestSession();
      session1.thoughts = [
        {
          id: randomUUID(),
          sessionId: session1.id,
          mode: ThinkingMode.SEQUENTIAL,
          content: 'Thought 1',
          thoughtNumber: 1,
          totalThoughts: 2,
          timestamp: new Date(),
          nextThoughtNeeded: true,
        },
        {
          id: randomUUID(),
          sessionId: session1.id,
          mode: ThinkingMode.SEQUENTIAL,
          content: 'Thought 2',
          thoughtNumber: 2,
          totalThoughts: 2,
          timestamp: new Date(),
          nextThoughtNeeded: false,
        },
      ];

      const session2 = createTestSession();
      session2.thoughts = [
        {
          id: randomUUID(),
          sessionId: session2.id,
          mode: ThinkingMode.SEQUENTIAL,
          content: 'Thought 1',
          thoughtNumber: 1,
          totalThoughts: 1,
          timestamp: new Date(),
          nextThoughtNeeded: false,
        },
      ];

      await store.saveSession(session1);
      await store.saveSession(session2);

      const stats = await store.getStats();

      expect(stats.totalThoughts).toBe(3);
    });

    it('should identify storage health status', async () => {
      const config = {
        maxSessions: 10,
      };
      const healthStore = new FileSessionStore(tempDir, config);
      await healthStore.initialize();

      // Create 8 sessions (80% of max)
      for (let i = 0; i < 8; i++) {
        await healthStore.saveSession(createTestSession());
      }

      const stats = await healthStore.getStats();
      expect(stats.storageHealth).toBe('warning');

      await healthStore.close();
    });
  });

  describe('cleanup', () => {
    it('should clean up old sessions', async () => {
      // Create sessions with different ages
      const oldSession = createTestSession();
      oldSession.createdAt = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000); // 10 days old

      const newSession = createTestSession();
      newSession.createdAt = new Date(); // Current

      await store.saveSession(oldSession);
      await store.saveSession(newSession);

      // Clean up sessions older than 7 days
      const maxAge = 7 * 24 * 60 * 60 * 1000;
      const cleaned = await store.cleanup(maxAge);

      expect(cleaned).toBe(1);

      const sessions = await store.listSessions();
      expect(sessions).toHaveLength(1);
      expect(sessions[0].id).toBe(newSession.id);
    });

    it('should return 0 when no sessions need cleanup', async () => {
      const session = createTestSession();
      await store.saveSession(session);

      const maxAge = 1 * 24 * 60 * 60 * 1000; // 1 day
      const cleaned = await store.cleanup(maxAge);

      expect(cleaned).toBe(0);
    });
  });

  describe('concurrent operations', () => {
    it('should handle concurrent saves', async () => {
      const sessions = Array.from({ length: 10 }, () => createTestSession());

      // Save all sessions concurrently
      await Promise.all(sessions.map((s) => store.saveSession(s)));

      const allSessions = await store.listSessions();
      expect(allSessions).toHaveLength(10);
    }, 15000); // Extended timeout for concurrent file operations

    it('should handle concurrent reads', async () => {
      const session = createTestSession();
      await store.saveSession(session);

      // Load same session multiple times concurrently
      const loads = await Promise.all(
        Array.from({ length: 10 }, () => store.loadSession(session.id))
      );

      expect(loads).toHaveLength(10);
      loads.forEach((loaded) => {
        expect(loaded?.id).toBe(session.id);
      });
    });
  });

  describe('error handling', () => {
    it('should handle invalid session data gracefully', async () => {
      const session = createTestSession();
      await store.saveSession(session);

      // Corrupt the file
      const sessionPath = path.join(tempDir, 'sessions', `${session.id}.json`);
      await fs.writeFile(sessionPath, 'invalid json {{{', 'utf-8');

      // Should return null instead of throwing
      const loaded = await store.loadSession(session.id);
      expect(loaded).toBeNull();
    });

    it('should handle operations before initialization', async () => {
      const uninitStore = new FileSessionStore(tempDir);
      const session = createTestSession();

      // Should auto-initialize
      await expect(uninitStore.saveSession(session)).resolves.not.toThrow();

      await uninitStore.close();
    });
  });
});
