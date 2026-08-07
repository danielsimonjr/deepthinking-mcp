/**
 * Single-thought export path: every mode x every visual format.
 *
 * `ExportService.exportVisual()` has two paths. The multi-thought path is
 * pinned by `tests/unit/services/ExportService.test.ts`. The SINGLE-thought
 * path is different code: it dispatches on the thought's mode to one of the
 * dedicated exporters in `src/export/visual/modes/`, and each of those has its
 * own `switch (format)`. A mode exporter that omits a format does not fail —
 * it returns whatever its `default:` branch produces, under the requested
 * format's name. That is how `html` came to return text that is not HTML.
 *
 * These tests assert the OUTPUT SHAPE, not that a string came back: valid JSON
 * parses, HTML carries markup, DOT/Mermaid/TikZ/GraphML/UML/Modelica start
 * with their own grammar. A format that silently degrades to another format's
 * output fails here.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { VisualExporter } from '../../../src/export/visual/index.js';
import { SessionManager } from '../../../src/session/manager.js';
import { ThoughtFactory } from '../../../src/services/ThoughtFactory.js';
import { ExportService } from '../../../src/services/ExportService.js';
import { ThinkingMode } from '../../../src/types/core.js';
import type { ThinkingSession } from '../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../src/tools/thinking.js';

type ExportFormat = Parameters<ExportService['exportSession']>[1];

/**
 * Structural markers. Each predicate must be satisfiable ONLY by the named
 * format, so a cross-format degradation (mermaid text returned for `svg`)
 * fails rather than passing on "it's a non-empty string".
 */
const FORMAT_SHAPE: Array<[ExportFormat, (out: string) => boolean]> = [
  ['mermaid', (o) => /^\s*(flowchart|graph|gantt|timeline|stateDiagram|sequenceDiagram)/m.test(o)],
  ['dot', (o) => /\b(di)?graph\s/.test(o) && o.includes('{') && o.includes('}')],
  // ASCII output is either a box-drawn diagram or a plain-text document with
  // `====` / `----` rule lines. Both are distinguishable from every other
  // format here, none of which emits a bare rule line or a box character.
  ['ascii', (o) => /^[=-]{3,}$/m.test(o) || /[╔╗╚╝╠╣═║┌┐└┘│]/.test(o)],
  ['svg', (o) => o.includes('<svg') && o.includes('</svg>')],
  ['graphml', (o) => o.includes('<graphml') && o.includes('</graphml>')],
  ['tikz', (o) => o.includes('\\begin{tikzpicture}') && o.includes('\\end{tikzpicture}')],
  ['modelica', (o) => /\b(package|model)\s+\w/.test(o) && /\bend\s+\w/.test(o)],
  ['html', (o) => /<!DOCTYPE html>/i.test(o) && o.includes('</html>')],
  ['uml', (o) => o.includes('@startuml') && o.includes('@enduml')],
  ['visual-json', (o) => {
    try {
      const parsed: unknown = JSON.parse(o);
      return typeof parsed === 'object' && parsed !== null;
    } catch {
      return false;
    }
  }],
  ['visual-markdown', (o) => /^#{1,3}\s/m.test(o)],
];

/**
 * Modes that `ExportService.exportVisual()` routes to a dedicated exporter,
 * with the discriminating property each dispatch arm tests for.
 *
 * Derived from the `if` chain in `exportVisual()`, not guessed: a mode absent
 * from that chain falls through to `exportGenericThoughtSequence()` and is
 * covered separately below.
 */
const DEDICATED_MODES: Array<[ThinkingMode, Partial<ThinkingToolInput>]> = [
  [ThinkingMode.CAUSAL, { causalGraph: { nodes: [], edges: [] } }],
  [ThinkingMode.TEMPORAL, { events: [] }],
  [ThinkingMode.HISTORICAL, {}],
  [ThinkingMode.GAMETHEORY, {}],
  [ThinkingMode.BAYESIAN, {}],
  [ThinkingMode.FIRSTPRINCIPLES, {}],
  [ThinkingMode.SEQUENTIAL, { buildUpon: [] }],
  [ThinkingMode.SHANNON, { stage: 'problem_definition' }],
  [ThinkingMode.ABDUCTIVE, {}],
  [ThinkingMode.COUNTERFACTUAL, {}],
  [ThinkingMode.ANALOGICAL, {}],
  [ThinkingMode.EVIDENTIAL, {}],
  [ThinkingMode.SYSTEMSTHINKING, {}],
  [ThinkingMode.SCIENTIFICMETHOD, {}],
  [ThinkingMode.OPTIMIZATION, {}],
  [ThinkingMode.FORMALLOGIC, {}],
  [ThinkingMode.MATHEMATICS, {}],
  [ThinkingMode.PHYSICS, {}],
  [ThinkingMode.HYBRID, {}],
  [ThinkingMode.METAREASONING, {}],
  [ThinkingMode.ENGINEERING, {}],
  [ThinkingMode.COMPUTABILITY, {}],
];

describe('single-thought export: every mode renders every visual format', () => {
  let manager: SessionManager;
  let factory: ThoughtFactory;
  let service: ExportService;

  beforeEach(() => {
    manager = new SessionManager();
    factory = new ThoughtFactory();
    service = new ExportService();
  });

  const buildSingleThoughtSession = async (
    mode: ThinkingMode,
    extra: Partial<ThinkingToolInput>,
  ): Promise<ThinkingSession> => {
    const created = await manager.createSession({ title: 'Matrix', mode });
    const thought = factory.createThought(
      {
        thought: 'A single thought used to exercise the mode exporter.',
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
        mode,
        ...extra,
      } as ThinkingToolInput,
      created.id,
    );
    await manager.addThought(created.id, thought);
    return (await manager.getSession(created.id))!;
  };

  for (const [mode, extra] of DEDICATED_MODES) {
    describe(`${mode}`, () => {
      it.each(FORMAT_SHAPE)(
        `renders a real %s document`,
        async (format, isWellFormed) => {
          const session = await buildSingleThoughtSession(mode, extra);

          const output = service.exportSession(session, format);

          expect(
            isWellFormed(output),
            `mode ${mode} / format ${format} produced the wrong kind of output: ${output.slice(0, 120)}`,
          ).toBe(true);
        },
      );
    });
  }
});

/**
 * Every mode exporter `VisualExporter` publishes must be reachable from the
 * session export path.
 *
 * `exportComputability` was published, fully implemented across nine formats,
 * and absent from `ExportService.exportVisual()`'s dispatch chain — so a
 * computability session silently got the generic thought-sequence diagram
 * instead. Nothing failed; the exporter was simply never called. A count of
 * exporters or a "returns a string" check both pass in that state.
 */
describe('every published mode exporter is reachable from ExportService', () => {
  const HERE = dirname(fileURLToPath(import.meta.url));
  const EXPORT_SERVICE_SRC = readFileSync(
    resolve(HERE, '../../../src/services/ExportService.ts'),
    'utf8',
  );

  /**
   * Exporters deliberately not on the session path, with the reason.
   *
   * exportProofDecomposition: takes a `ProofDecomposition`, not a `Thought`.
   * There is no thought mode it corresponds to, so the mode dispatch has
   * nothing to key on. It is reached through the proof subsystem instead.
   */
  const NOT_ON_SESSION_PATH = new Set(['exportProofDecomposition']);

  const publishedExporters = Object.getOwnPropertyNames(
    VisualExporter.prototype,
  ).filter((name) => name.startsWith('export'));

  it('publishes exporters to check', () => {
    expect(publishedExporters.length).toBeGreaterThan(20);
  });

  it.each(publishedExporters)('%s is called by ExportService', (name) => {
    if (NOT_ON_SESSION_PATH.has(name)) return;

    expect(
      EXPORT_SERVICE_SRC.includes(`this.visualExporter.${name}(`),
      `${name} is published by VisualExporter but never called by ExportService, ` +
        `so its mode falls through to the generic thought sequence`,
    ).toBe(true);
  });

  it('exempts no exporter that is in fact called', () => {
    const contradictory = [...NOT_ON_SESSION_PATH].filter((name) =>
      EXPORT_SERVICE_SRC.includes(`this.visualExporter.${name}(`),
    );

    expect(contradictory).toEqual([]);
  });
});
