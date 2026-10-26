/**
 * Unit tests for the format dispatch shared by the mode exporters.
 *
 * Fifteen mode exporters repeated one `switch (format)`. The stub converters here record their
 * arguments, so the tests pin which converter each format calls and with what.
 */

import { describe, it, expect } from 'vitest';
import {
  exportByFormat,
  type ModeConverters,
} from '../../../../../src/export/visual/utils/dispatch.js';
import type {
  VisualExportOptions,
  VisualFormat,
} from '../../../../../src/export/visual/types.js';

type Call = { converter: string; args: unknown[] };

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

/** Converters that record each call and return a marker string. */
function recordingConverters(calls: Call[]): ModeConverters<string> {
  const record =
    (converter: string) =>
    (...args: unknown[]): string => {
      calls.push({ converter, args });
      return `out:${converter}`;
    };
  return {
    mermaid: record('mermaid'),
    dot: record('dot'),
    ascii: record('ascii'),
    svg: record('svg'),
    graphml: record('graphml'),
    tikz: record('tikz'),
    html: record('html'),
    modelica: record('modelica'),
    uml: record('uml'),
    json: record('json'),
    markdown: record('markdown'),
  };
}

describe('exportByFormat', () => {
  it.each(FORMATS)('calls only the %s converter and returns its result', (format) => {
    const calls: Call[] = [];

    const result = exportByFormat('t', { format }, recordingConverters(calls));

    expect(result).toBe(`out:${format}`);
    expect(calls.map((c) => c.converter)).toEqual([format]);
  });

  it('passes the colour scheme, labels and metrics to mermaid in that order', () => {
    const calls: Call[] = [];
    const options: VisualExportOptions = {
      format: 'mermaid',
      colorScheme: 'pastel',
      includeLabels: false,
      includeMetrics: true,
    };

    exportByFormat('t', options, recordingConverters(calls));

    expect(calls[0].args).toEqual(['t', 'pastel', false, true]);
  });

  it('passes labels then metrics to dot, and nothing else', () => {
    const calls: Call[] = [];

    exportByFormat(
      't',
      { format: 'dot', includeLabels: true, includeMetrics: false },
      recordingConverters(calls),
    );

    expect(calls[0].args).toEqual(['t', true, false]);
  });

  it('passes only the thought to ascii', () => {
    const calls: Call[] = [];

    exportByFormat('t', { format: 'ascii', includeLabels: false }, recordingConverters(calls));

    expect(calls[0].args).toEqual(['t']);
  });

  it.each(['svg', 'graphml', 'tikz', 'modelica', 'html', 'uml', 'json', 'markdown'] as const)(
    'passes the thought and the same options object to %s',
    (format) => {
      const calls: Call[] = [];
      const options: VisualExportOptions = { format, svgWidth: 321 };

      exportByFormat('t', options, recordingConverters(calls));

      expect(calls[0].args).toHaveLength(2);
      expect(calls[0].args[0]).toBe('t');
      expect(calls[0].args[1]).toBe(options);
    },
  );

  it('defaults the colour scheme to "default" and both flags to true', () => {
    const mermaid: Call[] = [];
    const dot: Call[] = [];

    exportByFormat('t', { format: 'mermaid' }, recordingConverters(mermaid));
    exportByFormat('t', { format: 'dot' }, recordingConverters(dot));

    expect(mermaid[0].args).toEqual(['t', 'default', true, true]);
    expect(dot[0].args).toEqual(['t', true, true]);
  });

  it('keeps an explicit false instead of applying the default', () => {
    const calls: Call[] = [];

    exportByFormat(
      't',
      { format: 'mermaid', includeLabels: false, includeMetrics: false },
      recordingConverters(calls),
    );

    expect(calls[0].args).toEqual(['t', 'default', false, false]);
  });

  it('throws for a format that no case names, and calls no converter', () => {
    const calls: Call[] = [];

    expect(() =>
      exportByFormat(
        't',
        { format: 'nope' as unknown as VisualFormat },
        recordingConverters(calls),
      ),
    ).toThrow('Unsupported format: nope');
    expect(calls).toEqual([]);
  });
});
