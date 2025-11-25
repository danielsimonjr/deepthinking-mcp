/**
 * Google Cloud Storage Backup Provider (v3.4.0)
 * Sprint 4 Task 4.3: Full GCS backup implementation with dynamic SDK loading
 */

import crypto from 'crypto';
import type { GCSBackupOptions, BackupManifest } from '../types.js';

// GCS SDK types (optional dependency)
type Storage = any;
type Bucket = any;

/**
 * Google Cloud Storage backup provider
 * Requires @google-cloud/storage to be installed for production use
 */
export class GCSBackupProvider {
  private options: GCSBackupOptions;
  private storage: Storage | null = null;

  constructor(options: GCSBackupOptions) {
    this.options = options;
  }

  /**
   * Initialize GCS client (lazy loading)
   */
  private async initializeClient(): Promise<void> {
    if (this.storage) return;

    try {
      // Try to dynamically import GCS SDK
      // @ts-expect-error - Optional dependency loaded dynamically
      const { Storage: StorageClass } = await import('@google-cloud/storage');

      this.storage = new StorageClass({
        projectId: this.options.projectId,
        keyFilename: this.options.keyFilename,
      });
    } catch (error) {
      throw new Error(
        'Google Cloud Storage SDK (@google-cloud/storage) is not installed. ' +
        'Install it with: npm install @google-cloud/storage'
      );
    }
  }

  /**
   * Get bucket
   */
  private getBucket(): Bucket {
    if (!this.storage) {
      throw new Error('GCS client not initialized');
    }
    return this.storage.bucket(this.options.bucket);
  }

  /**
   * Save backup to GCS
   */
  async save(
    backupId: string,
    data: Buffer,
    manifest: BackupManifest
  ): Promise<string> {
    await this.initializeClient();

    const fileName = `${this.options.prefix || 'backups'}/${backupId}.backup`;
    const manifestFileName = `${this.options.prefix || 'backups'}/${backupId}.manifest.json`;

    try {
      const bucket = this.getBucket();

      // Upload backup data
      const file = bucket.file(fileName);
      await file.save(data, {
        metadata: {
          contentType: 'application/octet-stream',
          metadata: {
            backupId,
            version: manifest.version.toString(),
            timestamp: manifest.createdAt.toISOString(),
          },
        },
        ...(this.options.storageClass && {
          storageClass: this.options.storageClass,
        }),
      });

      // Upload manifest
      const manifestFile = bucket.file(manifestFileName);
      await manifestFile.save(JSON.stringify(manifest, null, 2), {
        metadata: {
          contentType: 'application/json',
        },
      });

      const location = `gs://${this.options.bucket}/${fileName}`;
      return location;
    } catch (error) {
      throw new Error(
        `Failed to save backup to GCS: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Load backup from GCS
   */
  async load(backupId: string): Promise<{
    data: Buffer;
    manifest: BackupManifest;
  }> {
    await this.initializeClient();

    const fileName = `${this.options.prefix || 'backups'}/${backupId}.backup`;
    const manifestFileName = `${this.options.prefix || 'backups'}/${backupId}.manifest.json`;

    try {
      const bucket = this.getBucket();

      // Download backup data
      const file = bucket.file(fileName);
      const [data] = await file.download();

      // Download manifest
      const manifestFile = bucket.file(manifestFileName);
      const [manifestData] = await manifestFile.download();
      const manifest = JSON.parse(manifestData.toString('utf-8'));

      return { data, manifest };
    } catch (error) {
      throw new Error(
        `Failed to load backup from GCS: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Delete backup from GCS
   */
  async delete(backupId: string): Promise<boolean> {
    await this.initializeClient();

    const fileName = `${this.options.prefix || 'backups'}/${backupId}.backup`;
    const manifestFileName = `${this.options.prefix || 'backups'}/${backupId}.manifest.json`;

    try {
      const bucket = this.getBucket();

      // Delete backup data
      await bucket.file(fileName).delete();

      // Delete manifest
      await bucket.file(manifestFileName).delete();

      return true;
    } catch (error) {
      console.error(`Failed to delete backup from GCS: ${error}`);
      return false;
    }
  }

  /**
   * List all backups in GCS
   */
  async list(): Promise<BackupManifest[]> {
    await this.initializeClient();

    const prefix = `${this.options.prefix || 'backups'}/`;

    try {
      const bucket = this.getBucket();
      const [files] = await bucket.getFiles({ prefix });

      const manifests: BackupManifest[] = [];

      for (const file of files) {
        if (file.name.endsWith('.manifest.json')) {
          try {
            const [data] = await file.download();
            manifests.push(JSON.parse(data.toString('utf-8')));
          } catch {
            // Skip invalid manifests
          }
        }
      }

      return manifests;
    } catch (error) {
      throw new Error(
        `Failed to list backups from GCS: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Check if backup exists in GCS
   */
  async exists(backupId: string): Promise<boolean> {
    await this.initializeClient();

    const fileName = `${this.options.prefix || 'backups'}/${backupId}.backup`;

    try {
      const bucket = this.getBucket();
      const file = bucket.file(fileName);
      const [exists] = await file.exists();
      return exists;
    } catch {
      return false;
    }
  }

  /**
   * Get backup size
   */
  async getSize(backupId: string): Promise<number> {
    await this.initializeClient();

    const fileName = `${this.options.prefix || 'backups'}/${backupId}.backup`;

    try {
      const bucket = this.getBucket();
      const file = bucket.file(fileName);
      const [metadata] = await file.getMetadata();
      return parseInt(metadata.size, 10) || 0;
    } catch (error) {
      throw new Error(
        `Failed to get backup size from GCS: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Verify backup integrity
   */
  async verify(backupId: string, expectedChecksum: string): Promise<boolean> {
    await this.initializeClient();

    const fileName = `${this.options.prefix || 'backups'}/${backupId}.backup`;

    try {
      const bucket = this.getBucket();
      const file = bucket.file(fileName);
      const [data] = await file.download();
      const checksum = crypto.createHash('sha256').update(data).digest('hex');

      return checksum === expectedChecksum;
    } catch (error) {
      throw new Error(
        `Failed to verify backup from GCS: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}
