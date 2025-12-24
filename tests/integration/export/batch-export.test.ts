/**
 * Batch Export Integration Tests - Phase 12 Sprint 4
 *
 * Tests the batch export functionality with multiple formats and sessions.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SessionManager } from '../../../src/session/manager.js';
import { ThinkingMode } from '../../../src/types/core.js';
import { ExportService } from '../../../src/services/ExportService.js';
import {
  getExportProfile,
  getAllExportProfiles,
  EXPORT_PROFILES,
  type ExportProfileId,
} from '../../../src/export/profiles.js';

describe('Batch Export Integration', () => {
  let sessionManager: SessionManager;
  let exportService: ExportService;

  beforeEach(async () => {
    sessionManager = new SessionManager();
    exportService = new ExportService();
  });

  describe('profile-based batch export', () => {
    it('should get all available profiles', () => {
      const profiles = getAllExportProfiles();

      expect(profiles.length).toBeGreaterThan(0);
      expect(profiles.map((p) => p.id)).toContain('academic');
      expect(profiles.map((p) => p.id)).toContain('presentation');
      expect(profiles.map((p) => p.id)).toContain('minimal');
    });

    it('should get formats for academic profile', () => {
      const profile = getExportProfile('academic');
      const formats = profile?.formats || [];

      expect(formats).toContain('latex');
      expect(formats).toContain('markdown');
      expect(formats).toContain('json');
    });

    it('should get formats for presentation profile', () => {
      const profile = getExportProfile('presentation');
      const formats = profile?.formats || [];

      expect(formats).toContain('mermaid');
      expect(formats).toContain('markdown');
    });

    it('should get formats for minimal profile', () => {
      const profile = getExportProfile('minimal');
      const formats = profile?.formats || [];

      expect(formats).toContain('json');
      expect(formats).toContain('markdown');
    });
  });

  describe('export session to multiple formats', () => {
    it('should export session to all formats in academic profile', async () => {
      const session = await sessionManager.createSession({ mode: ThinkingMode.SEQUENTIAL });

      await sessionManager.addThought(session.id, {
        id: 'thought-1',
        sessionId: session.id,
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Test thought for export',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        mode: ThinkingMode.SEQUENTIAL,
      });

      const updatedSession = await sessionManager.getSession(session.id);
      const profile = getExportProfile('academic');
      const formats = profile?.formats || [];

      for (const format of formats) {
        const content = exportService.exportSession(updatedSession!, format);
        expect(content).toBeTruthy();
        expect(content.length).toBeGreaterThan(0);
      }
    });

    it('should export empty session without errors', async () => {
      const session = await sessionManager.createSession({ mode: ThinkingMode.DEDUCTIVE });

      // Export each format without throwing
      const profile = getExportProfile('minimal');
      const formats = profile?.formats || [];
      for (const format of formats) {
        expect(() => exportService.exportSession(session, format)).not.toThrow();
      }
    });
  });

  describe('profile metadata', () => {
    it('should have valid profile definitions', () => {
      const profileIds: ExportProfileId[] = [
        'academic',
        'presentation',
        'documentation',
        'archive',
        'minimal',
      ];

      for (const id of profileIds) {
        const profile = getExportProfile(id);
        expect(profile).toBeDefined();
        expect(profile!.id).toBe(id);
        expect(profile!.name).toBeTruthy();
        expect(profile!.description).toBeTruthy();
        expect(profile!.formats.length).toBeGreaterThan(0);
      }
    });
  });
});
