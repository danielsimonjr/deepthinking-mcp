/**
 * Unit tests for proof decomposition types
 *
 * Tests type definitions, interfaces, and type guards for
 * the proof decomposition feature.
 */

import { describe, it, expect } from 'vitest';
import type {
  MathematicsThoughtType,
  InferenceRule,
  AtomicStatement,
  DependencyEdge,
  DependencyGraph,
  ProofGap,
  ImplicitAssumption,
  AssumptionChain,
  ProofDecomposition,
  InconsistencyType,
  Inconsistency,
  CircularPath,
  ConsistencyReport,
  GapAnalysis,
  AssumptionAnalysis,
  MathematicsThought,
} from '../../../src/types/modes/mathematics.js';
import { ThinkingMode, isMathematicsThought } from '../../../src/types/core.js';

describe('Proof Decomposition Types', () => {
  describe('MathematicsThoughtType', () => {
    it('should include original thought types', () => {
      const originalTypes: MathematicsThoughtType[] = [
        'axiom_definition',
        'theorem_statement',
        'proof_construction',
        'lemma_derivation',
        'corollary',
        'counterexample',
        'algebraic_manipulation',
        'symbolic_computation',
        'numerical_analysis',
      ];

      // TypeScript will catch if any of these are invalid
      originalTypes.forEach((type) => {
        expect(type).toBeDefined();
      });
    });

    it('should include new proof decomposition types', () => {
      const newTypes: MathematicsThoughtType[] = [
        'proof_decomposition',
        'dependency_analysis',
        'consistency_check',
        'gap_identification',
        'assumption_trace',
      ];

      newTypes.forEach((type) => {
        expect(type).toBeDefined();
      });
    });
  });

  describe('InferenceRule', () => {
    it('should include all inference rules', () => {
      const rules: InferenceRule[] = [
        'modus_ponens',
        'modus_tollens',
        'hypothetical_syllogism',
        'disjunctive_syllogism',
        'universal_instantiation',
        'existential_generalization',
        'mathematical_induction',
        'contradiction',
        'direct_implication',
        'substitution',
        'algebraic_manipulation',
        'definition_expansion',
      ];

      expect(rules).toHaveLength(12);
      rules.forEach((rule) => {
        expect(rule).toBeDefined();
      });
    });
  });

  describe('AtomicStatement', () => {
    it('should create valid atomic statement', () => {
      const statement: AtomicStatement = {
        id: 'stmt-1',
        statement: 'For all x, P(x) implies Q(x)',
        latex: '\\forall x, P(x) \\Rightarrow Q(x)',
        type: 'axiom',
        confidence: 1.0,
        isExplicit: true,
        justification: 'Given as axiom',
      };

      expect(statement.id).toBe('stmt-1');
      expect(statement.type).toBe('axiom');
      expect(statement.confidence).toBe(1.0);
    });

    it('should support all statement types', () => {
      const types: AtomicStatement['type'][] = [
        'axiom',
        'definition',
        'hypothesis',
        'lemma',
        'derived',
        'conclusion',
      ];

      types.forEach((type) => {
        const stmt: AtomicStatement = {
          id: `stmt-${type}`,
          statement: `Test ${type}`,
          type,
          confidence: 1.0,
          isExplicit: true,
        };
        expect(stmt.type).toBe(type);
      });
    });

    it('should support derivation chain', () => {
      const statement: AtomicStatement = {
        id: 'stmt-derived',
        statement: 'Therefore Q',
        type: 'derived',
        confidence: 0.95,
        isExplicit: true,
        derivedFrom: ['stmt-1', 'stmt-2'],
        usedInferenceRule: 'modus_ponens',
      };

      expect(statement.derivedFrom).toHaveLength(2);
      expect(statement.usedInferenceRule).toBe('modus_ponens');
    });
  });

  describe('DependencyEdge', () => {
    it('should create valid dependency edge', () => {
      const edge: DependencyEdge = {
        from: 'stmt-1',
        to: 'stmt-2',
        type: 'logical',
        strength: 1.0,
        inferenceRule: 'modus_ponens',
      };

      expect(edge.from).toBe('stmt-1');
      expect(edge.to).toBe('stmt-2');
      expect(edge.type).toBe('logical');
    });

    it('should support all edge types', () => {
      const types: DependencyEdge['type'][] = [
        'logical',
        'definitional',
        'computational',
        'implicit',
      ];

      types.forEach((type) => {
        const edge: DependencyEdge = {
          from: 'a',
          to: 'b',
          type,
          strength: 1.0,
        };
        expect(edge.type).toBe(type);
      });
    });
  });

  describe('ProofGap', () => {
    it('should create valid proof gap', () => {
      const gap: ProofGap = {
        id: 'gap-1',
        type: 'missing_step',
        location: {
          from: 'stmt-1',
          to: 'stmt-2',
        },
        description: 'Missing justification for the step',
        severity: 'significant',
        suggestedFix: 'Add intermediate lemma',
      };

      expect(gap.type).toBe('missing_step');
      expect(gap.severity).toBe('significant');
    });

    it('should support all gap types', () => {
      const types: ProofGap['type'][] = [
        'missing_step',
        'unjustified_leap',
        'implicit_assumption',
        'undefined_term',
        'scope_error',
      ];

      types.forEach((type) => {
        const gap: ProofGap = {
          id: `gap-${type}`,
          type,
          location: { from: 'a', to: 'b' },
          description: `Test ${type}`,
          severity: 'minor',
        };
        expect(gap.type).toBe(type);
      });
    });
  });

  describe('ImplicitAssumption', () => {
    it('should create valid implicit assumption', () => {
      const assumption: ImplicitAssumption = {
        id: 'impl-1',
        statement: 'n is a positive integer',
        type: 'domain_assumption',
        usedInStep: 'stmt-5',
        shouldBeExplicit: true,
        suggestedFormulation: 'Let n ∈ ℤ⁺',
      };

      expect(assumption.type).toBe('domain_assumption');
      expect(assumption.shouldBeExplicit).toBe(true);
    });

    it('should support all assumption types', () => {
      const types: ImplicitAssumption['type'][] = [
        'domain_assumption',
        'existence_assumption',
        'uniqueness_assumption',
        'continuity_assumption',
        'finiteness_assumption',
        'well_ordering',
      ];

      expect(types).toHaveLength(6);
    });
  });

  describe('AssumptionChain', () => {
    it('should create valid assumption chain', () => {
      const chain: AssumptionChain = {
        conclusion: 'stmt-final',
        assumptions: ['stmt-1', 'stmt-2'],
        path: ['stmt-1', 'stmt-2', 'stmt-3', 'stmt-final'],
        allAssumptionsExplicit: false,
        implicitAssumptions: [
          {
            id: 'impl-1',
            statement: 'x > 0',
            type: 'domain_assumption',
            usedInStep: 'stmt-3',
            shouldBeExplicit: true,
            suggestedFormulation: 'Let x > 0',
          },
        ],
      };

      expect(chain.assumptions).toHaveLength(2);
      expect(chain.path).toHaveLength(4);
      expect(chain.implicitAssumptions).toHaveLength(1);
    });
  });

  describe('ProofDecomposition', () => {
    it('should create valid proof decomposition', () => {
      const decomposition: ProofDecomposition = {
        id: 'decomp-1',
        originalProof: 'Assume P. Then Q. Therefore R.',
        theorem: 'P implies R',
        atoms: [
          {
            id: 'a1',
            statement: 'P',
            type: 'hypothesis',
            confidence: 1.0,
            isExplicit: true,
          },
          {
            id: 'a2',
            statement: 'Q',
            type: 'derived',
            confidence: 1.0,
            isExplicit: true,
          },
          {
            id: 'a3',
            statement: 'R',
            type: 'conclusion',
            confidence: 1.0,
            isExplicit: true,
          },
        ],
        dependencies: {
          nodes: new Map(),
          edges: [],
          roots: ['a1'],
          leaves: ['a3'],
          depth: 3,
          width: 1,
          hasCycles: false,
        },
        assumptionChains: [],
        gaps: [],
        implicitAssumptions: [],
        completeness: 0.95,
        rigorLevel: 'textbook',
        atomCount: 3,
        maxDependencyDepth: 3,
      };

      expect(decomposition.atoms).toHaveLength(3);
      expect(decomposition.completeness).toBe(0.95);
      expect(decomposition.rigorLevel).toBe('textbook');
    });
  });

  describe('InconsistencyType', () => {
    it('should include all inconsistency types', () => {
      const types: InconsistencyType[] = [
        'direct_contradiction',
        'circular_reasoning',
        'type_mismatch',
        'domain_violation',
        'undefined_operation',
        'axiom_conflict',
        'hidden_assumption',
        'quantifier_error',
        'equivalence_failure',
      ];

      expect(types).toHaveLength(9);
    });
  });

  describe('Inconsistency', () => {
    it('should create valid inconsistency', () => {
      const inconsistency: Inconsistency = {
        id: 'inc-1',
        type: 'direct_contradiction',
        involvedStatements: ['stmt-1', 'stmt-5'],
        explanation: 'Statement 5 directly contradicts statement 1',
        severity: 'critical',
        suggestedResolution: 'Review the derivation of statement 5',
      };

      expect(inconsistency.type).toBe('direct_contradiction');
      expect(inconsistency.severity).toBe('critical');
    });
  });

  describe('CircularPath', () => {
    it('should create valid circular path', () => {
      const path: CircularPath = {
        statements: ['stmt-1', 'stmt-2', 'stmt-3'],
        cycleLength: 3,
        explanation: 'Statement 3 depends on statement 1 which depends on statement 3',
        visualPath: 'stmt-1 → stmt-2 → stmt-3 → stmt-1',
        severity: 'critical',
      };

      expect(path.cycleLength).toBe(3);
      expect(path.statements).toHaveLength(3);
    });
  });

  describe('ConsistencyReport', () => {
    it('should create valid consistency report', () => {
      const report: ConsistencyReport = {
        isConsistent: true,
        overallScore: 0.95,
        inconsistencies: [],
        warnings: ['Minor: Consider making assumption explicit'],
        circularReasoning: [],
        summary: 'The proof is logically consistent with minor suggestions.',
      };

      expect(report.isConsistent).toBe(true);
      expect(report.overallScore).toBe(0.95);
    });

    it('should handle inconsistent proof report', () => {
      const report: ConsistencyReport = {
        isConsistent: false,
        overallScore: 0.3,
        inconsistencies: [
          {
            id: 'inc-1',
            type: 'circular_reasoning',
            involvedStatements: ['a', 'b', 'c'],
            explanation: 'Circular dependency detected',
            severity: 'critical',
          },
        ],
        warnings: [],
        circularReasoning: [
          {
            statements: ['a', 'b', 'c'],
            cycleLength: 3,
            explanation: 'a → b → c → a',
            visualPath: 'a → b → c → a',
            severity: 'critical',
          },
        ],
        summary: 'Critical: Circular reasoning detected.',
      };

      expect(report.isConsistent).toBe(false);
      expect(report.inconsistencies).toHaveLength(1);
      expect(report.circularReasoning).toHaveLength(1);
    });
  });

  describe('GapAnalysis', () => {
    it('should create valid gap analysis', () => {
      const analysis: GapAnalysis = {
        completeness: 0.85,
        gaps: [
          {
            id: 'gap-1',
            type: 'missing_step',
            location: { from: 'a', to: 'b' },
            description: 'Missing intermediate step',
            severity: 'minor',
          },
        ],
        implicitAssumptions: [],
        unjustifiedSteps: ['stmt-7'],
        suggestions: ['Add justification for step 7'],
      };

      expect(analysis.completeness).toBe(0.85);
      expect(analysis.gaps).toHaveLength(1);
    });
  });

  describe('AssumptionAnalysis', () => {
    it('should create valid assumption analysis', () => {
      const analysis: AssumptionAnalysis = {
        explicitAssumptions: [
          {
            id: 'a1',
            statement: 'P',
            type: 'hypothesis',
            confidence: 1.0,
            isExplicit: true,
          },
        ],
        implicitAssumptions: [],
        unusedAssumptions: [],
        conclusionDependencies: new Map([['conclusion', ['a1']]]),
        minimalSets: new Map([['conclusion', ['a1']]]),
      };

      expect(analysis.explicitAssumptions).toHaveLength(1);
      expect(analysis.conclusionDependencies.get('conclusion')).toEqual(['a1']);
    });
  });

  describe('MathematicsThought with Decomposition', () => {
    it('should create MathematicsThought with decomposition fields', () => {
      const thought: MathematicsThought = {
        id: 'thought-1',
        sessionId: 'session-1',
        mode: ThinkingMode.MATHEMATICS,
        thoughtType: 'proof_decomposition',
        thoughtNumber: 1,
        totalThoughts: 3,
        content: 'Analyzing proof structure',
        timestamp: new Date(),
        nextThoughtNeeded: true,
        dependencies: [],
        assumptions: [],
        uncertainty: 0.1,
        decomposition: {
          id: 'decomp-1',
          originalProof: 'Test proof',
          atoms: [],
          dependencies: {
            nodes: new Map(),
            edges: [],
            roots: [],
            leaves: [],
            depth: 0,
            width: 0,
            hasCycles: false,
          },
          assumptionChains: [],
          gaps: [],
          implicitAssumptions: [],
          completeness: 1.0,
          rigorLevel: 'formal',
          atomCount: 0,
          maxDependencyDepth: 0,
        },
        consistencyReport: {
          isConsistent: true,
          overallScore: 1.0,
          inconsistencies: [],
          warnings: [],
          circularReasoning: [],
          summary: 'Consistent',
        },
      };

      expect(isMathematicsThought(thought)).toBe(true);
      expect(thought.thoughtType).toBe('proof_decomposition');
      expect(thought.decomposition).toBeDefined();
      expect(thought.consistencyReport).toBeDefined();
    });
  });
});
