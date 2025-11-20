/**
 * Backup and Restore System Types (v3.4.0)
 * Phase 4 Task 9.8: Multi-provider backup system
 */

/**
 * Backup storage provider types
 */
export type BackupProvider = 'local' | 's3' | 'gcs' | 'azure';

/**
 * Backup status
 */
export type BackupStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'cancelled';

/**
 * Backup type
 */
export type BackupType = 'full' | 'incremental' | 'differential';

/**
 * Compression format
 */
export type CompressionFormat = 'none' | 'gzip' | 'brotli' | 'zstd';

/**
 * Backup configuration
 */
export interface BackupConfig {
  provider: BackupProvider;
  type: BackupType;
  compression: CompressionFormat;
  encryption?: {
    enabled: boolean;
    algorithm: 'aes-256-gcm' | 'aes-256-cbc';
    key?: string;
  };
  retention?: {
    maxBackups: number;
    maxAgeDays: number;
    minBackups: number;
  };
  schedule?: {
    enabled: boolean;
    cron: string;
    timezone: string;
  };
  metadata: {
    includeStats: boolean;
    includeHistory: boolean;
    includeLogs: boolean;
  };
}

/**
 * Local file system backup options
 */
export interface LocalBackupOptions {
  provider: 'local';
  path: string;
  createDirectories: boolean;
}

/**
 * AWS S3 backup options
 */
export interface S3BackupOptions {
  provider: 's3';
  bucket: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  prefix?: string;
  storageClass?: 'STANDARD' | 'STANDARD_IA' | 'GLACIER' | 'GLACIER_IR';
  serverSideEncryption?: boolean;
}

/**
 * Google Cloud Storage backup options
 */
export interface GCSBackupOptions {
  provider: 'gcs';
  bucket: string;
  projectId: string;
  keyFilename?: string;
  credentials?: any;
  prefix?: string;
  storageClass?: 'STANDARD' | 'NEARLINE' | 'COLDLINE' | 'ARCHIVE';
}

/**
 * Azure Blob Storage backup options
 */
export interface AzureBackupOptions {
  provider: 'azure';
  containerName: string;
  accountName: string;
  accountKey: string;
  connectionString?: string;
  prefix?: string;
  tier?: 'Hot' | 'Cool' | 'Archive';
}

/**
 * Union type of all backup options
 */
export type BackupProviderOptions =
  | LocalBackupOptions
  | S3BackupOptions
  | GCSBackupOptions
  | AzureBackupOptions;

/**
 * Backup record
 */
export interface BackupRecord {
  id: string;
  type: BackupType;
  provider: BackupProvider;
  status: BackupStatus;
  config: BackupConfig;
  providerOptions: BackupProviderOptions;
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  size: number;
  compressedSize?: number;
  sessionCount: number;
  thoughtCount: number;
  location: string;
  checksum: string;
  error?: string;
  metadata: {
    version: string;
    hostname: string;
    userId?: string;
  };
}

/**
 * Restore options
 */
export interface RestoreOptions {
  backupId: string;
  provider: BackupProvider;
  providerOptions: BackupProviderOptions;
  overwrite: boolean;
  sessionFilter?: {
    sessionIds?: string[];
    modes?: string[];
    dateRange?: { from: Date; to: Date };
  };
  validation: {
    verifyChecksum: boolean;
    verifyIntegrity: boolean;
  };
  onProgress?: (progress: RestoreProgress) => void;
}

/**
 * Restore progress
 */
export interface RestoreProgress {
  restoreId: string;
  status: 'downloading' | 'extracting' | 'validating' | 'importing' | 'completed' | 'failed';
  phase: string;
  progress: number;
  totalBytes: number;
  processedBytes: number;
  itemsRestored: number;
  totalItems: number;
  currentItem?: string;
  error?: string;
}

/**
 * Restore result
 */
export interface RestoreResult {
  restoreId: string;
  backupId: string;
  status: 'success' | 'partial' | 'failed';
  startedAt: Date;
  completedAt: Date;
  duration: number;
  sessionsRestored: number;
  thoughtsRestored: number;
  errors: Array<{
    item: string;
    error: string;
  }>;
  metadata: {
    backupVersion: string;
    backupDate: Date;
  };
}

/**
 * Backup manifest (stored with backup)
 */
export interface BackupManifest {
  version: string;
  backupId: string;
  createdAt: Date;
  type: BackupType;
  compression: CompressionFormat;
  encrypted: boolean;
  checksum: string;
  sessions: Array<{
    id: string;
    mode: string;
    thoughtCount: number;
    createdAt: Date;
    size: number;
  }>;
  statistics: {
    totalSessions: number;
    totalThoughts: number;
    totalSize: number;
    compressedSize: number;
  };
}

/**
 * Backup validation result
 */
export interface BackupValidation {
  valid: boolean;
  backupId: string;
  checksumValid: boolean;
  structureValid: boolean;
  dataIntegrity: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Backup statistics
 */
export interface BackupStats {
  totalBackups: number;
  totalSize: number;
  totalCompressedSize: number;
  compressionRatio: number;
  byProvider: Map<BackupProvider, number>;
  byType: Map<BackupType, number>;
  byStatus: Map<BackupStatus, number>;
  oldestBackup?: Date;
  newestBackup?: Date;
  avgBackupSize: number;
  avgDuration: number;
  successRate: number;
}

/**
 * Backup job queue item
 */
export interface BackupJob {
  id: string;
  config: BackupConfig;
  providerOptions: BackupProviderOptions;
  priority: number;
  status: 'queued' | 'running' | 'completed' | 'failed';
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  progress: number;
  error?: string;
}

/**
 * Incremental backup metadata
 */
export interface IncrementalBackupMetadata {
  backupId: string;
  baseBackupId: string;
  changedSessions: string[];
  newSessions: string[];
  deletedSessions: string[];
  lastBackupDate: Date;
}
