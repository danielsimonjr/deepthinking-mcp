/**
 * Regression tests for 2026-08-03 audit finding M-5:
 *
 * FileSessionStore.initialize() previously let raw Node fs errors escape
 * uncaught. On Windows, a recursive mkdir() against a path whose drive
 * doesn't exist also truncates the reported path to the `\\?\` long-path
 * prefix (a Node/Windows quirk, reproduced manually against Node
 * v24.18.0: `mkdir('Z:\\nonexistent\\sessions', {recursive:true})` throws
 * `ENOENT: no such file or directory, mkdir '\\?'` — losing the actual
 * configured path entirely). Neither StorageError (src/utils/errors.ts) nor
 * any mention of SESSION_DIR was ever in the resulting client-facing error.
 *
 * See docs/audits/2026-08-03-audit.md, M-5.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as os from 'os';
import { randomUUID } from 'crypto';
import { FileSessionStore } from '../../src/session/storage/file-store.js';
import { StorageError } from '../../src/utils/errors.js';

describe('FileSessionStore.initialize() error handling (M-5)', () => {
  let scratchDir: string;

  beforeEach(async () => {
    scratchDir = path.join(os.tmpdir(), `deepthinking-m5-${randomUUID()}`);
    await fs.mkdir(scratchDir, { recursive: true });
  });

  afterEach(async () => {
    try {
      await fs.rm(scratchDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  it('wraps a mkdir failure in StorageError instead of leaking the raw fs error', async () => {
    // A path component that is a regular file (not a directory) makes any
    // recursive mkdir() underneath it fail identically across platforms
    // (ENOTDIR), without depending on a specific missing Windows drive
    // letter — a portable way to force the same class of initialize()
    // failure the audit's Z:\ repro hit.
    const blockingFile = path.join(scratchDir, 'this-is-a-file-not-a-dir');
    await fs.writeFile(blockingFile, 'blocker');

    const invalidBaseDir = path.join(blockingFile, 'sessions');
    const store = new FileSessionStore(invalidBaseDir);

    let caught: unknown;
    try {
      await store.initialize();
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(StorageError);
    const err = caught as StorageError;

    expect(err.code).toBe('STORAGE_ERROR');

    // The message must be actionable: mention SESSION_DIR (the only env var
    // that ever constructs a FileSessionStore, per src/index.ts) and the
    // real configured path — not a truncated `\\?\`-prefix garble.
    expect(err.message).toContain('SESSION_DIR');
    expect(err.message).toContain(invalidBaseDir);
    expect(err.message).not.toContain('\\\\?');

    // Context must carry the real, un-truncated path for programmatic
    // consumers/log aggregation, independent of whatever Node's error.path
    // happened to report.
    expect(err.context?.baseDir).toBe(invalidBaseDir);
  });

  it('still initializes normally for a valid, writable directory', async () => {
    const validDir = path.join(scratchDir, 'valid-sessions');
    const store = new FileSessionStore(validDir);
    await expect(store.initialize()).resolves.not.toThrow();
  });
});
