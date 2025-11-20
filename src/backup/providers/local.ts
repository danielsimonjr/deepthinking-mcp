/**
 * Local File System Backup Provider (v3.4.0)
 * Phase 4 Task 9.8: Local file system backup implementation
 */

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import type { LocalBackupOptions, BackupManifest } from '../types.js';

/**
 * Local file system backup provider
 */
export class LocalBackupProvider {
  private options: LocalBackupOptions;

  constructor(options: LocalBackupOptions) {
    this.options = options;
  }

  /**
   * Save backup to local file system
   */
  async save(
    backupId: string,
    data: Buffer,
    manifest: BackupManifest
  ): Promise<string> {
    const backupPath = path.join(this.options.path, `${backupId}.backup`);
    const manifestPath = path.join(this.options.path, `${backupId}.manifest.json`);

    // Create directories if needed
    if (this.options.createDirectories) {
      await fs.mkdir(this.options.path, { recursive: true });
    }

    // Write backup file
    await fs.writeFile(backupPath, data);

    // Write manifest
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));

    return backupPath;
  }

  /**
   * Load backup from local file system
   */
  async load(backupId: string): Promise<{
    data: Buffer;
    manifest: BackupManifest;
  }> {
    const backupPath = path.join(this.options.path, `${backupId}.backup`);
    const manifestPath = path.join(this.options.path, `${backupId}.manifest.json`);

    const data = await fs.readFile(backupPath);
    const manifestText = await fs.readFile(manifestPath, 'utf-8');
    const manifest = JSON.parse(manifestText);

    return { data, manifest };
  }

  /**
   * Delete backup from local file system
   */
  async delete(backupId: string): Promise<boolean> {
    try {
      const backupPath = path.join(this.options.path, `${backupId}.backup`);
      const manifestPath = path.join(this.options.path, `${backupId}.manifest.json`);

      await fs.unlink(backupPath);
      await fs.unlink(manifestPath);

      return true;
    } catch {
      return false;
    }
  }

  /**
   * List all backups
   */
  async list(): Promise<BackupManifest[]> {
    const files = await fs.readdir(this.options.path);
    const manifestFiles = files.filter(f => f.endsWith('.manifest.json'));

    const manifests: BackupManifest[] = [];

    for (const file of manifestFiles) {
      try {
        const manifestPath = path.join(this.options.path, file);
        const text = await fs.readFile(manifestPath, 'utf-8');
        manifests.push(JSON.parse(text));
      } catch {
        // Skip invalid manifests
      }
    }

    return manifests;
  }

  /**
   * Check if backup exists
   */
  async exists(backupId: string): Promise<boolean> {
    try {
      const backupPath = path.join(this.options.path, `${backupId}.backup`);
      await fs.access(backupPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get backup size
   */
  async getSize(backupId: string): Promise<number> {
    const backupPath = path.join(this.options.path, `${backupId}.backup`);
    const stats = await fs.stat(backupPath);
    return stats.size;
  }

  /**
   * Verify backup integrity
   */
  async verify(backupId: string, expectedChecksum: string): Promise<boolean> {
    const backupPath = path.join(this.options.path, `${backupId}.backup`);
    const data = await fs.readFile(backupPath);
    const checksum = crypto.createHash('sha256').update(data).digest('hex');
    return checksum === expectedChecksum;
  }
}
