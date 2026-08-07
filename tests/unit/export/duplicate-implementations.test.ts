/**
 * Copies of the same logic must agree, or be one copy.
 *
 * `escapeLatex` existed three times. Two were wrong — they re-escaped the
 * braces they had just inserted for `\textbackslash{}`, so every literal
 * backslash in TikZ and LaTeX output came out as `\{}`. Nothing compared them,
 * so the divergence survived for months.
 *
 * These tests compare the remaining families against each other on the same
 * inputs. A copy that drifts fails here; a copy that is deliberately different
 * has its difference pinned, so "fixing" one silently also fails.
 */

import { describe, it, expect } from 'vitest';
import { truncateWithSuffix } from '../../../src/export/visual/utils.js';
import { truncateLabel } from '../../../src/export/visual/utils/mermaid.js';
import { truncateText } from '../../../src/export/visual/utils/svg.js';
import { truncateDotLabel } from '../../../src/export/visual/utils/dot.js';
import { truncate as truncateMarkdown } from '../../../src/export/visual/utils/markdown.js';
import { truncateAscii } from '../../../src/export/visual/utils/ascii.js';
import {
  generateGraphML,
  GraphMLBuilder,
} from '../../../src/export/visual/utils/graphml.js';
import { escapeHTML } from '../../../src/export/visual/utils/html.js';
import { escapeHtml, escapeLatex } from '../../../src/utils/sanitization.js';

/** Inputs chosen to hit every boundary the implementations differ at. */
const CORPUS = [
  '',
  'a',
  'exactly-ten',
  'a string comfortably longer than any of the default limits under test',
  '   leading and trailing   ',
  'multi\nline\ncontent',
  'unicode ✓ ← → ✅ 🌿',
  '<tag attr="v"> & \'quoted\' / slash',
  'back\\slash {braces} $math #hash _under ~tilde ^caret %percent',
];

const LENGTHS = [0, 1, 3, 4, 5, 10, 40, 200];

describe('the truncate family is one implementation', () => {
  it.each(CORPUS)('agrees on %j across every length', (text) => {
    for (const n of LENGTHS) {
      const expected = truncateWithSuffix(text, n);

      expect(truncateLabel(text, n), `truncateLabel @${n}`).toBe(expected);
      expect(truncateText(text, n), `truncateText @${n}`).toBe(expected);
      expect(truncateDotLabel(text, n), `truncateDotLabel @${n}`).toBe(expected);
      expect(truncateMarkdown(text, n), `truncate @${n}`).toBe(expected);
      expect(truncateAscii(text, n), `truncateAscii @${n}`).toBe(expected);
    }
  });

  it('keeps each export its own default length', () => {
    // The defaults are the only thing that ever legitimately differed. If a
    // collapse ever flattens them, callers silently change their output width.
    const long = 'x'.repeat(300);

    expect(truncateLabel(long)).toHaveLength(40);
    expect(truncateText(long)).toHaveLength(30);
    expect(truncateDotLabel(long)).toHaveLength(50);
    expect(truncateMarkdown(long)).toHaveLength(100);
  });

  it('counts a custom suffix against the budget', () => {
    expect(truncateAscii('abcdefghij', 5, '>')).toBe('abcd>');
    expect(truncateAscii('abcdefghij', 5, '>')).toHaveLength(5);
  });
});

describe('GraphML escapes identically on both of its paths', () => {
  // `escapeXML` and `escapeXMLInternal` were byte-identical copies in the same
  // module, the second carrying a comment claiming it avoided a circular
  // dependency. Neither is exported, so they are compared through the two
  // public entry points that use them.
  const HOSTILE = 'a & b < c > d "e" \'f\'';

  it('escapes the graph name the same way through both entry points', () => {
    const viaFunction = generateGraphML([], [], { graphName: HOSTILE });
    const viaBuilder = new GraphMLBuilder().setGraphName(HOSTILE).render();

    const extract = (doc: string) =>
      /<data key="graphName">([^<]*)<\/data>/.exec(doc)?.[1];

    expect(extract(viaFunction)).toBeDefined();
    expect(extract(viaBuilder)).toBe(extract(viaFunction));
  });

  it('escapes all five XML metacharacters', () => {
    const doc = generateGraphML([], [], { graphName: HOSTILE });

    expect(doc).toContain('&amp;');
    expect(doc).toContain('&lt;');
    expect(doc).toContain('&gt;');
    expect(doc).toContain('&quot;');
    expect(doc).toContain('&apos;');
  });
});

describe('escapeLatex has one implementation and it is the correct one', () => {
  it('does not re-escape the braces it inserts for a backslash', () => {
    // The exact defect the two wrong copies had. `\` must become
    // `\textbackslash{}`, never `\textbackslash\{\}`.
    expect(escapeLatex('a\\b')).toBe('a\\textbackslash{}b');
    expect(escapeLatex('\\')).not.toContain('\\{\\}');
  });

  it('escapes each special character exactly once', () => {
    expect(escapeLatex('100% & $x_1$ #tag ~ ^ {} ')).toBe(
      '100\\% \\& \\$x\\_1\\$ \\#tag \\textasciitilde{} \\textasciicircum{} \\{\\} ',
    );
  });
});

describe('the two HTML escapers differ on purpose', () => {
  // These are NOT collapsed: `escapeHtml` (src/utils/sanitization.ts) is the
  // XSS-hardening escaper and also escapes `/`; `escapeHTML`
  // (src/export/visual/utils/html.ts) is the document-generation escaper and
  // does not. Pinning the difference means a silent "unification" of either
  // one fails here instead of changing every HTML export.
  it('agrees on the four shared metacharacters', () => {
    for (const ch of ['&', '<', '>', '"']) {
      expect(escapeHTML(ch), `char ${ch}`).toBe(escapeHtml(ch));
    }
  });

  it('differs only on the apostrophe spelling and the solidus', () => {
    expect(escapeHTML("'")).toBe('&#039;');
    expect(escapeHtml("'")).toBe('&#39;');

    expect(escapeHTML('/')).toBe('/');
    expect(escapeHtml('/')).toBe('&#x2F;');
  });
});
