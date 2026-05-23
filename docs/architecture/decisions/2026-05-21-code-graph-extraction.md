# ADR: Code Graph Extraction For React, TypeScript, And TSX

Date: 2026-05-21
Status: Proposed
Program: `docs/programs/2026-05-21-ai-frontend-governance-reset-plan.md`
Research: `docs/research/2026-05-21-graph-ai-governance-competitive-research.md`

## Decision

Decantr 3.0 will use tree-sitter as the preferred extraction foundation for the first serious code graph implementation, scoped to React, TypeScript, and TSX.

Regex scans and shallow heuristics may remain as fallback checks, but they are not the target architecture for code graph facts.

## Context

Decantr's differentiator is not generic code search. It is UI governance for AI-edited frontends.

The code graph must answer questions such as:

- Which components does this route use?
- Did the agent reimplement a local primitive instead of importing it?
- Which tokens and utility classes does this component consume?
- Which tests or evidence should run after this route changed?
- Which source file anchors a finding?

Aider's repo map validates tree-sitter based definition/reference extraction for agent coding context. TDAD validates AST-based code/test impact analysis for agentic development. Sourcegraph validates code-intelligence distribution through MCP, but Decantr should remain narrower and UI-specific.

## Scope

Initial target stack:

- React
- TypeScript
- TSX
- Tailwind
- shadcn/ui
- Next.js App Router and Vite as first route environments

Initial source facts:

- component declarations
- component exports
- component imports
- JSX component usage
- raw HTML control usage
- route file ownership
- shadcn/local design-system imports
- className strings when statically visible
- CSS variable references when statically visible
- test files that reference components or routes

## Non-Goals

- Parse 130 languages.
- Build a generic repository map.
- Replace TypeScript type checking.
- Replace ESLint or framework-specific build checks.
- Prove all runtime component behavior statically.
- Fully understand arbitrary dynamic class composition on day one.

## Output Shape

The code graph emits observed implementation facts into the same graph model as the contract graph.

Example nodes:

```text
cmp:Button
cmp:AccountMenu
src:src/components/ui/button.tsx
src:app/settings/page.tsx
test:tests/settings.spec.ts
```

Example edges:

```text
NODE_DERIVED_FROM_SOURCE
COMPONENT_IMPORTS_COMPONENT
ROUTE_IMPLEMENTED_BY_SOURCE
SOURCE_USES_COMPONENT
SOURCE_USES_RAW_ELEMENT
COMPONENT_STYLED_WITH_TOKEN
TEST_COVERS_NODE
```

Example finding:

```json
{
  "id": "find:COMP010:abc123",
  "code": "COMP010",
  "severity": "warn",
  "category": "component-reuse-drift",
  "anchored_at": "src:app/settings/page.tsx",
  "message": "Raw button usage appears where the local Button primitive is expected.",
  "payload": {
    "expected_component": "cmp:Button",
    "actual": "button"
  },
  "evidence": ["ev:ast:app/settings/page.tsx:42"],
  "repair": {
    "id": "repair:replace-raw-control-with-local-component"
  }
}
```

## Extraction Pipeline

1. Discover project stack signals:
   - `package.json`
   - `tsconfig.json`
   - `components.json`
   - Next/Vite config files
   - Tailwind config
2. Discover candidate source files.
3. Parse TypeScript and TSX files with tree-sitter.
4. Extract component declarations, imports, exports, and JSX usage.
5. Detect routes and route ownership for supported environments.
6. Extract static className and CSS variable usage where reliable.
7. Detect tests and route/component coverage edges.
8. Emit code graph nodes and edges with source provenance.
9. Compare code graph to contract graph for drift.

## Ranking And Context Selection

PageRank-style ranking is valuable, but it should not be part of the first extraction milestone.

Sequence:

1. Deterministic extraction.
2. Graph facts and source provenance.
3. Drift findings.
4. Scoped route context.
5. Ranking for token-budget optimization.

## Consequences

Positive:

- Better foundation for component reuse drift.
- Better evidence anchors than regex.
- More credible code graph for MCP context.
- Aligns Decantr with proven AI coding context patterns.

Negative:

- Adds parser dependencies and packaging work.
- Requires language-specific query maintenance.
- Dynamic imports, generated code, and computed class names may remain partial.

## Acceptance Criteria

- A React/TSX project can produce component, import, JSX usage, and route ownership graph facts.
- Every code graph fact has source provenance.
- The verifier can detect at least one component reuse drift case from code graph facts.
- MCP route context can include observed component/source facts.
- The implementation stays scoped to supported frontend stacks and does not advertise generic language coverage.
