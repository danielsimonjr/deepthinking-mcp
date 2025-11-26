// src/types/enhanced-thoughts.ts
// Enhanced thought types for physics and tensor research

import { ShannonThought } from './base';

/**
 * Extended thought types for advanced problem-solving
 */
export type ExtendedThoughtType = 
  // Original Shannon types
  | 'problem_definition'
  | 'constraints'
  | 'model'
  | 'proof'
  | 'implementation'
  // Physics-specific types
  | 'symmetry_analysis'
  | 'gauge_theory'
  | 'field_equations'
  | 'lagrangian'
  | 'hamiltonian'
  | 'conservation_law'
  | 'dimensional_analysis'
  // Mathematical types
  | 'tensor_formulation'
  | 'differential_geometry'
  | 'algebraic_structure'
  | 'topological_property'
  // Meta types
  | 'decomposition'
  | 'synthesis'
  | 'metacognition';

/**
 * Tensor properties for physics modeling
 */
export interface TensorProperties {
  /** Rank as [contravariant, covariant] */
  rank: [number, number];
  
  /** Mathematical expression for components */
  components: string;
  
  /** LaTeX representation */
  latex: string;
  
  /** Symmetry properties */
  symmetries: Array<'symmetric' | 'antisymmetric' | 'hermitian' | 'unitary' | string>;
  
  /** Physical invariants preserved under transformations */
  invariants: string[];
  
  /** How tensor transforms (covariant, contravariant, mixed) */
  transformation: 'covariant' | 'contravariant' | 'mixed';
  
  /** Index structure (e.g., "μν", "^μ_ν") */
  indexStructure?: string;
  
  /** Coordinate system dependencies */
  coordinateSystem?: 'cartesian' | 'spherical' | 'cylindrical' | 'general';
}

/**
 * Physical interpretation of mathematical objects
 */
export interface PhysicalInterpretation {
  /** What physical quantity does this represent? */
  quantity: string;
  
  /** Physical units (SI, natural, etc.) */
  units: string;
  
  /** Conservation laws that apply */
  conservationLaws: string[];
  
  /** Physical constraints */
  constraints?: string[];
  
  /** Observable consequences */
  observables?: string[];
}

/**
 * Mathematical model with enhanced structure
 */
export interface MathematicalModel {
  /** LaTeX representation */
  latex: string;
  
  /** Symbolic form (for math-mcp) */
  symbolic: string;
  
  /** ASCII/Unicode fallback */
  ascii?: string;
  
  /** Tensor rank (if applicable) */
  tensorRank?: number;
  
  /** Dimensions/shape */
  dimensions?: number[];
  
  /** Physical invariants */
  invariants?: string[];
  
  /** Symmetries */
  symmetries?: string[];
  
  /** Computational complexity */
  complexity?: string;
  
  /** Numerical stability notes */
  stabilityNotes?: string;
}

/**
 * Enhanced Shannon thought with physics support
 */
export interface EnhancedShannonThought extends ShannonThought {
  thoughtType: ExtendedThoughtType;
  
  /** Mathematical model (if thoughtType involves math) */
  mathematicalModel?: MathematicalModel;
  
  /** Tensor properties (for tensor formulations) */
  tensorProperties?: TensorProperties;
  
  /** Physical interpretation */
  physicalInterpretation?: PhysicalInterpretation;
  
  /** Confidence factors breakdown */
  confidenceFactors?: {
    dataQuality: number;
    methodologyRobustness: number;
    assumptionValidity: number;
  };
  
  /** Alternative approaches considered */
  alternativeApproaches?: string[];
  
  /** Known limitations */
  knownLimitations?: string[];
  
  /** Dimensional analysis results */
  dimensionalAnalysis?: {
    isConsistent: boolean;
    dimensions: Record<string, string>;
    issues?: string[];
  };
  
  /** References to literature */
  references?: Array<{
    type: 'paper' | 'book' | 'arxiv' | 'url';
    citation: string;
    relevance: string;
  }>;
}

/**
 * Validation result with enhanced feedback
 */
export interface ValidationResult {
  isValid: boolean;
  confidence: number;
  
  issues: Array<{
    severity: 'error' | 'warning' | 'info';
    thoughtNumber: number;
    description: string;
    suggestion: string;
    category: 'logical' | 'mathematical' | 'physical' | 'structural';
  }>;
  
  strengthMetrics: {
    logicalSoundness: number;
    empiricalSupport: number;
    mathematicalRigor: number;
    physicalConsistency?: number;
  };
  
  /** Tensor-specific validation */
  tensorValidation?: {
    rankCorrect: boolean;
    symmetriesVerified: boolean;
    invariantsChecked: boolean;
    dimensionsConsistent: boolean;
  };
  
  /** Suggestions for improvement */
  suggestions?: string[];
}

// =============================================================================
// src/integrations/math-mcp.ts
// Integration with math-mcp server
// =============================================================================

export interface TensorResult {
  original: string;
  simplified: string;
  components: number[][];
  properties: {
    rank: number;
    symmetric: boolean;
    trace?: number;
    determinant?: number;
  };
}

export class MathMCPIntegration {
  constructor(private serverUrl: string = 'http://localhost:3000') {}
  
  /**
   * Evaluate a tensor expression
   */
  async evaluateTensorExpression(expression: string): Promise<TensorResult> {
    try {
      const response = await fetch(`${this.serverUrl}/tensor/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expression })
      });
      
      if (!response.ok) {
        throw new Error(`Math-MCP error: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to evaluate tensor:', error);
      throw error;
    }
  }
  
  /**
   * Simplify mathematical expression
   */
  async simplify(expression: string): Promise<string> {
    const response = await fetch(`${this.serverUrl}/simplify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expression })
    });
    
    const result = await response.json();
    return result.simplified;
  }
  
  /**
   * Check if two expressions are equivalent
   */
  async checkEquivalence(lhs: string, rhs: string): Promise<boolean> {
    const response = await fetch(`${this.serverUrl}/check-equivalence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lhs, rhs })
    });
    
    const result = await response.json();
    return result.equivalent;
  }
  
  /**
   * Perform dimensional analysis
   */
  async analyzeDimensions(expression: string, variables: Record<string, string>): Promise<{
    consistent: boolean;
    dimensions: string;
    issues: string[];
  }> {
    const response = await fetch(`${this.serverUrl}/dimensions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expression, variables })
    });
    
    return await response.json();
  }
}

// =============================================================================
// src/validators/physics-validator.ts
// Physics-specific validation logic
// =============================================================================

export class PhysicsValidator {
  constructor(private mathMcp: MathMCPIntegration) {}
  
  /**
   * Validate tensor properties
   */
  async validateTensor(props: TensorProperties): Promise<{
    isValid: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];
    
    // Check rank consistency
    const [contravariant, covariant] = props.rank;
    if (contravariant < 0 || covariant < 0) {
      issues.push('Tensor rank must be non-negative');
    }
    
    // Validate index structure matches rank
    if (props.indexStructure) {
      const upIndices = (props.indexStructure.match(/\^/g) || []).length;
      const downIndices = (props.indexStructure.match(/_/g) || []).length;
      
      if (upIndices !== contravariant || downIndices !== covariant) {
        issues.push(`Index structure ${props.indexStructure} doesn't match rank [${contravariant}, ${covariant}]`);
      }
    }
    
    // Check symmetries are valid for rank
    if (props.symmetries.includes('antisymmetric') && props.rank[0] + props.rank[1] < 2) {
      issues.push('Antisymmetric tensors must have rank >= 2');
    }
    
    // Validate using math-mcp if possible
    try {
      await this.mathMcp.evaluateTensorExpression(props.components);
    } catch (error) {
      issues.push(`Could not validate tensor expression: ${error.message}`);
    }
    
    return {
      isValid: issues.length === 0,
      issues
    };
  }
  
  /**
   * Check dimensional consistency
   */
  async checkDimensionalConsistency(
    expression: string,
    variables: Record<string, string>
  ): Promise<{ consistent: boolean; issues: string[] }> {
    const result = await this.mathMcp.analyzeDimensions(expression, variables);
    
    return {
      consistent: result.consistent,
      issues: result.issues
    };
  }
  
  /**
   * Verify conservation laws
   */
  async verifyConservationLaw(
    thought: EnhancedShannonThought
  ): Promise<boolean> {
    if (!thought.physicalInterpretation?.conservationLaws) {
      return true; // No laws to verify
    }
    
    // Check if conservation laws are consistent with model
    const laws = thought.physicalInterpretation.conservationLaws;
    
    for (const law of laws) {
      // Validate each conservation law
      // This would integrate with your physics engine
      if (law.includes('energy')) {
        // Check energy conservation
      }
      if (law.includes('momentum')) {
        // Check momentum conservation
      }
      // Add more as needed
    }
    
    return true;
  }
}

// =============================================================================
// src/exporters/latex-exporter.ts
// Export thinking sessions to LaTeX papers
// =============================================================================

export class LaTeXExporter {
  /**
   * Generate LaTeX document from thinking session
   */
  generateDocument(
    session: ThinkingSession,
    options: {
      author?: string;
      abstract?: string;
      documentClass?: string;
    } = {}
  ): string {
    const {
      author = 'Daniel Simon Jr.',
      documentClass = 'article'
    } = options;
    
    return `\\documentclass{${documentClass}}
\\usepackage{amsmath}
\\usepackage{amssymb}
\\usepackage{tensor}
\\usepackage{physics}
\\usepackage{hyperref}

\\title{${this.escapeLatex(session.title)}}
\\author{${this.escapeLatex(author)}}
\\date{\\today}

\\begin{document}

\\maketitle

${options.abstract ? `\\begin{abstract}\n${this.escapeLatex(options.abstract)}\n\\end{abstract}` : ''}

${this.generateSections(session)}

\\end{document}`;
  }
  
  private generateSections(session: ThinkingSession): string {
    const sections: string[] = [];
    
    // Group thoughts by type
    const problemDef = session.thoughts.filter(t => t.thoughtType === 'problem_definition');
    const constraints = session.thoughts.filter(t => t.thoughtType === 'constraints');
    const models = session.thoughts.filter(t => t.thoughtType === 'model');
    const proofs = session.thoughts.filter(t => t.thoughtType === 'proof');
    const implementations = session.thoughts.filter(t => t.thoughtType === 'implementation');
    
    if (problemDef.length > 0) {
      sections.push(this.generateProblemSection(problemDef));
    }
    
    if (constraints.length > 0) {
      sections.push(this.generateConstraintsSection(constraints));
    }
    
    if (models.length > 0) {
      sections.push(this.generateModelSection(models));
    }
    
    if (proofs.length > 0) {
      sections.push(this.generateProofSection(proofs));
    }
    
    if (implementations.length > 0) {
      sections.push(this.generateImplementationSection(implementations));
    }
    
    return sections.join('\n\n');
  }
  
  private generateModelSection(thoughts: EnhancedShannonThought[]): string {
    let section = '\\section{Mathematical Framework}\n\n';
    
    for (const thought of thoughts) {
      section += `\\subsection{${this.escapeLatex(this.extractTitle(thought.thought))}}\n\n`;
      section += `${this.escapeLatex(thought.thought)}\n\n`;
      
      if (thought.mathematicalModel) {
        section += '\\begin{equation}\n';
        section += thought.mathematicalModel.latex + '\n';
        section += '\\end{equation}\n\n';
      }
      
      if (thought.tensorProperties) {
        section += this.formatTensorProperties(thought.tensorProperties);
      }
      
      if (thought.assumptions.length > 0) {
        section += '\\textbf{Assumptions:}\n\\begin{itemize}\n';
        for (const assumption of thought.assumptions) {
          section += `\\item ${this.escapeLatex(assumption)}\n`;
        }
        section += '\\end{itemize}\n\n';
      }
    }
    
    return section;
  }
  
  private formatTensorProperties(props: TensorProperties): string {
    let output = '\\textbf{Tensor Properties:}\n\\begin{itemize}\n';
    output += `\\item Rank: $(${props.rank[0]}, ${props.rank[1]})$\n`;
    output += `\\item Transformation: ${props.transformation}\n`;
    
    if (props.symmetries.length > 0) {
      output += `\\item Symmetries: ${props.symmetries.join(', ')}\n`;
    }
    
    if (props.invariants.length > 0) {
      output += `\\item Invariants: $${props.invariants.join('$, $')}$\n`;
    }
    
    output += '\\end{itemize}\n\n';
    return output;
  }
  
  private escapeLatex(text: string): string {
    return text
      .replace(/\\/g, '\\textbackslash{}')
      .replace(/[{}]/g, '\\$&')
      .replace(/[%$#&_]/g, '\\$&')
      .replace(/\^/g, '\\textasciicircum{}')
      .replace(/~/g, '\\textasciitilde{}');
  }
  
  private extractTitle(text: string): string {
    // Extract first sentence or first 50 chars
    const firstSentence = text.match(/^[^.!?]+[.!?]/);
    if (firstSentence) {
      return firstSentence[0].slice(0, 80);
    }
    return text.slice(0, 50) + (text.length > 50 ? '...' : '');
  }
  
  private generateProblemSection(thoughts: ShannonThought[]): string {
    // Similar implementation for problem definition
    return '\\section{Problem Definition}\\n\\n...';
  }
  
  private generateConstraintsSection(thoughts: ShannonThought[]): string {
    return '\\section{Constraints}\\n\\n...';
  }
  
  private generateProofSection(thoughts: ShannonThought[]): string {
    return '\\section{Validation}\\n\\n...';
  }
  
  private generateImplementationSection(thoughts: ShannonThought[]): string {
    return '\\section{Implementation}\\n\\n...';
  }
}

// =============================================================================
// src/persistence/session-manager.ts
// Manage thinking sessions with auto-save
// =============================================================================

import * as fs from 'fs/promises';
import * as path from 'path';

export class SessionManager {
  private sessionsDir: string;
  private autoSaveInterval: number;
  private autoSaveTimer?: NodeJS.Timeout;
  
  constructor(
    sessionsDir: string = './sessions',
    autoSaveInterval: number = 5 * 60 * 1000 // 5 minutes
  ) {
    this.sessionsDir = sessionsDir;
    this.autoSaveInterval = autoSaveInterval;
  }
  
  /**
   * Start auto-save for a session
   */
  startAutoSave(session: ThinkingSession): void {
    this.autoSaveTimer = setInterval(async () => {
      await this.saveSession(session);
      console.log(`Auto-saved session ${session.id} at ${new Date().toISOString()}`);
    }, this.autoSaveInterval);
  }
  
  /**
   * Stop auto-save
   */
  stopAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = undefined;
    }
  }
  
  /**
   * Save session to disk
   */
  async saveSession(session: ThinkingSession): Promise<void> {
    const filename = `${session.id}.json`;
    const filepath = path.join(this.sessionsDir, filename);
    
    const data = JSON.stringify(session, null, 2);
    await fs.writeFile(filepath, data, 'utf-8');
  }
  
  /**
   * Load session from disk
   */
  async loadSession(sessionId: string): Promise<ThinkingSession> {
    const filename = `${sessionId}.json`;
    const filepath = path.join(this.sessionsDir, filename);
    
    const data = await fs.readFile(filepath, 'utf-8');
    return JSON.parse(data);
  }
  
  /**
   * List all saved sessions
   */
  async listSessions(): Promise<SessionMetadata[]> {
    const files = await fs.readdir(this.sessionsDir);
    const sessions: SessionMetadata[] = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filepath = path.join(this.sessionsDir, file);
        const data = await fs.readFile(filepath, 'utf-8');
        const session = JSON.parse(data);
        
        sessions.push({
          id: session.id,
          title: session.title,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
          thoughtCount: session.thoughts.length
        });
      }
    }
    
    return sessions.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }
  
  /**
   * Delete a session
   */
  async deleteSession(sessionId: string): Promise<void> {
    const filename = `${sessionId}.json`;
    const filepath = path.join(this.sessionsDir, filename);
    await fs.unlink(filepath);
  }
}

// =============================================================================
// Example usage
// =============================================================================

/*
// Create enhanced thinking session
const session = new ThinkingSession('UPTF-Research');
const mathMcp = new MathMCPIntegration('http://localhost:3000');
const validator = new PhysicsValidator(mathMcp);
const exporter = new LaTeXExporter();
const sessionMgr = new SessionManager('./sessions');

// Start auto-save
sessionMgr.startAutoSave(session);

// Submit tensor formulation thought
const tensorThought: EnhancedShannonThought = {
  thought: "Define unified field tensor combining EM and gravity",
  thoughtType: 'tensor_formulation',
  thoughtNumber: 1,
  totalThoughts: 10,
  uncertainty: 0.2,
  dependencies: [],
  assumptions: [
    "4D Minkowski spacetime",
    "Local Lorentz invariance"
  ],
  nextThoughtNeeded: true,
  mathematicalModel: {
    latex: 'U^{\\mu\\nu} = \\alpha F^{\\mu\\nu} + \\beta R^{\\mu\\nu}',
    symbolic: 'U[mu,nu] = alpha*F[mu,nu] + beta*R[mu,nu]'
  },
  tensorProperties: {
    rank: [2, 0],
    components: 'U^{μν} = α F^{μν} + β R^{μν}',
    latex: 'U^{\\mu\\nu}',
    symmetries: ['mixed'],
    invariants: ['trace(U)', 'det(U)'],
    transformation: 'contravariant',
    indexStructure: '^μν'
  },
  physicalInterpretation: {
    quantity: 'Unified field strength',
    units: 'GeV^2',
    conservationLaws: ['Energy-momentum', 'Angular momentum']
  }
};

// Validate and submit
const validation = await validator.validateTensor(tensorThought.tensorProperties!);
if (validation.isValid) {
  await session.submitThought(tensorThought);
}

// Export to LaTeX when done
const latex = exporter.generateDocument(session, {
  author: 'Daniel Simon Jr.',
  abstract: 'Exploring unified field theory through tensor framework'
});

await fs.writeFile('./papers/UPTF-paper.tex', latex);

// Stop auto-save
sessionMgr.stopAutoSave();
*/
