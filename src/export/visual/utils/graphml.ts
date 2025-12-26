/**
 * GraphML Export Utilities (v8.5.0)
 * Phase 9: Shared GraphML generation utilities for all visual exporters
 * Phase 13: Added GraphMLBuilder fluent API
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

// =============================================================================
// GraphMLBuilder - Fluent API Builder Class (Phase 13)
// =============================================================================

/**
 * Custom attribute definition for GraphML
 */
export interface GraphMLAttribute {
  id: string;
  name: string;
  type: 'string' | 'double' | 'int' | 'boolean';
  for: 'node' | 'edge' | 'graph';
  defaultValue?: string;
}

/**
 * Fluent API builder for GraphML documents
 *
 * Provides a chainable interface for constructing GraphML XML documents,
 * wrapping the existing utility functions for easier use.
 *
 * @example
 * ```typescript
 * const graphml = new GraphMLBuilder()
 *   .setGraphId('MyGraph')
 *   .setDirected(true)
 *   .addNode('n1', 'Node 1', { type: 'start' })
 *   .addNode('n2', 'Node 2', { type: 'process' })
 *   .addEdge('n1', 'n2', { label: 'flow' })
 *   .render();
 * ```
 */
export class GraphMLBuilder {
  private nodes: GraphMLNode[] = [];
  private edges: GraphMLEdge[] = [];
  private customAttributes: GraphMLAttribute[] = [];
  private options: GraphMLOptions = { ...DEFAULT_GRAPHML_OPTIONS };
  private edgeCounter: number = 0;

  /**
   * Add a node to the graph
   * @param id - Node ID
   * @param label - Node label
   * @param attributes - Optional node attributes (type, metadata)
   * @returns this for chaining
   */
  addNode(
    id: string,
    label: string,
    attributes?: { type?: string; metadata?: Record<string, unknown> }
  ): this {
    this.nodes.push({
      id,
      label,
      type: attributes?.type,
      metadata: attributes?.metadata,
    });
    return this;
  }

  /**
   * Add a node object to the graph
   * @param node - The complete node definition
   * @returns this for chaining
   */
  addNodeDef(node: GraphMLNode): this {
    this.nodes.push(node);
    return this;
  }

  /**
   * Add multiple nodes to the graph
   * @param nodes - Array of node definitions
   * @returns this for chaining
   */
  addNodes(nodes: GraphMLNode[]): this {
    this.nodes.push(...nodes);
    return this;
  }

  /**
   * Add an edge to the graph
   * @param source - Source node ID
   * @param target - Target node ID
   * @param attributes - Optional edge attributes (label, metadata)
   * @returns this for chaining
   */
  addEdge(
    source: string,
    target: string,
    attributes?: { label?: string; metadata?: Record<string, unknown> }
  ): this {
    this.edges.push({
      id: `e${this.edgeCounter++}`,
      source,
      target,
      label: attributes?.label,
      metadata: attributes?.metadata,
    });
    return this;
  }

  /**
   * Add an edge object to the graph
   * @param edge - The complete edge definition
   * @returns this for chaining
   */
  addEdgeDef(edge: GraphMLEdge): this {
    this.edges.push(edge);
    return this;
  }

  /**
   * Add multiple edges to the graph
   * @param edges - Array of edge definitions
   * @returns this for chaining
   */
  addEdges(edges: GraphMLEdge[]): this {
    this.edges.push(...edges);
    return this;
  }

  /**
   * Define a custom node attribute
   * @param name - Attribute name
   * @param type - Attribute type
   * @param defaultValue - Optional default value
   * @returns this for chaining
   */
  defineNodeAttribute(
    name: string,
    type: 'string' | 'double' | 'int' | 'boolean',
    defaultValue?: string
  ): this {
    this.customAttributes.push({
      id: `node_${name}`,
      name,
      type,
      for: 'node',
      defaultValue,
    });
    return this;
  }

  /**
   * Define a custom edge attribute
   * @param name - Attribute name
   * @param type - Attribute type
   * @param defaultValue - Optional default value
   * @returns this for chaining
   */
  defineEdgeAttribute(
    name: string,
    type: 'string' | 'double' | 'int' | 'boolean',
    defaultValue?: string
  ): this {
    this.customAttributes.push({
      id: `edge_${name}`,
      name,
      type,
      for: 'edge',
      defaultValue,
    });
    return this;
  }

  /**
   * Set or merge graph options
   * @param options - Graph options to set/merge
   * @returns this for chaining
   */
  setOptions(options: GraphMLOptions): this {
    this.options = { ...this.options, ...options };
    return this;
  }

  /**
   * Set the graph ID
   * @param id - The graph ID
   * @returns this for chaining
   */
  setGraphId(id: string): this {
    this.options.graphId = id;
    return this;
  }

  /**
   * Set the graph name
   * @param name - The graph name
   * @returns this for chaining
   */
  setGraphName(name: string): this {
    this.options.graphName = name;
    return this;
  }

  /**
   * Set whether the graph is directed
   * @param directed - true for directed, false for undirected
   * @returns this for chaining
   */
  setDirected(directed: boolean): this {
    this.options.directed = directed;
    return this;
  }

  /**
   * Set whether to include metadata
   * @param include - true to include metadata
   * @returns this for chaining
   */
  setIncludeMetadata(include: boolean): this {
    this.options.includeMetadata = include;
    return this;
  }

  /**
   * Set whether to include labels
   * @param include - true to include labels
   * @returns this for chaining
   */
  setIncludeLabels(include: boolean): this {
    this.options.includeLabels = include;
    return this;
  }

  /**
   * Get the current node count
   */
  get nodeCount(): number {
    return this.nodes.length;
  }

  /**
   * Get the current edge count
   */
  get edgeCount(): number {
    return this.edges.length;
  }

  /**
   * Clear all nodes and edges
   * @returns this for chaining
   */
  clear(): this {
    this.nodes = [];
    this.edges = [];
    this.edgeCounter = 0;
    return this;
  }

  /**
   * Reset options to defaults
   * @returns this for chaining
   */
  resetOptions(): this {
    this.options = { ...DEFAULT_GRAPHML_OPTIONS };
    this.customAttributes = [];
    return this;
  }

  /**
   * Render the graph as a GraphML XML string
   *
   * Generates a complete, valid GraphML document with all nodes,
   * edges, and custom attribute definitions.
   *
   * @returns The complete GraphML XML string
   */
  render(): string {
    // If we have custom attributes, we need to generate custom header
    if (this.customAttributes.length > 0) {
      return this.renderWithCustomAttributes();
    }

    // Use existing generateGraphML for standard output
    return generateGraphML(this.nodes, this.edges, this.options);
  }

  /**
   * Render with custom attribute definitions
   */
  private renderWithCustomAttributes(): string {
    const { graphId = 'G', directed = true, graphName, includeLabels = true, includeMetadata = true } = this.options;

    let graphml = `<?xml version="1.0" encoding="UTF-8"?>
<graphml xmlns="http://graphml.graphdrawing.org/xmlns"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://graphml.graphdrawing.org/xmlns
         http://graphml.graphdrawing.org/xmlns/1.0/graphml.xsd">

  <!-- Standard node attributes -->
  <key id="label" for="node" attr.name="label" attr.type="string"/>
  <key id="type" for="node" attr.name="type" attr.type="string"/>
  <key id="description" for="node" attr.name="description" attr.type="string"/>

  <!-- Standard edge attributes -->
  <key id="edgeLabel" for="edge" attr.name="label" attr.type="string"/>
  <key id="weight" for="edge" attr.name="weight" attr.type="double"/>
  <key id="edgeType" for="edge" attr.name="type" attr.type="string"/>

  <!-- Graph attributes -->
  <key id="graphName" for="graph" attr.name="name" attr.type="string"/>`;

    // Add custom attributes
    for (const attr of this.customAttributes) {
      graphml += `\n  <key id="${escapeXMLInternal(attr.id)}" for="${attr.for}" attr.name="${escapeXMLInternal(attr.name)}" attr.type="${attr.type}"`;
      if (attr.defaultValue !== undefined) {
        graphml += `>\n    <default>${escapeXMLInternal(attr.defaultValue)}</default>\n  </key>`;
      } else {
        graphml += `/>`;
      }
    }

    graphml += `\n\n  <graph id="${escapeXMLInternal(graphId)}" edgedefault="${directed ? 'directed' : 'undirected'}">`;

    if (graphName) {
      graphml += `\n    <data key="graphName">${escapeXMLInternal(graphName)}</data>`;
    }

    // Add nodes
    graphml += '\n\n    <!-- Nodes -->';
    for (const node of this.nodes) {
      graphml += renderGraphMLNode(node, { includeLabels, includeMetadata });
    }

    // Add edges
    graphml += '\n\n    <!-- Edges -->';
    for (const edge of this.edges) {
      graphml += renderGraphMLEdge(edge, { includeLabels, includeMetadata });
    }

    graphml += generateGraphMLFooter();
    return graphml;
  }

  /**
   * Create a builder from existing nodes, edges, and options
   * @param nodes - Initial nodes
   * @param edges - Initial edges
   * @param options - Initial options
   * @returns A new GraphMLBuilder instance
   */
  static from(
    nodes: GraphMLNode[] = [],
    edges: GraphMLEdge[] = [],
    options: GraphMLOptions = {}
  ): GraphMLBuilder {
    const builder = new GraphMLBuilder();
    builder.nodes = [...nodes];
    builder.edges = [...edges];
    builder.edgeCounter = edges.length;
    builder.options = { ...DEFAULT_GRAPHML_OPTIONS, ...options };
    return builder;
  }
}

/**
 * Internal XML escape function for GraphMLBuilder
 * (duplicated to avoid circular dependencies)
 */
function escapeXMLInternal(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
