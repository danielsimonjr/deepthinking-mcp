# Mode Scaffolding Templates

This directory contains template files for adding new reasoning modes to DeepThinking MCP.

## Quick Start

1. **Read the guide**: `docs/ADDING_NEW_MODE.md` - Complete step-by-step instructions

2. **Copy templates**: Use these files as starting points for your new mode

3. **Follow the checklist**: The guide includes a complete checklist to ensure nothing is missed

## Template Files

### `example-mode.type.ts`
Template for TypeScript type definitions.

**Copy to**: `src/types/modes/yourmode.ts`

**Contains**:
- Main thought interface extending `BaseThought`
- Supporting interfaces for complex types
- Type guard function
- Detailed comments explaining common patterns

### `example-mode.validator.ts`
Template for Zod-based runtime validation.

**Copy to**: `src/validation/validators/modes/yourmode.ts`

**Contains**:
- Validator class extending `BaseValidator`
- Common validation patterns with examples
- Severity levels and categories explanation

### `example-mode.schema.ts`
Template for Zod schema definition.

**Add to**: `src/validation/schemas.ts`

**Contains**:
- Zod schema extending `BaseThoughtSchema`
- Examples of field validation
- References to shared schemas
- Type inference

### `example-mode.json-schema.ts`
Template for MCP tool JSON schema.

**Add to**: `src/tools/json-schemas.ts` array

**Contains**:
- Hand-written JSON Schema (draft 2020-12)
- Tool name and description
- Input schema with mode-specific properties
- Examples from existing modes

## Usage Example

Let's add a "Dialectical" reasoning mode:

```bash
# 1. Copy type definition
cp templates/mode-scaffolding/example-mode.type.ts src/types/modes/dialectical.ts

# 2. Copy validator
cp templates/mode-scaffolding/example-mode.validator.ts src/validation/validators/modes/dialectical.ts

# 3. Edit files, replacing "ExampleMode" with "Dialectical" and "examplemode" with "dialectical"

# 4. Follow the complete guide in docs/ADDING_NEW_MODE.md for remaining steps
```

## Search & Replace

When customizing templates, replace:

- `ExampleMode` → `YourMode` (PascalCase, for class/interface names)
- `examplemode` → `yourmode` (lowercase, for mode string literals)
- `EXAMPLEMODE` → `YOURMODE` (UPPERCASE, for enum values)

## Common Patterns Reference

### Simple Mode (Minimal Properties)
See: `src/types/modes/sequential.ts`
- Few mode-specific fields
- Focus on thought sequencing and revision
- ~50 lines of code

### Medium Complexity
See: `src/types/modes/mathematics.ts`
- Structured data (mathematical models, proofs)
- Multiple supporting interfaces
- ~150 lines of code

### Complex Mode (Many Properties)
See: `src/types/modes/temporal.ts` or `src/types/modes/gametheory.ts`
- Multiple entity types and relationships
- Rich validation requirements
- ~200+ lines of code

## Validation Examples

### Range Validation
```typescript
if (thought.confidence !== undefined &&
    (thought.confidence < 0 || thought.confidence > 1)) {
  issues.push({
    severity: 'error',
    description: 'Confidence must be 0-1',
    category: 'structural',
  });
}
```

### Reference Validation
```typescript
const entityIds = new Set(thought.entities?.map(e => e.id) || []);
for (const rel of thought.relationships || []) {
  if (!entityIds.has(rel.from)) {
    issues.push({
      severity: 'error',
      description: `Invalid reference: ${rel.from}`,
      category: 'reference',
    });
  }
}
```

### Logical Consistency
```typescript
if (thought.startTime !== undefined &&
    thought.endTime !== undefined &&
    thought.startTime >= thought.endTime) {
  issues.push({
    severity: 'error',
    description: 'Start time must be before end time',
    category: 'logical',
  });
}
```

## Shared Schemas

Import from `src/tools/schemas/shared.ts` instead of redefining:

```typescript
import {
  ConfidenceSchema,      // 0-1 range
  PositiveIntSchema,     // 1+
  LevelEnum,             // 'low' | 'medium' | 'high'
  TimeUnitEnum,          // Time units
  ProofTypeEnum,         // Proof strategies
  ImpactEnum,            // Impact assessment
} from '../tools/schemas/shared.js';
```

## Testing Your Mode

After implementing, test with:

```bash
# Type checking
npm run typecheck

# Build
npm run build

# Run tests
npm run test:run

# Test specific mode
npm test -- -t "YourMode"
```

## Need Help?

1. **Full guide**: Read `docs/ADDING_NEW_MODE.md`
2. **Examples**: Study existing modes in `src/types/modes/`
3. **Architecture**: See `CLAUDE.md` for project structure
4. **Questions**: Check README.md or create an issue

## File Checklist

When adding a mode, you'll need to create/modify these files:

- [ ] `src/types/modes/yourmode.ts` - Type definition
- [ ] `src/types/core.ts` - Add to enum and union type
- [ ] `src/validation/schemas.ts` - Zod schema
- [ ] `src/validation/validators/modes/yourmode.ts` - Validator
- [ ] `src/validation/validator.ts` - Register validator
- [ ] `src/tools/json-schemas.ts` - JSON schema
- [ ] `src/tools/definitions.ts` - Export tool
- [ ] `src/services/ThoughtFactory.ts` - Factory logic
- [ ] `src/services/ExportService.ts` - Export formatting (optional)
- [ ] `README.md` - Documentation
- [ ] `tests/unit/validation/validators/yourmode.test.ts` - Tests (optional)

See the complete guide for detailed instructions on each file!
