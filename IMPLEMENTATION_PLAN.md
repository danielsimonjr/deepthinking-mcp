# Implementation Plan - DeepThinking MCP v3.4.5+

**Source**: CODE_REVIEW.md recommendations
**Goal**: Address all critical issues, refactor architecture, and achieve production readiness
**Total Items**: 31 tasks organized into 4 sprints
**Estimated Duration**: 8-12 weeks

---

## Sprint Overview

| Sprint | Focus | Items | Priority | Duration |
|--------|-------|-------|----------|----------|
| **Sprint 1** | Quick Wins & Critical Bugs | 10 | CRITICAL/HIGH | 3-5 days |
| **Sprint 2** | Code Quality & Security | 10 | HIGH/MEDIUM | 1 week |
| **Sprint 3** | Architecture & Testing | 6 | MEDIUM/HIGH | 2 weeks |
| **Sprint 4** | Advanced Features & Docs | 5 | MEDIUM/LOW | 2-3 weeks |

---

## Sprint 1: Quick Wins & Critical Bugs (3-5 days)

### ✅ Task 1.1: Fix Search Engine Critical Bug - Property Access
**Priority**: CRITICAL
**Complexity**: ⭐ Simple
**ETA**: 30 minutes
**File**: `src/search/engine.ts:365-366, 414-417`

**Problem**:
```typescript
// Line 365-366: Accessing non-existent property
const thoughtTokens = this.tokenizer.getUniqueTokens(
  session.contents[i].thought  // BUG: 'contents' doesn't exist
);

// Line 414-417: Confidence property doesn't exist
const confA = a.session.confidence || 0;  // BUG: No 'confidence' property
```

**Fix**:
```typescript
// Line 365-366: Use correct property names
const thoughtTokens = this.tokenizer.getUniqueTokens(
  session.thoughts[i].content
);

// Line 414-417: Remove confidence sorting or add property
// Option A: Remove if not needed
// Option B: Add confidence to ThinkingSession interface
```

**Testing**:
- Run `npm test -- --run tests/integration/production-features.test.ts -t "should index and search"`
- Verify search indexing works correctly

---

### ✅ Task 1.2: Fix Backup Compression Data Corruption Bug
**Priority**: CRITICAL
**Complexity**: ⭐ Simple
**ETA**: 30 minutes
**File**: `src/backup/backup-manager.ts:119-127`

**Problem**:
```typescript
let compressed = dataBuffer;
if (config.compression !== 'none') {
  // @ts-ignore - Buffer type conversion
  this.compress(dataBuffer, config.compression);  // Result NOT assigned!
}
record.compressedSize = compressed.length;  // WRONG: Uses uncompressed size
```

**Fix**:
```typescript
let compressed = dataBuffer;
if (config.compression !== 'none') {
  compressed = await this.compress(dataBuffer, config.compression);
}
record.size = dataBuffer.length;  // Original size
record.compressedSize = compressed.length;  // Compressed size
```

**Testing**:
- Run `npm test -- --run tests/integration/production-features.test.ts -t "backup"`
- Verify compression sizes are correct

---

### ✅ Task 1.3: Replace Deprecated String Methods (.substr)
**Priority**: HIGH
**Complexity**: ⭐ Simple
**ETA**: 20 minutes
**Files**:
- `src/collaboration/multi-agent.ts:131, 166, 610`
- `src/backup/backup-manager.ts` (2 occurrences)
- `src/session/manager.ts` (1 occurrence)

**Problem**:
```typescript
Math.random().toString(36).substr(2, 9);  // .substr() is deprecated
```

**Fix**:
```typescript
Math.random().toString(36).substring(2, 11);  // Use .substring()
// or
Math.random().toString(36).slice(2, 11);  // Use .slice()
```

**Search & Replace**:
```bash
find src -name "*.ts" -exec sed -i 's/\.substr(/\.substring(/g' {} \;
```

**Testing**:
- Run `npm run typecheck`
- Run `npm test`

---

### ✅ Task 1.4: Fix Template Averaging Math Error
**Priority**: HIGH
**Complexity**: ⭐ Simple
**ETA**: 15 minutes
**File**: `src/templates/manager.ts:243`

**Problem**:
```typescript
// Line 159: usageCount incremented first
stats.usageCount++;

// Line 243: Then used in calculation - WRONG ORDER
stats.averageThoughts = (stats.averageThoughts * (stats.usageCount - 1) + thoughtCount) / stats.usageCount;
```

**Fix**:
```typescript
// Better approach: Track total
stats.totalThoughts = (stats.totalThoughts || 0) + thoughtCount;
stats.usageCount++;
stats.averageThoughts = stats.totalThoughts / stats.usageCount;
```

**Testing**:
- Run `npm test -- --run tests/unit/templates/manager.test.ts`
- Verify average calculations are correct

---

### ✅ Task 1.5: Remove Unsafe Type Assertions (as unknown as)
**Priority**: CRITICAL
**Complexity**: ⭐⭐ Moderate
**ETA**: 2 hours
**File**: `src/index.ts:425, 437, 451, 463, 478, 492`

**Problem**:
```typescript
} as unknown as BayesianThought;        // DOUBLE CAST - bypasses all type checking
} as unknown as CounterfactualThought;
} as unknown as AnalogicalThought;
```

**Fix Options**:

**Option A - Proper Type Narrowing**:
```typescript
function createBayesianThought(base: Thought, args: AddThoughtArgs): BayesianThought {
  return {
    ...base,
    priorProbability: args.priorProbability || 0.5,
    posteriorProbability: args.posteriorProbability || 0.5,
    evidence: args.evidence || [],
    likelihoodRatio: args.likelihoodRatio || 1.0,
  };
}
```

**Option B - If modes unimplemented, return base thought**:
```typescript
case ThinkingMode.BAYESIAN:
  // TODO: Implement Bayesian mode
  console.warn('Bayesian mode not fully implemented');
  return baseThought;
```

**Testing**:
- Run `npm run typecheck` - should have 0 errors without suppressions
- Run `npm test`

---

### ✅ Task 1.6: Remove/Document Unimplemented Modes
**Priority**: CRITICAL
**Complexity**: ⭐⭐ Moderate
**ETA**: 3 hours
**File**: `src/types/core.ts:23-43`

**Problem**: 14 modes in enum have no implementation

**Fix - Option A (Recommended)**: Mark as experimental
```typescript
export enum ThinkingMode {
  // Implemented Modes
  SEQUENTIAL = 'sequential',
  SHANNON = 'shannon',
  MATHEMATICS = 'mathematics',
  PHYSICS = 'physics',
  HYBRID = 'hybrid',

  // Experimental - Partial Implementation
  ABDUCTIVE = 'abductive',
  CAUSAL = 'causal',
  BAYESIAN = 'bayesian',
  // ... etc
}

// Add documentation
/**
 * @experimental This mode has limited implementation
 */
export const EXPERIMENTAL_MODES: ThinkingMode[] = [
  ThinkingMode.ABDUCTIVE,
  ThinkingMode.CAUSAL,
  // ...
];
```

**Fix - Option B**: Remove from enum, add to roadmap
```typescript
export enum ThinkingMode {
  SEQUENTIAL = 'sequential',
  SHANNON = 'shannon',
  MATHEMATICS = 'mathematics',
  PHYSICS = 'physics',
  HYBRID = 'hybrid',
  CUSTOM = 'custom'
}
```

**Testing**:
- Run `npm run typecheck`
- Run `npm test`
- Update README.md to reflect actual modes

---

### ✅ Task 1.7: Restore or Remove Analytics System
**Priority**: CRITICAL
**Complexity**: ⭐⭐ Moderate
**ETA**: 4 hours
**File**: `src/analytics/index.ts`

**Problem**: All exports commented out
```typescript
// export { AnalyticsDashboard } from './dashboard.js';
// export { TimeSeriesAnalyzer } from './time-series.js';
```

**Decision Required**: Restore or remove?

**Option A - Remove (Recommended for now)**:
```bash
# Comment out in package exports
# Add TODO to roadmap
# Remove from README features
```

**Option B - Restore**:
```typescript
// Fix type errors in analytics files
// Uncomment exports
// Add tests
```

**Testing**:
- If removing: Run `npm run typecheck` and `npm test` - should pass
- If restoring: Fix type errors, add tests

---

### ✅ Task 1.8: Clean Up Duplicate Type Definitions
**Priority**: MEDIUM
**Complexity**: ⭐ Simple
**ETA**: 30 minutes
**Files**:
- `src/types/modes/firstprinciples.ts` (plural)
- `src/types/modes/firstprinciple.ts` (singular)

**Problem**: Both files define `FirstPrinciplesThought`

**Fix**:
1. Keep `firstprinciples.ts` (plural - matches mode name)
2. Delete `firstprinciple.ts` (singular)
3. Update any imports

**Commands**:
```bash
# Search for imports
grep -r "firstprinciple.js" src/

# Remove duplicate
rm src/types/modes/firstprinciple.ts

# Update imports if needed
```

**Testing**:
- Run `npm run typecheck`
- Run `npm test`

---

### ✅ Task 1.9: Add Comments to Magic Numbers
**Priority**: LOW
**Complexity**: ⭐ Simple
**ETA**: 30 minutes
**Files**:
- `src/batch/processor.ts:18`
- `src/cache/lru.ts:8`

**Problem**:
```typescript
maxConcurrentJobs: 3,      // Why 3?
maxBatchSize: 100,         // Why 100?
DEFAULT_MAX_SIZE = 1000;   // Why 1000?
```

**Fix**:
```typescript
const DEFAULT_OPTIONS: BatchProcessorOptions = {
  maxConcurrentJobs: 3,      // Based on CPU core count for optimal parallel processing
  maxBatchSize: 100,         // Balance between memory usage and throughput
  retryFailedItems: true,
  maxRetries: 3,             // Exponential backoff: 1s, 2s, 4s
};

const DEFAULT_MAX_SIZE = 1000;  // Cache size limit - ~10MB memory for average sessions
```

**Testing**:
- Review in code review
- No functional changes

---

### ✅ Task 1.10: Standardize Error Messages
**Priority**: LOW
**Complexity**: ⭐⭐ Moderate
**ETA**: 2 hours
**Files**: Multiple across codebase

**Problem**: Inconsistent error formats
```typescript
throw new Error('Session not found');           // Simple
throw new Error(`Session not found: ${id}`);    // With context
throw new SessionNotFoundError(sessionId);      // Custom error
throw new Error('session not found');           // Lowercase
```

**Fix**: Create error standards document and apply

**Create**: `src/utils/errors.ts`
```typescript
export class ApplicationError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class SessionNotFoundError extends ApplicationError {
  constructor(sessionId: string) {
    super(
      `Session not found`,
      'SESSION_NOT_FOUND',
      404,
      { sessionId }
    );
  }
}

export class ValidationError extends ApplicationError {
  constructor(field: string, message: string) {
    super(
      `Validation failed: ${message}`,
      'VALIDATION_ERROR',
      400,
      { field }
    );
  }
}
```

**Testing**:
- Run `npm run typecheck`
- Run `npm test`
- Update tests to expect new error types

---

## Sprint 1 Summary

**Completion Criteria**:
- ✅ All critical bugs fixed
- ✅ Search engine working correctly
- ✅ Backup compression working correctly
- ✅ All deprecated methods replaced
- ✅ Type assertions removed or properly implemented
- ✅ Unimplemented modes documented/removed
- ✅ Analytics decision made and implemented
- ✅ npm run typecheck: 0 errors
- ✅ npm test: All tests passing

**Before Sprint 2**:
1. Run full test suite
2. Update CHANGELOG.md with all fixes
3. Commit to git with detailed message
4. Tag as v3.4.6-sprint1

---

## Sprint 2: Code Quality & Security (1 week)

### ✅ Task 2.1: Standardize Test File Locations
**Priority**: MEDIUM
**Complexity**: ⭐ Simple
**ETA**: 1 hour

**Problem**: Inconsistent test organization
```
/tests/unit/export/latex.test.ts
/tests/export/latex-export.test.ts  ← Duplicate location
```

**Fix**: Consolidate to `/tests/unit/[module]/[file].test.ts`

**Commands**:
```bash
# Move all tests to standard locations
mv tests/export/* tests/unit/export/
# Update test imports
# Remove duplicate files
```

---

### ✅ Task 2.2: Add Path Aliases in tsconfig.json
**Priority**: MEDIUM
**Complexity**: ⭐⭐ Moderate
**ETA**: 2 hours

**Problem**: Deep import paths
```typescript
import { SessionNotFoundError } from '../../../utils/errors.js';
```

**Fix**: Add path aliases
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["src/*"],
      "@types/*": ["src/types/*"],
      "@utils/*": ["src/utils/*"],
      "@validation/*": ["src/validation/*"],
      "@modes/*": ["src/modes/*"]
    }
  }
}
```

Then update imports:
```typescript
import { SessionNotFoundError } from '@utils/errors.js';
import type { ThinkingMode } from '@types/core.js';
```

---

### ✅ Task 2.3: Add Input Validation Layer (Zod)
**Priority**: HIGH
**Complexity**: ⭐⭐⭐ Complex
**ETA**: 8 hours

**Install Zod**:
```bash
npm install zod
```

**Create**: `src/validation/schemas.ts`
```typescript
import { z } from 'zod';
import { ThinkingMode } from '@types/core.js';

export const AddThoughtSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID format'),
  thought: z.string().min(1, 'Thought cannot be empty').max(10000, 'Thought too long'),
  thoughtNumber: z.number().int().min(1).max(1000),
  totalThoughts: z.number().int().min(1).max(1000),
  mode: z.nativeEnum(ThinkingMode),
  nextThoughtNeeded: z.boolean(),
});

export const CreateSessionSchema = z.object({
  title: z.string().min(1).max(200),
  mode: z.nativeEnum(ThinkingMode),
  author: z.string().max(100).optional(),
  domain: z.string().max(100).optional(),
});
```

**Update**: `src/index.ts`
```typescript
import { AddThoughtSchema } from './validation/schemas.js';

// In request handler
const validated = AddThoughtSchema.parse(input);
```

---

### ✅ Task 2.4: Sanitize File Operations
**Priority**: HIGH
**Complexity**: ⭐⭐⭐ Complex
**ETA**: 4 hours

**Create**: `src/utils/sanitize.ts`
```typescript
import * as path from 'path';

export function sanitizeFilename(filename: string): string {
  // Remove path traversal attempts
  return filename.replace(/[^a-zA-Z0-9_-]/g, '_');
}

export function validatePath(targetPath: string, baseDir: string): void {
  const resolved = path.resolve(targetPath);
  const base = path.resolve(baseDir);

  if (!resolved.startsWith(base)) {
    throw new SecurityError('Path traversal detected');
  }
}

export function isValidSessionId(id: string): boolean {
  // UUID v4 format
  return /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(id);
}
```

**Update**: `src/session/storage/file.ts`
```typescript
import { sanitizeFilename, validatePath, isValidSessionId } from '@utils/sanitize.js';

async saveSession(session: ThinkingSession): Promise<void> {
  if (!isValidSessionId(session.id)) {
    throw new ValidationError('sessionId', 'Invalid session ID format');
  }

  const safeId = sanitizeFilename(session.id);
  const sessionPath = path.join(this.baseDir, `${safeId}.json`);

  validatePath(sessionPath, this.baseDir);

  await fs.writeFile(sessionPath, JSON.stringify(session, null, 2));
}
```

---

### ✅ Task 2.5: Apply Rate Limiting to Critical Operations
**Priority**: MEDIUM
**Complexity**: ⭐⭐ Moderate
**ETA**: 3 hours

**Update**: `src/session/manager.ts`
```typescript
import { RateLimiter } from '../rate-limit/limiter.js';

export class SessionManager {
  private rateLimiter: RateLimiter;

  constructor() {
    this.rateLimiter = new RateLimiter({
      tier: 'professional',
      window: 60000, // 1 minute
    });
  }

  async createSession(params: CreateSessionParams): Promise<ThinkingSession> {
    const allowed = await this.rateLimiter.checkLimit('createSession');
    if (!allowed) {
      throw new RateLimitError('Session creation rate limit exceeded');
    }
    // ... rest of method
  }

  async addThought(sessionId: string, args: AddThoughtArgs): Promise<Thought> {
    const allowed = await this.rateLimiter.checkLimit(`addThought:${sessionId}`);
    if (!allowed) {
      throw new RateLimitError('Thought addition rate limit exceeded');
    }
    // ... rest of method
  }
}
```

---

### ✅ Task 2.6: Remove Sensitive Data from Logs
**Priority**: MEDIUM
**Complexity**: ⭐⭐ Moderate
**ETA**: 2 hours

**Create**: `src/utils/log-sanitizer.ts`
```typescript
export function sanitizeForLogging(data: Record<string, unknown>): Record<string, unknown> {
  const sanitized = { ...data };

  // Remove PII fields
  const piiFields = ['author', 'email', 'phone', 'address', 'ip'];
  for (const field of piiFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }

  // Truncate long content
  if (sanitized.title && typeof sanitized.title === 'string' && sanitized.title.length > 100) {
    sanitized.title = sanitized.title.substring(0, 100) + '...';
  }

  return sanitized;
}
```

**Update logging calls**:
```typescript
this.logger.info('Session created', sanitizeForLogging({
  sessionId: session.id,
  title: session.title,
  mode: session.mode,
  author: session.author,  // Will be redacted
}));
```

---

### ✅ Task 2.7: Replace Synchronous File Operations
**Priority**: MEDIUM
**Complexity**: ⭐⭐ Moderate
**ETA**: 2 hours

**Find and replace**:
```bash
# Search for sync operations
grep -r "readdirSync\|readFileSync\|writeFileSync" src/
```

**Update**: `src/session/storage/file.ts`
```typescript
import { promises as fs } from 'fs';

// Before
const files = fs.readdirSync(this.baseDir);

// After
const files = await fs.readdir(this.baseDir);
```

---

### ✅ Task 2.8: Add LRU Cache for Sessions
**Priority**: MEDIUM
**Complexity**: ⭐⭐ Moderate
**ETA**: 2 hours

**Install**:
```bash
npm install lru-cache
npm install --save-dev @types/lru-cache
```

**Update**: `src/session/manager.ts`
```typescript
import { LRUCache } from 'lru-cache';

export class SessionManager {
  private sessions: LRUCache<string, ThinkingSession>;

  constructor() {
    this.sessions = new LRUCache<string, ThinkingSession>({
      max: 1000,  // Max 1000 sessions in memory
      maxSize: 100 * 1024 * 1024,  // 100MB max
      sizeCalculation: (session) => JSON.stringify(session).length,
      ttl: 1000 * 60 * 60,  // 1 hour TTL
      dispose: (session) => {
        // Persist to disk when evicted
        this.storage.saveSession(session);
      },
    });
  }
}
```

---

### ✅ Task 2.9: Consolidate Visualization Directories
**Priority**: HIGH
**Complexity**: ⭐⭐⭐ Complex
**ETA**: 4 hours

**Current Structure**:
```
src/
├── visual/           ← Remove
│   ├── ascii-renderer.ts
│   ├── dot-renderer.ts
│   ├── exporter.ts
│   ├── mermaid-renderer.ts
│   └── types.ts
└── visualization/    ← Keep and reorganize
    ├── state-charts.ts
    ├── thought-flow.ts
    └── ...
```

**New Structure**:
```
src/visualization/
├── renderers/
│   ├── ascii.ts
│   ├── dot.ts
│   └── mermaid.ts
├── exporters/
│   ├── visual.ts
│   └── types.ts
└── charts/
    ├── state-charts.ts
    ├── thought-flow.ts
    └── timeline.ts
```

**Migration**:
```bash
# Create new directories
mkdir -p src/visualization/renderers
mkdir -p src/visualization/exporters
mkdir -p src/visualization/charts

# Move files
mv src/visual/ascii-renderer.ts src/visualization/renderers/ascii.ts
mv src/visual/dot-renderer.ts src/visualization/renderers/dot.ts
mv src/visual/mermaid-renderer.ts src/visualization/renderers/mermaid.ts
mv src/visual/exporter.ts src/visualization/exporters/visual.ts
mv src/visual/types.ts src/visualization/exporters/types.ts

# Update imports across codebase
# Remove old directory
rm -rf src/visual
```

---

### ✅ Task 2.10: Add JSDoc to Public Methods
**Priority**: MEDIUM
**Complexity**: ⭐⭐⭐ Complex
**ETA**: 8 hours

**Template**:
```typescript
/**
 * Creates a new thinking session
 *
 * @param params - Session creation parameters
 * @param params.title - Session title (max 200 chars)
 * @param params.mode - Thinking mode to use
 * @param params.author - Optional author name
 * @returns The created session with generated ID and timestamps
 * @throws {ValidationError} If params invalid
 * @throws {RateLimitError} If rate limit exceeded
 *
 * @example
 * ```typescript
 * const session = await manager.createSession({
 *   title: 'Problem Solving',
 *   mode: ThinkingMode.SEQUENTIAL
 * });
 * ```
 */
async createSession(params: CreateSessionParams): Promise<ThinkingSession> {
  // ...
}
```

**Files to document**:
- `src/session/manager.ts` - All public methods
- `src/search/engine.ts` - All public methods
- `src/batch/processor.ts` - All public methods
- `src/backup/backup-manager.ts` - All public methods

---

## Sprint 2 Summary

**Completion Criteria**:
- ✅ All tests organized in standard locations
- ✅ Path aliases configured and working
- ✅ Input validation with Zod implemented
- ✅ File operations sanitized and secure
- ✅ Rate limiting applied to critical operations
- ✅ Logs sanitized (no PII)
- ✅ All file operations async
- ✅ LRU cache implemented
- ✅ Visualization directories consolidated
- ✅ Public methods documented with JSDoc
- ✅ npm run typecheck: 0 errors
- ✅ npm test: All tests passing

---

## Sprint 3: Architecture & Testing (2 weeks)

### ✅ Task 3.1: Implement Repository Pattern
**Priority**: HIGH
**Complexity**: ⭐⭐⭐⭐ Very Complex
**ETA**: 3 days

**Create**: `src/repositories/ISessionRepository.ts`
```typescript
export interface ISessionRepository {
  save(session: ThinkingSession): Promise<void>;
  findById(id: string): Promise<ThinkingSession | null>;
  findAll(): Promise<ThinkingSession[]>;
  findByMode(mode: ThinkingMode): Promise<ThinkingSession[]>;
  delete(id: string): Promise<boolean>;
  exists(id: string): Promise<boolean>;
}
```

**Implement**: `src/repositories/FileSessionRepository.ts`
**Implement**: `src/repositories/MemorySessionRepository.ts` (for tests)

---

### ✅ Task 3.2: Add Dependency Injection
**Priority**: HIGH
**Complexity**: ⭐⭐⭐⭐ Very Complex
**ETA**: 1 week

**Create interfaces for all dependencies**
**Refactor constructors to accept dependencies**
**Update tests to use mock dependencies**

---

### ✅ Task 3.3: Split God File (index.ts)
**Priority**: CRITICAL
**Complexity**: ⭐⭐⭐⭐⭐ Very Complex
**ETA**: 1 week

**Create**:
- `src/services/ThoughtFactory.ts`
- `src/services/ExportService.ts`
- `src/services/ModeRouter.ts`

**Reduce**: `src/index.ts` from 793 lines to ~100 lines

---

### ✅ Task 3.4: Refactor SessionManager God Class
**Priority**: CRITICAL
**Complexity**: ⭐⭐⭐⭐⭐ Very Complex
**ETA**: 1 week

**Split into**:
- `SessionRepository`
- `ThoughtService`
- `SessionMetricsCalculator`

---

### ✅ Task 3.5: Add Critical Path Tests
**Priority**: CRITICAL
**Complexity**: ⭐⭐⭐⭐ Very Complex
**ETA**: 2 weeks

**Target**: 80% code coverage

**Files to test**:
- `src/index.ts`
- `src/session/manager.ts`
- `src/search/engine.ts`
- `src/batch/processor.ts`
- `src/backup/backup-manager.ts`

---

### ✅ Task 3.6: Add Integration Test Suite
**Priority**: HIGH
**Complexity**: ⭐⭐⭐⭐ Very Complex
**ETA**: 1 week

**Create**: 20+ integration tests covering full workflows

---

## Sprint 4: Advanced Features & Documentation (2-3 weeks)

### ✅ Task 4.1: Remove 231 Type Suppressions
**Priority**: HIGH
**Complexity**: ⭐⭐⭐⭐⭐ Very Complex
**ETA**: 2 weeks

**Systematically remove all `@ts-expect-error` and `@ts-ignore`**

---

### ✅ Task 4.2: Implement Batch Processing (Remove Stubs)
**Priority**: MEDIUM
**Complexity**: ⭐⭐⭐⭐ Very Complex
**ETA**: 2 weeks

**Remove sleep() stubs**
**Implement actual operations**

---

### ✅ Task 4.3: Implement Cloud Backup Providers
**Priority**: MEDIUM
**Complexity**: ⭐⭐⭐⭐ Very Complex
**ETA**: 2 weeks

**Implement**:
- S3BackupProvider
- AzureBackupProvider
- GCSBackupProvider

---

### ✅ Task 4.4: Complete Taxonomy Classifier
**Priority**: MEDIUM
**Complexity**: ⭐⭐⭐ Complex
**ETA**: 1 week

**Enable taxonomy-based search classification**

---

### ✅ Task 4.5: Create Architecture Documentation
**Priority**: MEDIUM
**Complexity**: ⭐⭐⭐ Complex
**ETA**: 3 days

**Create**: `/docs/architecture/`
- Component diagrams
- Data flow diagrams
- Deployment architecture

---

## Progress Tracking

| Sprint | Status | Tests Passing | Coverage | Type Errors |
|--------|--------|---------------|----------|-------------|
| Baseline | ✅ | 577/589 (97.9%) | ~22% | 0 (231 suppressions) |
| Sprint 1 | 🔄 | TBD | TBD | TBD |
| Sprint 2 | ⏳ | TBD | TBD | TBD |
| Sprint 3 | ⏳ | TBD | TBD | TBD |
| Sprint 4 | ⏳ | TBD | TBD | TBD |

**Legend**: ✅ Complete | 🔄 In Progress | ⏳ Not Started

---

## Notes

- Run `npm run typecheck` after each task
- Run `npm test` after each task
- Update CHANGELOG.md frequently
- Commit to git frequently with descriptive messages
- Each sprint ends with full test suite run and changelog update
