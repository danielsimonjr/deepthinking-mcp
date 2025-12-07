/**
 * Visual Export Types (v7.1.0)
 * Sprint 8 Task 8.1: Modular visual export system
 * Phase 8: Added native SVG format support
 * Phase 9: Added GraphML and TikZ format support
 * Phase 10: Added Modelica and HTML format support
 */

export type VisualFormat = 'mermaid' | 'dot' | 'ascii' | 'svg' | 'graphml' | 'tikz' | 'modelica' | 'html';

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
}
