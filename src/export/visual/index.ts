/**
 * Visual Export Module (v8.3.0)
 * Reorganized: utilities in utils/, mode exporters in modes/
 *
 * Exports thinking sessions to visual formats: Mermaid, DOT, ASCII, SVG, GraphML, TikZ, Modelica, HTML, UML, JSON
 */

// Re-export types
export { type VisualFormat, type VisualExportOptions } from './types.js';
export { sanitizeId } from './utils.js';

// Re-export VisualExporter class (separated to break circular dependency)
export { VisualExporter } from './visual-exporter.js';

// Re-export all mode-specific exporters from modes/
export * from './modes/index.js';

// Re-export all utilities from utils/ (AFTER modes to avoid circular deps)
// Note: latex.ts and latex-mermaid-integration.ts import VisualExporter from visual-exporter.ts directly
export * from './utils/index.js';
