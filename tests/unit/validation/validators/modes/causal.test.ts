/**
 * Causal Validator Tests
 * Tests for src/validation/validators/modes/causal.ts
 *
 * Covered deeply because this validator computes rather than checks presence:
 * it runs a DFS cycle detector over the causal graph, cross-references every
 * edge and intervention against the node set, and range-checks edge strength
 * on a signed scale (-1..1) that differs from every other range in the suite.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CausalValidator } from '../../../../../src/validation/validators/modes/causal.js';
import { ThinkingMode } from '../../../../../src/types/core.js';
import type { CausalThought } from '../../../../../src/types/index.js';
import type { ValidationContext } from '../../../../../src/validation/validator.js';

interface TestNode {
  id: string;
  name: string;
}
interface TestEdge {
  from: string;
  to: string;
  strength?: number;
  confidence?: number;
}

const node = (id: string): TestNode => ({ id, name: `Node ${id}` });

const edge = (from: string, to: string, extra: Partial<TestEdge> = {}): TestEdge => ({
  from,
  to,
  strength: 0.5,
  confidence: 0.8,
  ...extra,
});

describe('CausalValidator', () => {
  let validator: CausalValidator;
  let context: ValidationContext;

  const createThought = (overrides: Record<string, unknown> = {}): CausalThought =>
    ({
      id: 'thought-1',
      mode: ThinkingMode.CAUSAL,
      thought: 'Test thought',
      content: 'Smoking causes cancer',
      thoughtNumber: 1,
      totalThoughts: 5,
      nextThoughtNeeded: true,
      ...overrides,
    }) as unknown as CausalThought;

  const graph = (nodes: TestNode[], edges: TestEdge[]) => ({
    causalGraph: { nodes, edges },
  });

  const descriptions = (thought: CausalThought): string[] =>
    validator.validate(thought, context).map((issue) => issue.description);

  beforeEach(() => {
    validator = new CausalValidator();
    context = { sessionId: 'test-session', existingThoughts: new Map() };
  });

  describe('getMode', () => {
    it('identifies itself as the causal validator', () => {
      expect(validator.getMode()).toBe('causal');
    });
  });

  describe('minimal input', () => {
    it('reports nothing for a well-formed thought with no causal graph', () => {
      expect(validator.validate(createThought(), context)).toEqual([]);
    });

    it('reports nothing for a well-formed acyclic graph', () => {
      const thought = createThought(
        graph([node('a'), node('b')], [edge('a', 'b')]),
      );

      expect(validator.validate(thought, context)).toEqual([]);
    });

    it('applies the shared base checks', () => {
      const thought = createThought({ thoughtNumber: 0, totalThoughts: 0 });

      expect(descriptions(thought)).toEqual(
        expect.arrayContaining([
          'Thought number must be positive',
          'Total thoughts must be positive',
        ]),
      );
    });
  });

  describe('edge endpoint references', () => {
    it('rejects an edge whose source node does not exist', () => {
      const thought = createThought(
        graph([node('a')], [edge('ghost', 'a')]),
      );

      const issues = validator.validate(thought, context);
      const issue = issues.find((i) =>
        i.description.includes('non-existent source node'),
      );
      expect(issue?.description).toBe(
        'Edge references non-existent source node: ghost',
      );
      expect(issue?.severity).toBe('error');
      expect(issue?.category).toBe('structural');
    });

    it('rejects an edge whose target node does not exist', () => {
      const thought = createThought(graph([node('a')], [edge('a', 'ghost')]));

      expect(descriptions(thought)).toContain(
        'Edge references non-existent target node: ghost',
      );
    });

    it('reports both endpoints when neither exists', () => {
      const thought = createThought(graph([node('a')], [edge('x', 'y')]));

      const errors = validator
        .validate(thought, context)
        .filter((i) => i.description.includes('non-existent'));
      expect(errors).toHaveLength(2);
    });
  });

  describe('edge strength and confidence ranges', () => {
    it('accepts a negative strength, because causation can be inhibitory', () => {
      const thought = createThought(
        graph([node('a'), node('b')], [edge('a', 'b', { strength: -1 })]),
      );

      expect(validator.validate(thought, context)).toEqual([]);
    });

    it('accepts the exact bounds of the strength scale', () => {
      for (const strength of [-1, 0, 1]) {
        const thought = createThought(
          graph([node('a'), node('b')], [edge('a', 'b', { strength })]),
        );
        expect(validator.validate(thought, context), `strength ${strength}`).toEqual(
          [],
        );
      }
    });

    it('rejects a strength outside -1..1 and names the edge', () => {
      const thought = createThought(
        graph([node('a'), node('b')], [edge('a', 'b', { strength: 1.5 })]),
      );

      const issue = validator
        .validate(thought, context)
        .find((i) => i.description.includes('Edge strength'));
      expect(issue?.description).toBe(
        'Edge strength (a -> b) must be between -1 and 1',
      );
      expect(issue?.severity).toBe('error');
    });

    it('rejects a negative confidence, which is a narrower range than strength', () => {
      const thought = createThought(
        graph([node('a'), node('b')], [edge('a', 'b', { confidence: -0.5 })]),
      );

      expect(descriptions(thought)).toContain(
        'Edge confidence (a -> b) must be between 0 and 1',
      );
    });

    it('skips both range checks when the values are absent', () => {
      const thought = createThought(
        graph(
          [node('a'), node('b')],
          [{ from: 'a', to: 'b' } as TestEdge],
        ),
      );

      expect(validator.validate(thought, context)).toEqual([]);
    });
  });

  describe('cycle detection', () => {
    it('warns about a two-node cycle', () => {
      const thought = createThought(
        graph([node('a'), node('b')], [edge('a', 'b'), edge('b', 'a')]),
      );

      const issue = validator
        .validate(thought, context)
        .find((i) => i.description.includes('cycles'));
      expect(issue?.description).toBe(
        'Causal graph contains cycles (feedback loops)',
      );
      expect(issue?.severity).toBe('warning');
    });

    it('warns about a self-loop', () => {
      const thought = createThought(graph([node('a')], [edge('a', 'a')]));

      expect(descriptions(thought)).toContain(
        'Causal graph contains cycles (feedback loops)',
      );
    });

    it('warns about a cycle three nodes long', () => {
      const thought = createThought(
        graph(
          [node('a'), node('b'), node('c')],
          [edge('a', 'b'), edge('b', 'c'), edge('c', 'a')],
        ),
      );

      expect(descriptions(thought)).toContain(
        'Causal graph contains cycles (feedback loops)',
      );
    });

    it('does NOT report a cycle for a diamond, where two paths reconverge', () => {
      // a->b, a->c, b->d, c->d. Node d is visited twice but is never on the
      // recursion stack the second time. A detector that treated "already
      // visited" as "cycle" would report one here; this is the case that
      // separates a correct DFS from a plausible-looking wrong one.
      const thought = createThought(
        graph(
          [node('a'), node('b'), node('c'), node('d')],
          [edge('a', 'b'), edge('a', 'c'), edge('b', 'd'), edge('c', 'd')],
        ),
      );

      expect(validator.validate(thought, context)).toEqual([]);
    });

    it('does NOT report a cycle for a long chain', () => {
      const nodes = ['a', 'b', 'c', 'd', 'e', 'f'].map(node);
      const edges = [
        edge('a', 'b'),
        edge('b', 'c'),
        edge('c', 'd'),
        edge('d', 'e'),
        edge('e', 'f'),
      ];

      expect(
        validator.validate(createThought(graph(nodes, edges)), context),
      ).toEqual([]);
    });

    it('finds a cycle that sits in a disconnected second component', () => {
      // The DFS must restart from unvisited nodes, or a cycle reachable from
      // no earlier root goes unseen.
      const thought = createThought(
        graph(
          [node('a'), node('b'), node('x'), node('y')],
          [edge('a', 'b'), edge('x', 'y'), edge('y', 'x')],
        ),
      );

      expect(descriptions(thought)).toContain(
        'Causal graph contains cycles (feedback loops)',
      );
    });

    it('suppresses the cycle warning when a feedback mechanism explains it', () => {
      const thought = createThought({
        ...graph([node('a'), node('b')], [edge('a', 'b'), edge('b', 'a')]),
        mechanisms: [{ type: 'feedback', description: 'Reinforcing loop' }],
      });

      expect(validator.validate(thought, context)).toEqual([]);
    });

    it('still warns when the declared mechanism is not a feedback one', () => {
      const thought = createThought({
        ...graph([node('a'), node('b')], [edge('a', 'b'), edge('b', 'a')]),
        mechanisms: [{ type: 'mediation', description: 'Mediated effect' }],
      });

      expect(descriptions(thought)).toContain(
        'Causal graph contains cycles (feedback loops)',
      );
    });
  });

  describe('isolated nodes', () => {
    it('notes a node with no edges as isolated', () => {
      const thought = createThought(
        graph([node('a'), node('b'), node('lonely')], [edge('a', 'b')]),
      );

      const issue = validator
        .validate(thought, context)
        .find((i) => i.description.includes('isolated'));
      expect(issue?.description).toBe(
        'Node "Node lonely" is isolated (no connections)',
      );
      expect(issue?.severity).toBe('info');
    });

    it('does not call a single node isolated, since it cannot connect to anything', () => {
      const thought = createThought(graph([node('only')], []));

      expect(validator.validate(thought, context)).toEqual([]);
    });

    it('counts a node as connected when it is only an edge target', () => {
      const thought = createThought(
        graph([node('a'), node('b')], [edge('a', 'b')]),
      );

      expect(
        descriptions(thought).filter((d) => d.includes('isolated')),
      ).toEqual([]);
    });
  });

  describe('interventions', () => {
    it('accepts an intervention on an existing node', () => {
      const thought = createThought({
        ...graph([node('a'), node('b')], [edge('a', 'b')]),
        interventions: [
          {
            nodeId: 'a',
            expectedEffects: [{ nodeId: 'b', confidence: 0.9 }],
          },
        ],
      });

      expect(validator.validate(thought, context)).toEqual([]);
    });

    it('rejects an intervention on a node that does not exist', () => {
      const thought = createThought({
        ...graph([node('a')], []),
        interventions: [{ nodeId: 'ghost', expectedEffects: [] }],
      });

      expect(descriptions(thought)).toContain(
        'Intervention references non-existent node: ghost',
      );
    });

    it('rejects an expected effect on a node that does not exist', () => {
      const thought = createThought({
        ...graph([node('a')], []),
        interventions: [
          {
            nodeId: 'a',
            expectedEffects: [{ nodeId: 'ghost', confidence: 0.5 }],
          },
        ],
      });

      expect(descriptions(thought)).toContain(
        'Intervention effect references non-existent node: ghost',
      );
    });

    it('range-checks the confidence of each expected effect', () => {
      const thought = createThought({
        ...graph([node('a'), node('b')], []),
        interventions: [
          {
            nodeId: 'a',
            expectedEffects: [{ nodeId: 'b', confidence: 1.4 }],
          },
        ],
      });

      expect(descriptions(thought)).toContain(
        'Intervention effect confidence must be between 0 and 1',
      );
    });

    it('rejects every intervention when the thought carries no graph at all', () => {
      // The node set falls back to empty, so every reference is dangling.
      const thought = createThought({
        interventions: [{ nodeId: 'a', expectedEffects: [] }],
      });

      expect(descriptions(thought)).toContain(
        'Intervention references non-existent node: a',
      );
    });
  });

  describe('issue shape', () => {
    it('stamps every issue with the thought number it came from', () => {
      const thought = createThought({
        thoughtNumber: 4,
        ...graph([node('a')], [edge('ghost', 'a', { strength: 9 })]),
      });

      const issues = validator.validate(thought, context);
      expect(issues.length).toBeGreaterThan(0);
      for (const issue of issues) {
        expect(issue.thoughtNumber).toBe(4);
        expect(issue.suggestion).toBeTruthy();
      }
    });

    it('does not mutate the thought it validates', () => {
      const thought = createThought(
        graph([node('a'), node('b')], [edge('a', 'b'), edge('b', 'a')]),
      );
      const snapshot = JSON.stringify(thought);

      validator.validate(thought, context);

      expect(JSON.stringify(thought)).toBe(snapshot);
    });
  });
});
