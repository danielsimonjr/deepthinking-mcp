/**
 * Validator files <-> VALIDATOR_REGISTRY, in both directions.
 *
 * `registry-mode-coverage.test.ts` pins the registry against `ThinkingMode`.
 * It does not look at the files on disk, and it spot-checks `getMode()` for
 * four modes only. Two gaps survive that:
 *
 *  - a validator file nobody references (`modes/meta.ts` is exactly this: a
 *    ~200-line validator whose `getMode()` returns "meta", a mode that does
 *    not exist). Four more files sat in that state for months.
 *  - a registry entry whose `className` or `module` is wrong. `loadValidator`
 *    swallows every failure and returns `undefined`, so a typo produces the
 *    same "No validator registered" advisory as a missing entry.
 *
 * These tests read the directory and resolve every entry, so both fail here
 * rather than reaching a client as an advisory message.
 */

import { describe, it, expect } from 'vitest';
import { readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import {
  getSupportedModes,
  getValidatorForMode,
} from '../../../src/validation/validators/registry.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const MODES_DIR = resolve(HERE, '../../../src/validation/validators/modes');

/**
 * Validator files deliberately not in the registry, with the reason.
 *
 * meta.ts: its `getMode()` returns "meta". No `meta` member exists in
 * `ThinkingMode` — `metareasoning` is the real mode and has its own validator
 * and its own registry entry — so no thought can ever reach this validator.
 * Registering it would map a mode that does not exist.
 *
 * Adding a name here is a decision: it means a validator that will never run.
 */
const DELIBERATELY_UNREGISTERED_FILES = new Set(['meta.ts']);

const validatorFiles = readdirSync(MODES_DIR).filter((f) => f.endsWith('.ts'));
const registeredModes = getSupportedModes();

describe('validator files and VALIDATOR_REGISTRY agree', () => {
  it('finds validator files to check', () => {
    // Guards the two directory-driven tests below from passing vacuously if
    // the path ever moves.
    expect(validatorFiles.length).toBeGreaterThan(30);
  });

  it('references every validator file, or exempts it with a reason', () => {
    const referenced = new Set(registeredModes.map((mode) => `${mode}.ts`));

    const orphans = validatorFiles.filter(
      (file) =>
        !referenced.has(file) && !DELIBERATELY_UNREGISTERED_FILES.has(file),
    );

    expect(orphans).toEqual([]);
  });

  it('backs every registry entry with a file on disk', () => {
    const present = new Set(validatorFiles);

    const dangling = registeredModes.filter(
      (mode) => !present.has(`${mode}.ts`),
    );

    expect(dangling).toEqual([]);
  });

  it('exempts no file that is in fact registered', () => {
    const referenced = new Set(registeredModes.map((mode) => `${mode}.ts`));
    const contradictory = [...DELIBERATELY_UNREGISTERED_FILES].filter((file) =>
      referenced.has(file),
    );

    expect(contradictory).toEqual([]);
  });
});

describe('every registered validator resolves and self-identifies', () => {
  it.each(registeredModes)(
    '%s loads a validator whose getMode() matches its registry key',
    async (mode) => {
      // `loadValidator` catches everything and returns undefined, so a wrong
      // module path or class name is indistinguishable from a missing entry
      // at runtime. Resolving all of them is the only way to see it.
      const validator = await getValidatorForMode(mode);

      expect(validator, `no validator resolved for ${mode}`).toBeDefined();
      expect(validator!.getMode()).toBe(mode);
    },
  );

  it('resolves nothing for a mode that is not registered', () => {
    // Proves the assertions above can fail: resolution really does return
    // undefined when an entry is absent.
    return expect(getValidatorForMode('no-such-mode')).resolves.toBeUndefined();
  });
});
