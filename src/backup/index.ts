/**
 * Backup and Restore System Exports (v3.4.0)
 * Phase 4 Task 9.8: Multi-provider backup system
 */

export { BackupManager } from './backup-manager.js';
export { LocalBackupProvider } from './providers/local.js';
export { S3BackupProvider } from './providers/s3.js';
export { GCSBackupProvider } from './providers/gcs.js';
export { AzureBackupProvider } from './providers/azure.js';

export type {
  BackupProvider,
  BackupStatus,
  BackupType,
  CompressionFormat,
  BackupConfig,
  LocalBackupOptions,
  S3BackupOptions,
  GCSBackupOptions,
  AzureBackupOptions,
  BackupProviderOptions,
  BackupRecord,
  RestoreOptions,
  RestoreProgress,
  RestoreResult,
  BackupManifest,
  BackupValidation,
  BackupStats,
  BackupJob,
  IncrementalBackupMetadata,
} from './types.js';
