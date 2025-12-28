# Phase 5: Core Mode Restructuring (v5.0.0)

## Executive Summary

**Goal**: Restructure deepthinking modes to create a logical foundation where "core" means fundamental reasoning types.

**Changes**:
1. Rename `deepthinking_core` → `deepthinking_standard` (sequential, shannon, hybrid)
2. Create NEW `deepthinking_core` (inductive, deductive, abductive)
3. Move abductive mode from `deepthinking_causal` to new `deepthinking_core`

**Approach**: Direct implementation with proper testing - no beta versions needed
- **Sprint 1**: Rename core → standard (all files, validators, tests, scaffolding)
- **Sprint 2**: Create new core mode (clone existing mode, adapt for inductive/deductive/abductive)
- **Sprint 3**: Final testing, documentation, and v5.0.0 release

**Total Effort**: 40-60 developer hours across 3 sprints

---

## Sprint Structure

### Sprint 1: Rename Core to Standard Mode (Week 1)
**Effort**: 12-16 hours | **Result**: All "core" references become "standard"

**Tasks**:
1. Update `src/tools/json-schemas.ts` - Rename `deepthinking_core_schema` to `deepthinking_standard_schema`
2. Update `src/tools/definitions.ts` - Change tool name from `deepthinking_core` to `deepthinking_standard`
3. Update `src/tools/definitions.ts` - Update `modeToToolMap` routing: sequential/shannon/hybrid → `deepthinking_standard`
4. Verify no validators need renaming (sequential, shannon, hybrid validators stay as-is)
5. Update all tests that reference `deepthinking_core` tool to use `deepthinking_standard`
6. Update export services if they reference core tool name
7. Run typecheck - verify no errors
8. Run full test suite - all tests must pass
9. Update memory with Sprint 1 completion

**Success Criteria**:
- ✅ All references to old `deepthinking_core` tool are now `deepthinking_standard`
- ✅ Sequential, shannon, hybrid modes route to `deepthinking_standard`
- ✅ All 744+ tests passing
- ✅ Zero breaking changes for existing modes

**Files Modified**:
- `src/tools/json-schemas.ts`
- `src/tools/definitions.ts`
- `tests/**/*.test.ts` (update tool name references)
- Possibly `src/export/*.ts` (if tool names referenced)

---

### Sprint 2: Create New Core Mode (Week 1-2)
**Effort**: 16-24 hours | **Result**: New deepthinking_core with inductive/deductive/abductive

**Tasks**:
1. Create `src/types/modes/inductive.ts` - Clone from causal.ts structure, adapt for inductive reasoning
2. Create `src/types/modes/deductive.ts` - Clone from causal.ts structure, adapt for deductive reasoning
3. Update `src/types/core.ts` - Add INDUCTIVE, DEDUCTIVE to ThinkingMode enum
4. Update `src/types/core.ts` - Add InductiveThought, DeductiveThought to Thought union type
5. Update `src/types/core.ts` - Add type guards `isInductiveThought()`, `isDeductiveThought()`
6. Create `src/validation/validators/modes/inductive.ts` - Clone existing validator, adapt rules
7. Create `src/validation/validators/modes/deductive.ts` - Clone existing validator, adapt rules
8. Update `src/validation/validator.ts` - Register new validators
9. Create `src/tools/json-schemas.ts` - Add NEW `deepthinking_core_schema` (inductive/deductive/abductive)
10. Update `src/tools/json-schemas.ts` - Remove abductive from `deepthinking_causal_schema`
11. Update `src/tools/definitions.ts` - Add `deepthinking_core` tool, route inductive/deductive/abductive to it
12. Update `src/services/ThoughtFactory.ts` - Add cases for inductive and deductive modes
13. Create `src/validation/schemas.ts` - Add InductiveSchema and DeductiveSchema (Zod)
14. Update `src/types/core.ts` - Move INDUCTIVE, DEDUCTIVE to FULLY_IMPLEMENTED_MODES
15. Run typecheck - verify no errors
16. Run full test suite - all tests must pass

**Success Criteria**:
- ✅ New `deepthinking_core` tool exists with 3 modes: inductive, deductive, abductive
- ✅ Abductive moved from causal tool to core tool
- ✅ Type system, validators, schemas all in place
- ✅ ThoughtFactory creates correct thought types
- ✅ All tests passing

**Files Created**:
- `src/types/modes/inductive.ts`
- `src/types/modes/deductive.ts`
- `src/validation/validators/modes/inductive.ts`
- `src/validation/validators/modes/deductive.ts`

**Files Modified**:
- `src/types/core.ts`
- `src/tools/json-schemas.ts`
- `src/tools/definitions.ts`
- `src/services/ThoughtFactory.ts`
- `src/validation/validator.ts`
- `src/validation/schemas.ts`

---

### Sprint 3: Testing, Documentation & Release v5.0.0 (Week 2-3)
**Effort**: 12-20 hours | **Result**: Production-ready v5.0.0 release

**Tasks**:
1. Create unit tests for inductive mode - `tests/unit/validation/validators/inductive.test.ts`
2. Create unit tests for deductive mode - `tests/unit/validation/validators/deductive.test.ts`
3. Create integration test for standard mode - verify sequential/shannon/hybrid work
4. Create integration test for new core mode - verify inductive/deductive/abductive work
5. Update `src/export/markdown.ts` - Add formatting for inductive/deductive modes
6. Create `docs/migration/v5.0-core-restructure.md` - Migration guide (~500 lines)
7. Update `README.md` - Update modes section with new structure
8. Update `CHANGELOG.md` - Add v5.0.0 entry with breaking changes
9. Update `CLAUDE.md` - Update architecture notes
10. Run full test suite 5 times - all must pass
11. Build and verify dist/ output
12. Commit and tag v5.0.0 release

**Success Criteria**:
- ✅ Comprehensive test coverage for new modes
- ✅ Migration guide complete and clear
- ✅ All documentation updated
- ✅ All 744+ tests passing consistently
- ✅ Ready for npm publish

**Files Created**:
- `tests/unit/validation/validators/inductive.test.ts`
- `tests/unit/validation/validators/deductive.test.ts`
- `tests/integration/standard-mode.test.ts`
- `tests/integration/new-core-mode.test.ts`
- `docs/migration/v5.0-core-restructure.md`

**Files Modified**:
- `src/export/markdown.ts`
- `README.md`
- `CHANGELOG.md`
- `CLAUDE.md`

---

## Critical Files Reference

### Sprint 1 Must-Read:
1. `src/tools/json-schemas.ts` - Tool schema definitions
2. `src/tools/definitions.ts` - Tool routing map
3. `tests/**/*.test.ts` - Find tests referencing deepthinking_core

### Sprint 2 Must-Read:
4. `src/types/modes/causal.ts` - Template for new mode types
5. `src/validation/validators/modes/*.ts` - Validator patterns
6. `src/services/ThoughtFactory.ts` - Thought creation logic
7. `src/types/core.ts` - Type system architecture

### Sprint 3 Must-Read:
8. `tests/unit/validation/validators/*.test.ts` - Test patterns
9. `docs/migration/*.md` - Previous migration examples
10. `CHANGELOG.md` - Version history format

---

## Timeline Summary

| Sprint | Week | Effort | Key Deliverable | Breaking Changes |
|--------|------|--------|----------------|------------------|
| 1 | 1 | 12-16h | Rename core → standard | Tool name change |
| 2 | 1-2 | 16-24h | New core mode | Abductive moved, new modes added |
| 3 | 2-3 | 12-20h | v5.0.0 release | Documentation complete |
| **Total** | **2-3 weeks** | **40-60h** | **v5.0.0 production** | **Major version** |

---

## Breaking Changes (v5.0.0)

### Tool Name Changes:
- `deepthinking_core` → `deepthinking_standard`
- NEW `deepthinking_core` created

### Mode Routing Changes:
- `abductive` mode: moved from `deepthinking_causal` to `deepthinking_core`
- `sequential`, `shannon`, `hybrid`: now route to `deepthinking_standard` (was `deepthinking_core`)

### New Modes Added:
- `inductive` (NEW) - routes to `deepthinking_core`
- `deductive` (NEW) - routes to `deepthinking_core`

---

## Migration Guide Summary

### For Users Using Sequential/Shannon/Hybrid:
**Before (v4.x)**:
```javascript
{ tool: "deepthinking_core", mode: "sequential" }
```

**After (v5.0)**:
```javascript
{ tool: "deepthinking_standard", mode: "sequential" }
```

### For Users Using Abductive:
**Before (v4.x)**:
```javascript
{ tool: "deepthinking_causal", mode: "abductive" }
```

**After (v5.0)**:
```javascript
{ tool: "deepthinking_core", mode: "abductive" }
```

### For Users Using New Modes:
**New in v5.0**:
```javascript
{ tool: "deepthinking_core", mode: "inductive" }
{ tool: "deepthinking_core", mode: "deductive" }
```

---

## Risk Mitigation

### High Risk: Breaking Changes
**Impact**: All users must update tool names
**Mitigation**:
- Clear migration guide with search-and-replace examples
- CHANGELOG documents every breaking change
- Comprehensive testing before release

### Medium Risk: Abductive Mode Move
**Impact**: Users using abductive must change from causal to core tool
**Mitigation**:
- Document in migration guide prominently
- Test abductive thoroughly in new location

### Low Risk: New Mode Stability
**Impact**: Inductive/deductive are new, may have edge cases
**Mitigation**:
- Comprehensive validation
- Unit and integration tests
- Clone proven patterns from existing modes

---

## Success Metrics

### Quantitative:
- All 744+ tests passing in every sprint
- Zero regressions in existing modes
- Successful build on all platforms

### Qualitative:
- Migration guide is clear and complete
- Breaking changes well-documented
- Code follows existing patterns

---

## Next Steps

1. ✅ Plan approved and simplified
2. ⏳ Await operator approval to start Sprint 1
3. ⏳ Execute sprints sequentially (Sprint 1 → 2 → 3)
4. ⏳ Update sprint JSON todos as tasks complete
5. ⏳ Commit changes after each sprint completion
