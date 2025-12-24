/**
 * File Exporter Tests - Phase 12 Sprint 4
 *
 * Tests for the file exporter system.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import {
  FileExporter,
  createFileExporter,
  type FileExportConfig,
  type ExportProgress,
} from '../../../src/export/file-exporter.js';
import type { ThinkingSession } from '../../../src/types/session.js';
import type { ExportFormatType } from '../../../src/export/profiles.js';

// Mock fs module
vi.mock('fs', async () => {
  const actual = await vi.importActual('fs');
  return {
    ...actual,
    existsSync: vi.fn().mockReturnValue(false),
    promises: {
      mkdir: vi.fn().mockResolvedValue(undefined),
      writeFile: vi.fn().mockResolvedValue(undefined),
      stat: vi.fn().mockResolvedValue({ size: 1024 }),
    },
  };
});

describe('FileExporter', () => {
  let mockExportFunction: (session: ThinkingSession, format: ExportFormatType) => string;
  let mockSession: ThinkingSession;

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset mock implementations to defaults
    vi.mocked(fs.existsSync).mockReturnValue(false);
    vi.mocked(fs.promises.mkdir).mockResolvedValue(undefined);
    vi.mocked(fs.promises.writeFile).mockResolvedValue(undefined);
    vi.mocked(fs.promises.stat).mockResolvedValue({ size: 1024 } as any);

    mockExportFunction = vi.fn((session, format) => {
      return `Exported ${format} content for session ${session.id}`;
    });

    mockSession = {
      id: 'test-session-123',
      currentMode: 'deductive',
      mode: 'deductive',
      thoughts: [],
      createdAt: new Date(),
      metadata: {
        startTime: Date.now(),
        modeChanges: [],
        exportFormats: ['json'],
      },
    } as ThinkingSession;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should create an instance with default config', () => {
      const exporter = new FileExporter({}, mockExportFunction);
      expect(exporter).toBeDefined();
    });

    it('should accept custom configuration', () => {
      const config: Partial<FileExportConfig> = {
        outputDir: './custom-exports',
        createSessionSubdir: false,
        overwrite: true,
      };
      const exporter = new FileExporter(config, mockExportFunction);
      expect(exporter).toBeDefined();

      const retrievedConfig = exporter.getConfig();
      expect(retrievedConfig.outputDir).toBe('./custom-exports');
      expect(retrievedConfig.createSessionSubdir).toBe(false);
      expect(retrievedConfig.overwrite).toBe(true);
    });

    it('should use default values for unspecified options', () => {
      const exporter = new FileExporter({}, mockExportFunction);
      const config = exporter.getConfig();

      expect(config.createSessionSubdir).toBe(true);
      expect(config.createDateSubdir).toBe(false);
      expect(config.overwrite).toBe(false);
      expect(config.createDir).toBe(true);
    });
  });

  describe('exportToFile', () => {
    it('should export a session to a single format', async () => {
      const exporter = new FileExporter(
        { outputDir: './exports' },
        mockExportFunction
      );

      const result = await exporter.exportToFile(mockSession, 'markdown');

      expect(result.success).toBe(true);
      expect(result.format).toBe('markdown');
      expect(result.filePath).toBeDefined();
      expect(result.size).toBe(1024);
    });

    it('should call the export function with correct arguments', async () => {
      const exporter = new FileExporter(
        { outputDir: './exports' },
        mockExportFunction
      );

      await exporter.exportToFile(mockSession, 'json');

      expect(mockExportFunction).toHaveBeenCalledWith(mockSession, 'json');
    });

    it('should create directory if needed', async () => {
      const exporter = new FileExporter(
        { outputDir: './exports', createDir: true },
        mockExportFunction
      );

      await exporter.exportToFile(mockSession, 'markdown');

      expect(fs.promises.mkdir).toHaveBeenCalled();
    });

    it('should handle export errors gracefully', async () => {
      const failingExportFunction = vi.fn(() => {
        throw new Error('Export failed');
      });

      const exporter = new FileExporter(
        { outputDir: './exports' },
        failingExportFunction
      );

      const result = await exporter.exportToFile(mockSession, 'markdown');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Export failed');
    });

    it('should not overwrite existing files when overwrite is false', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);

      const exporter = new FileExporter(
        { outputDir: './exports', overwrite: false },
        mockExportFunction
      );

      const result = await exporter.exportToFile(mockSession, 'markdown');

      expect(result.success).toBe(false);
      expect(result.error).toContain('File already exists');
    });
  });

  describe('exportToFiles', () => {
    it('should export to multiple formats', async () => {
      const exporter = new FileExporter(
        { outputDir: './exports' },
        mockExportFunction
      );

      const result = await exporter.exportToFiles(mockSession, ['markdown', 'json', 'latex']);

      expect(result.successCount).toBe(3);
      expect(result.failureCount).toBe(0);
      expect(result.results).toHaveLength(3);
    });

    it('should report progress via callback', async () => {
      const exporter = new FileExporter(
        { outputDir: './exports' },
        mockExportFunction
      );

      const progressUpdates: ExportProgress[] = [];
      const onProgress = (progress: ExportProgress) => {
        progressUpdates.push({ ...progress });
      };

      await exporter.exportToFiles(mockSession, ['markdown', 'json'], onProgress);

      expect(progressUpdates.length).toBeGreaterThan(0);
      expect(progressUpdates[0].phase).toBe('exporting');
    });

    it('should track percentage correctly', async () => {
      const exporter = new FileExporter(
        { outputDir: './exports' },
        mockExportFunction
      );

      const progressUpdates: ExportProgress[] = [];
      await exporter.exportToFiles(
        mockSession,
        ['markdown', 'json'],
        (progress) => progressUpdates.push({ ...progress })
      );

      // Should have progress updates for each format
      const completedUpdates = progressUpdates.filter(p => p.phase === 'completed');
      expect(completedUpdates.length).toBe(2);
    });

    it('should calculate total size', async () => {
      const exporter = new FileExporter(
        { outputDir: './exports' },
        mockExportFunction
      );

      const result = await exporter.exportToFiles(mockSession, ['markdown', 'json']);

      expect(result.totalSize).toBe(2048); // 1024 * 2
    });

    it('should include exportedAt timestamp', async () => {
      const exporter = new FileExporter(
        { outputDir: './exports' },
        mockExportFunction
      );

      const result = await exporter.exportToFiles(mockSession, ['markdown']);

      expect(result.exportedAt).toBeInstanceOf(Date);
    });
  });

  describe('exportWithProfile', () => {
    it('should export using profile formats', async () => {
      const exporter = new FileExporter(
        { outputDir: './exports' },
        mockExportFunction
      );

      const result = await exporter.exportWithProfile(mockSession, 'academic');

      // Academic profile has latex, markdown, json
      expect(result.successCount).toBe(3);
    });

    it('should handle invalid profile gracefully', async () => {
      const exporter = new FileExporter(
        { outputDir: './exports' },
        mockExportFunction
      );

      const result = await exporter.exportWithProfile(
        mockSession,
        'invalid' as any
      );

      expect(result.successCount).toBe(0);
    });
  });

  describe('exportAll', () => {
    it('should export all 8 formats', async () => {
      const exporter = new FileExporter(
        { outputDir: './exports' },
        mockExportFunction
      );

      const result = await exporter.exportAll(mockSession);

      expect(result.results).toHaveLength(8);
    });

    it('should include all format types', async () => {
      const exporter = new FileExporter(
        { outputDir: './exports' },
        mockExportFunction
      );

      const result = await exporter.exportAll(mockSession);

      const formats = result.results.map(r => r.format);
      expect(formats).toContain('markdown');
      expect(formats).toContain('latex');
      expect(formats).toContain('json');
      expect(formats).toContain('mermaid');
      expect(formats).toContain('dot');
      expect(formats).toContain('ascii');
    });
  });

  describe('configuration', () => {
    it('should resolve output directory with session subdir', async () => {
      const exporter = new FileExporter(
        { outputDir: './exports', createSessionSubdir: true },
        mockExportFunction
      );

      const result = await exporter.exportToFile(mockSession, 'markdown');

      expect(result.filePath).toContain(mockSession.id);
    });

    it('should update configuration', () => {
      const exporter = new FileExporter(
        { outputDir: './exports' },
        mockExportFunction
      );

      exporter.updateConfig({ overwrite: true, outputDir: './new-exports' });

      const config = exporter.getConfig();
      expect(config.overwrite).toBe(true);
      expect(config.outputDir).toBe('./new-exports');
    });

    it('should handle different filename patterns', async () => {
      const exporter = new FileExporter(
        {
          outputDir: './exports',
          filenamePattern: '{date}_{format}',
          createSessionSubdir: false,
        },
        mockExportFunction
      );

      const result = await exporter.exportToFile(mockSession, 'markdown');

      expect(result.filePath).not.toContain(mockSession.id);
      expect(result.filePath).toContain('markdown');
    });

    it('should use different date formats', () => {
      const exporterIso = new FileExporter(
        { outputDir: './exports', dateFormat: 'iso' },
        mockExportFunction
      );

      const exporterTimestamp = new FileExporter(
        { outputDir: './exports', dateFormat: 'timestamp' },
        mockExportFunction
      );

      // Both should be valid exporters
      expect(exporterIso.getConfig().dateFormat).toBe('iso');
      expect(exporterTimestamp.getConfig().dateFormat).toBe('timestamp');
    });
  });

  describe('file extensions', () => {
    it('should use correct extension for markdown', async () => {
      const exporter = new FileExporter(
        { outputDir: './exports' },
        mockExportFunction
      );

      const result = await exporter.exportToFile(mockSession, 'markdown');

      expect(result.filePath).toMatch(/\.md$/);
    });

    it('should use correct extension for latex', async () => {
      const exporter = new FileExporter(
        { outputDir: './exports' },
        mockExportFunction
      );

      const result = await exporter.exportToFile(mockSession, 'latex');

      expect(result.filePath).toMatch(/\.tex$/);
    });

    it('should use correct extension for json', async () => {
      const exporter = new FileExporter(
        { outputDir: './exports' },
        mockExportFunction
      );

      const result = await exporter.exportToFile(mockSession, 'json');

      expect(result.filePath).toMatch(/\.json$/);
    });

    it('should use correct extension for jupyter', async () => {
      const exporter = new FileExporter(
        { outputDir: './exports' },
        mockExportFunction
      );

      const result = await exporter.exportToFile(mockSession, 'jupyter');

      expect(result.filePath).toMatch(/\.ipynb$/);
    });
  });

  describe('createFileExporter factory', () => {
    it('should create a FileExporter instance', () => {
      const exporter = createFileExporter(
        { outputDir: './exports' },
        mockExportFunction
      );

      expect(exporter).toBeInstanceOf(FileExporter);
    });

    it('should pass configuration correctly', () => {
      const config: Partial<FileExportConfig> = {
        outputDir: './custom',
        overwrite: true,
      };

      const exporter = createFileExporter(config, mockExportFunction);

      expect(exporter.getConfig().outputDir).toBe('./custom');
      expect(exporter.getConfig().overwrite).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should handle mkdir errors', async () => {
      vi.mocked(fs.promises.mkdir).mockRejectedValue(new Error('Permission denied'));

      const exporter = new FileExporter(
        { outputDir: './exports' },
        mockExportFunction
      );

      const result = await exporter.exportToFile(mockSession, 'markdown');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Permission denied');
    });

    it('should handle writeFile errors', async () => {
      vi.mocked(fs.promises.writeFile).mockRejectedValue(new Error('Disk full'));

      const exporter = new FileExporter(
        { outputDir: './exports' },
        mockExportFunction
      );

      const result = await exporter.exportToFile(mockSession, 'markdown');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Disk full');
    });

    it('should continue with other formats after one fails', async () => {
      let callCount = 0;
      const partiallyFailingExport = vi.fn(() => {
        callCount++;
        if (callCount === 2) {
          throw new Error('Export failed');
        }
        return 'content';
      });

      const exporter = new FileExporter(
        { outputDir: './exports' },
        partiallyFailingExport
      );

      const result = await exporter.exportToFiles(mockSession, ['markdown', 'json', 'latex']);

      expect(result.successCount).toBe(2);
      expect(result.failureCount).toBe(1);
    });
  });

  describe('filename sanitization', () => {
    it('should sanitize session IDs with special characters', async () => {
      const sessionWithSpecialId = {
        ...mockSession,
        id: 'test:session/with\\special<chars>',
      };

      const exporter = new FileExporter(
        { outputDir: './exports', createSessionSubdir: false },
        mockExportFunction
      );

      const result = await exporter.exportToFile(sessionWithSpecialId, 'markdown');

      // Extract filename from path
      const filename = path.basename(result.filePath);

      // Filename should not contain special characters (excluding path separators)
      expect(filename).not.toContain(':');
      expect(filename).not.toContain('/');
      expect(filename).not.toContain('<');
      expect(filename).not.toContain('>');
    });
  });
});
