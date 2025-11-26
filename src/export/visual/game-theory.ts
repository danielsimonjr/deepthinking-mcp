/**
 * Game Theory Visual Exporter (v4.3.0)
 * Sprint 8 Task 8.1: Game tree export to Mermaid, DOT, ASCII
 */

import type { GameTheoryThought } from '../../types/index.js';
import type { VisualExportOptions } from './types.js';
import { sanitizeId } from './utils.js';

/**
 * Export game tree to visual format
 */
export function exportGameTree(thought: GameTheoryThought, options: VisualExportOptions): string {
  const { format, colorScheme = 'default', includeLabels = true, includeMetrics = true } = options;

  switch (format) {
    case 'mermaid':
      return gameTreeToMermaid(thought, colorScheme, includeLabels, includeMetrics);
    case 'dot':
      return gameTreeToDOT(thought, includeLabels, includeMetrics);
    case 'ascii':
      return gameTreeToASCII(thought);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

function gameTreeToMermaid(
  thought: GameTheoryThought,
  _colorScheme: string,
  includeLabels: boolean,
  includeMetrics: boolean
): string {
  let mermaid = 'graph TD\n';

  if (!thought.game) {
    return mermaid + '  root[No game defined]\n';
  }

  if (thought.gameTree && thought.gameTree.nodes) {
    for (const node of thought.gameTree.nodes) {
      const nodeId = sanitizeId(node.id);
      const label = includeLabels ? (node.action || node.id) : nodeId;
      const shape = node.type === 'terminal' ? ['[[', ']]'] : ['[', ']'];
      mermaid += `  ${nodeId}${shape[0]}${label}${shape[1]}\n`;
    }

    mermaid += '\n';

    for (const node of thought.gameTree.nodes) {
      if (node.childNodes && node.childNodes.length > 0) {
        for (const childId of node.childNodes) {
          const fromId = sanitizeId(node.id);
          const toId = sanitizeId(childId);
          const childNode = thought.gameTree.nodes.find(n => n.id === childId);

          if (includeMetrics && childNode?.action) {
            mermaid += `  ${fromId} --> |${childNode.action}| ${toId}\n`;
          } else {
            mermaid += `  ${fromId} --> ${toId}\n`;
          }
        }
      }
    }
  } else {
    mermaid += '  root[Game]\n';
    if (thought.strategies) {
      for (const strategy of thought.strategies.slice(0, 5)) {
        const stratId = sanitizeId(strategy.id);
        mermaid += `  root --> ${stratId}[${strategy.name}]\n`;
      }
    }
  }

  return mermaid;
}

function gameTreeToDOT(
  thought: GameTheoryThought,
  includeLabels: boolean,
  includeMetrics: boolean
): string {
  let dot = 'digraph GameTree {\n';
  dot += '  rankdir=TD;\n';
  dot += '  node [shape=circle];\n\n';

  if (!thought.game) {
    dot += '  root [label="No game"];\n}\n';
    return dot;
  }

  if (thought.gameTree && thought.gameTree.nodes) {
    for (const node of thought.gameTree.nodes) {
      const nodeId = sanitizeId(node.id);
      const label = includeLabels ? (node.action || node.id) : nodeId;
      const shape = node.type === 'terminal' ? 'doublecircle' : 'circle';

      dot += `  ${nodeId} [label="${label}", shape=${shape}];\n`;
    }

    dot += '\n';

    for (const node of thought.gameTree.nodes) {
      if (node.childNodes && node.childNodes.length > 0) {
        for (const childId of node.childNodes) {
          const fromId = sanitizeId(node.id);
          const toId = sanitizeId(childId);
          const childNode = thought.gameTree.nodes.find(n => n.id === childId);

          if (includeMetrics && childNode?.action) {
            dot += `  ${fromId} -> ${toId} [label="${childNode.action}"];\n`;
          } else {
            dot += `  ${fromId} -> ${toId};\n`;
          }
        }
      }
    }
  }

  dot += '}\n';
  return dot;
}

function gameTreeToASCII(thought: GameTheoryThought): string {
  let ascii = `Game: ${thought.game?.name || 'Untitled'}\n`;
  ascii += '='.repeat(40) + '\n\n';

  if (thought.strategies && thought.strategies.length > 0) {
    ascii += 'Strategies:\n';
    for (const strategy of thought.strategies) {
      const strategyType = strategy.isPure ? 'Pure' : 'Mixed';
      ascii += `  • ${strategy.name} (${strategyType})\n`;
    }
  }

  if (thought.nashEquilibria && thought.nashEquilibria.length > 0) {
    ascii += '\nEquilibria:\n';
    for (const eq of thought.nashEquilibria) {
      ascii += `  ⚖ ${eq.type}: ${eq.strategyProfile.join(', ')}\n`;
      ascii += `    Payoffs: [${eq.payoffs.join(', ')}]\n`;
    }
  }

  return ascii;
}
