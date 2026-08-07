/**
 * Regression guard: the multi-modal reasoning-flow analyser is wired into the
 * live request path.
 *
 * `src/taxonomy/multi-modal-analyzer.ts` was reachable only from the test
 * suite. The 2026-08-06 taxonomy wiring went through `recommend_mode`, which
 * takes a problem description rather than a session, so it had no use for a
 * session-level analyser. `deepthinking_session` action `summarize` does, and
 * `SessionManager.generateSummary()` is the single funnel it goes through.
 *
 * These tests fail the moment `generateSummary` stops invoking it.
 *
 * The report is ADVISORY: it is appended to the summary, and a failure costs
 * the section, never the summary.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SessionManager } from '../../../src/session/manager.js';
import { MultiModalAnalyzer } from '../../../src/taxonomy/multi-modal-analyzer.js';
import {
  MAX_FLOW_REPORT_CHARS,
  FLOW_TRUNCATION_MARKER,
  summarizeReasoningFlow,
} from '../../../src/taxonomy/flow-advisory.js';
import { ThinkingMode } from '../../../src/types/index.js';
import { randomUUID } from 'crypto';

function thought(
  sessionId: string,
  mode: ThinkingMode,
  thoughtNumber: number,
  content = 'A step in the argument.',
) {
  return {
    id: randomUUID(),
    sessionId,
    mode,
    content,
    thoughtNumber,
    totalThoughts: 6,
    timestamp: new Date(),
    nextThoughtNeeded: true,
  } as any;
}

async function multiModeSession(manager: SessionManager) {
  const session = await manager.createSession({
    title: 'Flow wiring',
    mode: ThinkingMode.SEQUENTIAL,
  });
  const modes = [
    ThinkingMode.SEQUENTIAL,
    ThinkingMode.INDUCTIVE,
    ThinkingMode.DEDUCTIVE,
    ThinkingMode.CAUSAL,
  ];
  for (let i = 0; i < modes.length; i++) {
    await manager.addThought(
      session.id,
      thought(session.id, modes[i], i + 1),
    );
  }
  return session;
}

describe('reasoning-flow wiring', () => {
  let manager: SessionManager;

  beforeEach(() => {
    manager = new SessionManager();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('appends a live flow analysis to a multi-mode session summary', async () => {
    const session = await multiModeSession(manager);
    const summary = await manager.generateSummary(session.id);

    expect(summary).toContain('Multi-Modal Reasoning Flow Analysis');
    // The numbers must come from the real analyser, not a fixed template:
    // four thoughts in four different modes is three transitions.
    expect(summary).toContain('Total transitions: 3');
    expect(summary).toContain('sequential → inductive');
    expect(summary).toContain('Dominant Mode:');
  });

  it('leaves the original summary content intact', async () => {
    const session = await multiModeSession(manager);
    const summary = await manager.generateSummary(session.id);

    expect(summary.startsWith('# Flow wiring')).toBe(true);
    expect(summary).toContain('Total Thoughts: 4');
    expect(summary).toContain('## Key Thoughts:');
    // The flow section comes after, never instead of, the key thoughts.
    expect(summary.indexOf('## Key Thoughts:')).toBeLessThan(
      summary.indexOf('Multi-Modal Reasoning Flow Analysis'),
    );
  });

  it('omits the section for a session too short to have a flow', async () => {
    const session = await manager.createSession({
      title: 'Single',
      mode: ThinkingMode.SEQUENTIAL,
    });
    await manager.addThought(
      session.id,
      thought(session.id, ThinkingMode.SEQUENTIAL, 1),
    );

    const summary = await manager.generateSummary(session.id);
    expect(summary).not.toContain('Multi-Modal Reasoning Flow Analysis');
    // The summary itself is still complete.
    expect(summary).toContain('Total Thoughts: 1');
  });

  it('still returns the summary when the analyser throws', async () => {
    vi.spyOn(MultiModalAnalyzer.prototype, 'analyzeFlow').mockImplementation(
      () => {
        throw new Error('analyser exploded');
      },
    );

    const session = await multiModeSession(manager);
    const summary = await manager.generateSummary(session.id);

    expect(summary).toContain('# Flow wiring');
    expect(summary).toContain('Total Thoughts: 4');
    expect(summary).not.toContain('Multi-Modal Reasoning Flow Analysis');
  });

  it('caps an oversized report and says that it did', () => {
    const bloated = 'x'.repeat(MAX_FLOW_REPORT_CHARS + 500);
    const result = summarizeReasoningFlow(
      {
        thoughts: [{}, {}],
      } as any,
      {
        analyzer: {
          analyzeFlow: () => ({}) as any,
          generateFlowReport: () => bloated,
        },
      },
    );

    expect(result).toBeDefined();
    expect(result!.endsWith(FLOW_TRUNCATION_MARKER)).toBe(true);
    expect(result!.length).toBe(
      MAX_FLOW_REPORT_CHARS + FLOW_TRUNCATION_MARKER.length,
    );
  });
});
