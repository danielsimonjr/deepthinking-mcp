/**
 * Generic node/edge rendering for the eight non-hand-built visual formats.
 *
 * `mermaid`, `dot` and `ascii` are written by hand per mode because their
 * output is the diagram a reader actually looks at. The remaining eight
 * VisualFormat names — svg, graphml, tikz, modelica, html, uml, json,
 * markdown — are mechanical renderings of the same normalized node/edge graph,
 * and every mode exporter that implements them implements the same eight
 * functions again.
 *
 * This module holds one copy. `session-graph.ts` and the mode exporters build
 * a `GraphRenderModel` and delegate here, so the eight formats cannot drift
 * apart between callers the way three copies of `escapeLatex` did.
 *
 * Like the mode exporters, it THROWS on a format it does not render rather
 * than returning something under the wrong format's name: a silent fallback is
 * what let eight formats return a plain-text dump unnoticed.
 */

import type { VisualFormat } from "./types.js";
import { sanitizeId } from "./utils.js";
import {
  generateGraphML,
  type GraphMLNode,
  type GraphMLEdge,
} from "./utils/graphml.js";
import { generateTikZ, type TikZNode, type TikZEdge } from "./utils/tikz.js";
import { generateUmlDiagram, type UmlNode, type UmlEdge } from "./utils/uml.js";
import {
  generateModelicaPackageHeader,
  generateModelicaPackageFooter,
  generateModelicaModel,
} from "./utils/modelica.js";
import {
  generateSVGHeader,
  generateSVGFooter,
  renderRectNode,
  renderStadiumNode,
  renderEdge as renderSVGEdge,
  getNodeColor,
  DEFAULT_SVG_OPTIONS,
  type SVGNodePosition,
} from "./utils/svg.js";
import {
  generateHTMLHeader,
  generateHTMLFooter,
  escapeHTML,
  renderMetricCard,
  renderSection,
} from "./utils/html.js";
import {
  createJsonGraph,
  addNode as addJsonNode,
  addEdge as addJsonEdge,
  addMetric,
  serializeGraph,
} from "./utils/json.js";
import { heading, list, table } from "./utils/markdown.js";

/** One node in the graph. */
export interface GraphRenderNode {
  id: string;
  label: string;
  /** Free-form class name. The node whose type equals `primaryType` is emphasised. */
  type: string;
  /** Untruncated body text. Used by the document formats (markdown, html, json). */
  detail?: string;
  /** Extra key/value pairs carried into graphml and json. */
  metadata?: Record<string, string | number>;
}

/** One directed edge. */
export interface GraphRenderEdge {
  source: string;
  target: string;
  /** Free-form relation name. Edges of `primaryEdgeType` render solid, others dashed. */
  type: string;
  /** Resolved edge label. Callers apply their own defaults before getting here. */
  label: string;
}

/** Everything the renderers need, with no dependency on any mode's types. */
export interface GraphRenderModel {
  title: string;
  /** Overview-table row label for `subject`, e.g. "Mode". */
  subjectLabel: string;
  subject: string;
  /** Summary counts, rendered as metric cards and overview rows. */
  metrics: Array<{ label: string; value: string | number }>;
  /** Node type rendered as the emphasised root. Every other node is an item. */
  primaryType: string;
  /** Edge type rendered solid. Every other type renders dashed. */
  primaryEdgeType: string;
  /** Heading for the item list, e.g. "Thoughts". */
  itemsHeading: string;
  /** Heading for the relationship table, e.g. "Relationships". */
  relationsHeading: string;
  /** Sentence shown when there are no edges. */
  emptyRelations: string;
  /** Modelica model name. */
  modelName: string;
  /** Modelica package name. */
  packageName: string;
  /** One-line description used by modelica. */
  description: string;
  nodes: GraphRenderNode[];
  edges: GraphRenderEdge[];
}

/** The formats this module renders. mermaid/dot/ascii stay with each caller. */
export const GRAPH_RENDER_FORMATS: VisualFormat[] = [
  "svg",
  "graphml",
  "tikz",
  "modelica",
  "html",
  "uml",
  "json",
  "markdown",
];

/**
 * Render a normalized graph in the requested format.
 *
 * @throws {Error} If the format is not one of `GRAPH_RENDER_FORMATS`.
 * Callers handle mermaid/dot/ascii before reaching here.
 */
export function renderGraphModel(
  model: GraphRenderModel,
  format: VisualFormat,
): string {
  switch (format) {
    case "svg":
      return toSVG(model);
    case "graphml":
      return toGraphML(model);
    case "tikz":
      return toTikZ(model);
    case "modelica":
      return toModelica(model);
    case "html":
      return toHTML(model);
    case "uml":
      return toUML(model);
    case "json":
      return toJSON(model);
    case "markdown":
      return toMarkdown(model);
    default:
      throw new Error(
        `Unsupported visual format for graph-level export: ${format}. ` +
          `Supported: ${GRAPH_RENDER_FORMATS.join(", ")}`,
      );
  }
}

/** Collapse whitespace and cut to `max` characters, ellipsis included. */
export function truncateGraphLabel(text: string, max: number): string {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > max ? `${flat.slice(0, max - 3)}...` : flat;
}

/** Every node that is not the emphasised root. */
function itemNodes(model: GraphRenderModel): GraphRenderNode[] {
  return model.nodes.filter((n) => n.type !== model.primaryType);
}

function toGraphML(model: GraphRenderModel): string {
  const nodes: GraphMLNode[] = model.nodes.map((n) => ({
    id: sanitizeId(n.id),
    label: n.label,
    type: n.type,
    metadata: { ...(n.metadata ?? {}) },
  }));

  const edges: GraphMLEdge[] = model.edges.map((e, i) => ({
    id: `e${i}`,
    source: sanitizeId(e.source),
    target: sanitizeId(e.target),
    label: e.label,
    directed: true,
    metadata: { relation: e.type },
  }));

  return generateGraphML(nodes, edges, {
    graphId: "session",
    graphName: model.title,
    directed: true,
  });
}

function toTikZ(model: GraphRenderModel): string {
  const nodes: TikZNode[] = model.nodes.map((n, i) => ({
    id: sanitizeId(n.id),
    label: truncateGraphLabel(n.label, 28),
    x: 0,
    y: -i * 1.6,
    type: n.type,
    shape: n.type === model.primaryType ? "stadium" : "rectangle",
  }));

  const edges: TikZEdge[] = model.edges.map((e) => ({
    source: sanitizeId(e.source),
    target: sanitizeId(e.target),
    label: e.label,
    style: e.type === model.primaryEdgeType ? "solid" : "dashed",
    directed: true,
  }));

  return generateTikZ(nodes, edges, { title: model.title });
}

function toUML(model: GraphRenderModel): string {
  const nodes: UmlNode[] = model.nodes.map((n) => ({
    id: sanitizeId(n.id),
    label: truncateGraphLabel(n.label, 40),
    shape: n.type === model.primaryType ? "package" : "activity",
    stereotype: n.type,
  }));

  const edges: UmlEdge[] = model.edges.map((e) => ({
    source: sanitizeId(e.source),
    target: sanitizeId(e.target),
    type: e.type === model.primaryEdgeType ? "arrow" : "dashed",
    label: e.label,
  }));

  return generateUmlDiagram(nodes, edges, {
    title: model.title,
    diagramType: "activity",
  });
}

function toModelica(model: GraphRenderModel): string {
  const body = generateModelicaModel(
    model.modelName,
    model.description,
    model.nodes.map((n) => ({
      id: sanitizeId(n.id),
      label: truncateGraphLabel(n.label, 60),
      type: n.type,
    })),
    model.edges.map((e) => ({
      source: sanitizeId(e.source),
      target: sanitizeId(e.target),
      label: e.label,
    })),
  );

  return [
    generateModelicaPackageHeader(model.packageName, model.description),
    body,
    generateModelicaPackageFooter(model.packageName),
  ].join("\n");
}

function toJSON(model: GraphRenderModel): string {
  const graph = createJsonGraph(model.title, model.subject);

  for (const n of model.nodes) {
    addJsonNode(graph, {
      id: sanitizeId(n.id),
      label: n.label,
      type: n.type,
      shape: n.type === model.primaryType ? "stadium" : "rectangle",
      metadata: {
        ...(n.detail ? { content: n.detail } : {}),
        ...(n.metadata ?? {}),
      },
    });
  }

  model.edges.forEach((e, i) => {
    addJsonEdge(graph, {
      id: `e${i}`,
      source: sanitizeId(e.source),
      target: sanitizeId(e.target),
      label: e.label,
      type: e.type,
      style: e.type === model.primaryEdgeType ? "solid" : "dashed",
      directed: true,
    });
  });

  for (const metric of model.metrics) {
    addMetric(graph, metric.label.toLowerCase(), metric.value);
  }

  return serializeGraph(graph);
}

function toMarkdown(model: GraphRenderModel): string {
  const overview = table(
    ["Property", "Value"],
    [
      [model.subjectLabel, model.subject],
      ...model.metrics.map((m) => [m.label, String(m.value)]),
    ],
  );

  const itemList = list(
    itemNodes(model).map(
      (n) =>
        `**${n.label}** — ${truncateGraphLabel(n.detail ?? "", 120) || "(no content)"}`,
    ),
  );

  const relations = model.edges.length
    ? table(
        ["From", "To", "Relation"],
        model.edges.map((e) => [e.source, e.target, e.type]),
      )
    : `_${model.emptyRelations}_`;

  return [
    heading(model.title, 1),
    heading("Overview", 2),
    overview,
    heading(model.itemsHeading, 2),
    itemList,
    heading(model.relationsHeading, 2),
    relations,
  ].join("\n\n");
}

function toHTML(model: GraphRenderModel): string {
  const metrics = [
    ...model.metrics.map((m) => renderMetricCard(m.label, m.value)),
    renderMetricCard(model.subjectLabel, model.subject),
  ].join("\n");

  const itemRows = itemNodes(model)
    .map(
      (n) =>
        `<li><strong>${escapeHTML(n.label)}</strong>` +
        `<p>${escapeHTML(n.detail ?? "")}</p></li>`,
    )
    .join("\n");

  const relationRows = model.edges
    .map(
      (e) =>
        `<tr><td>${escapeHTML(e.source)}</td>` +
        `<td>${escapeHTML(e.target)}</td>` +
        `<td>${escapeHTML(e.type)}</td></tr>`,
    )
    .join("\n");

  const relations = model.edges.length
    ? `<table><thead><tr><th>From</th><th>To</th><th>Relation</th></tr></thead>` +
      `<tbody>${relationRows}</tbody></table>`
    : `<p>${escapeHTML(model.emptyRelations)}</p>`;

  return [
    generateHTMLHeader(model.title),
    `<div class="metrics">${metrics}</div>`,
    renderSection(
      model.itemsHeading,
      `<ol class="list-styled">${itemRows}</ol>`,
    ),
    renderSection(model.relationsHeading, relations),
    generateHTMLFooter(),
  ].join("\n");
}

function toSVG(model: GraphRenderModel): string {
  const opts = DEFAULT_SVG_OPTIONS;
  const { nodeWidth, nodeHeight, padding } = opts;
  const vGap = nodeHeight + 30;
  const width = nodeWidth + padding * 2 + 120;
  const height = padding * 2 + model.nodes.length * vGap;

  const positions = new Map<string, SVGNodePosition>();
  model.nodes.forEach((n, i) => {
    positions.set(n.id, {
      id: sanitizeId(n.id),
      x: padding + 60,
      y: padding + i * vGap,
      width: nodeWidth,
      height: nodeHeight,
      label: n.label,
      type: n.type,
    });
  });

  const nodeMarkup = model.nodes
    .map((n) => {
      const pos = positions.get(n.id)!;
      const colors = getNodeColor(
        n.type === model.primaryType ? "primary" : "neutral",
        "default",
      );
      return n.type === model.primaryType
        ? renderStadiumNode(pos, colors)
        : renderRectNode(pos, colors);
    })
    .join("\n");

  const edgeMarkup = model.edges
    .map((e) => {
      const from = positions.get(e.source);
      const to = positions.get(e.target);
      if (!from || !to) return "";
      return renderSVGEdge(from, to, {
        label: e.label,
        style: e.type === model.primaryEdgeType ? "solid" : "dashed",
      });
    })
    .filter(Boolean)
    .join("\n");

  return [
    generateSVGHeader(width, height, model.title),
    edgeMarkup,
    nodeMarkup,
    generateSVGFooter(),
  ].join("\n");
}
