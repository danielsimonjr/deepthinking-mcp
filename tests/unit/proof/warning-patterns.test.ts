/**
 * Tests for Warning Patterns - Phase 8 Sprint 3
 */

import { describe, it, expect } from 'vitest';
import {
  ALL_WARNING_PATTERNS,
  getPatternsByCategory,
  getPatternsBySeverity,
  checkStatement,
  checkProof,
  DIVISION_BY_HIDDEN_ZERO,
  ASSUMING_CONCLUSION,
  AFFIRMING_CONSEQUENT,
  DENYING_ANTECEDENT,
  HASTY_GENERALIZATION,
  INFINITY_ARITHMETIC,
  EXISTENTIAL_INSTANTIATION_ERROR,
} from '../../../src/proof/patterns/warnings.js';

describe('Warning Patterns', () => {
  describe('Pattern Catalog', () => {
    it('should have all expected patterns', () => {
      expect(ALL_WARNING_PATTERNS.length).toBeGreaterThanOrEqual(10);
    });

    it('should have unique IDs for all patterns', () => {
      const ids = ALL_WARNING_PATTERNS.map((p) => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have required fields for all patterns', () => {
      for (const pattern of ALL_WARNING_PATTERNS) {
        expect(pattern.id).toBeTruthy();
        expect(pattern.name).toBeTruthy();
        expect(pattern.category).toBeTruthy();
        expect(pattern.description).toBeTruthy();
        expect(pattern.pattern).toBeInstanceOf(RegExp);
        expect(['info', 'warning', 'error', 'critical']).toContain(pattern.severity);
        expect(pattern.suggestion).toBeTruthy();
        expect(Array.isArray(pattern.examples)).toBe(true);
      }
    });
  });

  describe('getPatternsByCategory', () => {
    it('should return patterns for division_error category', () => {
      const patterns = getPatternsByCategory('division_error');
      expect(patterns.length).toBeGreaterThan(0);
      expect(patterns.every((p) => p.category === 'division_error')).toBe(true);
    });

    it('should return patterns for logical_fallacy category', () => {
      const patterns = getPatternsByCategory('logical_fallacy');
      expect(patterns.length).toBeGreaterThan(0);
      expect(patterns.every((p) => p.category === 'logical_fallacy')).toBe(true);
    });

    it('should return empty array for non-existent category', () => {
      const patterns = getPatternsByCategory('nonexistent' as any);
      expect(patterns).toHaveLength(0);
    });
  });

  describe('getPatternsBySeverity', () => {
    it('should return critical patterns', () => {
      const patterns = getPatternsBySeverity('critical');
      expect(patterns.length).toBeGreaterThan(0);
      expect(patterns.every((p) => p.severity === 'critical')).toBe(true);
    });

    it('should return error patterns', () => {
      const patterns = getPatternsBySeverity('error');
      expect(patterns.length).toBeGreaterThan(0);
      expect(patterns.every((p) => p.severity === 'error')).toBe(true);
    });

    it('should return warning patterns', () => {
      const patterns = getPatternsBySeverity('warning');
      expect(patterns.length).toBeGreaterThan(0);
      expect(patterns.every((p) => p.severity === 'warning')).toBe(true);
    });
  });

  describe('checkStatement', () => {
    it('should detect division by hidden zero', () => {
      const statement = 'We can simplify by dividing by (a - b)';
      const warnings = checkStatement(statement);

      const divisionWarning = warnings.find((w) => w.pattern.id === 'division_by_hidden_zero');
      expect(divisionWarning).toBeTruthy();
    });

    it('should detect infinity arithmetic', () => {
      const statement = 'Since ∞ - ∞ = 0';
      const warnings = checkStatement(statement);

      const infinityWarning = warnings.find((w) => w.pattern.id === 'infinity_arithmetic');
      expect(infinityWarning).toBeTruthy();
    });

    it('should return empty array for valid statement', () => {
      const statement = 'The sum of angles in a triangle equals 180 degrees';
      const warnings = checkStatement(statement);

      expect(warnings).toHaveLength(0);
    });
  });

  describe('checkProof', () => {
    it('should check multiple statements and return warnings by index', () => {
      const statements = [
        'Let x be a positive integer',
        'Dividing both sides by x',
        'We get the result',
      ];

      const results = checkProof(statements);

      // Statement at index 1 should have warnings
      expect(results.has(1)).toBe(true);
    });

    it('should return empty map for valid proof', () => {
      const statements = [
        'Let n be a natural number',
        'By definition, n + 0 = n',
        'Therefore n is unchanged when 0 is added',
      ];

      const results = checkProof(statements);

      expect(results.size).toBe(0);
    });
  });

  describe('Individual Patterns', () => {
    describe('DIVISION_BY_HIDDEN_ZERO', () => {
      it('should match division by variable', () => {
        expect(DIVISION_BY_HIDDEN_ZERO.pattern.test('dividing by x')).toBe(true);
        expect(DIVISION_BY_HIDDEN_ZERO.pattern.test('divide by (a - b)')).toBe(true);
      });

      it('should have error severity', () => {
        expect(DIVISION_BY_HIDDEN_ZERO.severity).toBe('error');
      });
    });

    describe('ASSUMING_CONCLUSION', () => {
      it('should have critical severity', () => {
        expect(ASSUMING_CONCLUSION.severity).toBe('critical');
      });

      it('should be in logical_fallacy category', () => {
        expect(ASSUMING_CONCLUSION.category).toBe('logical_fallacy');
      });
    });

    describe('AFFIRMING_CONSEQUENT', () => {
      it('should have error severity', () => {
        expect(AFFIRMING_CONSEQUENT.severity).toBe('error');
      });

      it('should be in logical_fallacy category', () => {
        expect(AFFIRMING_CONSEQUENT.category).toBe('logical_fallacy');
      });
    });

    describe('DENYING_ANTECEDENT', () => {
      it('should have error severity', () => {
        expect(DENYING_ANTECEDENT.severity).toBe('error');
      });

      it('should be in logical_fallacy category', () => {
        expect(DENYING_ANTECEDENT.category).toBe('logical_fallacy');
      });
    });

    describe('HASTY_GENERALIZATION', () => {
      it('should have warning severity', () => {
        expect(HASTY_GENERALIZATION.severity).toBe('warning');
      });
    });

    describe('INFINITY_ARITHMETIC', () => {
      it('should match infinity operations', () => {
        expect(INFINITY_ARITHMETIC.pattern.test('∞ - ∞')).toBe(true);
        expect(INFINITY_ARITHMETIC.pattern.test('∞ / ∞')).toBe(true);
        expect(INFINITY_ARITHMETIC.pattern.test('0 * ∞')).toBe(true);
      });

      it('should have critical severity', () => {
        expect(INFINITY_ARITHMETIC.severity).toBe('critical');
      });
    });

    describe('EXISTENTIAL_INSTANTIATION_ERROR', () => {
      it('should have error severity', () => {
        expect(EXISTENTIAL_INSTANTIATION_ERROR.severity).toBe('error');
      });

      it('should be in quantifier_error category', () => {
        expect(EXISTENTIAL_INSTANTIATION_ERROR.category).toBe('quantifier_error');
      });
    });
  });
});
