/**
 * Game Theory Visual Exporter (v7.0.3)
 * Sprint 8 Task 8.1: Game tree export to Mermaid, DOT, ASCII
 * Phase 9: Added native SVG export support, GraphML, and TikZ
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
import {
  createTreeGraphML,
  generateGraphML,
  type GraphMLNode,
  type GraphMLEdge,
} from './graphml-utils.js';
import {
  createTreeTikZ,
  generateTikZ,
  type TikZNode,
  type TikZEdge,
} from './tikz-utils.js';
import {
  generateHTMLHeader,
  generateHTMLFooter,
  escapeHTML,
  renderMetricCard,
  renderSection,
  renderTable,
  renderBadge,
} from './html-utils.js';
import {
  sanitizeModelicaId,
  escapeModelicaString,
} from './modelica-utils.js';
import {
  generateUmlDiagram,
  type UmlNode,
  type UmlEdge,
} from './uml-utils.js';
import {
  createJsonGraph,
  addNode,
  addEdge,
  addMetric,
  addLegendItem,
  serializeGraph,
} from './json-utils.js';

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
    case 'graphml':
      return gameTreeToGraphML(thought, options);
    case 'tikz':
      return gameTreeToTikZ(thought, options);
    case 'html':
      return gameTreeToHTML(thought, options);
    case 'modelica':
      return gameTheoryToModelica(thought, options);
    case 'uml':
      return gameTheoryToUML(thought, options);
    case 'json':
      return gameTheoryToJSON(thought, options);
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

/**
 * Export game tree to GraphML format
 */
function gameTreeToGraphML(thought: GameTheoryThought, options: VisualExportOptions): string {
  const { includeLabels = true } = options;

  if (!thought.game) {
    // Empty case: no game defined
    const nodes: GraphMLNode[] = [{ id: 'root', label: 'No game defined', type: 'root' }];
    return generateGraphML(nodes, [], { graphName: 'Empty Game Tree' });
  }

  if (thought.gameTree && thought.gameTree.nodes && thought.gameTree.nodes.length > 0) {
    // Build GraphMLNode[] from gameTree.nodes
    const nodes: GraphMLNode[] = thought.gameTree.nodes.map(node => ({
      id: sanitizeId(node.id),
      label: includeLabels ? (node.action || node.id) : node.id,
      type: node.type || 'node',
      metadata: {
        action: node.action,
        player: node.playerId,
      },
    }));

    // Build edges from parent-child relationships
    const edges: GraphMLEdge[] = [];
    let edgeCount = 0;
    for (const node of thought.gameTree.nodes) {
      if (node.childNodes && node.childNodes.length > 0) {
        for (const childId of node.childNodes) {
          const childNode = thought.gameTree.nodes.find(n => n.id === childId);
          edges.push({
            id: `e${edgeCount++}`,
            source: sanitizeId(node.id),
            target: sanitizeId(childId),
            label: includeLabels && childNode?.action ? childNode.action : undefined,
            directed: true,
          });
        }
      }
    }

    return generateGraphML(nodes, edges, { graphName: thought.game?.name || 'Game Tree' });
  } else if (thought.strategies && thought.strategies.length > 0) {
    // Create a simple tree with root "Game" and strategy nodes as children
    const root = {
      id: 'root',
      label: 'Game',
      children: thought.strategies.slice(0, 5).map(strategy => ({
        id: sanitizeId(strategy.id),
        label: strategy.name,
      })),
    };

    return createTreeGraphML(root, { graphName: thought.game?.name || 'Game Tree' });
  }

  // Empty case: no tree or strategies
  const nodes: GraphMLNode[] = [{ id: 'root', label: 'No game tree', type: 'root' }];
  return generateGraphML(nodes, [], { graphName: thought.game?.name || 'Game Tree' });
}

/**
 * Export game tree to TikZ format
 */
function gameTreeToTikZ(thought: GameTheoryThought, options: VisualExportOptions): string {
  const { includeLabels = true, colorScheme = 'default' } = options;

  if (!thought.game) {
    // Empty case: no game defined
    const nodes: TikZNode[] = [{ id: 'root', label: 'No game defined', x: 4, y: 0, type: 'root', shape: 'rectangle' }];
    return generateTikZ(nodes, [], { title: 'Empty Game Tree', colorScheme });
  }

  if (thought.gameTree && thought.gameTree.nodes && thought.gameTree.nodes.length > 0) {
    // Calculate depth of each node based on parent-child relationships
    const nodeDepths = new Map<string, number>();
    const rootNodes = thought.gameTree.nodes.filter(n => !n.parentNode);

    // BFS to calculate depths
    const queue: Array<{ nodeId: string; depth: number }> = rootNodes.map(n => ({ nodeId: n.id, depth: 0 }));
    while (queue.length > 0) {
      const { nodeId, depth } = queue.shift()!;
      nodeDepths.set(nodeId, depth);
      const node = thought.gameTree.nodes.find(n => n.id === nodeId);
      if (node && node.childNodes) {
        for (const childId of node.childNodes) {
          queue.push({ nodeId: childId, depth: depth + 1 });
        }
      }
    }

    // Group nodes by depth for layout
    const nodesByDepth = new Map<number, typeof thought.gameTree.nodes>();
    for (const node of thought.gameTree.nodes) {
      const depth = nodeDepths.get(node.id) || 0;
      if (!nodesByDepth.has(depth)) {
        nodesByDepth.set(depth, []);
      }
      nodesByDepth.get(depth)!.push(node);
    }

    // Build TikZNode[] with positions based on tree depth
    const nodes: TikZNode[] = [];
    const depths = Array.from(nodesByDepth.keys()).sort((a, b) => a - b);

    for (const depth of depths) {
      const nodesAtDepth = nodesByDepth.get(depth)!;
      const layerWidth = nodesAtDepth.length * 3;
      const startX = (8 - layerWidth) / 2 + 1.5;

      for (let i = 0; i < nodesAtDepth.length; i++) {
        const node = nodesAtDepth[i];
        nodes.push({
          id: sanitizeId(node.id),
          label: includeLabels ? (node.action || node.id) : node.id,
          x: startX + i * 3,
          y: -depth * 2, // y decreases by 2 per level
          type: node.type || 'neutral',
          shape: node.type === 'terminal' ? 'ellipse' : 'rectangle', // Use 'ellipse' for terminal nodes
        });
      }
    }

    // Build TikZEdge[] from childNodes relationships
    const edges: TikZEdge[] = [];
    for (const node of thought.gameTree.nodes) {
      if (node.childNodes && node.childNodes.length > 0) {
        for (const childId of node.childNodes) {
          const childNode = thought.gameTree.nodes.find(n => n.id === childId);
          edges.push({
            source: sanitizeId(node.id),
            target: sanitizeId(childId),
            label: includeLabels && childNode?.action ? childNode.action : undefined,
            directed: true,
          });
        }
      }
    }

    return generateTikZ(nodes, edges, { title: thought.game?.name || 'Game Tree', colorScheme });
  } else if (thought.strategies && thought.strategies.length > 0) {
    // Create a simple tree with root "Game" and strategy nodes as children
    const root = {
      id: 'root',
      label: 'Game',
      children: thought.strategies.slice(0, 5).map(strategy => ({
        id: sanitizeId(strategy.id),
        label: strategy.name,
      })),
    };

    return createTreeTikZ(root, { title: thought.game?.name || 'Game Tree', colorScheme });
  }

  // Empty case: no tree or strategies
  const nodes: TikZNode[] = [{ id: 'root', label: 'No game tree', x: 4, y: 0, type: 'root', shape: 'rectangle' }];
  return generateTikZ(nodes, [], { title: thought.game?.name || 'Game Tree', colorScheme });
}

/**
 * Export game tree to HTML format
 */
function gameTreeToHTML(thought: GameTheoryThought, options: VisualExportOptions): string {
  const {
    htmlStandalone = true,
    htmlTitle = thought.game?.name || 'Game Theory Analysis',
    htmlTheme = 'light',
    includeMetrics = true,
  } = options;

  let html = generateHTMLHeader(htmlTitle, { standalone: htmlStandalone, theme: htmlTheme });
  html += `<h1>${escapeHTML(htmlTitle)}</h1>\n`;

  if (!thought.game) {
    html += '<p class="text-secondary">No game defined.</p>\n';
    html += generateHTMLFooter(htmlStandalone);
    return html;
  }

  // Game info
  html += renderSection('Game Information', `
    <p><strong>Type:</strong> ${escapeHTML(thought.game.type)}</p>
    <p><strong>Players:</strong> ${thought.players ? thought.players.map((p: any) => escapeHTML(p.name)).join(', ') : thought.game.numPlayers}</p>
    ${thought.game.description ? `<p>${escapeHTML(thought.game.description)}</p>` : ''}
  `, '🎮');

  // Metrics
  if (includeMetrics) {
    html += '<div class="metrics-grid">';
    html += renderMetricCard('Players', thought.players ? thought.players.length : thought.game.numPlayers, 'primary');
    html += renderMetricCard('Strategies', thought.strategies?.length || 0, 'info');
    html += renderMetricCard('Equilibria', thought.nashEquilibria?.length || 0, 'success');
    html += '</div>\n';
  }

  // Strategies table
  if (thought.strategies && thought.strategies.length > 0) {
    const strategyRows = thought.strategies.map(strategy => {
      const typeBadge = renderBadge(strategy.isPure ? 'Pure' : 'Mixed', strategy.isPure ? 'success' : 'info');
      return [
        strategy.name,
        typeBadge,
        strategy.description || '-',
      ];
    });
    html += renderSection('Strategies', renderTable(
      ['Name', 'Type', 'Description'],
      strategyRows.map(row => row.map(cell => typeof cell === 'string' && cell.startsWith('<') ? cell : escapeHTML(String(cell))))
    ), '📋');
  }

  // Nash Equilibria
  if (thought.nashEquilibria && thought.nashEquilibria.length > 0) {
    const eqRows = thought.nashEquilibria.map(eq => {
      const typeBadge = renderBadge(eq.type, eq.type === 'pure' ? 'success' : 'info');
      return [
        typeBadge,
        eq.strategyProfile.join(', '),
        `[${eq.payoffs.join(', ')}]`,
        eq.isStrict ? 'Yes' : 'No',
      ];
    });
    html += renderSection('Nash Equilibria', renderTable(
      ['Type', 'Strategy Profile', 'Payoffs', 'Strict'],
      eqRows.map(row => row.map(cell => typeof cell === 'string' && cell.startsWith('<') ? cell : escapeHTML(String(cell))))
    ), '⚖️');
  }

  // Payoff Matrix (if available)
  if (thought.payoffMatrix) {
    html += renderSection('Payoff Matrix', `
      <p class="text-secondary">Payoff matrix visualization available in other formats.</p>
    `, '📊');
  }

  html += generateHTMLFooter(htmlStandalone);
  return html;
}

/**
 * Export game theory to Modelica format
 */
function gameTheoryToModelica(thought: GameTheoryThought, options: VisualExportOptions): string {
  const { includeMetrics = true } = options;
  const gameName = sanitizeModelicaId(thought.game?.name || 'Game');

  let modelica = `package ${gameName}\n`;
  modelica += `  "Game Theory Analysis: ${escapeModelicaString(thought.game?.name || 'Untitled')}"\n\n`;

  // Player record type
  if (thought.players && thought.players.length > 0) {
    modelica += '  record Player\n';
    modelica += '    "Player in the game"\n';
    modelica += '    String id "Player identifier";\n';
    modelica += '    String name "Player name";\n';
    modelica += '  end Player;\n\n';

    // Player instances
    for (const player of thought.players) {
      const playerId = sanitizeModelicaId(player.id || player.name);
      modelica += `  constant Player ${playerId} = Player(\n`;
      modelica += `    id="${escapeModelicaString(player.id || player.name)}",\n`;
      modelica += `    name="${escapeModelicaString(player.name)}"\n`;
      modelica += '  );\n';
    }
    modelica += '\n';
  }

  // Strategy enumeration
  if (thought.strategies && thought.strategies.length > 0) {
    modelica += '  type StrategyType = enumeration(\n';
    const strategyNames = thought.strategies.map(s => sanitizeModelicaId(s.name));
    modelica += strategyNames.map(name => `    ${name}`).join(',\n');
    modelica += '\n  ) "Available strategies";\n\n';

    // Strategy records
    modelica += '  record Strategy\n';
    modelica += '    "Strategy definition"\n';
    modelica += '    String id "Strategy identifier";\n';
    modelica += '    String name "Strategy name";\n';
    modelica += '    Boolean isPure "Whether strategy is pure or mixed";\n';
    modelica += '  end Strategy;\n\n';

    for (const strategy of thought.strategies) {
      const stratId = sanitizeModelicaId(strategy.id);
      modelica += `  constant Strategy ${stratId} = Strategy(\n`;
      modelica += `    id="${escapeModelicaString(strategy.id)}",\n`;
      modelica += `    name="${escapeModelicaString(strategy.name)}",\n`;
      modelica += `    isPure=${strategy.isPure ? 'true' : 'false'}\n`;
      modelica += '  );\n';
    }
    modelica += '\n';
  }

  // Nash Equilibria
  if (thought.nashEquilibria && thought.nashEquilibria.length > 0) {
    modelica += '  record NashEquilibrium\n';
    modelica += '    "Nash equilibrium definition"\n';
    modelica += '    String equilibriumType "Type: pure or mixed";\n';
    modelica += '    String strategyProfile[:] "Strategy profile";\n';
    modelica += '    Real payoffs[:] "Payoffs for each player";\n';
    modelica += '    Boolean isStrict "Whether equilibrium is strict";\n';
    modelica += '  end NashEquilibrium;\n\n';

    for (let i = 0; i < thought.nashEquilibria.length; i++) {
      const eq = thought.nashEquilibria[i];
      modelica += `  constant NashEquilibrium equilibrium${i + 1} = NashEquilibrium(\n`;
      modelica += `    equilibriumType="${escapeModelicaString(eq.type)}",\n`;
      modelica += `    strategyProfile={${eq.strategyProfile.map(s => `"${escapeModelicaString(s)}"`).join(', ')}},\n`;
      modelica += `    payoffs={${eq.payoffs.join(', ')}},\n`;
      modelica += `    isStrict=${eq.isStrict ? 'true' : 'false'}\n`;
      modelica += '  );\n';
    }
    modelica += '\n';
  }

  // Game metadata
  if (includeMetrics) {
    modelica += '  // Game Metrics\n';
    modelica += `  constant Integer numPlayers = ${thought.players?.length || thought.game?.numPlayers || 0};\n`;
    modelica += `  constant Integer numStrategies = ${thought.strategies?.length || 0};\n`;
    modelica += `  constant Integer numEquilibria = ${thought.nashEquilibria?.length || 0};\n`;
    modelica += `  constant String gameType = "${escapeModelicaString(thought.game?.type || 'unknown')}";\n`;
  }

  modelica += `end ${gameName};\n`;
  return modelica;
}

/**
 * Export game theory to UML format
 */
function gameTheoryToUML(thought: GameTheoryThought, options: VisualExportOptions): string {
  const { includeLabels = true } = options;

  const nodes: UmlNode[] = [];
  const edges: UmlEdge[] = [];

  if (!thought.game) {
    nodes.push({
      id: 'nogame',
      label: 'No Game Defined',
      shape: 'class',
      stereotype: 'error',
    });
    return generateUmlDiagram(nodes, edges, { title: 'Game Theory Analysis' });
  }

  // Game class (central node)
  const gameNode: UmlNode = {
    id: 'game',
    label: thought.game.name || 'Game',
    shape: 'class',
    attributes: [
      `type: ${thought.game.type}`,
      `players: ${thought.players?.length || thought.game.numPlayers}`,
    ],
  };
  nodes.push(gameNode);

  // Player classes
  if (thought.players && thought.players.length > 0) {
    for (const player of thought.players) {
      const playerId = sanitizeId(player.id || player.name);
      nodes.push({
        id: playerId,
        label: player.name,
        shape: 'class',
        stereotype: 'player',
        attributes: [`id: ${player.id || player.name}`],
      });
      edges.push({
        source: 'game',
        target: playerId,
        type: 'association',
        label: includeLabels ? 'has player' : undefined,
      });
    }
  }

  // Strategy classes
  if (thought.strategies && thought.strategies.length > 0) {
    for (const strategy of thought.strategies.slice(0, 10)) {
      const stratId = sanitizeId(strategy.id);
      nodes.push({
        id: stratId,
        label: strategy.name,
        shape: 'class',
        stereotype: strategy.isPure ? 'pure strategy' : 'mixed strategy',
        attributes: [
          `id: ${strategy.id}`,
          ...(strategy.description ? [`description: ${strategy.description}`] : []),
        ],
      });
      edges.push({
        source: 'game',
        target: stratId,
        type: 'association',
        label: includeLabels ? 'uses' : undefined,
      });
    }
  }

  // Nash Equilibria as separate nodes
  if (thought.nashEquilibria && thought.nashEquilibria.length > 0) {
    for (let i = 0; i < thought.nashEquilibria.length; i++) {
      const eq = thought.nashEquilibria[i];
      const eqId = `equilibrium_${i}`;
      nodes.push({
        id: eqId,
        label: `Nash Equilibrium ${i + 1}`,
        shape: 'class',
        stereotype: eq.type,
        attributes: [
          `profile: [${eq.strategyProfile.join(', ')}]`,
          `payoffs: [${eq.payoffs.join(', ')}]`,
          `strict: ${eq.isStrict}`,
        ],
      });
      edges.push({
        source: 'game',
        target: eqId,
        type: 'dependency',
        label: includeLabels ? 'achieves' : undefined,
      });
    }
  }

  return generateUmlDiagram(nodes, edges, {
    title: thought.game.name || 'Game Theory Analysis',
    direction: 'top to bottom',
  });
}

/**
 * Export game theory to JSON format
 */
function gameTheoryToJSON(thought: GameTheoryThought, options: VisualExportOptions): string {
  const { includeMetrics = true, includeLabels = true } = options;

  const graph = createJsonGraph(
    thought.game?.name || 'Game Theory Analysis',
    'game-theory'
  );

  if (!thought.game) {
    addNode(graph, {
      id: 'nogame',
      label: 'No Game Defined',
      type: 'error',
    });
    return serializeGraph(graph);
  }

  // Add game node
  addNode(graph, {
    id: 'game',
    label: thought.game.name || 'Game',
    type: 'game',
    metadata: {
      gameType: thought.game.type,
      numPlayers: thought.players?.length || thought.game.numPlayers,
      description: thought.game.description,
    },
  });

  // Add player nodes
  let edgeId = 0;
  if (thought.players && thought.players.length > 0) {
    for (const player of thought.players) {
      const playerId = sanitizeId(player.id || player.name);
      addNode(graph, {
        id: playerId,
        label: player.name,
        type: 'player',
        metadata: {
          originalId: player.id,
        },
      });
      addEdge(graph, {
        id: `edge_${edgeId++}`,
        source: 'game',
        target: playerId,
        label: includeLabels ? 'has player' : undefined,
        type: 'participates',
      });
    }
  }

  // Add strategy nodes
  if (thought.strategies && thought.strategies.length > 0) {
    for (const strategy of thought.strategies) {
      const stratId = sanitizeId(strategy.id);
      addNode(graph, {
        id: stratId,
        label: strategy.name,
        type: strategy.isPure ? 'pure-strategy' : 'mixed-strategy',
        metadata: {
          originalId: strategy.id,
          description: strategy.description,
          isPure: strategy.isPure,
        },
      });
      addEdge(graph, {
        id: `edge_${edgeId++}`,
        source: 'game',
        target: stratId,
        label: includeLabels ? 'uses strategy' : undefined,
        type: 'strategy',
      });
    }
  }

  // Add Nash equilibria nodes
  if (thought.nashEquilibria && thought.nashEquilibria.length > 0) {
    for (let i = 0; i < thought.nashEquilibria.length; i++) {
      const eq = thought.nashEquilibria[i];
      const eqId = `equilibrium_${i}`;
      addNode(graph, {
        id: eqId,
        label: `Nash Equilibrium ${i + 1}`,
        type: 'equilibrium',
        metadata: {
          equilibriumType: eq.type,
          strategyProfile: eq.strategyProfile,
          payoffs: eq.payoffs,
          isStrict: eq.isStrict,
        },
      });
      addEdge(graph, {
        id: `edge_${edgeId++}`,
        source: 'game',
        target: eqId,
        label: includeLabels ? 'achieves' : undefined,
        type: 'outcome',
      });
    }
  }

  // Add metrics
  if (includeMetrics) {
    addMetric(graph, 'Players', thought.players?.length || thought.game?.numPlayers || 0);
    addMetric(graph, 'Strategies', thought.strategies?.length || 0);
    addMetric(graph, 'Nash Equilibria', thought.nashEquilibria?.length || 0);
  }

  // Add legend
  addLegendItem(graph, 'Game', '#4A90E2');
  addLegendItem(graph, 'Player', '#50C878');
  addLegendItem(graph, 'Pure Strategy', '#FFD700');
  addLegendItem(graph, 'Mixed Strategy', '#FFA500');
  addLegendItem(graph, 'Nash Equilibrium', '#9370DB');

  return serializeGraph(graph);
}
