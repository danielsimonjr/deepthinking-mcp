/**
 * Session-level graph rendering (v9.4.1)
 *
 * A multi-thought session is a plain directed graph: one node per thought,
 * plus edges for sequence, revisions and dependencies. `ExportService` used to
 * render that graph for `mermaid`, `dot` and `ascii` only, and let the other
 * eight VisualFormat names fall through to a plain-text `Session: ...` dump —
 * so a client that asked for `html` got text that is not HTML, and one that
 * asked for `visual-json` got text that is not JSON and threw on parse.
 *
 * This module renders the same normalized graph in every remaining format,
 * reusing the builders the single-thought exporters already use so the output
 * shapes match. Like those exporters, it THROWS on an unsupported format
 * rather than degrading: a silent fallback is what hid the gap.
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

/** One thought, or the session summary node. */
export interface SessionGraphNode {
  id: string;
  label: string;
  /** "session" for the summary node, "thought" for each thought. */
  type: "session" | "thought";
  /** Untruncated thought content; omitted for the session node. */
  detail?: string;
  mode?: string;
  thoughtNumber?: number;
}

export interface SessionGraphEdge {
  source: string;
  target: string;
  type: "sequence" | "revision" | "dependency";
  label?: string;
}

/** Everything the renderers need, with no dependency on session types. */
export interface SessionGraphModel {
  title: string;
  mode: string;
  thoughtCount: number;
  branchCount: number;
  revisionCount: number;
  nodes: SessionGraphNode[];
  edges: SessionGraphEdge[];
}

/** Formats this module renders. mermaid/dot/ascii stay in ExportService. */
const SUPPORTED: VisualFormat[] = [
  "svg",
  "graphml",
  "tikz",
  "modelica",
  "html",
  "uml",
  "json",
  "markdown",
];

const EDGE_LABELS: Record<SessionGraphEdge["type"], string> = {
  sequence: "next",
  revision: "revises",
  dependency: "depends on",
};

/**
 * Render a session graph in the requested format.
 *
 * @throws {Error} If the format is not one this module renders. Callers
 * handle mermaid/dot/ascii before reaching here.
 */
export function renderSessionGraph(
  model: SessionGraphModel,
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
        `Unsupported visual format for session-level export: ${format}. ` +
          `Supported: ${SUPPORTED.join(", ")}`,
      );
  }
}

function truncate(text: string, max: number): string {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > max ? `${flat.slice(0, max - 3)}...` : flat;
}

function toGraphML(model: SessionGraphModel): string {
  const nodes: GraphMLNode[] = model.nodes.map((n) => ({
    id: sanitizeId(n.id),
    label: n.label,
    type: n.type,
    metadata: {
      ...(n.mode ? { mode: n.mode } : {}),
      ...(n.thoughtNumber ? { thoughtNumber: n.thoughtNumber } : {}),
    },
  }));

  const edges: GraphMLEdge[] = model.edges.map((e, i) => ({
    id: `e${i}`,
    source: sanitizeId(e.source),
    target: sanitizeId(e.target),
    label: e.label ?? EDGE_LABELS[e.type],
    directed: true,
    metadata: { relation: e.type },
  }));

  return generateGraphML(nodes, edges, {
    graphId: "session",
    graphName: model.title,
    directed: true,
  });
}

function toTikZ(model: SessionGraphModel): string {
  const nodes: TikZNode[] = model.nodes.map((n, i) => ({
    id: sanitizeId(n.id),
    label: truncate(n.label, 28),
    x: 0,
    y: -i * 1.6,
    type: n.type,
    shape: n.type === "session" ? "stadium" : "rectangle",
  }));

  const edges: TikZEdge[] = model.edges.map((e) => ({
    source: sanitizeId(e.source),
    target: sanitizeId(e.target),
    label: e.label ?? EDGE_LABELS[e.type],
    style: e.type === "sequence" ? "solid" : "dashed",
    directed: true,
  }));

  return generateTikZ(nodes, edges, { title: model.title });
}

function toUML(model: SessionGraphModel): string {
  const nodes: UmlNode[] = model.nodes.map((n) => ({
    id: sanitizeId(n.id),
    label: truncate(n.label, 40),
    shape: n.type === "session" ? "package" : "activity",
    stereotype: n.type,
  }));

  const edges: UmlEdge[] = model.edges.map((e) => ({
    source: sanitizeId(e.source),
    target: sanitizeId(e.target),
    type: e.type === "sequence" ? "arrow" : "dashed",
    label: e.label ?? EDGE_LABELS[e.type],
  }));

  return generateUmlDiagram(nodes, edges, {
    title: model.title,
    diagramType: "activity",
  });
}

function toModelica(model: SessionGraphModel): string {
  const description = `Thinking session: ${model.title} (${model.mode})`;
  const body = generateModelicaModel(
    "SessionGraph",
    description,
    model.nodes.map((n) => ({
      id: sanitizeId(n.id),
      label: truncate(n.label, 60),
      type: n.type,
    })),
    model.edges.map((e) => ({
      source: sanitizeId(e.source),
      target: sanitizeId(e.target),
      label: e.label ?? EDGE_LABELS[e.type],
    })),
  );

  return [
    generateModelicaPackageHeader("ThinkingSession", description),
    body,
    generateModelicaPackageFooter("ThinkingSession"),
  ].join("\n");
}

function toJSON(model: SessionGraphModel): string {
  const graph = createJsonGraph(model.title, model.mode);

  for (const n of model.nodes) {
    addJsonNode(graph, {
      id: sanitizeId(n.id),
      label: n.label,
      type: n.type,
      shape: n.type === "session" ? "stadium" : "rectangle",
      metadata: {
        ...(n.detail ? { content: n.detail } : {}),
        ...(n.mode ? { mode: n.mode } : {}),
        ...(n.thoughtNumber ? { thoughtNumber: n.thoughtNumber } : {}),
      },
    });
  }

  model.edges.forEach((e, i) => {
    addJsonEdge(graph, {
      id: `e${i}`,
      source: sanitizeId(e.source),
      target: sanitizeId(e.target),
      label: e.label ?? EDGE_LABELS[e.type],
      type: e.type,
      style: e.type === "sequence" ? "solid" : "dashed",
      directed: true,
    });
  });

  addMetric(graph, "thoughts", model.thoughtCount);
  addMetric(graph, "branches", model.branchCount);
  addMetric(graph, "revisions", model.revisionCount);

  return serializeGraph(graph);
}

function toMarkdown(model: SessionGraphModel): string {
  const thoughts = model.nodes.filter((n) => n.type === "thought");

  const overview = table(
    ["Property", "Value"],
    [
      ["Mode", model.mode],
      ["Thoughts", String(model.thoughtCount)],
      ["Branches", String(model.branchCount)],
      ["Revisions", String(model.revisionCount)],
    ],
  );

  const thoughtList = list(
    thoughts.map(
      (t) =>
        `**${t.label}** — ${truncate(t.detail ?? "", 120) || "(no content)"}`,
    ),
  );

  const relations = model.edges.length
    ? table(
        ["From", "To", "Relation"],
        model.edges.map((e) => [e.source, e.target, e.type]),
      )
    : "_No branches, revisions or dependencies recorded._";

  return [
    heading(model.title, 1),
    heading("Overview", 2),
    overview,
    heading("Thoughts", 2),
    thoughtList,
    heading("Relationships", 2),
    relations,
  ].join("\n\n");
}

function toHTML(model: SessionGraphModel): string {
  const thoughts = model.nodes.filter((n) => n.type === "thought");

  const metrics = [
    renderMetricCard("Thoughts", model.thoughtCount),
    renderMetricCard("Branches", model.branchCount),
    renderMetricCard("Revisions", model.revisionCount),
    renderMetricCard("Mode", model.mode),
  ].join("\n");

  const thoughtRows = thoughts
    .map(
      (t) =>
        `<li><strong>${escapeHTML(t.label)}</strong>` +
        `<p>${escapeHTML(t.detail ?? "")}</p></li>`,
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
    : "<p>No branches, revisions or dependencies recorded.</p>";

  return [
    generateHTMLHeader(model.title),
    `<div class="metrics">${metrics}</div>`,
    renderSection("Thoughts", `<ol class="list-styled">${thoughtRows}</ol>`),
    renderSection("Relationships", relations),
    generateHTMLFooter(),
  ].join("\n");
}

function toSVG(model: SessionGraphModel): string {
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
        n.type === "session" ? "primary" : "neutral",
        "default",
      );
      return n.type === "session"
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
        label: e.label ?? EDGE_LABELS[e.type],
        style: e.type === "sequence" ? "solid" : "dashed",
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
