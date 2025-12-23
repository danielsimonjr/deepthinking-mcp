# Phase 12: Workerpool Integration Plan

## Overview

This document outlines potential integration of `@danielsimonjr/workerpool` (v10.0.1) with DeepThinking MCP for parallel reasoning capabilities. The workerpool library provides thread pooling, adaptive scaling, health monitoring, and WASM-accelerated task queues.

**Status**: Planning (Not Started)
**Priority**: Low-Medium (Future Enhancement)
**Dependency**: `@danielsimonjr/workerpool@^10.0.0`
**Estimated Effort**: 40-60 hours across 4-5 sprints

---

## Background

### Current Architecture Limitations

DeepThinking MCP currently operates as a single-threaded MCP server:
- Tool calls are processed sequentially
- Thought chains are managed in-memory via `SessionManager`
- Multi-instance support uses file locking for session sharing
- No parallelization of reasoning operations within a single request

### Workerpool Capabilities

The `@danielsimonjr/workerpool` fork provides:
- **Thread Pool Pattern**: Spawn worker processes/threads for CPU-intensive tasks
- **Adaptive Scaling**: Dynamic worker count based on load metrics
- **Health Monitoring**: Detect stuck workers, track error rates, auto-recovery
- **Batch Execution**: Concurrent task execution with progress reporting
- **WASM Acceleration**: Lock-free task queues for high-throughput scenarios

---

## Use Cases

### UC-1: Parallel Proof Decomposition

**Problem**: Large proofs with many independent sub-proofs are decomposed sequentially, even when branches are logically independent.

**Solution**: Distribute sub-proof analysis across worker pool.

**Implementation Details**:

```
src/proof/
├── parallel-decomposer.ts      # NEW: Parallel proof decomposition coordinator
├── workers/
│   └── proof-worker.ts         # NEW: Worker script for sub-proof analysis
└── decomposer.ts               # MODIFY: Add parallel execution option
```

**Key Changes**:

1. **Create `proof-worker.ts`**:
   ```typescript
   import workerpool from 'workerpool';
   import { ProofDecomposer } from '../decomposer';

   function analyzeSubProof(
     subProof: ProofStep[],
     context: ProofContext
   ): SubProofResult {
     const decomposer = new ProofDecomposer();
     return decomposer.analyzeSteps(subProof, context);
   }

   workerpool.worker({
     analyzeSubProof
   });
   ```

2. **Create `parallel-decomposer.ts`**:
   ```typescript
   import workerpool from 'workerpool';
   import type { BatchOptions } from 'workerpool';

   export class ParallelProofDecomposer {
     private pool: workerpool.Pool;

     constructor(options: { maxWorkers?: number } = {}) {
       this.pool = workerpool.pool(
         path.join(__dirname, 'workers/proof-worker.js'),
         {
           minWorkers: 1,
           maxWorkers: options.maxWorkers ?? 4,
           workerType: 'thread'
         }
       );
     }

     async decomposeParallel(
       proof: Proof,
       onProgress?: (progress: BatchProgress) => void
     ): Promise<DecompositionResult> {
       // Identify independent sub-proofs
       const independentBranches = this.identifyIndependentBranches(proof);

       // Execute in parallel
       const batchPromise = this.pool.execBatch(
         independentBranches.map(branch => ({
           method: 'analyzeSubProof',
           params: [branch.steps, branch.context]
         })),
         { onProgress, concurrency: this.pool.maxWorkers }
       );

       const results = await batchPromise;
       return this.mergeResults(results);
     }
   }
   ```

3. **Modify `ProofDecomposer`**:
   ```typescript
   // Add option for parallel execution
   interface DecomposeOptions {
     parallel?: boolean;
     maxWorkers?: number;
     onProgress?: (progress: BatchProgress) => void;
   }

   async decompose(proof: Proof, options: DecomposeOptions = {}): Promise<Result> {
     if (options.parallel && this.hasIndependentBranches(proof)) {
       const parallel = new ParallelProofDecomposer({ maxWorkers: options.maxWorkers });
       return parallel.decomposeParallel(proof, options.onProgress);
     }
     return this.decomposeSequential(proof);
   }
   ```

**Metrics**:
- Speedup target: 2-4x for proofs with 4+ independent branches
- Memory overhead: ~50MB per worker
- Serialization cost: ~5ms per sub-proof transfer

---

### UC-2: Multi-Mode Parallel Analysis

**Problem**: When exploring a problem, running multiple reasoning modes (e.g., causal + bayesian + counterfactual) could provide complementary insights, but they run sequentially.

**Solution**: Execute 3-5 modes simultaneously and merge insights.

**Implementation Details**:

```
src/services/
├── ParallelModeExecutor.ts     # NEW: Coordinate parallel mode execution
├── workers/
│   └── mode-worker.ts          # NEW: Worker for mode execution
└── ThoughtFactory.ts           # MODIFY: Add parallel mode option
```

**Key Changes**:

1. **Create `mode-worker.ts`**:
   ```typescript
   import workerpool from 'workerpool';
   import { ThoughtFactory } from '../ThoughtFactory';
   import { ModeHandlerRegistry } from '../../modes/handlers/ModeHandlerRegistry';

   const factory = new ThoughtFactory();
   const registry = ModeHandlerRegistry.getInstance();

   function executeMode(
     input: ThinkingToolInput,
     mode: ThinkingMode
   ): Thought {
     const handler = registry.getHandler(mode);
     const thought = factory.createThought({ ...input, mode });
     return handler.enhance(thought, {});
   }

   workerpool.worker({ executeMode });
   ```

2. **Create `ParallelModeExecutor.ts`**:
   ```typescript
   export interface ParallelModeOptions {
     modes: ThinkingMode[];
     input: Omit<ThinkingToolInput, 'mode'>;
     mergeStrategy: 'union' | 'intersection' | 'weighted';
     weights?: Record<ThinkingMode, number>;
   }

   export interface ParallelModeResult {
     thoughts: Map<ThinkingMode, Thought>;
     mergedInsights: string[];
     executionTime: number;
     modeTimings: Record<ThinkingMode, number>;
   }

   export class ParallelModeExecutor {
     private pool: workerpool.Pool;

     async executeParallel(options: ParallelModeOptions): Promise<ParallelModeResult> {
       const startTime = Date.now();

       const tasks = options.modes.map(mode => ({
         method: 'executeMode',
         params: [options.input, mode]
       }));

       const results = await this.pool.execBatch(tasks, {
         concurrency: options.modes.length,
         failFast: false  // Continue even if one mode fails
       });

       return {
         thoughts: this.mapResultsToThoughts(results, options.modes),
         mergedInsights: this.mergeInsights(results, options.mergeStrategy),
         executionTime: Date.now() - startTime,
         modeTimings: this.extractTimings(results)
       };
     }

     private mergeInsights(
       results: BatchResult<Thought>,
       strategy: 'union' | 'intersection' | 'weighted'
     ): string[] {
       // Extract insights from each thought
       // Apply merge strategy
       // Return deduplicated, ranked insights
     }
   }
   ```

3. **New MCP Tool** (`deepthinking_parallel`):
   ```typescript
   {
     name: 'deepthinking_parallel',
     description: 'Execute multiple reasoning modes in parallel',
     inputSchema: {
       type: 'object',
       properties: {
         thought: { type: 'string' },
         modes: {
           type: 'array',
           items: { type: 'string', enum: [...THINKING_MODES] },
           minItems: 2,
           maxItems: 5
         },
         mergeStrategy: {
           type: 'string',
           enum: ['union', 'intersection', 'weighted'],
           default: 'union'
         }
       },
       required: ['thought', 'modes']
     }
   }
   ```

**Use Case Examples**:
- Problem exploration: Run `causal` + `bayesian` + `systemsthinking` simultaneously
- Hypothesis testing: Run `deductive` + `inductive` + `abductive` for comprehensive analysis
- Decision making: Run `gametheory` + `optimization` + `firstprinciples` for strategic choices

**Metrics**:
- Speedup: Near-linear with mode count (3 modes = ~3x faster)
- Best for: 3-5 modes with independent analysis
- Not recommended for: Dependent mode chains (where output of one feeds another)

---

### UC-3: Batch Session Export

**Problem**: Exporting a session to all 8 formats (Markdown, LaTeX, Mermaid, DOT, ASCII, SVG, JSON, Jupyter) is sequential.

**Solution**: Export all formats in parallel.

**Implementation Details**:

```
src/services/
├── ParallelExportService.ts    # NEW: Parallel export coordinator
├── workers/
│   └── export-worker.ts        # NEW: Worker for format-specific export
└── ExportService.ts            # MODIFY: Add parallel export option
```

**Key Changes**:

1. **Create `export-worker.ts`**:
   ```typescript
   import workerpool from 'workerpool';
   import { ExportService } from '../ExportService';

   const exportService = new ExportService();

   function exportFormat(
     session: SessionData,
     format: ExportFormat,
     options: ExportOptions
   ): ExportResult {
     return exportService.exportToFormat(session, format, options);
   }

   workerpool.worker({ exportFormat });
   ```

2. **Create `ParallelExportService.ts`**:
   ```typescript
   export interface ParallelExportOptions {
     formats: ExportFormat[];
     session: SessionData;
     outputDir?: string;
     onProgress?: (format: ExportFormat, status: 'started' | 'completed' | 'failed') => void;
   }

   export class ParallelExportService {
     private pool: workerpool.Pool;

     async exportAll(options: ParallelExportOptions): Promise<Map<ExportFormat, ExportResult>> {
       const tasks = options.formats.map(format => ({
         method: 'exportFormat',
         params: [options.session, format, { outputDir: options.outputDir }]
       }));

       const batchPromise = this.pool.execBatch(tasks, {
         concurrency: options.formats.length,
         onProgress: (progress) => {
           // Map progress to format-specific callbacks
         }
       });

       const results = await batchPromise;
       return this.mapResultsToFormats(results, options.formats);
     }
   }
   ```

3. **Modify `deepthinking_session` tool**:
   ```typescript
   // Add 'export_all' action
   case 'export_all':
     const parallelExporter = new ParallelExportService();
     const results = await parallelExporter.exportAll({
       formats: ['markdown', 'latex', 'mermaid', 'dot', 'ascii', 'svg', 'json', 'jupyter'],
       session: sessionData
     });
     return { exports: Object.fromEntries(results) };
   ```

**Metrics**:
- Speedup: ~4-6x for full 8-format export
- Memory: Each format export is independent, ~10-20MB per worker
- I/O bound: May be limited by disk write speed if outputting files

---

### UC-4: Monte Carlo Simulations (Stochastic Mode)

**Problem**: Stochastic reasoning mode could benefit from running many iterations to explore probability distributions.

**Solution**: Distribute iterations across worker pool for statistical analysis.

**Implementation Details**:

```
src/modes/
├── stochastic/
│   ├── monte-carlo.ts          # NEW: Monte Carlo simulation engine
│   ├── workers/
│   │   └── simulation-worker.ts # NEW: Worker for simulation iterations
│   └── statistics.ts           # NEW: Statistical aggregation utilities
```

**Key Changes**:

1. **Create `simulation-worker.ts`**:
   ```typescript
   import workerpool from 'workerpool';

   interface SimulationParams {
     model: StochasticModel;
     seed: number;
     iterations: number;
   }

   function runSimulationBatch(params: SimulationParams): SimulationResults {
     const rng = createSeededRNG(params.seed);
     const results: number[] = [];

     for (let i = 0; i < params.iterations; i++) {
       results.push(params.model.sample(rng));
     }

     return {
       samples: results,
       mean: calculateMean(results),
       variance: calculateVariance(results),
       percentiles: calculatePercentiles(results, [5, 25, 50, 75, 95])
     };
   }

   workerpool.worker({ runSimulationBatch });
   ```

2. **Create `monte-carlo.ts`**:
   ```typescript
   export interface MonteCarloOptions {
     model: StochasticModel;
     totalIterations: number;
     batchSize?: number;
     confidence?: number;
     onProgress?: (completed: number, total: number) => void;
   }

   export class MonteCarloEngine {
     private pool: workerpool.Pool;

     async simulate(options: MonteCarloOptions): Promise<MonteCarloResult> {
       const batchSize = options.batchSize ?? 10000;
       const numBatches = Math.ceil(options.totalIterations / batchSize);

       // Create batch tasks with unique seeds
       const tasks = Array.from({ length: numBatches }, (_, i) => ({
         method: 'runSimulationBatch',
         params: [{
           model: options.model,
           seed: Date.now() + i,
           iterations: Math.min(batchSize, options.totalIterations - i * batchSize)
         }]
       }));

       const results = await this.pool.execBatch(tasks, {
         onProgress: (p) => options.onProgress?.(p.completed * batchSize, options.totalIterations)
       });

       return this.aggregateResults(results);
     }

     private aggregateResults(batchResults: BatchResult<SimulationResults>): MonteCarloResult {
       // Combine statistics from all batches
       // Calculate overall mean, variance, confidence intervals
       // Generate distribution histogram
     }
   }
   ```

3. **Integrate with Stochastic Mode**:
   ```typescript
   // In stochastic mode handler
   if (input.monteCarloIterations && input.monteCarloIterations > 1000) {
     const engine = new MonteCarloEngine();
     const simulation = await engine.simulate({
       model: this.buildModel(input),
       totalIterations: input.monteCarloIterations,
       confidence: 0.95
     });
     thought.simulationResults = simulation;
   }
   ```

**Metrics**:
- Speedup: Near-linear with worker count for large iteration counts
- Sweet spot: 100,000+ iterations benefit significantly
- Memory: Each worker maintains independent RNG state

---

### UC-5: Large Graph Analysis

**Problem**: Causal graphs with 100+ nodes have expensive operations (cycle detection, path finding, intervention analysis).

**Solution**: Parallelize graph algorithms across worker pool.

**Implementation Details**:

```
src/modes/handlers/
├── graph/
│   ├── parallel-graph-analyzer.ts  # NEW: Parallel graph operations
│   ├── workers/
│   │   └── graph-worker.ts         # NEW: Worker for graph algorithms
│   └── algorithms/
│       ├── parallel-cycle-detection.ts
│       ├── parallel-path-finding.ts
│       └── parallel-reachability.ts
```

**Key Changes**:

1. **Partition-based parallel cycle detection**:
   ```typescript
   // Divide graph into subgraphs, detect cycles in parallel, merge results
   async detectCyclesParallel(graph: CausalGraph): Promise<Cycle[]> {
     const partitions = this.partitionGraph(graph, this.pool.maxWorkers);

     const tasks = partitions.map(partition => ({
       method: 'detectCyclesInPartition',
       params: [partition, graph.edges.filter(e => this.crossesPartition(e, partition))]
     }));

     const partialResults = await this.pool.execBatch(tasks);
     return this.mergeCycleResults(partialResults, graph);
   }
   ```

2. **Parallel all-pairs shortest paths**:
   ```typescript
   // Distribute source nodes across workers
   async computeAllPairsShortestPaths(graph: CausalGraph): Promise<PathMatrix> {
     const nodes = graph.nodes;
     const nodesPerWorker = Math.ceil(nodes.length / this.pool.maxWorkers);

     const tasks = chunk(nodes, nodesPerWorker).map(sourceNodes => ({
       method: 'computeShortestPathsFromSources',
       params: [graph, sourceNodes]
     }));

     const partialMatrices = await this.pool.execBatch(tasks);
     return this.mergePathMatrices(partialMatrices);
   }
   ```

**Metrics**:
- Speedup: Significant for graphs with 100+ nodes
- Algorithm-dependent: Some algorithms parallelize better than others
- Communication overhead: Graph serialization can be expensive

---

## Implementation Phases

### Sprint 1: Infrastructure (8-10 hours)

1. **Add workerpool dependency**
   ```bash
   npm install @danielsimonjr/workerpool
   ```

2. **Create worker infrastructure**
   ```
   src/workers/
   ├── index.ts                 # Worker pool manager singleton
   ├── base-worker.ts           # Base worker with common setup
   └── types.ts                 # Shared worker types
   ```

3. **Create `WorkerPoolManager`**:
   ```typescript
   export class WorkerPoolManager {
     private static instance: WorkerPoolManager;
     private pools: Map<string, workerpool.Pool> = new Map();

     static getInstance(): WorkerPoolManager { ... }

     getPool(name: string, options?: PoolOptions): workerpool.Pool { ... }

     async terminateAll(): Promise<void> { ... }

     getStats(): PoolStats[] { ... }
   }
   ```

4. **Add graceful shutdown**:
   ```typescript
   // In index.ts MCP server
   process.on('SIGTERM', async () => {
     await WorkerPoolManager.getInstance().terminateAll();
     process.exit(0);
   });
   ```

### Sprint 2: Batch Export (6-8 hours)

1. Implement `ParallelExportService`
2. Create `export-worker.ts`
3. Add `export_all` action to `deepthinking_session`
4. Write tests for parallel export

### Sprint 3: Multi-Mode Execution (10-12 hours)

1. Implement `ParallelModeExecutor`
2. Create `mode-worker.ts`
3. Add `deepthinking_parallel` MCP tool
4. Implement insight merging strategies
5. Write tests for parallel mode execution

### Sprint 4: Proof Decomposition (10-12 hours)

1. Implement `ParallelProofDecomposer`
2. Create `proof-worker.ts`
3. Modify `ProofDecomposer` with parallel option
4. Add branch independence detection
5. Write tests for parallel decomposition

### Sprint 5: Advanced Features (8-10 hours)

1. Implement Monte Carlo engine (if stochastic mode needed)
2. Implement parallel graph algorithms (if large graphs needed)
3. Add adaptive scaling based on workload
4. Add health monitoring integration
5. Performance benchmarks and tuning

---

## Configuration

### Environment Variables

```bash
# Worker pool settings
DEEPTHINKING_MAX_WORKERS=4          # Maximum worker threads
DEEPTHINKING_MIN_WORKERS=1          # Minimum worker threads
DEEPTHINKING_WORKER_TIMEOUT=30000   # Worker task timeout (ms)
DEEPTHINKING_ENABLE_PARALLEL=true   # Enable parallel features

# Adaptive scaling
DEEPTHINKING_ADAPTIVE_SCALING=false # Enable adaptive worker scaling
DEEPTHINKING_SCALE_UP_THRESHOLD=80  # Utilization % to scale up
DEEPTHINKING_SCALE_DOWN_THRESHOLD=20 # Utilization % to scale down
```

### Runtime Configuration

```typescript
// In tool handlers
const parallelOptions = {
  enabled: process.env.DEEPTHINKING_ENABLE_PARALLEL === 'true',
  maxWorkers: parseInt(process.env.DEEPTHINKING_MAX_WORKERS || '4'),
  timeout: parseInt(process.env.DEEPTHINKING_WORKER_TIMEOUT || '30000')
};
```

---

## Testing Strategy

### Unit Tests

```typescript
// tests/unit/workers/worker-pool-manager.test.ts
describe('WorkerPoolManager', () => {
  it('should create pools on demand');
  it('should reuse existing pools');
  it('should terminate all pools on shutdown');
  it('should report pool statistics');
});

// tests/unit/services/parallel-export.test.ts
describe('ParallelExportService', () => {
  it('should export all formats in parallel');
  it('should handle partial failures');
  it('should report progress');
});
```

### Integration Tests

```typescript
// tests/integration/parallel/multi-mode.test.ts
describe('Parallel Mode Execution', () => {
  it('should execute 3 modes faster than sequential');
  it('should merge insights correctly');
  it('should handle mode failures gracefully');
});
```

### Performance Benchmarks

```typescript
// tests/performance/parallel-speedup.test.ts
describe('Parallel Speedup', () => {
  it('should achieve 2x+ speedup for 4-mode parallel execution');
  it('should achieve 3x+ speedup for 8-format export');
  it('should achieve 4x+ speedup for proof with 8+ branches');
});
```

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Serialization overhead negates benefits | Medium | High | Benchmark early, set minimum thresholds |
| Worker crashes affect main process | Low | High | Health monitoring, graceful degradation |
| Memory pressure from multiple workers | Medium | Medium | Adaptive scaling, memory limits |
| Complex debugging across threads | High | Medium | Structured logging, worker IDs |
| State synchronization issues | Medium | High | Immutable data passing, no shared state |

---

## Success Criteria

1. **Performance**: 2x+ speedup for targeted use cases
2. **Reliability**: <0.1% worker failure rate
3. **Resource efficiency**: <200MB additional memory for 4 workers
4. **Developer experience**: Simple API, clear documentation
5. **Graceful degradation**: Falls back to sequential on worker failures

---

## Future Considerations

- **GPU acceleration**: If math-heavy operations become bottleneck
- **Distributed workers**: Cross-machine worker pools for very large workloads
- **Persistent workers**: Keep specialized workers warm for frequently-used modes
- **Worker specialization**: Dedicate workers to specific modes for cache efficiency

---

## References

- [workerpool README](https://github.com/danielsimonjr/workerpool)
- [Node.js worker_threads](https://nodejs.org/api/worker_threads.html)
- [Parallel Algorithms Design](https://en.wikipedia.org/wiki/Parallel_algorithm)
- [Thread Pool Pattern](https://en.wikipedia.org/wiki/Thread_pool)
