/**
 * Regression tests for 2026-08-03 audit finding M-1/H-3 as it applies to
 * src/config/index.ts:
 *
 * - `maxActiveSessions` / `sessionTimeoutMs` are real, consumed knobs
 *   (see tests/unit/session-manager-remediation.test.ts for the consumer
 *   side in SessionManager).
 * - `maxThoughtsInMemory` / `compressionThreshold` on ServerConfig remain
 *   parsed and validated but are NOT enforced anywhere in `src/` (see the
 *   environment variable table in CLAUDE.md, which documents this
 *   explicitly as "Not enforced"). These tests pin the documented defaults
 *   so that table stays accurate.
 */

import { describe, it, expect, afterEach } from 'vitest';
import { getConfig, updateConfig, resetConfig, validateConfig } from '../../src/config/index.js';

describe('config/index audit remediations (M-1, H-3)', () => {
  afterEach(() => {
    resetConfig();
  });

  it('defaults maxActiveSessions to 100 (the documented MCP_MAX_SESSIONS default)', () => {
    resetConfig();
    expect(getConfig().maxActiveSessions).toBe(100);
  });

  it('defaults sessionTimeoutMs to 0 (no timeout)', () => {
    resetConfig();
    expect(getConfig().sessionTimeoutMs).toBe(0);
  });

  it('honors updateConfig for both real knobs', () => {
    updateConfig({ maxActiveSessions: 42, sessionTimeoutMs: 5000 });
    expect(getConfig().maxActiveSessions).toBe(42);
    expect(getConfig().sessionTimeoutMs).toBe(5000);
  });

  it('pins the documented (but unenforced) defaults for maxThoughtsInMemory / compressionThreshold', () => {
    resetConfig();
    expect(getConfig().maxThoughtsInMemory).toBe(1000);
    expect(getConfig().compressionThreshold).toBe(500);
  });

  it('validateConfig still passes for the current default configuration', () => {
    expect(() => validateConfig(getConfig() as any)).not.toThrow();
  });
});
