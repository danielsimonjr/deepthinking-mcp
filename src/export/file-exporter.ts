/**
 * File Exporter Module - Phase 12 Sprint 4
 *
 * Provides file system export capabilities with directory organization,
 * filename templating, and batch export support.
 */

import * as fs from 'fs';
import * as path from 'path';
import type { ThinkingSession } from '../types/session.js';
import type { ExportFormatType, ExportProfileId } from './profiles.js';
import { getExportProfile } from './profiles.js';

// ============================================================================
// TYPES
// ============================================================================

/**
 * File export configuration
 */
export interface FileExportConfig {
  /** Output directory path */
  outputDir: string;

  /** Create subdirectory by session ID */
  createSessionSubdir?: boolean;

  /** Create subdirectory by date */
  createDateSubdir?: boolean;

  /** Filename pattern template */
  filenamePattern?: string;

  /** Overwrite existing files */
  overwrite?: boolean;

  /** Create directory if it doesn't exist */
  createDir?: boolean;

  /** Date format for filenames */
  dateFormat?: 'iso' | 'short' | 'timestamp';
}

/**
 * Result of a single file export
 */
export interface FileExportResult {
  /** Format that was exported */
  format: ExportFormatType;

  /** Full path to the exported file */
  filePath: string;

  /** Whether the export succeeded */
  success: boolean;

  /** Error message if failed */
  error?: string;

  /** File size in bytes */
  size?: number;
}

/**
 * Result of batch file export
 */
export interface BatchExportResult {
  /** Directory where files were exported */
  outputDir: string;

  /** Individual export results */
  results: FileExportResult[];

  /** Number of successful exports */
  successCount: number;

  /** Number of failed exports */
  failureCount: number;

  /** Total size of all exported files */
  totalSize: number;

  /** Timestamp of export */
  exportedAt: Date;
}

/**
 * Progress callback for batch exports
 */
export interface ExportProgress {
  /** Current format being exported */
  currentFormat: ExportFormatType;

  /** Index of current export (1-based) */
  currentIndex: number;

  /** Total number of exports */
  totalExports: number;

  /** Percentage complete */
  percentage: number;

  /** Phase of export */
  phase: 'started' | 'exporting' | 'writing' | 'completed' | 'failed';
}

export type ExportProgressCallback = (progress: ExportProgress) => void;

// ============================================================================
// FILE EXTENSIONS
// ============================================================================

/**
 * Map format types to file extensions
 */
const FORMAT_EXTENSIONS: Record<ExportFormatType, string> = {
  markdown: '.md',
  latex: '.tex',
  json: '.json',
  html: '.html',
  jupyter: '.ipynb',
  mermaid: '.mmd',
  dot: '.dot',
  ascii: '.txt',
  svg: '.svg',
};

// ============================================================================
// FILE EXPORTER CLASS
// ============================================================================

/**
 * FileExporter handles exporting session content to the file system
 */
export class FileExporter {
  private config: FileExportConfig;
  private exportFunction: (
    session: ThinkingSession,
    format: ExportFormatType
  ) => string;

  constructor(
    config: Partial<FileExportConfig>,
    exportFunction: (session: ThinkingSession, format: ExportFormatType) => string
  ) {
    this.config = {
      outputDir: config.outputDir || './exports',
      createSessionSubdir: config.createSessionSubdir ?? true,
      createDateSubdir: config.createDateSubdir ?? false,
      filenamePattern: config.filenamePattern || '{session}_{mode}_{format}',
      overwrite: config.overwrite ?? false,
      createDir: config.createDir ?? true,
      dateFormat: config.dateFormat || 'iso',
    };
    this.exportFunction = exportFunction;
  }

  /**
   * Export a session to a single format
   */
  async exportToFile(
    session: ThinkingSession,
    format: ExportFormatType
  ): Promise<FileExportResult> {
    try {
      // Get output directory
      const outputDir = this.resolveOutputDir(session);

      // Ensure directory exists
      if (this.config.createDir) {
        await this.ensureDir(outputDir);
      }

      // Generate filename
      const filename = this.generateFilename(session, format);
      const filePath = path.join(outputDir, filename);

      // Check for existing file
      if (!this.config.overwrite && fs.existsSync(filePath)) {
        return {
          format,
          filePath,
          success: false,
          error: 'File already exists and overwrite is disabled',
        };
      }

      // Export content
      const content = this.exportFunction(session, format);

      // Write to file
      await fs.promises.writeFile(filePath, content, 'utf-8');

      // Get file size
      const stats = await fs.promises.stat(filePath);

      return {
        format,
        filePath,
        success: true,
        size: stats.size,
      };
    } catch (error) {
      return {
        format,
        filePath: '',
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Export a session to multiple formats
   */
  async exportToFiles(
    session: ThinkingSession,
    formats: ExportFormatType[],
    onProgress?: ExportProgressCallback
  ): Promise<BatchExportResult> {
    const results: FileExportResult[] = [];
    const outputDir = this.resolveOutputDir(session);
    const exportedAt = new Date();

    for (let i = 0; i < formats.length; i++) {
      const format = formats[i];

      // Report progress
      if (onProgress) {
        onProgress({
          currentFormat: format,
          currentIndex: i + 1,
          totalExports: formats.length,
          percentage: Math.round((i / formats.length) * 100),
          phase: 'exporting',
        });
      }

      const result = await this.exportToFile(session, format);
      results.push(result);

      // Report completion for this format
      if (onProgress) {
        onProgress({
          currentFormat: format,
          currentIndex: i + 1,
          totalExports: formats.length,
          percentage: Math.round(((i + 1) / formats.length) * 100),
          phase: result.success ? 'completed' : 'failed',
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;
    const totalSize = results.reduce((sum, r) => sum + (r.size || 0), 0);

    return {
      outputDir,
      results,
      successCount,
      failureCount,
      totalSize,
      exportedAt,
    };
  }

  /**
   * Export using a profile
   */
  async exportWithProfile(
    session: ThinkingSession,
    profileId: ExportProfileId,
    onProgress?: ExportProgressCallback
  ): Promise<BatchExportResult> {
    const profile = getExportProfile(profileId);
    if (!profile) {
      return {
        outputDir: this.config.outputDir,
        results: [],
        successCount: 0,
        failureCount: 1,
        totalSize: 0,
        exportedAt: new Date(),
      };
    }

    return this.exportToFiles(session, profile.formats, onProgress);
  }

  /**
   * Export all supported formats
   */
  async exportAll(
    session: ThinkingSession,
    onProgress?: ExportProgressCallback
  ): Promise<BatchExportResult> {
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
    return this.exportToFiles(session, allFormats, onProgress);
  }

  /**
   * Resolve the output directory with optional subdirectories
   */
  private resolveOutputDir(session: ThinkingSession): string {
    let dir = this.config.outputDir;

    if (this.config.createDateSubdir) {
      const date = this.formatDate(new Date(), 'short');
      dir = path.join(dir, date);
    }

    if (this.config.createSessionSubdir) {
      dir = path.join(dir, session.id);
    }

    return dir;
  }

  /**
   * Generate a filename based on the pattern
   */
  private generateFilename(
    session: ThinkingSession,
    format: ExportFormatType
  ): string {
    const pattern = this.config.filenamePattern || '{session}_{format}';
    const extension = FORMAT_EXTENSIONS[format];

    const date = this.formatDate(new Date(), this.config.dateFormat || 'iso');
    const mode = session.mode || 'unknown';

    let filename = pattern
      .replace('{session}', this.sanitizeFilename(session.id))
      .replace('{mode}', this.sanitizeFilename(mode))
      .replace('{format}', format)
      .replace('{date}', date);

    return filename + extension;
  }

  /**
   * Format date according to configuration
   */
  private formatDate(
    date: Date,
    format: 'iso' | 'short' | 'timestamp'
  ): string {
    switch (format) {
      case 'iso':
        return date.toISOString().split('T')[0];
      case 'short':
        return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
      case 'timestamp':
        return String(date.getTime());
      default:
        return date.toISOString().split('T')[0];
    }
  }

  /**
   * Sanitize a string for use in filenames
   */
  private sanitizeFilename(str: string): string {
    return str.replace(/[<>:"/\\|?*]/g, '_').replace(/\s+/g, '-');
  }

  /**
   * Ensure a directory exists
   */
  private async ensureDir(dir: string): Promise<void> {
    try {
      await fs.promises.mkdir(dir, { recursive: true });
    } catch (error) {
      // Directory might already exist
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
        throw error;
      }
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): FileExportConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<FileExportConfig>): void {
    this.config = { ...this.config, ...updates };
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/**
 * Create a FileExporter instance
 */
export function createFileExporter(
  config: Partial<FileExportConfig>,
  exportFunction: (session: ThinkingSession, format: ExportFormatType) => string
): FileExporter {
  return new FileExporter(config, exportFunction);
}
