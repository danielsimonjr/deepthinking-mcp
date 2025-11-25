/**
 * AWS S3 Backup Provider (v3.4.0)
 * Sprint 4 Task 4.3: Full S3 backup implementation with dynamic SDK loading
 */

import crypto from 'crypto';
import type { S3BackupOptions, BackupManifest } from '../types.js';

// AWS SDK types (optional dependency)
type S3Client = any;

/**
 * AWS S3 backup provider
 * Requires @aws-sdk/client-s3 to be installed for production use
 */
export class S3BackupProvider {
  private options: S3BackupOptions;
  private s3Client: S3Client | null = null;

  constructor(options: S3BackupOptions) {
    this.options = options;
  }

  /**
   * Initialize S3 client (lazy loading)
   */
  private async initializeClient(): Promise<void> {
    if (this.s3Client) return;

    try {
      // Try to dynamically import AWS SDK
      // @ts-expect-error - Optional dependency loaded dynamically
      const { S3Client: S3ClientClass } = await import('@aws-sdk/client-s3');

      this.s3Client = new S3ClientClass({
        region: this.options.region,
        credentials: {
          accessKeyId: this.options.accessKeyId,
          secretAccessKey: this.options.secretAccessKey,
        },
      });
    } catch (error) {
      throw new Error(
        'AWS SDK (@aws-sdk/client-s3) is not installed. ' +
        'Install it with: npm install @aws-sdk/client-s3'
      );
    }
  }

  /**
   * Save backup to S3
   */
  async save(
    backupId: string,
    data: Buffer,
    manifest: BackupManifest
  ): Promise<string> {
    await this.initializeClient();

    // @ts-expect-error - Optional dependency loaded dynamically
    const { PutObjectCommand: PutCmd } = await import('@aws-sdk/client-s3');

    const key = `${this.options.prefix || 'backups'}/${backupId}.backup`;
    const manifestKey = `${this.options.prefix || 'backups'}/${backupId}.manifest.json`;

    try {
      // Upload backup data
      await this.s3Client!.send(new PutCmd({
        Bucket: this.options.bucket,
        Key: key,
        Body: data,
        StorageClass: this.options.storageClass || 'STANDARD',
        ServerSideEncryption: this.options.serverSideEncryption ? 'AES256' : undefined,
        Metadata: {
          backupId,
          version: manifest.version.toString(),
          timestamp: manifest.createdAt.toISOString(),
        },
      }));

      // Upload manifest
      await this.s3Client!.send(new PutCmd({
        Bucket: this.options.bucket,
        Key: manifestKey,
        Body: JSON.stringify(manifest, null, 2),
        ContentType: 'application/json',
        ServerSideEncryption: this.options.serverSideEncryption ? 'AES256' : undefined,
      }));

      const location = `s3://${this.options.bucket}/${key}`;
      return location;
    } catch (error) {
      throw new Error(
        `Failed to save backup to S3: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Load backup from S3
   */
  async load(backupId: string): Promise<{
    data: Buffer;
    manifest: BackupManifest;
  }> {
    await this.initializeClient();

    // @ts-expect-error - Optional dependency loaded dynamically
    const { GetObjectCommand: GetCmd } = await import('@aws-sdk/client-s3');

    const key = `${this.options.prefix || 'backups'}/${backupId}.backup`;
    const manifestKey = `${this.options.prefix || 'backups'}/${backupId}.manifest.json`;

    try {
      // Download backup data
      const dataResponse = await this.s3Client!.send(new GetCmd({
        Bucket: this.options.bucket,
        Key: key,
      }));

      // Download manifest
      const manifestResponse = await this.s3Client!.send(new GetCmd({
        Bucket: this.options.bucket,
        Key: manifestKey,
      }));

      // Stream to buffer
      const data = await this.streamToBuffer(dataResponse.Body);
      const manifestText = await this.streamToBuffer(manifestResponse.Body);
      const manifest = JSON.parse(manifestText.toString('utf-8'));

      return { data, manifest };
    } catch (error) {
      throw new Error(
        `Failed to load backup from S3: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Delete backup from S3
   */
  async delete(backupId: string): Promise<boolean> {
    await this.initializeClient();

    // @ts-expect-error - Optional dependency loaded dynamically
    const { DeleteObjectCommand: DelCmd } = await import('@aws-sdk/client-s3');

    const key = `${this.options.prefix || 'backups'}/${backupId}.backup`;
    const manifestKey = `${this.options.prefix || 'backups'}/${backupId}.manifest.json`;

    try {
      // Delete backup data
      await this.s3Client!.send(new DelCmd({
        Bucket: this.options.bucket,
        Key: key,
      }));

      // Delete manifest
      await this.s3Client!.send(new DelCmd({
        Bucket: this.options.bucket,
        Key: manifestKey,
      }));

      return true;
    } catch (error) {
      console.error(`Failed to delete backup from S3: ${error}`);
      return false;
    }
  }

  /**
   * List all backups in S3
   */
  async list(): Promise<BackupManifest[]> {
    await this.initializeClient();

    // @ts-expect-error - Optional dependency loaded dynamically
    const { ListObjectsV2Command: ListCmd, GetObjectCommand: GetCmd } = await import('@aws-sdk/client-s3');

    const prefix = `${this.options.prefix || 'backups'}/`;

    try {
      // List all manifest files
      const response = await this.s3Client!.send(new ListCmd({
        Bucket: this.options.bucket,
        Prefix: prefix,
      }));

      const manifestKeys = (response.Contents || [])
        .map((obj: any) => obj.Key)
        .filter((key: string) => key.endsWith('.manifest.json'));

      // Download and parse all manifests
      const manifests: BackupManifest[] = [];

      for (const key of manifestKeys) {
        try {
          const manifestResponse = await this.s3Client!.send(new GetCmd({
            Bucket: this.options.bucket,
            Key: key,
          }));

          const manifestText = await this.streamToBuffer(manifestResponse.Body);
          manifests.push(JSON.parse(manifestText.toString('utf-8')));
        } catch {
          // Skip invalid manifests
        }
      }

      return manifests;
    } catch (error) {
      throw new Error(
        `Failed to list backups from S3: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Check if backup exists in S3
   */
  async exists(backupId: string): Promise<boolean> {
    await this.initializeClient();

    // @ts-expect-error - Optional dependency loaded dynamically
    const { HeadObjectCommand: HeadCmd } = await import('@aws-sdk/client-s3');

    const key = `${this.options.prefix || 'backups'}/${backupId}.backup`;

    try {
      await this.s3Client!.send(new HeadCmd({
        Bucket: this.options.bucket,
        Key: key,
      }));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get backup size
   */
  async getSize(backupId: string): Promise<number> {
    await this.initializeClient();

    // @ts-expect-error - Optional dependency loaded dynamically
    const { HeadObjectCommand: HeadCmd } = await import('@aws-sdk/client-s3');

    const key = `${this.options.prefix || 'backups'}/${backupId}.backup`;

    try {
      const response = await this.s3Client!.send(new HeadCmd({
        Bucket: this.options.bucket,
        Key: key,
      }));
      return response.ContentLength || 0;
    } catch (error) {
      throw new Error(
        `Failed to get backup size from S3: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Verify backup integrity
   */
  async verify(backupId: string, expectedChecksum: string): Promise<boolean> {
    await this.initializeClient();

    // @ts-expect-error - Optional dependency loaded dynamically
    const { GetObjectCommand: GetCmd } = await import('@aws-sdk/client-s3');

    const key = `${this.options.prefix || 'backups'}/${backupId}.backup`;

    try {
      const response = await this.s3Client!.send(new GetCmd({
        Bucket: this.options.bucket,
        Key: key,
      }));

      const data = await this.streamToBuffer(response.Body);
      const checksum = crypto.createHash('sha256').update(data).digest('hex');

      return checksum === expectedChecksum;
    } catch (error) {
      throw new Error(
        `Failed to verify backup from S3: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Helper: Convert stream to buffer
   */
  private async streamToBuffer(stream: any): Promise<Buffer> {
    const chunks: Buffer[] = [];

    return new Promise((resolve, reject) => {
      stream.on('data', (chunk: Buffer) => chunks.push(chunk));
      stream.on('error', reject);
      stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }
}
