/**
 * Advisory validation wrapper tests
 *
 * The advisory wrapper is the only thing the live request path calls. It must:
 * - never throw, whatever the underlying validator does
 * - bound the payload it hands back to a client
 * - pass the verdict through untouched (advisory: reported, never enforced)
 */

import { describe, it, expect, vi } from 'vitest';
import {
  validateAdvisory,
  MAX_ADVISORY_ISSUES,
  MAX_ADVISORY_SUGGESTIONS,
} from '../../../src/validation/advisory.js';
import { ThinkingMode } from '../../../src/types/core.js';
import type { Thought } from '../../../src/types/core.js';
import type { ValidationIssue, ValidationResult } from '../../../src/types/session.js';

function makeThought(): Thought {
  return {
    id: 'thought-1',
    sessionId: 'session-1',
    thoughtNumber: 1,
    totalThoughts: 3,
    content: 'A first thought.',
    timestamp: new Date('2026-01-01T00:00:00Z'),
    mode: ThinkingMode.SEQUENTIAL,
    nextThoughtNeeded: true,
  } as unknown as Thought;
}

function makeIssue(
  severity: ValidationIssue['severity'],
  description: string,
  suggestion = `fix ${description}`,
): ValidationIssue {
  return {
    severity,
    thoughtNumber: 1,
    description,
    suggestion,
    category: 'structural',
  };
}

function makeResult(issues: ValidationIssue[]): ValidationResult {
  return {
    isValid: issues.every((i) => i.severity !== 'error'),
    confidence: 0.5,
    issues,
    strengthMetrics: {
      logicalSoundness: 1,
      empiricalSupport: 0.8,
      mathematicalRigor: 1,
      physicalConsistency: 1,
    },
    suggestions: issues.map((i) => i.suggestion),
  };
}

describe('validateAdvisory', () => {
  it('passes an invalid verdict through instead of throwing', async () => {
    const validator = {
      validate: vi.fn().mockResolvedValue(makeResult([makeIssue('error', 'bad')])),
    };

    const advisory = await validateAdvisory(makeThought(), {}, validator);

    expect(advisory.available).toBe(true);
    if (!advisory.available) return;
    expect(advisory.isValid).toBe(false);
    expect(advisory.issues).toHaveLength(1);
  });

  it('degrades to unavailable when the validator throws', async () => {
    const validator = {
      validate: vi.fn().mockRejectedValue(new Error('validator exploded')),
    };

    const advisory = await validateAdvisory(makeThought(), {}, validator);

    expect(advisory.available).toBe(false);
    if (advisory.available) return;
    expect(advisory.reason).toContain('validator exploded');
  });

  it('degrades to unavailable when the validator throws synchronously', async () => {
    const validator = {
      validate: vi.fn(() => {
        throw new Error('sync boom');
      }),
    };

    const advisory = await validateAdvisory(makeThought(), {}, validator);

    expect(advisory.available).toBe(false);
  });

  it('bounds the issue list and reports what it dropped', async () => {
    const issues = Array.from({ length: MAX_ADVISORY_ISSUES + 7 }, (_, i) =>
      makeIssue('info', `issue ${i}`),
    );

    const advisory = await validateAdvisory(makeThought(), {}, {
      validate: vi.fn().mockResolvedValue(makeResult(issues)),
    });

    expect(advisory.available).toBe(true);
    if (!advisory.available) return;
    expect(advisory.issues).toHaveLength(MAX_ADVISORY_ISSUES);
    expect(advisory.totalIssues).toBe(MAX_ADVISORY_ISSUES + 7);
    expect(advisory.issuesTruncated).toBe(true);
  });

  it('keeps errors and warnings ahead of info when truncating', async () => {
    const issues: ValidationIssue[] = [
      ...Array.from({ length: MAX_ADVISORY_ISSUES }, (_, i) =>
        makeIssue('info', `info ${i}`),
      ),
      makeIssue('warning', 'a warning'),
      makeIssue('error', 'an error'),
    ];

    const advisory = await validateAdvisory(makeThought(), {}, {
      validate: vi.fn().mockResolvedValue(makeResult(issues)),
    });

    expect(advisory.available).toBe(true);
    if (!advisory.available) return;
    expect(advisory.issues[0].severity).toBe('error');
    expect(advisory.issues[1].severity).toBe('warning');
    expect(advisory.issues.map((i) => i.description)).toContain('an error');
  });

  it('reports untruncated when the issue list fits', async () => {
    const advisory = await validateAdvisory(makeThought(), {}, {
      validate: vi.fn().mockResolvedValue(makeResult([makeIssue('warning', 'w')])),
    });

    expect(advisory.available).toBe(true);
    if (!advisory.available) return;
    expect(advisory.totalIssues).toBe(1);
    expect(advisory.issuesTruncated).toBe(false);
  });

  it('deduplicates and caps suggestions', async () => {
    const issues = Array.from({ length: MAX_ADVISORY_SUGGESTIONS + 5 }, (_, i) =>
      makeIssue('warning', `w ${i}`, 'always the same advice'),
    );

    const advisory = await validateAdvisory(makeThought(), {}, {
      validate: vi.fn().mockResolvedValue(makeResult(issues)),
    });

    expect(advisory.available).toBe(true);
    if (!advisory.available) return;
    expect(advisory.suggestions).toEqual(['always the same advice']);
  });

  it('caps distinct suggestions at the limit', async () => {
    const issues = Array.from({ length: MAX_ADVISORY_SUGGESTIONS + 5 }, (_, i) =>
      makeIssue('warning', `w ${i}`, `advice ${i}`),
    );

    const advisory = await validateAdvisory(makeThought(), {}, {
      validate: vi.fn().mockResolvedValue(makeResult(issues)),
    });

    expect(advisory.available).toBe(true);
    if (!advisory.available) return;
    expect(advisory.suggestions).toHaveLength(MAX_ADVISORY_SUGGESTIONS);
  });

  it('carries confidence and strength metrics through unchanged', async () => {
    const result = makeResult([]);
    const advisory = await validateAdvisory(makeThought(), {}, {
      validate: vi.fn().mockResolvedValue(result),
    });

    expect(advisory.available).toBe(true);
    if (!advisory.available) return;
    expect(advisory.confidence).toBe(result.confidence);
    expect(advisory.strengthMetrics).toEqual(result.strengthMetrics);
  });

  it('uses the real validator by default and returns a usable verdict', async () => {
    const advisory = await validateAdvisory(makeThought());

    expect(advisory.available).toBe(true);
    if (!advisory.available) return;
    expect(typeof advisory.confidence).toBe('number');
    expect(Array.isArray(advisory.issues)).toBe(true);
  });
});
