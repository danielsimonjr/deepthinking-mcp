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
 * This module maps a session onto the normalized graph model in
 * `graph-render.ts`, which owns the one implementation of those eight formats.
 * It used to own its own copy; `historical.ts` needed the same eight, and two
 * copies is how the three divergent `escapeLatex` implementations started.
 */

import type { VisualFormat } from "./types.js";
import {
  renderGraphModel,
  GRAPH_RENDER_FORMATS,
  type GraphRenderModel,
} from "./graph-render.js";

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
const SUPPORTED: VisualFormat[] = GRAPH_RENDER_FORMATS;

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
  if (!SUPPORTED.includes(format)) {
    throw new Error(
      `Unsupported visual format for session-level export: ${format}. ` +
        `Supported: ${SUPPORTED.join(", ")}`,
    );
  }

  return renderGraphModel(toGraphRenderModel(model), format);
}

function toGraphRenderModel(model: SessionGraphModel): GraphRenderModel {
  const description = `Thinking session: ${model.title} (${model.mode})`;

  return {
    title: model.title,
    subjectLabel: "Mode",
    subject: model.mode,
    metrics: [
      { label: "Thoughts", value: model.thoughtCount },
      { label: "Branches", value: model.branchCount },
      { label: "Revisions", value: model.revisionCount },
    ],
    primaryType: "session",
    primaryEdgeType: "sequence",
    itemsHeading: "Thoughts",
    relationsHeading: "Relationships",
    emptyRelations: "No branches, revisions or dependencies recorded.",
    modelName: "SessionGraph",
    packageName: "ThinkingSession",
    description,
    nodes: model.nodes.map((n) => ({
      id: n.id,
      label: n.label,
      type: n.type,
      detail: n.detail,
      metadata: {
        ...(n.mode ? { mode: n.mode } : {}),
        ...(n.thoughtNumber ? { thoughtNumber: n.thoughtNumber } : {}),
      },
    })),
    edges: model.edges.map((e) => ({
      source: e.source,
      target: e.target,
      type: e.type,
      label: e.label ?? EDGE_LABELS[e.type],
    })),
  };
}
