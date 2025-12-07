/**
 * Visual Export Types (v7.1.0)
 * Sprint 8 Task 8.1: Modular visual export system
 * Phase 8: Added native SVG format support
 * Phase 9: Added GraphML and TikZ format support
 * Phase 10: Added Modelica, HTML, UML, and JSON format support
 */

export type VisualFormat = 'mermaid' | 'dot' | 'ascii' | 'svg' | 'graphml' | 'tikz' | 'modelica' | 'html' | 'uml' | 'json';

export interface VisualExportOptions {
  format: VisualFormat;
  colorScheme?: 'default' | 'monochrome' | 'pastel';
  includeLabels?: boolean;
  includeMetrics?: boolean;
  // SVG-specific options
  svgWidth?: number;
  svgHeight?: number;
  nodeSpacing?: number;
  // TikZ-specific options
  tikzStandalone?: boolean;
  tikzScale?: number;
  // GraphML-specific options
  graphmlDirected?: boolean;
  // Modelica-specific options
  modelicaPackageName?: string;
  modelicaIncludeAnnotations?: boolean;
  // HTML-specific options
  htmlStandalone?: boolean;
  htmlTitle?: string;
  htmlTheme?: 'light' | 'dark' | 'auto';
  // UML-specific options
  umlDiagramType?: 'class' | 'component' | 'usecase' | 'activity' | 'state' | 'sequence' | 'object';
  umlTheme?: 'default' | 'sketchy' | 'blueprint' | 'plain';
  umlDirection?: 'left to right' | 'top to bottom';
  // JSON-specific options
  jsonPrettyPrint?: boolean;
  jsonIndent?: number;
}
