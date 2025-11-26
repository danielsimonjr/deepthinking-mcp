/**
 * Sequential Visual Exporter (v4.3.0)
 * Sprint 8 Task 8.1: Sequential dependency graph export to Mermaid, DOT, ASCII
 */

import type { SequentialThought } from '../../types/index.js';
import type { VisualExportOptions } from './types.js';
import { sanitizeId } from './utils.js';

/**
 * Export sequential dependency graph to visual format
 */
export function exportSequentialDependencyGraph(thought: SequentialThought, options: VisualExportOptions): string {
  const { format, colorScheme = 'default', includeLabels = true } = options;

  switch (format) {
    case 'mermaid':
      return sequentialToMermaid(thought, colorScheme, includeLabels);
    case 'dot':
      return sequentialToDOT(thought, includeLabels);
    case 'ascii':
      return sequentialToASCII(thought);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

function sequentialToMermaid(
  thought: SequentialThought,
  colorScheme: string,
  includeLabels: boolean
): string {
  let mermaid = 'graph TD\n';

  const nodeId = sanitizeId(thought.id);
  const label = includeLabels ? thought.content.substring(0, 50) + '...' : nodeId;

  mermaid += `  ${nodeId}["${label}"]\n`;

  if (thought.buildUpon && thought.buildUpon.length > 0) {
    mermaid += '\n';
    for (const depId of thought.buildUpon) {
      const depNodeId = sanitizeId(depId);
      mermaid += `  ${depNodeId} --> ${nodeId}\n`;
    }
  }

  if (thought.branchFrom) {
    const branchId = sanitizeId(thought.branchFrom);
    mermaid += `  ${branchId} -.->|branch| ${nodeId}\n`;
  }

  if (thought.revisesThought) {
    const revisedId = sanitizeId(thought.revisesThought);
    mermaid += `  ${revisedId} ==>|revises| ${nodeId}\n`;
  }

  if (colorScheme !== 'monochrome') {
    mermaid += '\n';
    const color = thought.isRevision
      ? (colorScheme === 'pastel' ? '#fff3e0' : '#ffd699')
      : (colorScheme === 'pastel' ? '#e1f5ff' : '#a8d5ff');
    mermaid += `  style ${nodeId} fill:${color}\n`;
  }

  return mermaid;
}

function sequentialToDOT(thought: SequentialThought, includeLabels: boolean): string {
  let dot = 'digraph SequentialDependency {\n';
  dot += '  rankdir=TD;\n';
  dot += '  node [shape=box, style=rounded];\n\n';

  const nodeId = sanitizeId(thought.id);
  const label = includeLabels ? thought.content.substring(0, 50) + '...' : nodeId;

  dot += `  ${nodeId} [label="${label}"];\n`;

  if (thought.buildUpon && thought.buildUpon.length > 0) {
    for (const depId of thought.buildUpon) {
      const depNodeId = sanitizeId(depId);
      dot += `  ${depNodeId} -> ${nodeId};\n`;
    }
  }

  if (thought.branchFrom) {
    const branchId = sanitizeId(thought.branchFrom);
    dot += `  ${branchId} -> ${nodeId} [style=dashed, label="branch"];\n`;
  }

  if (thought.revisesThought) {
    const revisedId = sanitizeId(thought.revisesThought);
    dot += `  ${revisedId} -> ${nodeId} [style=bold, label="revises"];\n`;
  }

  dot += '}\n';
  return dot;
}

function sequentialToASCII(thought: SequentialThought): string {
  let ascii = 'Sequential Dependency Graph:\n';
  ascii += '============================\n\n';

  ascii += `Current Thought: ${thought.id}\n`;
  ascii += `Content: ${thought.content.substring(0, 100)}...\n\n`;

  if (thought.buildUpon && thought.buildUpon.length > 0) {
    ascii += 'Builds Upon:\n';
    for (const depId of thought.buildUpon) {
      ascii += `  ↓ ${depId}\n`;
    }
    ascii += '\n';
  }

  if (thought.branchFrom) {
    ascii += `Branches From: ${thought.branchFrom}\n`;
    if (thought.branchId) {
      ascii += `Branch ID: ${thought.branchId}\n`;
    }
    ascii += '\n';
  }

  if (thought.revisesThought) {
    ascii += `Revises: ${thought.revisesThought}\n`;
    if (thought.revisionReason) {
      ascii += `Reason: ${thought.revisionReason}\n`;
    }
    ascii += '\n';
  }

  return ascii;
}
