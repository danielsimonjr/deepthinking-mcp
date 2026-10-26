/**
 * SVG element output shared by SVGBuilder and SVGGroupBuilder.
 *
 * Both builders write rect, circle, text and line elements with the same attributes
 * in the same order. They differ only in how far a line is indented: two spaces in
 * the document builder, four inside a group.
 */

import { describe, it, expect } from 'vitest';
import { SVGBuilder, SVGGroupBuilder } from '../../../../../src/export/visual/utils/svg.js';

interface ElementBuilder {
  addRect(x: number, y: number, w: number, h: number, o?: object): ElementBuilder;
  addCircle(cx: number, cy: number, r: number, o?: object): ElementBuilder;
  addText(x: number, y: number, text: string, o?: object): ElementBuilder;
  addLine(x1: number, y1: number, x2: number, y2: number, o?: object): ElementBuilder;
  render(): string;
}

const builders: Array<[string, () => ElementBuilder, string]> = [
  ['SVGBuilder', () => new SVGBuilder() as unknown as ElementBuilder, '  '],
  ['SVGGroupBuilder', () => new SVGGroupBuilder('g1') as unknown as ElementBuilder, '    '],
];

describe.each(builders)('%s shared elements', (_name, make, indent) => {
  const linesOf = (b: ElementBuilder) => b.render().split('\n');

  it('writes a rect with only its geometry', () => {
    const lines = linesOf(make().addRect(1, 2, 3, 4));

    expect(lines).toContain(`${indent}<rect x="1" y="2" width="3" height="4"/>`);
  });

  it('writes every rect option in a fixed order and keeps opacity 0', () => {
    const lines = linesOf(
      make().addRect(1, 2, 3, 4, {
        fill: '#fff',
        stroke: '#000',
        strokeWidth: 2,
        opacity: 0,
        rx: 5,
        ry: 6,
        className: 'box',
      }),
    );

    expect(lines).toContain(
      `${indent}<rect x="1" y="2" width="3" height="4" fill="#fff" stroke="#000" ` +
        `stroke-width="2" opacity="0" rx="5" ry="6" class="box"/>`,
    );
  });

  it('writes a circle with every option', () => {
    const lines = linesOf(
      make().addCircle(5, 6, 7, {
        fill: 'red',
        stroke: 'blue',
        strokeWidth: 1,
        opacity: 0.5,
        className: 'dot',
      }),
    );

    expect(lines).toContain(
      `${indent}<circle cx="5" cy="6" r="7" fill="red" stroke="blue" ` +
        `stroke-width="1" opacity="0.5" class="dot"/>`,
    );
  });

  it('writes a circle without rx or ry', () => {
    const lines = linesOf(make().addCircle(5, 6, 7, { rx: 9, ry: 9 } as object));

    expect(lines).toContain(`${indent}<circle cx="5" cy="6" r="7"/>`);
  });

  it('writes text with every option and escapes the content', () => {
    const lines = linesOf(
      make().addText(10, 20, `a<b & "c" 'd'>`, {
        fill: '#111',
        fontSize: 12,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        textAnchor: 'middle',
        dominantBaseline: 'hanging',
        className: 'label',
      }),
    );

    expect(lines).toContain(
      `${indent}<text x="10" y="20" fill="#111" font-size="12" font-family="Arial" ` +
        `font-weight="bold" text-anchor="middle" dominant-baseline="hanging" class="label">` +
        `a&lt;b &amp; &quot;c&quot; &#39;d&#39;&gt;</text>`,
    );
  });

  it('writes a line with every option', () => {
    const lines = linesOf(
      make().addLine(0, 1, 2, 3, {
        stroke: 'black',
        strokeWidth: 3,
        strokeDasharray: '4 2',
        markerEnd: 'arrowhead',
        markerStart: 'dot',
      }),
    );

    expect(lines).toContain(
      `${indent}<line x1="0" y1="1" x2="2" y2="3" stroke="black" stroke-width="3" ` +
        `stroke-dasharray="4 2" marker-end="url(#arrowhead)" marker-start="url(#dot)"/>`,
    );
  });

  it('writes elements in the order they were added', () => {
    const lines = linesOf(make().addLine(70, 0, 1, 1).addRect(80, 0, 1, 1).addCircle(90, 0, 1));
    const kinds = lines
      .map((l) => /^\s*<(line x1="70"|rect x="80"|circle cx="90")/.exec(l)?.[1])
      .filter((k): k is string => Boolean(k))
      .map((k) => k.split(' ')[0]);

    expect(kinds).toEqual(['line', 'rect', 'circle']);
  });

  it('returns the builder so calls chain', () => {
    const b = make();

    expect(b.addRect(0, 0, 1, 1)).toBe(b);
    expect(b.addCircle(0, 0, 1)).toBe(b);
    expect(b.addText(0, 0, 't')).toBe(b);
    expect(b.addLine(0, 0, 1, 1)).toBe(b);
  });
});
