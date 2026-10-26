/**
 * Wiring test for the mode exporters that call `exportByFormat`.
 *
 * Each exporter hands eleven converters to the shared dispatcher. A converter in the wrong slot,
 * or a wrapper that passes its arguments in the wrong order, changes the output of one format
 * and leaves the other ten alone. The snapshot holds a hash of the output for every format of
 * each exporter, so such a change fails here. Run `vitest -u` to record a new hash on purpose.
 */

import { createHash } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  exportEngineeringAnalysis,
  exportHybridOrchestration,
  exportPhysicsVisualization,
  exportSequentialDependencyGraph,
  exportTemporalTimeline,
} from '../../../../../src/export/visual/modes/index.js';
import type {
  VisualExportOptions,
  VisualFormat,
} from '../../../../../src/export/visual/types.js';

const FORMATS: VisualFormat[] = [
  'mermaid',
  'dot',
  'ascii',
  'svg',
  'graphml',
  'tikz',
  'modelica',
  'html',
  'uml',
  'json',
  'markdown',
];

const base = {
  sessionId: 's',
  thoughtNumber: 1,
  totalThoughts: 1,
  timestamp: new Date('2025-01-01T00:00:00Z'),
  nextThoughtNeeded: false,
  uncertainty: 0.3,
};

type Exporter = (thought: any, options: VisualExportOptions) => string;

/** Name, exporter, a full thought and a sparse thought for each exporter. */
const EXPORTERS: Array<[string, Exporter, any, any]> = [
  [
    'sequential',
    exportSequentialDependencyGraph,
    {
      ...base,
      id: 'seq-1',
      mode: 'sequential',
      content: 'Sequential reasoning step',
      dependencies: ['a', 'b'],
      subtasks: [
        { id: 's1', description: 'Step 1', status: 'completed' },
        { id: 's2', description: 'Step 2', status: 'in_progress' },
      ],
    },
    { ...base, id: 'seq-2', mode: 'sequential', content: 'Short', dependencies: [], subtasks: [] },
  ],
  [
    'temporal',
    exportTemporalTimeline,
    {
      ...base,
      id: 'temp-1',
      mode: 'temporal',
      content: 'Temporal analysis',
      thoughtType: 'causality_timeline',
      timeline: { id: 'tl', name: 'Launch', timeUnit: 'seconds', events: [] },
      events: [
        { id: 'e1', name: 'Kickoff', description: 'Start', timestamp: 100, type: 'instant', properties: {} },
        { id: 'e2', name: 'Build', description: 'Work', timestamp: 200, duration: 50, type: 'interval', properties: {} },
      ],
      relations: [{ id: 'r1', from: 'e1', to: 'e2', relationType: 'enables', strength: 0.7 }],
    },
    {
      ...base,
      id: 'temp-2',
      mode: 'temporal',
      content: 'Empty timeline',
      timeline: { events: [], relationships: [] },
    },
  ],
  [
    'hybrid',
    exportHybridOrchestration,
    {
      ...base,
      id: 'hybrid-1',
      mode: 'hybrid',
      content: 'Hybrid reasoning',
      primaryMode: 'sequential',
      secondaryFeatures: ['causal-links', 'temporal-ordering'],
      hybridComponents: {
        activeModes: ['sequential', 'causal'],
        modeContributions: { sequential: 0.6, causal: 0.4 },
        integrationStrategy: 'parallel',
        synthesisApproach: 'weighted',
      },
    },
    {
      ...base,
      id: 'hybrid-2',
      mode: 'hybrid',
      content: 'Hybrid sparse',
      primaryMode: 'bayesian',
      secondaryFeatures: [],
    },
  ],
  [
    'physics',
    exportPhysicsVisualization,
    {
      ...base,
      id: 'phys-1',
      mode: 'physics',
      content: 'Physics analysis',
      physicalSystem: {
        name: 'Pendulum',
        components: [{ name: 'mass', type: 'point mass' }],
        constraints: ['Conservation of energy'],
        equations: ['E = mgh'],
      },
    },
    {
      ...base,
      id: 'phys-2',
      mode: 'physics',
      content: 'Physics sparse',
      physicalSystem: { name: 'Empty', components: [], constraints: [], equations: [] },
    },
  ],
  [
    'engineering',
    exportEngineeringAnalysis,
    {
      ...base,
      id: 'eng-1',
      mode: 'engineering',
      content: 'Engineering analysis',
      analysisType: 'system',
      designChallenge: 'Build a scalable microservices architecture with high availability',
      requirements: {
        requirements: [
          { id: 'r1', title: 'High Availability', description: '99.9% uptime', priority: 'high', source: 'stakeholder', type: 'functional', status: 'verified' },
          { id: 'r2', title: 'Scalability', description: 'Handle 10x load', priority: 'high', source: 'stakeholder', type: 'functional', status: 'implemented' },
        ],
        coverage: { verified: 1, implemented: 1, total: 2, percentage: 100 },
      },
      designDecisions: {
        decisions: [
          { id: 'd1', title: 'Use Kubernetes', status: 'accepted', context: 'Needs scale', decision: 'Adopt it', alternatives: [], rationale: 'Industry standard', consequences: ['c1'] },
          { id: 'd2', title: 'Event-driven design', status: 'proposed', context: 'Needs decoupling', decision: 'Adopt events', alternatives: [], rationale: 'Loose coupling', consequences: ['c1'] },
        ],
      },
      assessment: {
        confidence: 0.85,
        risks: [],
        keyRisks: ['Data migration complexity'],
        openIssues: ['Performance testing pending'],
        recommendations: [],
        nextSteps: ['Pilot', 'Review'],
      },
      constraints: ['Budget limit', 'Time constraint'],
      implementation: { status: 'in_progress', completeness: 0.5 },
    },
    {
      ...base,
      id: 'eng-2',
      mode: 'engineering',
      content: 'Engineering sparse',
      analysisType: 'trade-off',
      designChallenge: 'Small',
    },
  ],
];

const OPTION_SETS: Array<[string, Partial<VisualExportOptions>]> = [
  ['default', {}],
  ['plain', { colorScheme: 'pastel', includeLabels: false, includeMetrics: false }],
];

const hash = (text: string): string => createHash('sha1').update(text).digest('hex').slice(0, 16);

describe('mode exporters that call exportByFormat', () => {
  // The json format writes the export time.
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-01T00:00:00Z'));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('keep the output of every format', () => {
    const hashes: Record<string, string> = {};
    for (const [name, exporter, full, sparse] of EXPORTERS) {
      for (const format of FORMATS) {
        for (const [label, extra] of OPTION_SETS) {
          hashes[`${name}|${format}|${label}`] = hash(exporter(full, { format, ...extra }));
        }
        hashes[`${name}|${format}|sparse`] = hash(exporter(sparse, { format }));
      }
    }

    expect(hashes).toMatchSnapshot();
  });

  it.each(EXPORTERS.map(([name, exporter, full]) => [name, exporter, full] as const))(
    '%s throws for a format that no case names',
    (_name, exporter, full) => {
      expect(() => exporter(full, { format: 'nope' as unknown as VisualFormat })).toThrow(
        'Unsupported format: nope',
      );
    },
  );
});
