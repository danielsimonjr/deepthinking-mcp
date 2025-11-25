/**
 * Azure Blob Storage Backup Provider (v3.4.0)
 * Sprint 4 Task 4.3: Full Azure backup implementation with dynamic SDK loading
 */

import crypto from 'crypto';
import type { AzureBackupOptions, BackupManifest } from '../types.js';

// Azure SDK types (optional dependency)
type BlobServiceClient = any;

/**
 * Azure Blob Storage backup provider
 * Requires @azure/storage-blob to be installed for production use
 */
export class AzureBackupProvider {
  private options: AzureBackupOptions;
  private blobServiceClient: BlobServiceClient | null = null;

  constructor(options: AzureBackupOptions) {
    this.options = options;
  }

  /**
   * Initialize Azure client (lazy loading)
   */
  private async initializeClient(): Promise<void> {
    if (this.blobServiceClient) return;

    try {
      // Try to dynamically import Azure SDK
      // @ts-expect-error - Optional dependency loaded dynamically
      const { BlobServiceClient: BlobServiceClientClass } = await import('@azure/storage-blob');

      this.blobServiceClient = BlobServiceClientClass.fromConnectionString(
        this.options.connectionString || ''
      );
    } catch (error) {
      throw new Error(
        'Azure SDK (@azure/storage-blob) is not installed. ' +
        'Install it with: npm install @azure/storage-blob'
      );
    }
  }

  /**
   * Get container client
   */
  private getContainerClient() {
    if (!this.blobServiceClient) {
      throw new Error('Azure client not initialized');
    }
    return this.blobServiceClient.getContainerClient(this.options.containerName);
  }

  /**
   * Save backup to Azure Blob Storage
   */
  async save(
    backupId: string,
    data: Buffer,
    manifest: BackupManifest
  ): Promise<string> {
    await this.initializeClient();

    const blobName = `${this.options.prefix || 'backups'}/${backupId}.backup`;
    const manifestBlobName = `${this.options.prefix || 'backups'}/${backupId}.manifest.json`;

    try {
      const containerClient = this.getContainerClient();

      // Ensure container exists
      await containerClient.createIfNotExists();

      // Upload backup data
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      await blockBlobClient.upload(data, data.length, {
        blobHTTPHeaders: {
          blobContentType: 'application/octet-stream',
        },
        metadata: {
          backupId,
          version: manifest.version.toString(),
          timestamp: manifest.createdAt.toISOString(),
        },
        tier: this.options.tier || 'Hot',
      });

      // Upload manifest
      const manifestBlobClient = containerClient.getBlockBlobClient(manifestBlobName);
      const manifestData = Buffer.from(JSON.stringify(manifest, null, 2));
      await manifestBlobClient.upload(manifestData, manifestData.length, {
        blobHTTPHeaders: {
          blobContentType: 'application/json',
        },
      });

      const location = `https://${this.options.accountName}.blob.core.windows.net/${this.options.containerName}/${blobName}`;
      return location;
    } catch (error) {
      throw new Error(
        `Failed to save backup to Azure: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Load backup from Azure Blob Storage
   */
  async load(backupId: string): Promise<{
    data: Buffer;
    manifest: BackupManifest;
  }> {
    await this.initializeClient();

    const blobName = `${this.options.prefix || 'backups'}/${backupId}.backup`;
    const manifestBlobName = `${this.options.prefix || 'backups'}/${backupId}.manifest.json`;

    try {
      const containerClient = this.getContainerClient();

      // Download backup data
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      const downloadResponse = await blockBlobClient.download(0);
      const data = await this.streamToBuffer(downloadResponse.readableStreamBody!);

      // Download manifest
      const manifestBlobClient = containerClient.getBlockBlobClient(manifestBlobName);
      const manifestResponse = await manifestBlobClient.download(0);
      const manifestText = await this.streamToBuffer(manifestResponse.readableStreamBody!);
      const manifest = JSON.parse(manifestText.toString('utf-8'));

      return { data, manifest };
    } catch (error) {
      throw new Error(
        `Failed to load backup from Azure: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Delete backup from Azure Blob Storage
   */
  async delete(backupId: string): Promise<boolean> {
    await this.initializeClient();

    const blobName = `${this.options.prefix || 'backups'}/${backupId}.backup`;
    const manifestBlobName = `${this.options.prefix || 'backups'}/${backupId}.manifest.json`;

    try {
      const containerClient = this.getContainerClient();

      // Delete backup data
      await containerClient.deleteBlob(blobName);

      // Delete manifest
      await containerClient.deleteBlob(manifestBlobName);

      return true;
    } catch (error) {
      console.error(`Failed to delete backup from Azure: ${error}`);
      return false;
    }
  }

  /**
   * List all backups in Azure Blob Storage
   */
  async list(): Promise<BackupManifest[]> {
    await this.initializeClient();

    const prefix = `${this.options.prefix || 'backups'}/`;

    try {
      const containerClient = this.getContainerClient();
      const manifests: BackupManifest[] = [];

      // List all blobs
      for await (const blob of containerClient.listBlobsFlat({ prefix })) {
        if (blob.name.endsWith('.manifest.json')) {
          try {
            const blobClient = containerClient.getBlockBlobClient(blob.name);
            const downloadResponse = await blobClient.download(0);
            const manifestText = await this.streamToBuffer(downloadResponse.readableStreamBody!);
            manifests.push(JSON.parse(manifestText.toString('utf-8')));
          } catch {
            // Skip invalid manifests
          }
        }
      }

      return manifests;
    } catch (error) {
      throw new Error(
        `Failed to list backups from Azure: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Check if backup exists in Azure Blob Storage
   */
  async exists(backupId: string): Promise<boolean> {
    await this.initializeClient();

    const blobName = `${this.options.prefix || 'backups'}/${backupId}.backup`;

    try {
      const containerClient = this.getContainerClient();
      const blobClient = containerClient.getBlockBlobClient(blobName);
      return await blobClient.exists();
    } catch {
      return false;
    }
  }

  /**
   * Get backup size
   */
  async getSize(backupId: string): Promise<number> {
    await this.initializeClient();

    const blobName = `${this.options.prefix || 'backups'}/${backupId}.backup`;

    try {
      const containerClient = this.getContainerClient();
      const blobClient = containerClient.getBlockBlobClient(blobName);
      const properties = await blobClient.getProperties();
      return properties.contentLength || 0;
    } catch (error) {
      throw new Error(
        `Failed to get backup size from Azure: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Verify backup integrity
   */
  async verify(backupId: string, expectedChecksum: string): Promise<boolean> {
    await this.initializeClient();

    const blobName = `${this.options.prefix || 'backups'}/${backupId}.backup`;

    try {
      const containerClient = this.getContainerClient();
      const blobClient = containerClient.getBlockBlobClient(blobName);
      const downloadResponse = await blobClient.download(0);
      const data = await this.streamToBuffer(downloadResponse.readableStreamBody!);
      const checksum = crypto.createHash('sha256').update(data).digest('hex');

      return checksum === expectedChecksum;
    } catch (error) {
      throw new Error(
        `Failed to verify backup from Azure: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Helper: Convert stream to buffer
   */
  private async streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
    const chunks: Buffer[] = [];

    return new Promise((resolve, reject) => {
      stream.on('data', (chunk: Buffer) => chunks.push(chunk));
      stream.on('error', reject);
      stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }
}
