# Decantr Compiler Redesign

**Date:** 2026-03-19
**Status:** Draft
**Author:** Claude + David

## Overview

A complete redesign of the Decantr build system, replacing the current regex-based bundler with a proper compiler architecture featuring an intermediate representation (IR), home-grown JavaScript parser, and validation layer.

## Goals

1. **Correctness** — Never produce invalid JavaScript. If it builds, it runs.
2. **Debuggability** — Clear error messages pointing to source file/line, not cryptic runtime failures.
3. **Speed** — Fast builds, fast dev server, instant HMR.
4. **Zero Runtime Deps** — Built websites remain lean with no external dependencies.
5. **Foundation for Platform** — Extensible architecture for future pipelines, cloud builds, registries.

## Non-Goals (This Phase)

- Monorepo support
- Multi-project builds
- Plugin system (future)
- Cloud deployment integration (future)

## Constraints

- **No runtime dependencies** — Built websites must be lean
- **Dev dependencies OK** — Build tooling can use Node.js stdlib
- **Home-grown** — Custom parser, no external parser libraries (acorn, etc.)
- **Backward compatible** — Existing Decantr projects should build without changes

## Current Problems

The existing builder (`tools/builder.js`) suffers from:

1. **Regex-based parsing** — Can't understand JavaScript semantics
2. **No AST** — Text manipulation instead of structured transforms
3. **No validation** — Invalid output discovered at runtime
4. **Fragile edge cases** — `\s` matching newlines, top-level await unsupported
5. **Poor error messages** — Errors appear in minified output, not source
6. **Runtime failures** — Builds succeed but chunks fail to load, atoms missing, async errors

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         DECANTR COMPILER                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Source Files                                                           │
│       │                                                                 │
│       ▼                                                                 │
│  ┌─────────┐    ┌─────────────┐    ┌───────────┐    ┌────────────┐     │
│  │ TOKENIZE │───▶│    PARSE    │───▶│  MODULE   │───▶│  TRANSFORM │     │
│  │          │    │             │    │   GRAPH   │    │  PIPELINE  │     │
│  └─────────┘    └─────────────┘    │    (IR)   │    └────────────┘     │
│                                     └───────────┘           │           │
│                                           ▲                 │           │
│                                           │                 ▼           │
│  ┌─────────┐    ┌─────────────┐    ┌─────┴─────┐    ┌────────────┐     │
│  │  WRITE  │◀───│  VALIDATE   │◀───│   EMIT    │◀───│  OPTIMIZE  │     │
│  │         │    │             │    │           │    │            │     │
│  └─────────┘    └─────────────┘    └───────────┘    └────────────┘     │
│       │                                                                 │
│       ▼                                                                 │
│  dist/ (guaranteed valid)                                               │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Phase Summary

| Phase | Input | Output | Responsibility |
|-------|-------|--------|----------------|
| **Tokenize** | Source string | Token stream | Handle strings, comments, regex correctly |
| **Parse** | Token stream | Module AST | Extract imports, exports, scope structure |
| **Graph** | Module ASTs | Module Graph IR | Build dependency graph, resolve paths |
| **Transform** | IR | IR | Tree-shake, eliminate dead code, rewrite |
| **Optimize** | IR | IR | Minify identifiers, collapse constants |
| **Emit** | IR | Output string | Generate JavaScript from IR |
| **Validate** | Output string | Pass/Fail | Syntax check via Node.js, source-map errors |

## Component Design

### 1. Tokenizer (`tools/compiler/tokenizer.js`)

Produces a token stream with source locations for error reporting.

**Token types:**
- `keyword` — import, export, const, function, async, await, from, as
- `identifier` — Button, myVar, _private, $dollar
- `punctuator` — {, }, (, ), ,, ;, =>, ...
- `string` — 'single', "double", \`template\`
- `number` — 42, 3.14, 0xFF, 1e10
- `regex` — /pattern/flags
- `comment` — Captured for source maps
- `eof` — End of file marker

**Tricky cases handled:**

1. **Regex vs division disambiguation:** Track previous token type. Regex only valid after: `=`, `(`, `[`, `,`, `;`, `!`, `&`, `|`, `:`, `?`, `{`, `}`, `return`, `throw`, `case`, or start of input. After identifier, `)`, `]`, or number, it's division.

2. **Template literals with nested expressions:** Emit `template_head`, then recursively tokenize expression, then `template_middle` or `template_tail`. Track brace depth to know when expression ends.

3. **String escape sequences:** Proper handling of `\'`, `\"`, `\\`, `\n`, `\r`, `\t`, `\uXXXX`, `\xXX`.

4. **Multi-line comments:** Track line/col through `/* ... */` for accurate source locations.

**Output format:**
```js
[
  { type: 'keyword', value: 'import', loc: { line: 1, col: 0, file: 'app.js' } },
  { type: 'punctuator', value: '{', loc: { line: 1, col: 7, file: 'app.js' } },
  // ...
]
```

### 2. Parser (`tools/compiler/parser.js`)

Module-aware parser — parses structure, not full JavaScript expressions.

**What we parse fully:**
- Import statements (all forms)
- Export statements (all forms)
- Top-level declarations (const, let, var, function, class)
- Async/await at module level

**What we just track boundaries for:**
- Function bodies (brace counting)
- Class bodies
- Object literals
- Any expression internals

**Output format (Module AST):**
```js
{
  file: 'src/pages/home.js',
  imports: [
    { type: 'named', source: 'decantr/components', names: ['Button', 'Card'], loc },
    { type: 'default', source: './header.js', name: 'Header', loc },
    { type: 'dynamic', source: './pages/settings.js', loc },
  ],
  exports: [
    { type: 'named', names: ['HomePage'], loc },
    { type: 'default', name: 'HomePage', loc },
  ],
  topLevel: [
    { kind: 'const', name: 'CONFIG', hasAwait: false, loc },
    { kind: 'function', name: 'HomePage', async: false, loc },
  ],
  hasTopLevelAwait: false,
  sourceRanges: { 'CONFIG': { start: 145, end: 203 } },
  rawSource: '...',
}
```

### 3. Module Graph IR (`tools/compiler/graph.js`)

Central data structure — all transforms operate on it.

**ModuleGraph class:**
```js
class ModuleGraph {
  modules: Map<string, ModuleNode>   // id → module
  pathToId: Map<string, string>      // absolute path → id
  entryId: string                    // Entry point
  order: string[]                    // Topological order
  chunks: Map<string, string[]>      // chunkName → moduleIds
  errors: Error[]
  warnings: Warning[]
}
```

**ModuleNode structure:**
```js
{
  id: '_m0',
  file: '/abs/path/to/app.js',
  relPath: 'src/app.js',
  ast: { /* Module AST */ },
  dependencies: [
    { moduleId: '_m1', type: 'static', names: ['createRouter'] },
    { moduleId: '_m7', type: 'dynamic', specifier: './pages/settings.js' },
  ],
  dependents: ['_m0', '_m2'],
  resolvedExports: { 'App': { kind: 'function', loc } },
  usedExports: Set(['App', 'default']),
  hoistable: true,
  needsAsyncIIFE: false,
  chunk: 'main',
}
```

### 4. Transform Pipeline (`tools/compiler/transforms/`)

Pure functions that analyze/mutate the IR.

**Core transforms:**
1. `resolveExports` — Wire up export resolution
2. `markUsedExports` — Analyze what's actually imported
3. `detectTopLevelAwait` — Flag modules with TLA
4. `treeShake` — Eliminate unused exports
5. `eliminateDeadCode` — Remove if(false){}, dev guards
6. `assignChunks` — Group dynamic imports into chunks
7. `markHoistable` — Flag modules for scope hoisting

**Pipeline execution:**
```js
const transforms = createPipeline(options);
for (const transform of transforms) {
  transform(graph);
}
```

### 5. Optimizer (`tools/compiler/optimizer.js`)

Prepares IR for efficient output.

**Optimizations:**
1. **Identifier mangling** — Scope-aware, shortest names for most-used
2. **Module ID optimization** — Shorten _m0, _m1 to a, b, c
3. **Icon pruning** — Keep only referenced icon paths
4. **Constant folding** — Evaluate static expressions

### 6. Emitter (`tools/compiler/emitter.js`)

Generates JavaScript from IR. Only place that produces output strings.

**Output types:**
- Main bundle (IIFE or async IIFE)
- Chunks (async IIFE with shared module access)
- CSS (extracted atoms)
- Source maps

**Module wrapping strategies:**
- **Hoisted** — Direct declarations, no wrapper
- **IIFE** — `const _m0 = (function(){ ... return {} })();`
- **Async IIFE** — `const _m0 = await (async function(){ ... return {} })();`

**Chunk loader:**
```js
window.__decantrChunks = {};
window.__decantrLoadChunk = function(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.onload = () => resolve(Promise.resolve(window.__decantrChunks[script.src]));
    script.onerror = () => reject(new Error('Chunk load failed: ' + url));
    document.head.appendChild(script);
  });
};
```

### 7. Validator (`tools/compiler/validator.js`)

Safety net — guarantees we never write broken JavaScript.

**Validation layers:**
1. **Syntax validation** — Use Node.js `new Function()` to parse
2. **Structure validation** — Check expected patterns present
3. **Chunk validation** — Each chunk independently valid
4. **Source map validation** — Mappings decode correctly

**On failure:** Build fails with error traced to source location.

```
Validation Error: Syntax error in chunk "pages-settings"

  Unexpected token ':'

  Traced to source:
    src/explorer/tools.js:189

    188 |   const styleDef = createMemo(() => ({
    189 |     id: '__ts-preview',
        |     ^
```

### 8. Error Reporter (`tools/compiler/reporter.js`)

Consistent, helpful error messages.

**Error format:**
```
[ERROR] Module resolution failed

  Cannot resolve 'decantr/component' from src/app.js

  Did you mean 'decantr/components'?

    5 | import { Button } from 'decantr/component';
                                ^^^^^^^^^^^^^^^^^
```

**Warning format:**
```
[WARN] Circular dependency detected

  src/a.js → src/b.js → src/a.js

  These modules will use IIFE wrapping instead of scope hoisting.
```

### 9. Dev Server Integration (`tools/compiler/dev.js`)

Reuse compiler phases for development.

**Dev mode differences:**
- Skip minification/mangling
- Skip validation (faster iteration)
- Incremental rebuilds (only re-parse changed files)
- HMR via module graph diffing

**HMR strategy:**
```js
function detectChanges(oldGraph, newGraph) {
  const changed = [];
  for (const [id, mod] of newGraph.modules) {
    const old = oldGraph.modules.get(id);
    if (!old || old.ast.rawSource !== mod.ast.rawSource) {
      changed.push(id);
    }
  }
  return changed;
}
```

## File Structure

```
tools/compiler/
├── index.js           # Main entry, build() function
├── tokenizer.js       # Source → Tokens
├── parser.js          # Tokens → Module AST
├── graph.js           # Module ASTs → Module Graph IR
├── pipeline.js        # Transform orchestration
├── transforms/
│   ├── resolve-exports.js
│   ├── mark-used.js
│   ├── tree-shake.js
│   ├── dead-code.js
│   ├── assign-chunks.js
│   └── mark-hoistable.js
├── optimizer.js       # IR optimization
├── emitter.js         # IR → Output strings
├── validator.js       # Output validation
├── reporter.js        # Error formatting
├── dev.js             # Dev server integration
└── utils/
    ├── paths.js       # Path resolution
    ├── source-map.js  # VLQ encoding
    └── hash.js        # Content hashing
```

## Migration Strategy

1. **Phase 1:** Build new compiler alongside existing builder
2. **Phase 2:** Add `--experimental-compiler` flag to CLI
3. **Phase 3:** Run both compilers, compare outputs
4. **Phase 4:** Switch default to new compiler
5. **Phase 5:** Remove old builder

## Testing Strategy

1. **Unit tests** — Each phase independently tested
2. **Snapshot tests** — Known inputs → expected outputs
3. **Fuzz testing** — Random valid JS → should never crash
4. **Integration tests** — Full builds of real projects
5. **Comparison tests** — New compiler output matches old (where old was correct)

## Success Criteria

- [ ] All existing Decantr projects build successfully
- [ ] No runtime errors from compiler bugs
- [ ] Build times equal or faster than current
- [ ] Clear error messages for all failure modes
- [ ] GitHub Pages deployments work reliably
- [ ] Chunks load correctly in all scenarios
- [ ] Top-level await supported in any module

## Future Considerations (ROADMAP.md)

### Pipeline Commands
- `decantr pull pattern:hero` — Pull patterns from registry
- `decantr scaffold saas-dashboard` — Scaffold from archetype
- `decantr deploy aws` — Deploy to cloud providers

### Cloud Platform (cloud.decantr.ai)
- Hosted builds
- Premium registries
- Enterprise configs
- API access (paid)

### Self-Hosted Registries
- Organizations run private Decantr ecosystems
- Sync with central registry
- Access control

## Appendix: Why Not Use Existing Tools?

| Tool | Why Not |
|------|---------|
| acorn | External dependency, against project ethos |
| esbuild | External dep, Go binary, less control |
| swc | External dep, Rust binary |
| rollup | External dep, plugin complexity |
| webpack | Heavy, external dep |

The Decantr compiler is purpose-built for Decantr's needs, fully understood and maintainable by the team, and has zero external dependencies.
