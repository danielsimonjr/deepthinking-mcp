/**
 * Knowledge Pack and Mode Doc Tool Tests
 *
 * Each knowledge pack and each mode doc names the tool that carries its mode.
 * A name that points at a tool which does not advertise the mode sends a
 * reader to a tool that refuses the mode. This file checks every
 * `deepthinking_*` name in those documents against the ADVERTISED enums, the
 * same source that mode-reachability.test.ts reads.
 */

import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { toolList } from '../../../src/tools/definitions.js';

const REPO_ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const PACK_DIR = join(REPO_ROOT, 'docs/superpowers/knowledge-packs');
const MODE_DOC_DIR = join(REPO_ROOT, 'docs/modes');

const TOOL_NAME = /deepthinking_[a-z]+/g;

/** mode value -> tool name, read from the ADVERTISED enums, not from any map. */
const advertisedModeToTool = new Map<string, string>();
for (const tool of toolList) {
  const name = (tool as any).name as string;
  const modeProp = (tool as any).inputSchema?.properties?.mode;
  if (!Array.isArray(modeProp?.enum)) continue;
  for (const mode of modeProp.enum as string[]) advertisedModeToTool.set(mode, name);
}

/** Every markdown file in a folder, sorted. */
function markdownFiles(dir: string): string[] {
  return readdirSync(dir).filter((file) => file.endsWith('.md')).sort();
}

/**
 * Lists each document whose tool names do not match the advertised tool of
 * its mode. The mode is the file name without the extension, in lower case.
 */
function findMismatches(dir: string, files: string[]): string[] {
  const problems: string[] = [];
  for (const file of files) {
    const mode = basename(file, '.md').toLowerCase();
    const advertised = advertisedModeToTool.get(mode);
    if (advertised === undefined) {
      problems.push(`${file}: "${mode}" is not an advertised mode`);
      continue;
    }
    const text = readFileSync(join(dir, file), 'utf8');
    const named = new Set(text.match(TOOL_NAME) ?? []);
    for (const tool of named) {
      if (tool !== advertised) {
        problems.push(`${file}: names ${tool}, advertised on ${advertised}`);
      }
    }
  }
  return problems;
}

describe('knowledge packs name the tool that carries their mode', () => {
  it('finds all 31 packs, so the check cannot pass on an empty folder', () => {
    expect(markdownFiles(PACK_DIR)).toHaveLength(31);
  });

  it('names only the advertised tool of each pack mode', () => {
    const files = markdownFiles(PACK_DIR);
    expect(findMismatches(PACK_DIR, files)).toEqual([]);
  });
});

describe('mode docs name the tool that carries their mode', () => {
  it('finds all 34 mode docs, so the check cannot pass on an empty folder', () => {
    expect(markdownFiles(MODE_DOC_DIR)).toHaveLength(34);
  });

  it('names only the advertised tool of each mode', () => {
    const files = markdownFiles(MODE_DOC_DIR);
    expect(findMismatches(MODE_DOC_DIR, files)).toEqual([]);
  });
});
