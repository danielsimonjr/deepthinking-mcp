# Phase 14: Validator Test Coverage Plan

## Overview

This document outlines the test coverage improvement plan for the 10 zero-coverage validators identified in the December 2025 Codebase Analysis. These validators contain 2,093 lines of validation logic that are completely untested, representing a critical gap in the test suite.

**Status**: Not Started
**Priority**: CRITICAL (Priority 1 from Analysis)
**Estimated Effort**: 12-16 hours across 3 sprints
**Impact**: Raise overall coverage from 56.78% to ~72%

---

## Current State

### Test Coverage Metrics (December 26, 2025)

| Module | Coverage | Status |
|--------|----------|--------|
| **Overall** | 56.78% | Below 70% target |
| services/ | 82.4% | Good |
| session/ | 76.2% | Good |
| taxonomy/ | 71.3% | Acceptable |
| export/ | 64.8% | Moderate |
| **validation/validators/modes/** | **37.44%** | **Critical Gap** |
| utils/ | 66.78% | Moderate |

### Zero-Coverage Validators (10 files, 2,093 lines)

| Validator | Lines | Risk | Complexity | Priority |
|-----------|-------|------|------------|----------|
| computability.ts | 531 | HIGH | High - Turing machine logic | Sprint 1 |
| metareasoning.ts | 370 | HIGH | High - Core reasoning validator | Sprint 1 |
| optimization.ts | 351 | HIGH | High - Constraint solving logic | Sprint 1 |
| cryptanalytic.ts | 356 | HIGH | High - Deciban calculations | Sprint 1 |
| constraint.ts | 68 | MEDIUM | Medium | Sprint 2 |
| deductive.ts | 104 | MEDIUM | Medium | Sprint 2 |
| inductive.ts | 90 | MEDIUM | Medium | Sprint 2 |
| recursive.ts | 93 | MEDIUM | Medium | Sprint 2 |
| stochastic.ts | 83 | MEDIUM | Medium | Sprint 3 |
| modal.ts | 47 | LOW | Low | Sprint 3 |

**Source**: [December 2025 Codebase Analysis](../analysis/December_2025_Codebase_Analysis.md), Lines 54-72

---

## Test Strategy

### Testing Principles

1. **Validation-Focused**: Test that validators correctly accept valid inputs and reject invalid inputs
2. **Edge Cases**: Cover boundary conditions, null/undefined handling, and type coercion
3. **Error Messages**: Verify error messages are descriptive and actionable
4. **Zod Schema Coverage**: Ensure all Zod schema branches are exercised
5. **Real-World Inputs**: Include realistic examples from actual MCP tool usage

### Test File Structure

```
tests/unit/validation/validators/modes/
├── computability.test.ts     [NEW - Sprint 1]
├── metareasoning.test.ts     [NEW - Sprint 1]
├── optimization.test.ts      [NEW - Sprint 1]
├── cryptanalytic.test.ts     [NEW - Sprint 1]
├── constraint.test.ts        [NEW - Sprint 2]
├── deductive.test.ts         [NEW - Sprint 2]
├── inductive.test.ts         [NEW - Sprint 2]
├── recursive.test.ts         [NEW - Sprint 2]
├── stochastic.test.ts        [NEW - Sprint 3]
└── modal.test.ts             [NEW - Sprint 3]
```

### Test Categories Per Validator

Each test file should cover:

| Category | Description | Min Tests |
|----------|-------------|-----------|
| **Valid Inputs** | Correctly formatted inputs that should pass | 5-10 |
| **Invalid Inputs** | Malformed inputs that should fail | 5-10 |
| **Edge Cases** | Boundary conditions, empty arrays, etc. | 3-5 |
| **Type Coercion** | String-to-number, null handling | 2-3 |
| **Optional Fields** | Missing optional fields should pass | 2-3 |
| **Required Fields** | Missing required fields should fail | 3-5 |
| **Error Messages** | Verify descriptive error output | 2-3 |

---

## Sprint 1: High-Risk Validators (5-6 hours)

### Objective

Cover the 4 HIGH-risk validators with the most complex logic and highest line counts.

### 1.1 computability.ts (531 lines)

**Purpose**: Validates Turing machine definitions, decidability analysis, complexity classes

**Key Schemas to Test**:

```typescript
// From src/validation/validators/modes/computability.ts
- TuringMachineSchema (states, transitions, tape alphabet)
- DecidabilitySchema (problem classification, reduction proofs)
- ComplexityClassSchema (P, NP, PSPACE, etc.)
- ComputabilityThoughtSchema (full thought validation)
```

**Test Cases**:

```typescript
// tests/unit/validation/validators/modes/computability.test.ts
describe('ComputabilityValidator', () => {
  describe('TuringMachineSchema', () => {
    it('should accept valid Turing machine with all required fields');
    it('should accept machine with optional halt states');
    it('should reject machine with no states');
    it('should reject machine with invalid transition format');
    it('should reject non-finite alphabet');
    // ... 15+ test cases
  });

  describe('DecidabilitySchema', () => {
    it('should accept decidable problem classification');
    it('should accept undecidable with reduction proof');
    it('should reject missing problem statement');
    // ... 10+ test cases
  });

  describe('ComplexityClassSchema', () => {
    it('should accept standard complexity classes');
    it('should reject unknown complexity class');
    // ... 5+ test cases
  });
});
```

**Estimated Tests**: 35-40
**Estimated Time**: 1.5-2 hours

### 1.2 metareasoning.ts (370 lines)

**Purpose**: Validates meta-reasoning analysis, strategy monitoring, reasoning quality metrics

**Key Schemas to Test**:

```typescript
- MetaReasoningStrategySchema
- ReasoningQualitySchema
- MetaMonitorStateSchema
- MetaReasoningThoughtSchema
```

**Test Cases**:

```typescript
describe('MetaReasoningValidator', () => {
  describe('MetaReasoningStrategySchema', () => {
    it('should accept valid strategy with all fields');
    it('should accept strategy with optional confidence');
    it('should reject strategy without name');
    // ... 10+ test cases
  });

  describe('ReasoningQualitySchema', () => {
    it('should accept quality score between 0 and 1');
    it('should reject quality score above 1');
    it('should reject quality score below 0');
    // ... 8+ test cases
  });
});
```

**Estimated Tests**: 25-30
**Estimated Time**: 1-1.5 hours

### 1.3 optimization.ts (351 lines)

**Purpose**: Validates optimization problems, constraints, objective functions

**Key Schemas to Test**:

```typescript
- ObjectiveFunctionSchema
- ConstraintSchema (linear, nonlinear, equality, inequality)
- OptimizationMethodSchema (gradient, simplex, genetic, etc.)
- OptimizationThoughtSchema
```

**Test Cases**:

```typescript
describe('OptimizationValidator', () => {
  describe('ObjectiveFunctionSchema', () => {
    it('should accept minimize objective');
    it('should accept maximize objective');
    it('should reject objective without direction');
    it('should validate variable coefficients');
    // ... 10+ test cases
  });

  describe('ConstraintSchema', () => {
    it('should accept linear equality constraint');
    it('should accept nonlinear inequality constraint');
    it('should reject constraint with invalid operator');
    // ... 15+ test cases
  });
});
```

**Estimated Tests**: 30-35
**Estimated Time**: 1-1.5 hours

### 1.4 cryptanalytic.ts (356 lines)

**Purpose**: Validates Deciban evidence system, cipher analysis, key recovery

**Key Schemas to Test**:

```typescript
- DecibanScoreSchema
- EvidenceWeightSchema
- CipherAnalysisSchema
- CryptanalyticThoughtSchema
```

**Test Cases**:

```typescript
describe('CryptanalyticValidator', () => {
  describe('DecibanScoreSchema', () => {
    it('should accept positive deciban value');
    it('should accept negative deciban value');
    it('should accept zero (neutral evidence)');
    it('should reject non-numeric deciban');
    // ... 8+ test cases
  });

  describe('EvidenceWeightSchema', () => {
    it('should accept evidence with deciban and description');
    it('should calculate cumulative evidence correctly');
    // ... 10+ test cases
  });
});
```

**Estimated Tests**: 25-30
**Estimated Time**: 1-1.5 hours

### Sprint 1 Deliverables

- [ ] `tests/unit/validation/validators/modes/computability.test.ts` (35+ tests)
- [ ] `tests/unit/validation/validators/modes/metareasoning.test.ts` (25+ tests)
- [ ] `tests/unit/validation/validators/modes/optimization.test.ts` (30+ tests)
- [ ] `tests/unit/validation/validators/modes/cryptanalytic.test.ts` (25+ tests)

**Total Sprint 1 Tests**: ~120 tests
**Total Sprint 1 Time**: 5-6 hours

---

## Sprint 2: Medium-Risk Validators (4-5 hours)

### Objective

Cover the 4 MEDIUM-risk validators with moderate complexity.

### 2.1 constraint.ts (68 lines)

**Purpose**: Validates constraint satisfaction problems

**Key Schemas to Test**:

```typescript
- ConstraintVariableSchema
- ConstraintDomainSchema
- CSPSchema (Constraint Satisfaction Problem)
- ConstraintThoughtSchema
```

**Estimated Tests**: 15-20
**Estimated Time**: 45 min - 1 hour

### 2.2 deductive.ts (104 lines)

**Purpose**: Validates deductive reasoning (premises, conclusions, validity)

**Key Schemas to Test**:

```typescript
- PremiseSchema
- ConclusionSchema
- LogicalFormSchema (modus ponens, modus tollens, etc.)
- DeductiveThoughtSchema
```

**Estimated Tests**: 20-25
**Estimated Time**: 1-1.5 hours

### 2.3 inductive.ts (90 lines)

**Purpose**: Validates inductive reasoning (observations, generalizations, confidence)

**Key Schemas to Test**:

```typescript
- ObservationSchema
- GeneralizationSchema
- InductiveStrengthSchema
- InductiveThoughtSchema
```

**Estimated Tests**: 18-22
**Estimated Time**: 1 hour

### 2.4 recursive.ts (93 lines)

**Purpose**: Validates recursive/self-referential reasoning

**Key Schemas to Test**:

```typescript
- RecursionDepthSchema
- BaseConditionSchema
- RecursiveStepSchema
- RecursiveThoughtSchema
```

**Estimated Tests**: 18-22
**Estimated Time**: 1 hour

### Sprint 2 Deliverables

- [ ] `tests/unit/validation/validators/modes/constraint.test.ts` (15+ tests)
- [ ] `tests/unit/validation/validators/modes/deductive.test.ts` (20+ tests)
- [ ] `tests/unit/validation/validators/modes/inductive.test.ts` (18+ tests)
- [ ] `tests/unit/validation/validators/modes/recursive.test.ts` (18+ tests)

**Total Sprint 2 Tests**: ~75 tests
**Total Sprint 2 Time**: 4-5 hours

---

## Sprint 3: Low-Risk Validators + Integration (3-5 hours)

### Objective

Cover remaining validators and add integration tests.

### 3.1 stochastic.ts (83 lines)

**Purpose**: Validates stochastic processes, probability distributions

**Key Schemas to Test**:

```typescript
- DistributionSchema
- MarkovChainSchema
- StateTransitionSchema
- StochasticThoughtSchema
```

**Estimated Tests**: 18-22
**Estimated Time**: 1 hour

### 3.2 modal.ts (47 lines)

**Purpose**: Validates modal logic (possibility, necessity)

**Key Schemas to Test**:

```typescript
- ModalOperatorSchema (box, diamond)
- PossibleWorldSchema
- ModalThoughtSchema
```

**Estimated Tests**: 12-15
**Estimated Time**: 45 min

### 3.3 Integration Tests

**Purpose**: Verify validators work correctly with MCP tool handlers

**Test Cases**:

```typescript
// tests/integration/validators/mode-validators.test.ts
describe('Validator Integration', () => {
  describe('All 10 new validators', () => {
    it('should integrate with ThoughtFactory');
    it('should provide clear error messages on failure');
    it('should handle edge cases gracefully');
  });

  describe('Cross-validator consistency', () => {
    it('should use consistent error formats');
    it('should use consistent field naming');
  });
});
```

**Estimated Tests**: 15-20
**Estimated Time**: 1-1.5 hours

### 3.4 Coverage Verification

Run full coverage report and verify targets met:

```bash
npm run test:coverage

# Expected output:
# validation/validators/modes/ | 85%+ | ✅ Target met
# Overall                      | 70%+ | ✅ Target met
```

**Estimated Time**: 30 min

### Sprint 3 Deliverables

- [ ] `tests/unit/validation/validators/modes/stochastic.test.ts` (18+ tests)
- [ ] `tests/unit/validation/validators/modes/modal.test.ts` (12+ tests)
- [ ] `tests/integration/validators/mode-validators.test.ts` (15+ tests)
- [ ] Coverage verification report

**Total Sprint 3 Tests**: ~50 tests
**Total Sprint 3 Time**: 3-5 hours

---

## Implementation Guidelines

### Test Template

```typescript
// tests/unit/validation/validators/modes/[mode].test.ts
import { describe, it, expect } from 'vitest';
import {
  [Mode]ThoughtSchema,
  // other schemas
} from '@/validation/validators/modes/[mode]';

describe('[Mode]Validator', () => {
  describe('[SchemaName]', () => {
    describe('valid inputs', () => {
      it('should accept minimal valid input', () => {
        const input = { /* minimal valid */ };
        const result = [Schema].safeParse(input);
        expect(result.success).toBe(true);
      });

      it('should accept full valid input', () => {
        const input = { /* all fields */ };
        const result = [Schema].safeParse(input);
        expect(result.success).toBe(true);
      });
    });

    describe('invalid inputs', () => {
      it('should reject missing required field', () => {
        const input = { /* missing field */ };
        const result = [Schema].safeParse(input);
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toContain('[field]');
      });

      it('should reject invalid type', () => {
        const input = { field: 'should be number' };
        const result = [Schema].safeParse(input);
        expect(result.success).toBe(false);
      });
    });

    describe('edge cases', () => {
      it('should handle empty arrays', () => { /* ... */ });
      it('should handle null values', () => { /* ... */ });
      it('should handle boundary values', () => { /* ... */ });
    });
  });
});
```

### Error Message Standards

All validators should produce error messages that:

1. Identify the specific field that failed
2. Describe what was expected
3. Show what was received (if safe to display)
4. Suggest how to fix the issue

Example:

```
Invalid input: expected 'states' to be a non-empty array of strings, received empty array.
```

---

## Success Criteria

| Metric | Target | Verification |
|--------|--------|--------------|
| validation/validators/modes/ coverage | 85%+ | `npm run test:coverage` |
| Overall test coverage | 70%+ | `npm run test:coverage` |
| New test count | 240+ tests | Test count in output |
| All tests passing | 100% | `npm run test:run` |
| No runtime errors | 0 errors | Clean test output |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Complex Zod schemas hard to test | Use `.safeParse()` for detailed error inspection |
| Missing edge cases | Review validator source code for all branches |
| Tests too tightly coupled | Use realistic but generic test data |
| Time overrun | Prioritize HIGH-risk validators first |

---

## Timeline

| Sprint | Duration | Dates | Status |
|--------|----------|-------|--------|
| Sprint 1 | 5-6 hours | TBD | Not Started |
| Sprint 2 | 4-5 hours | TBD | Not Started |
| Sprint 3 | 3-5 hours | TBD | Not Started |

**Total Estimated Time**: 12-16 hours

---

## References

- [December 2025 Codebase Analysis](../analysis/December_2025_Codebase_Analysis.md)
- [Phase 11 Test Plan](./archive/PHASE_11_TEST_PLAN.md) (for test patterns)
- Vitest Documentation: <https://vitest.dev/>
- Zod Documentation: <https://zod.dev/>

---

*Plan created: December 28, 2025*
*Author: Claude Opus 4.5*
