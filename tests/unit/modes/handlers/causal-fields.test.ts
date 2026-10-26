/**
 * createCausalFields and the two handlers that use it.
 *
 * CausalHandler and GenericModeHandler (in causal mode) write the same six fields of a causal
 * thought: mode, thoughtType, causalGraph, interventions, mechanisms and confounders, in that
 * order, after the base fields and the two revision fields. The helper holds those six lines;
 * each handler keeps the base fields and the revision fields. CausalHandler.validate reads the
 * graph of the input in the same way, so it uses readCausalGraph.
 */

import { describe, it, expect } from 'vitest';
import { createCausalFields, readCausalGraph } from '../../../../src/modes/handlers/causal-fields.js';
import { CausalHandler } from '../../../../src/modes/handlers/CausalHandler.js';
import { GenericModeHandler } from '../../../../src/modes/handlers/GenericModeHandler.js';
import { ThinkingMode } from '../../../../src/types/core.js';
import type { ModeHandler } from '../../../../src/modes/handlers/ModeHandler.js';
import type { ThinkingToolInput } from '../../../../src/tools/thinking.js';

const FIELDS = ['mode', 'thoughtType', 'causalGraph', 'interventions', 'mechanisms', 'confounders'];

const THOUGHT_KEYS = [
  'id',
  'sessionId',
  'thoughtNumber',
  'totalThoughts',
  'content',
  'timestamp',
  'nextThoughtNeeded',
  'isRevision',
  'revisesThought',
  ...FIELDS,
];

const inputFor = (extra: Record<string, unknown> = {}): ThinkingToolInput =>
  ({
    mode: 'causal',
    thought: 'a thought',
    thoughtNumber: 2,
    totalThoughts: 3,
    nextThoughtNeeded: true,
    ...extra,
  }) as unknown as ThinkingToolInput;

describe('createCausalFields', () => {
  it('returns the six fields in a fixed order', () => {
    expect(Object.keys(createCausalFields(inputFor()))).toEqual(FIELDS);
  });

  it('sets the mode to causal', () => {
    expect(createCausalFields(inputFor()).mode).toBe(ThinkingMode.CAUSAL);
    expect(createCausalFields(inputFor({ mode: 'hybrid' })).mode).toBe('causal');
  });

  it('fills the defaults: problem_definition, an empty graph and three empty lists', () => {
    const fields = createCausalFields(inputFor());

    expect(fields.thoughtType).toBe('problem_definition');
    expect(fields.causalGraph).toEqual({ nodes: [], edges: [] });
    expect(fields.interventions).toEqual([]);
    expect(fields.mechanisms).toEqual([]);
    expect(fields.confounders).toEqual([]);
  });

  describe('thoughtType', () => {
    it('keeps a thought type that is valid', () => {
      expect(createCausalFields(inputFor({ thoughtType: 'model' })).thoughtType).toBe('model');
      expect(createCausalFields(inputFor({ thoughtType: 'constraints' })).thoughtType).toBe('constraints');
    });

    it('falls back to problem_definition for a value that is not a thought type', () => {
      for (const thoughtType of ['bogus', 'Model', 5, '', null, undefined]) {
        expect(createCausalFields(inputFor({ thoughtType })).thoughtType).toBe('problem_definition');
      }
    });
  });

  it('takes the graph from readCausalGraph', () => {
    const causalGraph = { nodes: [{ id: 'a' }], edges: [] };
    const nodes = [{ id: 'n' }];

    expect(createCausalFields(inputFor({ causalGraph })).causalGraph).toBe(causalGraph);
    expect(createCausalFields(inputFor({ nodes })).causalGraph).toEqual({ nodes, edges: [] });
  });

  describe('interventions, mechanisms and confounders', () => {
    it('keeps the given lists and does not copy them', () => {
      const interventions = ['i'];
      const mechanisms = ['m'];
      const confounders = ['c'];
      const fields = createCausalFields(inputFor({ interventions, mechanisms, confounders }));

      expect(fields.interventions).toBe(interventions);
      expect(fields.mechanisms).toBe(mechanisms);
      expect(fields.confounders).toBe(confounders);
    });

    it('reads each list from its own field of the input', () => {
      const fields = createCausalFields(inputFor({ interventions: ['i'], mechanisms: ['m'], confounders: ['c'] }));

      expect(fields.interventions).toEqual(['i']);
      expect(fields.mechanisms).toEqual(['m']);
      expect(fields.confounders).toEqual(['c']);
    });

    it('returns a new empty list for each call', () => {
      const a = createCausalFields(inputFor());
      const b = createCausalFields(inputFor());

      expect(a.interventions).not.toBe(b.interventions);
      expect(a.mechanisms).not.toBe(b.mechanisms);
      expect(a.confounders).not.toBe(b.confounders);
    });

    it('reads null, 0 and empty text as an empty list', () => {
      for (const value of [null, 0, '']) {
        const fields = createCausalFields(inputFor({ interventions: value, mechanisms: value, confounders: value }));

        expect(fields.interventions).toEqual([]);
        expect(fields.mechanisms).toEqual([]);
        expect(fields.confounders).toEqual([]);
      }
    });

    it('keeps a value that is set but is not a list', () => {
      const fields = createCausalFields(inputFor({ interventions: 's', mechanisms: 's', confounders: 's' }));

      expect(fields.interventions).toBe('s');
      expect(fields.mechanisms).toBe('s');
      expect(fields.confounders).toBe('s');
    });
  });
});

describe('readCausalGraph', () => {
  it('keeps the given graph and does not copy it', () => {
    const causalGraph = { nodes: [{ id: 'a' }], edges: [{ from: 'a', to: 'b' }] };

    expect(readCausalGraph(inputFor({ causalGraph }))).toBe(causalGraph);
  });

  it('keeps a graph that has one part only, with no default for the other part', () => {
    const onlyNodes = { nodes: [{ id: 'a' }] };
    const onlyEdges = { edges: [{ from: 'a', to: 'b' }] };

    expect(readCausalGraph(inputFor({ causalGraph: onlyNodes }))).toBe(onlyNodes);
    expect(readCausalGraph(inputFor({ causalGraph: onlyEdges }))).toBe(onlyEdges);
  });

  it('builds the graph from nodes and edges when no graph is given', () => {
    const nodes = [{ id: 'a' }];
    const edges = [{ from: 'a', to: 'b' }];
    const graph = readCausalGraph(inputFor({ nodes, edges }));

    expect(graph).toEqual({ nodes, edges });
    expect(graph.nodes).toBe(nodes);
    expect(graph.edges).toBe(edges);
  });

  it('uses an empty list for the nodes or the edges that are missing', () => {
    const nodes = [{ id: 'a' }];
    const edges = [{ from: 'a', to: 'b' }];

    expect(readCausalGraph(inputFor({ nodes }))).toEqual({ nodes, edges: [] });
    expect(readCausalGraph(inputFor({ edges }))).toEqual({ nodes: [], edges });
  });

  it('ignores nodes and edges when a graph is given', () => {
    const causalGraph = { nodes: [], edges: [] };
    const graph = readCausalGraph(inputFor({ causalGraph, nodes: [{ id: 'x' }], edges: [{ from: 'x', to: 'y' }] }));

    expect(graph).toBe(causalGraph);
    expect(graph.nodes).toEqual([]);
  });

  it('reads a graph that is null, 0 or empty text as no graph', () => {
    const nodes = [{ id: 'a' }];

    for (const causalGraph of [null, 0, '']) {
      expect(readCausalGraph(inputFor({ causalGraph, nodes }))).toEqual({ nodes, edges: [] });
    }
  });

  it('reads nodes or edges that are null, 0 or empty text as empty lists', () => {
    for (const value of [null, 0, '']) {
      expect(readCausalGraph(inputFor({ nodes: value, edges: value }))).toEqual({ nodes: [], edges: [] });
    }
  });

  it('returns a new graph and new lists for each call', () => {
    const a = readCausalGraph(inputFor());
    const b = readCausalGraph(inputFor());

    expect(a).not.toBe(b);
    expect(a.nodes).not.toBe(b.nodes);
    expect(a.edges).not.toBe(b.edges);
  });
});

describe.each<[string, () => ModeHandler]>([
  ['CausalHandler', () => new CausalHandler()],
  ['GenericModeHandler in causal mode', () => new GenericModeHandler(ThinkingMode.CAUSAL)],
])('%s', (_name, make) => {
  const create = (extra: Record<string, unknown> = {}) => make().createThought(inputFor(extra), 'sess-1');

  it('ends the thought with the six causal fields, after the revision fields', () => {
    expect(Object.keys(create())).toEqual(THOUGHT_KEYS);
  });

  it('gives the six fields that createCausalFields gives for the same input', () => {
    const inputs = [
      {},
      { thoughtType: 'model', interventions: ['i'], mechanisms: ['m'], confounders: ['c'] },
      { causalGraph: { nodes: [{ id: 'a' }], edges: [] } },
      { nodes: [{ id: 'n' }], edges: [{ from: 'n', to: 'm' }], thoughtType: 'bogus' },
      { causalGraph: null, nodes: null, interventions: null },
    ];

    for (const extra of inputs) {
      const thought = create(extra) as unknown as Record<string, unknown>;
      const fields = createCausalFields(inputFor(extra)) as unknown as Record<string, unknown>;

      for (const key of FIELDS) {
        expect(thought[key], key).toEqual(fields[key]);
      }
    }
  });

  it('keeps the base fields and the two revision fields', () => {
    const thought = create({ isRevision: true, revisesThought: 't1' });

    expect(thought).toMatchObject({
      sessionId: 'sess-1',
      thoughtNumber: 2,
      totalThoughts: 3,
      content: 'a thought',
      nextThoughtNeeded: true,
      isRevision: true,
      revisesThought: 't1',
      mode: 'causal',
    });
  });

  it('builds the graph from nodes and edges when the input has no graph', () => {
    const nodes = [{ id: 'a' }];
    const thought = create({ nodes }) as unknown as { causalGraph: { nodes: unknown; edges: unknown } };

    expect(thought.causalGraph.nodes).toBe(nodes);
    expect(thought.causalGraph.edges).toEqual([]);
  });
});

describe('CausalHandler and GenericModeHandler', () => {
  it('give the same causal fields for the same input', () => {
    const inputs = [
      {},
      { thoughtType: 'constraints', interventions: ['i'] },
      { causalGraph: { nodes: [{ id: 'a' }] }, mechanisms: ['m'], confounders: ['c'] },
      { nodes: [{ id: 'n' }], edges: [] },
    ];

    for (const extra of inputs) {
      const causal = new CausalHandler().createThought(inputFor(extra), 'sess-1') as unknown as Record<string, unknown>;
      const generic = new GenericModeHandler(ThinkingMode.CAUSAL).createThought(inputFor(extra), 'sess-1') as unknown as Record<string, unknown>;

      for (const key of FIELDS) {
        expect(causal[key], key).toEqual(generic[key]);
      }
    }
  });
});

describe('CausalHandler.validate reads the graph of the input', () => {
  const node = (id: string) => ({ id, name: id, type: 'cause', description: 'd' });
  const codes = (extra: Record<string, unknown>): string[] =>
    new CausalHandler().validate(inputFor(extra)).errors.map((error) => error.code);

  it('checks the edges against the nodes when the input has no graph', () => {
    expect(codes({ nodes: [node('a')], edges: [{ from: 'a', to: 'zzz' }] })).toEqual(['INVALID_EDGE_TARGET']);
    expect(codes({ nodes: [node('a')], edges: [{ from: 'zzz', to: 'a' }] })).toEqual(['INVALID_EDGE_SOURCE']);
  });

  it('checks the nodes alone for a duplicate id', () => {
    expect(codes({ nodes: [node('a'), node('a')] })).toEqual(['DUPLICATE_NODE_IDS']);
  });

  it('checks edges that have no nodes', () => {
    expect(codes({ edges: [{ from: 'a', to: 'b' }] })).toEqual(['INVALID_EDGE_SOURCE', 'INVALID_EDGE_TARGET']);
  });

  it('finds no graph error when the input has no graph, nodes or edges', () => {
    expect(codes({})).toEqual([]);
  });

  it('checks the given graph and ignores nodes and edges', () => {
    const good = { nodes: [node('a'), node('b')], edges: [{ from: 'a', to: 'b' }] };
    const bad = { nodes: [node('a')], edges: [{ from: 'a', to: 'zzz' }] };

    expect(codes({ causalGraph: good, nodes: bad.nodes, edges: bad.edges })).toEqual([]);
    expect(codes({ causalGraph: bad, nodes: good.nodes, edges: good.edges })).toEqual(['INVALID_EDGE_TARGET']);
  });

  it('reads a graph that is null as no graph', () => {
    expect(codes({ causalGraph: null, nodes: [node('a')], edges: [{ from: 'a', to: 'zzz' }] })).toEqual(['INVALID_EDGE_TARGET']);
  });

  it('reads nodes or edges that are null as empty lists', () => {
    expect(codes({ nodes: null, edges: null })).toEqual([]);
  });
});
