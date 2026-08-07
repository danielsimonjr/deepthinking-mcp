/**
 * ExportService Tests
 * Tests for src/services/ExportService.ts
 *
 * ExportService.exportSession() accepts 15 format names across two branches:
 * a visual branch (11 names) delegating to VisualExporter, and a standard
 * branch (4 names) with its own document builders. The visual branch maps
 * 'visual-json'/'visual-markdown' onto the VisualFormat names 'json' and
 * 'markdown' -- a mapping that shares its target names with two standard
 * formats, so a break there returns a plausible-looking wrong document rather
 * than an error.
 *
 * Only 8 of these formats are reachable through the MCP tool API today; the
 * service accepts more, and is tested here at its own surface.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SessionManager } from '../../../src/session/manager.js';
import { ThoughtFactory } from '../../../src/services/ThoughtFactory.js';
import { ExportService } from '../../../src/services/ExportService.js';
import type { ThinkingSession } from '../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../src/tools/thinking.js';

type ExportFormat = Parameters<ExportService['exportSession']>[1];

const VISUAL_FORMATS: ExportFormat[] = [
  'mermaid',
  'dot',
  'ascii',
  'svg',
  'graphml',
  'tikz',
  'modelica',
  'html',
  'uml',
  'visual-json',
  'visual-markdown',
];

const STANDARD_FORMATS: ExportFormat[] = ['json', 'markdown', 'latex', 'jupyter'];

describe('ExportService', () => {
  let manager: SessionManager;
  let factory: ThoughtFactory;
  let service: ExportService;

  beforeEach(() => {
    manager = new SessionManager();
    factory = new ThoughtFactory();
    service = new ExportService();
  });

  const buildSession = async (
    thoughtCount: number,
    overrides: Partial<ThinkingToolInput> = {},
  ): Promise<ThinkingSession> => {
    const created = await manager.createSession();
    for (let i = 1; i <= thoughtCount; i++) {
      const thought = factory.createThought(
        {
          thought: `Thought ${i}`,
          thoughtNumber: i,
          totalThoughts: thoughtCount,
          nextThoughtNeeded: i < thoughtCount,
          mode: 'sequential',
          buildUpon: [],
          ...overrides,
        } as ThinkingToolInput,
        created.id,
      );
      await manager.addThought(created.id, thought);
    }
    return (await manager.getSession(created.id))!;
  };

  describe('format routing', () => {
    it('returns a non-empty string for every declared format', async () => {
      const session = await buildSession(1);

      for (const format of [...VISUAL_FORMATS, ...STANDARD_FORMATS]) {
        const output = service.exportSession(session, format);
        expect(output, `format ${format} produced no output`).toBeTruthy();
        expect(typeof output).toBe('string');
      }
    });

    it('throws on an unrecognized format instead of returning a JSON dump', async () => {
      // This previously fell back to the JSON session dump, so a JavaScript
      // caller asking for a format that does not exist received a session dump
      // LABELLED as their format -- the same silent-wrong-kind defect already
      // fixed on the visual path, where an unsupported format now throws to
      // match the single-thought exporters (which never degraded). The
      // standard-format switch was left behind; this closes it.
      //
      // Unreachable from TypeScript, where `format` is a union.
      const session = await buildSession(1);

      expect(() =>
        service.exportSession(session, 'no-such-format' as ExportFormat),
      ).toThrow(/no-such-format/);
    });
  });

  describe('visual-json / visual-markdown mapping', () => {
    it('maps visual-json to the visual graph, not the session dump', async () => {
      const session = await buildSession(1);

      const visual = JSON.parse(service.exportSession(session, 'visual-json'));
      const standard = JSON.parse(service.exportSession(session, 'json'));

      expect(visual.type).toBe('deepthinking-visual-graph');
      // The standard JSON branch serializes the session record itself.
      expect(standard.id).toBe(session.id);
      expect(standard.type).toBeUndefined();
      expect(visual.id).toBeUndefined();
    });

    it('maps visual-markdown to the visual document, not the session document', async () => {
      const session = await buildSession(1);

      const visual = service.exportSession(session, 'visual-markdown');
      const standard = service.exportSession(session, 'markdown');

      expect(visual).not.toBe(standard);
      expect(standard.startsWith('# Thinking Session:')).toBe(true);
      expect(visual.startsWith('# Thinking Session:')).toBe(false);
      expect(visual).toContain('## Overview');
    });

    it('routes the unprefixed json and markdown names to the standard branch', async () => {
      const session = await buildSession(1);

      // Guards the mapping from the other direction: if the visual branch ever
      // claimed 'json'/'markdown', these two would silently become graphs.
      expect(() =>
        JSON.parse(service.exportSession(session, 'json')),
      ).not.toThrow();
      expect(service.exportSession(session, 'markdown')).toContain(
        '**Mode**:',
      );
    });

    it('produces a real SVG document for the svg format', async () => {
      const session = await buildSession(1);

      const svg = service.exportSession(session, 'svg');

      expect(svg.startsWith('<?xml')).toBe(true);
      expect(svg).toContain('<svg');
    });
  });

  describe('multi-thought sessions', () => {
    it('renders mermaid, dot and ascii from the session-level path', async () => {
      const session = await buildSession(3);

      expect(service.exportSession(session, 'mermaid')).toContain('flowchart TD');
      expect(service.exportSession(session, 'dot')).toContain('digraph');
      expect(service.exportSession(session, 'ascii')).toContain('╔');
    });

    // Superseded the "KNOWN LIMITATION: other visual formats degrade to plain
    // text" pin (v9.4.1). That pin recorded exportSessionWithThoughtDetails()
    // implementing only mermaid, dot and ascii while the other eight names
    // fell through to a plain-text `Session: ...` dump — so a client asking a
    // multi-thought session for 'html' got text that is not HTML, and
    // 'visual-json' returned text that is not JSON. The single-thought path
    // renders all eleven and THROWS on anything else; the session-level path
    // now does the same, so the pin no longer describes the code.
    //
    // Each assertion below is a structural marker of the requested format, not
    // a snapshot: it fails if the output silently becomes some other format.
    const FORMAT_MARKERS: Array<[ExportFormat, (out: string) => boolean]> = [
      ['svg', (o) => o.startsWith('<?xml') && o.includes('<svg')],
      ['graphml', (o) => o.includes('<graphml') && o.includes('<node ')],
      ['tikz', (o) => o.includes('\\begin{tikzpicture}')],
      ['modelica', (o) => o.includes('package ') && o.includes('end ')],
      ['html', (o) => o.includes('<!DOCTYPE html>') && o.includes('</html>')],
      ['uml', (o) => o.startsWith('@startuml') && o.includes('@enduml')],
      ['visual-markdown', (o) => o.includes('## Thoughts')],
    ];

    it.each(FORMAT_MARKERS)(
      'renders a real %s document from the session-level path',
      async (format, isWellFormed) => {
        const session = await buildSession(3);

        const output = service.exportSession(session, format);

        expect(output.startsWith('Session: '), 'degraded to plain text').toBe(
          false,
        );
        expect(isWellFormed(output), `malformed ${format}: ${output.slice(0, 80)}`).toBe(true);
      },
    );

    it('returns parseable JSON for visual-json', async () => {
      const session = await buildSession(3);

      const output = service.exportSession(session, 'visual-json');

      // The defect that mattered most: a format named `visual-json` returned
      // a plain-text dump, so every consumer that parsed it threw.
      const parsed = JSON.parse(output);
      expect(parsed.type).toBe('deepthinking-visual-graph');
      expect(Array.isArray(parsed.nodes)).toBe(true);
      expect(Array.isArray(parsed.edges)).toBe(true);
    });

    it('represents every thought as a node in the graph formats', async () => {
      const session = await buildSession(4);

      const parsed = JSON.parse(service.exportSession(session, 'visual-json'));
      const thoughtNodes = parsed.nodes.filter(
        (n: { type?: string }) => n.type === 'thought',
      );

      expect(thoughtNodes).toHaveLength(4);
    });

    it('leaves no visual format on a plain-text fallback', async () => {
      // The trailing `return \`Session: ...\`` was what let eight formats go
      // unnoticed: adding a VisualFormat without session support degraded
      // silently instead of failing. Asserted over the whole list so a newly
      // added format is caught here rather than by a client.
      const session = await buildSession(3);

      for (const format of VISUAL_FORMATS) {
        const output = service.exportSession(session, format);
        expect(output.startsWith('Session: '), `format ${format}`).toBe(false);
        expect(output.length, `format ${format}`).toBeGreaterThan(0);
      }
    });

    it('includes every thought in the session-level ascii rendering', async () => {
      const session = await buildSession(4);

      const ascii = service.exportSession(session, 'ascii');

      expect(ascii).toContain('Thoughts: 4');
      for (let i = 1; i <= 4; i++) {
        expect(ascii).toContain(`Thought ${i}`);
      }
    });
  });

  describe('empty sessions', () => {
    it('throws for a visual format when the session has no thoughts', async () => {
      const session = await buildSession(0);

      for (const format of VISUAL_FORMATS) {
        expect(
          () => service.exportSession(session, format),
          `format ${format}`,
        ).toThrow('No thoughts in session to export');
      }
    });

    it('exports standard formats for an empty session without throwing', async () => {
      const session = await buildSession(0);

      for (const format of STANDARD_FORMATS) {
        expect(
          () => service.exportSession(session, format),
          `format ${format}`,
        ).not.toThrow();
      }

      expect(JSON.parse(service.exportSession(session, 'json')).thoughts).toEqual(
        [],
      );
    });
  });

  describe('standard format contracts', () => {
    it('JSON export converts the customMetrics Map into a plain object', async () => {
      const session = await buildSession(2);
      session.metrics.customMetrics.set('depth', 7);

      const parsed = JSON.parse(service.exportSession(session, 'json'));

      expect(parsed.metrics.customMetrics).toEqual({ depth: 7 });
      expect(Array.isArray(parsed.metrics.customMetrics)).toBe(false);
      expect(parsed.thoughts).toHaveLength(2);
    });

    it('JSON export requires metrics.customMetrics to be a Map', async () => {
      const session = await buildSession(1);
      (session.metrics as Record<string, unknown>).customMetrics = undefined;

      // Documents a hard precondition: a session assembled by hand rather than
      // by SessionManager will fail here rather than exporting partial data.
      expect(() => service.exportSession(session, 'json')).toThrow();
    });

    it('Markdown export carries the session header and every thought', async () => {
      const session = await buildSession(3);
      // Set explicitly: whether SessionManager marks a session complete after
      // its final thought depends on the mode, which is not what this asserts.
      session.isComplete = false;

      const md = service.exportSession(session, 'markdown');

      expect(md).toContain(`# Thinking Session: ${session.title}`);
      expect(md).toContain(`**Mode**: ${session.mode}`);
      expect(md).toContain('**Status**: In Progress');
      expect(md).toContain(session.createdAt.toISOString());
      expect(md).toContain('### Thought 1/3');
      expect(md).toContain('### Thought 3/3');
    });

    it('Markdown export reports a completed session as Complete', async () => {
      const session = await buildSession(1);
      session.isComplete = true;

      expect(service.exportSession(session, 'markdown')).toContain(
        '**Status**: Complete',
      );
    });

    it('Markdown thought headings count against the stored thoughts, not totalThoughts', async () => {
      // The denominator is session.thoughts.length. A session holding 2 of a
      // planned 10 thoughts renders "1/2", not "1/10".
      const session = await buildSession(2, { totalThoughts: 10 });

      const md = service.exportSession(session, 'markdown');

      expect(md).toContain('### Thought 1/2');
      expect(md).not.toContain('/10');
    });

    it('LaTeX export produces a compilable document skeleton', async () => {
      const session = await buildSession(2);

      const latex = service.exportSession(session, 'latex');

      expect(latex).toContain('\\documentclass{article}');
      expect(latex).toContain('\\begin{document}');
      expect(latex).toContain('\\end{document}');
    });

    it('LaTeX export escapes special characters in the session title', async () => {
      const session = await buildSession(1);
      session.title = 'Cost & Value_100% #1';

      const latex = service.exportSession(session, 'latex');

      expect(latex).toContain('\\&');
      expect(latex).toContain('\\_');
      expect(latex).toContain('\\%');
      expect(latex).toContain('\\#');
      expect(latex).not.toContain('Cost & Value_100% #1');
    });

    it('Jupyter export produces a valid nbformat 4 notebook', async () => {
      const session = await buildSession(2);

      const notebook = JSON.parse(service.exportSession(session, 'jupyter'));

      expect(notebook.nbformat).toBe(4);
      expect(notebook.nbformat_minor).toBe(2);
      expect(Array.isArray(notebook.cells)).toBe(true);
      // One title cell plus at least one cell per thought.
      expect(notebook.cells.length).toBeGreaterThanOrEqual(3);
      expect(notebook.cells[0].cell_type).toBe('markdown');
      expect(notebook.cells[0].source.join('')).toContain(
        `# Thinking Session: ${session.title}`,
      );
      for (const cell of notebook.cells) {
        expect(['markdown', 'code']).toContain(cell.cell_type);
        expect(Array.isArray(cell.source)).toBe(true);
      }
    });
  });

  describe('determinism', () => {
    it('exports the same session twice to identical output', async () => {
      const session = await buildSession(3);

      for (const format of ['json', 'markdown', 'latex', 'jupyter', 'mermaid', 'ascii'] as ExportFormat[]) {
        expect(
          service.exportSession(session, format),
          `format ${format}`,
        ).toBe(service.exportSession(session, format));
      }
    });

    it('two ExportService instances agree on the same session', async () => {
      const session = await buildSession(2);
      const other = new ExportService();

      expect(other.exportSession(session, 'markdown')).toBe(
        service.exportSession(session, 'markdown'),
      );
    });
  });
});
