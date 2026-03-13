# Build Tooling Reference

Production build pipeline. Entry: `decantr build` or `node cli/commands/build.js`. Output: `dist/`.

## Build Pipeline

| Step | Description | File |
|------|-------------|------|
| 1. Config | Load `decantr.config.json`, merge defaults, apply CLI flag overrides | `cli/commands/build.js` |
| 2. Resolve | BFS from `src/app.js` — resolve all static imports (decantr/* + relative) into module map | `tools/builder.js` `resolveModules()` |
| 3. Incremental check | MD5 hash all source files + HTML, compare to cache — skip rebuild if unchanged | `tools/builder.js` |
| 4. Bundle | Topological sort modules, rewrite imports/exports into IIFE with module variables (`_m0`, `_m1`, ...) | `tools/builder.js` `bundle()` |
| 5. Tree shake | Remove unused exports per-module via usage graph analysis | `tools/builder.js` `treeShakeModule()` |
| 6. Icon tree shake | Scan for `icon('name')` calls, prune unreferenced entries from `ESSENTIAL`/`EXTENDED` objects | `tools/builder.js` `treeShakeIcons()` |
| 7. Code split | Detect `import()` calls, resolve each as separate chunk, inject runtime loader | `tools/builder.js` `resolveChunks()` |
| 8. CSS extract | Scan all source for `css('...')` and `class: '...'` patterns, generate `@layer d.atoms{...}` | `tools/css-extract.js` |
| 9. CSS purge | Scan bundled JS for referenced atom class names, strip unreferenced rules | `tools/builder.js` `purgeCSS()` |
| 10. Minify | Strip comments, collapse whitespace, remove unnecessary semicolons | `tools/minify.js` |
| 11. Write | Content-hashed filenames (`app.{hash}.js`, `app.{hash}.css`), rewrite HTML script/link tags | `tools/builder.js` |
| 12. Copy public | Copy `public/` to `dist/`, transform all `.html` files with asset references | `tools/builder.js` |
| 13. Report | Print per-asset sizes (raw, gzip, brotli), compression ratios, module breakdown (top 15) | `tools/builder.js` |
| 14. Cache save | Write MD5 hashes to `node_modules/.decantr-cache/build-cache.json` | `tools/builder.js` |

## Tree Shaking

**Usage graph analysis** (`buildUsageGraph()`):
1. For each module, collect which named exports are imported by other modules
2. Side-effect imports (`import './foo'`) or namespace imports mark all exports as used (`*`)
3. Per-module, exports not in the used set are candidates for removal

**Removal logic** (`treeShakeModule()`):
- Skip if wildcard (`*`) — module has side-effect consumers
- For each unused export, count references within the module itself (`\bname\b` regex)
- If `refCount >= 2`, the export is used internally — keep it
- If `refCount < 2`, remove the full declaration (function body via brace counting, const/let via semicolon-at-depth-0)

**Icon tree shaking** (`treeShakeIcons()`):
- Scans bundled output for `icon('name')` calls
- Rewrites `ESSENTIAL = {...}` and `EXTENDED = {...}` objects to include only referenced icon entries
- Runs after main tree shake, before code splitting

## Code Splitting

**Detection**: `findDynamicImports()` scans all modules for `import('specifier')` patterns (relative or `decantr/*`).

**Chunk generation** (`resolveChunks()`):
1. For each dynamic import target not already in the main bundle, resolve its full dependency tree
2. Remove modules already in main bundle (shared code stays in main)
3. Bundle each chunk independently with tree shaking
4. Wrap chunk as `window.__decantrChunk = (function(){...})();`
5. Minify, content-hash filename: `{chunk-name}.{hash}.js`

**Runtime loader** (injected into main bundle):
```js
function __decantrLoadChunk(url) {
  return new Promise(function(r, e) {
    var s = document.createElement('script');
    s.src = url;
    s.onload = function() { r(window.__decantrChunk) };
    s.onerror = e;
    document.head.appendChild(s);
  })
}
```

Dynamic `import()` calls rewritten to `__decantrLoadChunk('./assets/{chunk-file}')`.

## Source Maps

| Property | Value |
|----------|-------|
| Spec | V3 |
| Encoding | VLQ (Base64) |
| `sourcesContent` | Embedded (original source inlined) |
| Output file | `assets/app.{hash}.js.map` |
| Reference | `//# sourceMappingURL=./app.{hash}.js.map` appended to JS |

Mappings track per-module: output line range mapped to source file + proportional source line. Column-level mapping is output-col-0 only.

## Incremental Builds

| Item | Detail |
|------|--------|
| Cache location | `{project}/node_modules/.decantr-cache/build-cache.json` |
| Hash algorithm | MD5 |
| Scope | All resolved module sources + `public/index.html` |
| Combined hash | MD5 of `JSON.stringify(fileHashes) + htmlHash` |
| Skip condition | Combined hash matches cache AND `dist/` directory exists |
| Cache write | After successful build completes |

## CSS Purging

**Class name detection** — three scan passes over bundled JS:

| Pass | Pattern | Extracts |
|------|---------|----------|
| String literals | `['"\`]([^'"\`]*?)['"\` ]` | Tokens containing `_`, split by whitespace, keep `_`-prefixed |
| `css()` calls | `css\s*\(\s*['"\`](...)['"` ]\s*\)` | All whitespace-separated tokens |
| `class:` props | `class:\s*['"](...)['"` ] | All whitespace-separated tokens |

**Rule removal**: Parses CSS within `@layer d.atoms{...}`, extracts class name from each `.class{...}` rule, removes rules whose class name is not in the referenced set.

## Minification

`tools/minify.js` — zero-dependency JS minifier.

| Step | Action |
|------|--------|
| 1 | Stash template literals (protect multi-line content) |
| 2 | Strip JSDoc (`/** */`), block comments (`/* */`), single-line comments (`//`) |
| 3 | Trim lines, skip empty lines |
| 4 | Collapse whitespace outside strings (keep space only between `\w` characters) |
| 5 | Remove semicolons before `}` |
| 6 | Collapse newlines around braces |
| 7 | Join statements — newline after `}`, space before `else`/`catch`/`finally`/`while` |
| 8 | Restore stashed template literals |

No variable renaming or advanced optimizations — structural minification only.

## Bundle Analysis

**Embeddable API** (`tools/analyzer.js`):
```js
import { analyzeBundle } from './tools/analyzer.js';
const { report, stats } = analyzeBundle(bundledJS, cssOutput, { html });
```

**Standalone**:
```
node tools/analyzer.js [dist-dir]
```

**Output**: asset table (raw/gzip/brotli per file), module breakdown (top 10 by size with bar chart), compression ratios.

**Built-in analysis** (in builder): when `analyze` is enabled, prints module breakdown (top 15) sorted by size descending, with percentage of total JS.

**Compression**: gzip (default zlib) + Brotli quality 11 reported for all assets.

## CLI Flags

| Flag | Config Key | Default | Effect |
|------|-----------|---------|--------|
| `--no-sourcemap` | `sourcemap` | `true` | Skip source map generation |
| `--no-analyze` | `analyze` | `true` | Skip module breakdown report |
| `--no-incremental` | `incremental` | `true` | Force full rebuild (ignore cache) |
| `--no-code-split` | `codeSplit` | `true` | Bundle all code into single file |
| `--no-purge` | `purgeCSS` | `true` | Keep all CSS atoms (no dead CSS elimination) |
| `--no-tree-shake` | `treeShake` | `true` | Keep all exports (no dead JS elimination) |

All features enabled by default. CLI flags override config file values.

## Config File

`decantr.config.json` in project root. The `build` section:

```json
{
  "build": {
    "outDir": "dist",
    "inline": false,
    "sourcemap": true,
    "analyze": true,
    "incremental": true,
    "codeSplit": true,
    "purgeCSS": true,
    "treeShake": true
  }
}
```

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `outDir` | `string` | `"dist"` | Output directory (relative to project root) |
| `inline` | `boolean` | `false` | Reserved — inline JS/CSS into HTML |
| `sourcemap` | `boolean` | `true` | Generate V3 source maps |
| `analyze` | `boolean` | `true` | Print module breakdown after build |
| `incremental` | `boolean` | `true` | Enable MD5 hash cache for skip-if-unchanged |
| `codeSplit` | `boolean` | `true` | Split dynamic imports into separate chunks |
| `purgeCSS` | `boolean` | `true` | Remove unreferenced CSS atom rules |
| `treeShake` | `boolean` | `true` | Remove unused JS exports |

Config is loaded first, then CLI `--no-*` flags override to `false`.

## Output Structure

```
dist/
  index.html                    # Transformed HTML with asset references
  assets/
    app.{hash}.js               # Bundled + minified JS
    app.{hash}.js.map           # Source map (if enabled)
    app.{hash}.css              # Extracted + purged atomic CSS
    {chunk}.{hash}.js           # Code-split chunks (if any)
  ...                           # Copied public/ assets (non-HTML copied as-is, HTML transformed)
```

## Key Files

| File | Role |
|------|------|
| `cli/commands/build.js` | CLI entry — config loading, flag parsing, invokes `build()` |
| `tools/builder.js` | Core build pipeline — resolve, bundle, tree shake, code split, purge, report |
| `tools/css-extract.js` | `extractClassNames()` + `generateCSS()` — scan source for atoms, emit `@layer d.atoms` |
| `tools/minify.js` | `minify()` — structural JS minification |
| `tools/analyzer.js` | `analyzeBundle()` — standalone or embeddable bundle size analysis |

---

**See also:** `reference/dev-server-routes.md`, `reference/atoms.md`
