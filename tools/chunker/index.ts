#!/usr/bin/env bun
/**
 * chunker - Split large files into editable sections
 *
 * Usage:
 *   chunker split <file> [options]       - Split file into chunks
 *   chunker merge <manifest.json>        - Merge chunks back together
 *   chunker status <manifest.json>       - Show chunk status
 *
 * Options:
 *   -o, --output <dir>     Output directory for chunks (default: <file>_chunks/)
 *   -l, --level <n>        Split at heading level n (default: 2, i.e., ##)
 *   -m, --max-lines <n>    Max lines per chunk before sub-splitting (default: 500)
 *   -t, --type <type>      File type: auto, markdown (default: auto)
 *   --dry-run              Show what would be done without writing files
 *   -h, --help             Show this help message
 */

import * as fs from 'fs';
import * as path from 'path';

interface ChunkInfo {
  index: number;
  filename: string;
  title: string;
  level: number;
  startLine: number;
  endLine: number;
  lineCount: number;
  hash: string;
  modified: boolean;
}

interface Manifest {
  version: string;
  sourceFile: string;
  sourceHash: string;
  createdAt: string;
  splitLevel: number;
  chunks: ChunkInfo[];
}

// Simple hash function for change detection
function simpleHash(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

// Parse markdown into sections based on heading level
function parseMarkdownSections(content: string, splitLevel: number): { title: string; level: number; content: string; startLine: number; endLine: number }[] {
  // Normalize line endings (handle CRLF on Windows)
  const normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalizedContent.split('\n');
  const sections: { title: string; level: number; content: string; startLine: number; endLine: number }[] = [];

  let currentSection: { title: string; level: number; lines: string[]; startLine: number } | null = null;
  const headingRegex = new RegExp(`^(#{1,${splitLevel}})\\s+(.+)$`);

  // Handle content before first heading
  let preambleLines: string[] = [];
  let preambleStart = 0;
  let foundFirstHeading = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(headingRegex);

    if (match) {
      foundFirstHeading = true;
      // Save preamble if exists
      if (preambleLines.length > 0 && currentSection === null) {
        sections.push({
          title: '_preamble',
          level: 0,
          content: preambleLines.join('\n'),
          startLine: preambleStart + 1,
          endLine: i
        });
        preambleLines = [];
      }

      // Save previous section
      if (currentSection) {
        sections.push({
          title: currentSection.title,
          level: currentSection.level,
          content: currentSection.lines.join('\n'),
          startLine: currentSection.startLine,
          endLine: i
        });
      }

      // Start new section
      const level = match[1].length;
      currentSection = {
        title: match[2].trim(),
        level: level,
        lines: [line],
        startLine: i + 1
      };
    } else {
      if (currentSection) {
        currentSection.lines.push(line);
      } else if (!foundFirstHeading) {
        if (preambleLines.length === 0) preambleStart = i;
        preambleLines.push(line);
      }
    }
  }

  // Don't forget the last section
  if (currentSection) {
    sections.push({
      title: currentSection.title,
      level: currentSection.level,
      content: currentSection.lines.join('\n'),
      startLine: currentSection.startLine,
      endLine: lines.length
    });
  } else if (preambleLines.length > 0) {
    // File has no headings, treat entire content as one section
    sections.push({
      title: '_content',
      level: 0,
      content: preambleLines.join('\n'),
      startLine: 1,
      endLine: lines.length
    });
  }

  return sections;
}

// Generate a safe filename from title
function sanitizeFilename(title: string, index: number): string {
  const safe = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);
  return `${String(index).padStart(3, '0')}-${safe || 'section'}.md`;
}

// Split command
function splitFile(inputFile: string, options: { output?: string; level?: number; maxLines?: number; dryRun?: boolean }) {
  const splitLevel = options.level ?? 2;
  const maxLines = options.maxLines ?? 500;
  const dryRun = options.dryRun ?? false;

  // Resolve paths
  const absoluteInput = path.resolve(inputFile);
  if (!fs.existsSync(absoluteInput)) {
    console.error(`Error: File not found: ${absoluteInput}`);
    process.exit(1);
  }

  const content = fs.readFileSync(absoluteInput, 'utf-8');
  const sourceHash = simpleHash(content);

  // Determine output directory
  const baseName = path.basename(inputFile, '.md');
  const outputDir = options.output
    ? path.resolve(options.output)
    : path.join(path.dirname(absoluteInput), `${baseName}_chunks`);

  console.log(`\nchunker - Splitting File`);
  console.log(`${'='.repeat(50)}`);
  console.log(`Source:      ${absoluteInput}`);
  console.log(`Output:      ${outputDir}`);
  console.log(`Split Level: h${splitLevel} (${'#'.repeat(splitLevel)})`);
  console.log(`Max Lines:   ${maxLines}`);
  console.log(`Dry Run:     ${dryRun}`);
  console.log();

  // Parse sections
  const sections = parseMarkdownSections(content, splitLevel);

  if (sections.length === 0) {
    console.log('No sections found to split.');
    return;
  }

  console.log(`Found ${sections.length} section(s):\n`);

  // Build chunks
  const chunks: ChunkInfo[] = [];

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    const filename = sanitizeFilename(section.title, i + 1);
    const lineCount = section.content.split('\n').length;

    const chunk: ChunkInfo = {
      index: i + 1,
      filename: filename,
      title: section.title,
      level: section.level,
      startLine: section.startLine,
      endLine: section.endLine,
      lineCount: lineCount,
      hash: simpleHash(section.content),
      modified: false
    };

    chunks.push(chunk);

    const levelIndicator = section.level > 0 ? `h${section.level}` : 'pre';
    const sizeWarning = lineCount > maxLines ? ' [LARGE]' : '';
    console.log(`  ${String(i + 1).padStart(2)}. [${levelIndicator}] ${section.title.substring(0, 40).padEnd(40)} ${String(lineCount).padStart(4)} lines${sizeWarning}`);

    // Write chunk file
    if (!dryRun) {
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      const chunkPath = path.join(outputDir, filename);
      fs.writeFileSync(chunkPath, section.content, 'utf-8');
    }
  }

  // Create manifest
  const manifest: Manifest = {
    version: '1.0.0',
    sourceFile: absoluteInput,
    sourceHash: sourceHash,
    createdAt: new Date().toISOString(),
    splitLevel: splitLevel,
    chunks: chunks
  };

  if (!dryRun) {
    const manifestPath = path.join(outputDir, 'manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
    console.log(`\nManifest written: ${manifestPath}`);
  }

  // Summary
  const totalLines = chunks.reduce((sum, c) => sum + c.lineCount, 0);
  const largeChunks = chunks.filter(c => c.lineCount > maxLines).length;

  console.log(`\nSummary:`);
  console.log(`  Total chunks:  ${chunks.length}`);
  console.log(`  Total lines:   ${totalLines}`);
  if (largeChunks > 0) {
    console.log(`  Large chunks:  ${largeChunks} (>${maxLines} lines - consider lower split level)`);
  }

  if (dryRun) {
    console.log(`\n[DRY RUN] No files were written.`);
  } else {
    console.log(`\nChunks written to: ${outputDir}`);
    console.log(`\nTo edit: Modify individual .md files in the chunks directory`);
    console.log(`To merge: chunker merge "${path.join(outputDir, 'manifest.json')}"`);
  }
}

// Merge command
function mergeChunks(manifestPath: string, options: { output?: string; dryRun?: boolean }) {
  const dryRun = options.dryRun ?? false;

  const absoluteManifest = path.resolve(manifestPath);
  if (!fs.existsSync(absoluteManifest)) {
    console.error(`Error: Manifest not found: ${absoluteManifest}`);
    process.exit(1);
  }

  const manifest: Manifest = JSON.parse(fs.readFileSync(absoluteManifest, 'utf-8'));
  const chunksDir = path.dirname(absoluteManifest);

  console.log(`\nchunker - Merging Chunks`);
  console.log(`${'='.repeat(50)}`);
  console.log(`Manifest:    ${absoluteManifest}`);
  console.log(`Source:      ${manifest.sourceFile}`);
  console.log(`Created:     ${manifest.createdAt}`);
  console.log(`Chunks:      ${manifest.chunks.length}`);
  console.log();

  // Read and validate chunks
  const chunkContents: string[] = [];
  let modifiedCount = 0;

  for (const chunk of manifest.chunks) {
    const chunkPath = path.join(chunksDir, chunk.filename);

    if (!fs.existsSync(chunkPath)) {
      console.error(`Error: Missing chunk file: ${chunkPath}`);
      process.exit(1);
    }

    const content = fs.readFileSync(chunkPath, 'utf-8');
    const currentHash = simpleHash(content);
    const modified = currentHash !== chunk.hash;

    if (modified) modifiedCount++;

    const status = modified ? '[MODIFIED]' : '[unchanged]';
    console.log(`  ${String(chunk.index).padStart(2)}. ${chunk.filename.padEnd(45)} ${status}`);

    chunkContents.push(content);
  }

  console.log(`\nModified chunks: ${modifiedCount} of ${manifest.chunks.length}`);

  // Merge content
  const mergedContent = chunkContents.join('\n');

  // Determine output path
  const outputPath = options.output
    ? path.resolve(options.output)
    : manifest.sourceFile;

  // Check if source file changed since split
  if (fs.existsSync(manifest.sourceFile)) {
    const currentSourceHash = simpleHash(fs.readFileSync(manifest.sourceFile, 'utf-8'));
    if (currentSourceHash !== manifest.sourceHash) {
      console.log(`\nWARNING: Source file has changed since split!`);
      console.log(`  Original hash: ${manifest.sourceHash}`);
      console.log(`  Current hash:  ${currentSourceHash}`);
      if (!options.output) {
        console.log(`\nUse --output to write to a different file, or confirm overwrite.`);
      }
    }
  }

  if (!dryRun) {
    // Create backup of original
    if (fs.existsSync(outputPath)) {
      const backupPath = `${outputPath}.backup-${Date.now()}`;
      fs.copyFileSync(outputPath, backupPath);
      console.log(`\nBackup created: ${backupPath}`);
    }

    fs.writeFileSync(outputPath, mergedContent, 'utf-8');
    console.log(`\nMerged file written: ${outputPath}`);
    console.log(`Total lines: ${mergedContent.split('\n').length}`);
  } else {
    console.log(`\n[DRY RUN] Would write ${mergedContent.split('\n').length} lines to: ${outputPath}`);
  }
}

// Status command
function showStatus(manifestPath: string) {
  const absoluteManifest = path.resolve(manifestPath);
  if (!fs.existsSync(absoluteManifest)) {
    console.error(`Error: Manifest not found: ${absoluteManifest}`);
    process.exit(1);
  }

  const manifest: Manifest = JSON.parse(fs.readFileSync(absoluteManifest, 'utf-8'));
  const chunksDir = path.dirname(absoluteManifest);

  console.log(`\nchunker - Chunk Status`);
  console.log(`${'='.repeat(50)}`);
  console.log(`Source:   ${manifest.sourceFile}`);
  console.log(`Created:  ${manifest.createdAt}`);
  console.log(`Level:    h${manifest.splitLevel}`);
  console.log();

  let modifiedCount = 0;
  let missingCount = 0;
  let totalLines = 0;

  console.log(`Chunks:\n`);
  console.log(`  #   Filename                                      Lines   Status`);
  console.log(`  ${'─'.repeat(70)}`);

  for (const chunk of manifest.chunks) {
    const chunkPath = path.join(chunksDir, chunk.filename);
    let status: string;
    let lines = chunk.lineCount;

    if (!fs.existsSync(chunkPath)) {
      status = 'MISSING';
      missingCount++;
    } else {
      const content = fs.readFileSync(chunkPath, 'utf-8');
      const currentHash = simpleHash(content);
      lines = content.split('\n').length;

      if (currentHash !== chunk.hash) {
        status = 'MODIFIED';
        modifiedCount++;
      } else {
        status = 'unchanged';
      }
    }

    totalLines += lines;
    const statusColor = status === 'MODIFIED' ? '\x1b[33m' : status === 'MISSING' ? '\x1b[31m' : '\x1b[90m';
    const reset = '\x1b[0m';

    console.log(`  ${String(chunk.index).padStart(2)}  ${chunk.filename.padEnd(45)} ${String(lines).padStart(5)}   ${statusColor}${status}${reset}`);
  }

  console.log();
  console.log(`Summary:`);
  console.log(`  Total chunks:    ${manifest.chunks.length}`);
  console.log(`  Modified:        ${modifiedCount}`);
  console.log(`  Missing:         ${missingCount}`);
  console.log(`  Total lines:     ${totalLines}`);

  // Check source file
  if (fs.existsSync(manifest.sourceFile)) {
    const currentSourceHash = simpleHash(fs.readFileSync(manifest.sourceFile, 'utf-8'));
    if (currentSourceHash !== manifest.sourceHash) {
      console.log(`\n\x1b[33mWARNING: Source file modified since split!\x1b[0m`);
    }
  }
}

// Help text
function showHelp() {
  console.log(`
chunker - Split and merge large files for editing

USAGE:
  chunker split <file> [options]       Split file into chunks
  chunker merge <manifest.json>        Merge chunks back together
  chunker status <manifest.json>       Show chunk status

SPLIT OPTIONS:
  -o, --output <dir>     Output directory for chunks (default: <file>_chunks/)
  -l, --level <n>        Split at heading level n (default: 2, i.e., ##)
  -m, --max-lines <n>    Max lines per chunk for warnings (default: 500)
  -t, --type <type>      File type: auto, markdown (default: auto)
  --dry-run              Show what would be done without writing files

MERGE OPTIONS:
  -o, --output <file>    Output file (default: original source file)
  --dry-run              Show what would be done without writing files

EXAMPLES:
  # Split a large markdown file by ## headings
  chunker split ARCHITECTURE.md

  # Split by ### headings into custom directory
  chunker split docs/OVERVIEW.md -l 3 -o ./chunks

  # Check status of edited chunks
  chunker status ./ARCHITECTURE_chunks/manifest.json

  # Merge edited chunks back
  chunker merge ./ARCHITECTURE_chunks/manifest.json

  # Merge to a different file
  chunker merge ./chunks/manifest.json -o ./ARCHITECTURE-new.md

WORKFLOW:
  1. Split:   chunker split large-doc.md
  2. Edit:    Modify individual chunk files in the _chunks directory
  3. Status:  chunker status large-doc_chunks/manifest.json
  4. Merge:   chunker merge large-doc_chunks/manifest.json

SUPPORTED FILE TYPES:
  - Markdown (.md)  - Splits by heading levels (##, ###, etc.)
  - More formats coming soon (JSON, TypeScript, etc.)
`);
}

// Parse command line arguments
function parseArgs(args: string[]): { command: string; target: string; options: Record<string, any> } {
  const command = args[0] || 'help';
  const target = args[1] || '';
  const options: Record<string, any> = {};

  for (let i = 2; i < args.length; i++) {
    const arg = args[i];

    if (arg === '-o' || arg === '--output') {
      options.output = args[++i];
    } else if (arg === '-l' || arg === '--level') {
      options.level = parseInt(args[++i], 10);
    } else if (arg === '-m' || arg === '--max-lines') {
      options.maxLines = parseInt(args[++i], 10);
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '-h' || arg === '--help') {
      options.help = true;
    }
  }

  return { command, target, options };
}

// Main
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '-h' || args[0] === '--help' || args[0] === 'help') {
    showHelp();
    return;
  }

  const { command, target, options } = parseArgs(args);

  switch (command) {
    case 'split':
      if (!target) {
        console.error('Error: Please specify a file to split');
        console.error('Usage: chunker split <file> [options]');
        process.exit(1);
      }
      splitFile(target, options);
      break;

    case 'merge':
      if (!target) {
        console.error('Error: Please specify a manifest.json file');
        console.error('Usage: chunker merge <manifest.json> [options]');
        process.exit(1);
      }
      mergeChunks(target, options);
      break;

    case 'status':
      if (!target) {
        console.error('Error: Please specify a manifest.json file');
        console.error('Usage: chunker status <manifest.json>');
        process.exit(1);
      }
      showStatus(target);
      break;

    default:
      console.error(`Unknown command: ${command}`);
      showHelp();
      process.exit(1);
  }
}

main();
