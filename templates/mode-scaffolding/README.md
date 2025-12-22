# Mode Scaffolding Templates

This directory contains template files for adding new reasoning modes to DeepThinking MCP v8+.

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

### `example-mode.validator.ts`
Template for mode-specific validation.

**Copy to**: `src/validation/validators/modes/yourmode.ts`

**Contains**:
- Validator class extending `BaseValidator`
- Common validation patterns with examples
- Severity levels and categories

### `example-mode.schema.ts`
Template for Zod schema definition (snippet).

**Add to**: `src/validation/schemas.ts`

**Contains**:
- Zod schema extending `BaseThoughtSchema`
- Field validation examples
- Type inference

### `example-mode.json-schema.ts`
Template for MCP tool JSON schema (snippet).

**Add to**: `src/tools/json-schemas.ts` array

**Contains**:
- JSON Schema for MCP tool definition
- Uses `baseThoughtProperties` for shared fields
- Mode-specific property examples

### `example-mode.handler.ts` (v8+ Architecture)
Template for ModeHandler implementation.

**Copy to**: `src/modes/handlers/YourModeHandler.ts`

**Contains**:
- ModeHandler interface implementation
- Thought creation logic
- Mode-specific validation
- Optional enhancements (suggestions, warnings)

## Usage Example

Adding a "Dialectical" reasoning mode:

```bash
# 1. Copy type definition
cp templates/mode-scaffolding/example-mode.type.ts src/types/modes/dialectical.ts

# 2. Copy validator
cp templates/mode-scaffolding/example-mode.validator.ts src/validation/validators/modes/dialectical.ts

# 3. Copy handler (v8+ required)
cp templates/mode-scaffolding/example-mode.handler.ts src/modes/handlers/DialecticalHandler.ts

# 4. Edit files, replacing "ExampleMode" with "Dialectical"

# 5. Follow docs/ADDING_NEW_MODE.md for remaining integration steps
```

## Search & Replace

When customizing templates, replace:

- `ExampleMode` -> `YourMode` (PascalCase, for class/interface names)
- `examplemode` -> `yourmode` (lowercase, for mode string literals)
- `EXAMPLEMODE` -> `YOURMODE` (UPPERCASE, for enum values)

## Architecture (v8+)

Since v8.0.0, modes use the **ModeHandler architecture** (Strategy Pattern):

```
ThoughtFactory --> ModeHandlerRegistry --> YourModeHandler
                                               |
                                               v
                                         Creates Thought
```

**Benefits**:
- Encapsulated mode logic
- Mode-specific validation
- Optional enhancements (suggestions, warnings)
- Easier testing

## Common Patterns Reference

### Simple Mode
See: `src/types/modes/sequential.ts`, `src/modes/handlers/SequentialHandler.ts`
- Few mode-specific fields
- Basic validation
- ~50-100 lines

### Medium Complexity
See: `src/types/modes/mathematics.ts`, `src/modes/handlers/MathematicsHandler.ts`
- Structured data (models, proofs)
- Multiple supporting interfaces
- ~150-200 lines

### Complex Mode
See: `src/types/modes/temporal.ts`, `src/modes/handlers/TemporalHandler.ts`
- Multiple entity types and relationships
- Rich validation requirements
- Optional enhancements
- ~200+ lines

## File Checklist

When adding a new mode, create/modify these files:

### Required Files
- [ ] `src/types/modes/yourmode.ts` - Type definition
- [ ] `src/types/core.ts` - Add to enum and union type
- [ ] `src/validation/schemas.ts` - Zod schema
- [ ] `src/validation/validators/modes/yourmode.ts` - Validator
- [ ] `src/validation/validator.ts` - Register validator
- [ ] `src/tools/json-schemas.ts` - JSON schema (add to array)
- [ ] `src/tools/definitions.ts` - Export tool with correct index
- [ ] `src/modes/handlers/YourModeHandler.ts` - ModeHandler (v8+)
- [ ] `src/modes/handlers/index.ts` - Export handler
- [ ] `src/services/ThoughtFactory.ts` - Register with factory

### Optional Files
- [ ] `src/services/ExportService.ts` - Custom export formatting
- [ ] `src/export/visual/modes/yourmode.ts` - Visual exporter
- [ ] `tests/unit/validation/validators/yourmode.test.ts` - Unit tests
- [ ] `tests/integration/tools/yourmode.test.ts` - Integration tests
- [ ] `README.md` - Documentation

## Testing Your Mode

```bash
# Type checking
npm run typecheck

# Build
npm run build

# Run all tests
npm run test:run

# Test specific mode
npm test -- -t "YourMode"
```

## Need Help?

1. **Full guide**: Read `docs/ADDING_NEW_MODE.md`
2. **Examples**: Study existing modes in `src/types/modes/`
3. **Handlers**: Study `src/modes/handlers/` for v8+ patterns
4. **Architecture**: See `CLAUDE.md` for project structure
