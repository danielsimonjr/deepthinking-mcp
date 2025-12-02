# Component Architecture

**Version**: 6.1.2 | **Last Updated**: 2025-12-02

## Core Components

### MCP Server Layer

#### `src/index.ts` - MCP Server Entry Point
**Purpose**: Main server implementation and tool request orchestration

**10 Focused Tools** (v5.0.0+):
- `deepthinking_core` - Fundamental reasoning (inductive, deductive, abductive)
- `deepthinking_standard` - Standard workflows (sequential, shannon, hybrid)
- `deepthinking_math` - Mathematical/physical reasoning
- `deepthinking_temporal` - Time-based reasoning
- `deepthinking_probabilistic` - Probability reasoning (bayesian, evidential)
- `deepthinking_causal` - Causal analysis (causal, counterfactual)
- `deepthinking_strategic` - Strategic decision-making (gametheory, optimization)
- `deepthinking_analytical` - Analytical reasoning (analogical, firstprinciples, metareasoning)
- `deepthinking_scientific` - Scientific methods (scientificmethod, systemsthinking, formallogic)
- `deepthinking_session` - Session management

**Dependencies**:
- ThoughtFactory
- ExportService
- ModeRouter
- SessionManager
- MetaMonitor (v6.0.0)

**Line Count**: ~350

**Testing**: Comprehensive integration tests in `tests/integration/index-handlers.test.ts`

---

## Service Layer Components

### `src/services/ThoughtFactory.ts` - Thought Creation Service

**Purpose**: Centralized factory for creating mode-specific thought objects

**Key Method**:
```typescript
createThought(input: ThinkingToolInput, sessionId: string): Thought
```

**Supported Modes** (21 total):

**Core Reasoning** (v5.0.0+):
1. **Inductive** - Observations → general principles
2. **Deductive** - General principles → specific conclusions
3. **Abductive** - Inference to best explanation

**Standard Workflow**:
4. **Sequential** - Step-by-step linear reasoning
5. **Shannon** - Information theory with uncertainty quantification
6. **Hybrid** - Combined reasoning approaches

**Math/Physics**:
7. **Mathematics** - Formal mathematical reasoning with proofs
8. **Physics** - Physical reasoning with tensor analysis

**Advanced** (Full Runtime):
9. **Metareasoning** - Strategic oversight of reasoning (v6.0.0)
10. **Recursive** - Self-referential analysis
11. **Modal** - Possibility/necessity logic
12. **Stochastic** - Probabilistic state transitions
13. **Constraint** - Constraint satisfaction
14. **Optimization** - Constraint optimization

**Analytical/Scientific**:
15. **Causal** - Causal relationship analysis
16. **Bayesian** - Probabilistic inference
17. **Counterfactual** - "What if" analysis
18. **Analogical** - Reasoning by analogy
19. **Temporal** - Time-based reasoning
20. **Game Theory** - Strategic decision making
21. **Evidential** - Dempster-Shafer theory
22. **First Principles** - Fundamental reasoning
23. **Systems Thinking** - Holistic system analysis
24. **Scientific Method** - Hypothesis testing
25. **Formal Logic** - Logical inference

**Line Count**: 243 lines

**Testing**: Covered by mode-specific unit tests and integration tests

---

### `src/services/ExportService.ts` - Export Service

**Purpose**: Unified export logic for multiple output formats

**Key Method**:
```typescript
exportSession(session: ThinkingSession, format: ExportFormat): string
```

**Supported Formats**:
- **JSON**: Structured data export
- **Markdown**: Human-readable documentation
- **LaTeX**: Academic paper format
- **HTML**: Web-ready output with styling
- **Jupyter**: Interactive notebook (.ipynb)
- **Mermaid**: Diagram-based visualization
- **DOT**: GraphViz format
- **ASCII**: Terminal-friendly tree view

**Key Features**:
- Format-specific transformations
- Metadata preservation
- Thought hierarchy rendering
- Mode-specific formatting

**Line Count**: 360 lines

**Dependencies**:
- VisualExporter (for Mermaid, DOT, ASCII)

---

### `src/services/ModeRouter.ts` - Mode Routing Service

**Purpose**: Mode switching, intelligent recommendations, and adaptive switching (v6.0.0)

**Key Methods**:
```typescript
switchMode(sessionId: string, newMode: ThinkingMode, reason: string): Promise<ThinkingSession>
quickRecommend(problemType: string): ThinkingMode
getRecommendations(characteristics: ProblemCharacteristics): string
evaluateAndSuggestSwitch(sessionId: string, problemType?: string): Promise<EvaluationResult>  // v6.0.0
autoSwitchIfNeeded(sessionId: string, problemType?: string): Promise<SwitchResult>  // v6.0.0
```

**Features**:
- Safe mode transitions
- Problem-based recommendations
- Integration with taxonomy system
- Mode combination suggestions
- **Adaptive mode switching** based on MetaMonitor evaluation (v6.0.0)
- **Auto-switching** when effectiveness < 0.3 to prevent thrashing (v6.0.0)

**Line Count**: ~380 lines

**Dependencies**:
- SessionManager
- ModeRecommender
- MetaMonitor (v6.0.0)

---

### `src/services/MetaMonitor.ts` - Meta-Reasoning Monitor (v6.0.0)

**Purpose**: Session tracking and strategy evaluation for meta-reasoning insights

**Key Methods**:
```typescript
recordThought(sessionId: string, thought: Thought): void
startStrategy(sessionId: string, mode: ThinkingMode): void
updateStrategyProgress(sessionId: string, indicator: string): void
evaluateStrategy(sessionId: string): StrategyEvaluation
suggestAlternatives(sessionId: string, currentMode: ThinkingMode): AlternativeStrategy[]
calculateQualityMetrics(sessionId: string): QualityMetrics
getSessionContext(sessionId: string, problemType: string): SessionContext
```

**Strategy Evaluation Metrics**:
- **effectiveness**: Progress relative to effort (0-1)
- **efficiency**: Progress per unit time (0-1)
- **confidence**: Based on issues encountered (0-1)
- **progressRate**: Insights per thought
- **qualityScore**: Weighted combination

**Quality Metrics** (6 dimensions):
- logicalConsistency, evidenceQuality, completeness
- originality, clarity, overallQuality

**Line Count**: 310 lines

**Features**:
- Session history tracking for meta-level analysis
- Mode transition tracking across sessions
- Strategy performance evaluation
- Alternative strategy suggestions (HYBRID, INDUCTIVE when failing)
- Global singleton instance (`metaMonitor`)

---

## Session Management Components

### `src/session/manager.ts` - Session Manager

**Purpose**: Core session lifecycle and state management with meta-reasoning integration (v6.0.0)

**Key Methods**:
```typescript
createSession(options): Promise<ThinkingSession>
getSession(sessionId): Promise<ThinkingSession | null>
addThought(sessionId, thought): Promise<ThinkingSession>
switchMode(sessionId, newMode, reason): Promise<ThinkingSession>
listSessions(includeStoredSessions): Promise<SessionMetadata[]>
deleteSession(sessionId): Promise<void>
generateSummary(sessionId): Promise<string>
```

**Key Features**:
- LRU cache for active sessions (default: 100 sessions)
- Automatic persistence with SessionStorage
- Mode transition management
- Summary generation
- Metrics tracking delegation
- **MetaMonitor integration** for thought recording (v6.0.0)

**Line Count**: ~550 lines

**Performance**:
- O(1) session access (LRU cache)
- O(1) metrics updates (via SessionMetricsCalculator)
- Configurable cache size

**Dependencies**:
- SessionMetricsCalculator
- SessionStorage
- MetaMonitor (v6.0.0)

**Testing**: Unit tests in `tests/unit/session-manager.test.ts`

---

### `src/session/SessionMetricsCalculator.ts` - Metrics Calculator

**Purpose**: Session metrics calculation and tracking

**Key Methods**:
```typescript
initializeMetrics(): SessionMetrics
updateMetrics(session, thought): void
updateModeSpecificMetrics(metrics, thought): void
updateCacheStats(session): void
```

**Tracked Metrics**:
- Total thoughts count
- Thoughts by type distribution
- Average uncertainty (for probabilistic modes)
- Revision count
- Time spent
- Dependency depth
- Cache statistics (hits, misses, hit rate)

**Performance**:
- O(1) metric initialization
- O(1) incremental updates (vs O(n) recalculation)
- Memory efficient (no historical data storage)

**Line Count**: 241 lines

---

## Search & Discovery Components

### `src/search/engine.ts` - Search Engine

**Purpose**: Full-text search and multi-dimensional filtering

**Key Methods**:
```typescript
indexSession(session): void
removeSession(sessionId): void
search(query): SearchResults
```

**Search Capabilities**:
- **Text Search**: Tokenization, stemming, TF-IDF scoring
- **Mode Filtering**: Single or multiple modes
- **Taxonomy Filtering**: Categories and types
- **Author/Domain**: Exact match filtering
- **Date Range**: createdAfter/createdBefore
- **Sorting**: Relevance, date, title
- **Pagination**: Offset and limit
- **Facets**: Aggregated counts by mode, author, domain

**Index Structure**:
- Inverted index for text search
- Multi-attribute indexes for filters
- In-memory for fast queries

**Testing**: Comprehensive unit tests in `tests/unit/search-engine.test.ts` (50+ cases)

---

### `src/search/index.ts` - Search Index

**Purpose**: Low-level indexing and retrieval

**Features**:
- Inverted index construction
- TF-IDF scoring
- Multi-field indexing (title, content, tags)

---

### `src/search/tokenizer.ts` - Tokenizer

**Purpose**: Text processing for search

**Features**:
- Word tokenization
- Stemming
- Stop word removal
- Case normalization

---

## Batch Processing Components

### `src/batch/processor.ts` - Batch Processor

**Purpose**: Asynchronous batch job execution and management

**Job Types**:
1. **Export**: Batch export multiple sessions
2. **Import**: Batch import from files
3. **Analyze**: Batch session analysis
4. **Validate**: Batch session validation

**Key Methods**:
```typescript
createJob(type, params): BatchJob
submitJob(params): Promise<string>
getJob(jobId): BatchJob | undefined
getAllJobs(): BatchJob[]
cancelJob(jobId): boolean
```

**Configuration**:
- `maxConcurrentJobs`: Parallel execution limit (default: 3)
- `maxBatchSize`: Items per batch (default: 100)
- `retryFailedItems`: Enable retries (default: true)
- `maxRetries`: Retry attempts (default: 3)

**Queue Management**:
- FIFO queue processing
- Automatic job start when capacity available
- Job status tracking (pending, running, completed, failed, cancelled)

**Testing**: Comprehensive unit tests in `tests/unit/batch-processor.test.ts` (40+ cases)

---

## Backup & Recovery Components

### `src/backup/backup-manager.ts` - Backup Manager

**Purpose**: Backup creation and restoration orchestration

**Key Methods**:
```typescript
registerProvider(provider, options): void
create(data, config, providerOptions): Promise<BackupRecord>
restore(options): Promise<RestoreResult>
validate(backupId, validationType): Promise<BackupValidation>
```

**Backup Types**:
- **Full**: Complete snapshot
- **Incremental**: Changes since last backup
- **Differential**: Changes since last full backup

**Compression**:
- **gzip**: Standard compression (good balance)
- **brotli**: Better compression (slower)
- **none**: No compression (fastest)

**Providers**:
1. **Local**: File system storage
2. **S3**: AWS S3 buckets
3. **GCS**: Google Cloud Storage
4. **Azure**: Azure Blob Storage

**Security**:
- SHA256 checksums for integrity
- Optional encryption
- Provider-specific authentication

**Testing**: Comprehensive unit tests in `tests/unit/backup-manager.test.ts` (35+ cases)

---

### `src/backup/providers/` - Storage Providers

Each provider implements the `BackupProvider` interface:
```typescript
interface BackupProvider {
  save(backupId: string, data: Buffer, manifest: BackupManifest): Promise<string>
  load(backupId: string): Promise<{ data: Buffer; manifest: BackupManifest }>
  delete(backupId: string): Promise<void>
  list(): Promise<BackupMetadata[]>
  exists(backupId: string): Promise<boolean>
}
```

---

## Validation & Security Components

### `src/validation/constants.ts` - Validation Constants (v4.3.0)

**Purpose**: Centralized validation enums and helper functions

**Constants**:
```typescript
// Severity levels
export const IssueSeverity = { ERROR: 'error', WARNING: 'warning', INFO: 'info' };

// Issue categories
export const IssueCategory = { STRUCTURAL: 'structural', LOGICAL: 'logical', MATHEMATICAL: 'mathematical', PHYSICAL: 'physical' };

// Validation thresholds
export const ValidationThresholds = {
  MIN_PROBABILITY: 0, MAX_PROBABILITY: 1,
  MIN_CONFIDENCE: 0, MAX_CONFIDENCE: 1,
  MIN_PROGRESS: 0, MAX_PROGRESS: 100,
  MIN_WEIGHT: 0, MAX_WEIGHT: 1
};
```

**Helper Functions**:
- `isInRange(value, min, max)` - Generic range check
- `isValidProbability(value)` - Probability validation (0-1)
- `isValidConfidence(value)` - Confidence validation (0-1)
- `ValidationMessages` - Factory functions for consistent error messages

---

### `src/validation/validators/registry.ts` - Validator Registry (v4.3.0)

**Purpose**: Lazy-loading validator management

**Key Features**:
- **Lazy Loading**: Validators loaded on-demand via dynamic imports
- **Caching**: Loaded validators cached for reuse
- **Preloading**: Optional preload for known high-use modes

**Key Methods**:
```typescript
getAsync(mode: string): Promise<ModeValidator | undefined>  // Lazy load
get(mode: string): ModeValidator | undefined                 // Sync (cached only)
preload(modes: string[]): Promise<void>                      // Preload specific modes
has(mode: string): boolean                                   // Check if mode supported
```

**Registry Structure** (consolidated in v4.3.0):
```typescript
const VALIDATOR_REGISTRY: Record<string, ValidatorConfig> = {
  sequential: { module: './modes/sequential.js', className: 'SequentialValidator' },
  // ... 17 more modes
};
```

---

### `src/validation/validators/base.ts` - Base Validator (v4.3.0)

**Purpose**: Abstract base class with reusable validation methods

**Reusable Methods** (added in v4.3.0):
```typescript
validateNumberRange(thought, value, fieldName, min, max, severity, category)
validateProbability(thought, value, fieldName)
validateConfidence(thought, value, fieldName)
validateRequired(thought, value, fieldName, category)
validateNonEmptyArray(thought, arr, fieldName, category)
```

**Benefits**: Consolidates 56+ range check patterns across validators

---

### `src/validation/schemas.ts` - Input Validation

**Purpose**: Type-safe input validation using Zod

**Schemas**:
- AddThoughtSchema
- CreateSessionSchema
- SwitchModeSchema
- ExportSessionSchema
- GetRecommendationsSchema

**Features**:
- UUID v4 validation
- String length limits
- Enum validation
- Custom error messages

---

### `src/utils/sanitization.ts` - Data Sanitization

**Purpose**: Security-focused input sanitization

**Functions**:
- `sanitizeFilename()`: Remove path traversal attempts
- `validatePath()`: Ensure path is within allowed directory
- `validateSessionId()`: UUID v4 validation
- `sanitizeForLogging()`: PII redaction (15 field types)

---

## Taxonomy System Components

### `src/taxonomy/reasoning-types.ts` - Reasoning Type Definitions

**Purpose**: 30+ reasoning type definitions organized hierarchically

**Categories**:
- Logical Reasoning
- Scientific Reasoning
- Creative Reasoning
- Practical Reasoning
- Exploratory Reasoning

### `src/taxonomy/navigator.ts` - Taxonomy Navigator

**Purpose**: Navigate reasoning type hierarchy

**Features**:
- Get reasoning type metadata
- Find related types
- Traverse hierarchy
- Type recommendations

### `src/taxonomy/suggestion-engine.ts` - Suggestion Engine

**Purpose**: Intelligent mode recommendations based on problem characteristics

**Input**: Problem characteristics (uncertainty, complexity, domain, etc.)
**Output**: Ranked mode recommendations with rationale

**Features**:
- Quality metrics (rigor, creativity, practicality)
- Cognitive load estimation
- Prerequisite knowledge analysis
- Common pitfalls identification

---

## Visual Export Components (v4.3.0)

### `src/export/visual/` - Modular Visual Exporters

**Purpose**: Mode-specific visual export generation

**Structure** (17 modular files):
```
src/export/visual/
├── index.ts              # Unified VisualExporter class
├── types.ts              # VisualFormat, VisualExportOptions
├── utils.ts              # sanitizeId utility
└── [15 mode-specific exporters]
    causal.ts, temporal.ts, game-theory.ts, bayesian.ts,
    sequential.ts, shannon.ts, abductive.ts, counterfactual.ts,
    analogical.ts, evidential.ts, first-principles.ts,
    systems-thinking.ts, scientific-method.ts, optimization.ts, formal-logic.ts
```

**Key Types**:
```typescript
type VisualFormat = 'mermaid' | 'dot' | 'ascii';

interface VisualExportOptions {
  format: VisualFormat;
  includeMetadata?: boolean;
  maxDepth?: number;
}
```

**Unified Exporter Class**:
```typescript
class VisualExporter {
  exportCausalGraph(thought: CausalThought, options: VisualExportOptions): string
  exportTemporalTimeline(thought: TemporalThought, options: VisualExportOptions): string
  // ... 15 mode-specific methods
}
```

**Benefits**:
- **Lazy loading**: Only load exporters when specific mode needed
- **Tree-shaking**: Unused exporters eliminated during bundling
- **Maintainability**: ~100-150 lines per file vs 2,546 line monolith
- **Backward compatibility**: Unified class preserved for existing consumers

---

## Visualization Components

### `src/visualization/mermaid.ts` - Mermaid Generator

**Purpose**: Generate Mermaid diagrams from thinking sessions

**Diagram Types**:
- Flowcharts (thought flow)
- Sequence diagrams (Shannon stages)
- Mind maps (knowledge structures)
- Gantt charts (temporal reasoning)

### `src/visualization/interactive.ts` - Interactive Features

**Purpose**: Add interactivity to visualizations

**Features**:
- CSS animations (fadeIn, slideIn, zoomIn, etc.)
- Event handlers
- Dynamic updates

---

## Utility Components

### `src/utils/errors.ts` - Error Definitions

Custom error types:
- `SessionNotFoundError`
- `InvalidThoughtError`
- `ValidationError`

### `src/utils/logger.ts` - Logger

**Purpose**: Structured logging with levels

**Levels**: error, warn, info, debug

**Features**:
- Timestamp tracking
- Level filtering
- PII sanitization

**Interface**: Implements `ILogger` for dependency injection

---

## Type System Architecture

### Base Types (`src/types/core.ts`)

**BaseThought**: Common fields for all thoughts
```typescript
interface BaseThought {
  id: string;
  sessionId: string;
  mode: ThinkingMode;
  thoughtNumber: number;
  totalThoughts: number;
  content: string;
  timestamp: Date;
  nextThoughtNeeded: boolean;
  isRevision?: boolean;
  revisesThought?: string;
}
```

**ThinkingSession**: Session state container
```typescript
interface ThinkingSession {
  id: string;
  title: string;
  mode: ThinkingMode;
  thoughts: Thought[];
  createdAt: Date;
  updatedAt: Date;
  isComplete: boolean;
  metrics: SessionMetrics;
  config: SessionConfig;
  // ... additional fields
}
```

### Mode-Specific Types (`src/types/modes/*.ts`)

Each mode extends BaseThought with mode-specific fields:

**Example - ShannonThought**:
```typescript
interface ShannonThought extends BaseThought {
  mode: ThinkingMode.SHANNON;
  thoughtType: ExtendedThoughtType;
  stage: ShannonStage;
  uncertainty?: number;
  dependencies?: string[];
  assumptions?: string[];
}
```

**Example - MathematicsThought**:
```typescript
interface MathematicsThought extends BaseThought {
  mode: ThinkingMode.MATHEMATICS;
  thoughtType: ExtendedThoughtType;
  mathematicalModel?: MathematicalModel;
  proofStrategy?: ProofStrategy;
}
```

### Discriminated Unions

**Thought Union**:
```typescript
type Thought =
  | SequentialThought
  | ShannonThought
  | MathematicsThought
  | PhysicsThought
  | InductiveThought      // v5.0.0
  | DeductiveThought      // v5.0.0
  | MetaReasoningThought  // v6.0.0
  | ... (21 total)
```

Enables type-safe pattern matching and mode-specific handling.

---

## Component Interactions

### Session Creation Flow

```
Client Request
    ↓
index.ts: handleCreateSession()
    ↓
SessionManager.createSession()
    ↓
SessionMetricsCalculator.initializeMetrics()
    ↓
Repository.save()
    ↓
Return ThinkingSession
```

### Thought Addition Flow

```
Client Request
    ↓
index.ts: handleAddThought()
    ↓
ThoughtFactory.createThought()
    ↓
SessionManager.addThought()
    ↓
SessionMetricsCalculator.updateMetrics()
    ↓
Repository.save()
    ↓
SearchEngine.updateSession()
    ↓
Return updated ThinkingSession
```

### Export Flow

```
Client Request
    ↓
index.ts: handleExport()
    ↓
SessionManager.getSession()
    ↓
ExportService.exportSession()
    ↓
VisualExporter (if visual format)
    ↓
Return formatted output
```

### Mode Switching Flow

```
Client Request
    ↓
index.ts: handleSwitchMode()
    ↓
ModeRouter.switchMode()
    ↓
SessionManager.switchMode()
    ↓
Update session.mode
    ↓
Update config.modeConfig
    ↓
Repository.save()
    ↓
Return updated session
```

### Batch Processing Flow

```
Client Request
    ↓
BatchProcessor.submitJob()
    ↓
BatchProcessor.createJob()
    ↓
Queue.push(job)
    ↓
BatchProcessor.processQueue()
    ↓
BatchProcessor.executeJob()
    ↓
Execute operation (export/import/analyze/validate)
    ↓
Update progress
    ↓
Call onProgress callback
    ↓
Mark job complete
```

### Backup Flow

```
Client Request
    ↓
BackupManager.create()
    ↓
Serialize data → JSON
    ↓
Compress (gzip/brotli)
    ↓
Encrypt (optional)
    ↓
Calculate checksum (SHA256)
    ↓
Provider.save()
    ↓
Return BackupRecord
```

---

## Component Dependencies

### Dependency Graph

```
index.ts
├── ThoughtFactory
├── ExportService
│   └── VisualExporter
├── ModeRouter
│   ├── SessionManager
│   │   ├── SessionMetricsCalculator
│   │   └── Repository
│   └── ModeRecommender
└── SessionManager

BatchProcessor (standalone)

BackupManager
└── BackupProviders
    ├── LocalBackupProvider
    ├── S3BackupProvider
    ├── GCSBackupProvider
    └── AzureBackupProvider

SearchEngine
├── SearchIndex
└── Tokenizer

TaxonomySystem
├── TaxonomyNavigator
├── SuggestionEngine
├── AdaptiveModeSelector
└── MultiModalAnalyzer
```

### Circular Dependencies

**None** - Architecture maintains unidirectional dependencies

**Design Principle**: Services depend on managers, managers depend on storage, no upward dependencies.

---

## Extension Points

### Adding a New Thinking Mode

1. **Define Type** in `src/types/modes/new-mode.ts`:
   ```typescript
   export interface NewModeThought extends BaseThought {
     mode: ThinkingMode.NEW_MODE;
     // mode-specific fields
   }
   ```

2. **Update Enum** in `src/types/core.ts`:
   ```typescript
   export enum ThinkingMode {
     // ...
     NEW_MODE = 'new_mode',
   }
   ```

3. **Add to Union** in `src/types/core.ts`:
   ```typescript
   export type Thought = ... | NewModeThought;
   ```

4. **Implement in Factory** (`src/services/ThoughtFactory.ts`):
   ```typescript
   case 'new_mode':
     return { ...baseThought, mode: ThinkingMode.NEW_MODE, ... };
   ```

5. **Add Tests** in `tests/unit/new-mode.test.ts`

### Adding a New Export Format

1. **Implement Method** in `src/services/ExportService.ts`:
   ```typescript
   private exportToNewFormat(session: ThinkingSession): string {
     // format implementation
   }
   ```

2. **Add to Switch** in `exportSession()`:
   ```typescript
   case 'new_format':
     return this.exportToNewFormat(session);
   ```

3. **Add Tests**

### Adding a New Backup Provider

1. **Implement Interface** in `src/backup/providers/new-provider.ts`:
   ```typescript
   export class NewBackupProvider implements BackupProvider {
     async save(backupId, data, manifest): Promise<string> { }
     async load(backupId): Promise<{ data: Buffer; manifest: BackupManifest }> { }
     // ... other methods
   }
   ```

2. **Register in BackupManager** (`src/backup/backup-manager.ts`):
   ```typescript
   case 'new_provider':
     this.providers.set(provider, new NewBackupProvider(options));
   ```

---

## Performance Optimization

### Session Management
- **LRU Cache**: Keep hot sessions in memory
- **Lazy Loading**: Load from storage only when needed
- **Incremental Metrics**: O(1) updates instead of O(n) recalculation

### Search
- **Inverted Index**: O(log n) search vs O(n) scan
- **Pagination**: Limit memory usage for large result sets
- **Facet Caching**: Pre-compute aggregations

### Batch Processing
- **Concurrency Control**: Prevent resource exhaustion
- **Progress Streaming**: Real-time feedback
- **Retry Logic**: Handle transient failures

---

## Testing Strategy

### Unit Tests
- **Service Layer**: ThoughtFactory, ExportService, ModeRouter
- **Session Management**: SessionManager, SessionMetricsCalculator
- **Search**: SearchEngine, SearchIndex, Tokenizer
- **Batch**: BatchProcessor
- **Backup**: BackupManager
- **Mode-Specific**: One test file per thinking mode

### Integration Tests
- **MCP Protocol**: Full request/response cycles
- **Session Workflows**: End-to-end session operations
- **Multi-Session**: Concurrent session handling
- **Error Handling**: Error propagation and recovery
- **Production Features**: Real-world usage scenarios

### Coverage Targets
- **Critical Paths**: 80%+ coverage ✅
- **Tests**: 745 passing
- **Test Files**: 36
- **Type Safety**: 100% (0 type suppressions)

---

*Last Updated*: 2025-12-02
*Component Version*: 6.1.2
