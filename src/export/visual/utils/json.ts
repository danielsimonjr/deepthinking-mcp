/**
 * JSON Visual Export Utilities (v8.5.0)
 * Shared utilities for JSON-based visualization data export
 * Phase 13 Sprint 3: Added JSONExportBuilder fluent API
 */

/**
 * JSON node definition for visualization
 */
export interface JsonVisualNode {
  id: string;
  label: string;
  type?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  color?: string;
  shape?: 'rectangle' | 'ellipse' | 'diamond' | 'stadium' | 'circle';
  metadata?: Record<string, unknown>;
  children?: JsonVisualNode[];
}

/**
 * JSON edge definition for visualization
 */
export interface JsonVisualEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: string;
  weight?: number;
  style?: 'solid' | 'dashed' | 'dotted';
  directed?: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * JSON graph structure
 */
export interface JsonVisualGraph {
  type: string;
  version: string;
  metadata: {
    title: string;
    description?: string;
    mode: string;
    exportedAt: string;
    generator: string;
    [key: string]: unknown;
  };
  nodes: JsonVisualNode[];
  edges: JsonVisualEdge[];
  layout?: {
    type: 'hierarchical' | 'force' | 'circular' | 'tree' | 'linear';
    direction?: 'TB' | 'BT' | 'LR' | 'RL';
  };
  metrics?: Record<string, unknown>;
  legend?: Array<{ label: string; color: string; shape?: string }>;
}

/**
 * Options for JSON export
 */
export interface JsonVisualOptions {
  includeMetadata?: boolean;
  includeLayout?: boolean;
  includeMetrics?: boolean;
  includeLegend?: boolean;
  prettyPrint?: boolean;
  indent?: number;
}

/**
 * Create a new JSON visual graph structure
 */
export function createJsonGraph(
  title: string,
  mode: string,
  options: JsonVisualOptions = {}
): JsonVisualGraph {
  return {
    type: 'deepthinking-visual-graph',
    version: '1.0.0',
    metadata: {
      title,
      mode,
      exportedAt: new Date().toISOString(),
      generator: 'DeepThinking MCP v8.3.1',
    },
    nodes: [],
    edges: [],
    layout: options.includeLayout !== false ? { type: 'hierarchical', direction: 'TB' } : undefined,
    metrics: options.includeMetrics !== false ? {} : undefined,
    legend: options.includeLegend !== false ? [] : undefined,
  };
}

/**
 * Add a node to the graph
 */
export function addNode(
  graph: JsonVisualGraph,
  node: JsonVisualNode
): void {
  graph.nodes.push(node);
}

/**
 * Add an edge to the graph
 */
export function addEdge(
  graph: JsonVisualGraph,
  edge: JsonVisualEdge
): void {
  graph.edges.push(edge);
}

/**
 * Add metric to the graph
 */
export function addMetric(
  graph: JsonVisualGraph,
  key: string,
  value: unknown
): void {
  if (graph.metrics) {
    graph.metrics[key] = value;
  }
}

/**
 * Add legend item to the graph
 */
export function addLegendItem(
  graph: JsonVisualGraph,
  label: string,
  color: string,
  shape?: string
): void {
  if (graph.legend) {
    graph.legend.push({ label, color, shape });
  }
}

/**
 * Serialize graph to JSON string
 */
export function serializeGraph(
  graph: JsonVisualGraph,
  options: JsonVisualOptions = {}
): string {
  const indent = options.prettyPrint !== false ? (options.indent || 2) : 0;
  return JSON.stringify(graph, null, indent);
}

/**
 * Generate a linear flow JSON structure
 */
export function generateLinearFlowJson(
  title: string,
  mode: string,
  stages: string[],
  currentStage: string,
  options: JsonVisualOptions = {}
): string {
  const graph = createJsonGraph(title, mode, options);

  // Set layout for linear flow
  if (graph.layout) {
    graph.layout.type = 'linear';
    graph.layout.direction = 'LR';
  }

  // Add stage nodes
  for (let i = 0; i < stages.length; i++) {
    const stage = stages[i];
    const isCurrent = stage === currentStage;
    addNode(graph, {
      id: `stage_${i}`,
      label: stage,
      type: isCurrent ? 'current' : 'stage',
      x: i * 150,
      y: 0,
      color: isCurrent ? '#a8d5ff' : '#e0e0e0',
      shape: isCurrent ? 'stadium' : 'rectangle',
    });

    // Add edges between consecutive stages
    if (i > 0) {
      addEdge(graph, {
        id: `edge_${i - 1}_${i}`,
        source: `stage_${i - 1}`,
        target: `stage_${i}`,
        directed: true,
        style: 'solid',
      });
    }
  }

  // Add metrics
  if (graph.metrics) {
    graph.metrics.totalStages = stages.length;
    graph.metrics.currentStageIndex = stages.indexOf(currentStage);
    graph.metrics.progress = (stages.indexOf(currentStage) + 1) / stages.length;
  }

  // Add legend
  if (graph.legend) {
    addLegendItem(graph, 'Current Stage', '#a8d5ff', 'stadium');
    addLegendItem(graph, 'Stage', '#e0e0e0', 'rectangle');
  }

  return serializeGraph(graph, options);
}

/**
 * Generate a hierarchy JSON structure
 */
export function generateHierarchyJson(
  title: string,
  mode: string,
  root: { label: string; metadata?: Record<string, unknown> },
  children: Array<{ id: string; label: string; score?: number; metadata?: Record<string, unknown> }>,
  options: JsonVisualOptions = {}
): string {
  const graph = createJsonGraph(title, mode, options);

  // Set layout for hierarchy
  if (graph.layout) {
    graph.layout.type = 'tree';
    graph.layout.direction = 'TB';
  }

  // Add root node
  addNode(graph, {
    id: 'root',
    label: root.label,
    type: 'root',
    x: 0,
    y: 0,
    color: '#a8d5ff',
    shape: 'ellipse',
    metadata: root.metadata,
  });

  // Add child nodes
  const childCount = children.length;
  const spacing = 150;
  const startX = -((childCount - 1) * spacing) / 2;

  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    addNode(graph, {
      id: child.id,
      label: child.label,
      type: 'child',
      x: startX + i * spacing,
      y: 100,
      color: '#e0e0e0',
      shape: 'rectangle',
      metadata: {
        ...child.metadata,
        score: child.score,
      },
    });

    addEdge(graph, {
      id: `edge_root_${child.id}`,
      source: 'root',
      target: child.id,
      directed: true,
      style: 'solid',
    });
  }

  // Add metrics
  if (graph.metrics) {
    graph.metrics.childCount = children.length;
    if (children.some(c => c.score !== undefined)) {
      graph.metrics.averageScore = children.reduce((sum, c) => sum + (c.score || 0), 0) / children.length;
      graph.metrics.maxScore = Math.max(...children.map(c => c.score || 0));
    }
  }

  return serializeGraph(graph, options);
}

/**
 * Generate a network JSON structure
 */
export function generateNetworkJson(
  title: string,
  mode: string,
  nodes: Array<{ id: string; label: string; type?: string; metadata?: Record<string, unknown> }>,
  edges: Array<{ source: string; target: string; label?: string; weight?: number }>,
  options: JsonVisualOptions = {}
): string {
  const graph = createJsonGraph(title, mode, options);

  // Set layout for network
  if (graph.layout) {
    graph.layout.type = 'force';
  }

  // Add nodes
  for (const node of nodes) {
    addNode(graph, {
      id: node.id,
      label: node.label,
      type: node.type || 'node',
      color: node.type === 'primary' ? '#a8d5ff' : '#e0e0e0',
      shape: 'ellipse',
      metadata: node.metadata,
    });
  }

  // Add edges
  let edgeId = 0;
  for (const edge of edges) {
    addEdge(graph, {
      id: `edge_${edgeId++}`,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      weight: edge.weight,
      directed: true,
      style: 'solid',
    });
  }

  // Add metrics
  if (graph.metrics) {
    graph.metrics.nodeCount = nodes.length;
    graph.metrics.edgeCount = edges.length;
    graph.metrics.density = nodes.length > 1
      ? edges.length / (nodes.length * (nodes.length - 1))
      : 0;
  }

  return serializeGraph(graph, options);
}

/**
 * Generate a Bayesian network JSON structure
 */
export function generateBayesianJson(
  title: string,
  prior: number,
  posterior: number,
  bayesFactor: number | undefined,
  hypothesis: string,
  evidence: string[],
  options: JsonVisualOptions = {}
): string {
  const graph = createJsonGraph(title, 'bayesian', options);

  if (graph.layout) {
    graph.layout.type = 'hierarchical';
    graph.layout.direction = 'TB';
  }

  // Add nodes
  addNode(graph, {
    id: 'prior',
    label: `Prior: ${prior.toFixed(3)}`,
    type: 'prior',
    x: 0,
    y: 0,
    color: '#a8d5ff',
    shape: 'stadium',
  });

  addNode(graph, {
    id: 'evidence',
    label: 'Evidence',
    type: 'evidence',
    x: 200,
    y: 0,
    color: '#81c784',
    shape: 'rectangle',
    metadata: { items: evidence },
  });

  addNode(graph, {
    id: 'hypothesis',
    label: hypothesis,
    type: 'hypothesis',
    x: 100,
    y: 100,
    color: '#e0e0e0',
    shape: 'ellipse',
  });

  addNode(graph, {
    id: 'posterior',
    label: `Posterior: ${posterior.toFixed(3)}`,
    type: 'posterior',
    x: 100,
    y: 200,
    color: '#4caf50',
    shape: 'stadium',
  });

  // Add edges
  addEdge(graph, {
    id: 'edge_prior_hyp',
    source: 'prior',
    target: 'hypothesis',
    directed: true,
  });

  addEdge(graph, {
    id: 'edge_evidence_hyp',
    source: 'evidence',
    target: 'hypothesis',
    directed: true,
  });

  addEdge(graph, {
    id: 'edge_hyp_post',
    source: 'hypothesis',
    target: 'posterior',
    directed: true,
  });

  // Add metrics
  if (graph.metrics) {
    graph.metrics.prior = prior;
    graph.metrics.posterior = posterior;
    graph.metrics.bayesFactor = bayesFactor;
    graph.metrics.evidenceCount = evidence.length;
    graph.metrics.probabilityChange = posterior - prior;
  }

  // Add legend
  if (graph.legend) {
    addLegendItem(graph, 'Prior', '#a8d5ff', 'stadium');
    addLegendItem(graph, 'Evidence', '#81c784', 'rectangle');
    addLegendItem(graph, 'Hypothesis', '#e0e0e0', 'ellipse');
    addLegendItem(graph, 'Posterior', '#4caf50', 'stadium');
  }

  return serializeGraph(graph, options);
}

/**
 * Generate a cause-effect JSON structure
 */
export function generateCausalJson(
  title: string,
  mode: string,
  causes: Array<{ id: string; label: string; strength?: number }>,
  effects: Array<{ id: string; label: string }>,
  links: Array<{ cause: string; effect: string; strength?: number }>,
  options: JsonVisualOptions = {}
): string {
  const graph = createJsonGraph(title, mode, options);

  if (graph.layout) {
    graph.layout.type = 'hierarchical';
    graph.layout.direction = 'LR';
  }

  // Add cause nodes
  for (let i = 0; i < causes.length; i++) {
    const cause = causes[i];
    addNode(graph, {
      id: cause.id,
      label: cause.label,
      type: 'cause',
      x: 0,
      y: i * 80,
      color: '#ffb74d',
      shape: 'rectangle',
      metadata: { strength: cause.strength },
    });
  }

  // Add effect nodes
  for (let i = 0; i < effects.length; i++) {
    const effect = effects[i];
    addNode(graph, {
      id: effect.id,
      label: effect.label,
      type: 'effect',
      x: 250,
      y: i * 80,
      color: '#4fc3f7',
      shape: 'rectangle',
    });
  }

  // Add causal links
  let edgeId = 0;
  for (const link of links) {
    addEdge(graph, {
      id: `causal_${edgeId++}`,
      source: link.cause,
      target: link.effect,
      weight: link.strength,
      directed: true,
      style: 'solid',
    });
  }

  // Add metrics
  if (graph.metrics) {
    graph.metrics.causeCount = causes.length;
    graph.metrics.effectCount = effects.length;
    graph.metrics.linkCount = links.length;
  }

  // Add legend
  if (graph.legend) {
    addLegendItem(graph, 'Cause', '#ffb74d', 'rectangle');
    addLegendItem(graph, 'Effect', '#4fc3f7', 'rectangle');
  }

  return serializeGraph(graph, options);
}

// =============================================================================
// JSONExportBuilder Fluent API (Phase 13 Sprint 3)
// =============================================================================

/**
 * JSON section definition for builder
 */
export interface JSONSectionDef {
  key: string;
  value: unknown;
}

/**
 * JSONExportBuilder options
 */
export interface JSONExportBuilderOptions {
  prettyPrint?: boolean;
  indent?: number;
  includeNullValues?: boolean;
  sortKeys?: boolean;
}

/**
 * JSONExportBuilder - Fluent API for building JSON export structures
 *
 * @example
 * ```typescript
 * const json = new JSONExportBuilder()
 *   .setMetadata({ title: 'Analysis', version: '1.0.0' })
 *   .addSection('summary', { total: 100, passed: 95 })
 *   .addArraySection('items', ['A', 'B', 'C'])
 *   .setFormatting({ prettyPrint: true, indent: 2 })
 *   .render();
 * ```
 */
export class JSONExportBuilder {
  private data: Record<string, unknown> = {};
  private options: JSONExportBuilderOptions = { prettyPrint: true, indent: 2 };

  /**
   * Set or merge builder options
   * @param options - Options to set/merge
   * @returns this for chaining
   */
  setOptions(options: JSONExportBuilderOptions): this {
    this.options = { ...this.options, ...options };
    return this;
  }

  /**
   * Set formatting options
   * @param formatting - Formatting options
   * @returns this for chaining
   */
  setFormatting(formatting: { prettyPrint?: boolean; indent?: number }): this {
    if (formatting.prettyPrint !== undefined) {
      this.options.prettyPrint = formatting.prettyPrint;
    }
    if (formatting.indent !== undefined) {
      this.options.indent = formatting.indent;
    }
    return this;
  }

  /**
   * Set document metadata
   * @param metadata - Metadata object
   * @returns this for chaining
   */
  setMetadata(metadata: Record<string, unknown>): this {
    this.data.metadata = {
      ...((this.data.metadata as Record<string, unknown>) || {}),
      ...metadata,
      exportedAt: new Date().toISOString(),
      generator: 'DeepThinking MCP v8.5.0',
    };
    return this;
  }

  /**
   * Add a section to the JSON structure
   * @param key - Section key
   * @param value - Section value
   * @returns this for chaining
   */
  addSection(key: string, value: unknown): this {
    this.data[key] = value;
    return this;
  }

  /**
   * Add an array section to the JSON structure
   * @param key - Section key
   * @param items - Array items
   * @returns this for chaining
   */
  addArraySection(key: string, items: unknown[]): this {
    this.data[key] = items;
    return this;
  }

  /**
   * Add an object section to the JSON structure
   * @param key - Section key
   * @param object - Object value
   * @returns this for chaining
   */
  addObjectSection(key: string, object: Record<string, unknown>): this {
    this.data[key] = object;
    return this;
  }

  /**
   * Merge multiple sections at once
   * @param sections - Array of section definitions
   * @returns this for chaining
   */
  addSections(sections: JSONSectionDef[]): this {
    for (const section of sections) {
      this.data[section.key] = section.value;
    }
    return this;
  }

  /**
   * Add a nested object at a path
   * @param path - Dot-separated path (e.g., 'config.settings.theme')
   * @param value - Value to set
   * @returns this for chaining
   */
  setPath(path: string, value: unknown): this {
    const parts = path.split('.');
    let current: Record<string, unknown> = this.data;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!(part in current) || typeof current[part] !== 'object') {
        current[part] = {};
      }
      current = current[part] as Record<string, unknown>;
    }

    current[parts[parts.length - 1]] = value;
    return this;
  }

  /**
   * Add graph nodes and edges (visual graph format)
   * @param nodes - Array of nodes
   * @param edges - Array of edges
   * @returns this for chaining
   */
  addGraph(nodes: JsonVisualNode[], edges: JsonVisualEdge[]): this {
    this.data.nodes = nodes;
    this.data.edges = edges;
    return this;
  }

  /**
   * Add layout information
   * @param layout - Layout configuration
   * @returns this for chaining
   */
  addLayout(
    layout: { type: 'hierarchical' | 'force' | 'circular' | 'tree' | 'linear'; direction?: 'TB' | 'BT' | 'LR' | 'RL' }
  ): this {
    this.data.layout = layout;
    return this;
  }

  /**
   * Add metrics to the JSON structure
   * @param metrics - Metrics object
   * @returns this for chaining
   */
  addMetrics(metrics: Record<string, unknown>): this {
    this.data.metrics = {
      ...((this.data.metrics as Record<string, unknown>) || {}),
      ...metrics,
    };
    return this;
  }

  /**
   * Add legend items
   * @param legend - Array of legend items
   * @returns this for chaining
   */
  addLegend(legend: Array<{ label: string; color: string; shape?: string }>): this {
    this.data.legend = legend;
    return this;
  }

  /**
   * Remove a section by key
   * @param key - Section key to remove
   * @returns this for chaining
   */
  removeSection(key: string): this {
    delete this.data[key];
    return this;
  }

  /**
   * Reset the builder to initial state
   * @returns this for chaining
   */
  reset(): this {
    this.data = {};
    this.options = { prettyPrint: true, indent: 2 };
    return this;
  }

  /**
   * Get the raw data object
   * @returns The underlying data object
   */
  getData(): Record<string, unknown> {
    return { ...this.data };
  }

  /**
   * Render the JSON structure to string
   * @returns The JSON string
   */
  render(): string {
    let result = this.data;

    // Remove null values if configured
    if (!this.options.includeNullValues) {
      result = this.removeNulls(result);
    }

    // Sort keys if configured
    if (this.options.sortKeys) {
      result = this.sortKeysRecursive(result);
    }

    const indent = this.options.prettyPrint ? this.options.indent : 0;
    return JSON.stringify(result, null, indent);
  }

  /**
   * Remove null values from object recursively
   */
  private removeNulls(obj: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) {
        continue;
      }
      if (typeof value === 'object' && !Array.isArray(value)) {
        result[key] = this.removeNulls(value as Record<string, unknown>);
      } else {
        result[key] = value;
      }
    }
    return result;
  }

  /**
   * Sort object keys recursively
   */
  private sortKeysRecursive(obj: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    const sortedKeys = Object.keys(obj).sort();
    for (const key of sortedKeys) {
      const value = obj[key];
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        result[key] = this.sortKeysRecursive(value as Record<string, unknown>);
      } else {
        result[key] = value;
      }
    }
    return result;
  }
}
