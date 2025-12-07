/**
 * Game Theory Visual Exporter (v7.0.2)
 * Sprint 8 Task 8.1: Game tree export to Mermaid, DOT, ASCII
 * Phase 9: Added native SVG export support
 */

import type { GameTheoryThought } from '../../types/index.js';
import type { VisualExportOptions } from './types.js';
import { sanitizeId } from './utils.js';
import {
  generateSVGHeader,
  generateSVGFooter,
  renderRectNode,
  renderEllipseNode,
  renderEdge,
  renderMetricsPanel,
  renderLegend,
  getNodeColor,
  DEFAULT_SVG_OPTIONS,
  type SVGNodePosition,
} from './svg-utils.js';

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
    case 'svg':
      return gameTreeToSVG(thought, options);
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

/**
 * Export game tree to native SVG format
 */
function gameTreeToSVG(thought: GameTheoryThought, options: VisualExportOptions): string {
  const {
    colorScheme = 'default',
    includeLabels = true,
    includeMetrics = true,
    svgWidth = DEFAULT_SVG_OPTIONS.width,
    svgHeight = 500,
  } = options;

  const title = thought.game?.name || 'Game Tree';

  if (!thought.game) {
    return generateSVGHeader(svgWidth, 200, title) +
      '\n  <text x="400" y="100" text-anchor="middle" class="subtitle">No game defined</text>\n' +
      generateSVGFooter();
  }

  const positions = new Map<string, SVGNodePosition>();
  const nodeWidth = 120;
  const nodeHeight = 40;

  if (thought.gameTree && thought.gameTree.nodes) {
    // Calculate depth of each node based on parent-child relationships
    const nodeDepths = new Map<string, number>();
    const rootNodes = thought.gameTree.nodes.filter(n => !n.parentNode);

    // BFS to calculate depths
    const queue: Array<{ nodeId: string; depth: number }> = rootNodes.map(n => ({ nodeId: n.id, depth: 0 }));
    while (queue.length > 0) {
      const { nodeId, depth } = queue.shift()!;
      nodeDepths.set(nodeId, depth);
      const node = thought.gameTree.nodes.find(n => n.id === nodeId);
      if (node) {
        for (const childId of node.childNodes) {
          queue.push({ nodeId: childId, depth: depth + 1 });
        }
      }
    }

    // Build tree layout - group by depth
    const nodesByDepth = new Map<number, typeof thought.gameTree.nodes>();
    for (const node of thought.gameTree.nodes) {
      const depth = nodeDepths.get(node.id) || 0;
      if (!nodesByDepth.has(depth)) {
        nodesByDepth.set(depth, []);
      }
      nodesByDepth.get(depth)!.push(node);
    }

    const depths = Array.from(nodesByDepth.keys()).sort((a, b) => a - b);
    const verticalSpacing = 100;
    let currentY = 60;

    for (const depth of depths) {
      const nodesAtDepth = nodesByDepth.get(depth)!;
      const layerWidth = nodesAtDepth.length * (nodeWidth + 20) - 20;
      let startX = (svgWidth - layerWidth) / 2;

      for (const node of nodesAtDepth) {
        const label = includeLabels ? (node.action || node.id) : sanitizeId(node.id);
        positions.set(node.id, {
          id: node.id,
          x: startX,
          y: currentY,
          width: nodeWidth,
          height: nodeHeight,
          label,
          type: node.type,
        });
        startX += nodeWidth + 20;
      }
      currentY += verticalSpacing;
    }
  } else if (thought.strategies) {
    // Simple strategy list
    positions.set('root', {
      id: 'root',
      x: svgWidth / 2 - nodeWidth / 2,
      y: 60,
      width: nodeWidth,
      height: nodeHeight,
      label: 'Game',
      type: 'root',
    });

    const stratCount = Math.min(thought.strategies.length, 5);
    const layerWidth = stratCount * (nodeWidth + 20) - 20;
    let startX = (svgWidth - layerWidth) / 2;

    for (let i = 0; i < stratCount; i++) {
      const strategy = thought.strategies[i];
      positions.set(strategy.id, {
        id: strategy.id,
        x: startX,
        y: 180,
        width: nodeWidth,
        height: nodeHeight,
        label: strategy.name,
        type: 'strategy',
      });
      startX += nodeWidth + 20;
    }
  }

  let svg = generateSVGHeader(svgWidth, svgHeight, title);

  // Render edges
  svg += '\n  <!-- Edges -->\n  <g class="edges">';
  if (thought.gameTree && thought.gameTree.nodes) {
    for (const node of thought.gameTree.nodes) {
      if (node.childNodes) {
        for (const childId of node.childNodes) {
          const fromPos = positions.get(node.id);
          const toPos = positions.get(childId);
          if (fromPos && toPos) {
            svg += renderEdge(fromPos, toPos, {});
          }
        }
      }
    }
  } else if (thought.strategies) {
    const rootPos = positions.get('root');
    if (rootPos) {
      for (const strategy of thought.strategies.slice(0, 5)) {
        const stratPos = positions.get(strategy.id);
        if (stratPos) {
          svg += renderEdge(rootPos, stratPos, {});
        }
      }
    }
  }
  svg += '\n  </g>';

  // Render nodes
  svg += '\n\n  <!-- Nodes -->\n  <g class="nodes">';
  for (const [, pos] of positions) {
    const colors = pos.type === 'terminal'
      ? getNodeColor('success', colorScheme)
      : pos.type === 'root'
        ? getNodeColor('primary', colorScheme)
        : getNodeColor('neutral', colorScheme);

    if (pos.type === 'terminal') {
      svg += renderEllipseNode(pos, colors);
    } else {
      svg += renderRectNode(pos, colors);
    }
  }
  svg += '\n  </g>';

  // Render metrics
  if (includeMetrics && thought.nashEquilibria) {
    const metrics = [
      { label: 'Equilibria', value: thought.nashEquilibria.length },
      { label: 'Strategies', value: thought.strategies?.length || 0 },
    ];
    svg += renderMetricsPanel(svgWidth - 180, svgHeight - 80, metrics);
  }

  // Render legend
  const legendItems = [
    { label: 'Decision', color: getNodeColor('neutral', colorScheme) },
    { label: 'Terminal', color: getNodeColor('success', colorScheme), shape: 'ellipse' as const },
  ];
  svg += renderLegend(20, svgHeight - 60, legendItems);

  svg += '\n' + generateSVGFooter();
  return svg;
}
