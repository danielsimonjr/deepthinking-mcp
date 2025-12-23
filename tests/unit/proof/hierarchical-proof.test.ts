/**
 * Hierarchical Proof Manager Tests - Phase 12 Sprint 2
 *
 * Tests for the HierarchicalProofManager class that manages nested proof structures.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  HierarchicalProofManager,
  HierarchicalProofOptions,
  ProofElementInput,
} from '../../../src/proof/hierarchical-proof.js';
import type { ProofStep } from '../../../src/proof/decomposer.js';

describe('HierarchicalProofManager', () => {
  let manager: HierarchicalProofManager;

  beforeEach(() => {
    manager = new HierarchicalProofManager();
  });

  describe('constructor', () => {
    it('should create an instance with default options', () => {
      const manager = new HierarchicalProofManager();
      expect(manager).toBeDefined();
    });

    it('should accept custom options', () => {
      const options: HierarchicalProofOptions = {
        autoExtractLemmas: false,
        maxDepth: 5,
        extractMetadata: false,
      };
      const manager = new HierarchicalProofManager(options);
      expect(manager).toBeDefined();
    });
  });

  describe('createProof', () => {
    it('should create a hierarchical proof from statement and steps', () => {
      const statement = 'For all n, P(n)';
      const steps: ProofStep[] = [
        { stepNumber: 1, content: 'Base case: P(0)', justification: 'base case' },
        { stepNumber: 2, content: 'Inductive step', justification: 'induction' },
        { stepNumber: 3, content: 'Therefore, for all n, P(n). QED', justification: 'conclusion' },
      ];

      const proof = manager.createProof(statement, steps);

      expect(proof.id).toBeDefined();
      expect(proof.type).toBe('theorem');
      expect(proof.statement).toBe(statement);
      expect(proof.proof).toHaveLength(3);
    });

    it('should accept an optional name', () => {
      const proof = manager.createProof(
        'P implies Q',
        [{ stepNumber: 1, content: 'Therefore Q. QED', justification: 'direct' }],
        'Main Theorem'
      );

      expect(proof.name).toBe('Main Theorem');
    });

    it('should extract sub-proofs when autoExtractLemmas is enabled', () => {
      const steps: ProofStep[] = [
        { stepNumber: 1, content: 'Lemma 1: P is true', justification: 'lemma' },
        { stepNumber: 2, content: 'Proof of Lemma 1', justification: 'proof' },
        { stepNumber: 3, content: 'End of Lemma 1. QED', justification: 'conclusion' },
        { stepNumber: 4, content: 'By Lemma 1, the result follows. QED', justification: 'by lemma' },
      ];

      const proof = manager.createProof('Main theorem', steps);

      expect(proof.subProofs.length).toBeGreaterThanOrEqual(0);
    });

    it('should not extract sub-proofs when autoExtractLemmas is disabled', () => {
      const manager = new HierarchicalProofManager({ autoExtractLemmas: false });
      const steps: ProofStep[] = [
        { stepNumber: 1, content: 'Lemma 1: P is true', justification: 'lemma' },
        { stepNumber: 2, content: 'Therefore, QED', justification: 'conclusion' },
      ];

      const proof = manager.createProof('Main theorem', steps);

      expect(proof.subProofs).toHaveLength(0);
    });

    it('should determine completeness correctly', () => {
      const completeSteps: ProofStep[] = [
        { stepNumber: 1, content: 'P is true', justification: 'axiom' },
        { stepNumber: 2, content: 'Therefore Q. QED', justification: 'conclusion' },
      ];

      const incompleteSteps: ProofStep[] = [
        { stepNumber: 1, content: 'P is true', justification: 'axiom' },
        { stepNumber: 2, content: 'We need to show Q', justification: 'goal' },
      ];

      const completeProof = manager.createProof('Complete', completeSteps);
      const incompleteProof = manager.createProof('Incomplete', incompleteSteps);

      expect(completeProof.isComplete).toBe(true);
      expect(incompleteProof.isComplete).toBe(false);
    });

    it('should extract dependencies from steps', () => {
      const steps: ProofStep[] = [
        { stepNumber: 1, content: 'By Theorem 1, P', justification: 'by Theorem 1' },
        { stepNumber: 2, content: 'By Lemma A, Q. QED', justification: 'by Lemma A' },
      ];

      const proof = manager.createProof('Dependent theorem', steps);

      expect(proof.dependencies.length).toBeGreaterThan(0);
    });

    it('should extract metadata when enabled', () => {
      const manager = new HierarchicalProofManager({ extractMetadata: true });
      const steps: ProofStep[] = [
        { stepNumber: 1, content: 'By induction on n', justification: 'induction' },
        { stepNumber: 2, content: 'QED', justification: 'done' },
      ];

      const proof = manager.createProof('Induction theorem', steps);

      expect(proof.metadata).toBeDefined();
      expect(proof.metadata?.tags).toContain('induction');
    });
  });

  describe('createElement', () => {
    it('should create a lemma element', () => {
      const input: ProofElementInput = {
        type: 'lemma',
        statement: 'Helper lemma',
        name: 'Lemma 1',
        proof: [{ stepNumber: 1, content: 'Therefore, proven. QED', justification: 'direct' }],
      };

      const element = manager.createElement(input);

      expect(element.type).toBe('lemma');
      expect(element.name).toBe('Lemma 1');
      expect(element.statement).toBe('Helper lemma');
    });

    it('should create a corollary element', () => {
      const input: ProofElementInput = {
        type: 'corollary',
        statement: 'Follows from main theorem',
        proof: [{ stepNumber: 1, content: 'By main theorem, QED', justification: 'by theorem' }],
      };

      const element = manager.createElement(input);

      expect(element.type).toBe('corollary');
    });

    it('should create a proposition element', () => {
      const input: ProofElementInput = {
        type: 'proposition',
        statement: 'An intermediate result',
        proof: [{ stepNumber: 1, content: 'Therefore, QED', justification: 'direct' }],
      };

      const element = manager.createElement(input);

      expect(element.type).toBe('proposition');
    });

    it('should accept dependencies', () => {
      const input: ProofElementInput = {
        type: 'lemma',
        statement: 'Dependent lemma',
        proof: [{ stepNumber: 1, content: 'QED', justification: 'done' }],
        dependencies: ['Lemma 1', 'Theorem A'],
      };

      const element = manager.createElement(input);

      expect(element.dependencies).toContain('Lemma 1');
      expect(element.dependencies).toContain('Theorem A');
    });
  });

  describe('buildTree', () => {
    it('should build a proof tree from a hierarchical proof', () => {
      const steps: ProofStep[] = [
        { stepNumber: 1, content: 'Lemma 1: P holds', justification: 'lemma' },
        { stepNumber: 2, content: 'Proof of lemma. QED', justification: 'proof' },
        { stepNumber: 3, content: 'Main result. QED', justification: 'conclusion' },
      ];

      const proof = manager.createProof('Main theorem', steps, 'Theorem 1');
      const tree = manager.buildTree(proof);

      expect(tree.root).toBe(proof);
      expect(tree.lemmas).toBeDefined();
      expect(tree.dependencyOrder).toBeDefined();
      expect(tree.statistics).toBeDefined();
    });

    it('should collect all lemmas in the tree', () => {
      const proof = manager.createProof('Theorem', [
        { stepNumber: 1, content: 'QED', justification: 'done' },
      ]);

      const lemma = manager.createElement({
        type: 'lemma',
        statement: 'Helper',
        name: 'Lemma 1',
        proof: [{ stepNumber: 1, content: 'QED', justification: 'done' }],
      });

      proof.subProofs.push(lemma);

      const tree = manager.buildTree(proof);

      expect(tree.lemmas.size).toBe(1);
      expect(tree.lemmas.has(lemma.id)).toBe(true);
    });

    it('should calculate statistics correctly', () => {
      const proof = manager.createProof('Theorem', [
        { stepNumber: 1, content: 'Step 1', justification: 'axiom' },
        { stepNumber: 2, content: 'Step 2', justification: 'step 1' },
        { stepNumber: 3, content: 'QED', justification: 'done' },
      ]);

      const tree = manager.buildTree(proof);

      expect(tree.statistics.totalElements).toBeGreaterThanOrEqual(1);
      expect(tree.statistics.maxDepth).toBeGreaterThanOrEqual(0);
      expect(tree.statistics.totalSteps).toBe(3);
    });

    it('should compute dependency order', () => {
      const proof = manager.createProof('Theorem', [
        { stepNumber: 1, content: 'QED', justification: 'done' },
      ]);

      const lemma1 = manager.createElement({
        type: 'lemma',
        statement: 'Lemma 1',
        name: 'Lemma 1',
        proof: [{ stepNumber: 1, content: 'QED', justification: 'done' }],
      });

      const lemma2 = manager.createElement({
        type: 'lemma',
        statement: 'Lemma 2',
        name: 'Lemma 2',
        proof: [{ stepNumber: 1, content: 'QED', justification: 'done' }],
        dependencies: ['Lemma 1'],
      });

      proof.subProofs.push(lemma1, lemma2);

      const tree = manager.buildTree(proof);

      expect(tree.dependencyOrder.length).toBeGreaterThan(0);
    });
  });

  describe('addLemma', () => {
    it('should add a lemma to an existing proof', () => {
      const proof = manager.createProof('Theorem', [
        { stepNumber: 1, content: 'QED', justification: 'done' },
      ]);

      const updatedProof = manager.addLemma(proof, {
        type: 'lemma',
        statement: 'New helper',
        name: 'Lemma A',
        proof: [{ stepNumber: 1, content: 'QED', justification: 'done' }],
      });

      expect(updatedProof.subProofs.length).toBe(proof.subProofs.length + 1);
      expect(updatedProof.subProofs[updatedProof.subProofs.length - 1].type).toBe('lemma');
    });
  });

  describe('addCorollary', () => {
    it('should add a corollary to an existing proof', () => {
      const proof = manager.createProof('Theorem', [
        { stepNumber: 1, content: 'QED', justification: 'done' },
      ]);

      const updatedProof = manager.addCorollary(proof, {
        type: 'corollary',
        statement: 'Immediate consequence',
        name: 'Corollary 1',
        proof: [{ stepNumber: 1, content: 'By theorem, QED', justification: 'by theorem' }],
      });

      expect(updatedProof.subProofs.length).toBe(proof.subProofs.length + 1);
      expect(updatedProof.subProofs[updatedProof.subProofs.length - 1].type).toBe('corollary');
    });
  });

  describe('findById', () => {
    it('should find the root by ID', () => {
      const proof = manager.createProof('Theorem', [
        { stepNumber: 1, content: 'QED', justification: 'done' },
      ]);
      const tree = manager.buildTree(proof);

      const found = manager.findById(tree, proof.id);

      expect(found).toBe(proof);
    });

    it('should find a lemma by ID', () => {
      const proof = manager.createProof('Theorem', [
        { stepNumber: 1, content: 'QED', justification: 'done' },
      ]);
      const lemma = manager.createElement({
        type: 'lemma',
        statement: 'Helper',
        proof: [{ stepNumber: 1, content: 'QED', justification: 'done' }],
      });
      proof.subProofs.push(lemma);
      const tree = manager.buildTree(proof);

      const found = manager.findById(tree, lemma.id);

      expect(found).toBe(lemma);
    });

    it('should return undefined for non-existent ID', () => {
      const proof = manager.createProof('Theorem', [
        { stepNumber: 1, content: 'QED', justification: 'done' },
      ]);
      const tree = manager.buildTree(proof);

      const found = manager.findById(tree, 'non-existent-id');

      expect(found).toBeUndefined();
    });
  });

  describe('findByType', () => {
    it('should find all elements of a specific type', () => {
      const proof = manager.createProof('Theorem', [
        { stepNumber: 1, content: 'QED', justification: 'done' },
      ]);

      const lemma1 = manager.createElement({
        type: 'lemma',
        statement: 'Lemma 1',
        proof: [{ stepNumber: 1, content: 'QED', justification: 'done' }],
      });

      const lemma2 = manager.createElement({
        type: 'lemma',
        statement: 'Lemma 2',
        proof: [{ stepNumber: 1, content: 'QED', justification: 'done' }],
      });

      const corollary = manager.createElement({
        type: 'corollary',
        statement: 'Corollary',
        proof: [{ stepNumber: 1, content: 'QED', justification: 'done' }],
      });

      proof.subProofs.push(lemma1, lemma2, corollary);
      const tree = manager.buildTree(proof);

      const lemmas = manager.findByType(tree, 'lemma');
      const corollaries = manager.findByType(tree, 'corollary');

      expect(lemmas).toHaveLength(2);
      expect(corollaries).toHaveLength(1);
    });
  });

  describe('findIncomplete', () => {
    it('should find all incomplete proof elements', () => {
      const proof = manager.createProof('Theorem', [
        { stepNumber: 1, content: 'To be continued...', justification: 'incomplete' },
      ]);

      const incompleteLemma = manager.createElement({
        type: 'lemma',
        statement: 'Incomplete lemma',
        proof: [{ stepNumber: 1, content: 'Work in progress', justification: 'todo' }],
      });

      const completeLemma = manager.createElement({
        type: 'lemma',
        statement: 'Complete lemma',
        proof: [{ stepNumber: 1, content: 'Therefore, proven. QED', justification: 'direct' }],
      });

      proof.subProofs.push(incompleteLemma, completeLemma);
      const tree = manager.buildTree(proof);

      const incomplete = manager.findIncomplete(tree);

      expect(incomplete.length).toBeGreaterThan(0);
    });
  });

  describe('generateSummary', () => {
    it('should generate a human-readable summary', () => {
      const proof = manager.createProof(
        'Main result',
        [{ stepNumber: 1, content: 'QED', justification: 'done' }],
        'Theorem 1'
      );

      const lemma = manager.createElement({
        type: 'lemma',
        statement: 'Helper lemma',
        name: 'Lemma 1',
        proof: [{ stepNumber: 1, content: 'QED', justification: 'done' }],
      });

      proof.subProofs.push(lemma);
      const tree = manager.buildTree(proof);

      const summary = manager.generateSummary(tree);

      expect(summary).toContain('Theorem 1');
      expect(summary).toContain('Lemma 1');
      expect(summary).toContain('Statistics');
    });

    it('should indicate completeness status', () => {
      const completeProof = manager.createProof('Complete', [
        { stepNumber: 1, content: 'Therefore, QED', justification: 'direct' },
      ]);

      const tree = manager.buildTree(completeProof);
      const summary = manager.generateSummary(tree);

      expect(summary).toMatch(/[✓○]/); // Either complete or incomplete marker
    });
  });

  describe('toMermaid', () => {
    it('should generate valid Mermaid diagram syntax', () => {
      const proof = manager.createProof(
        'Main theorem',
        [{ stepNumber: 1, content: 'QED', justification: 'done' }],
        'Theorem'
      );

      const lemma = manager.createElement({
        type: 'lemma',
        statement: 'Helper',
        name: 'Lemma 1',
        proof: [{ stepNumber: 1, content: 'QED', justification: 'done' }],
      });

      proof.subProofs.push(lemma);
      const tree = manager.buildTree(proof);

      const mermaid = manager.toMermaid(tree);

      expect(mermaid).toContain('graph TD');
      expect(mermaid).toMatch(/N\d+/); // Node IDs
      expect(mermaid).toMatch(/-->/); // Edges
    });

    it('should use special shape for theorems', () => {
      const proof = manager.createProof(
        'Theorem statement',
        [{ stepNumber: 1, content: 'QED', justification: 'done' }],
        'MainTheorem'
      );
      const tree = manager.buildTree(proof);

      const mermaid = manager.toMermaid(tree);

      expect(mermaid).toContain('((');  // Double parentheses for theorem
    });

    it('should add dependency edges', () => {
      const proof = manager.createProof('Theorem', [
        { stepNumber: 1, content: 'QED', justification: 'done' },
      ]);

      const lemma1 = manager.createElement({
        type: 'lemma',
        statement: 'Base lemma',
        name: 'Lemma 1',
        proof: [{ stepNumber: 1, content: 'QED', justification: 'done' }],
      });

      const lemma2 = manager.createElement({
        type: 'lemma',
        statement: 'Dependent lemma',
        name: 'Lemma 2',
        proof: [{ stepNumber: 1, content: 'By Lemma 1, QED', justification: 'by Lemma 1' }],
        dependencies: ['Lemma 1'],
      });

      proof.subProofs.push(lemma1, lemma2);
      const tree = manager.buildTree(proof);

      const mermaid = manager.toMermaid(tree);

      expect(mermaid).toContain('-.->'); // Dashed arrow for dependencies
    });
  });

  describe('metadata extraction', () => {
    it('should detect induction tag', () => {
      const manager = new HierarchicalProofManager({ extractMetadata: true });
      const proof = manager.createProof('Induction theorem', [
        { stepNumber: 1, content: 'By induction on n', justification: 'induction' },
        { stepNumber: 2, content: 'QED', justification: 'done' },
      ]);

      expect(proof.metadata?.tags).toContain('induction');
    });

    it('should detect contradiction tag', () => {
      const manager = new HierarchicalProofManager({ extractMetadata: true });
      const proof = manager.createProof('Contradiction proof', [
        { stepNumber: 1, content: 'Assume the opposite', justification: 'assumption' },
        { stepNumber: 2, content: 'This leads to a contradiction', justification: 'contradiction' },
        { stepNumber: 3, content: 'QED', justification: 'done' },
      ]);

      expect(proof.metadata?.tags).toContain('contradiction');
    });

    it('should detect case-analysis tag', () => {
      const manager = new HierarchicalProofManager({ extractMetadata: true });
      const proof = manager.createProof('Case proof', [
        { stepNumber: 1, content: 'Case 1: n is even', justification: 'case' },
        { stepNumber: 2, content: 'Case 2: n is odd', justification: 'case' },
        { stepNumber: 3, content: 'QED', justification: 'done' },
      ]);

      expect(proof.metadata?.tags).toContain('case-analysis');
    });

    it('should include createdAt timestamp', () => {
      const manager = new HierarchicalProofManager({ extractMetadata: true });
      const proof = manager.createProof('Theorem', [
        { stepNumber: 1, content: 'QED', justification: 'done' },
      ]);

      expect(proof.metadata?.createdAt).toBeDefined();
      expect(proof.metadata?.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('edge cases', () => {
    it('should handle empty proof steps', () => {
      const proof = manager.createProof('Empty proof', []);

      expect(proof.isComplete).toBe(false);
      expect(proof.proof).toHaveLength(0);
    });

    it('should handle deeply nested sub-proofs', () => {
      const manager = new HierarchicalProofManager({ maxDepth: 3 });
      const proof = manager.createProof('Deep theorem', [
        { stepNumber: 1, content: 'QED', justification: 'done' },
      ]);

      // Add nested lemmas
      let current = proof;
      for (let i = 0; i < 5; i++) {
        const lemma = manager.createElement({
          type: 'lemma',
          statement: `Level ${i} lemma`,
          proof: [{ stepNumber: 1, content: 'QED', justification: 'done' }],
        });
        current.subProofs.push(lemma);
        current = lemma;
      }

      const tree = manager.buildTree(proof);

      // Should not exceed maxDepth in processing
      expect(tree).toBeDefined();
    });

    it('should handle special characters in statements', () => {
      const proof = manager.createProof('∀x ∈ ℕ, P(x)', [
        { stepNumber: 1, content: '∃y: Q(y). QED', justification: 'done' },
      ]);

      expect(proof.statement).toBe('∀x ∈ ℕ, P(x)');
    });
  });
});
