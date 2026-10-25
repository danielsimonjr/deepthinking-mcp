/**
 * Engineering visual exporter: every input the contract accepts exports
 *
 * The tool schema accepts a sparse entry (every field optional) and a bare
 * string as a trade-study criterion. EngineeringHandler fills what the thought
 * type requires, and the exporters read the stored thought without a check. The
 * session tool offers eight of the eleven visual formats; SVG, GraphML, TikZ,
 * Modelica and UML are reachable only through this function, so the tool-level
 * test cannot cover them.
 */

import { describe, it, expect } from 'vitest';
import { EngineeringHandler } from '../../../../../src/modes/handlers/EngineeringHandler.js';
import { exportEngineeringAnalysis } from '../../../../../src/export/visual/modes/engineering.js';
import type { EngineeringThought } from '../../../../../src/types/modes/engineering.js';
import type { ThinkingToolInput } from '../../../../../src/tools/thinking.js';
import type { VisualFormat } from '../../../../../src/export/visual/types.js';

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

function thoughtOf(extra: Record<string, unknown>): EngineeringThought {
  return new EngineeringHandler().createThought(
    {
      thought: 't',
      thoughtNumber: 1,
      totalThoughts: 1,
      nextThoughtNeeded: false,
      mode: 'engineering',
      ...extra,
    } as ThinkingToolInput,
    's'
  );
}

const CASES: Record<string, Record<string, unknown>> = {
  'string criteria': {
    tradeStudy: {
      alternatives: [{ id: 'a', name: 'A', description: 'd' }],
      criteria: ['cost', 'mass'],
      scores: [{ alternativeId: 'a', criteriaId: 'cost', score: 2 }],
      recommendation: 'a',
    },
  },
  'sparse trade study': {
    tradeStudy: {
      alternatives: [{ id: 'a' }, {}],
      criteria: [{ id: 'x' }, {}],
      scores: [{ alternativeId: 'a' }, {}],
    },
  },
  'sparse fmea': { fmea: { failureModes: [{}, { severity: 9 }] } },
  'sparse requirement and decision': {
    requirements: { requirements: [{}] },
    designDecisions: { decisions: [{ alternatives: [{}] }] },
  },
};

describe('engineering visual exporter: accepted input', () => {
  for (const [label, fields] of Object.entries(CASES)) {
    describe(label, () => {
      for (const format of FORMATS) {
        it(`exports as ${format}`, () => {
          const out = exportEngineeringAnalysis(thoughtOf(fields), { format });
          expect(out.length).toBeGreaterThan(0);
        });
      }
    });
  }

  it('names a string criterion, at weight 0, in the formats that list criteria', () => {
    const thought = thoughtOf(CASES['string criteria']);
    for (const format of ['html', 'markdown', 'json'] as VisualFormat[]) {
      const out = exportEngineeringAnalysis(thought, { format });
      expect(out, format).toContain('cost');
      expect(out, format).not.toMatch(/undefined|NaN/);
    }
  });

  it('prints no undefined or NaN for a sparse failure mode', () => {
    const thought = thoughtOf(CASES['sparse fmea']);
    for (const format of ['html', 'markdown', 'json'] as VisualFormat[]) {
      expect(exportEngineeringAnalysis(thought, { format }), format).not.toMatch(
        /undefined|NaN/
      );
    }
  });
});
