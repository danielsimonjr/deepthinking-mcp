/**
 * Visual Export Types (v7.0.0)
 * Sprint 8 Task 8.1: Modular visual export system
 * Phase 8: Added native SVG format support
 */

export type VisualFormat = 'mermaid' | 'dot' | 'ascii' | 'svg';

export interface VisualExportOptions {
  format: VisualFormat;
  colorScheme?: 'default' | 'monochrome' | 'pastel';
  includeLabels?: boolean;
  includeMetrics?: boolean;
  // SVG-specific options
  svgWidth?: number;
  svgHeight?: number;
  nodeSpacing?: number;
}
