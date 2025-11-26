/**
 * Visual Export Types (v4.3.0)
 * Sprint 8 Task 8.1: Modular visual export system
 */

export type VisualFormat = 'mermaid' | 'dot' | 'ascii';

export interface VisualExportOptions {
  format: VisualFormat;
  colorScheme?: 'default' | 'monochrome' | 'pastel';
  includeLabels?: boolean;
  includeMetrics?: boolean;
}
