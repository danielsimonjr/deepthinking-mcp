#!/usr/bin/env node
/**
 * extract-ts-fields.cjs — parse the TS "runtime contract" for each reasoning mode's
 * Thought shape and print it as JSON.
 *
 * Ground truth chosen (see test/test_schema_parity.py docstring for the full rationale):
 *   - `BaseThought` in src/types/core.ts (fields common to every thought)
 *   - `<Mode>Thought` interfaces extending `BaseThought`, in src/types/core.ts (the
 *     inductive/deductive/abductive triad) and src/types/modes/*.ts (everything else).
 *
 * This is a real TypeScript AST parse (via the `typescript` compiler API, already a
 * devDependency — no new dependency added), not a regex scan, so it is not thrown off by
 * multi-line union types, JSDoc comments between properties, etc. It does NOT type-check
 * or resolve imports — each file is parsed in isolation (syntax only), which is sufficient
 * for reading top-level interface member names/optionality.
 *
 * Usage: node tools/schema-parity/extract-ts-fields.cjs [repo-root]
 * Prints a single JSON object to stdout; non-zero exit + message on stderr on failure.
 */

"use strict";

const fs = require("fs");
const path = require("path");
const ts = require("typescript");

const repoRoot = path.resolve(process.argv[2] || path.join(__dirname, "..", ".."));
const CORE_TS = path.join(repoRoot, "src", "types", "core.ts");
const MODES_DIR = path.join(repoRoot, "src", "types", "modes");

function parseFile(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  return ts.createSourceFile(filePath, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
}

function propName(member) {
  if (ts.isIdentifier(member.name) || ts.isStringLiteral(member.name)) {
    return member.name.text;
  }
  return member.name.getText();
}

function extendsBaseThought(node) {
  if (!node.heritageClauses) return false;
  return node.heritageClauses.some((h) =>
    h.types.some((t) => t.expression.getText() === "BaseThought"),
  );
}

function extractFields(interfaceNode) {
  const fields = {};
  for (const member of interfaceNode.members) {
    if (!ts.isPropertySignature(member)) continue; // skip method signatures etc. (none expected)
    fields[propName(member)] = { optional: !!member.questionToken };
  }
  return fields;
}

function main() {
  // --- Pass 1: core.ts — enum values, BaseThought, and the 3 triad interfaces ---
  const coreSrc = parseFile(CORE_TS);
  const enumMap = {}; // "SEQUENTIAL" -> "sequential"
  let baseThoughtFields = null;
  const modeInterfaces = {}; // "sequential" -> { interfaceName, file, fields }

  function resolveModeString(interfaceNode) {
    for (const member of interfaceNode.members) {
      if (!ts.isPropertySignature(member)) continue;
      if (propName(member) !== "mode") continue;
      if (!member.type) return null;
      const typeText = member.type.getText().trim(); // e.g. "ThinkingMode.SEQUENTIAL"
      const last = typeText.split(".").pop();
      return Object.prototype.hasOwnProperty.call(enumMap, last) ? enumMap[last] : null;
    }
    return null;
  }

  function registerIfModeInterface(node, relFile) {
    if (!ts.isInterfaceDeclaration(node)) return;
    if (node.name.text === "BaseThought") {
      baseThoughtFields = extractFields(node);
      return;
    }
    if (!extendsBaseThought(node)) return;
    const modeStr = resolveModeString(node);
    if (!modeStr) return; // not a literal ThinkingMode.X discriminant -> not a per-mode Thought
    modeInterfaces[modeStr] = {
      interfaceName: node.name.text,
      file: relFile,
      fields: extractFields(node),
    };
  }

  // Enum must be collected before any interface that references it, but core.ts declares
  // the enum (line ~75) before BaseThought (~263) and the triad interfaces (~295+), so a
  // single top-to-bottom pass suffices.
  ts.forEachChild(coreSrc, (node) => {
    if (ts.isEnumDeclaration(node) && node.name.text === "ThinkingMode") {
      for (const m of node.members) {
        const name = ts.isIdentifier(m.name) ? m.name.text : m.name.getText();
        if (m.initializer && ts.isStringLiteral(m.initializer)) {
          enumMap[name] = m.initializer.text;
        }
      }
    }
    registerIfModeInterface(node, "src/types/core.ts");
  });

  if (!baseThoughtFields) {
    throw new Error("BaseThought interface not found in src/types/core.ts");
  }

  // --- Pass 2: src/types/modes/*.ts — everything else ---
  for (const file of fs.readdirSync(MODES_DIR).sort()) {
    if (!file.endsWith(".ts")) continue;
    const filePath = path.join(MODES_DIR, file);
    const src = parseFile(filePath);
    ts.forEachChild(src, (node) => {
      registerIfModeInterface(node, `src/types/modes/${file}`);
    });
  }

  process.stdout.write(
    JSON.stringify({ enumMap, baseThoughtFields, modeInterfaces }, null, 2) + "\n",
  );
}

try {
  main();
} catch (err) {
  process.stderr.write(`extract-ts-fields.cjs failed: ${err.stack || err}\n`);
  process.exit(1);
}
