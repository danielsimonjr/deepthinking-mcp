/**
 * Export Service (v7.0.3)
 * Sprint 3 Task 3.3: Extract export logic from index.ts
 * Sprint 3 Task 3.2: Added dependency injection support
 * Phase 9: Added native SVG, GraphML, and TikZ export support
 *
 * Centralizes session export logic for multiple formats.
 * Handles conversion between internal session format and export formats.
 *
 * RESPONSIBILITY:
 * - Export sessions to various formats (JSON, Markdown, LaTeX, HTML, Jupyter)
 * - Handle visual exports (Mermaid, DOT, ASCII, SVG, GraphML, TikZ, Markdown)
 * - Apply proper escaping and formatting for each format
 *
 * EXTRACTED FROM: src/index.ts (handleExport, exportTo* functions)
 */

import {
  ThinkingSession,
  ThinkingMode,
  Thought,
  CausalThought,
  TemporalThought,
  GameTheoryThought,
  BayesianThought,
  FirstPrinciplesThought,
  isMetaReasoningThought,
  isCausalThought,
  isBayesianThought,
  isTemporalThought,
  isGameTheoryThought,
  isFirstPrinciplesThought,
  isSystemsThinkingThought,
  isSynthesisThought,
  isArgumentationThought,
  isAnalysisThought,
  isAlgorithmicThought,
  isScientificMethodThought,
  HybridThought,
  // Sprint 1: Visual export integration types
  SequentialThought,
  ShannonThought,
  AbductiveThought,
  CounterfactualThought,
  AnalogicalThought,
  EvidentialThought,
  SystemsThinkingThought,
  ScientificMethodThought,
  OptimizationThought,
  FormalLogicThought,
} from '../types/index.js';
import type { MathematicsThought } from '../types/modes/mathematics.js';
import type { PhysicsThought } from '../types/modes/physics.js';
import type { MetaReasoningThought } from '../types/modes/metareasoning.js';
import type { EngineeringThought } from '../types/modes/engineering.js';
import { VisualExporter, type VisualFormat } from '../export/visual/index.js';
import { escapeHtml, escapeLatex } from '../utils/sanitization.js';
import { ILogger } from '../interfaces/ILogger.js';
import { createLogger, LogLevel } from '../utils/logger.js';

/**
 * Export Service - Handles session exports to multiple formats
 *
 * Provides a unified interface for exporting thinking sessions to
 * various formats including text (JSON, Markdown), document (LaTeX, HTML),
 * notebook (Jupyter), and visual (Mermaid, DOT, ASCII).
 *
 * @example
 * ```typescript
 * const exportService = new ExportService();
 * const markdown = exportService.exportSession(session, 'markdown');
 * const jupyter = exportService.exportSession(session, 'jupyter');
 * ```
 */
export class ExportService {
  private visualExporter: VisualExporter;
  private logger: ILogger;

  constructor(logger?: ILogger) {
    this.visualExporter = new VisualExporter();
    this.logger = logger || createLogger({ minLevel: LogLevel.INFO, enableConsole: true });
  }

  /**
   * Export a session to the specified format
   *
   * Main export method that routes to format-specific exporters.
   * Handles both standard formats (JSON, Markdown, etc.) and visual
   * formats (Mermaid, DOT, ASCII).
   *
   * @param session - The session to export
   * @param format - The desired export format
   * @returns Formatted string in the requested format
   * @throws {Error} If session has no thoughts for visual exports
   *
   * @example
   * ```typescript
   * const service = new ExportService();
   * const exported = service.exportSession(session, 'markdown');
   * ```
   */
  exportSession(
    session: ThinkingSession,
    format: 'json' | 'markdown' | 'latex' | 'html' | 'jupyter' | 'mermaid' | 'dot' | 'ascii' | 'svg' | 'graphml' | 'tikz' | 'modelica' | 'uml' | 'visual-json' | 'visual-markdown'
  ): string {
    const startTime = Date.now();
    this.logger.debug('Export started', { sessionId: session.id, format, thoughtCount: session.thoughts.length });

    // Handle visual formats (including SVG, GraphML, TikZ, Modelica, HTML, UML, JSON graph, Markdown)
    if (format === 'mermaid' || format === 'dot' || format === 'ascii' || format === 'svg' || format === 'graphml' || format === 'tikz' || format === 'modelica' || format === 'html' || format === 'uml' || format === 'visual-json' || format === 'visual-markdown') {
      // Map 'visual-json' and 'visual-markdown' to their VisualFormat equivalents
      const visualFormat = format === 'visual-json' ? 'json' : format === 'visual-markdown' ? 'markdown' : format;
      const result = this.exportVisual(session, visualFormat as VisualFormat);
      this.logger.debug('Export completed', {
        sessionId: session.id,
        format,
        duration: Date.now() - startTime,
        outputSize: result.length,
      });
      return result;
    }

    // Handle standard formats
    let result: string;
    switch (format) {
      case 'json':
        result = this.exportToJSON(session);
        break;
      case 'markdown':
        result = this.exportToMarkdown(session);
        break;
      case 'latex':
        result = this.exportToLatex(session);
        break;
      case 'jupyter':
        result = this.exportToJupyter(session);
        break;
      default:
        // Fallback to JSON for unknown formats
        result = this.exportToJSON(session);
    }

    this.logger.debug('Export completed', {
      sessionId: session.id,
      format,
      duration: Date.now() - startTime,
      outputSize: result.length,
    });

    return result;
  }

  /**
   * Export session to visual format (Mermaid, DOT, ASCII)
   *
   * Uses VisualExporter to generate visual representations
   * based on the session's thinking mode and thought structure.
   *
   * For multi-thought sessions, always includes the full thought sequence
   * showing all thoughts with their branches, revisions, and dependencies.
   *
   * @param session - The session to export
   * @param format - Visual format (mermaid, dot, ascii)
   * @returns Visual representation as string
   * @throws {Error} If session has no thoughts
   */
  private exportVisual(session: ThinkingSession, format: VisualFormat): string {
    const thoughts = session.thoughts;
    const lastThought = thoughts[thoughts.length - 1];

    if (!lastThought) {
      throw new Error('No thoughts in session to export');
    }

    // For multi-thought sessions, always use session-level visualization
    // This ensures all thoughts, branches, revisions, and dependencies are shown
    if (thoughts.length > 1) {
      return this.exportSessionWithThoughtDetails(session, format);
    }

    // For single-thought sessions, use mode-specific visualization if available
    // Determine which visual export method to use based on mode
    if (lastThought.mode === 'causal' && 'causalGraph' in lastThought) {
      return this.visualExporter.exportCausalGraph(lastThought as CausalThought, {
        format,
        colorScheme: 'default',
        includeLabels: true,
        includeMetrics: true,
      });
    }

    if (lastThought.mode === 'temporal' && 'timeline' in lastThought) {
      return this.visualExporter.exportTemporalTimeline(lastThought as TemporalThought, {
        format,
        includeLabels: true,
      });
    }

    if (lastThought.mode === 'gametheory' && 'game' in lastThought) {
      return this.visualExporter.exportGameTree(lastThought as GameTheoryThought, {
        format,
        colorScheme: 'default',
        includeLabels: true,
        includeMetrics: true,
      });
    }

    if (lastThought.mode === 'bayesian' && 'hypothesis' in lastThought) {
      return this.visualExporter.exportBayesianNetwork(lastThought as BayesianThought, {
        format,
        colorScheme: 'default',
        includeLabels: true,
        includeMetrics: true,
      });
    }

    if (lastThought.mode === ThinkingMode.FIRSTPRINCIPLES && 'question' in lastThought) {
      return this.visualExporter.exportFirstPrinciplesDerivation(lastThought as FirstPrinciplesThought, {
        format,
        colorScheme: 'default',
      });
    }

    // Sprint 1: Integration of 10 existing visual exporters

    if (lastThought.mode === ThinkingMode.SEQUENTIAL && 'buildUpon' in lastThought) {
      return this.visualExporter.exportSequentialDependencyGraph(lastThought as SequentialThought, {
        format,
        colorScheme: 'default',
        includeLabels: true,
        includeMetrics: true,
      });
    }

    if (lastThought.mode === ThinkingMode.SHANNON && 'stage' in lastThought) {
      return this.visualExporter.exportShannonStageFlow(lastThought as ShannonThought, {
        format,
        colorScheme: 'default',
        includeLabels: true,
        includeMetrics: true,
      });
    }

    if (lastThought.mode === ThinkingMode.ABDUCTIVE && 'hypotheses' in lastThought) {
      return this.visualExporter.exportAbductiveHypotheses(lastThought as AbductiveThought, {
        format,
        colorScheme: 'default',
        includeLabels: true,
        includeMetrics: true,
      });
    }

    if (lastThought.mode === ThinkingMode.COUNTERFACTUAL && 'scenarios' in lastThought) {
      return this.visualExporter.exportCounterfactualScenarios(lastThought as CounterfactualThought, {
        format,
        colorScheme: 'default',
        includeLabels: true,
        includeMetrics: true,
      });
    }

    if (lastThought.mode === ThinkingMode.ANALOGICAL && 'sourceAnalogy' in lastThought) {
      return this.visualExporter.exportAnalogicalMapping(lastThought as AnalogicalThought, {
        format,
        colorScheme: 'default',
        includeLabels: true,
        includeMetrics: true,
      });
    }

    if (lastThought.mode === ThinkingMode.EVIDENTIAL && 'frameOfDiscernment' in lastThought) {
      return this.visualExporter.exportEvidentialBeliefs(lastThought as EvidentialThought, {
        format,
        colorScheme: 'default',
        includeLabels: true,
        includeMetrics: true,
      });
    }

    if (lastThought.mode === ThinkingMode.SYSTEMSTHINKING && 'systemComponents' in lastThought) {
      return this.visualExporter.exportSystemsThinkingCausalLoops(lastThought as SystemsThinkingThought, {
        format,
        colorScheme: 'default',
        includeLabels: true,
        includeMetrics: true,
      });
    }

    if (lastThought.mode === ThinkingMode.SCIENTIFICMETHOD && 'hypothesis' in lastThought) {
      return this.visualExporter.exportScientificMethodExperiment(lastThought as ScientificMethodThought, {
        format,
        colorScheme: 'default',
        includeLabels: true,
        includeMetrics: true,
      });
    }

    if (lastThought.mode === ThinkingMode.OPTIMIZATION && 'objectiveFunction' in lastThought) {
      return this.visualExporter.exportOptimizationSolution(lastThought as OptimizationThought, {
        format,
        colorScheme: 'default',
        includeLabels: true,
        includeMetrics: true,
      });
    }

    if (lastThought.mode === ThinkingMode.FORMALLOGIC && 'premises' in lastThought) {
      return this.visualExporter.exportFormalLogicProof(lastThought as FormalLogicThought, {
        format,
        colorScheme: 'default',
        includeLabels: true,
        includeMetrics: true,
      });
    }

    // Sprint 2: Integration of 4 new visual exporters

    if (lastThought.mode === ThinkingMode.MATHEMATICS && 'proofStrategy' in lastThought) {
      return this.visualExporter.exportMathematicsDerivation(lastThought as MathematicsThought, {
        format,
        colorScheme: 'default',
        includeLabels: true,
        includeMetrics: true,
      });
    }

    if (lastThought.mode === ThinkingMode.PHYSICS && 'tensorProperties' in lastThought) {
      return this.visualExporter.exportPhysicsVisualization(lastThought as PhysicsThought, {
        format,
        colorScheme: 'default',
        includeLabels: true,
        includeMetrics: true,
      });
    }

    if (lastThought.mode === ThinkingMode.HYBRID && 'primaryMode' in lastThought) {
      return this.visualExporter.exportHybridOrchestration(lastThought as HybridThought, {
        format,
        colorScheme: 'default',
        includeLabels: true,
        includeMetrics: true,
      });
    }

    if (lastThought.mode === ThinkingMode.METAREASONING && 'currentStrategy' in lastThought) {
      return this.visualExporter.exportMetaReasoningVisualization(lastThought as MetaReasoningThought, {
        format,
        colorScheme: 'default',
        includeLabels: true,
        includeMetrics: true,
      });
    }

    // Phase 10: Engineering analysis visual export
    if (lastThought.mode === ThinkingMode.ENGINEERING && 'analysisType' in lastThought) {
      return this.visualExporter.exportEngineeringAnalysis(lastThought as EngineeringThought, {
        format,
        colorScheme: 'default',
        includeLabels: true,
        includeMetrics: true,
      });
    }

    // Generic thought sequence export for modes without specific visual exporters
    return this.exportGenericThoughtSequence(session, format);
  }

  /**
   * Export a generic thought sequence diagram for any mode
   * Creates a flowchart showing the thought progression
   */
  private exportGenericThoughtSequence(session: ThinkingSession, format: VisualFormat): string {
    const thoughts = session.thoughts;
    const title = (session.title || 'Thinking Session').replace(/"/g, "'");
    const mode = session.mode;

    if (format === 'mermaid') {
      let diagram = 'flowchart TD\n';
      diagram += `    subgraph "${title}"\n`;
      diagram += '    direction TB\n';
      diagram += `    SESSION["Session: ${mode}<br/>${thoughts.length} thoughts"]\n`;

      for (let i = 0; i < thoughts.length; i++) {
        const t = thoughts[i];
        const truncated = t.content.length > 50
          ? t.content.substring(0, 47).replace(/"/g, "'").replace(/\n/g, ' ') + '...'
          : t.content.replace(/"/g, "'").replace(/\n/g, ' ');
        const status = t.nextThoughtNeeded ? '...' : 'Done';
        diagram += `    T${i + 1}["Thought ${i + 1} [${status}]<br/>${truncated}"]\n`;
      }

      diagram += '    SESSION --> T1\n';
      for (let i = 1; i < thoughts.length; i++) {
        diagram += `    T${i} --> T${i + 1}\n`;
      }

      const lastT = thoughts[thoughts.length - 1];
      if (lastT && !lastT.nextThoughtNeeded) {
        diagram += `    T${thoughts.length} --> COMPLETE["Complete"]\n`;
      }

      diagram += '    end\n';
      return diagram;
    }

    if (format === 'dot') {
      let dot = 'digraph ThinkingSession {\n';
      dot += '    rankdir=TB;\n';
      dot += '    node [shape=box, style=rounded];\n';
      dot += `    label="${title} (${mode})";\n\n`;

      for (let i = 0; i < thoughts.length; i++) {
        const t = thoughts[i];
        const truncated = t.content.length > 40
          ? t.content.substring(0, 37).replace(/"/g, '\\"').replace(/\n/g, ' ') + '...'
          : t.content.replace(/"/g, '\\"').replace(/\n/g, ' ');
        dot += `    T${i + 1} [label="Thought ${i + 1}\\n${truncated}"];\n`;
      }

      for (let i = 1; i < thoughts.length; i++) {
        dot += `    T${i} -> T${i + 1};\n`;
      }

      dot += '}\n';
      return dot;
    }

    if (format === 'ascii') {
      const bar = '═'.repeat(50);
      let ascii = `╔${bar}╗\n`;
      ascii += `║ ${title.substring(0, 48).padEnd(48)} ║\n`;
      ascii += `║ Mode: ${mode.padEnd(42)} ║\n`;
      ascii += `╠${bar}╣\n`;

      for (let i = 0; i < thoughts.length; i++) {
        const t = thoughts[i];
        const status = t.nextThoughtNeeded ? '[→]' : '[✓]';
        const truncated = t.content.substring(0, 35).replace(/\n/g, ' ');
        ascii += `║ ${status} Thought ${i + 1}: ${truncated.padEnd(35)} ║\n`;
        if (i < thoughts.length - 1) {
          ascii += '║     │                                              ║\n';
          ascii += '║     ▼                                              ║\n';
        }
      }

      ascii += `╚${bar}╝\n`;
      return ascii;
    }

    // Fallback for other visual formats
    const thoughtsText = thoughts.map((t, i) =>
      `Thought ${i + 1} (${t.mode}):\n${t.content}\n`
    ).join('\n');

    return `Session: ${title}\nMode: ${mode}\n\n${thoughtsText}`;
  }

  /**
   * Export session with full thought details including branches, revisions, and dependencies
   * This method properly handles multi-thought sessions showing all relationships
   */
  private exportSessionWithThoughtDetails(session: ThinkingSession, format: VisualFormat): string {
    const thoughts = session.thoughts;
    const title = (session.title || 'Thinking Session').replace(/"/g, "'");
    const mode = session.mode;

    // Build a map of thought IDs/numbers for reference
    const thoughtMap = new Map<string, number>();
    thoughts.forEach((t, i) => {
      if (t.id) thoughtMap.set(t.id, i + 1);
    });

    // Identify branches, revisions, and dependencies
    const branches = new Set<string>();
    const revisions: Array<{ from: number; to: number }> = [];
    const dependencies: Array<{ from: number; to: number }> = [];

    thoughts.forEach((t, i) => {
      const thoughtNum = i + 1;

      // Track branches
      if (t.branchId) branches.add(t.branchId);

      // Track revisions
      if (t.isRevision && t.revisesThought) {
        const revisedNum = thoughtMap.get(t.revisesThought);
        if (revisedNum) {
          revisions.push({ from: revisedNum, to: thoughtNum });
        }
      }

      // Track dependencies
      if (t.dependencies && t.dependencies.length > 0) {
        for (const depId of t.dependencies) {
          const depNum = thoughtMap.get(depId);
          if (depNum) {
            dependencies.push({ from: depNum, to: thoughtNum });
          }
        }
      }

      // Track branchFrom
      if (t.branchFrom) {
        const branchFromNum = thoughtMap.get(t.branchFrom);
        if (branchFromNum) {
          dependencies.push({ from: branchFromNum, to: thoughtNum });
        }
      }
    });

    if (format === 'mermaid') {
      let diagram = 'flowchart TD\n';
      diagram += `    subgraph session["${title}"]\n`;
      diagram += '    direction TB\n';

      // Session info node
      const branchInfo = branches.size > 0 ? `<br/>${branches.size} branch(es)` : '';
      const revisionInfo = revisions.length > 0 ? `<br/>${revisions.length} revision(s)` : '';
      diagram += `    SESSION["📊 Session: ${mode}<br/>${thoughts.length} thoughts${branchInfo}${revisionInfo}"]\n`;

      // Thought nodes with status indicators
      for (let i = 0; i < thoughts.length; i++) {
        const t = thoughts[i];
        const truncated = t.content.length > 40
          ? t.content.substring(0, 37).replace(/"/g, "'").replace(/\n/g, ' ').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '...'
          : t.content.replace(/"/g, "'").replace(/\n/g, ' ').replace(/</g, '&lt;').replace(/>/g, '&gt;');

        // Status indicators
        const isComplete = !t.nextThoughtNeeded;
        const isRev = t.isRevision;
        const hasBranch = t.branchId;
        const statusIcon = isComplete ? '✓' : '→';
        const revIcon = isRev ? '🔄' : '';
        const branchIcon = hasBranch ? '🌿' : '';

        diagram += `    T${i + 1}["${statusIcon}${revIcon}${branchIcon} Thought ${i + 1}<br/>${truncated}"]\n`;
      }

      // Basic thought sequence (linear flow)
      diagram += '\n    %% Linear flow\n';
      diagram += '    SESSION --> T1\n';
      for (let i = 1; i < thoughts.length; i++) {
        // Only add linear edge if not already connected by revision/dependency
        const hasSpecialEdge = revisions.some(r => r.from === i && r.to === i + 1) ||
                              dependencies.some(d => d.from === i && d.to === i + 1);
        if (!hasSpecialEdge) {
          diagram += `    T${i} --> T${i + 1}\n`;
        }
      }

      // Add revision edges (dashed)
      if (revisions.length > 0) {
        diagram += '\n    %% Revisions\n';
        for (const rev of revisions) {
          diagram += `    T${rev.from} -.->|revises| T${rev.to}\n`;
        }
      }

      // Add dependency edges (dotted)
      if (dependencies.length > 0) {
        diagram += '\n    %% Dependencies\n';
        for (const dep of dependencies) {
          diagram += `    T${dep.from} ==>|depends| T${dep.to}\n`;
        }
      }

      // Completion indicator
      const lastT = thoughts[thoughts.length - 1];
      if (lastT && !lastT.nextThoughtNeeded) {
        diagram += `\n    T${thoughts.length} --> COMPLETE["✅ Complete"]\n`;
      }

      diagram += '    end\n';

      // Style definitions
      diagram += '\n    %% Styles\n';
      diagram += '    classDef revision fill:#ffe6cc,stroke:#d79b00\n';
      diagram += '    classDef branch fill:#dae8fc,stroke:#6c8ebf\n';
      diagram += '    classDef complete fill:#d5e8d4,stroke:#82b366\n';

      // Apply styles to revision nodes
      const revisionNodes = thoughts
        .map((t, i) => t.isRevision ? `T${i + 1}` : null)
        .filter(Boolean);
      if (revisionNodes.length > 0) {
        diagram += `    class ${revisionNodes.join(',')} revision\n`;
      }

      // Apply styles to branch nodes
      const branchNodes = thoughts
        .map((t, i) => t.branchId ? `T${i + 1}` : null)
        .filter(Boolean);
      if (branchNodes.length > 0) {
        diagram += `    class ${branchNodes.join(',')} branch\n`;
      }

      return diagram;
    }

    if (format === 'dot') {
      let dot = 'digraph ThinkingSession {\n';
      dot += '    rankdir=TB;\n';
      dot += '    node [shape=box, style="rounded,filled", fillcolor=white];\n';
      dot += `    label="${title} (${mode})";\n`;
      dot += '    labelloc=t;\n\n';

      // Session start node
      dot += `    SESSION [label="Session\\n${thoughts.length} thoughts", shape=ellipse, fillcolor="#f5f5f5"];\n\n`;

      // Thought nodes
      for (let i = 0; i < thoughts.length; i++) {
        const t = thoughts[i];
        const truncated = t.content.length > 35
          ? t.content.substring(0, 32).replace(/"/g, '\\"').replace(/\n/g, ' ') + '...'
          : t.content.replace(/"/g, '\\"').replace(/\n/g, ' ');

        let fillcolor = 'white';
        if (t.isRevision) fillcolor = '#ffe6cc';
        else if (t.branchId) fillcolor = '#dae8fc';
        else if (!t.nextThoughtNeeded) fillcolor = '#d5e8d4';

        const statusMark = t.isRevision ? '🔄 ' : (t.branchId ? '🌿 ' : '');
        dot += `    T${i + 1} [label="${statusMark}Thought ${i + 1}\\n${truncated}", fillcolor="${fillcolor}"];\n`;
      }

      // Edges
      dot += '\n    // Linear flow\n';
      dot += '    SESSION -> T1;\n';
      for (let i = 1; i < thoughts.length; i++) {
        dot += `    T${i} -> T${i + 1};\n`;
      }

      // Revision edges
      if (revisions.length > 0) {
        dot += '\n    // Revisions\n';
        for (const rev of revisions) {
          dot += `    T${rev.from} -> T${rev.to} [style=dashed, color="#d79b00", label="revises"];\n`;
        }
      }

      // Dependency edges
      if (dependencies.length > 0) {
        dot += '\n    // Dependencies\n';
        for (const dep of dependencies) {
          dot += `    T${dep.from} -> T${dep.to} [style=bold, color="#6c8ebf", label="depends"];\n`;
        }
      }

      dot += '}\n';
      return dot;
    }

    if (format === 'ascii') {
      const bar = '═'.repeat(60);
      let ascii = `╔${bar}╗\n`;
      ascii += `║ ${title.substring(0, 58).padEnd(58)} ║\n`;
      ascii += `║ Mode: ${mode.padEnd(52)} ║\n`;
      ascii += `║ Thoughts: ${thoughts.length.toString().padEnd(48)} ║\n`;
      if (branches.size > 0) {
        ascii += `║ Branches: ${branches.size.toString().padEnd(48)} ║\n`;
      }
      if (revisions.length > 0) {
        ascii += `║ Revisions: ${revisions.length.toString().padEnd(47)} ║\n`;
      }
      ascii += `╠${bar}╣\n`;

      for (let i = 0; i < thoughts.length; i++) {
        const t = thoughts[i];
        const statusIcon = t.nextThoughtNeeded ? '[→]' : '[✓]';
        const revMark = t.isRevision ? ' 🔄' : '';
        const branchMark = t.branchId ? ' 🌿' : '';
        const truncated = t.content.substring(0, 40).replace(/\n/g, ' ');
        ascii += `║ ${statusIcon} T${(i + 1).toString().padStart(2)}${revMark}${branchMark}: ${truncated.padEnd(45 - revMark.length - branchMark.length)} ║\n`;

        // Show revision connection
        if (t.isRevision && t.revisesThought) {
          const revisedNum = thoughtMap.get(t.revisesThought);
          if (revisedNum) {
            ascii += `║      ↳ revises T${revisedNum}                                         ║\n`.substring(0, 64) + '║\n';
          }
        }

        if (i < thoughts.length - 1) {
          ascii += '║     │                                                            ║\n'.substring(0, 64) + '║\n';
          ascii += '║     ▼                                                            ║\n'.substring(0, 64) + '║\n';
        }
      }

      ascii += `╚${bar}╝\n`;
      return ascii;
    }

    // Fallback: use generic sequence
    return this.exportGenericThoughtSequence(session, format);
  }


  /**
   * Export session to JSON format
   *
   * Converts the session to JSON, handling Map serialization.
   *
   * @param session - The session to export
   * @returns JSON string with pretty printing
   */
  private exportToJSON(session: ThinkingSession): string {
    // Convert Map to Object for JSON serialization
    const sessionWithCustomMetrics = {
      ...session,
      metrics: {
        ...session.metrics,
        customMetrics: Object.fromEntries(session.metrics.customMetrics),
      },
    };

    return JSON.stringify(sessionWithCustomMetrics, null, 2);
  }

  /**
   * Export session to Markdown format
   *
   * Creates a human-readable Markdown document with session details
   * and all thoughts formatted as sections.
   *
   * @param session - The session to export
   * @returns Markdown-formatted string
   */
  private exportToMarkdown(session: ThinkingSession): string {
    const status = session.isComplete ? 'Complete' : 'In Progress';
    let md = `# Thinking Session: ${session.title}\n\n`;
    md += `**Mode**: ${session.mode}\n`;
    md += `**Created**: ${session.createdAt.toISOString()}\n`;
    md += `**Status**: ${status}\n\n`;
    md += `## Thoughts\n\n`;

    for (const thought of session.thoughts) {
      md += `### Thought ${thought.thoughtNumber}/${session.thoughts.length}\n\n`;
      md += `${thought.content}\n\n`;

      // Add mode-specific structured data
      md += this.extractModeSpecificMarkdown(thought);

      // Display meta-reasoning insights if this is a meta-reasoning thought
      if (isMetaReasoningThought(thought)) {
        md += `#### 📊 Meta-Reasoning Analysis\n\n`;

        // Current Strategy
        md += `**Current Strategy:**\n`;
        md += `- Mode: ${thought.currentStrategy.mode}\n`;
        md += `- Approach: ${thought.currentStrategy.approach}\n`;
        md += `- Thoughts Spent: ${thought.currentStrategy.thoughtsSpent}\n`;
        if (thought.currentStrategy.progressIndicators.length > 0) {
          md += `- Progress: ${thought.currentStrategy.progressIndicators.join(', ')}\n`;
        }
        md += `\n`;

        // Strategy Evaluation
        md += `**Strategy Evaluation:**\n`;
        md += `- Effectiveness: ${(thought.strategyEvaluation.effectiveness * 100).toFixed(1)}%\n`;
        md += `- Efficiency: ${(thought.strategyEvaluation.efficiency * 100).toFixed(1)}%\n`;
        md += `- Confidence: ${(thought.strategyEvaluation.confidence * 100).toFixed(1)}%\n`;
        md += `- Quality Score: ${(thought.strategyEvaluation.qualityScore * 100).toFixed(1)}%\n`;
        if (thought.strategyEvaluation.issues.length > 0) {
          md += `- Issues: ${thought.strategyEvaluation.issues.join('; ')}\n`;
        }
        if (thought.strategyEvaluation.strengths.length > 0) {
          md += `- Strengths: ${thought.strategyEvaluation.strengths.join('; ')}\n`;
        }
        md += `\n`;

        // Recommendation
        md += `**Recommendation:** ${thought.recommendation.action}\n`;
        md += `- ${thought.recommendation.justification}\n`;
        md += `- Confidence: ${(thought.recommendation.confidence * 100).toFixed(1)}%\n`;
        md += `- Expected Improvement: ${thought.recommendation.expectedImprovement}\n`;

        // Alternative Strategies
        if (thought.alternativeStrategies.length > 0) {
          md += `\n**Alternative Strategies:**\n`;
          for (const alt of thought.alternativeStrategies) {
            md += `- **${alt.mode}** (score: ${(alt.recommendationScore * 100).toFixed(0)}%): ${alt.reasoning}\n`;
          }
        }

        // Quality Metrics
        md += `\n**Quality Metrics:**\n`;
        md += `- Logical Consistency: ${(thought.qualityMetrics.logicalConsistency * 100).toFixed(1)}%\n`;
        md += `- Evidence Quality: ${(thought.qualityMetrics.evidenceQuality * 100).toFixed(1)}%\n`;
        md += `- Completeness: ${(thought.qualityMetrics.completeness * 100).toFixed(1)}%\n`;
        md += `- Originality: ${(thought.qualityMetrics.originality * 100).toFixed(1)}%\n`;
        md += `- Clarity: ${(thought.qualityMetrics.clarity * 100).toFixed(1)}%\n`;
        md += `- Overall Quality: ${(thought.qualityMetrics.overallQuality * 100).toFixed(1)}%\n`;
        md += `\n`;
      }
    }

    return md;
  }

  /**
   * Export session to LaTeX format
   *
   * Generates a LaTeX document with proper escaping for special characters.
   * Ready for compilation with pdflatex.
   *
   * @param session - The session to export
   * @returns LaTeX document as string
   */
  private exportToLatex(session: ThinkingSession): string {
    const status = session.isComplete ? 'Complete' : 'In Progress';
    const safeTitle = escapeLatex(session.title);
    const safeMode = escapeLatex(session.mode);
    const safeStatus = escapeLatex(status);

    let latex = `\\documentclass{article}\n`;
    latex += `\\usepackage[utf8]{inputenc}\n`;
    latex += `\\title{${safeTitle}}\n`;
    latex += `\\begin{document}\n`;
    latex += `\\maketitle\n\n`;
    latex += `\\section{Session Details}\n`;
    latex += `Mode: ${safeMode}\\\\\n`;
    latex += `Status: ${safeStatus}\\\\\n\n`;
    latex += `\\section{Thoughts}\n`;

    for (const thought of session.thoughts) {
      latex += `\\subsection{Thought ${thought.thoughtNumber}}\n`;
      latex += `${escapeLatex(thought.content)}\n\n`;
      // Add mode-specific structured data
      latex += this.extractModeSpecificLatex(thought);
    }

    latex += `\\end{document}\n`;
    return latex;
  }

  /**
   * Export session to HTML format
   *
   * Generates a standalone HTML page with XSS protection via escaping.
   * Includes basic styling for readability.
   *
   * Note: Currently unused as HTML export is handled by visual exporters.
   * Kept for potential future use as a session-level HTML export.
   *
   * @param session - The session to export
   * @returns HTML document as string
   */
  // @ts-expect-error - Unused method kept for future use
  private exportToHTML(session: ThinkingSession): string {
    const status = session.isComplete ? 'Complete' : 'In Progress';
    const safeTitle = escapeHtml(session.title);
    const safeMode = escapeHtml(session.mode);
    const safeStatus = escapeHtml(status);

    let html = `<!DOCTYPE html>\n<html>\n<head>\n`;
    html += `  <meta charset="UTF-8">\n`;
    html += `  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n`;
    html += `  <title>${safeTitle}</title>\n`;
    html += `  <style>body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 0 20px; }</style>\n`;
    html += `</head>\n<body>\n`;
    html += `  <h1>${safeTitle}</h1>\n`;
    html += `  <p><strong>Mode:</strong> ${safeMode}</p>\n`;
    html += `  <p><strong>Status:</strong> ${safeStatus}</p>\n`;
    html += `  <h2>Thoughts</h2>\n`;

    for (const thought of session.thoughts) {
      html += `  <div>\n`;
      html += `    <h3>Thought ${thought.thoughtNumber}/${session.thoughts.length}</h3>\n`;
      html += `    <p>${escapeHtml(thought.content)}</p>\n`;
      html += `  </div>\n`;
    }

    html += `</body>\n</html>\n`;
    return html;
  }

  /**
   * Export session to Jupyter Notebook format
   *
   * Creates a .ipynb file structure with Markdown cells for each thought.
   * Compatible with Jupyter Notebook and JupyterLab.
   *
   * @param session - The session to export
   * @returns JSON string representing Jupyter notebook
   */
  private exportToJupyter(session: ThinkingSession): string {
    const status = session.isComplete ? 'Complete' : 'In Progress';

    interface JupyterCell {
      cell_type: 'markdown' | 'code';
      metadata: Record<string, unknown>;
      source: string[];
    }

    interface JupyterNotebook {
      cells: JupyterCell[];
      metadata: Record<string, unknown>;
      nbformat: number;
      nbformat_minor: number;
    }

    const notebook: JupyterNotebook = {
      cells: [],
      metadata: {},
      nbformat: 4,
      nbformat_minor: 2,
    };

    // Add title cell
    notebook.cells.push({
      cell_type: 'markdown',
      metadata: {},
      source: [
        `# Thinking Session: ${session.title}\n`,
        `\n`,
        `**Mode**: ${session.mode}\n`,
        `**Status**: ${status}\n`,
      ],
    });

    // Add thought cells
    for (const thought of session.thoughts) {
      // Main thought content
      notebook.cells.push({
        cell_type: 'markdown',
        metadata: {},
        source: [
          `## Thought ${thought.thoughtNumber}/${session.thoughts.length}\n`,
          `\n`,
          `${thought.content}\n`,
        ],
      });

      // Add mode-specific structured data as a separate cell
      const modeSpecificContent = this.extractModeSpecificMarkdown(thought);
      if (modeSpecificContent.trim()) {
        notebook.cells.push({
          cell_type: 'markdown',
          metadata: {},
          source: modeSpecificContent.split('\n').map(line => line + '\n'),
        });
      }
    }

    return JSON.stringify(notebook, null, 2);
  }

  /**
   * Extract mode-specific structured data as Markdown
   * Provides rich output for various thought types beyond just the content text
   */
  private extractModeSpecificMarkdown(thought: Thought): string {
    let md = '';

    // Causal thoughts - include graph structure
    if (isCausalThought(thought)) {
      if (thought.causalGraph?.nodes?.length) {
        md += `#### Causal Graph\n\n`;
        md += `**Nodes:**\n`;
        for (const node of thought.causalGraph.nodes) {
          md += `- **${node.name}** (${node.id})${node.description ? `: ${node.description}` : ''}\n`;
        }
        md += `\n`;
      }
      if (thought.causalGraph?.edges?.length) {
        md += `**Causal Relationships:**\n`;
        for (const edge of thought.causalGraph.edges) {
          const strengthVal = typeof edge.strength === 'number' ? edge.strength : Number(edge.strength);
          const strength = edge.strength !== undefined && !isNaN(strengthVal) ? ` (strength: ${strengthVal.toFixed(2)})` : '';
          md += `- ${edge.from} → ${edge.to}${strength}\n`;
        }
        md += `\n`;
      }
      if (thought.interventions?.length) {
        md += `**Interventions:**\n`;
        for (const intervention of thought.interventions) {
          const effectsText = intervention.expectedEffects?.length
            ? ` → ${intervention.expectedEffects.map(e => e.expectedChange).join(', ')}`
            : '';
          md += `- ${intervention.nodeId}: ${intervention.action}${effectsText}\n`;
        }
        md += `\n`;
      }
    }

    // Bayesian thoughts - include probability data
    if (isBayesianThought(thought)) {
      md += `#### Bayesian Analysis\n\n`;
      if (thought.prior?.probability !== undefined) {
        const prior = typeof thought.prior.probability === 'number' ? thought.prior.probability : Number(thought.prior.probability);
        md += `- **Prior Probability:** ${(prior * 100).toFixed(1)}%\n`;
      }
      if (thought.likelihood?.probability !== undefined) {
        const likelihood = typeof thought.likelihood.probability === 'number' ? thought.likelihood.probability : Number(thought.likelihood.probability);
        md += `- **Likelihood:** ${(likelihood * 100).toFixed(1)}%\n`;
      }
      if (thought.posterior?.probability !== undefined) {
        const posterior = typeof thought.posterior.probability === 'number' ? thought.posterior.probability : Number(thought.posterior.probability);
        md += `- **Posterior Probability:** ${(posterior * 100).toFixed(1)}%\n`;
      }
      if (thought.evidence?.length) {
        md += `\n**Evidence:**\n`;
        for (const e of thought.evidence) {
          md += `- ${e.description}\n`;
        }
      }
      if (thought.hypothesis) {
        md += `\n**Hypothesis:**\n`;
        md += `- ${thought.hypothesis.statement}\n`;
        if (thought.hypothesis.alternatives?.length) {
          md += `\n**Alternatives:**\n`;
          for (const alt of thought.hypothesis.alternatives) {
            md += `- ${alt}\n`;
          }
        }
      }
      md += `\n`;
    }

    // Temporal thoughts - include timeline data
    if (isTemporalThought(thought)) {
      if (thought.events?.length) {
        md += `#### Timeline\n\n`;
        md += `**Events:**\n`;
        for (const event of thought.events) {
          md += `- **${event.name}** (t=${event.timestamp}): ${event.description}\n`;
        }
        md += `\n`;
      }
      if (thought.intervals?.length) {
        md += `**Intervals:**\n`;
        for (const interval of thought.intervals) {
          md += `- **${interval.name}**: ${interval.start} → ${interval.end}\n`;
        }
        md += `\n`;
      }
      if (thought.relations?.length) {
        md += `**Temporal Relations:**\n`;
        for (const rel of thought.relations) {
          md += `- ${rel.from} ${rel.relationType} ${rel.to}\n`;
        }
        md += `\n`;
      }
    }

    // Game theory thoughts - include players and strategies
    if (isGameTheoryThought(thought)) {
      md += `#### Game Theory Analysis\n\n`;
      if (thought.players?.length) {
        md += `**Players:**\n`;
        for (const player of thought.players) {
          md += `- **${player.name}** (${player.id})${player.isRational ? ' - rational' : ''}\n`;
        }
        md += `\n`;
      }
      if (thought.strategies?.length) {
        md += `**Strategies:**\n`;
        for (const strat of thought.strategies) {
          md += `- ${strat.name}: ${strat.description}\n`;
        }
        md += `\n`;
      }
      if (thought.payoffMatrix) {
        md += `**Payoff Matrix:** ${thought.payoffMatrix.dimensions?.join('x') || 'defined'}\n\n`;
      }
    }

    // Systems thinking - include components and feedback loops
    if (isSystemsThinkingThought(thought)) {
      md += `#### Systems Analysis\n\n`;
      if (thought.components?.length) {
        md += `**Components:**\n`;
        for (const comp of thought.components) {
          md += `- **${comp.name}** (${comp.type})\n`;
        }
        md += `\n`;
      }
      if (thought.feedbackLoops?.length) {
        md += `**Feedback Loops:**\n`;
        for (const loop of thought.feedbackLoops) {
          md += `- ${loop.type}: ${loop.components?.join(' → ') || 'defined'}\n`;
        }
        md += `\n`;
      }
    }

    // Synthesis - include sources and themes
    if (isSynthesisThought(thought)) {
      md += `#### Literature Synthesis\n\n`;
      if (thought.sources?.length) {
        md += `**Sources (${thought.sources.length}):**\n`;
        for (const source of thought.sources.slice(0, 5)) {
          const authors = source.authors?.join(', ') || 'Unknown';
          md += `- ${source.title} (${authors}, ${source.year || 'n.d.'})\n`;
        }
        if (thought.sources.length > 5) {
          md += `- ... and ${thought.sources.length - 5} more\n`;
        }
        md += `\n`;
      }
      if (thought.themes?.length) {
        md += `**Themes:**\n`;
        for (const theme of thought.themes) {
          const consensus = theme.consensus ? ` [${theme.consensus}]` : '';
          md += `- **${theme.name}**${consensus}: ${theme.description || ''}\n`;
        }
        md += `\n`;
      }
      if (thought.gaps?.length) {
        md += `**Research Gaps:**\n`;
        for (const gap of thought.gaps) {
          md += `- ${gap.description} (${gap.type || 'general'})\n`;
        }
        md += `\n`;
      }
    }

    // Argumentation - include claims and grounds
    if (isArgumentationThought(thought)) {
      md += `#### Argumentation Structure\n\n`;
      if (thought.claims?.length) {
        md += `**Claims:**\n`;
        for (const claim of thought.claims) {
          md += `- ${claim.statement} [${claim.type || 'claim'}]\n`;
        }
        md += `\n`;
      }
      if (thought.grounds?.length) {
        md += `**Grounds/Evidence:**\n`;
        for (const ground of thought.grounds) {
          md += `- ${ground.content} (${ground.type || 'evidence'})\n`;
        }
        md += `\n`;
      }
      if (thought.rebuttals?.length) {
        md += `**Rebuttals:**\n`;
        for (const rebuttal of thought.rebuttals) {
          md += `- ${rebuttal.objection}${rebuttal.response ? ` → ${rebuttal.response}` : ''}\n`;
        }
        md += `\n`;
      }
    }

    // Analysis - include codes and categories
    if (isAnalysisThought(thought)) {
      md += `#### Qualitative Analysis\n\n`;
      if (thought.methodology) {
        md += `**Methodology:** ${thought.methodology}\n\n`;
      }
      if (thought.currentCodes?.length) {
        md += `**Codes:**\n`;
        for (const code of thought.currentCodes.slice(0, 10)) {
          const freq = code.frequency ? ` (n=${code.frequency})` : '';
          md += `- **${code.label}**${freq}: ${code.definition || ''}\n`;
        }
        if (thought.currentCodes.length > 10) {
          md += `- ... and ${thought.currentCodes.length - 10} more codes\n`;
        }
        md += `\n`;
      }
      if (thought.gtCategories?.length) {
        md += `**Categories:** ${thought.gtCategories.map(c => c.name).join(', ')}\n\n`;
      }
      if (thought.keyInsight) {
        md += `**Key Insight:** ${thought.keyInsight}\n\n`;
      }
    }

    // Algorithmic - include complexity analysis
    if (isAlgorithmicThought(thought)) {
      md += `#### Algorithm Analysis\n\n`;
      if (thought.algorithm?.name) {
        md += `**Algorithm:** ${thought.algorithm.name}\n`;
      }
      if (thought.designPattern) {
        md += `**Design Pattern:** ${thought.designPattern}\n`;
      }
      if (thought.timeComplexity || thought.spaceComplexity) {
        md += `\n**Complexity:**\n`;
        if (thought.timeComplexity?.worstCase) {
          md += `- Time: ${thought.timeComplexity.worstCase}\n`;
        }
        if (thought.spaceComplexity?.auxiliary) {
          md += `- Space: ${thought.spaceComplexity.auxiliary}\n`;
        }
      }
      if (thought.correctnessProof) {
        md += `\n**Correctness Proof:**\n`;
        if (thought.correctnessProof.invariants?.length) {
          md += `- Invariants: ${thought.correctnessProof.invariants.map(i => i.description).join('; ')}\n`;
        }
        if (thought.correctnessProof.terminationArgument) {
          md += `- Termination: ${thought.correctnessProof.terminationArgument.proof}\n`;
        }
      }
      md += `\n`;
    }

    // Scientific method - include hypothesis and experiments
    if (isScientificMethodThought(thought)) {
      md += `#### Scientific Method\n\n`;
      if (thought.scientificHypotheses?.length) {
        md += `**Hypotheses:**\n`;
        for (const h of thought.scientificHypotheses) {
          md += `- ${h.statement}\n`;
          if (h.prediction) {
            md += `  - Prediction: ${h.prediction}\n`;
          }
        }
        md += `\n`;
      }
      if (thought.experiment) {
        md += `**Experiment:**\n`;
        md += `- Type: ${thought.experiment.type}\n`;
        md += `- Design: ${thought.experiment.design}\n`;
        if (thought.experiment.procedure?.length) {
          md += `- Procedure: ${thought.experiment.procedure.length} steps\n`;
        }
        md += `\n`;
      }
    }

    // First principles - include fundamentals and insights
    if (isFirstPrinciplesThought(thought)) {
      md += `#### First Principles Analysis\n\n`;
      if (thought.principles?.length) {
        md += `**Fundamental Principles:**\n`;
        for (const p of thought.principles) {
          md += `- ${p.statement}\n`;
        }
        md += `\n`;
      }
      if (thought.derivationSteps?.length) {
        md += `**Derivation Steps:**\n`;
        for (const step of thought.derivationSteps) {
          md += `- Step ${step.stepNumber}: ${step.inference}\n`;
        }
        md += `\n`;
      }
    }

    return md;
  }

  /**
   * Extract mode-specific structured data as LaTeX
   */
  private extractModeSpecificLatex(thought: Thought): string {
    let latex = '';

    if (isCausalThought(thought)) {
      if (thought.causalGraph?.nodes?.length) {
        latex += `\\subsubsection{Causal Graph}\n`;
        latex += `\\textbf{Nodes:}\n\\begin{itemize}\n`;
        for (const node of thought.causalGraph.nodes) {
          latex += `  \\item \\textbf{${escapeLatex(node.name)}} (${escapeLatex(node.id)})`;
          if (node.description) latex += `: ${escapeLatex(node.description)}`;
          latex += `\n`;
        }
        latex += `\\end{itemize}\n\n`;
      }
      if (thought.causalGraph?.edges?.length) {
        latex += `\\textbf{Causal Relationships:}\n\\begin{itemize}\n`;
        for (const edge of thought.causalGraph.edges) {
          const strengthVal = typeof edge.strength === 'number' ? edge.strength : Number(edge.strength);
          const strength = edge.strength !== undefined && !isNaN(strengthVal) ? ` (strength: ${strengthVal.toFixed(2)})` : '';
          latex += `  \\item ${escapeLatex(edge.from)} $\\rightarrow$ ${escapeLatex(edge.to)}${strength}\n`;
        }
        latex += `\\end{itemize}\n\n`;
      }
    }

    if (isBayesianThought(thought)) {
      latex += `\\subsubsection{Bayesian Analysis}\n`;
      if (thought.prior?.probability !== undefined) {
        const prior = typeof thought.prior.probability === 'number' ? thought.prior.probability : Number(thought.prior.probability);
        latex += `Prior: $P(H) = ${prior.toFixed(3)}$\\\\\n`;
      }
      if (thought.likelihood?.probability !== undefined) {
        const likelihood = typeof thought.likelihood.probability === 'number' ? thought.likelihood.probability : Number(thought.likelihood.probability);
        latex += `Likelihood: $P(E|H) = ${likelihood.toFixed(3)}$\\\\\n`;
      }
      if (thought.posterior?.probability !== undefined) {
        const posterior = typeof thought.posterior.probability === 'number' ? thought.posterior.probability : Number(thought.posterior.probability);
        latex += `Posterior: $P(H|E) = ${posterior.toFixed(3)}$\\\\\n`;
      }
      latex += `\n`;
    }

    if (isGameTheoryThought(thought) && thought.players?.length) {
      latex += `\\subsubsection{Game Theory Analysis}\n`;
      latex += `\\textbf{Players:} ${thought.players.map(p => escapeLatex(p.name)).join(', ')}\\\\\n`;
      if (thought.payoffMatrix) {
        latex += `\\textbf{Payoff Matrix:} ${thought.payoffMatrix.dimensions?.join('$\\times$') || 'defined'}\\\\\n`;
      }
      latex += `\n`;
    }

    if (isAlgorithmicThought(thought)) {
      latex += `\\subsubsection{Algorithm Analysis}\n`;
      if (thought.algorithm?.name) {
        latex += `\\textbf{Algorithm:} ${escapeLatex(thought.algorithm.name)}\\\\\n`;
      }
      if (thought.timeComplexity || thought.spaceComplexity) {
        if (thought.timeComplexity?.worstCase) {
          latex += `\\textbf{Time Complexity:} $${escapeLatex(thought.timeComplexity.worstCase)}$\\\\\n`;
        }
        if (thought.spaceComplexity?.auxiliary) {
          latex += `\\textbf{Space Complexity:} $${escapeLatex(thought.spaceComplexity.auxiliary)}$\\\\\n`;
        }
      }
      latex += `\n`;
    }

    return latex;
  }
}
