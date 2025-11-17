# Phase 3.5 Implementation Tasks

**Version**: 1.0
**Status**: Ready for Implementation
**Created**: 2025-11-16
**Based On**: FUTURE_IMPROVEMENTS.md + PHASE_3.5_IMPLEMENTATION_PLAN.md

---

## Task Organization

Tasks are organized by sub-phase (A-E) with detailed estimates, acceptance criteria, and implementation guidance.

**Format**:
- **Task ID**: Unique identifier
- **Title**: Brief description
- **Effort**: Time estimate in hours
- **Priority**: Critical/High/Medium/Low
- **Dependencies**: Prerequisites
- **Files**: Affected files
- **Acceptance Criteria**: Definition of done

---

## Phase 3.5A: Critical Bug Fixes (v2.5.1)

### Task A1: Fix Server Version Number Mismatch
**Effort**: 0.25 hours
**Priority**: 🔴 Critical
**Dependencies**: None
**Files**: `src/index.ts`

**Issue**: Server metadata shows version '1.0.0' but package.json is at '2.5.0'

**Implementation**:
```typescript
// Add at top of file
import packageJson from '../package.json' assert { type: 'json' };

// Update server initialization (line 36-46)
const server = new Server(
  {
    name: packageJson.name,
    version: packageJson.version,  // ✅ Now synced
  },
  {
    capabilities: {
      tools: {},
    },
  },
);
```

**Testing**:
1. Build project: `npm run build`
2. Start server: `npx deepthinking-mcp`
3. Verify version in server info
4. Run all tests: `npm test`

**Acceptance Criteria**:
- ✅ Server version matches package.json version
- ✅ No import errors
- ✅ All tests passing

---

### Task A2: Fix SessionManager Syntax Error
**Effort**: 0.15 hours
**Priority**: 🔴 Critical
**Dependencies**: None
**Files**: `src/session/manager.ts`

**Issue**: Missing closing braces in `updateMetrics()` method (lines 267-314)

**Current Code Structure**:
```typescript
// Temporal-specific metrics (Phase 3, v2.1)
if (isTemporalThought(thought)) {
  ...
  // ❌ Missing closing brace here

// Game theory-specific metrics (Phase 3, v2.2)
if (isGameTheoryThought(thought)) {
  ...
  // ❌ Missing closing brace here

// Evidential-specific metrics (Phase 3, v2.3)
if (isEvidentialThought(thought)) {
  ...
}
}  // ❌ Only 2 closing braces, need 4
}
}
```

**Implementation**:
1. Read `src/session/manager.ts` lines 267-314
2. Identify exact line numbers for missing braces
3. Add closing braces for temporal and game theory blocks
4. Verify proper nesting

**Testing**:
1. Type check: `npm run typecheck`
2. Build: `npm run build`
3. Run all tests: `npm test`
4. Verify metrics calculation works correctly

**Acceptance Criteria**:
- ✅ No TypeScript compilation errors
- ✅ Proper brace nesting
- ✅ All tests passing
- ✅ Metrics calculation verified with test

---

### Task A3: Verification and Release (v2.5.1)
**Effort**: 0.5 hours
**Priority**: 🔴 Critical
**Dependencies**: A1, A2
**Files**: `package.json`, `CHANGELOG.md`

**Implementation**:
1. Update `package.json` version to `2.5.1`
2. Add CHANGELOG entry:
```markdown
## [2.5.1] - 2025-11-16

### Fixed
- Server version number now syncs with package.json version
- Fixed syntax error in SessionManager updateMetrics() method (missing closing braces)

### Technical Details
- No functional changes
- Critical bug fixes only
```

3. Build and test: `npm run build && npm test`
4. Commit: `git commit -m "Fix: Critical bugs for v2.5.1"`
5. Tag: `git tag v2.5.1`
6. Publish: `npm publish`
7. Push: `git push && git push --tags`

**Acceptance Criteria**:
- ✅ Version updated to 2.5.1
- ✅ CHANGELOG updated
- ✅ All tests passing (157/157)
- ✅ Published to npm
- ✅ GitHub tag created

**Total Phase 3.5A Effort**: ~1 hour

---

## Phase 3.5B: Quick Wins (v2.5.2)

### Task B1: Remove Legacy core-old.ts File
**Effort**: 0.1 hours
**Priority**: 🟡 High
**Dependencies**: None
**Files**: `src/types/core-old.ts`

**Implementation**:
1. Verify no imports: `grep -r "core-old" src/`
2. Verify no references in tests: `grep -r "core-old" tests/`
3. Delete file: `rm src/types/core-old.ts`
4. Run tests to ensure nothing breaks

**Acceptance Criteria**:
- ✅ File deleted
- ✅ No import errors
- ✅ All tests passing

---

### Task B2: Implement Incremental Metrics Calculation
**Effort**: 3-4 hours
**Priority**: 🟡 High
**Dependencies**: None
**Files**: `src/session/manager.ts`

**Current Performance**: O(n) - recalculates from scratch on every thought

**Target Performance**: O(1) - incremental updates

**Implementation**:

1. Add running totals to session metrics:
```typescript
// In src/types/session.ts
export interface SessionMetrics {
  // ... existing fields

  // Add running totals (private, for internal use)
  _uncertaintySum?: number;
  _uncertaintyCount?: number;
  _dependencySum?: number;
  // ... other running totals
}
```

2. Refactor updateMetrics() method:
```typescript
private updateMetrics(session: ThinkingSession, thought: Thought): void {
  // Increment total thoughts
  session.metrics.totalThoughts++;

  // Update uncertainty incrementally
  if ('uncertainty' in thought && typeof thought.uncertainty === 'number') {
    const count = (session.metrics._uncertaintyCount || 0) + 1;
    const sum = (session.metrics._uncertaintySum || 0) + thought.uncertainty;
    session.metrics._uncertaintyCount = count;
    session.metrics._uncertaintySum = sum;
    session.metrics.averageUncertainty = sum / count;
  }

  // Update dependency depth incrementally
  if ('dependencies' in thought && Array.isArray(thought.dependencies)) {
    const currentMax = session.metrics.dependencyDepth || 0;
    const thoughtDepth = this.calculateThoughtDepth(thought, session);
    session.metrics.dependencyDepth = Math.max(currentMax, thoughtDepth);
  }

  // ... other incremental updates
}
```

3. Create benchmark test:
```typescript
// In tests/performance/metrics-benchmark.test.ts
describe('Metrics Performance', () => {
  it('should update metrics in O(1) time', () => {
    const manager = new SessionManager();
    const session = manager.createSession();

    const startTime = performance.now();
    for (let i = 0; i < 1000; i++) {
      manager.addThought(session.id, createTestThought());
    }
    const endTime = performance.now();

    const avgTimePerThought = (endTime - startTime) / 1000;
    expect(avgTimePerThought).toBeLessThan(5); // <5ms per thought
  });
});
```

**Testing**:
1. Run benchmark test
2. Verify metrics accuracy matches old implementation
3. Test with 1000+ thoughts
4. Verify all existing tests still pass

**Acceptance Criteria**:
- ✅ Metrics update in O(1) time
- ✅ Benchmark shows >2x performance improvement
- ✅ Metrics accuracy verified
- ✅ All tests passing

---

### Task B3: Add JSDoc Comments to Public APIs
**Effort**: 4-6 hours
**Priority**: 🟡 High
**Dependencies**: None
**Files**: `src/index.ts`, `src/session/manager.ts`, `src/validation/validator.ts`

**Scope**:
1. `createThought()` function
2. All handler functions (handleAddThought, handleSummarize, etc.)
3. SessionManager public methods
4. ThoughtValidator public methods
5. Key type interfaces

**JSDoc Template**:
```typescript
/**
 * Brief description of the function
 *
 * Longer description with details, edge cases, etc.
 *
 * @param paramName - Parameter description
 * @param anotherParam - Another parameter description
 * @returns Description of return value
 * @throws {ErrorType} Description of when this error is thrown
 *
 * @example
 * ```typescript
 * const result = functionName(param1, param2);
 * ```
 *
 * @see RelatedFunction For related functionality
 */
```

**Examples to Add**:

```typescript
/**
 * Creates a thought object with the appropriate type based on mode and parameters
 *
 * This factory function analyzes the input mode and constructs the correct
 * thought type with all required mode-specific properties. It handles type
 * conversion and sets default values for optional fields.
 *
 * @param input - The raw input from the MCP tool containing thought data and mode info
 * @returns A fully-typed thought object conforming to the specified mode
 * @throws {Error} If required mode-specific properties are missing
 * @throws {ValidationError} If mode-specific data fails validation
 *
 * @example
 * ```typescript
 * // Create a causal reasoning thought
 * const thought = createThought({
 *   thought: "Analyzing marketing impact",
 *   mode: "causal",
 *   causalGraph: {
 *     nodes: [{ id: 'marketing', name: 'Budget', type: 'cause' }],
 *     edges: [{ id: 'e1', from: 'marketing', to: 'sales', strength: 0.8 }]
 *   }
 * });
 * ```
 *
 * @see Thought For the thought type structure
 * @see ThinkingMode For available modes
 */
function createThought(input: ThinkingToolInput): Thought {
  // ... implementation
}
```

```typescript
/**
 * Adds a new thought to an existing session with validation
 *
 * This method validates the thought according to mode-specific rules,
 * updates session metrics, and adds the thought to the session's thought array.
 * Validation failures throw errors with detailed messages.
 *
 * @param sessionId - The UUID of the session to add the thought to
 * @param thought - The thought object to add
 * @returns The added thought with generated ID and timestamp
 * @throws {SessionNotFoundError} If session with given ID doesn't exist
 * @throws {ValidationError} If thought fails validation
 *
 * @example
 * ```typescript
 * const session = manager.createSession({ mode: 'sequential' });
 * const thought = manager.addThought(session.id, {
 *   thought: "Step 1: Analyze the problem",
 *   thoughtNumber: 1,
 *   totalThoughts: 3,
 *   nextThoughtNeeded: true
 * });
 * ```
 */
public addThought(sessionId: string, thought: Thought): Thought {
  // ... implementation
}
```

**Coverage Targets**:
- src/index.ts: 100% of exported functions
- src/session/manager.ts: 100% of public methods
- src/validation/validator.ts: All validate* methods
- src/types/: Top 10 most-used interfaces

**Acceptance Criteria**:
- ✅ All public functions have JSDoc
- ✅ IDE autocomplete shows documentation
- ✅ Parameters and returns documented
- ✅ At least 2 examples per major function

---

### Task B4: Remove Critical 'as any' Type Assertions
**Effort**: 2-3 hours
**Priority**: 🟡 High
**Dependencies**: None
**Files**: `src/index.ts`

**Current Issues**:
- Line 263: `thoughtType: input.thoughtType as any`
- Line 275: `thoughtType: input.thoughtType as any`
- Line 287: `thoughtType: input.thoughtType as any`
- Line 299: `thoughtType: input.thoughtType as any`
- 9 more instances

**Strategy**:

1. Create type guards for thought types:
```typescript
// In src/types/guards.ts (new file)
export type MathematicsThoughtType =
  | 'axiom_definition'
  | 'theorem_statement'
  | 'lemma'
  | 'proof_construction'
  | 'corollary';

export function isMathematicsThoughtType(type: any): type is MathematicsThoughtType {
  const validTypes: MathematicsThoughtType[] = [
    'axiom_definition',
    'theorem_statement',
    'lemma',
    'proof_construction',
    'corollary',
  ];
  return validTypes.includes(type);
}

// Similar guards for other modes...
```

2. Add Zod refinement for runtime validation:
```typescript
// In src/tools/thinking.ts
const mathematicsThoughtTypeSchema = z.enum([
  'axiom_definition',
  'theorem_statement',
  'lemma',
  'proof_construction',
  'corollary',
]);

// Use in tool schema:
thoughtType: z.string().optional().refine(
  (val) => !val || isMathematicsThoughtType(val),
  { message: 'Invalid mathematics thought type' }
)
```

3. Replace assertions with type guards:
```typescript
// Before:
const mathThought: MathematicsThought = {
  ...baseThought,
  mode: 'mathematics',
  thoughtType: input.thoughtType as any,  // ❌
  // ...
};

// After:
const mathThought: MathematicsThought = {
  ...baseThought,
  mode: 'mathematics',
  thoughtType: isMathematicsThoughtType(input.thoughtType)
    ? input.thoughtType
    : 'theorem_statement',  // default
  // ...
};
```

**Testing**:
1. TypeScript compilation succeeds
2. Invalid thought types rejected
3. All existing tests pass
4. Add new tests for type guards

**Acceptance Criteria**:
- ✅ <5 'as any' assertions remaining
- ✅ Type guards implemented for all modes
- ✅ Zod schema validation added
- ✅ All tests passing

---

### Task B5: Add Basic Input Sanitization
**Effort**: 2 hours
**Priority**: 🟡 High
**Dependencies**: None
**Files**: `src/tools/thinking.ts`, `src/session/manager.ts`

**Additions**:

1. UUID validation for sessionId:
```typescript
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// In handler functions:
if (input.sessionId && !isValidUUID(input.sessionId)) {
  throw new Error('Invalid session ID format');
}
```

2. Content length limits:
```typescript
const MAX_CONTENT_LENGTH = 50000; // 50k chars

if (input.thought && input.thought.length > MAX_CONTENT_LENGTH) {
  throw new Error(`Content exceeds maximum length of ${MAX_CONTENT_LENGTH} characters`);
}
```

3. Sanitize exports (prevent injection):
```typescript
function sanitizeMarkdown(text: string): string {
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/`/g, '\\`');
}

function sanitizeLaTeX(text: string): string {
  return text
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/{/g, '\\{')
    .replace(/}/g, '\\}');
}
```

4. Node ID validation for graphs:
```typescript
function isValidNodeId(id: string): boolean {
  // Alphanumeric, underscore, hyphen only
  return /^[a-zA-Z0-9_-]+$/.test(id);
}
```

**Acceptance Criteria**:
- ✅ UUID validation for sessionId
- ✅ Content length limits enforced
- ✅ Export sanitization implemented
- ✅ Node ID validation for graphs
- ✅ Tests added for sanitization

---

### Task B6: Verification and Release (v2.5.2)
**Effort**: 0.5 hours
**Priority**: 🟡 High
**Dependencies**: B1-B5
**Files**: `package.json`, `CHANGELOG.md`

**Implementation**:
1. Update version to 2.5.2
2. Add CHANGELOG entry
3. Run benchmarks to verify improvements
4. Build, test, commit, tag, publish

**Acceptance Criteria**:
- ✅ Version 2.5.2 published
- ✅ Performance improvements verified
- ✅ All tests passing

**Total Phase 3.5B Effort**: ~12 hours

---

## Phase 3.5C: Code Quality & Testing (v2.5.3)

### Task C1: Create Tests for index.ts
**Effort**: 8-12 hours
**Priority**: 🟡 High
**Dependencies**: None
**Files**: `tests/unit/server.test.ts` (new)

**Test Coverage Goals**:

1. **createThought() factory function** (30 tests):
   - Test all 13 modes
   - Test required properties validation
   - Test optional properties
   - Test default values
   - Test error cases (missing required fields)

2. **Handler functions** (40 tests):
   - `handleAddThought()`:
     * Success case for each mode
     * Error: session not found
     * Error: validation failure
     * Verify metrics update
   - `handleSummarize()`:
     * Summary generation
     * Error: session not found
   - `handleExport()`:
     * All 8 export formats
     * Visual exports (4 modes × 3 formats)
     * Error: unsupported format
   - `handleSwitchMode()`:
     * Mode switching logic
     * Error: invalid mode
   - `handleGetSession()`:
     * Session retrieval
     * Error: session not found

3. **Edge cases** (15 tests):
   - Empty sessions
   - Sessions at max thoughts
   - Concurrent thought additions
   - Invalid input handling

**Example Test Structure**:
```typescript
describe('createThought', () => {
  describe('Sequential Mode', () => {
    it('should create sequential thought with required fields', () => {
      const input: ThinkingToolInput = {
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
        mode: 'sequential',
      };

      const result = createThought(input);

      expect(result.mode).toBe('sequential');
      expect(result.thought).toBe('Test thought');
      expect(result.thoughtNumber).toBe(1);
      expect(result.id).toBeDefined();
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it('should handle revision fields', () => {
      const input: ThinkingToolInput = {
        thought: 'Revised thought',
        thoughtNumber: 2,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'sequential',
        isRevision: true,
        revisesThought: 'thought-1',
        revisionReason: 'Found better approach',
      };

      const result = createThought(input) as SequentialThought;

      expect(result.isRevision).toBe(true);
      expect(result.revisesThought).toBe('thought-1');
      expect(result.revisionReason).toBe('Found better approach');
    });
  });

  // ... tests for other modes
});

describe('Handler Functions', () => {
  let sessionManager: SessionManager;

  beforeEach(() => {
    sessionManager = new SessionManager();
  });

  describe('handleAddThought', () => {
    it('should add thought to session successfully', async () => {
      const session = sessionManager.createSession();

      const input: ThinkingToolInput = {
        sessionId: session.id,
        action: 'add_thought',
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
      };

      const result = await handleAddThought(sessionManager, input);

      expect(result.sessionId).toBe(session.id);
      expect(result.thoughtId).toBeDefined();
      expect(result.thoughtNumber).toBe(1);
    });

    it('should throw error for non-existent session', async () => {
      const input: ThinkingToolInput = {
        sessionId: 'invalid-uuid',
        action: 'add_thought',
        thought: 'Test',
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
      };

      await expect(handleAddThought(sessionManager, input))
        .rejects.toThrow('Session not found');
    });
  });

  // ... tests for other handlers
});
```

**Acceptance Criteria**:
- ✅ 85+ new tests added
- ✅ index.ts coverage >90%
- ✅ All handler functions tested
- ✅ Error paths covered
- ✅ Edge cases tested

---

### Task C2: Add Integration Tests
**Effort**: 6-8 hours
**Priority**: 🟡 High
**Dependencies**: None
**Files**: `tests/integration/mcp-protocol.test.ts` (new)

**Test Scenarios**:

1. **Full MCP request/response cycle**:
```typescript
describe('MCP Protocol Integration', () => {
  it('should handle complete thinking session via MCP', async () => {
    // 1. Call tool with add_thought
    const addResponse = await callMCPTool('deepthinking', {
      action: 'add_thought',
      thought: 'Analyzing problem',
      thoughtNumber: 1,
      totalThoughts: 2,
      nextThoughtNeeded: true,
      mode: 'sequential',
    });

    expect(addResponse.sessionId).toBeDefined();
    const sessionId = addResponse.sessionId;

    // 2. Add second thought
    const addResponse2 = await callMCPTool('deepthinking', {
      sessionId,
      action: 'add_thought',
      thought: 'Solution found',
      thoughtNumber: 2,
      totalThoughts: 2,
      nextThoughtNeeded: false,
    });

    expect(addResponse2.sessionId).toBe(sessionId);

    // 3. Export session
    const exportResponse = await callMCPTool('deepthinking', {
      sessionId,
      action: 'export',
      exportFormat: 'json',
    });

    expect(exportResponse).toContain('Analyzing problem');
    expect(exportResponse).toContain('Solution found');
  });
});
```

2. **Tool schema validation**
3. **Error propagation**
4. **Multi-session scenarios**
5. **Concurrent requests**

**Acceptance Criteria**:
- ✅ 10+ integration tests
- ✅ MCP protocol compliance verified
- ✅ Multi-session scenarios tested
- ✅ Error propagation working

---

### Task C3: Implement Custom Error Types
**Effort**: 3-4 hours
**Priority**: 🟡 High
**Dependencies**: None
**Files**: `src/errors/index.ts` (new), `src/session/manager.ts`, `src/index.ts`

**Error Types to Create**:

```typescript
// src/errors/index.ts
export class DeepThinkingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DeepThinkingError';
  }
}

export class SessionNotFoundError extends DeepThinkingError {
  constructor(public sessionId: string) {
    super(`Session not found: ${sessionId}`);
    this.name = 'SessionNotFoundError';
  }
}

export class ValidationError extends DeepThinkingError {
  constructor(
    public field: string,
    public value: any,
    public reason: string
  ) {
    super(`Validation failed for ${field}: ${reason}`);
    this.name = 'ValidationError';
  }
}

export class ModeTransitionError extends DeepThinkingError {
  constructor(
    public fromMode: string,
    public toMode: string,
    public reason: string
  ) {
    super(`Cannot switch from ${fromMode} to ${toMode}: ${reason}`);
    this.name = 'ModeTransitionError';
  }
}

export class ThoughtLimitExceededError extends DeepThinkingError {
  constructor(
    public sessionId: string,
    public limit: number
  ) {
    super(`Session ${sessionId} has exceeded thought limit of ${limit}`);
    this.name = 'ThoughtLimitExceededError';
  }
}
```

**Usage in code**:
```typescript
// In SessionManager
public getSession(sessionId: string): ThinkingSession {
  const session = this.activeSessions.get(sessionId);
  if (!session) {
    throw new SessionNotFoundError(sessionId);
  }
  return session;
}

// In validation
if (strength < -1 || strength > 1) {
  throw new ValidationError(
    'causalGraph.edges[].strength',
    strength,
    'Strength must be between -1 and 1'
  );
}
```

**Error Logging**:
```typescript
// In index.ts error handler
} catch (error) {
  if (error instanceof SessionNotFoundError) {
    logger.warn({ sessionId: error.sessionId }, 'Session not found');
  } else if (error instanceof ValidationError) {
    logger.error({ field: error.field, value: error.value }, 'Validation error');
  } else {
    logger.error({ error }, 'Unexpected error');
  }
  throw error;
}
```

**Acceptance Criteria**:
- ✅ 5+ custom error types defined
- ✅ Errors used throughout codebase
- ✅ Error context captured
- ✅ Tests for error scenarios

---

### Task C4: Implement Structured Logging
**Effort**: 3-4 hours
**Priority**: 🟡 High
**Dependencies**: None
**Files**: `src/utils/logger.ts` (new), all handler files

**Implementation**:

1. Install pino: `npm install pino pino-pretty`

2. Create logger utility:
```typescript
// src/utils/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV !== 'production' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname',
    },
  } : undefined,
});

export type Logger = typeof logger;
```

3. Add logging to key operations:
```typescript
// Session creation
logger.info({ sessionId: session.id, mode }, 'Session created');

// Thought addition
logger.debug({ sessionId, thoughtId: thought.id, thoughtNumber }, 'Thought added');

// Mode switch
logger.info({ sessionId, fromMode, toMode }, 'Mode switched');

// Validation errors
logger.warn({ sessionId, thoughtId, errors }, 'Validation failed');

// Performance metrics
logger.debug({ sessionId, duration }, 'Validation completed');
```

4. Add request ID for tracing:
```typescript
function generateRequestId(): string {
  return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// In main handler
const requestId = generateRequestId();
const log = logger.child({ requestId });
log.info({ action: input.action }, 'Request received');
```

**Log Levels**:
- `debug`: Performance metrics, detailed operations
- `info`: Session lifecycle events, mode switches
- `warn`: Validation warnings, recoverable errors
- `error`: Unrecoverable errors, exceptions

**Acceptance Criteria**:
- ✅ Pino logger configured
- ✅ Logging added to all major operations
- ✅ Request IDs for tracing
- ✅ Log levels configurable via env var

---

### Task C5: Verification and Release (v2.5.3)
**Effort**: 1 hour
**Priority**: 🟡 High
**Dependencies**: C1-C4
**Files**: `package.json`, `CHANGELOG.md`

**Verification**:
1. Run full test suite: `npm test`
2. Check coverage: `npm run test:coverage`
3. Verify >90% coverage for index.ts
4. Manual testing of error scenarios
5. Log output verification

**Acceptance Criteria**:
- ✅ 200+ tests passing
- ✅ >90% code coverage
- ✅ v2.5.3 published

**Total Phase 3.5C Effort**: ~25 hours

---

## Phase 3.5D: Performance Optimizations (v2.6.0)

### Task D1: Implement Validation Caching
**Effort**: 8-12 hours
**Priority**: 🟡 Medium
**Dependencies**: None
**Files**: `src/validation/validator.ts`, `src/validation/cache.ts` (new)

**Implementation**:

1. Create validation cache:
```typescript
// src/validation/cache.ts
import crypto from 'crypto';

export class ValidationCache {
  private cache = new Map<string, ValidationResult>();
  private maxSize = 1000;

  generateKey(thought: Thought): string {
    const content = JSON.stringify({
      mode: thought.mode,
      thoughtNumber: thought.thoughtNumber,
      // ... relevant fields only
    });
    return crypto.createHash('md5').update(content).digest('hex');
  }

  get(thought: Thought): ValidationResult | undefined {
    const key = this.generateKey(thought);
    return this.cache.get(key);
  }

  set(thought: Thought, result: ValidationResult): void {
    if (this.cache.size >= this.maxSize) {
      // Remove oldest entry (FIFO)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    const key = this.generateKey(thought);
    this.cache.set(key, result);
  }

  clear(): void {
    this.cache.clear();
  }
}
```

2. Add cache to validator:
```typescript
export class ThoughtValidator {
  private cache = new ValidationCache();
  private cacheEnabled = true;

  validate(thought: Thought): void {
    if (this.cacheEnabled) {
      const cached = this.cache.get(thought);
      if (cached) {
        if (!cached.isValid) {
          throw new Error(cached.errors.join(', '));
        }
        return; // ✅ Cache hit
      }
    }

    // Perform validation
    const errors: string[] = [];
    // ... validation logic

    const result = {
      isValid: errors.length === 0,
      errors,
    };

    if (this.cacheEnabled) {
      this.cache.set(thought, result);
    }

    if (!result.isValid) {
      throw new Error(errors.join(', '));
    }
  }
}
```

3. Add fast-path validation:
```typescript
private shouldUseFastPath(thought: Thought): boolean {
  // Simple thoughts can skip complex validation
  return (
    thought.mode === 'sequential' &&
    !('isRevision' in thought) &&
    !('dependencies' in thought)
  );
}

validate(thought: Thought): void {
  // Fast path for simple thoughts
  if (this.shouldUseFastPath(thought)) {
    this.validateBasicFields(thought);
    return;
  }

  // Full validation for complex thoughts
  // ... with caching
}
```

4. Create benchmark:
```typescript
// tests/performance/validation-benchmark.test.ts
describe('Validation Performance', () => {
  it('should use cache effectively', () => {
    const validator = new ThoughtValidator();
    const thought = createTestCausalThought();

    // First validation (cache miss)
    const start1 = performance.now();
    validator.validate(thought);
    const time1 = performance.now() - start1;

    // Second validation (cache hit)
    const start2 = performance.now();
    validator.validate(thought);
    const time2 = performance.now() - start2;

    // Cache hit should be >5x faster
    expect(time2).toBeLessThan(time1 / 5);
  });
});
```

**Acceptance Criteria**:
- ✅ Validation cache implemented
- ✅ Fast-path for simple thoughts
- ✅ >2x performance improvement
- ✅ Cache hit rate >70% for typical usage
- ✅ All tests passing

---

### Task D2: Implement Session Persistence Layer
**Effort**: 16-24 hours
**Priority**: 🟡 Medium
**Dependencies**: None
**Files**: `src/persistence/` (new directory structure)

**Architecture**:

```
src/persistence/
├── interface.ts          # ISessionStore interface
├── in-memory.ts          # InMemorySessionStore
├── file.ts               # FileSessionStore
├── sqlite.ts             # SQLiteSessionStore (optional)
└── index.ts              # Exports
```

**Implementation**:

1. Define interface:
```typescript
// src/persistence/interface.ts
export interface ISessionStore {
  save(session: ThinkingSession): Promise<void>;
  load(sessionId: string): Promise<ThinkingSession | null>;
  delete(sessionId: string): Promise<void>;
  list(): Promise<string[]>;
  exists(sessionId: string): Promise<boolean>;
}

export interface SessionStoreConfig {
  maxSessions?: number;
  persistencePath?: string;
  autoSave?: boolean;
}
```

2. In-memory implementation (existing):
```typescript
// src/persistence/in-memory.ts
export class InMemorySessionStore implements ISessionStore {
  private sessions = new Map<string, ThinkingSession>();

  async save(session: ThinkingSession): Promise<void> {
    this.sessions.set(session.id, session);
  }

  async load(sessionId: string): Promise<ThinkingSession | null> {
    return this.sessions.get(sessionId) || null;
  }

  async delete(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
  }

  async list(): Promise<string[]> {
    return Array.from(this.sessions.keys());
  }

  async exists(sessionId: string): Promise<boolean> {
    return this.sessions.has(sessionId);
  }
}
```

3. File-based implementation:
```typescript
// src/persistence/file.ts
import fs from 'fs/promises';
import path from 'path';

export class FileSessionStore implements ISessionStore {
  private basePath: string;

  constructor(config: SessionStoreConfig) {
    this.basePath = config.persistencePath || './sessions';
  }

  private getSessionPath(sessionId: string): string {
    return path.join(this.basePath, `${sessionId}.json`);
  }

  async save(session: ThinkingSession): Promise<void> {
    await fs.mkdir(this.basePath, { recursive: true });
    const filePath = this.getSessionPath(session.id);
    const data = JSON.stringify(session, null, 2);
    await fs.writeFile(filePath, data, 'utf-8');
  }

  async load(sessionId: string): Promise<ThinkingSession | null> {
    try {
      const filePath = this.getSessionPath(sessionId);
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  async delete(sessionId: string): Promise<void> {
    const filePath = this.getSessionPath(sessionId);
    await fs.unlink(filePath).catch(() => {});
  }

  async list(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.basePath);
      return files
        .filter(f => f.endsWith('.json'))
        .map(f => f.replace('.json', ''));
    } catch {
      return [];
    }
  }

  async exists(sessionId: string): Promise<boolean> {
    try {
      const filePath = this.getSessionPath(sessionId);
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}
```

4. Update SessionManager to use store:
```typescript
export class SessionManager {
  constructor(
    private store: ISessionStore = new InMemorySessionStore(),
    private validator: ThoughtValidator = new ThoughtValidator()
  ) {}

  async createSession(config?: Partial<SessionConfig>): Promise<ThinkingSession> {
    const session = { /* ... */ };
    await this.store.save(session);
    return session;
  }

  async getSession(sessionId: string): Promise<ThinkingSession> {
    const session = await this.store.load(sessionId);
    if (!session) {
      throw new SessionNotFoundError(sessionId);
    }
    return session;
  }

  async addThought(sessionId: string, thought: Thought): Promise<Thought> {
    const session = await this.getSession(sessionId);
    // ... add thought logic
    await this.store.save(session);  // Auto-save
    return thought;
  }
}
```

5. Add tests:
```typescript
describe('FileSessionStore', () => {
  let store: FileSessionStore;
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sessions-'));
    store = new FileSessionStore({ persistencePath: tempDir });
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true });
  });

  it('should persist session to disk', async () => {
    const session = createTestSession();
    await store.save(session);

    const loaded = await store.load(session.id);
    expect(loaded).toEqual(session);
  });

  it('should survive process restart', async () => {
    const session = createTestSession();
    await store.save(session);

    // Simulate restart - create new store instance
    const newStore = new FileSessionStore({ persistencePath: tempDir });
    const loaded = await newStore.load(session.id);

    expect(loaded).toEqual(session);
  });
});
```

**Acceptance Criteria**:
- ✅ ISessionStore interface defined
- ✅ InMemorySessionStore implemented
- ✅ FileSessionStore implemented
- ✅ SessionManager uses injectable store
- ✅ Sessions persist across restarts
- ✅ Tests for both implementations
- ✅ Migration guide for users

---

### Task D3: Implement LRU Cache for Sessions
**Effort**: 4-6 hours
**Priority**: 🟡 Medium
**Dependencies**: D2
**Files**: `src/persistence/lru-store.ts` (new)

**Implementation**:

```typescript
// src/persistence/lru-store.ts
import LRU from 'lru-cache';

export class LRUSessionStore implements ISessionStore {
  private cache: LRU<string, ThinkingSession>;
  private backingStore: ISessionStore;

  constructor(
    backingStore: ISessionStore,
    options: LRU.Options<string, ThinkingSession>
  ) {
    this.backingStore = backingStore;
    this.cache = new LRU({
      max: options.max || 100,
      maxAge: options.maxAge || 1000 * 60 * 60, // 1 hour
      dispose: async (key, session) => {
        // Persist to backing store when evicted
        await this.backingStore.save(session);
      },
      ...options,
    });
  }

  async save(session: ThinkingSession): Promise<void> {
    this.cache.set(session.id, session);
    // Optionally save to backing store immediately
    await this.backingStore.save(session);
  }

  async load(sessionId: string): Promise<ThinkingSession | null> {
    // Check cache first
    let session = this.cache.get(sessionId);
    if (session) {
      return session;
    }

    // Load from backing store
    session = await this.backingStore.load(sessionId);
    if (session) {
      this.cache.set(sessionId, session);
    }
    return session;
  }

  async delete(sessionId: string): Promise<void> {
    this.cache.delete(sessionId);
    await this.backingStore.delete(sessionId);
  }

  async list(): Promise<string[]> {
    return await this.backingStore.list();
  }

  async exists(sessionId: string): Promise<boolean> {
    return this.cache.has(sessionId) || await this.backingStore.exists(sessionId);
  }
}
```

**Usage**:
```typescript
// Create LRU cache with file backing
const fileStore = new FileSessionStore({ persistencePath: './sessions' });
const lruStore = new LRUSessionStore(fileStore, {
  max: 100,           // Max 100 sessions in memory
  maxAge: 3600000,    // 1 hour TTL
});

const manager = new SessionManager(lruStore);
```

**Acceptance Criteria**:
- ✅ LRU cache implemented
- ✅ Eviction saves to backing store
- ✅ Cache hit/miss metrics
- ✅ Configurable limits
- ✅ Tests for eviction behavior

---

### Task D4: Add Configuration Management
**Effort**: 3-4 hours
**Priority**: 🟡 Medium
**Dependencies**: None
**Files**: `src/config/index.ts` (new)

**Implementation**:

```typescript
// src/config/index.ts
import { z } from 'zod';

const configSchema = z.object({
  maxSessions: z.number().int().positive().default(100),
  maxThoughtsPerSession: z.number().int().positive().default(1000),
  compressionThreshold: z.number().int().positive().default(500),
  persistenceBackend: z.enum(['memory', 'file', 'sqlite']).default('memory'),
  persistencePath: z.string().optional(),
  validationLevel: z.enum(['strict', 'normal', 'minimal']).default('normal'),
  validationCaching: z.boolean().default(true),
  logLevel: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  sessionTTL: z.number().int().positive().default(3600000), // 1 hour
});

export type ServerConfig = z.infer<typeof configSchema>;

export const defaultConfig: ServerConfig = {
  maxSessions: 100,
  maxThoughtsPerSession: 1000,
  compressionThreshold: 500,
  persistenceBackend: 'memory',
  validationLevel: 'normal',
  validationCaching: true,
  logLevel: 'info',
  sessionTTL: 3600000,
};

export function loadConfig(): ServerConfig {
  const envConfig = {
    maxSessions: process.env.MCP_MAX_SESSIONS
      ? parseInt(process.env.MCP_MAX_SESSIONS)
      : undefined,
    maxThoughtsPerSession: process.env.MCP_MAX_THOUGHTS
      ? parseInt(process.env.MCP_MAX_THOUGHTS)
      : undefined,
    persistenceBackend: process.env.MCP_PERSISTENCE as any,
    persistencePath: process.env.MCP_PERSISTENCE_PATH,
    logLevel: process.env.LOG_LEVEL as any,
  };

  // Merge with defaults and validate
  const config = { ...defaultConfig, ...envConfig };
  return configSchema.parse(config);
}
```

**Environment Variables**:
```bash
MCP_MAX_SESSIONS=100
MCP_MAX_THOUGHTS=1000
MCP_PERSISTENCE=file
MCP_PERSISTENCE_PATH=./sessions
LOG_LEVEL=info
```

**Documentation**:
Add to README.md:
```markdown
## Configuration

DeepThinking MCP can be configured via environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `MCP_MAX_SESSIONS` | 100 | Maximum sessions in memory |
| `MCP_MAX_THOUGHTS` | 1000 | Maximum thoughts per session |
| `MCP_PERSISTENCE` | memory | Persistence backend (memory/file/sqlite) |
| `MCP_PERSISTENCE_PATH` | ./sessions | Path for file persistence |
| `LOG_LEVEL` | info | Logging level (debug/info/warn/error) |
```

**Acceptance Criteria**:
- ✅ Configuration schema defined
- ✅ Environment variable support
- ✅ Validation with Zod
- ✅ Documentation added
- ✅ Tests for config loading

---

### Task D5: Graph Algorithm Optimization
**Effort**: 4-6 hours
**Priority**: 🟢 Low
**Dependencies**: D1 (validation caching)
**Files**: `src/validation/validator.ts`

**Implementation**:

1. Cache cycle detection results:
```typescript
private cycleDetectionCache = new Map<string, boolean>();

private detectCausalCycle(graph: CausalGraph): boolean {
  const graphHash = this.hashGraph(graph);

  if (this.cycleDetectionCache.has(graphHash)) {
    return this.cycleDetectionCache.get(graphHash)!;
  }

  const hasCycle = this.performCycleDetection(graph);
  this.cycleDetectionCache.set(graphHash, hasCycle);
  return hasCycle;
}

private hashGraph(graph: CausalGraph): string {
  const edgeString = graph.edges
    .map(e => `${e.from}->${e.to}`)
    .sort()
    .join(',');
  return edgeString;
}
```

2. Incremental cycle detection:
```typescript
private detectCycleIncremental(
  graph: CausalGraph,
  newEdge: CausalEdge
): boolean {
  // Only check if new edge creates cycle
  // Much faster than full graph check
  return this.pathExists(graph, newEdge.to, newEdge.from);
}

private pathExists(
  graph: CausalGraph,
  from: string,
  to: string
): boolean {
  const visited = new Set<string>();
  const queue = [from];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === to) return true;
    if (visited.has(current)) continue;

    visited.add(current);
    const outgoing = graph.edges.filter(e => e.from === current);
    queue.push(...outgoing.map(e => e.to));
  }

  return false;
}
```

**Acceptance Criteria**:
- ✅ Cycle detection cached
- ✅ Incremental detection for new edges
- ✅ >5x faster for repeated validations
- ✅ All tests passing

---

### Task D6: Verification and Release (v2.6.0)
**Effort**: 2-3 hours
**Priority**: 🟡 Medium
**Dependencies**: D1-D5
**Files**: `package.json`, `CHANGELOG.md`

**Verification**:
1. Performance benchmarks
2. Load testing with 10,000 thoughts
3. Persistence testing (restart scenarios)
4. Memory usage profiling
5. Configuration testing

**CHANGELOG Entry**:
```markdown
## [2.6.0] - 2025-11-XX

### Added
- Session persistence layer with pluggable backends (memory, file, SQLite)
- LRU cache for bounded memory usage
- Validation result caching for 2-5x performance improvement
- Configuration management system with environment variables
- Graph algorithm optimizations

### Performance
- Validation: 2-5x faster with caching
- Memory: Bounded via LRU cache
- Sessions: Persist across server restarts

### Configuration
- New environment variables for customization
- See README for configuration options
```

**Acceptance Criteria**:
- ✅ v2.6.0 published
- ✅ Performance improvements verified
- ✅ Documentation updated
- ✅ Migration guide provided

**Total Phase 3.5D Effort**: ~50 hours

---

## Phase 3.5E: Architecture Improvements (Future)

_Tasks for Phase 3.5E are documented but not required for immediate releases._

**Key Tasks**:
- E1: Modularize validator (16-24 hours)
- E2: Dependency injection (8-12 hours)
- E3: Event system (6-8 hours)
- E4: CI/CD pipeline (4-6 hours)
- E5: API documentation (8-12 hours)
- E6: Architecture docs (6-8 hours)

**Total Phase 3.5E Effort**: ~60 hours

---

## Summary

### Total Effort Estimates

| Phase | Effort | Priority | Release |
|-------|--------|----------|---------|
| 3.5A | 1 hour | 🔴 Critical | v2.5.1 |
| 3.5B | 12 hours | 🟡 High | v2.5.2 |
| 3.5C | 25 hours | 🟡 High | v2.5.3 |
| 3.5D | 50 hours | 🟡 Medium | v2.6.0 |
| 3.5E | 60 hours | 🟢 Low | v2.7.0+ |

**Total**: ~148 hours across all phases

### Implementation Order

1. **Immediate** (v2.5.1): Phase 3.5A - Critical bug fixes
2. **Week 1** (v2.5.2): Phase 3.5B - Quick wins
3. **Week 2-3** (v2.5.3): Phase 3.5C - Code quality & testing
4. **Week 4-6** (v2.6.0): Phase 3.5D - Performance optimizations
5. **Future** (v2.7.0+): Phase 3.5E - Architecture improvements

### Success Metrics

- ✅ All critical bugs fixed
- ✅ 200+ tests passing
- ✅ >90% code coverage
- ✅ 2-5x performance improvement
- ✅ Sessions persist across restarts
- ✅ Configurable deployment options
- ✅ Production-grade logging
- ✅ Comprehensive documentation

---

**Document Maintained By**: Development Team
**Last Updated**: 2025-11-16
**Next Review**: After each phase completion
