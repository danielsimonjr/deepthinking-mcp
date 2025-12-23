/**
 * Enhanced Graph Analysis Types for Causal Reasoning
 * Phase 12 Sprint 1 - Foundation & Infrastructure
 *
 * Provides types for centrality measures, d-separation analysis,
 * do-calculus interventions, and advanced graph algorithms.
 */

// ============================================================================
// BASIC GRAPH TYPES
// ============================================================================

/**
 * A node in a causal graph
 */
export interface GraphNode {
  /** Unique identifier */
  id: string;

  /** Display name */
  name: string;

  /** Optional description */
  description?: string;

  /** Node type */
  type?: 'observed' | 'latent' | 'intervention' | 'outcome';

  /** Position for layout (optional) */
  position?: { x: number; y: number };

  /** Additional properties */
  properties?: Record<string, unknown>;
}

/**
 * An edge in a causal graph
 */
export interface GraphEdge {
  /** Source node ID */
  from: string;

  /** Target node ID */
  to: string;

  /** Edge type */
  type?: 'directed' | 'bidirected' | 'undirected';

  /** Edge weight/strength (0-1) */
  weight?: number;

  /** Whether this edge is observed or hypothesized */
  observed?: boolean;

  /** Additional properties */
  properties?: Record<string, unknown>;
}

/**
 * A causal graph structure
 */
export interface CausalGraph {
  /** Graph identifier */
  id: string;

  /** Nodes in the graph */
  nodes: GraphNode[];

  /** Edges in the graph */
  edges: GraphEdge[];

  /** Whether the graph is a DAG */
  isDAG?: boolean;

  /** Metadata */
  metadata?: {
    name?: string;
    description?: string;
    createdAt?: Date;
  };
}

// ============================================================================
// PATH TYPES
// ============================================================================

/**
 * A path through the graph
 */
export interface Path {
  /** Ordered list of node IDs in the path */
  nodes: string[];

  /** Edges traversed (includes direction info) */
  edges: PathEdge[];

  /** Total path length */
  length: number;

  /** Whether the path is blocked (for d-separation) */
  isBlocked?: boolean;

  /** Reason for blocking if blocked */
  blockingReason?: string;
}

/**
 * An edge within a path (includes direction context)
 */
export interface PathEdge {
  /** Source node */
  from: string;

  /** Target node */
  to: string;

  /** Direction relative to path traversal */
  direction: 'forward' | 'backward';

  /** Original edge type */
  edgeType: 'directed' | 'bidirected' | 'undirected';
}

// ============================================================================
// CENTRALITY TYPES
// ============================================================================

/**
 * Centrality type
 */
export type CentralityType =
  | 'degree'
  | 'in_degree'
  | 'out_degree'
  | 'betweenness'
  | 'closeness'
  | 'pagerank'
  | 'eigenvector'
  | 'katz';

/**
 * Centrality measures for all nodes in a graph
 */
export interface CentralityMeasures {
  /** Degree centrality (total connections) */
  degree: Map<string, number>;

  /** In-degree centrality (incoming edges) */
  inDegree: Map<string, number>;

  /** Out-degree centrality (outgoing edges) */
  outDegree: Map<string, number>;

  /** Betweenness centrality (frequency on shortest paths) */
  betweenness: Map<string, number>;

  /** Closeness centrality (inverse average distance) */
  closeness: Map<string, number>;

  /** PageRank (importance based on link structure) */
  pageRank: Map<string, number>;

  /** Eigenvector centrality (connection to important nodes) */
  eigenvector: Map<string, number>;
}

/**
 * Configuration for centrality computation
 */
export interface CentralityConfig {
  /** Which measures to compute */
  measures?: CentralityType[];

  /** PageRank damping factor (default 0.85) */
  dampingFactor?: number;

  /** Maximum iterations for iterative methods */
  maxIterations?: number;

  /** Convergence tolerance */
  tolerance?: number;

  /** Whether to normalize results (0-1) */
  normalize?: boolean;
}

/**
 * Result of centrality analysis
 */
export interface CentralityResult {
  /** All computed centrality measures */
  measures: CentralityMeasures;

  /** Top N most central nodes by each measure */
  topNodes: Map<CentralityType, Array<{ nodeId: string; score: number }>>;

  /** Computation time (ms) */
  computationTime: number;
}

// ============================================================================
// D-SEPARATION TYPES
// ============================================================================

/**
 * Result of d-separation analysis
 */
export interface DSeparationResult {
  /** Whether X and Y are d-separated given Z */
  separated: boolean;

  /** Paths that are blocked by conditioning */
  blockingPaths: Path[];

  /** Paths that remain open */
  openPaths: Path[];

  /** The conditioning set used */
  conditioningSet: string[];

  /** Explanation of the result */
  explanation: string;
}

/**
 * Request for d-separation analysis
 */
export interface DSeparationRequest {
  /** Source variable(s) */
  x: string[];

  /** Target variable(s) */
  y: string[];

  /** Conditioning set (variables observed/controlled) */
  z: string[];
}

/**
 * Configuration for d-separation analysis
 */
export interface DSeparationConfig {
  /** Maximum path length to consider */
  maxPathLength?: number;

  /** Whether to include detailed path information */
  includePathDetails?: boolean;

  /** Whether to find minimal separating set */
  findMinimalSeparator?: boolean;
}

/**
 * V-structure (collider) in a graph
 */
export interface VStructure {
  /** Left parent node */
  parent1: string;

  /** Collider node */
  collider: string;

  /** Right parent node */
  parent2: string;

  /** Whether parents are d-connected through collider when conditioned */
  activatedWhenConditioned: boolean;
}

// ============================================================================
// DO-CALCULUS / INTERVENTION TYPES
// ============================================================================

/**
 * An intervention (do operation)
 */
export interface Intervention {
  /** Variable being intervened on */
  variable: string;

  /** Value to set */
  value: number | string;

  /** Type of intervention */
  type: 'atomic' | 'stochastic' | 'conditional';

  /** Distribution for stochastic interventions */
  distribution?: {
    type: string;
    parameters: Record<string, number>;
  };
}

/**
 * Probability distribution (simplified representation)
 */
export interface ProbabilityDistribution {
  /** Distribution type */
  type: 'point' | 'categorical' | 'continuous';

  /** For point: the value */
  value?: number;

  /** For categorical: probabilities per value */
  probabilities?: Record<string, number>;

  /** For continuous: parameters */
  parameters?: Record<string, number>;

  /** Mean if defined */
  mean?: number;

  /** Variance if defined */
  variance?: number;
}

/**
 * An adjustment formula for causal effect estimation
 */
export interface AdjustmentFormula {
  /** The adjustment set (variables to condition on) */
  adjustmentSet: string[];

  /** LaTeX representation of the formula */
  latex: string;

  /** Plain text representation */
  plainText: string;

  /** Type of adjustment (backdoor, frontdoor, etc.) */
  type: 'backdoor' | 'frontdoor' | 'instrumental' | 'general';

  /** Whether this is a valid adjustment */
  isValid: boolean;
}

/**
 * Result of intervention/do-calculus analysis
 */
export interface InterventionResult {
  /** Original observational distribution P(Y) */
  originalDistribution: ProbabilityDistribution;

  /** Interventional distribution P(Y | do(X=x)) */
  interventionDistribution: ProbabilityDistribution | null;

  /** Whether the causal effect is identifiable */
  identifiable: boolean;

  /** Reason if not identifiable */
  nonIdentifiableReason?: string;

  /** LaTeX formula for the causal estimand */
  estimand?: string;

  /** Adjustment formula if applicable */
  adjustment?: AdjustmentFormula;

  /** Average causal effect if computable */
  averageCausalEffect?: number;

  /** Confidence interval if available */
  confidenceInterval?: [number, number];
}

/**
 * Request for intervention analysis
 */
export interface InterventionRequest {
  /** The intervention(s) to apply */
  interventions: Intervention[];

  /** The outcome variable(s) */
  outcomes: string[];

  /** Optional: covariates to adjust for */
  covariates?: string[];

  /** Whether to find optimal adjustment set */
  findOptimalAdjustment?: boolean;
}

// ============================================================================
// GRAPH ALGORITHM RESULT TYPES
// ============================================================================

/**
 * Result of cycle detection
 */
export interface CycleDetectionResult {
  /** Whether cycles exist */
  hasCycles: boolean;

  /** All detected cycles */
  cycles: Path[];

  /** Strongly connected components (if any) */
  stronglyConnectedComponents?: string[][];
}

/**
 * Result of shortest path computation
 */
export interface ShortestPathResult {
  /** The shortest path */
  path: Path | null;

  /** Path distance */
  distance: number;

  /** Whether a path exists */
  pathExists: boolean;

  /** All paths of shortest length (if multiple) */
  allShortestPaths?: Path[];
}

/**
 * Result of graph connectivity analysis
 */
export interface ConnectivityResult {
  /** Whether graph is connected */
  isConnected: boolean;

  /** Connected components */
  components: string[][];

  /** Articulation points (cut vertices) */
  articulationPoints: string[];

  /** Bridges (cut edges) */
  bridges: Array<{ from: string; to: string }>;
}

// ============================================================================
// QUERY TYPES
// ============================================================================

/**
 * Variables for causal query
 */
export interface QueryVariables {
  /** Treatment/exposure variables */
  x: string[];

  /** Outcome variables */
  y: string[];

  /** Conditioning variables (optional) */
  conditioning?: string[];

  /** Mediator variables (optional) */
  mediators?: string[];
}

/**
 * Complete causal query
 */
export interface CausalQuery {
  /** Query type */
  type: 'observational' | 'interventional' | 'counterfactual';

  /** Variables involved */
  variables: QueryVariables;

  /** Interventions if applicable */
  interventions?: Intervention[];

  /** Evidence observed */
  evidence?: Record<string, number | string>;
}
