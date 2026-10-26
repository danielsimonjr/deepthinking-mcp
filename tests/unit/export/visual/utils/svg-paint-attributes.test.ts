/**
 * Paint attributes of the four SVG shapes that carry them.
 *
 * rect, circle, ellipse and polygon write fill, stroke, stroke-width and opacity the same
 * way: in that order, after the geometry. A falsy fill, stroke or stroke width is left out;
 * an opacity of 0 is kept. The class follows the paint, and a rect writes rx and ry between
 * the two. addEllipse and addPolygon exist on SVGBuilder only.
 */

import { describe, it, expect } from 'vitest';
import { SVGBuilder } from '../../../../../src/export/visual/utils/svg.js';
import type { SVGShapeOptions } from '../../../../../src/export/visual/utils/svg.js';

type Shape = [string, (b: SVGBuilder, o?: SVGShapeOptions) => SVGBuilder, string];

const shapes: Shape[] = [
  ['rect', (b, o) => b.addRect(1, 2, 3, 4, o), '<rect x="1" y="2" width="3" height="4"'],
  ['circle', (b, o) => b.addCircle(5, 6, 7, o), '<circle cx="5" cy="6" r="7"'],
  ['ellipse', (b, o) => b.addEllipse(5, 6, 7, 8, o), '<ellipse cx="5" cy="6" rx="7" ry="8"'],
  ['polygon', (b, o) => b.addPolygon([[0, 0], [1, 2], [3, 1]], o), '<polygon points="0,0 1,2 3,1"'],
];

const elementLine = (b: SVGBuilder, open: string): string => {
  const line = b.render().split('\n').find((l) => l.includes(open));
  if (line === undefined) throw new Error(`no line with ${open}`);
  return line;
};

describe.each(shapes)('%s paint attributes', (_name, add, open) => {
  const render = (o?: SVGShapeOptions) => elementLine(add(new SVGBuilder(), o), open);

  it('writes only the geometry when no option is given', () => {
    expect(render()).toBe(`  ${open}/>`);
    expect(render({})).toBe(`  ${open}/>`);
  });

  it('writes fill, stroke, stroke-width and opacity in that order, then the class', () => {
    expect(
      render({ fill: '#fff', stroke: '#000', strokeWidth: 2.5, opacity: 0.5, className: 'c' }),
    ).toBe(`  ${open} fill="#fff" stroke="#000" stroke-width="2.5" opacity="0.5" class="c"/>`);
  });

  it('writes each paint attribute alone', () => {
    expect(render({ fill: 'red' })).toBe(`  ${open} fill="red"/>`);
    expect(render({ stroke: 'blue' })).toBe(`  ${open} stroke="blue"/>`);
    expect(render({ strokeWidth: 3 })).toBe(`  ${open} stroke-width="3"/>`);
    expect(render({ opacity: 0.25 })).toBe(`  ${open} opacity="0.25"/>`);
    expect(render({ className: 'k' })).toBe(`  ${open} class="k"/>`);
  });

  it('leaves out an empty fill, an empty stroke, a zero stroke width and an empty class', () => {
    expect(render({ fill: '', stroke: '', strokeWidth: 0, className: '' })).toBe(`  ${open}/>`);
  });

  it('keeps an opacity of 0', () => {
    expect(render({ opacity: 0 })).toBe(`  ${open} opacity="0"/>`);
  });

  it('treats an explicit undefined opacity as absent', () => {
    expect(render({ opacity: undefined, fill: 'a' })).toBe(`  ${open} fill="a"/>`);
  });
});

describe('rx and ry', () => {
  it('a rect writes rx and ry after the paint and before the class', () => {
    const line = elementLine(
      new SVGBuilder().addRect(1, 2, 3, 4, { fill: 'f', opacity: 1, rx: 5, ry: 6, className: 'c' }),
      '<rect x="1"',
    );

    expect(line).toBe('  <rect x="1" y="2" width="3" height="4" fill="f" opacity="1" rx="5" ry="6" class="c"/>');
  });

  it('a rect leaves out a zero rx and a zero ry', () => {
    const line = elementLine(new SVGBuilder().addRect(1, 2, 3, 4, { rx: 0, ry: 0 }), '<rect x="1"');

    expect(line).toBe('  <rect x="1" y="2" width="3" height="4"/>');
  });

  it.each([
    ['circle', (b: SVGBuilder) => b.addCircle(5, 6, 7, { rx: 9, ry: 9 }), '<circle '],
    ['polygon', (b: SVGBuilder) => b.addPolygon([[0, 0]], { rx: 9, ry: 9 }), '<polygon '],
    ['ellipse', (b: SVGBuilder) => b.addEllipse(5, 6, 7, 8, { rx: 9, ry: 9 }), '<ellipse '],
  ])('a %s ignores rx and ry in its options', (_name, add, open) => {
    const line = elementLine(add(new SVGBuilder()), open);

    expect(line).not.toMatch(/ rx="9"| ry="9"/);
  });
});
