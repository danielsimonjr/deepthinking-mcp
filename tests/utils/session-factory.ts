/**
 * Session Factory - Test Utilities for Phase 11
 *
 * Factory functions for creating test sessions with various configurations.
 * Provides consistent session creation across all test files.
 */

import { SessionManager } from '../../src/session/manager.js';
import { ThinkingMode } from '../../src/types/core.js';
import type { ThinkingSession } from '../../src/types/index.js';

/**
 * Session factory options
 */
export interface SessionFactoryOptions {
  mode?: ThinkingMode;
  title?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Default session options
 */
const defaultOptions: Required<SessionFactoryOptions> = {
  mode: ThinkingMode.SEQUENTIAL,
  title: 'Test Session',
  metadata: {},
};

/**
 * Create a fresh SessionManager instance for testing
 */
export function createTestSessionManager(): SessionManager {
  return new SessionManager();
}

/**
 * Create a test session with the given options
 */
export async function createTestSession(
  manager: SessionManager,
  options: SessionFactoryOptions = {}
): Promise<ThinkingSession> {
  const opts = { ...defaultOptions, ...options };
  return manager.createSession({
    mode: opts.mode,
    title: opts.title,
  });
}

/**
 * Create a session with inductive mode
 */
export async function createInductiveSession(
  manager: SessionManager
): Promise<ThinkingSession> {
  return createTestSession(manager, {
    mode: ThinkingMode.INDUCTIVE,
    title: 'Inductive Reasoning Session',
  });
}

/**
 * Create a session with deductive mode
 */
export async function createDeductiveSession(
  manager: SessionManager
): Promise<ThinkingSession> {
  return createTestSession(manager, {
    mode: ThinkingMode.DEDUCTIVE,
    title: 'Deductive Reasoning Session',
  });
}

/**
 * Create a session with abductive mode
 */
export async function createAbductiveSession(
  manager: SessionManager
): Promise<ThinkingSession> {
  return createTestSession(manager, {
    mode: ThinkingMode.ABDUCTIVE,
    title: 'Abductive Reasoning Session',
  });
}

/**
 * Create multiple test sessions for batch testing
 */
export async function createMultipleSessions(
  manager: SessionManager,
  count: number,
  mode: ThinkingMode = ThinkingMode.SEQUENTIAL
): Promise<ThinkingSession[]> {
  const sessions: ThinkingSession[] = [];
  for (let i = 0; i < count; i++) {
    const session = await createTestSession(manager, {
      mode,
      title: `Test Session ${i + 1}`,
    });
    sessions.push(session);
  }
  return sessions;
}

/**
 * Generate a unique session ID for testing
 */
export function generateTestSessionId(): string {
  return `test-session-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}
