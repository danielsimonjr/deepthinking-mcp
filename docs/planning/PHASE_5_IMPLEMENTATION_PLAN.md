# Phase 5: Core Mode Restructuring (v5.0.0)

## Executive Summary

**Goal**: Restructure deepthinking modes to create a logical foundation where "core" means fundamental reasoning types.

**Changes**:
1. Rename `deepthinking_core` → `deepthinking_standard` (sequential, shannon, hybrid)
2. Create NEW `deepthinking_core` (inductive, deductive, abductive)
3. Move abductive mode from `deepthinking_causal` to new `deepthinking_core`

**Approach**: Phased migration with 3 major releases over 10-12 weeks
- **Sprint 1-3**: v4.5.0 - Deprecation warnings + beta preview (Weeks 1-3)
- **Sprint 4-6**: v4.6.0 - Beta tools + feedback collection (Weeks 4-6)
- **Sprint 7-10**: v5.0.0 - Hard cutover + comprehensive migration (Weeks 7-10+)

**Total Effort**: 250-330 developer hours across 10 sprints

---

## Sprint Structure

### Sprint 1: Type System Foundation (Week 1)
**Effort**: 12-16 hours | **Files**: 3 new, 1 modified

**Tasks**:
1. Create `src/types/modes/inductive.ts` with InductiveThought interface (~150 lines)
2. Create `src/types/modes/deductive.ts` with DeductiveThought interface (~150 lines)
3. Update `src/types/core.ts` - Add INDUCTIVE and DEDUCTIVE to ThinkingMode enum
4. Update `src/types/core.ts` - Add InductiveThought and DeductiveThought to Thought union type
5. Add type guard functions `isInductiveThought()` and `isDeductiveThought()` to core.ts
6. Run typecheck to verify no regressions
7. Update memory with completion status

**Success Criteria**:
- ✅ TypeScript compiles without errors
- ✅ Zero breaking changes to existing types
- ✅ Type guards work correctly

---

### Sprint 2: Validation Layer (Week 1-2)
**Effort**: 12-16 hours | **Files**: 2 new

**Tasks**:
1. Create `src/validation/validators/modes/inductive.ts` with InductiveValidator class (~150 lines)
2. Create `src/validation/validators/modes/deductive.ts` with DeductiveValidator class (~150 lines)
3. Implement validation rules for inductive mode (observations, generalization, confidence 0-1)
4. Implement validation rules for deductive mode (premises, conclusion, logic form)
5. Register validators in `src/validation/validator.ts`
6. Create unit tests for validators
7. Run tests to verify validators work correctly

**Success Criteria**:
- ✅ Validators catch invalid input
- ✅ Validators pass valid input
- ✅ All existing tests still pass

---

### Sprint 3: Deprecation & Feature Flags (Week 2)
**Effort**: 14-18 hours | **Files**: 2 new, 2 modified

**Tasks**:
1. Create `src/deprecation/warnings.ts` with deprecation warning system
2. Create `src/config/feature-flags.ts` with DEEPTHINKING_BETA_CORE flag support
3. Update `src/index.ts` to emit deprecation warnings when deepthinking_core is used
4. Implement feature flag check in tool listing handler
5. Create tests for deprecation warnings
6. Create tests for feature flag functionality
7. Document feature flag usage in README

**Success Criteria**:
- ✅ Deprecation warnings display correctly
- ✅ Feature flags toggle beta features
- ✅ No impact when flag is disabled

---

### Sprint 4: Documentation & Release v4.5.0 (Week 3)
**Effort**: 16-22 hours | **Files**: 3 new, 2 modified

**Tasks**:
1. Create `docs/migration/v5.0-core-restructure.md` - comprehensive migration guide (~500 lines)
2. Create `docs/migration/v4.5-deprecation-guide.md` - deprecation notice guide (~200 lines)
3. Update `CHANGELOG.md` with v4.5.0 release notes
4. Update `README.md` with deprecation notice and timeline
5. Run full test suite 3 times - all must pass
6. Build and verify dist/ output
7. Tag v4.5.0 release (DO NOT publish yet - commit only)

**Success Criteria**:
- ✅ All 744+ tests passing
- ✅ Zero breaking changes
- ✅ Documentation complete and clear
- ✅ Build output verified

---

### Sprint 5: Beta Tool Schemas (Week 4)
**Effort**: 18-24 hours | **Files**: 1 modified

**Tasks**:
1. Create `deepthinking_core_beta` schema in `src/tools/json-schemas.ts`
2. Create `deepthinking_standard_beta` schema in `src/tools/json-schemas.ts`
3. Add inductive mode properties to core_beta schema (observations, pattern, generalization, confidence)
4. Add deductive mode properties to core_beta schema (premises, conclusion, logicForm, validityCheck)
5. Add abductive mode properties to core_beta schema (moved from causal)
6. Copy sequential/shannon/hybrid properties to standard_beta schema
7. Create Zod schemas for validation in `src/validation/schemas.ts`
8. Run typecheck and tests

**Success Criteria**:
- ✅ Beta schemas validate correctly
- ✅ All mode properties included
- ✅ No impact on existing schemas

---

### Sprint 6: Beta Tool Implementation (Week 4-5)
**Effort**: 14-18 hours | **Files**: 3 modified

**Tasks**:
1. Update `src/index.ts` to conditionally expose beta tools when flag enabled
2. Update `src/services/ThoughtFactory.ts` - Add case for 'inductive' mode
3. Update `src/services/ThoughtFactory.ts` - Add case for 'deductive' mode
4. Update `src/tools/json-schemas.ts` - Remove 'abductive' from causal schema (add deprecation note)
5. Test beta tools with feature flag enabled
6. Test existing tools still work with flag disabled
7. Create integration tests for beta tools

**Success Criteria**:
- ✅ Beta tools appear when flag enabled
- ✅ Beta tools hidden when flag disabled
- ✅ ThoughtFactory creates correct thought types

---

### Sprint 7: Beta Testing & Feedback (Week 5-6)
**Effort**: 20-26 hours | **Files**: 2 new, 1 modified

**Tasks**:
1. Create `docs/beta/v4.6-beta-guide.md` with beta testing instructions (~300 lines)
2. Update `docs/migration/v5.0-core-restructure.md` with beta testing section
3. Create GitHub Discussion for beta feedback
4. Recruit 5-10 beta testers
5. Monitor feedback daily for 2 weeks
6. Address critical issues found during beta
7. Document feedback and adjustments in CHANGELOG

**Success Criteria**:
- ✅ ≥10 users testing beta
- ✅ >70% positive feedback
- ✅ Critical issues resolved

---

### Sprint 8: Release v4.6.0 & Final Prep (Week 6)
**Effort**: 16-20 hours | **Files**: 2 modified, tests

**Tasks**:
1. Update `README.md` with beta announcement
2. Update `CHANGELOG.md` with v4.6.0 release notes
3. Create `tests/integration/beta-tools.test.ts` - beta tool integration tests
4. Create `tests/integration/migration-scenarios.test.ts` - migration path tests
5. Run full test suite 5 times - all must pass
6. Build and verify dist/ output
7. Tag v4.6.0 release (DO NOT publish yet - commit only)

**Success Criteria**:
- ✅ Beta tools fully functional
- ✅ Zero regressions in non-beta mode
- ✅ Migration paths validated

---

### Sprint 9: v5.0.0 Implementation (Week 7-8)
**Effort**: 36-48 hours | **Files**: 5 modified

**Tasks**:
1. Update `src/tools/json-schemas.ts` - Finalize deepthinking_core_schema (inductive/deductive/abductive)
2. Update `src/tools/json-schemas.ts` - Rename old core → deepthinking_standard_schema
3. Update `src/tools/definitions.ts` - Complete modeToToolMap routing changes
4. Update `src/types/core.ts` - Move INDUCTIVE and DEDUCTIVE from EXPERIMENTAL to FULLY_IMPLEMENTED
5. Update `src/export/markdown.ts` - Add formatting for inductive/deductive modes
6. Remove `src/config/feature-flags.ts` and `src/deprecation/warnings.ts`
7. Remove all feature flag checks from codebase
8. Run full test suite 5 times - all must pass

**Success Criteria**:
- ✅ All routing updated correctly
- ✅ Beta code removed cleanly
- ✅ All 744+ tests passing

---

### Sprint 10: Documentation & Release v5.0.0 (Week 9-10)
**Effort**: 40-52 hours | **Files**: 4 modified, migration tests

**Tasks**:
1. Expand `docs/migration/v5.0-core-restructure.md` to ~1000 lines (comprehensive guide)
2. Update `README.md` - Complete rewrite of modes section
3. Update `CHANGELOG.md` - Comprehensive v5.0.0 entry with all breaking changes
4. Update `CLAUDE.md` - Update architecture notes with new structure
5. Create migration tests for v4.3.7→v5.0.0, v4.5.0→v5.0.0, v4.6.0→v5.0.0
6. Run full test suite 10 times - all must pass
7. Build, verify, commit dist/ output
8. Tag v5.0.0 release and prepare for npm publish

**Success Criteria**:
- ✅ Migration guide comprehensive
- ✅ All migration paths tested
- ✅ Zero critical bugs
- ✅ Ready for production release

---

## Critical Files Reference

### Must Read Before Starting
1. `src/tools/json-schemas.ts` (945 lines) - Tool schema structure
2. `src/types/core.ts` (822 lines) - Type system architecture
3. `src/tools/definitions.ts` (123 lines) - Mode routing
4. `src/index.ts` (245 lines) - MCP server handlers
5. `src/services/ThoughtFactory.ts` - Thought creation logic

### Reference During Implementation
6. `src/validation/validators/modes/*.ts` - Validator patterns
7. `src/services/ModeRouter.ts` - Mode recommendation
8. `CHANGELOG.md` - Version history format
9. Previous phase docs in `docs/planning/`

---

## Timeline Summary

| Sprint | Week | Effort | Key Deliverable |
|--------|------|--------|----------------|
| 1 | 1 | 12-16h | Type definitions |
| 2 | 1-2 | 12-16h | Validators |
| 3 | 2 | 14-18h | Deprecation & flags |
| 4 | 3 | 16-22h | v4.5.0 release |
| 5 | 4 | 18-24h | Beta schemas |
| 6 | 4-5 | 14-18h | Beta implementation |
| 7 | 5-6 | 20-26h | Beta testing |
| 8 | 6 | 16-20h | v4.6.0 release |
| 9 | 7-8 | 36-48h | v5.0.0 implementation |
| 10 | 9-10 | 40-52h | v5.0.0 release |
| **Total** | **10-12 weeks** | **250-330h** | **v5.0.0 production** |

---

## Risk Mitigation

### High Risk: User Adoption
- 6 weeks advance warning (v4.5.0 + v4.6.0)
- Comprehensive migration guide
- Beta testing period with real users
- Responsive support post-launch

### High Risk: Unexpected Breaking Changes
- Extensive testing at each sprint
- Beta validation before final release
- Migration path testing for all versions
- Fast hotfix capability ready

### Medium Risk: Tool Name Confusion
- Clear naming convention (core = fundamental)
- Side-by-side comparison tables in docs
- Deprecation warnings for 6+ weeks
- Search-and-replace examples provided

---

## Success Metrics

### Quantitative
- All 744+ tests passing in every sprint
- <5 critical issues in Week 1 post-v5.0.0
- >70% user adoption within 4 weeks
- <10 support issues requiring hotfixes

### Qualitative
- >80% user satisfaction (survey)
- Positive community feedback
- Clear, helpful documentation
- Smooth migration experience

---

## Communication Strategy

| Version | Message | Channels |
|---------|---------|----------|
| v4.5.0 | "Heads up! Changes coming in 8 weeks. Preview with feature flag." | GitHub Release, CHANGELOG |
| v4.6.0 | "Beta test the new structure! Provide feedback before v5.0.0." | GitHub Discussion, README |
| v5.0.0 | "Major restructure complete. Comprehensive migration guide available." | All channels + announcement |

**Primary Channels**: GitHub Releases, CHANGELOG.md, GitHub Discussions, README.md

---

## Next Steps

1. ✅ Plan approved and documented
2. ⏳ Await operator approval to start Sprint 1
3. ⏳ Execute sprints sequentially (do not skip ahead)
4. ⏳ Update sprint JSON todos as tasks complete
5. ⏳ Commit changes after each sprint completion
