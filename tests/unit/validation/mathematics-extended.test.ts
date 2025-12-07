/**
 * Tests for Mathematics Extended Validators - Phase 8 Sprint 4
 */

import { describe, it, expect } from 'vitest';
import {
  AtomicStatementSchema,
  DependencyEdgeSchema,
  DependencyGraphSchema,
  ProofDecompositionSchema,
  ConsistencyReportSchema,
  GapAnalysisSchema,
  AssumptionAnalysisSchema,
  ProofGapSchema,
  ImplicitAssumptionSchema,
  InconsistencySchema,
  CircularPathSchema,
  validateAtomicStatement,
  validateProofDecomposition,
  validateConsistencyReport,
  validateGapAnalysis,
  safeValidateProofDecomposition,
  safeValidateConsistencyReport,
} from '../../../src/validation/validators/modes/mathematics-extended.js';

describe('Mathematics Extended Validators', () => {
  describe('AtomicStatementSchema', () => {
    it('should validate a valid atomic statement', () => {
      const statement = {
        id: 'a1',
        statement: 'Let n be an even integer',
        type: 'hypothesis',
        confidence: 1,
      };

      const result = AtomicStatementSchema.parse(statement);

      expect(result.id).toBe('a1');
      expect(result.type).toBe('hypothesis');
      expect(result.confidence).toBe(1);
    });

    it('should reject empty id', () => {
      const statement = {
        id: '',
        statement: 'Some statement',
        type: 'derived',
        confidence: 0.9,
      };

      expect(() => AtomicStatementSchema.parse(statement)).toThrow();
    });

    it('should reject invalid confidence', () => {
      const statement = {
        id: 'a1',
        statement: 'Some statement',
        type: 'derived',
        confidence: 1.5, // Invalid: must be 0-1
      };

      expect(() => AtomicStatementSchema.parse(statement)).toThrow();
    });

    it('should validate optional fields', () => {
      const statement = {
        id: 'a1',
        statement: 'By modus ponens',
        type: 'derived',
        confidence: 1,
        justification: 'From previous steps',
        derivedFrom: ['a0'],
        usedInferenceRule: 'modus_ponens',
        latex: '\\forall x \\in \\mathbb{R}',
      };

      const result = AtomicStatementSchema.parse(statement);

      expect(result.justification).toBe('From previous steps');
      expect(result.usedInferenceRule).toBe('modus_ponens');
    });

    it('should validate all statement types', () => {
      const types = ['axiom', 'definition', 'hypothesis', 'lemma', 'derived', 'conclusion'];

      for (const type of types) {
        const statement = {
          id: `a-${type}`,
          statement: `A ${type} statement`,
          type,
          confidence: 1,
        };

        const result = AtomicStatementSchema.parse(statement);
        expect(result.type).toBe(type);
      }
    });
  });

  describe('DependencyEdgeSchema', () => {
    it('should validate a valid edge', () => {
      const edge = {
        from: 'a1',
        to: 'a2',
        type: 'logical',
      };

      const result = DependencyEdgeSchema.parse(edge);

      expect(result.from).toBe('a1');
      expect(result.to).toBe('a2');
      expect(result.type).toBe('logical');
      expect(result.strength).toBe(1); // Default
    });

    it('should validate all edge types', () => {
      const types = ['logical', 'definitional', 'computational', 'implicit'];

      for (const type of types) {
        const edge = { from: 'a1', to: 'a2', type };
        const result = DependencyEdgeSchema.parse(edge);
        expect(result.type).toBe(type);
      }
    });

    it('should validate strength in range', () => {
      const edge = {
        from: 'a1',
        to: 'a2',
        type: 'logical',
        strength: 0.5,
      };

      const result = DependencyEdgeSchema.parse(edge);
      expect(result.strength).toBe(0.5);
    });
  });

  describe('ProofGapSchema', () => {
    it('should validate a valid gap', () => {
      const gap = {
        id: 'gap1',
        type: 'missing_step',
        location: { from: 'a1', to: 'a2' },
        description: 'Missing justification',
        severity: 'minor',
      };

      const result = ProofGapSchema.parse(gap);

      expect(result.id).toBe('gap1');
      expect(result.type).toBe('missing_step');
      expect(result.severity).toBe('minor');
    });

    it('should validate all gap types', () => {
      const types = ['missing_step', 'unjustified_leap', 'implicit_assumption', 'undefined_term', 'scope_error'];

      for (const type of types) {
        const gap = {
          id: `gap-${type}`,
          type,
          location: { from: 'a1', to: 'a2' },
          description: `A ${type} gap`,
          severity: 'significant',
        };

        const result = ProofGapSchema.parse(gap);
        expect(result.type).toBe(type);
      }
    });
  });

  describe('ImplicitAssumptionSchema', () => {
    it('should validate a valid implicit assumption', () => {
      const assumption = {
        id: 'imp1',
        statement: 'x is a real number',
        type: 'domain_assumption',
        usedInStep: 'a2',
        shouldBeExplicit: true,
        suggestedFormulation: 'Let x be a real number',
      };

      const result = ImplicitAssumptionSchema.parse(assumption);

      expect(result.type).toBe('domain_assumption');
      expect(result.shouldBeExplicit).toBe(true);
    });
  });

  describe('InconsistencySchema', () => {
    it('should validate a valid inconsistency', () => {
      const inconsistency = {
        id: 'inc1',
        type: 'direct_contradiction',
        involvedStatements: ['a1', 'a2'],
        explanation: 'P and not P both derived',
        severity: 'error',
      };

      const result = InconsistencySchema.parse(inconsistency);

      expect(result.type).toBe('direct_contradiction');
      expect(result.severity).toBe('error');
    });

    it('should validate all inconsistency types', () => {
      const types = [
        'direct_contradiction', 'circular_reasoning', 'type_mismatch',
        'domain_violation', 'undefined_operation', 'axiom_conflict',
        'hidden_assumption', 'quantifier_error', 'equivalence_failure',
      ];

      for (const type of types) {
        const inc = {
          id: `inc-${type}`,
          type,
          involvedStatements: ['a1'],
          explanation: `A ${type}`,
          severity: 'warning',
        };

        const result = InconsistencySchema.parse(inc);
        expect(result.type).toBe(type);
      }
    });
  });

  describe('CircularPathSchema', () => {
    it('should validate a valid circular path', () => {
      const path = {
        statements: ['a1', 'a2', 'a3'],
        cycleLength: 3,
        explanation: 'Circular reasoning detected',
        visualPath: 'a1 → a2 → a3 → a1',
        severity: 'significant',
      };

      const result = CircularPathSchema.parse(path);

      expect(result.cycleLength).toBe(3);
      expect(result.statements).toHaveLength(3);
    });
  });

  describe('ConsistencyReportSchema', () => {
    it('should validate a valid consistency report', () => {
      const report = {
        isConsistent: true,
        overallScore: 0.95,
        inconsistencies: [],
        warnings: [],
        circularReasoning: [],
        summary: 'Proof is consistent',
      };

      const result = ConsistencyReportSchema.parse(report);

      expect(result.isConsistent).toBe(true);
      expect(result.overallScore).toBe(0.95);
    });

    it('should validate report with inconsistencies', () => {
      const report = {
        isConsistent: false,
        overallScore: 0.3,
        inconsistencies: [
          {
            id: 'inc1',
            type: 'direct_contradiction',
            involvedStatements: ['a1', 'a2'],
            explanation: 'Contradiction found',
            severity: 'error',
          },
        ],
        warnings: ['Minor issue detected'],
        circularReasoning: [],
        summary: 'Proof has issues',
      };

      const result = ConsistencyReportSchema.parse(report);

      expect(result.isConsistent).toBe(false);
      expect(result.inconsistencies).toHaveLength(1);
    });
  });

  describe('GapAnalysisSchema', () => {
    it('should validate a valid gap analysis', () => {
      const analysis = {
        completeness: 0.8,
        gaps: [],
        implicitAssumptions: [],
        unjustifiedSteps: ['a3'],
        suggestions: ['Add justification for step 3'],
      };

      const result = GapAnalysisSchema.parse(analysis);

      expect(result.completeness).toBe(0.8);
      expect(result.unjustifiedSteps).toHaveLength(1);
    });
  });

  describe('AssumptionAnalysisSchema', () => {
    it('should validate a valid assumption analysis', () => {
      const analysis = {
        explicitAssumptions: [
          { id: 'a1', statement: 'Axiom 1', type: 'axiom', confidence: 1 },
        ],
        implicitAssumptions: [],
        unusedAssumptions: [],
        conclusionDependencies: { 'c1': ['a1'] },
        minimalSets: { 'c1': ['a1'] },
      };

      const result = AssumptionAnalysisSchema.parse(analysis);

      expect(result.explicitAssumptions).toHaveLength(1);
    });
  });

  describe('ProofDecompositionSchema', () => {
    it('should validate a valid proof decomposition', () => {
      const decomposition = {
        atoms: [
          { id: 'a1', statement: 'Hypothesis', type: 'hypothesis', confidence: 1 },
          { id: 'a2', statement: 'Conclusion', type: 'conclusion', confidence: 1 },
        ],
        completeness: 0.9,
        rigorLevel: 'textbook',
        atomCount: 2,
        maxDependencyDepth: 1,
      };

      const result = ProofDecompositionSchema.parse(decomposition);

      expect(result.atoms).toHaveLength(2);
      expect(result.rigorLevel).toBe('textbook');
    });

    it('should validate all rigor levels', () => {
      const levels = ['informal', 'textbook', 'rigorous', 'formal'];

      for (const level of levels) {
        const decomposition = {
          atoms: [],
          completeness: 0,
          rigorLevel: level,
          atomCount: 0,
          maxDependencyDepth: 0,
        };

        const result = ProofDecompositionSchema.parse(decomposition);
        expect(result.rigorLevel).toBe(level);
      }
    });
  });

  describe('Helper Functions', () => {
    it('validateAtomicStatement should return parsed result', () => {
      const statement = {
        id: 'a1',
        statement: 'Test',
        type: 'hypothesis',
        confidence: 1,
      };

      const result = validateAtomicStatement(statement);
      expect(result.id).toBe('a1');
    });

    it('validateAtomicStatement should throw on invalid input', () => {
      expect(() => validateAtomicStatement({})).toThrow();
    });

    it('validateProofDecomposition should return parsed result', () => {
      const decomposition = {
        atoms: [],
        completeness: 1,
        rigorLevel: 'formal',
        atomCount: 0,
        maxDependencyDepth: 0,
      };

      const result = validateProofDecomposition(decomposition);
      expect(result.rigorLevel).toBe('formal');
    });

    it('validateConsistencyReport should return parsed result', () => {
      const report = {
        isConsistent: true,
        overallScore: 1,
        inconsistencies: [],
        warnings: [],
        circularReasoning: [],
        summary: 'All good',
      };

      const result = validateConsistencyReport(report);
      expect(result.isConsistent).toBe(true);
    });

    it('validateGapAnalysis should return parsed result', () => {
      const analysis = {
        completeness: 1,
        gaps: [],
        implicitAssumptions: [],
        unjustifiedSteps: [],
        suggestions: [],
      };

      const result = validateGapAnalysis(analysis);
      expect(result.completeness).toBe(1);
    });

    it('safeValidateProofDecomposition should return success for valid input', () => {
      const decomposition = {
        atoms: [],
        completeness: 1,
        rigorLevel: 'formal',
        atomCount: 0,
        maxDependencyDepth: 0,
      };

      const result = safeValidateProofDecomposition(decomposition);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.rigorLevel).toBe('formal');
      }
    });

    it('safeValidateProofDecomposition should return error for invalid input', () => {
      const result = safeValidateProofDecomposition({});
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });

    it('safeValidateConsistencyReport should return success for valid input', () => {
      const report = {
        isConsistent: true,
        overallScore: 1,
        inconsistencies: [],
        warnings: [],
        circularReasoning: [],
        summary: 'Valid',
      };

      const result = safeValidateConsistencyReport(report);
      expect(result.success).toBe(true);
    });

    it('safeValidateConsistencyReport should return error for invalid input', () => {
      const result = safeValidateConsistencyReport({ isConsistent: 'not boolean' });
      expect(result.success).toBe(false);
    });
  });
});
