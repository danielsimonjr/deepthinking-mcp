/**
 * LaTeX item lists.
 *
 * Eight fields of a thought are written as a list of escaped strings: a begin line, one
 * `  \item` line per element and an end line. The heading above the list and the guard that
 * decides whether to write it differ per field, so each field is pinned on its own.
 */

import { describe, it, expect } from 'vitest';
import { LaTeXExporter } from '../../../src/export/visual/utils/latex.js';
import type { ThinkingSession } from '../../../src/types/session.js';

const session = (mode: string, extra: Record<string, unknown>): ThinkingSession =>
  ({
    id: 's1',
    title: 'Item lists',
    mode,
    thoughts: [
      {
        id: 't1',
        mode,
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'content',
        nextThoughtNeeded: false,
        isRevision: false,
        timestamp: new Date('2026-01-02T03:04:05Z'),
        ...extra,
      },
    ],
    isComplete: false,
    createdAt: new Date('2026-01-02T03:04:05Z'),
    updatedAt: new Date('2026-01-02T03:04:05Z'),
    tags: [],
  }) as unknown as ThinkingSession;

const bayesian = (alternatives?: string[]) => ({
  hypothesis: { statement: 'H', ...(alternatives === undefined ? {} : { alternatives }) },
  prior: { probability: 0.5, justification: 'j' },
  posterior: { probability: 0.6, calculation: 'c' },
});

const analogical = (limitations?: string[]) => ({
  sourceDomain: { name: 'S', description: 'sd' },
  targetDomain: { name: 'T', description: 'td' },
  analogyStrength: 0.5,
  ...(limitations === undefined ? {} : { limitations }),
});

const physics = (conservationLaws: string[]) => ({
  physicalInterpretation: { quantity: 'Q', units: 'u', conservationLaws },
});

type Field = {
  name: string;
  env: 'itemize' | 'enumerate';
  heading: string;
  build: (items?: string[]) => ThinkingSession;
};

const fields: Field[] = [
  {
    name: 'assumptions',
    env: 'itemize',
    heading: String.raw`\paragraph{Assumptions}`,
    build: (items) => session('mathematics', items === undefined ? {} : { assumptions: items }),
  },
  {
    name: 'invariants',
    env: 'itemize',
    heading: String.raw`\textit{Invariants:}`,
    build: (items) =>
      session('mathematics', {
        mathematicalModel: { latex: 'x', ...(items === undefined ? {} : { invariants: items }) },
      }),
  },
  {
    name: 'hypotheses',
    env: 'enumerate',
    heading: String.raw`\\\textbf{Hypotheses:}`,
    build: (items) =>
      session('mathematics', {
        theorems: [{ name: 'Th', statement: 'st', ...(items === undefined ? {} : { hypotheses: items }) }],
      }),
  },
  {
    name: 'premises',
    env: 'enumerate',
    heading: String.raw`\textbf{Premises:}`,
    build: (items) =>
      session('mathematics', { logicalForm: items === undefined ? {} : { premises: items } }),
  },
  {
    name: 'rules',
    env: 'itemize',
    heading: String.raw`\textbf{Inference Rules:}`,
    build: (items) =>
      session('mathematics', { logicalForm: items === undefined ? {} : { rules: items } }),
  },
  {
    name: 'conservation laws',
    env: 'itemize',
    heading: String.raw`\textbf{Conservation Laws:}`,
    build: (items) => session('physics', physics(items ?? [])),
  },
  {
    name: 'alternatives',
    env: 'itemize',
    heading: String.raw`\\\textit{Alternatives:}`,
    build: (items) => session('bayesian', bayesian(items)),
  },
  {
    name: 'limitations',
    env: 'itemize',
    heading: String.raw`\paragraph{Limitations}`,
    build: (items) => session('analogical', analogical(items)),
  },
];

const list = (env: string, lines: string[]) =>
  [`\\begin{${env}}`, ...lines.map((l) => `  \\item ${l}`), `\\end{${env}}`].join('\n');

describe.each(fields)('$name list', ({ env, heading, build }) => {
  const exporter = new LaTeXExporter();

  it('writes the heading and one escaped item line per element, in order', () => {
    const latex = exporter.export(build(['first', 'a & b', '50%', 'x_1']));

    expect(latex).toContain(`${heading}\n${list(env, ['first', String.raw`a \& b`, String.raw`50\%`, String.raw`x\_1`])}`);
  });

  it('writes a list of one element', () => {
    expect(exporter.export(build(['only']))).toContain(`${heading}\n${list(env, ['only'])}`);
  });

  it('writes an empty line for an empty string element', () => {
    expect(exporter.export(build(['', 'x']))).toContain(`${heading}\n\\begin{${env}}\n  \\item \n  \\item x\n\\end{${env}}`);
  });

  it('writes nothing for an empty list', () => {
    const latex = exporter.export(build([]));

    expect(latex).not.toContain(heading);
    expect(latex).not.toContain(`\\begin{${env}}\n  \\item`);
  });

  it('skips the holes of a sparse list', () => {
    // eslint-disable-next-line no-sparse-arrays
    const latex = exporter.export(build(['a', , 'c'] as string[]));

    expect(latex).toContain(`${heading}\n${list(env, ['a', 'c'])}`);
  });

  it('fails on an element that is not a string', () => {
    expect(() => exporter.export(build([{ x: 1 }] as unknown as string[]))).toThrow();
  });
});

describe('a missing optional field', () => {
  const exporter = new LaTeXExporter();

  it('writes no heading when the optional field is absent', () => {
    for (const f of fields.filter((x) => x.name !== 'conservation laws')) {
      expect(exporter.export(f.build()), f.name).not.toContain(f.heading);
    }
  });
});
