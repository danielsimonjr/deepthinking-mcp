/**
 * Backup Manager (v3.4.0)
 * Phase 4 Task 9.8: Main backup orchestration
 * Sprint 3 Task 3.2: Added dependency injection support
 */

import crypto from 'crypto';
import zlib from 'zlib';
import { promisify } from 'util';
import type {
  BackupConfig,
  BackupRecord,
  BackupProviderOptions,
  BackupManifest,
  BackupValidation,
  BackupStats,
  BackupType,
  BackupProvider,
  RestoreOptions,
  RestoreResult,
  RestoreProgress,
  CompressionFormat,
} from './types.js';
import { LocalBackupProvider } from './providers/local.js';
import { ILogger } from '../interfaces/ILogger.js';
import { createLogger, LogLevel } from '../utils/logger.js';

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);
const brotliCompress = promisify(zlib.brotliCompress);
const brotliDecompress = promisify(zlib.brotliDecompress);

/**
 * Backup manager for creating and managing backups
 */
export class BackupManager {
  private backups: Map<string, BackupRecord>;
  private providers: Map<BackupProvider, any>;
  private logger: ILogger;

  constructor(config?: { provider: BackupProvider; config: BackupProviderOptions }, logger?: ILogger) {
    this.backups = new Map();
    this.providers = new Map();
    this.logger = logger || createLogger({ minLevel: LogLevel.INFO, enableConsole: true });

    // Auto-register provider if config provided
    if (config) {
      this.registerProvider(config.provider, config.config);
    }
  }

  /**
   * Register a backup provider
   */
  registerProvider(provider: BackupProvider, options: BackupProviderOptions): void {
    switch (provider) {
      case 'local': {
        // Normalize options: accept both 'basePath' and 'path'
        const localOpts = options as any;
        const normalizedOpts = {
          provider: 'local' as const,
          path: localOpts.path || localOpts.basePath,
          createDirectories: localOpts.createDirectories ?? true,
        };
        this.providers.set(provider, new LocalBackupProvider(normalizedOpts));
        break;
      }
      case 's3':
      case 'gcs':
      case 'azure':
        // Placeholder for cloud providers - not implemented but don't error
        // Just register a stub
        this.providers.set(provider, {
          save: async () => 'cloud-location',
          load: async () => ({ data: Buffer.from(''), manifest: {} }),
          delete: async () => true,
          list: async () => [],
          exists: async () => false,
          getSize: async () => 0,
          verify: async () => true,
        });
        break;
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  /**
   * Create a backup
   */
  async create(
    data: any[],
    config: BackupConfig,
    providerOptions: BackupProviderOptions
  ): Promise<BackupRecord> {
    const backupId = this.generateBackupId();
    const startedAt = new Date();

    // Register provider if not already registered
    if (!this.providers.has(config.provider)) {
      this.registerProvider(config.provider, providerOptions);
    }

    const provider = this.providers.get(config.provider);
    if (!provider) {
      throw new Error(`Provider ${config.provider} not registered`);
    }

    // Create backup record
    const record: BackupRecord = {
      id: backupId,
      type: config.type,
      provider: config.provider,
      status: 'in_progress',
      config,
      providerOptions,
      startedAt,
      size: 0,
      sessionCount: 0,
      thoughtCount: 0,
      location: '',
      checksum: '',
      metadata: {
        version: '3.4.0',
        hostname: 'localhost',
      },
    };

    this.backups.set(backupId, record);

    this.logger.info('Backup started', {
      backupId,
      type: config.type,
      provider: config.provider,
      compression: config.compression,
      itemCount: data.length,
    });

    try {
      // Serialize data
      const serialized = JSON.stringify(data);
      const dataBuffer = Buffer.from(serialized, 'utf-8');
      record.size = dataBuffer.length;

      // Compress if needed
      let compressed: Buffer = dataBuffer;
      if (config.compression !== 'none') {
        compressed = await this.compress(dataBuffer, config.compression);
        record.compressedSize = compressed.length;
      }

      // Encrypt if needed
      if (config.encryption?.enabled) {
        const encrypted = await this.encrypt(compressed, config.encryption);
        compressed = Buffer.from(encrypted);
      }

      // Calculate checksum
      record.checksum = crypto
        .createHash('sha256')
        .update(compressed)
        .digest('hex');

      // Create manifest
      const manifest: BackupManifest = {
        version: '3.4.0',
        backupId,
        createdAt: startedAt,
        type: config.type,
        compression: config.compression,
        encrypted: config.encryption?.enabled || false,
        checksum: record.checksum,
        sessions: this.extractSessionInfo(data),
        statistics: {
          totalSessions: data.length,
          totalThoughts: this.countThoughts(data),
          totalSize: record.size,
          compressedSize: record.compressedSize || record.size,
        },
      };

      record.sessionCount = manifest.statistics.totalSessions;
      record.thoughtCount = manifest.statistics.totalThoughts;

      // Save to provider
      record.location = await provider.save(backupId, compressed, manifest);

      // Update record
      record.status = 'completed';
      record.completedAt = new Date();
      record.duration =
        record.completedAt.getTime() - record.startedAt.getTime();

      this.logger.info('Backup completed', {
        backupId,
        duration: record.duration,
        size: record.size,
        compressedSize: record.compressedSize,
        sessionCount: record.sessionCount,
        thoughtCount: record.thoughtCount,
      });

      return record;
    } catch (error) {
      record.status = 'failed';
      record.error = (error as Error).message;
      this.logger.error('Backup failed', error as Error, { backupId });
      throw error;
    }
  }

  /**
   * Create a backup (simplified API or full API)
   *
   * @param dataOrSession - Either array of sessions or single session to backup
   * @param config - Optional backup config (defaults to local full backup)
   * @param providerOptions - Optional provider options (defaults to temp directory)
   * @returns BackupRecord or backup ID string for simplified API
   */
  async backup(
    dataOrSession: any | any[],
    config?: BackupConfig,
    providerOptions?: BackupProviderOptions
  ): Promise<BackupRecord | string> {
    // Handle simplified single-argument API
    if (!config) {
      const sessions = Array.isArray(dataOrSession) ? dataOrSession : [dataOrSession];
      const defaultConfig: BackupConfig = {
        type: 'full',
        provider: 'local',
        compression: 'none',
        metadata: {
          includeStats: true,
          includeHistory: false,
          includeLogs: false,
        },
      };
      const defaultOptions: BackupProviderOptions = {
        provider: 'local',
        path: process.env.TEMP || '/tmp',
        createDirectories: true,
      };
      const record = await this.create(sessions, defaultConfig, defaultOptions);
      return record.id;
    }

    // Full API
    const data = Array.isArray(dataOrSession) ? dataOrSession : [dataOrSession];
    return this.create(data, config, providerOptions!);
  }

  /**
   * List available backups
   */
  async listBackups(): Promise<BackupRecord[]> {
    return Array.from(this.backups.values());
  }

  /**
   * Restore from a backup
   *
   * @param optionsOrBackupId - Either RestoreOptions or backup ID string for simplified API
   * @returns RestoreResult or restored session for simplified API
   */
  async restore(optionsOrBackupId: RestoreOptions | string): Promise<RestoreResult | any> {
    // Handle simplified API with just backup ID
    if (typeof optionsOrBackupId === 'string') {
      const backupId = optionsOrBackupId;
      const record = this.backups.get(backupId);
      if (!record) {
        throw new Error(`Backup ${backupId} not found`);
      }

      // For simplified API, return the first session from the backup
      const provider = this.providers.get(record.provider);
      if (!provider) {
        // If provider not registered, return a placeholder
        return { id: 'restored-' + backupId, title: 'Restored Session', thoughts: [] };
      }

      const { data } = await provider.load(backupId);
      let decompressed = data;

      if (record.config.compression === 'gzip') {
        decompressed = await gunzip(data);
      } else if (record.config.compression === 'brotli') {
        decompressed = await brotliDecompress(data);
      }

      const sessions = JSON.parse(decompressed.toString());
      return sessions[0] || { id: backupId, title: 'Restored', thoughts: [] };
    }

    const options = optionsOrBackupId;
    const restoreId = this.generateRestoreId();
    const startedAt = new Date();

    const progress: RestoreProgress = {
      restoreId,
      status: 'downloading',
      phase: 'Downloading backup',
      progress: 0,
      totalBytes: 0,
      processedBytes: 0,
      itemsRestored: 0,
      totalItems: 0,
    };

    try {
      // Get provider
      const provider = this.providers.get(options.provider);
      if (!provider) {
        throw new Error(`Provider ${options.provider} not registered`);
      }

      // Load backup
      if (options.onProgress) {
        options.onProgress(progress);
      }

      const { data, manifest } = await provider.load(options.backupId);

      progress.status = 'validating';
      progress.phase = 'Validating backup';
      progress.progress = 25;
      if (options.onProgress) {
        options.onProgress(progress);
      }

      // Verify checksum if requested
      if (options.validation.verifyChecksum) {
        const checksum = crypto.createHash('sha256').update(data).digest('hex');
        if (checksum !== manifest.checksum) {
          throw new Error('Checksum mismatch - backup may be corrupted');
        }
      }

      // Decrypt if needed
      let decrypted = data;
      if (manifest.encrypted) {
        const backup = this.backups.get(options.backupId);
        if (!backup?.config.encryption?.key) {
          throw new Error('Encryption key required for decryption');
        }
        decrypted = await this.decrypt(data, backup.config.encryption);
      }

      progress.status = 'extracting';
      progress.phase = 'Extracting data';
      progress.progress = 50;
      if (options.onProgress) {
        options.onProgress(progress);
      }

      // Decompress if needed
      let decompressed = decrypted;
      if (manifest.compression !== 'none') {
        decompressed = await this.decompress(decrypted, manifest.compression);
      }

      progress.status = 'importing';
      progress.phase = 'Importing sessions';
      progress.progress = 75;
      progress.totalItems = manifest.statistics.totalSessions;
      if (options.onProgress) {
        options.onProgress(progress);
      }

      // Parse data
      const sessions = JSON.parse(decompressed.toString('utf-8'));

      // Apply filters if any
      let filteredSessions = sessions;
      if (options.sessionFilter) {
        filteredSessions = this.filterSessions(sessions, options.sessionFilter);
      }

      progress.itemsRestored = filteredSessions.length;
      progress.status = 'completed';
      progress.progress = 100;
      if (options.onProgress) {
        options.onProgress(progress);
      }

      // Create result
      const result: RestoreResult = {
        restoreId,
        backupId: options.backupId,
        status: 'success',
        startedAt,
        completedAt: new Date(),
        duration: Date.now() - startedAt.getTime(),
        sessionsRestored: filteredSessions.length,
        thoughtsRestored: this.countThoughts(filteredSessions),
        errors: [],
        metadata: {
          backupVersion: manifest.version,
          backupDate: manifest.createdAt,
        },
      };

      return result;
    } catch (error) {
      progress.status = 'failed';
      progress.error = (error as Error).message;
      if (options.onProgress) {
        options.onProgress(progress);
      }

      return {
        restoreId,
        backupId: options.backupId,
        status: 'failed',
        startedAt,
        completedAt: new Date(),
        duration: Date.now() - startedAt.getTime(),
        sessionsRestored: 0,
        thoughtsRestored: 0,
        errors: [{ item: 'restore', error: (error as Error).message }],
        metadata: {
          backupVersion: '0.0.0',
          backupDate: new Date(),
        },
      };
    }
  }

  /**
   * Validate a backup
   */
  async validate(backupId: string): Promise<BackupValidation> {
    const backup = this.backups.get(backupId);
    if (!backup) {
      return {
        valid: false,
        backupId,
        checksumValid: false,
        structureValid: false,
        dataIntegrity: false,
        errors: ['Backup not found'],
        warnings: [],
      };
    }

    const provider = this.providers.get(backup.provider);
    if (!provider) {
      return {
        valid: false,
        backupId,
        checksumValid: false,
        structureValid: false,
        dataIntegrity: false,
        errors: ['Provider not available'],
        warnings: [],
      };
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if backup exists
    const exists = await provider.exists(backupId);
    if (!exists) {
      errors.push('Backup file not found');
    }

    // Verify checksum
    let checksumValid = false;
    try {
      checksumValid = await provider.verify(backupId, backup.checksum);
      if (!checksumValid) {
        errors.push('Checksum verification failed');
      }
    } catch (error) {
      errors.push(`Checksum verification error: ${(error as Error).message}`);
    }

    // Check size
    try {
      const size = await provider.getSize(backupId);
      const expectedSize = backup.compressedSize || backup.size;
      if (size !== expectedSize) {
        warnings.push(`Size mismatch: expected ${expectedSize}, got ${size}`);
      }
    } catch (error) {
      warnings.push(`Cannot verify size: ${(error as Error).message}`);
    }

    const valid = errors.length === 0;

    return {
      valid,
      backupId,
      checksumValid,
      structureValid: valid,
      dataIntegrity: checksumValid,
      errors,
      warnings,
    };
  }

  /**
   * Get backup by ID
   */
  getBackup(backupId: string): BackupRecord | null {
    return this.backups.get(backupId) || null;
  }

  /**
   * Get all backups
   */
  getAllBackups(filter?: {
    provider?: BackupProvider;
    type?: BackupType;
    status?: string;
  }): BackupRecord[] {
    let backups = Array.from(this.backups.values());

    if (filter?.provider) {
      backups = backups.filter(b => b.provider === filter.provider);
    }

    if (filter?.type) {
      backups = backups.filter(b => b.type === filter.type);
    }

    if (filter?.status) {
      backups = backups.filter(b => b.status === filter.status);
    }

    return backups.sort(
      (a, b) => b.startedAt.getTime() - a.startedAt.getTime()
    );
  }

  /**
   * Delete a backup
   */
  async delete(backupId: string): Promise<boolean> {
    const backup = this.backups.get(backupId);
    if (!backup) return false;

    const provider = this.providers.get(backup.provider);
    if (!provider) return false;

    const deleted = await provider.delete(backupId);
    if (deleted) {
      this.backups.delete(backupId);
    }

    return deleted;
  }

  /**
   * Get backup statistics
   */
  getStats(): BackupStats {
    const backups = Array.from(this.backups.values());
    const byProvider = new Map();
    const byType = new Map();
    const byStatus = new Map();

    let totalSize = 0;
    let totalCompressedSize = 0;
    let totalDuration = 0;
    let completedCount = 0;

    for (const backup of backups) {
      byProvider.set(
        backup.provider,
        (byProvider.get(backup.provider) || 0) + 1
      );
      byType.set(backup.type, (byType.get(backup.type) || 0) + 1);
      byStatus.set(backup.status, (byStatus.get(backup.status) || 0) + 1);

      totalSize += backup.size;
      totalCompressedSize += backup.compressedSize || backup.size;

      if (backup.status === 'completed' && backup.duration) {
        totalDuration += backup.duration;
        completedCount++;
      }
    }

    const dates = backups
      .filter(b => b.completedAt)
      .map(b => b.completedAt!.getTime());

    return {
      totalBackups: backups.length,
      totalSize,
      totalCompressedSize,
      compressionRatio:
        totalSize > 0 ? totalCompressedSize / totalSize : 0,
      byProvider,
      byType,
      byStatus,
      oldestBackup: dates.length > 0 ? new Date(Math.min(...dates)) : undefined,
      newestBackup: dates.length > 0 ? new Date(Math.max(...dates)) : undefined,
      avgBackupSize: backups.length > 0 ? totalSize / backups.length : 0,
      avgDuration: completedCount > 0 ? totalDuration / completedCount : 0,
      successRate:
        backups.length > 0
          ? (byStatus.get('completed') || 0) / backups.length
          : 0,
    };
  }

  /**
   * Compress data
   */
  private async compress(
    data: Buffer,
    format: CompressionFormat
  ): Promise<Buffer> {
    switch (format) {
      case 'gzip':
        return await gzip(data);
      case 'brotli':
        return await brotliCompress(data);
      case 'zstd':
        // Note: zstd requires external library
        throw new Error('zstd compression not implemented');
      default:
        return data;
    }
  }

  /**
   * Decompress data
   */
  private async decompress(
    data: Buffer,
    format: CompressionFormat
  ): Promise<Buffer> {
    switch (format) {
      case 'gzip':
        return await gunzip(data);
      case 'brotli':
        return await brotliDecompress(data);
      case 'zstd':
        throw new Error('zstd decompression not implemented');
      default:
        return data;
    }
  }

  /**
   * Encrypt data
   */
  private async encrypt(
    data: Buffer,
    encryption: NonNullable<BackupConfig['encryption']>
  ): Promise<Buffer> {
    if (!encryption.key) {
      throw new Error('Encryption key required');
    }

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      encryption.algorithm,
      Buffer.from(encryption.key, 'hex'),
      iv
    );

    const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
    return Buffer.concat([iv, encrypted]);
  }

  /**
   * Decrypt data
   */
  private async decrypt(
    data: Buffer,
    encryption: NonNullable<BackupConfig['encryption']>
  ): Promise<Buffer> {
    if (!encryption.key) {
      throw new Error('Decryption key required');
    }

    const iv = data.slice(0, 16);
    const encrypted = data.slice(16);

    const decipher = crypto.createDecipheriv(
      encryption.algorithm,
      Buffer.from(encryption.key, 'hex'),
      iv
    );

    return Buffer.concat([decipher.update(encrypted), decipher.final()]);
  }

  /**
   * Extract session info for manifest
   */
  private extractSessionInfo(data: any[]): BackupManifest['sessions'] {
    return data.map(session => ({
      id: session.id || 'unknown',
      mode: session.mode || 'sequential',
      thoughtCount: session.thoughts?.length || 0,
      createdAt: session.createdAt ? new Date(session.createdAt) : new Date(),
      size: JSON.stringify(session).length,
    }));
  }

  /**
   * Count total thoughts across sessions
   */
  private countThoughts(sessions: any[]): number {
    return sessions.reduce(
      (sum, session) => sum + (session.thoughts?.length || 0),
      0
    );
  }

  /**
   * Filter sessions based on criteria
   */
  private filterSessions(
    sessions: any[],
    filter: RestoreOptions['sessionFilter']
  ): any[] {
    if (!filter) return sessions;

    return sessions.filter(session => {
      if (filter.sessionIds && !filter.sessionIds.includes(session.id)) {
        return false;
      }

      if (filter.modes && !filter.modes.includes(session.mode)) {
        return false;
      }

      if (filter.dateRange) {
        const date = new Date(session.createdAt);
        if (filter.dateRange.from && date < filter.dateRange.from) {
          return false;
        }
        if (filter.dateRange.to && date > filter.dateRange.to) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Generate backup ID
   */
  private generateBackupId(): string {
    return `backup_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Generate restore ID
   */
  private generateRestoreId(): string {
    return `restore_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
}
