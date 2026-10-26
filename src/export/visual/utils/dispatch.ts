/**
 * Format dispatch for the mode exporters
 * Fifteen mode exporters repeated one `switch (format)` that picks a converter. It lives here once.
 */

import type { VisualExportOptions } from "../types.js";

type ColorScheme = NonNullable<VisualExportOptions["colorScheme"]>;

/** The eleven converters of one mode, in the call shape that `exportByFormat` uses */
export interface ModeConverters<T> {
  mermaid: (
    thought: T,
    colorScheme: ColorScheme,
    includeLabels: boolean,
    includeMetrics: boolean,
  ) => string;
  dot: (thought: T, includeLabels: boolean, includeMetrics: boolean) => string;
  ascii: (thought: T) => string;
  svg: (thought: T, options: VisualExportOptions) => string;
  graphml: (thought: T, options: VisualExportOptions) => string;
  tikz: (thought: T, options: VisualExportOptions) => string;
  html: (thought: T, options: VisualExportOptions) => string;
  modelica: (thought: T, options: VisualExportOptions) => string;
  uml: (thought: T, options: VisualExportOptions) => string;
  json: (thought: T, options: VisualExportOptions) => string;
  markdown: (thought: T, options: VisualExportOptions) => string;
}

/**
 * Render a thought in the format that `options.format` names.
 * Label and metric flags default to true and the color scheme to "default".
 * An unknown format throws.
 */
export function exportByFormat<T>(
  thought: T,
  options: VisualExportOptions,
  converters: ModeConverters<T>,
): string {
  const {
    format,
    colorScheme = "default",
    includeLabels = true,
    includeMetrics = true,
  } = options;

  switch (format) {
    case "mermaid":
      return converters.mermaid(
        thought,
        colorScheme,
        includeLabels,
        includeMetrics,
      );
    case "dot":
      return converters.dot(thought, includeLabels, includeMetrics);
    case "ascii":
      return converters.ascii(thought);
    case "svg":
      return converters.svg(thought, options);
    case "graphml":
      return converters.graphml(thought, options);
    case "tikz":
      return converters.tikz(thought, options);
    case "html":
      return converters.html(thought, options);
    case "modelica":
      return converters.modelica(thought, options);
    case "uml":
      return converters.uml(thought, options);
    case "json":
      return converters.json(thought, options);
    case "markdown":
      return converters.markdown(thought, options);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}
