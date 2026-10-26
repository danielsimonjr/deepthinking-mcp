/**
 * Mode-name resolution tests.
 *
 * CustomHandler (basedOnModes) and HybridHandler (activeModes) turn the mode names
 * a client sends into ThinkingMode values. Both must recognise every mode, ignore
 * case, and replace an unknown name with sequential.
 */

import { describe, it, expect } from 'vitest';
import { CustomHandler } from '../../../../src/modes/handlers/CustomHandler.js';
import { HybridHandler } from '../../../../src/modes/handlers/HybridHandler.js';
import { resolveMode } from '../../../../src/modes/handlers/resolve-mode.js';
import { ThinkingMode } from '../../../../src/types/core.js';

const baseInput = {
  thought: 'Resolve the mode names',
  thoughtNumber: 1,
  totalThoughts: 1,
  nextThoughtNeeded: false,
};

function customResolves(names: string[]): ThinkingMode[] {
  const input = { ...baseInput, mode: 'custom', basedOnModes: names } as any;
  return new CustomHandler().createThought(input, 'session-names').basedOnModes!;
}

function hybridResolves(names: string[]): ThinkingMode[] {
  const input = { ...baseInput, mode: 'hybrid', activeModes: names } as any;
  return (new HybridHandler().createThought(input, 'session-names') as any).activeModes;
}

const everyMode = Object.values(ThinkingMode);

describe('mode-name resolution in CustomHandler and HybridHandler', () => {
  it.each(everyMode)('CustomHandler resolves %s to itself', (mode) => {
    expect(customResolves([mode])).toEqual([mode]);
  });

  it.each(everyMode)('HybridHandler resolves %s to itself', (mode) => {
    expect(hybridResolves([mode])).toEqual([mode]);
  });

  it('ignores case', () => {
    expect(customResolves(['Bayesian', 'MODAL'])).toEqual([
      ThinkingMode.BAYESIAN,
      ThinkingMode.MODAL,
    ]);
    expect(hybridResolves(['Causal', 'RECURSIVE'])).toEqual([
      ThinkingMode.CAUSAL,
      ThinkingMode.RECURSIVE,
    ]);
  });

  it('replaces an unknown name with sequential', () => {
    expect(customResolves(['no_such_mode'])).toEqual([ThinkingMode.SEQUENTIAL]);
    expect(hybridResolves(['no_such_mode'])).toEqual([ThinkingMode.SEQUENTIAL]);
  });

  it('replaces an inherited object property name with sequential', () => {
    expect(customResolves(['constructor', 'toString'])).toEqual([
      ThinkingMode.SEQUENTIAL,
      ThinkingMode.SEQUENTIAL,
    ]);
    expect(hybridResolves(['constructor', 'toString'])).toEqual([
      ThinkingMode.SEQUENTIAL,
      ThinkingMode.SEQUENTIAL,
    ]);
  });
});

describe('resolveMode', () => {
  it.each(everyMode)('maps %s to itself', (mode) => {
    expect(resolveMode(mode)).toBe(mode);
  });

  it('ignores case', () => {
    expect(resolveMode('GameTheory')).toBe(ThinkingMode.GAMETHEORY);
  });

  it('returns sequential for a name that is not a mode', () => {
    expect(resolveMode('')).toBe(ThinkingMode.SEQUENTIAL);
    expect(resolveMode('__proto__')).toBe(ThinkingMode.SEQUENTIAL);
  });
});
