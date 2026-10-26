/**
 * Rectangle and stadium node renderers.
 *
 * A stadium node is a rectangle node with a corner radius of 20. renderRectNode defaults
 * to a radius of 8 and writes the radius to rx and to ry.
 */

import { describe, it, expect } from 'vitest';
import {
  renderRectNode,
  renderStadiumNode,
} from '../../../../../src/export/visual/utils/svg.js';

const colors = { fill: '#e3f2fd', stroke: '#1976d2' };
const at = (label: string) => ({ id: 'n1', label, x: 10, y: 20, width: 120, height: 40 });

describe('renderRectNode', () => {
  it('writes the node group with the default radius of 8', () => {
    expect(renderRectNode(at('Start'), colors)).toBe(`
    <g class="node" data-id="n1">
      <rect x="10" y="20" width="120" height="40"
            rx="8" ry="8" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/>
      <text x="70" y="45"
            text-anchor="middle" class="node-label">Start</text>
    </g>`);
  });

  it('writes the given radius to rx and to ry', () => {
    expect(renderRectNode(at('A'), colors, 5)).toContain('rx="5" ry="5"');
    expect(renderRectNode(at('A'), colors, 0)).toContain('rx="0" ry="0"');
  });
});

describe('renderStadiumNode', () => {
  it('writes the node group with a radius of 20', () => {
    expect(renderStadiumNode(at('Start'), colors)).toBe(`
    <g class="node" data-id="n1">
      <rect x="10" y="20" width="120" height="40"
            rx="20" ry="20" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/>
      <text x="70" y="45"
            text-anchor="middle" class="node-label">Start</text>
    </g>`);
  });

  it.each([
    ['an empty label', ''],
    ['a short label', 'a'],
    ['a label of 25 characters', 'x'.repeat(25)],
    ['a label of 26 characters', 'x'.repeat(26)],
    ['a long label', 'x'.repeat(80)],
    ['a label with markup characters', `<b>&"'</b>`],
  ])('equals a rect node with a radius of 20 for %s', (_name, label) => {
    expect(renderStadiumNode(at(label), colors)).toBe(renderRectNode(at(label), colors, 20));
  });

  it('cuts a label at 25 characters and escapes it', () => {
    expect(renderStadiumNode(at('x'.repeat(26)), colors)).toContain(`>${'x'.repeat(22)}...<`);
    expect(renderStadiumNode(at('a<b'), colors)).toContain('>a&lt;b<');
  });
});
