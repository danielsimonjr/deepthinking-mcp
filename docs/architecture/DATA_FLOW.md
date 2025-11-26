# Data Flow Architecture

**Version**: 4.3.0 | **Last Updated**: 2025-11-26

## Overview

This document describes how data flows through the DeepThinking MCP system, from client requests to persistence and back.

## Request/Response Flow

### MCP Protocol Layer

```
┌─────────┐                    ┌──────────────┐
│ Claude  │◄──────JSON-RPC────►│  MCP Server  │
│ Client  │                    │  (index.ts)  │
└─────────┘                    └──────┬───────┘
                                      │
                    ┌─────────────────┴─────────────────┐
                    │  Tool Request Routing             │
                    │  • add_thought                    │
                    │  • create_session                 │
                    │  • export_session                 │
                    │  • switch_mode                    │
                    │  • get_summary                    │
                    │  • get_recommendations            │
                    └───────────────────────────────────┘
```

### Request Processing Pipeline

```
1. JSON-RPC Request
   ↓
2. Protocol Parsing (MCP)
   ↓
3. Tool Identification
   ↓
4. Input Validation (Zod)
   ↓
5. Sanitization (Security)
   ↓
6. Handler Execution
   ↓
7. Business Logic (Services)
   ↓
8. State Management (SessionManager)
   ↓
9. Persistence (Repository)
   ↓
10. Response Formation
   ↓
11. JSON-RPC Response
```

---

## Data Flow by Operation

### 1. Session Creation

```
Client                    Server                    Storage
  │                         │                         │
  ├─ create_session ────────►                        │
  │   {                     │                         │
  │     title: "Problem",   │                         │
  │     mode: "sequential"  │                         │
  │   }                     │                         │
  │                         │                         │
  │                         ├─ validateInput()       │
  │                         │  (Zod schema)           │
  │                         │                         │
  │                         ├─ SessionManager        │
  │                         │   .createSession()      │
  │                         │   │                     │
  │                         │   ├─ Generate UUID      │
  │                         │   ├─ MetricsCalculator  │
  │                         │   │   .initialize()     │
  │                         │   └─ Build session      │
  │                         │                         │
  │                         ├─────────────────────────►
  │                         │   Repository.save()     │
  │                         │                         │
  │                         │◄─────────────────────────
  │                         │   Saved successfully    │
  │                         │                         │
  │◄────────────────────────┤                         │
  │  {                      │                         │
  │    id: "uuid-1234",     │                         │
  │    title: "Problem",    │                         │
  │    mode: "sequential",  │                         │
  │    thoughts: [],        │                         │
  │    metrics: {...}       │                         │
  │  }                      │                         │
```

**Key Steps**:
1. Client sends session creation request
2. Server validates input with CreateSessionSchema
3. SessionManager generates UUID and initializes session
4. SessionMetricsCalculator creates initial metrics
5. Repository persists session to storage
6. Response contains complete session object

**Data Transformations**:
- Input: Simple request parameters
- Processing: Rich session object with defaults
- Output: Complete ThinkingSession with metadata

---

### 2. Adding a Thought

```
Client                    Server                    Storage
  │                         │                         │
  ├─ add_thought ───────────►                        │
  │   {                     │                         │
  │     sessionId: "uuid",  │                         │
  │     thought: "First",   │                         │
  │     mode: "sequential", │                         │
  │     thoughtNumber: 1    │                         │
  │   }                     │                         │
  │                         │                         │
  │                         ├─ validateInput()       │
  │                         │  (AddThoughtSchema)     │
  │                         │                         │
  │                         ├─ ThoughtFactory        │
  │                         │   .createThought()      │
  │                         │   │                     │
  │                         │   ├─ baseThought {}     │
  │                         │   ├─ mode-specific      │
  │                         │   │   fields            │
  │                         │   └─ return Thought     │
  │                         │                         │
  │                         ├─ SessionManager        │
  │                         │   .addThought()         │
  │                         │   │                     │
  │                         │   ├─ getSession()       │
  │                         │   ├─ thoughts.push()    │
  │                         │   ├─ updateState()      │
  │                         │   └─ MetricsCalculator  │
  │                         │       .update()         │
  │                         │                         │
  │                         ├─────────────────────────►
  │                         │   Repository.save()     │
  │                         │                         │
  │                         │◄─────────────────────────
  │                         │                         │
  │                         ├─ SearchEngine          │
  │                         │   .updateSession()      │
  │                         │   (update index)        │
  │                         │                         │
  │◄────────────────────────┤                         │
  │  {                      │                         │
  │    id: "uuid",          │                         │
  │    thoughts: [          │                         │
  │      {thought1}         │                         │
  │    ],                   │                         │
  │    currentThoughtNumber: 1,                       │
  │    metrics: {updated}   │                         │
  │  }                      │                         │
```

**Key Steps**:
1. Client sends thought with session ID
2. Server validates with AddThoughtSchema
3. ThoughtFactory creates mode-specific thought object
4. SessionManager adds thought to session
5. SessionMetricsCalculator updates metrics incrementally (O(1))
6. Repository persists updated session
7. SearchEngine reindexes session for search
8. Response contains updated session

**Data Transformations**:
- Input: Flat thought parameters
- ThoughtFactory: Rich Thought object with mode-specific fields
- SessionManager: Updated session state
- Metrics: Incremental calculations (avg uncertainty, etc.)
- Output: Complete updated session

**Performance**:
- O(1) thought addition
- O(1) metrics update (incremental)
- O(n) search reindexing (n = thoughts in session)

---

### 3. Mode Switching

```
Client                    Server                    Storage
  │                         │                         │
  ├─ switch_mode ───────────►                        │
  │   {                     │                         │
  │     sessionId: "uuid",  │                         │
  │     newMode: "shannon", │                         │
  │     reason: "need      │                         │
  │       systematic"       │                         │
  │   }                     │                         │
  │                         │                         │
  │                         ├─ ModeRouter            │
  │                         │   .switchMode()         │
  │                         │   │                     │
  │                         │   └─ SessionManager     │
  │                         │       .switchMode()     │
  │                         │       │                 │
  │                         │       ├─ Validate       │
  │                         │       │   transition    │
  │                         │       ├─ Update mode    │
  │                         │       ├─ Update config  │
  │                         │       └─ Record reason  │
  │                         │                         │
  │                         ├─────────────────────────►
  │                         │   Repository.save()     │
  │                         │                         │
  │◄────────────────────────┤                         │
  │  {                      │                         │
  │    id: "uuid",          │                         │
  │    mode: "shannon",     │                         │
  │    config: {            │                         │
  │      modeConfig: {      │                         │
  │        mode: "shannon"  │                         │
  │      }                  │                         │
  │    }                    │                         │
  │  }                      │                         │
```

**Key Steps**:
1. Client requests mode switch
2. ModeRouter validates transition
3. SessionManager updates mode and config
4. Mode switch reason recorded in session history
5. Repository persists changes
6. Response confirms new mode

**Data Transformations**:
- session.mode: old → new mode
- session.config.modeConfig: updated for new mode
- Metadata: mode switch event recorded

---

### 4. Session Export

```
Client                    Server                    Storage
  │                         │                         │
  ├─ export_session ────────►                        │
  │   {                     │                         │
  │     sessionId: "uuid",  │                         │
  │     format: "markdown"  │                         │
  │   }                     │                         │
  │                         │                         │
  │                         ├─ SessionManager        │
  │                         │   .getSession()         │
  │                         │                         │
  │                         ├◄────────────────────────┤
  │                         │   session data          │
  │                         │                         │
  │                         ├─ ExportService         │
  │                         │   .exportSession()      │
  │                         │   │                     │
  │                         │   ├─ Format switch      │
  │                         │   ├─ Transform data     │
  │                         │   ├─ Add metadata       │
  │                         │   ├─ Format thoughts    │
  │                         │   └─ Generate output    │
  │                         │                         │
  │◄────────────────────────┤                         │
  │  # Session: Problem     │                         │
  │                         │                         │
  │  ## Metadata            │                         │
  │  - Mode: sequential     │                         │
  │  - Thoughts: 5          │                         │
  │                         │                         │
  │  ## Thoughts            │                         │
  │  1. First thought...    │                         │
  │  2. Second thought...   │                         │
```

**Key Steps**:
1. Client requests export in specific format
2. SessionManager retrieves session from storage/cache
3. ExportService transforms to requested format
4. Response contains formatted output

**Supported Formats & Transformations**:

| Format | Output | Use Case |
|--------|---------|----------|
| JSON | `{"id": "...", "thoughts": [...]}` | API integration, backup |
| Markdown | `# Session\n## Thoughts\n...` | Documentation, sharing |
| LaTeX | `\documentclass{article}...` | Academic papers |
| HTML | `<html><body>...</body></html>` | Web display |
| Jupyter | `{"cells": [...], "nbformat": 4}` | Interactive analysis |
| Mermaid | `graph TD; A-->B;` | Visual diagrams |
| DOT | `digraph G { A -> B; }` | GraphViz |
| ASCII | `├── Thought 1\n└── Thought 2` | Terminal display |

**No Storage Write**: Export is read-only operation

---

### 5. Search

```
Client                    Server                    Memory
  │                         │                         │
  ├─ (separate API) ────────►                        │
  │   {                     │                         │
  │     query: "quantum",   │                         │
  │     modes: ["physics"], │                         │
  │     limit: 10           │                         │
  │   }                     │                         │
  │                         │                         │
  │                         ├─ SearchEngine          │
  │                         │   .search()             │
  │                         │   │                     │
  │                         │   ├─ Normalize query    │
  │                         │   ├─ Text search        │
  │                         │   │   (inverted index)  │
  │                         │   ├─ Mode filter        │
  │                         │   ├─ Date filter        │
  │                         │   ├─ Score results      │
  │                         │   │   (TF-IDF)          │
  │                         │   ├─ Sort by relevance  │
  │                         │   └─ Paginate           │
  │                         │                         │
  │◄────────────────────────┤                         │
  │  {                      │                         │
  │    sessions: [          │                         │
  │      {session1},        │                         │
  │      {session2}         │                         │
  │    ],                   │                         │
  │    total: 2,            │                         │
  │    hasMore: false       │                         │
  │  }                      │                         │
```

**Search Pipeline**:
1. **Query Normalization**: Convert alias fields (query→text, mode→modes)
2. **Text Processing**: Tokenize, stem, lowercase
3. **Index Lookup**: Check inverted index for matching sessions
4. **Filtering**: Apply mode, date, taxonomy, author filters
5. **Scoring**: Calculate relevance using TF-IDF
6. **Sorting**: Order by relevance, date, or title
7. **Pagination**: Apply offset and limit
8. **Facets** (optional): Aggregate counts by mode, author, domain

**Performance**:
- O(log n) text search (inverted index)
- O(1) for each filter (attribute indexes)
- O(k log k) sorting (k = result count)
- O(1) pagination

**Memory**: All search data kept in memory for speed

---

### 6. Batch Processing

```
Client                    Server                    Jobs Queue
  │                         │                         │
  ├─ (submit batch) ────────►                        │
  │   {                     │                         │
  │     type: "export",     │                         │
  │     sessionIds: [       │                         │
  │       "s1", "s2", "s3"  │                         │
  │     ],                  │                         │
  │     format: "json"      │                         │
  │   }                     │                         │
  │                         │                         │
  │                         ├─ BatchProcessor        │
  │                         │   .createJob()          │
  │                         │   │                     │
  │                         │   ├─ Generate job ID    │
  │                         │   ├─ Create BatchJob    │
  │                         │   │   {status:pending}  │
  │                         │   └─ Queue job          │
  │                         │                         │
  │                         ├─────────────────────────►
  │                         │   queue.push(jobId)     │
  │                         │                         │
  │◄────────────────────────┤                         │
  │  {                      │                         │
  │    jobId: "job-123"     │                         │
  │  }                      │                         │
  │                         │                         │
  │                         ├─ processQueue()        │
  │                         │   (async background)    │
  │                         │   │                     │
  │                         │   ├─ Check capacity     │
  │                         │   ├─ Start job          │
  │                         │   │   status: running   │
  │                         │   ├─ Execute operations │
  │                         │   ├─ Update progress    │
  │                         │   │   (onProgress)      │
  │                         │   └─ Complete job       │
  │                         │       status: completed │
  │                         │                         │
  ├─ (poll status) ─────────►                        │
  │   { jobId: "job-123" }  │                         │
  │                         │                         │
  │                         ├─ BatchProcessor        │
  │                         │   .getJob()             │
  │                         │                         │
  │◄────────────────────────┤                         │
  │  {                      │                         │
  │    id: "job-123",       │                         │
  │    status: "running",   │                         │
  │    progress: 66,        │                         │
  │    processedItems: 2,   │                         │
  │    totalItems: 3        │                         │
  │  }                      │                         │
```

**Batch Job Lifecycle**:
1. **Creation**: Job created with status="pending"
2. **Queuing**: Added to FIFO queue
3. **Scheduling**: Auto-start if capacity available
4. **Execution**: Status="running", process items sequentially
5. **Progress**: Update after each item, call progress callback
6. **Completion**: Status="completed" or "failed"

**Concurrency Control**:
- Max concurrent jobs (default: 3)
- Queue depth unlimited
- Fair scheduling (FIFO)

**Progress Tracking**:
```typescript
{
  processedItems: 2,
  totalItems: 10,
  progress: 20, // percentage
  failedItems: 0,
  errors: []
}
```

---

### 7. Backup & Restore

#### Backup Creation

```
Client              Server              Backup Manager        Storage Provider
  │                   │                       │                      │
  ├─ create_backup ───►                      │                      │
  │  {                │                       │                      │
  │    sessions: [...],                      │                      │
  │    compression: "gzip",                  │                      │
  │    provider: "s3"                        │                      │
  │  }                │                       │                      │
  │                   │                       │                      │
  │                   ├─ BackupManager       │                      │
  │                   │   .create()           │                      │
  │                   │   │                   │                      │
  │                   │   ├─ Serialize        │                      │
  │                   │   │   JSON.stringify  │                      │
  │                   │   │                   │                      │
  │                   │   ├─ Compress         │                      │
  │                   │   │   gzip(data)      │                      │
  │                   │   │   60% reduction   │                      │
  │                   │   │                   │                      │
  │                   │   ├─ Encrypt          │                      │
  │                   │   │   (optional)      │                      │
  │                   │   │                   │                      │
  │                   │   ├─ Checksum         │                      │
  │                   │   │   SHA256          │                      │
  │                   │   │                   │                      │
  │                   │   ├─ Create manifest  │                      │
  │                   │   │   {version,       │                      │
  │                   │   │    checksum,      │                      │
  │                   │   │    metadata}      │                      │
  │                   │   │                   │                      │
  │                   │   └─────────────────────────────────►        │
  │                   │       Provider.save()                        │
  │                   │       (backupId, compressed, manifest)       │
  │                   │                                               │
  │                   │   ◄─────────────────────────────────────────┤
  │                   │       location: "s3://bucket/backup-123"     │
  │                   │                       │                      │
  │◄──────────────────┤                       │                      │
  │  {                │                       │                      │
  │    backupId: "...",                       │                      │
  │    location: "...",                       │                      │
  │    size: 1024KB,                          │                      │
  │    compressedSize: 400KB,                 │                      │
  │    checksum: "abc123...",                 │                      │
  │    sessionCount: 10                       │                      │
  │  }                │                       │                      │
```

#### Restore

```
Client              Server              Backup Manager        Storage Provider
  │                   │                       │                      │
  ├─ restore_backup ──►                      │                      │
  │  {                │                       │                      │
  │    backupId: "...",                      │                      │
  │    provider: "s3",                       │                      │
  │    validation: {                         │                      │
  │      verifyChecksum: true                │                      │
  │    }               │                       │                      │
  │  }                │                       │                      │
  │                   │                       │                      │
  │                   ├─ BackupManager       │                      │
  │                   │   .restore()          │                      │
  │                   │   │                   │                      │
  │                   │   ├─────────────────────────────────►        │
  │                   │   │   Provider.load()                        │
  │                   │   │                   │                      │
  │                   │   ◄─────────────────────────────────────────┤
  │                   │   │   {data, manifest}                       │
  │                   │   │                   │                      │
  │                   │   ├─ Verify checksum  │                      │
  │                   │   │   SHA256(data)    │                      │
  │                   │   │   == manifest.checksum                   │
  │                   │   │                   │                      │
  │                   │   ├─ Decrypt          │                      │
  │                   │   │   (if encrypted)  │                      │
  │                   │   │                   │                      │
  │                   │   ├─ Decompress       │                      │
  │                   │   │   gunzip(data)    │                      │
  │                   │   │                   │                      │
  │                   │   ├─ Parse JSON       │                      │
  │                   │   │   sessions[]      │                      │
  │                   │   │                   │                      │
  │                   │   └─ Apply filters    │                      │
  │                   │       (optional)      │                      │
  │                   │                       │                      │
  │◄──────────────────┤                       │                      │
  │  {                │                       │                      │
  │    restoreId: "...",                      │                      │
  │    status: "success",                     │                      │
  │    sessionsRestored: 10,                  │                      │
  │    thoughtsRestored: 50                   │                      │
  │  }                │                       │                      │
```

**Data Transformations**:

**Backup Path**:
1. Sessions[] → JSON string
2. JSON → Compressed buffer (60-80% reduction)
3. Buffer → Encrypted buffer (optional)
4. Buffer + Manifest → Stored backup

**Restore Path**:
1. Stored backup → Encrypted buffer
2. Buffer → Decompressed buffer
3. Buffer → JSON string
4. JSON → Sessions[]
5. Sessions[] → Filtered (if specified)

---

## State Management

### Session State Lifecycle

```
┌──────────────┐
│   Created    │ ← createSession()
│   (pending)  │
└──────┬───────┘
       │ addThought()
       ▼
┌──────────────┐
│  In Progress │ ← thoughts being added
│   (active)   │   nextThoughtNeeded: true
└──────┬───────┘
       │ addThought(nextThoughtNeeded: false)
       ▼
┌──────────────┐
│   Complete   │ ← isComplete: true
│  (finished)  │
└──────┬───────┘
       │ Optional: reopen, export, backup
       ▼
┌──────────────┐
│   Archived   │ ← Removed from active cache
│  (stored)    │   Still in persistent storage
└──────────────┘
```

### Metrics Evolution

```typescript
// Initial state (after createSession)
{
  totalThoughts: 0,
  thoughtsByType: {},
  averageUncertainty: 0,
  revisionCount: 0,
  timeSpent: 0,
  dependencyDepth: 0
}

// After first thought
{
  totalThoughts: 1,
  thoughtsByType: { "sequential": 1 },
  averageUncertainty: 0,
  revisionCount: 0,
  timeSpent: 120, // seconds
  dependencyDepth: 0
}

// After revision
{
  totalThoughts: 2,
  thoughtsByType: { "sequential": 2 },
  averageUncertainty: 0,
  revisionCount: 1,  // ← incremented
  timeSpent: 300,
  dependencyDepth: 1  // ← updated
}

// With Shannon thought (uncertainty tracking)
{
  totalThoughts: 3,
  thoughtsByType: { "sequential": 2, "shannon": 1 },
  averageUncertainty: 0.25,  // ← O(1) incremental avg
  revisionCount: 1,
  timeSpent: 450,
  dependencyDepth: 1
}
```

**Incremental Updates** (O(1)):
```typescript
// Instead of recalculating from all thoughts (O(n))
const sum = thoughts.reduce((acc, t) => acc + t.uncertainty, 0);
const avg = sum / thoughts.length;

// We maintain running sums (O(1))
metrics._uncertaintySum += newThought.uncertainty;
metrics._uncertaintyCount += 1;
metrics.averageUncertainty = metrics._uncertaintySum / metrics._uncertaintyCount;
```

---

## Caching Strategy

### LRU Cache for Active Sessions

```
Memory (Fast)                      Storage (Slow)
┌──────────────────┐              ┌──────────────────┐
│   LRU Cache      │              │  FileSystem      │
│  (100 sessions)  │              │  (Unlimited)     │
│                  │              │                  │
│  Most Recent ──┐ │              │                  │
│  [session-1  ] │ │              │                  │
│  [session-2  ] │ │              │                  │
│  [session-3  ] │ │              │                  │
│  ...           │ │              │  [session-101]   │
│  [session-99 ] │ │              │  [session-102]   │
│  [session-100] │◄┼──evict──────┼► [session-103]   │
│  Least Recent ─┘ │              │  ...             │
│                  │              │                  │
└──────────────────┘              └──────────────────┘
```

**Cache Operations**:

**Read (getSession)**:
```
1. Check LRU cache
   ├─ Hit: Return session (O(1)), move to front
   └─ Miss: Load from storage (O(1) file read)
       ├─ Add to cache
       ├─ Evict LRU if full
       └─ Return session
```

**Write (addThought, switchMode)**:
```
1. Update session in cache (O(1))
2. Mark as dirty
3. Async persist to storage
4. Move to front of LRU
```

**Benefits**:
- O(1) access for active sessions
- Automatic memory management
- Transparent to client

---

## Data Persistence

### File Structure

```
.deepthinking-sessions/
├── sessions/
│   ├── session-uuid-1.json
│   ├── session-uuid-2.json
│   └── session-uuid-3.json
├── metadata/
│   └── sessions.json  (index of all sessions)
└── backups/
    ├── backup-2025-11-25.tar.gz
    └── backup-2025-11-24.tar.gz
```

### Session File Format

```json
{
  "id": "uuid-1234",
  "title": "Problem Analysis",
  "mode": "sequential",
  "thoughts": [
    {
      "id": "thought-1",
      "sessionId": "uuid-1234",
      "mode": "sequential",
      "thoughtNumber": 1,
      "totalThoughts": 3,
      "content": "First thought...",
      "timestamp": "2025-11-25T10:00:00Z",
      "nextThoughtNeeded": true
    }
  ],
  "createdAt": "2025-11-25T10:00:00Z",
  "updatedAt": "2025-11-25T10:05:00Z",
  "metrics": {
    "totalThoughts": 1,
    "thoughtsByType": { "sequential": 1 },
    "averageUncertainty": 0
  },
  "config": {
    "modeConfig": {
      "mode": "sequential",
      "strictValidation": false
    },
    "enableAutoSave": true
  }
}
```

**Persistence Guarantees**:
- Atomic writes (write to temp → rename)
- Crash recovery (sessions in cache marked dirty)
- No data loss (synchronous critical operations)

---

## Error Flow

### Error Propagation

```
Component Error
    ↓
Try/Catch Block
    ↓
Custom Error Type
    ↓
Error Handler
    ↓
Logger.error()
    ↓
Sanitized Response
    ↓
Client
```

### Example: Session Not Found

```
Client Request
    ↓
SessionManager.getSession("invalid-id")
    ↓
Session not in cache
    ↓
Repository.findById("invalid-id")
    ↓
File not found
    ↓
return null
    ↓
throw new SessionNotFoundError("Session not found: invalid-id")
    ↓
Handler catches error
    ↓
Log sanitized error (no sensitive data)
    ↓
Return error response to client
{
  error: {
    code: "SESSION_NOT_FOUND",
    message: "Session not found: invalid-id"
  }
}
```

**Error Types**:
- `SessionNotFoundError` → HTTP 404
- `ValidationError` → HTTP 400
- `InvalidThoughtError` → HTTP 400
- Generic `Error` → HTTP 500

---

## Performance Optimization

### Key Optimizations

1. **LRU Cache**: O(1) session access for hot data
2. **Incremental Metrics**: O(1) updates vs O(n) recalculation
3. **Inverted Index**: O(log n) search vs O(n) scan
4. **Async Persistence**: Non-blocking saves
5. **Lazy Loading**: Only load what's needed
6. **Batch Processing**: Amortize overhead across items

### Bottlenecks & Solutions

| Bottleneck | Impact | Solution |
|------------|--------|----------|
| Large sessions | Memory | Compression, lazy thought loading |
| Many sessions | Memory | LRU eviction, pagination |
| Search | CPU | Inverted index, filters before search |
| Export | CPU | Stream large exports, worker threads |
| Storage I/O | Latency | Async writes, write coalescing |

---

## Security & Privacy

### Data Sanitization Pipeline

```
User Input
    ↓
Zod Validation (type safety)
    ↓
Sanitization (security)
    ├─ File paths: Remove traversal attempts
    ├─ Session IDs: Validate UUID format
    └─ Content: Length limits
    ↓
Business Logic
    ↓
Logging
    ├─ PII Redaction
    │   • author → [REDACTED]
    │   • email → [REDACTED]
    │   • IP → [REDACTED]
    ├─ Content Truncation (max 100 chars)
    └─ Safe logging
    ↓
Storage
    ├─ Path Validation (within allowed dir)
    └─ Safe File Operations
```

---

*Last Updated*: 2025-11-26
*Data Flow Version*: 4.3.0
