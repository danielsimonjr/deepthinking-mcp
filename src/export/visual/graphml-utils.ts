/**
 * GraphML Export Utilities (v7.0.3)
 * Phase 9: Shared GraphML generation utilities for all visual exporters
 *
 * GraphML is an XML-based format for graph representation, compatible with:
 * - yEd Graph Editor
 * - Gephi
 * - Cytoscape
 * - NetworkX
 * - igraph
 */

export interface GraphMLNode {
  id: string;
  label: string;
  type?: string;
  metadata?: Record<string, unknown>;
}

export interface GraphMLEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  directed?: boolean;
  metadata?: Record<string, unknown>;
}

export interface GraphMLOptions {
  directed?: boolean;
  includeMetadata?: boolean;
  includeLabels?: boolean;
  graphId?: string;
  graphName?: string;
}

export const DEFAULT_GRAPHML_OPTIONS: GraphMLOptions = {
  directed: true,
  includeMetadata: true,
  includeLabels: true,
  graphId: 'G',
  graphName: 'Graph',
};

/**
 * XML escape special characters
 */
function escapeXML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generate GraphML document header with schema definitions
 */
export function generateGraphMLHeader(options: GraphMLOptions = {}): string {
  const { graphId = 'G', directed = true, graphName } = options;

  let header = `<?xml version="1.0" encoding="UTF-8"?>
<graphml xmlns="http://graphml.graphdrawing.org/xmlns"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://graphml.graphdrawing.org/xmlns
         http://graphml.graphdrawing.org/xmlns/1.0/graphml.xsd">

  <!-- Node attributes -->
  <key id="label" for="node" attr.name="label" attr.type="string"/>
  <key id="type" for="node" attr.name="type" attr.type="string"/>
  <key id="description" for="node" attr.name="description" attr.type="string"/>

  <!-- Edge attributes -->
  <key id="edgeLabel" for="edge" attr.name="label" attr.type="string"/>
  <key id="weight" for="edge" attr.name="weight" attr.type="double"/>
  <key id="edgeType" for="edge" attr.name="type" attr.type="string"/>

  <!-- Graph attributes -->
  <key id="graphName" for="graph" attr.name="name" attr.type="string"/>

  <graph id="${escapeXML(graphId)}" edgedefault="${directed ? 'directed' : 'undirected'}">`;

  if (graphName) {
    header += `\n    <data key="graphName">${escapeXML(graphName)}</data>`;
  }

  return header;
}

/**
 * Generate GraphML document footer
 */
export function generateGraphMLFooter(): string {
  return `
  </graph>
</graphml>`;
}

/**
 * Render a node in GraphML format
 */
export function renderGraphMLNode(node: GraphMLNode, options: GraphMLOptions = {}): string {
  const { includeLabels = true, includeMetadata = true } = options;

  let nodeXML = `\n    <node id="${escapeXML(node.id)}">`;

  if (includeLabels && node.label) {
    nodeXML += `\n      <data key="label">${escapeXML(node.label)}</data>`;
  }

  if (node.type) {
    nodeXML += `\n      <data key="type">${escapeXML(node.type)}</data>`;
  }

  if (includeMetadata && node.metadata) {
    if (node.metadata.description) {
      nodeXML += `\n      <data key="description">${escapeXML(String(node.metadata.description))}</data>`;
    }
  }

  nodeXML += `\n    </node>`;
  return nodeXML;
}

/**
 * Render an edge in GraphML format
 */
export function renderGraphMLEdge(edge: GraphMLEdge, options: GraphMLOptions = {}): string {
  const { includeLabels = true, includeMetadata = true } = options;

  let edgeXML = `\n    <edge id="${escapeXML(edge.id)}" source="${escapeXML(edge.source)}" target="${escapeXML(edge.target)}">`;

  if (includeLabels && edge.label) {
    edgeXML += `\n      <data key="edgeLabel">${escapeXML(edge.label)}</data>`;
  }

  if (includeMetadata && edge.metadata) {
    if (edge.metadata.weight !== undefined) {
      edgeXML += `\n      <data key="weight">${edge.metadata.weight}</data>`;
    }
    if (edge.metadata.type) {
      edgeXML += `\n      <data key="edgeType">${escapeXML(String(edge.metadata.type))}</data>`;
    }
  }

  edgeXML += `\n    </edge>`;
  return edgeXML;
}

/**
 * Generate a complete GraphML document from nodes and edges
 */
export function generateGraphML(
  nodes: GraphMLNode[],
  edges: GraphMLEdge[],
  options: GraphMLOptions = {}
): string {
  const mergedOptions = { ...DEFAULT_GRAPHML_OPTIONS, ...options };

  let graphml = generateGraphMLHeader(mergedOptions);

  // Add nodes
  graphml += '\n\n    <!-- Nodes -->';
  for (const node of nodes) {
    graphml += renderGraphMLNode(node, mergedOptions);
  }

  // Add edges
  graphml += '\n\n    <!-- Edges -->';
  for (const edge of edges) {
    graphml += renderGraphMLEdge(edge, mergedOptions);
  }

  graphml += generateGraphMLFooter();
  return graphml;
}

/**
 * Create a simple linear graph (for sequential/temporal flows)
 */
export function createLinearGraphML(
  nodeLabels: string[],
  options: GraphMLOptions = {}
): string {
  const nodes: GraphMLNode[] = nodeLabels.map((label, i) => ({
    id: `n${i}`,
    label,
    type: 'step',
  }));

  const edges: GraphMLEdge[] = [];
  for (let i = 0; i < nodeLabels.length - 1; i++) {
    edges.push({
      id: `e${i}`,
      source: `n${i}`,
      target: `n${i + 1}`,
    });
  }

  return generateGraphML(nodes, edges, options);
}

/**
 * Create a hierarchical tree graph
 */
export function createTreeGraphML(
  root: { id: string; label: string; children?: Array<{ id: string; label: string; children?: unknown[] }> },
  options: GraphMLOptions = {}
): string {
  const nodes: GraphMLNode[] = [];
  const edges: GraphMLEdge[] = [];
  let edgeCount = 0;

  function traverse(node: { id: string; label: string; children?: unknown[] }, depth: number = 0): void {
    nodes.push({
      id: node.id,
      label: node.label,
      type: depth === 0 ? 'root' : 'node',
      metadata: { depth },
    });

    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children as Array<{ id: string; label: string; children?: unknown[] }>) {
        edges.push({
          id: `e${edgeCount++}`,
          source: node.id,
          target: child.id,
        });
        traverse(child, depth + 1);
      }
    }
  }

  traverse(root);
  return generateGraphML(nodes, edges, options);
}

/**
 * Create a layered graph (for causal/bayesian networks)
 */
export function createLayeredGraphML(
  layers: Array<Array<{ id: string; label: string; type?: string }>>,
  connections: Array<{ from: string; to: string; label?: string; weight?: number }>,
  options: GraphMLOptions = {}
): string {
  const nodes: GraphMLNode[] = [];

  for (let layerIdx = 0; layerIdx < layers.length; layerIdx++) {
    for (const node of layers[layerIdx]) {
      nodes.push({
        id: node.id,
        label: node.label,
        type: node.type || `layer${layerIdx}`,
        metadata: { layer: layerIdx },
      });
    }
  }

  const edges: GraphMLEdge[] = connections.map((conn, i) => ({
    id: `e${i}`,
    source: conn.from,
    target: conn.to,
    label: conn.label,
    metadata: conn.weight !== undefined ? { weight: conn.weight } : undefined,
  }));

  return generateGraphML(nodes, edges, options);
}
