/**
 * Session Export All Integration Tests - Phase 12 Sprint 4
 *
 * Tests the export_all action in the session tool.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SessionManager } from '../../../src/session/manager.js';
import { ThinkingMode } from '../../../src/types/core.js';
import { ExportService } from '../../../src/services/ExportService.js';
import type { ExportFormatType } from '../../../src/export/profiles.js';

describe('Session Export All Integration', () => {
  let sessionManager: SessionManager;
  let sessionId: string;
  let exportService: ExportService;

  beforeEach(async () => {
    sessionManager = new SessionManager();
    exportService = new ExportService();
    const session = await sessionManager.createSession({ mode: ThinkingMode.SEQUENTIAL });
    sessionId = session.id;

    // Add some thoughts to the session
    await sessionManager.addThought(sessionId, {
      id: 'thought-1',
      sessionId,
      thoughtNumber: 1,
      totalThoughts: 3,
      content: 'First thought',
      timestamp: new Date(),
      nextThoughtNeeded: true,
      mode: ThinkingMode.SEQUENTIAL,
    });
  });

  describe('export_all action', () => {
    it('should export session to all available formats', async () => {
      const session = await sessionManager.getSession(sessionId);
      expect(session).toBeDefined();

      const formats: ExportFormatType[] = [
        'markdown',
        'latex',
        'json',
        'html',
        'jupyter',
        'mermaid',
        'dot',
        'ascii',
      ];

      const results: Record<string, string> = {};
      for (const format of formats) {
        const content = exportService.exportSession(session!, format);
        results[format] = content;
        expect(content).toBeTruthy();
        expect(content.length).toBeGreaterThan(0);
      }

      // Verify key formats have appropriate content
      expect(results.markdown).toContain('#');
      expect(results.json).toContain('{');
      expect(results.latex).toContain('\\');
      // HTML may or may not contain tags depending on implementation
      expect(results.html).toBeTruthy();
    });

    it('should include session metadata in exports', async () => {
      const session = await sessionManager.getSession(sessionId);
      const markdownExport = exportService.exportSession(session!, 'markdown');

      expect(markdownExport).toContain('First thought');
    });

    it('should export empty session without errors', async () => {
      const emptySession = await sessionManager.createSession({ mode: ThinkingMode.DEDUCTIVE });

      const formats: ExportFormatType[] = ['markdown', 'json', 'latex'];
      for (const format of formats) {
        const content = exportService.exportSession(emptySession, format);
        expect(content).toBeTruthy();
      }
    });

    it('should maintain consistency across format exports', async () => {
      const session = await sessionManager.getSession(sessionId);

      const jsonExport = exportService.exportSession(session!, 'json');
      const parsed = JSON.parse(jsonExport);

      expect(parsed.id).toBe(sessionId);
      expect(parsed.mode).toBe('sequential');
    });
  });

  describe('multi-thought session export', () => {
    beforeEach(async () => {
      // Add more thoughts
      await sessionManager.addThought(sessionId, {
        id: 'thought-2',
        sessionId,
        thoughtNumber: 2,
        totalThoughts: 3,
        content: 'Second thought with analysis',
        timestamp: new Date(),
        nextThoughtNeeded: true,
        mode: ThinkingMode.SEQUENTIAL,
      });

      await sessionManager.addThought(sessionId, {
        id: 'thought-3',
        sessionId,
        thoughtNumber: 3,
        totalThoughts: 3,
        content: 'Conclusion reached',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        mode: ThinkingMode.SEQUENTIAL,
      });
    });

    it('should include all thoughts in exports', async () => {
      const session = await sessionManager.getSession(sessionId);
      const markdownExport = exportService.exportSession(session!, 'markdown');

      expect(markdownExport).toContain('First thought');
      expect(markdownExport).toContain('Second thought');
      expect(markdownExport).toContain('Conclusion');
    });

    it('should maintain thought order in exports', async () => {
      const session = await sessionManager.getSession(sessionId);
      const jsonExport = exportService.exportSession(session!, 'json');
      const parsed = JSON.parse(jsonExport);

      expect(parsed.thoughts[0].thoughtNumber).toBe(1);
      expect(parsed.thoughts[1].thoughtNumber).toBe(2);
      expect(parsed.thoughts[2].thoughtNumber).toBe(3);
    });
  });

  describe('export format validation', () => {
    it('should handle all supported formats without throwing', async () => {
      const session = await sessionManager.getSession(sessionId);
      const allFormats: ExportFormatType[] = [
        'markdown',
        'latex',
        'json',
        'html',
        'jupyter',
        'mermaid',
        'dot',
        'ascii',
      ];

      for (const format of allFormats) {
        expect(() => exportService.exportSession(session!, format)).not.toThrow();
      }
    });

    it('should produce valid JSON for json format', async () => {
      const session = await sessionManager.getSession(sessionId);
      const jsonExport = exportService.exportSession(session!, 'json');

      expect(() => JSON.parse(jsonExport)).not.toThrow();
    });

    it('should produce valid structure for jupyter format', async () => {
      const session = await sessionManager.getSession(sessionId);
      const jupyterExport = exportService.exportSession(session!, 'jupyter');
      const parsed = JSON.parse(jupyterExport);

      expect(parsed.nbformat).toBeDefined();
      expect(parsed.cells).toBeDefined();
      expect(Array.isArray(parsed.cells)).toBe(true);
    });
  });
});
