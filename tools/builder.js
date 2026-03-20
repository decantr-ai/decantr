import { readFile, writeFile, mkdir, stat, readdir, copyFile, rm } from 'node:fs/promises';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { gzipSync, brotliCompressSync, constants as zlibConstants } from 'node:zlib';
import { minify } from './minify.js';
import { extractClassNames, extractClassNamesFromModules, generateCSS } from './css-extract.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const frameworkSrc = resolve(__dirname, '..', 'src');

const BUILD_IMPORT_MAP = {
  'themes': 'css/theme-registry.js',
  'styles': 'css/theme-registry.js'
};

function resolveDecantrImport(subpath) {
  const mod = subpath || 'core';
  const mapped = BUILD_IMPORT_MAP[mod];
  if (mapped) return join(frameworkSrc, mapped);

  // Handle styles/community/* path
  if (mod.startsWith('styles/community/')) {
    const styleName = mod.replace('styles/community/', '');
    return join(frameworkSrc, 'css/styles/community', styleName + '.js');
  }

  // Handle styles/* (non-community)
  if (mod.startsWith('styles/')) {
    const styleName = mod.replace('styles/', '');
    return join(frameworkSrc, 'css/styles', styleName + '.js');
  }

  return join(frameworkSrc, mod, 'index.js');
}

/**
 * @param {string} source
 * @param {string} baseDir
 * @returns {Array<{resolved: string, specifier: string, names?: string[]}>}
 */
function findImports(source, baseDir) {
  const cleaned = source.replace(/`(?:[^`\\]|\\.)*`/gs, '""');
  const imports = [];

  function parseNames(raw) {
    return raw.split(',').map(n => {
      const parts = n.trim().split(/\s+as\s+/);
      return (parts[1] || parts[0]).trim();
    });
  }

  function addImport(specifier, names) {
    if (specifier.startsWith('decantr')) {
      const subpath = specifier.replace('decantr/', '').replace('decantr', 'core');
      imports.push({ resolved: resolveDecantrImport(subpath), specifier, names });
    } else if (specifier.startsWith('./') || specifier.startsWith('../')) {
      imports.push({ resolved: resolve(baseDir, specifier), specifier, names });
    }
  }

  let match;

  // Mixed: import foo, { bar } from 'mod' (must precede default/named)
  const mixedRe = /import\s+\w+\s*,\s*\{([^}]+)\}\s+from\s+['"](.+?)['"]/g;
  while ((match = mixedRe.exec(cleaned)) !== null) addImport(match[2], parseNames(match[1]));

  // Named: import { x, y } from 'mod'
  const namedRe = /import\s+\{([^}]+)\}\s+from\s+['"](.+?)['"]/g;
  while ((match = namedRe.exec(cleaned)) !== null) addImport(match[2], parseNames(match[1]));

  // Namespace: import * as foo from 'mod'
  const nsRe = /import\s+\*\s+as\s+\w+\s+from\s+['"](.+?)['"]/g;
  while ((match = nsRe.exec(cleaned)) !== null) addImport(match[1], undefined);

  // Default: import foo from 'mod'
  const defaultRe = /import\s+(\w+)\s+from\s+['"](.+?)['"]/g;
  while ((match = defaultRe.exec(cleaned)) !== null) addImport(match[2], undefined);

  // Side-effect: import 'mod'
  const sideEffectRe = /import\s+['"](.+?)['"]/g;
  while ((match = sideEffectRe.exec(cleaned)) !== null) addImport(match[1], undefined);

  // Export named from: export { x } from 'mod'
  const exportNamedRe = /export\s+\{([^}]+)\}\s+from\s+['"](.+?)['"]/g;
  while ((match = exportNamedRe.exec(cleaned)) !== null) addImport(match[2], parseNames(match[1]));

  // Export all from: export * from 'mod'
  const exportAllRe = /export\s+\*\s+from\s+['"](.+?)['"]/g;
  while ((match = exportAllRe.exec(cleaned)) !== null) addImport(match[1], undefined);

  return imports;
}

/**
 * @param {string} entrypoint
 * @returns {Promise<Map<string, string>>}
 */
async function resolveModules(entrypoint, opts = {}) {
  /** @type {Map<string, string>} */
  const modules = new Map();
  const queue = [{ resolved: resolve(entrypoint), specifier: entrypoint, from: null }];
  const visited = new Set();
  const errors = [];

  while (queue.length > 0) {
    const { resolved: filePath, specifier, from: fromFile } = queue.shift();
    if (visited.has(filePath)) continue;
    visited.add(filePath);

    try {
      const source = await readFile(filePath, 'utf-8');
      modules.set(filePath, source);
      const imports = findImports(source, dirname(filePath));
      queue.push(...imports.map(imp => ({ ...imp, from: filePath })));
    } catch (e) {
      const fromRel = fromFile ? relative(process.cwd(), fromFile) : 'entrypoint';
      const msg = specifier && specifier.startsWith('decantr')
        ? `Could not resolve import '${specifier}' from ${fromRel}`
        : `Could not resolve '${specifier || filePath}' from ${fromRel}`;
      console.error(`  [error] ${msg}`);
      errors.push(msg);
    }
  }

  if (errors.length > 0 && opts.strict !== false) {
    throw new AggregateError(
      errors.map(m => new Error(m)),
      `Failed to resolve ${errors.length} module(s)`
    );
  }

  return modules;
}

/**
 * Build a graph of which exports each module provides and which are actually used.
 * @param {Map<string, string>} modules
 * @returns {Map<string, Set<string>>} map of filePath → set of used export names
 */
function buildUsageGraph(modules) {
  /** @type {Map<string, Set<string>>} */
  const usedExports = new Map();
  for (const path of modules.keys()) usedExports.set(path, new Set());

  // For each module, find what it imports from other modules
  for (const [path, source] of modules) {
    const imports = findImports(source, dirname(path));
    for (const imp of imports) {
      if (imp.names && modules.has(imp.resolved)) {
        const used = usedExports.get(imp.resolved);
        for (const name of imp.names) used.add(name);
      } else if (!imp.names && modules.has(imp.resolved)) {
        // Side-effect import or default — mark all exports as used
        const used = usedExports.get(imp.resolved);
        used.add('*');
      }
    }
  }

  return usedExports;
}

/**
 * Dead code elimination: remove unexported functions and constants
 * that are not referenced anywhere in the module's own code.
 * @param {string} source - module source
 * @param {Set<string>} usedExports - exports actually used by consumers
 * @param {string[]} allExportedNames - all export names from the module
 * @returns {{source: string, removedExports: string[]}}
 */
function treeShakeModule(source, usedExports, allExportedNames) {
  // If wildcard is used, keep everything
  if (usedExports.has('*')) return { source, removedExports: [] };
  if (usedExports.size === 0 && allExportedNames.length > 0) {
    // Nothing is used from this module but it was imported (side-effect)
    return { source, removedExports: [] };
  }

  const removedExports = [];
  let processed = source;

  // Strip comments before reference counting to avoid false positives
  const strippedSource = source
    .replace(/\/\/[^\n]*/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '');

  for (const name of allExportedNames) {
    if (usedExports.has(name)) continue;

    // Check if name is used internally within the same module
    // Count references — if only the export declaration references it, safe to remove
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const refCount = (strippedSource.match(new RegExp(`\\b${escapedName}\\b`, 'g')) || []).length;
    // For `export const/function X`, the declaration is 1 reference.
    // Any internal usage adds more. If refCount >= 2, it's used internally — keep it.
    // For `export { X }` re-exports, X appears once — safe to remove if unused externally.
    if (refCount >= 2) continue;

    // Remove exported function declaration
    const funcRe = new RegExp(`export\\s+function\\s+${escapedName}\\s*\\(`, 'g');
    if (funcRe.test(processed)) {
      // Find the full function body by brace counting
      const startIdx = processed.search(new RegExp(`export\\s+function\\s+${escapedName}\\s*\\(`));
      if (startIdx !== -1) {
        // Step 1: Skip past the parameter list by counting parens
        // This avoids matching braces inside default params like options = {}
        const parenStart = processed.indexOf('(', startIdx);
        let parenDepth = 0;
        let bodySearchStart = parenStart;
        for (let i = parenStart; i < processed.length; i++) {
          const ch = processed[i];
          if (ch === '(') parenDepth++;
          if (ch === ')') parenDepth--;
          if (parenDepth === 0) { bodySearchStart = i + 1; break; }
        }
        // Step 2: Brace-count from AFTER the params to find function body
        let braceDepth = 0;
        let inStr = false;
        let strCh = '';
        let endIdx = startIdx;
        let foundOpen = false;
        for (let i = bodySearchStart; i < processed.length; i++) {
          const ch = processed[i];
          if (inStr) {
            if (ch === strCh && processed[i - 1] !== '\\') inStr = false;
            continue;
          }
          if (ch === '"' || ch === "'" || ch === '`') { inStr = true; strCh = ch; continue; }
          if (ch === '{') { braceDepth++; foundOpen = true; }
          if (ch === '}') { braceDepth--; }
          if (foundOpen && braceDepth === 0) { endIdx = i + 1; break; }
        }
        processed = processed.slice(0, startIdx) + processed.slice(endIdx);
        removedExports.push(name);
      }
      continue;
    }

    // Remove exported const/let
    const constRe = new RegExp(`export\\s+(?:const|let)\\s+${escapedName}\\s*=`);
    if (constRe.test(processed)) {
      const startIdx = processed.search(constRe);
      if (startIdx !== -1) {
        // Find end of statement (semicolon at depth 0)
        let depth = 0;
        let inStr = false;
        let strCh = '';
        let endIdx = startIdx;
        for (let i = startIdx; i < processed.length; i++) {
          const ch = processed[i];
          if (inStr) {
            if (ch === strCh && processed[i - 1] !== '\\') inStr = false;
            continue;
          }
          if (ch === '"' || ch === "'" || ch === '`') { inStr = true; strCh = ch; continue; }
          if (ch === '(' || ch === '{' || ch === '[') depth++;
          if (ch === ')' || ch === '}' || ch === ']') depth--;
          if (ch === ';' && depth === 0) { endIdx = i + 1; break; }
          if (ch === '\n' && depth === 0 && i > startIdx + 20) { endIdx = i; break; }
        }
        processed = processed.slice(0, startIdx) + processed.slice(endIdx);
        removedExports.push(name);
      }
    }
  }

  return { source: processed, removedExports };
}

/**
 * @param {Map<string, string>} modules
 * @param {string} entrypoint
 * @param {{ sourcemap?: boolean, treeShake?: boolean }} opts
 * @returns {{ code: string, sourcemap?: string }}
 */
function bundle(modules, entrypoint, opts = {}) {
  const moduleIds = new Map();
  let idCounter = 0;
  for (const path of modules.keys()) {
    moduleIds.set(path, `_m${idCounter++}`);
  }

  // Build usage graph for tree shaking
  const usedExports = opts.treeShake ? buildUsageGraph(modules) : null;

  // Topological sort so dependencies are defined before dependents
  const deps = new Map();
  for (const [path, source] of modules) {
    deps.set(path, findImports(source, dirname(path))
      .map(imp => imp.resolved)
      .filter(p => modules.has(p)));
  }
  const sorted = [];
  const visiting = new Set();
  const visited = new Set();
  const circular = new Set();
  function visit(path) {
    if (visited.has(path)) return;
    if (visiting.has(path)) { circular.add(path); return; }
    visiting.add(path);
    for (const dep of deps.get(path) || []) visit(dep);
    visiting.delete(path);
    visited.add(path);
    sorted.push(path);
  }
  for (const path of modules.keys()) visit(path);

  if (circular.size > 0) {
    console.warn(`  ⚠ Circular dependencies detected (${circular.size} module(s) — falling back to IIFE wrapping):`);
    for (const p of circular) console.warn(`    → ${relative(process.cwd(), p)}`);
  }

  const moduleList = sorted.map(path => [path, modules.get(path)]);

  let output = '(function(){\n';

  // Source map tracking
  const mappings = [];
  let outputLine = 1; // start after IIFE wrapper

  let totalTreeShaken = 0;
  const hoistedNames = new Set();

  for (const [path, source] of moduleList) {
    const id = moduleIds.get(path);

    // External modules (shared with main bundle) — emit a simple alias
    if (opts.externals && opts.externals.has(path)) {
      output += `const ${id}=${opts.externals.get(path)};\n`;
      outputLine++;
      continue;
    }

    // Find exported names from original source (before tree shaking)
    const exportedNames = extractExportedNames(source);

    // Tree shake if enabled
    let processedSource = source;
    if (usedExports) {
      const used = usedExports.get(path) || new Set();
      const result = treeShakeModule(source, used, exportedNames);
      processedSource = result.source;
      totalTreeShaken += result.removedExports.length;
      // Remove shaken exports from the return list
      for (const removed of result.removedExports) {
        const idx = exportedNames.indexOf(removed);
        if (idx !== -1) exportedNames.splice(idx, 1);
      }
    }

    let processed = processedSource;

    // Stash template literal contents to protect them from import/export rewriting
    const stash = [];
    processed = processed.replace(/`(?:[^`\\]|\\.)*`/gs, (m) => {
      stash.push(m);
      return `\`__TPL_${stash.length - 1}__\``;
    });

    // Rewrite re-exports: export { X, Y } from 'module' → const { X, Y } = _mN;
    processed = processed.replace(
      /export\s*\{([^}]+)\}\s*from\s*['"](.+?)['"]\s*;?/g,
      (match, names, specifier) => {
        const resolvedPath = resolveSpecifier(specifier, path);
        const targetId = moduleIds.get(resolvedPath);
        if (!targetId) return `/* unresolved re-export: ${specifier} */`;
        const bindings = names.split(',').map(n => {
          const parts = n.trim().split(/\s+as\s+/);
          const imported = parts[0].trim();
          const local = (parts[1] || imported).trim();
          return local === imported ? `${local}` : `${imported}: ${local}`;
        });
        return `const {${bindings.join(',')}} = ${targetId};`;
      }
    );

    // Rewrite export-all: export * from 'module' → spread target into module object
    processed = processed.replace(
      /export\s+\*\s+from\s+['"](.+?)['"]\s*;?/g,
      (match, specifier) => {
        const resolvedPath = resolveSpecifier(specifier, path);
        const targetId = moduleIds.get(resolvedPath);
        if (!targetId) return `/* unresolved export-all: ${specifier} */`;
        return `/* export-all: ${targetId} */`;
      }
    );

    // Collect names already declared by re-export transformations
    const declaredNames = new Set();
    for (const m of processed.matchAll(/const\s*\{([^}]+)\}\s*=\s*_m\d+;/g)) {
      m[1].split(',').forEach(n => {
        const name = n.trim().split(/\s*:\s*/);
        declaredNames.add((name[1] || name[0]).trim());
      });
    }

    // Rewrite imports to reference module variables
    processed = processed.replace(
      /import\s*\{([^}]+)\}\s*from\s*['"](.+?)['"]\s*;?/g,
      (match, names, specifier) => {
        const resolvedPath = resolveSpecifier(specifier, path);
        const targetId = moduleIds.get(resolvedPath);
        if (!targetId) return `/* unresolved: ${specifier} */`;
        const bindings = names.split(',').map(n => {
          const parts = n.trim().split(/\s+as\s+/);
          const imported = parts[0].trim();
          const local = (parts[1] || imported).trim();
          return local === imported ? `${local}` : `${imported}: ${local}`;
        }).filter(b => {
          const name = b.split(/\s*:\s*/)[0].trim();
          return !declaredNames.has(name);
        });
        if (bindings.length === 0) return `/* already declared from re-export */`;
        return `const {${bindings.join(',')}} = ${targetId};`;
      }
    );

    // Rewrite mixed imports: import foo, { bar } from 'mod'
    processed = processed.replace(
      /import\s+(\w+)\s*,\s*\{([^}]+)\}\s+from\s+['"](.+?)['"]\s*;?/g,
      (match, defaultName, names, specifier) => {
        const resolvedPath = resolveSpecifier(specifier, path);
        const targetId = moduleIds.get(resolvedPath);
        if (!targetId) return `/* unresolved: ${specifier} */`;
        const bindings = names.split(',').map(n => {
          const parts = n.trim().split(/\s+as\s+/);
          const imported = parts[0].trim();
          const local = (parts[1] || imported).trim();
          return local === imported ? `${local}` : `${imported}: ${local}`;
        });
        return `const ${defaultName} = ${targetId}.default;\nconst {${bindings.join(',')}} = ${targetId};`;
      }
    );

    // Rewrite namespace imports: import * as foo from 'mod'
    processed = processed.replace(
      /import\s+\*\s+as\s+(\w+)\s+from\s+['"](.+?)['"]\s*;?/g,
      (match, name, specifier) => {
        const resolvedPath = resolveSpecifier(specifier, path);
        const targetId = moduleIds.get(resolvedPath);
        if (!targetId) return `/* unresolved: ${specifier} */`;
        return `const ${name} = ${targetId};`;
      }
    );

    // Rewrite default imports
    processed = processed.replace(
      /import\s+(\w+)\s+from\s+['"](.+?)['"]\s*;?/g,
      (match, name, specifier) => {
        const resolvedPath = resolveSpecifier(specifier, path);
        const targetId = moduleIds.get(resolvedPath);
        if (!targetId) return `/* unresolved: ${specifier} */`;
        return `const ${name} = ${targetId}.default;`;
      }
    );

    // Restore stashed template literals
    processed = processed.replace(/`__TPL_(\d+)__`/g, (_, i) => stash[i]);

    // Rewrite export default (before other export rewrites)
    let defaultExportBinding = null;
    processed = processed.replace(
      /export\s+default\s+function\s+(\w+)\s*\(/g,
      (_, name) => { defaultExportBinding = name; return `function ${name}(`; }
    );
    if (!defaultExportBinding) {
      processed = processed.replace(
        /export\s+default\s+class\s+(\w+)/g,
        (_, name) => { defaultExportBinding = name; return `class ${name}`; }
      );
    }
    if (!defaultExportBinding) {
      processed = processed.replace(
        /export\s+default\s+/g,
        () => { defaultExportBinding = '__default'; return 'const __default = '; }
      );
    }

    // Rewrite exports to module object
    processed = processed.replace(/export\s+function\s+(\w+)/g, `function $1`);
    processed = processed.replace(/export\s+const\s+/g, 'const ');
    processed = processed.replace(/export\s+let\s+/g, 'let ');
    processed = processed.replace(/export\s*\{[^}]*\}\s*;?/g, '');

    const relPath = relative(process.cwd(), path);
    const moduleHeader = `// ${relPath}\n`;

    // Scope hoisting: for eligible modules, emit declarations directly without IIFE wrapper
    let moduleCode;
    let isHoistable = !circular.has(path) && canHoist(processedSource) && exportedNames.length > 0;

    if (isHoistable) {
      // Extract all names this module would declare at top scope
      const moduleNames = new Set();
      // Simple declarations: let/const/var name, function name
      const simpleDeclRegex = /(?:^|[;\n])\s*(?:let|const|var)\s+(\w+)|(?:^|[;\n])\s*function\s+(\w+)/g;
      let dm;
      while ((dm = simpleDeclRegex.exec(processed)) !== null) {
        const name = dm[1] || dm[2];
        if (name && !name.startsWith('_m')) moduleNames.add(name);
      }
      // Destructuring bindings: const { a, b } = expr;
      for (const dm of processed.matchAll(/const\s*\{([^}]+)\}\s*=\s*\w+;/g)) {
        dm[1].split(',').forEach(b => {
          const localName = b.trim().split(/\s*:\s*/).pop().trim();
          if (localName) moduleNames.add(localName);
        });
      }

      // Check for name conflicts with already-hoisted modules.
      // Import/re-export destructurings from _mN can be safely filtered (the variable
      // is already in scope from the source module). Other conflicts → fall back to IIFE.
      let hasNonFilterableConflict = false;
      for (const name of moduleNames) {
        if (!hoistedNames.has(name)) continue;
        // Check if this name comes ONLY from _mN destructurings (safe to filter)
        const inModuleDestructRe = new RegExp(`const\\s*\\{[^}]*\\b${name}\\b[^}]*\\}\\s*=\\s*_m\\d+;`);
        if (!inModuleDestructRe.test(processed)) {
          hasNonFilterableConflict = true;
          break;
        }
      }

      if (hasNonFilterableConflict) {
        isHoistable = false;
      }
    }

    if (isHoistable) {
      // Filter import/re-export destructurings that would collide with already-hoisted names
      processed = processed.replace(
        /const\s*\{([^}]+)\}\s*=\s*(_m\d+);/g,
        (match, bindings, modRef) => {
          const filtered = bindings.split(',')
            .map(b => b.trim())
            .filter(b => {
              const localName = b.split(/\s*:\s*/).pop().trim();
              return !hoistedNames.has(localName);
            });
          if (filtered.length === 0) return '';
          return `const {${filtered.join(',')}} = ${modRef};`;
        }
      );

      const returnEntries = [...exportedNames];
      if (defaultExportBinding) returnEntries.push(`'default':${defaultExportBinding}`);
      // Collect export-all spreads
      const exportAllTargets = [];
      for (const m of processed.matchAll(/\/\* export-all: (_m\d+) \*\//g)) {
        exportAllTargets.push(`...${m[1]}`);
      }
      const allReturnEntries = [...exportAllTargets, ...returnEntries];
      moduleCode = `${processed}\nconst ${id} = {${allReturnEntries.join(',')}};\n\n`;

      // Track ALL names this hoisted module introduces at bundle scope
      const simpleDeclRegex2 = /(?:^|[;\n])\s*(?:let|const|var)\s+(\w+)|(?:^|[;\n])\s*function\s+(\w+)/g;
      let dm;
      while ((dm = simpleDeclRegex2.exec(processed)) !== null) {
        const name = dm[1] || dm[2];
        if (name && !name.startsWith('_m')) hoistedNames.add(name);
      }
      for (const dm of processed.matchAll(/const\s*\{([^}]+)\}\s*=\s*\w+;/g)) {
        dm[1].split(',').forEach(b => {
          const localName = b.trim().split(/\s*:\s*/).pop().trim();
          if (localName) hoistedNames.add(localName);
        });
      }
    } else {
      const returnEntries = [...exportedNames];
      if (defaultExportBinding) returnEntries.push(`'default':${defaultExportBinding}`);
      const exportAllTargets = [];
      for (const m of processed.matchAll(/\/\* export-all: (_m\d+) \*\//g)) {
        exportAllTargets.push(`...${m[1]}`);
      }
      const allReturnEntries = [...exportAllTargets, ...returnEntries];
      moduleCode = `const ${id} = (function(){\n${processed}\nreturn {${allReturnEntries.join(',')}};\n})();\n\n`;
    }

    // Track source map mappings
    if (opts.sourcemap) {
      const headerLines = moduleHeader.split('\n').length - 1;
      const codeLines = moduleCode.split('\n').length - 1;
      mappings.push({
        sourceFile: relPath,
        outputStartLine: outputLine,
        outputEndLine: outputLine + headerLines + codeLines,
        sourceLines: source.split('\n').length
      });
      outputLine += headerLines + codeLines;
    }

    output += moduleHeader;
    output += moduleCode;
  }

  output += '})();\n';

  if (opts.treeShake && totalTreeShaken > 0) {
    console.log(`  Tree-shaken ${totalTreeShaken} unused exports`);
  }

  // Generate source map if requested
  let sourcemap = null;
  if (opts.sourcemap) {
    sourcemap = generateSourceMap(mappings, modules);
  }

  return { code: output, sourcemap, moduleIds };
}

/**
 * Extract all exported names from a module source.
 * @param {string} source
 * @returns {string[]}
 */
function extractExportedNames(source) {
  const exportedNames = [];
  for (const m of source.matchAll(/export\s+function\s+(\w+)/g)) exportedNames.push(m[1]);
  for (const m of source.matchAll(/export\s+(?:const|let)\s+(\w+)/g)) exportedNames.push(m[1]);
  for (const m of source.matchAll(/export\s*\{([^}]+)\}\s*from\s/g)) {
    m[1].split(',').forEach(n => {
      const name = n.trim().split(/\s+as\s+/);
      exportedNames.push((name[1] || name[0]).trim());
    });
  }
  for (const m of source.matchAll(/export\s*\{([^}]+)\}\s*;/g)) {
    if (/from\s/.test(m[0])) continue;
    m[1].split(',').forEach(n => {
      const name = n.trim().split(/\s+as\s+/);
      exportedNames.push((name[1] || name[0]).trim());
    });
  }
  return exportedNames;
}

function resolveSpecifier(specifier, fromPath) {
  if (specifier.startsWith('decantr')) {
    const subpath = specifier.replace('decantr/', '').replace('decantr', 'core');
    return resolveDecantrImport(subpath);
  }
  return resolve(dirname(fromPath), specifier);
}

/**
 * Tree-shake icon data: scan bundled output for icon('name') calls,
 * then rewrite ESSENTIAL and EXTENDED objects to only include referenced icons.
 */
function treeShakeIcons(bundled, allModuleSources) {
  const usedIcons = new Set();
  // Match direct icon() calls: icon('name') / icon('name', opts)
  const iconCallRe = /icon\(\s*['"]([a-z][a-z0-9-]*)['"](?:\s*[,)])/g;
  // Match icon props in object literals: icon: 'name' / icon:'name' / 'icon':'name'
  const iconPropRe = /\bicon['"]?\s*:\s*['"]([a-z][a-z0-9-]*)['"]/g;

  // Scan main bundle + all module sources (including chunks)
  const sources = allModuleSources ? [bundled, ...allModuleSources] : [bundled];
  for (const src of sources) {
    let m;
    while ((m = iconCallRe.exec(src)) !== null) usedIcons.add(m[1]);
    while ((m = iconPropRe.exec(src)) !== null) usedIcons.add(m[1]);
  }

  if (usedIcons.size === 0) return bundled;

  bundled = bundled.replace(
    /((?:ESSENTIAL|EXTENDED)\s*=\s*\{)([\s\S]*?)(\})/g,
    (match, prefix, body, suffix) => {
      const entries = [];
      const entryRe = /'([a-z][a-z0-9-]*)'\s*:\s*'((?:[^'\\]|\\.)*)'/g;
      let em;
      while ((em = entryRe.exec(body)) !== null) {
        if (usedIcons.has(em[1])) {
          entries.push(`'${em[1]}':'${em[2]}'`);
        }
      }
      return `${prefix}${entries.join(',')}${suffix}`;
    }
  );

  return bundled;
}

// ─── Dead Branch Elimination ─────────────────────────────────────

/**
 * Extract a brace-delimited block from source starting at startIndex.
 * startIndex must point to the opening '{'.
 * @param {string} source
 * @param {number} startIndex
 * @returns {{ block: string, end: number } | null}
 */
function extractBlock(source, startIndex) {
  let depth = 0;
  let i = startIndex;
  while (i < source.length) {
    const ch = source[i];
    // Skip string literals to avoid counting braces inside them
    if (ch === '"' || ch === "'" || ch === '`') {
      const quote = ch;
      i++;
      while (i < source.length) {
        if (source[i] === '\\') { i += 2; continue; }
        if (source[i] === quote) { i++; break; }
        i++;
      }
      continue;
    }
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return { block: source.slice(startIndex, i + 1), end: i + 1 };
    }
    i++;
  }
  return null;
}

/**
 * Dead branch elimination: remove statically-known dead code paths.
 *
 * Handles:
 * 1. `if (false/0/null/undefined/''/""/) { ... }` — remove if-block, keep else if present (unwrapped)
 * 2. `if (true/1) { ... } else { ... }` — keep if-block (unwrapped), remove else
 * 3. Dev guards: `if (typeof __DECANTR_DEV__ !== 'undefined')` and `if (globalThis.__DECANTR_DEV__)` — remove in production
 * 4. Unreachable code after `return ...;` or `throw ...;` within brace-delimited blocks
 *
 * @param {string} source
 * @returns {string}
 */
export function eliminateDeadBranches(source) {
  let result = source;

  // Patterns 1-3: Static conditionals
  // Falsy conditions — remove the if-block, keep the else-block (unwrapped) if present
  const falsyConditions = [
    /if\s*\(\s*false\s*\)/g,
    /if\s*\(\s*0\s*\)/g,
    /if\s*\(\s*null\s*\)/g,
    /if\s*\(\s*undefined\s*\)/g,
    /if\s*\(\s*''\s*\)/g,
    /if\s*\(\s*""\s*\)/g,
    // Dev guards (Pattern 3) — treated as falsy in production
    /if\s*\(\s*typeof\s+__DECANTR_DEV__\s*!==\s*['"]undefined['"]\s*\)/g,
    /if\s*\(\s*globalThis\.__DECANTR_DEV__\s*\)/g,
  ];

  for (const pattern of falsyConditions) {
    let changed = true;
    while (changed) {
      changed = false;
      pattern.lastIndex = 0;
      const match = pattern.exec(result);
      if (!match) continue;

      const ifStart = match.index;
      // Find the opening brace of the if-block
      let scan = ifStart + match[0].length;
      while (scan < result.length && /\s/.test(result[scan])) scan++;
      if (result[scan] !== '{') continue;

      const ifBlock = extractBlock(result, scan);
      if (!ifBlock) continue;

      // Check for an else clause after the if-block
      let afterIf = ifBlock.end;
      while (afterIf < result.length && /\s/.test(result[afterIf])) afterIf++;

      if (result.slice(afterIf, afterIf + 4) === 'else') {
        // There's an else block — find it and keep its body (unwrapped)
        let elseBodyStart = afterIf + 4;
        while (elseBodyStart < result.length && /\s/.test(result[elseBodyStart])) elseBodyStart++;

        if (result[elseBodyStart] === '{') {
          const elseBlock = extractBlock(result, elseBodyStart);
          if (elseBlock) {
            // Unwrap the else body (strip outer braces)
            const elseBody = elseBlock.block.slice(1, -1);
            result = result.slice(0, ifStart) + elseBody + result.slice(elseBlock.end);
            changed = true;
          }
        }
        // else if (...) — treat the entire else-if as the replacement
        else if (result.slice(elseBodyStart, elseBodyStart + 2) === 'if') {
          // Keep everything from "if" onwards (the else-if becomes the new if)
          result = result.slice(0, ifStart) + result.slice(elseBodyStart);
          changed = true;
        }
      } else {
        // No else — just remove the entire if-block
        result = result.slice(0, ifStart) + result.slice(ifBlock.end);
        changed = true;
      }
    }
  }

  // Pattern 2: Truthy conditions — keep the if-block (unwrapped), remove the else
  const truthyConditions = [
    /if\s*\(\s*true\s*\)/g,
    /if\s*\(\s*1\s*\)/g,
  ];

  for (const pattern of truthyConditions) {
    let changed = true;
    while (changed) {
      changed = false;
      pattern.lastIndex = 0;
      const match = pattern.exec(result);
      if (!match) continue;

      const ifStart = match.index;
      // Find the opening brace of the if-block
      let scan = ifStart + match[0].length;
      while (scan < result.length && /\s/.test(result[scan])) scan++;
      if (result[scan] !== '{') continue;

      const ifBlock = extractBlock(result, scan);
      if (!ifBlock) continue;

      // Unwrap the if-body (strip outer braces)
      const ifBody = ifBlock.block.slice(1, -1);

      // Check for an else clause after the if-block
      let afterIf = ifBlock.end;
      while (afterIf < result.length && /\s/.test(result[afterIf])) afterIf++;

      let endOfStatement = ifBlock.end;

      if (result.slice(afterIf, afterIf + 4) === 'else') {
        // There's an else block — find it and remove it
        let elseBodyStart = afterIf + 4;
        while (elseBodyStart < result.length && /\s/.test(result[elseBodyStart])) elseBodyStart++;

        if (result[elseBodyStart] === '{') {
          const elseBlock = extractBlock(result, elseBodyStart);
          if (elseBlock) {
            endOfStatement = elseBlock.end;
          }
        } else if (result.slice(elseBodyStart, elseBodyStart + 2) === 'if') {
          // else if — find the full else-if chain
          // Skip to the end of the else-if block
          let elseIfScan = elseBodyStart;
          // Find the condition's closing paren, then its block
          const condStart = result.indexOf('(', elseIfScan);
          if (condStart !== -1) {
            let parenDepth = 0;
            let condEnd = condStart;
            for (let j = condStart; j < result.length; j++) {
              if (result[j] === '(') parenDepth++;
              if (result[j] === ')') { parenDepth--; if (parenDepth === 0) { condEnd = j + 1; break; } }
            }
            let blockStart = condEnd;
            while (blockStart < result.length && /\s/.test(result[blockStart])) blockStart++;
            if (result[blockStart] === '{') {
              const elseIfBlock = extractBlock(result, blockStart);
              if (elseIfBlock) {
                endOfStatement = elseIfBlock.end;
              }
            }
          }
        }
      }

      result = result.slice(0, ifStart) + ifBody + result.slice(endOfStatement);
      changed = true;
    }
  }

  // Pattern 4 (dead code after return/throw) removed — regex-based approach cannot
  // safely handle string literals containing semicolons (e.g. '&amp;'), regex literals,
  // or multi-line expressions. The savings are negligible and the risk of corrupting
  // valid code is too high.

  return result;
}

// ─── Scope Hoisting ──────────────────────────────────────────────

/**
 * Check if a module source is eligible for scope hoisting.
 * A module can be hoisted if it has no top-level side effects
 * and no `this` at module scope.
 * @param {string} source
 * @returns {boolean}
 */
export function canHoist(source) {
  const lines = source.split('\n');
  let braceDepth = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    // Track brace depth
    for (const ch of trimmed) {
      if (ch === '{') braceDepth++;
      else if (ch === '}') braceDepth--;
    }

    // At top level (braceDepth === 0 or just returned to 0)
    if (braceDepth <= 0) {
      // this at module scope — check before skipping declarations
      // since `const x = this.y` is a declaration but still references `this`
      if (trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('/*') &&
          !trimmed.startsWith('*') && !trimmed.startsWith('*/') &&
          /\bthis\b/.test(trimmed)) {
        return false;
      }
      // Skip declarations, empty lines, comments
      if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*') ||
          trimmed.startsWith('*') || trimmed.startsWith('*/') ||
          trimmed.startsWith('const ') || trimmed.startsWith('let ') ||
          trimmed.startsWith('var ') || trimmed.startsWith('function ') ||
          trimmed.startsWith('export ') || trimmed.startsWith('import ') ||
          trimmed.startsWith('return ') || trimmed === '}' || trimmed === '{') {
        continue;
      }
      // If we see a bare function/method call (likely a side effect), can't hoist
      if (/^\w+[\w.]*\s*\(/.test(trimmed) || /^new\s+/.test(trimmed)) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Generate a v3 source map JSON string.
 * @param {Array<{sourceFile: string, outputStartLine: number, outputEndLine: number, sourceLines: number}>} mappings
 * @param {Map<string, string>} modules
 * @returns {string}
 */
function generateSourceMap(mappings, modules) {
  const sources = [];
  const sourcesContent = [];

  for (const m of mappings) {
    sources.push(m.sourceFile);
    sourcesContent.push(modules.get(resolve(process.cwd(), m.sourceFile)) || '');
  }

  // Build VLQ mappings: for each output line, map to the corresponding source file + line
  const vlqMappings = [];
  let prevSourceIdx = 0;
  let prevSourceLine = 0;
  let prevSourceCol = 0;

  // Pre-compute output line → source mapping
  const lineMap = new Map();
  for (let i = 0; i < mappings.length; i++) {
    const m = mappings[i];
    const sourceLineCount = m.sourceLines;
    const outputLineCount = m.outputEndLine - m.outputStartLine;
    const linesPerSource = sourceLineCount / Math.max(outputLineCount, 1);

    for (let outLine = m.outputStartLine; outLine < m.outputEndLine; outLine++) {
      const sourceLine = Math.min(
        Math.floor((outLine - m.outputStartLine) * linesPerSource),
        sourceLineCount - 1
      );
      lineMap.set(outLine, { sourceIdx: i, sourceLine });
    }
  }

  // Get total output lines
  const maxLine = mappings.length > 0
    ? mappings[mappings.length - 1].outputEndLine
    : 0;

  for (let line = 0; line <= maxLine; line++) {
    const info = lineMap.get(line);
    if (!info) {
      vlqMappings.push('');
      continue;
    }

    const sourceIdxDelta = info.sourceIdx - prevSourceIdx;
    const sourceLineDelta = info.sourceLine - prevSourceLine;
    const sourceColDelta = 0 - prevSourceCol;

    // Segment: [outputCol, sourceIdx, sourceLine, sourceCol]
    vlqMappings.push(vlqEncode(0) + vlqEncode(sourceIdxDelta) + vlqEncode(sourceLineDelta) + vlqEncode(sourceColDelta));

    prevSourceIdx = info.sourceIdx;
    prevSourceLine = info.sourceLine;
    prevSourceCol = 0;
  }

  return JSON.stringify({
    version: 3,
    file: 'app.js',
    sources,
    sourcesContent,
    mappings: vlqMappings.join(';')
  });
}

/**
 * VLQ encode a single integer for source maps.
 * @param {number} value
 * @returns {string}
 */
function vlqEncode(value) {
  const VLQ_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let vlq = value < 0 ? ((-value) << 1) + 1 : (value << 1);
  let encoded = '';
  do {
    let digit = vlq & 0x1f;
    vlq >>>= 5;
    if (vlq > 0) digit |= 0x20;
    encoded += VLQ_CHARS[digit];
  } while (vlq > 0);
  return encoded;
}

function hashContent(content) {
  return createHash('md5').update(content).digest('hex').slice(0, 8);
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function brotliSize(content) {
  return brotliCompressSync(Buffer.from(content), {
    params: { [zlibConstants.BROTLI_PARAM_QUALITY]: 11 }
  }).length;
}

/**
 * Detect route-based dynamic imports for code splitting.
 * Finds patterns like: `component: () => import('./pages/home.js')`
 * @param {string} source
 * @param {string} baseDir
 * @returns {Array<{specifier: string, resolved: string}>}
 */
function findDynamicImports(source, baseDir) {
  const results = [];
  const re = /import\s*\(\s*['"](.+?)['"]\s*\)/g;
  let m;
  while ((m = re.exec(source)) !== null) {
    const spec = m[1];
    if (spec.startsWith('./') || spec.startsWith('../')) {
      results.push({ specifier: spec, resolved: resolve(baseDir, spec) });
    } else if (spec.startsWith('decantr')) {
      const subpath = spec.replace('decantr/', '').replace('decantr', 'core');
      results.push({ specifier: spec, resolved: resolveDecantrImport(subpath) });
    }
  }
  return results;
}

/**
 * Code splitting: resolve dynamic imports into separate chunks.
 * @param {Map<string, string>} mainModules - modules in the main bundle
 * @param {string} projectRoot
 * @returns {Promise<Map<string, Map<string, string>>>} chunkName → modules
 */
async function resolveChunks(mainModules, projectRoot) {
  /** @type {Map<string, Map<string, string>>} */
  const chunks = new Map();

  // Scan all modules for dynamic imports
  const dynamicImports = [];
  for (const [path, source] of mainModules) {
    const dImports = findDynamicImports(source, dirname(path));
    dynamicImports.push(...dImports);
  }

  if (dynamicImports.length === 0) return chunks;

  // For each dynamic import, resolve its dependency tree as a separate chunk
  for (const { specifier, resolved: entryPath } of dynamicImports) {
    if (mainModules.has(entryPath)) continue; // Already in main bundle

    const chunkName = specifier
      .replace(/^\.\//, '').replace(/\.js$/, '')
      .replace(/[/\\]/g, '-');

    if (chunks.has(chunkName)) continue;

    const chunkModules = await resolveModules(entryPath, { strict: false });
    // Shared modules are kept in the map so dependency resolution works;
    // the build step marks them as externals so chunks alias them from
    // window.__decantrShared instead of duplicating the code.

    if (chunkModules.size > 0) {
      chunks.set(chunkName, chunkModules);
    }
  }

  return chunks;
}

/**
 * Rewrite dynamic import() calls to load chunk files.
 * @param {string} bundled - main bundle code
 * @param {Map<string, string>} chunkFileMap - specifier → chunk filename
 * @returns {string}
 */
function rewriteDynamicImports(bundled, chunkFileMap) {
  return bundled.replace(
    /import\s*\(\s*['"](.+?)['"]\s*\)/g,
    (match, specifier) => {
      for (const [spec, file] of chunkFileMap) {
        if (specifier === spec || specifier.endsWith(spec)) {
          return `__decantrLoadChunk('./assets/${file}')`;
        }
      }
      return match;
    }
  );
}

/** Runtime chunk loader injected into the main bundle (with retry + error UI) */
const CHUNK_LOADER = `window.__decantrChunks={};
function __decantrLoadChunk(url,_attempt){_attempt=_attempt||0;return new Promise(function(r,e){var s=document.createElement('script');s.src=url;s.onload=function(){r(window.__decantrChunks[s.src])};s.onerror=function(){if(_attempt<2){s.remove();setTimeout(function(){__decantrLoadChunk(url,_attempt+1).then(r,e)},1000*(_attempt+1))}else{document.body.innerHTML='<div style="font-family:system-ui;padding:2rem;text-align:center"><h2>Failed to load application chunk</h2><p>Please check your connection and <a href=\"javascript:location.reload()\">reload the page</a>.</p></div>';e(new Error('Chunk load failed: '+url))}};document.head.appendChild(s)})}
`;

// ─── Incremental Build Cache ─────────────────────────────────────

/**
 * @param {string} cacheDir
 * @returns {Promise<{fileHashes: Record<string, string>, buildHash: string} | null>}
 */
async function loadBuildCache(cacheDir) {
  try {
    const raw = await readFile(join(cacheDir, 'build-cache.json'), 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * @param {string} cacheDir
 * @param {Record<string, string>} fileHashes
 * @param {string} buildHash
 */
async function saveBuildCache(cacheDir, fileHashes, buildHash) {
  await mkdir(cacheDir, { recursive: true });
  await writeFile(join(cacheDir, 'build-cache.json'), JSON.stringify({ fileHashes, buildHash }));
}

/**
 * Compute hashes for all source files.
 * @param {Map<string, string>} modules
 * @returns {Record<string, string>}
 */
function computeFileHashes(modules) {
  const hashes = {};
  for (const [path, source] of modules) {
    hashes[path] = createHash('md5').update(source).digest('hex');
  }
  return hashes;
}

/**
 * Check if any files changed since last build.
 * @param {Record<string, string>} currentHashes
 * @param {Record<string, string>} cachedHashes
 * @returns {boolean}
 */
function hasChanges(currentHashes, cachedHashes) {
  const currentKeys = Object.keys(currentHashes);
  const cachedKeys = Object.keys(cachedHashes);
  if (currentKeys.length !== cachedKeys.length) return true;
  for (const key of currentKeys) {
    if (currentHashes[key] !== cachedHashes[key]) return true;
  }
  return false;
}

// ─── Phase 1: Build-Time Style Elimination ───────────────────────

// Core addon styles live in src/css/styles/addons/, community styles in community/.
// Only auradecantism remains a built-in in theme-registry.js.
const STYLE_IMPORTS = {
  'clean': { varName: 'clean', file: 'clean.js', dir: 'addons', addon: true },
  'glassmorphism': { varName: 'glassmorphism', file: 'glassmorphism.js', dir: 'addons', addon: true },
  'retro': { varName: 'retro', file: 'retro.js', dir: 'community', addon: true },
  'launchpad': { varName: 'launchpad', file: 'launchpad.js', dir: 'community', addon: true },
  'liquid-glass': { varName: 'liquidGlass', file: 'liquid-glass.js', dir: 'community', addon: true },
  'dopamine': { varName: 'dopamine', file: 'dopamine.js', dir: 'community', addon: true },
  'prismatic': { varName: 'prismatic', file: 'prismatic.js', dir: 'community', addon: true },
  'bioluminescent': { varName: 'bioluminescent', file: 'bioluminescent.js', dir: 'community', addon: true },
  'editorial': { varName: 'editorial', file: 'editorial.js', dir: 'community', addon: true },
};

/**
 * Detect which styles are referenced in user code.
 * Always includes the default style (auradecantism) and any style
 * referenced in essence/config files.
 * @param {Map<string, string>} modules
 * @param {string} projectRoot
 * @returns {Promise<Set<string>>}
 */
async function detectUsedStyles(modules, projectRoot) {
  const used = new Set(['auradecantism']);

  // Check essence and config for style declarations
  try {
    const essRaw = await readFile(join(projectRoot, 'decantr.essence.json'), 'utf-8').catch(() => null);
    if (essRaw) {
      const ess = JSON.parse(essRaw);
      if (ess.vintage?.style) used.add(ess.vintage.style);
      if (ess.sections) {
        for (const s of ess.sections) {
          if (s.vintage?.style) used.add(s.vintage.style);
        }
      }
    }
    const cfgRaw = await readFile(join(projectRoot, 'decantr.config.json'), 'utf-8').catch(() => null);
    if (cfgRaw) {
      const cfg = JSON.parse(cfgRaw);
      if (cfg.style) used.add(cfg.style);
    }
  } catch { /* ignore parse errors */ }

  // Scan user modules for setStyle()/setTheme() calls
  const styleRe = /(?:setStyle|setTheme)\s*\(\s*['"]([^'"]+)['"]/g;
  for (const [path, source] of modules) {
    if (path.includes(frameworkSrc)) continue; // skip framework modules
    let m;
    while ((m = styleRe.exec(source)) !== null) {
      used.add(m[1]);
    }
  }

  return used;
}

/**
 * Remove unused addon style modules from the bundle.
 * Since non-core styles now live in styles/addons/ and are imported by user code
 * (not by theme-registry.js), this eliminates unused addon module files from the
 * module map so they don't end up in the bundle.
 * @param {Map<string, string>} modules
 * @param {Set<string>} usedStyles
 * @param {string} frameworkSrcDir
 * @returns {number} Number of eliminated addon modules
 */
function eliminateUnusedAddonStyles(modules, usedStyles, frameworkSrcDir) {
  let eliminated = 0;
  for (const [id, info] of Object.entries(STYLE_IMPORTS)) {
    if (!info.addon) continue;
    if (!usedStyles.has(id)) {
      const addonPath = join(frameworkSrcDir, 'css', 'styles', info.dir || 'addons', info.file);
      if (modules.delete(addonPath)) eliminated++;
    }
  }
  return eliminated;
}

// ─── Phase 3: Component CSS Pruning ──────────────────────────────

/** Map component file names to componentCSSMap keys */
const COMPONENT_CSS_MAP = {
  'button.js': ['button'], 'spinner.js': ['spinner'], 'input.js': ['input'],
  'textarea.js': ['textarea'], 'checkbox.js': ['checkbox'], 'switch.js': ['switch'],
  'select.js': ['select', 'shared-option'], 'card.js': ['card'], 'badge.js': ['badge'],
  'modal.js': ['modal'], 'tabs.js': ['tabs'], 'accordion.js': ['accordion'],
  'collapsible.js': ['accordion'], 'separator.js': ['separator'],
  'breadcrumb.js': ['breadcrumb'], 'table.js': ['table'], 'avatar.js': ['avatar'],
  'progress.js': ['progress'], 'skeleton.js': ['skeleton'], 'tooltip.js': ['tooltip'],
  'alert.js': ['alert'], 'toast.js': ['toast'], 'notification.js': ['toast'],
  'message.js': ['toast'], 'chip.js': ['chip'], 'dropdown.js': ['dropdown'],
  'drawer.js': ['drawer'], 'pagination.js': ['pagination'],
  'radiogroup.js': ['radio-group'], 'popover.js': ['popover'],
  'combobox.js': ['combobox', 'shared-option'], 'slider.js': ['slider'],
  'toggle.js': ['toggle'], 'typography.js': ['typography'], 'kbd.js': ['kbd'],
  'resizable.js': ['resizable'], 'scroll-area.js': ['scroll-area'],
  'splitter.js': ['splitter'], 'menu.js': ['menu'], 'steps.js': ['steps'],
  'segmented.js': ['segmented-control'], 'context-menu.js': ['context-menu'],
  'navigation-menu.js': ['navigation-menu'], 'back-top.js': ['back-top'],
  'input-group.js': ['input'], 'input-number.js': ['input-number'],
  'input-otp.js': ['input-otp'], 'rate.js': ['rate'],
  'color-picker.js': ['color-picker'], 'color-palette.js': ['color-palette'],
  'date-picker.js': ['date-picker'], 'time-picker.js': ['time-picker'],
  'upload.js': ['upload'], 'transfer.js': ['transfer'], 'cascader.js': ['cascader', 'shared-option'],
  'mentions.js': ['mentions'], 'label.js': ['label'], 'form.js': ['input'],
  'date-range-picker.js': ['date-range-picker', 'date-picker'],
  'time-range-picker.js': ['time-range-picker', 'time-picker'],
  'range-slider.js': ['range-slider'], 'tree-select.js': ['tree-select', 'shared-option'],
  'data-table.js': ['data-table', 'table'], 'avatar-group.js': ['avatar-group', 'avatar'],
  'tag.js': ['tag'], 'list.js': ['list'], 'tree.js': ['tree'],
  'descriptions.js': ['descriptions'], 'calendar.js': ['calendar'],
  'carousel.js': ['carousel'], 'empty.js': ['empty'], 'placeholder.js': ['placeholder'], 'image.js': ['image'],
  'timeline.js': ['timeline'], 'hover-card.js': ['hover-card'],
  'alert-dialog.js': ['alert-dialog', 'modal'], 'result.js': ['result'],
  'popconfirm.js': ['popconfirm'], 'command.js': ['command-palette', 'shared-option'],
  'float-button.js': ['float-button'], 'tour.js': ['tour'],
  'datetime-picker.js': ['datetime-picker', 'date-picker', 'time-picker'],
  'masked-input.js': ['input'], 'banner.js': ['alert'],
  'sortable-list.js': ['list'],
};

/**
 * Detect which componentCSSMap keys are needed based on the dependency graph.
 * @param {Map<string, string>} modules
 * @returns {Set<string>}
 */
function detectUsedComponents(modules) {
  const usedKeys = new Set(['global']); // always include global
  const componentDir = join(frameworkSrc, 'components');

  for (const path of modules.keys()) {
    if (!path.startsWith(componentDir)) continue;
    const fileName = path.slice(componentDir.length + 1);
    const keys = COMPONENT_CSS_MAP[fileName];
    if (keys) {
      keys.forEach(k => usedKeys.add(k));
    } else if (fileName && !fileName.startsWith('_') && fileName.endsWith('.js')) {
      // Unknown component not in map — derive CSS key from filename to avoid pruning its styles
      usedKeys.add(fileName.replace('.js', ''));
    }
  }

  return usedKeys;
}

/**
 * Prune componentCSSMap to only include used sections.
 * @param {string} source
 * @param {Set<string>} usedKeys
 * @returns {string}
 */
function pruneComponentCSS(source, usedKeys) {
  const mapStart = source.indexOf('export const componentCSSMap = {');
  const afterMarker = '\nexport const componentCSS = ';
  const mapEnd = source.indexOf(afterMarker);

  if (mapStart === -1 || mapEnd === -1) return source;

  const header = source.slice(0, mapStart + 'export const componentCSSMap = {\n'.length);
  // Strip the closing }; from mapBody so it isn't lost when the last section is pruned
  const closingBraceIdx = source.lastIndexOf('};', mapEnd);
  const mapBody = source.slice(header.length, closingBraceIdx);
  const footer = source.slice(closingBraceIdx);

  // Split by section separator comments (═══)
  const sections = mapBody.split(/(?=\s*\/\/ ═{3,})/);

  // Group fragments: comment headers associate with the next key fragment
  const groups = [];
  let commentBuffer = [];
  for (const section of sections) {
    const keyMatch = section.match(/(?:'([^']+)'|"([^"]+)"|(\w[\w]*?))\s*:\s*\[/);
    if (keyMatch) {
      const key = keyMatch[1] || keyMatch[2] || keyMatch[3];
      groups.push({ fragments: [...commentBuffer, section], key });
      commentBuffer = [];
    } else {
      commentBuffer.push(section);
    }
  }

  const kept = [];
  for (const group of groups) {
    if (usedKeys.has(group.key)) {
      kept.push(...group.fragments);
    }
  }

  return header + kept.join('') + footer;
}

// ─── Phase 4: Static CSS Extraction ──────────────────────────────

/**
 * Check if all css() usage is statically analyzable (no dynamic atom construction).
 * Returns false if define() is used or css() has non-string-literal arguments.
 * @param {Map<string, string>} modules
 * @returns {boolean}
 */
function canStaticExtract(modules) {
  for (const [path, source] of modules) {
    if (path.includes(frameworkSrc)) continue; // skip framework code
    // Check for define() calls (runtime custom atoms)
    if (/\bdefine\s*\(/.test(source)) return false;
    // Check for template literal or concatenation in css() args
    if (/css\s*\(\s*`/.test(source)) return false;
    // Check for variable-based css() calls: css(someVar)
    if (/css\s*\(\s*[a-zA-Z_$]\w*\s*[,)]/.test(source) && !/css\s*\(\s*['"]/.test(source)) {
      return false;
    }
  }
  return true;
}

/**
 * Replace css/index.js with a slim production version.
 * Removes atom resolver + runtime injection; keeps theme-registry re-exports.
 * @param {string} source - original css/index.js source
 * @returns {string}
 */
function staticExtractTransform(source) {
  // Extract the theme-registry re-export list
  const themeMatch = source.match(/export\s*\{([^}]+)\}\s*from\s*['"]\.\/theme-registry\.js['"];?/);
  const themeExports = themeMatch ? themeMatch[1].trim() : '';

  return `export { ${themeExports} } from './theme-registry.js';
export function css(){var r=[];for(var i=0;i<arguments.length;i++){if(!arguments[i])continue;arguments[i].split(/\\s+/).forEach(function(p){if(p)r.push(p==='_group'?'d-group':p==='_peer'?'d-peer':p)})}return r.join(' ')}
export function define(){}
export function sanitize(s){if(typeof s!=='string')return '';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;')}
`;
}

// ─── CSS Purging ─────────────────────────────────────────────────

/**
 * Purge unused CSS atoms from generated CSS output.
 * Scans the bundled JS for class name references and removes unreferenced atoms.
 * @param {string} cssOutput - generated CSS
 * @param {string} bundledJS - bundled JavaScript
 * @returns {{ css: string, purged: number }}
 */
function purgeCSS(cssOutput, bundledJS) {
  if (!cssOutput) return { css: '', purged: 0 };

  // Extract all string literals from bundled JS to find referenced class names
  const referencedClasses = new Set();
  const strRe = /['"`]([^'"`]*?)['"` ]/g;
  let m;
  while ((m = strRe.exec(bundledJS)) !== null) {
    const val = m[1];
    if (/^_[a-z]/.test(val) || val.includes(' _')) {
      val.split(/\s+/).forEach(c => { if (/^_[a-zA-Z]/.test(c)) referencedClasses.add(c); });
    }
  }

  // Also scan for css() calls more precisely
  const cssCallRe = /css\s*\(\s*['"`]([^'"`]*?)['"`]\s*\)/g;
  while ((m = cssCallRe.exec(bundledJS)) !== null) {
    m[1].split(/\s+/).forEach(c => { if (c) referencedClasses.add(c); });
  }

  // Also scan class: 'xxx' patterns in the bundled output
  const classPropRe = /class:\s*['"]([^'"]*?)['"]/g;
  while ((m = classPropRe.exec(bundledJS)) !== null) {
    m[1].split(/\s+/).forEach(c => { if (c) referencedClasses.add(c); });
  }

  // Parse CSS rules and keep only referenced ones
  // Output may contain multiple @layer d.atoms{...} blocks, some wrapping @media queries
  const blocks = cssOutput.split(/(?=@layer\s+d\.atoms\s*\{)/);
  const keptBlocks = [];
  let totalPurged = 0;

  for (const block of blocks) {
    if (!block.trim()) continue;

    // Check for @media wrapper inside the block
    const mediaMatch = block.match(
      /^(@layer\s+d\.atoms\s*\{)\s*(@media\s*\([^)]+\)\s*\{)([\s\S]*?)\}\s*\}$/
    );

    if (mediaMatch) {
      // Responsive block: @layer d.atoms{@media(...){...rules...}}
      const [, layerOpen, mediaOpen, body] = mediaMatch;
      const { kept, purged } = purgeRules(body, referencedClasses);
      totalPurged += purged;
      if (kept.length > 0) {
        keptBlocks.push(`${layerOpen}${mediaOpen}${kept.join('')}}}`);
      }
    } else {
      // Plain block: @layer d.atoms{...rules...}
      const plainMatch = block.match(/^(@layer\s+d\.atoms\s*\{)([\s\S]*?)\}$/);
      if (plainMatch) {
        const [, layerOpen, body] = plainMatch;
        const { kept, purged } = purgeRules(body, referencedClasses);
        totalPurged += purged;
        if (kept.length > 0) {
          keptBlocks.push(`${layerOpen}${kept.join('')}}`);
        }
      } else {
        keptBlocks.push(block); // Unknown format, keep as-is
      }
    }
  }

  return { css: keptBlocks.join(''), purged: totalPurged };
}

/**
 * Extract and purge individual CSS rules from a block body.
 * @param {string} body - CSS rules string
 * @param {Set<string>} referencedClasses - set of referenced class names
 * @returns {{ kept: string[], purged: number }}
 */
function purgeRules(body, referencedClasses) {
  const ruleRe = /\.([^\s{]+)\{[^}]*\}/g;
  const kept = [];
  let purged = 0;
  let match;
  while ((match = ruleRe.exec(body)) !== null) {
    const className = match[1];
    const unescaped = className.replace(/\\/g, '');
    if (referencedClasses.has(className) || referencedClasses.has(unescaped)) {
      kept.push(match[0]);
    } else {
      purged++;
    }
  }
  return { kept, purged };
}

// ─── Main Build Function ─────────────────────────────────────────

/**
 * @param {string} projectRoot
 * @param {{ outDir?: string, inline?: boolean, sourcemap?: boolean, analyze?: boolean, incremental?: boolean, codeSplit?: boolean, purgeCSS?: boolean, treeShake?: boolean }} options
 */
export async function build(projectRoot, options = {}) {
  const outDir = join(projectRoot, options.outDir || 'dist');
  const entrypoint = join(projectRoot, 'src', 'app.js');
  const cacheDir = join(projectRoot, 'node_modules', '.decantr-cache');

  const enableSourcemap = options.sourcemap !== false;
  const enableAnalyze = options.analyze !== false;
  const enableIncremental = options.incremental !== false;
  const enableCodeSplit = options.codeSplit !== false;
  const enablePurgeCSS = options.purgeCSS !== false;
  const enableTreeShake = options.treeShake !== false;

  // Load config for build-time checks and budget validation
  let config = null;
  try {
    const configRaw = await readFile(join(projectRoot, 'decantr.config.json'), 'utf-8').catch(() => null);
    if (configRaw) config = JSON.parse(configRaw);
  } catch { /* ignore */ }

  // Essence-config consistency check
  try {
    const essenceRaw = await readFile(join(projectRoot, 'decantr.essence.json'), 'utf-8').catch(() => null);

    if (!essenceRaw) {
      console.log('  ⚠ No decantr.essence.json found — building without essence validation');
    } else {
      try {
        const essence = JSON.parse(essenceRaw);
        if (config) {
          const eStyle = essence.vintage?.style;
          const eMode = essence.vintage?.mode;
          if (eStyle && config.style && eStyle !== config.style) {
            console.log(`  ⚠ Style mismatch: essence="${eStyle}", config="${config.style}". Essence is authoritative.`);
          }
          if (eMode && config.mode && eMode !== config.mode) {
            console.log(`  ⚠ Mode mismatch: essence="${eMode}", config="${config.mode}". Essence is authoritative.`);
          }
        }
      } catch { /* essence parse error — not our problem at build time */ }
    }
  } catch { /* ignore */ }

  console.log('\n  decantr build\n');

  // Resolve modules
  console.log('  Resolving modules...');
  const modules = await resolveModules(entrypoint);
  console.log(`  Found ${modules.size} modules`);

  // Incremental build check
  if (enableIncremental) {
    const currentHashes = computeFileHashes(modules);
    const cache = await loadBuildCache(cacheDir);

    // Also check if HTML, config, or essence changed
    let htmlHash = '';
    let configHash = '';
    let essenceHash = '';
    try {
      const htmlContent = await readFile(join(projectRoot, 'public', 'index.html'), 'utf-8');
      htmlHash = createHash('md5').update(htmlContent).digest('hex');
    } catch {}
    try {
      const configContent = await readFile(join(projectRoot, 'decantr.config.json'), 'utf-8');
      configHash = createHash('md5').update(configContent).digest('hex');
    } catch {}
    try {
      const essenceContent = await readFile(join(projectRoot, 'decantr.essence.json'), 'utf-8');
      essenceHash = createHash('md5').update(essenceContent).digest('hex');
    } catch {}

    const combinedHash = createHash('md5')
      .update(JSON.stringify(currentHashes))
      .update(htmlHash)
      .update(configHash)
      .update(essenceHash)
      .digest('hex');

    if (cache && cache.buildHash === combinedHash) {
      // Check dist exists
      try {
        await stat(outDir);
        console.log('  No changes detected — skipping rebuild (cached)');
        console.log(`  Output: ${relative(process.cwd(), outDir)}/\n`);
        return;
      } catch {
        // dist was deleted, rebuild
      }
    }

    // Save cache after build (at end)
    var _currentHashes = currentHashes;
    var _combinedHash = combinedHash;
  }

  // ─── Build-time optimizations ────────────────────────────────────

  // Phase 1+3: Style elimination + Component CSS detection (parallel)
  const [usedStyles, usedCSSKeys] = await Promise.all([
    detectUsedStyles(modules, projectRoot),
    Promise.resolve(detectUsedComponents(modules))
  ]);
  // Eliminate unused addon style modules from bundle
  const addonEliminated = eliminateUnusedAddonStyles(modules, usedStyles, frameworkSrc);
  if (addonEliminated > 0) {
    console.log(`  Eliminated ${addonEliminated} unused addon style(s)`);
  }
  const componentsPath = join(frameworkSrc, 'css', 'components.js');
  if (modules.has(componentsPath)) {
    const originalSource = modules.get(componentsPath);
    const totalKeys = (originalSource.match(/\]\s*\.join\(/g) || []).length;
    const prunedCount = totalKeys - usedCSSKeys.size;
    if (prunedCount > 0) {
      modules.set(componentsPath, pruneComponentCSS(originalSource, usedCSSKeys));
      console.log(`  Pruned ${prunedCount}/${totalKeys} unused component CSS sections`);
    }
  }

  // Phase 4: Static CSS extraction — replace css() with passthrough
  const cssIndexPath = join(frameworkSrc, 'css', 'index.js');
  const enableStaticExtract = canStaticExtract(modules);
  if (enableStaticExtract && modules.has(cssIndexPath)) {
    modules.set(cssIndexPath, staticExtractTransform(modules.get(cssIndexPath)));
    // Remove modules no longer imported after transform
    modules.delete(join(frameworkSrc, 'css', 'atoms.js'));
    modules.delete(join(frameworkSrc, 'css', 'runtime.js'));
    console.log('  Static CSS extraction enabled (css() → passthrough)');
  }

  // Clean previous build output
  await rm(outDir, { recursive: true, force: true });

  // Bundle (with tree shaking)
  console.log('  Bundling...');
  const { code: bundled, sourcemap: rawSourcemap, moduleIds: mainModuleIds } = bundle(modules, entrypoint, {
    sourcemap: enableSourcemap,
    treeShake: enableTreeShake
  });

  // Tree-shake icons
  console.log('  Tree-shaking icons...');
  let processedBundle = treeShakeIcons(bundled, [...modules.values()]);

  // Dead branch elimination
  processedBundle = eliminateDeadBranches(processedBundle);

  // Code splitting: detect dynamic imports and create chunks
  /** @type {Map<string, string>} specifier → chunkFilename */
  const chunkFileMap = new Map();
  const chunkOutputs = [];

  if (enableCodeSplit) {
    console.log('  Code splitting...');
    const chunks = await resolveChunks(modules, projectRoot);

    if (chunks.size > 0) {
      // Track which main modules are actually used as externals by chunks
      const usedSharedIds = new Set();

      for (const [chunkName, chunkModules] of chunks) {
        // Build externals map: shared modules alias from the global registry
        const externals = new Map();
        for (const path of chunkModules.keys()) {
          if (mainModuleIds.has(path)) {
            const moduleId = mainModuleIds.get(path);
            externals.set(path, `window.__decantrShared.${moduleId}`);
            usedSharedIds.add(moduleId);
          }
        }

        const { code: chunkCode, moduleIds: chunkModuleIds } = bundle(chunkModules, '', { treeShake: enableTreeShake, externals });
        // Inject return statement for the last module so the outer IIFE returns its exports
        // The entry module (the dynamic import target) is first in the moduleIds map
        const entryModuleId = [...chunkModuleIds.values()][0];
        const wrappedChunk = chunkCode.replace(/\}\)\(\);\n?$/, `return ${entryModuleId};\n})();\n`).replace(/^\(function\(\)/, 'window.__decantrChunks[document.currentScript.src]=(function()');
        const minifiedChunk = minify(wrappedChunk, { mangle: true });
        const chunkHash = hashContent(minifiedChunk);
        const chunkFile = `${chunkName}.${chunkHash}.js`;

        // Find the specifier that maps to this chunk
        for (const [path, source] of modules) {
          const dImports = findDynamicImports(source, dirname(path));
          for (const di of dImports) {
            const name = di.specifier.replace(/^\.\//, '').replace(/\.js$/, '').replace(/[/\\]/g, '-');
            if (name === chunkName) {
              chunkFileMap.set(di.specifier, chunkFile);
            }
          }
        }

        chunkOutputs.push({ name: chunkFile, content: minifiedChunk });
      }
      console.log(`  Created ${chunks.size} chunk(s)`);

      // Expose only chunk-referenced main modules (not all)
      const sharedIds = [...usedSharedIds].join(',');
      processedBundle = processedBundle.replace(
        /\}\)\(\);\s*$/,
        `window.__decantrShared={${sharedIds}};\n})();\n`
      );

      // Rewrite dynamic imports in main bundle
      processedBundle = rewriteDynamicImports(processedBundle, chunkFileMap);
      // Inject chunk loader
      processedBundle = processedBundle.replace('(function(){\n', `(function(){\n${CHUNK_LOADER}`);
    }
  }

  // Extract CSS
  console.log('  Extracting CSS...');
  const classNames = extractClassNamesFromModules(modules);
  let cssOutput = generateCSS(classNames);

  // CSS Purging
  if (enablePurgeCSS && cssOutput) {
    console.log('  Purging unused CSS...');
    const { css: purgedCSS, purged } = purgeCSS(cssOutput, processedBundle);
    cssOutput = purgedCSS;
    if (purged > 0) console.log(`  Purged ${purged} unused CSS rules`);
  }

  // Minify
  console.log('  Minifying...');
  const minified = minify(processedBundle, { mangle: true });
  const jsHash = hashContent(minified);
  const cssHash = hashContent(cssOutput || '');

  // Write output
  await mkdir(join(outDir, 'assets'), { recursive: true });

  const jsFile = `app.${jsHash}.js`;
  const cssFile = `app.${cssHash}.css`;

  // Write JS (with optional sourcemap reference)
  let jsContent = minified;
  const writePromises = [];
  if (enableSourcemap && rawSourcemap) {
    const mapFile = `app.${jsHash}.js.map`;
    jsContent += `\n//# sourceMappingURL=./${mapFile}`;
    writePromises.push(writeFile(join(outDir, 'assets', mapFile), rawSourcemap));
  }
  writePromises.push(writeFile(join(outDir, 'assets', jsFile), jsContent));

  if (cssOutput) {
    writePromises.push(writeFile(join(outDir, 'assets', cssFile), cssOutput));
  }

  // Write chunks
  for (const chunk of chunkOutputs) {
    writePromises.push(writeFile(join(outDir, 'assets', chunk.name), chunk.content));
  }
  await Promise.all(writePromises);

  // Transform HTML
  function transformHtml(html) {
    html = html.replace(
      /<script type="module"[^>]*><\/script>/,
      `<script src="./assets/${jsFile}"></script>`
    );
    if (cssOutput) {
      html = html.replace('</head>', `<link rel="stylesheet" href="./assets/${cssFile}">\n</head>`);
    }
    return html;
  }

  let html;
  try {
    html = await readFile(join(projectRoot, 'public', 'index.html'), 'utf-8');
  } catch {
    html = '<!DOCTYPE html><html><head></head><body><div id="app"></div></body></html>';
  }
  html = transformHtml(html);
  await writeFile(join(outDir, 'index.html'), html);

  // Copy public/ assets
  const publicDir = join(projectRoot, 'public');
  async function copyPublicDir(srcDir, destDir) {
    let entries;
    try { entries = await readdir(srcDir, { withFileTypes: true }); } catch { return; }
    for (const entry of entries) {
      if (srcDir === publicDir && entry.name === 'index.html') continue;
      const srcPath = join(srcDir, entry.name);
      const destPath = join(destDir, entry.name);
      if (entry.isDirectory()) {
        await mkdir(destPath, { recursive: true });
        await copyPublicDir(srcPath, destPath);
      } else {
        await mkdir(dirname(destPath), { recursive: true });
        if (entry.name.endsWith('.html')) {
          const content = await readFile(srcPath, 'utf-8');
          await writeFile(destPath, transformHtml(content));
        } else {
          await copyFile(srcPath, destPath);
        }
      }
    }
  }
  await copyPublicDir(publicDir, outDir);

  // ─── Report ────────────────────────────────────────────────────

  const jsSize = Buffer.byteLength(jsContent);
  const cssSize = Buffer.byteLength(cssOutput || '');
  const htmlSize = Buffer.byteLength(html);
  const jsGzip = gzipSync(jsContent).length;
  const cssGzip = cssOutput ? gzipSync(cssOutput).length : 0;
  const htmlGzip = gzipSync(html).length;
  const jsBrotli = brotliSize(jsContent);
  const cssBrotli = cssOutput ? brotliSize(cssOutput) : 0;
  const htmlBrotli = brotliSize(html);

  // Pre-compute chunk stats to avoid redundant compression
  const chunkStats = chunkOutputs.map(chunk => ({
    name: chunk.name,
    content: chunk.content,
    size: Buffer.byteLength(chunk.content),
    gzip: gzipSync(chunk.content).length,
    brotli: brotliSize(chunk.content),
  }));

  console.log('\n  Output:');
  console.log(`    assets/${jsFile}`);
  console.log(`      ${formatSize(jsSize)} │ ${formatSize(jsGzip)} gz │ ${formatSize(jsBrotli)} br`);
  if (cssOutput) {
    console.log(`    assets/${cssFile}`);
    console.log(`      ${formatSize(cssSize)} │ ${formatSize(cssGzip)} gz │ ${formatSize(cssBrotli)} br`);
  }
  console.log(`    index.html`);
  console.log(`      ${formatSize(htmlSize)} │ ${formatSize(htmlGzip)} gz │ ${formatSize(htmlBrotli)} br`);

  // Chunk sizes
  for (const cs of chunkStats) {
    console.log(`    assets/${cs.name}`);
    console.log(`      ${formatSize(cs.size)} │ ${formatSize(cs.gzip)} gz │ ${formatSize(cs.brotli)} br`);
  }

  if (enableSourcemap) {
    console.log(`    assets/app.${jsHash}.js.map`);
  }

  const totalRaw = jsSize + cssSize + htmlSize + chunkStats.reduce((s, c) => s + c.size, 0);
  const totalGzip = jsGzip + cssGzip + htmlGzip + chunkStats.reduce((s, c) => s + c.gzip, 0);
  const totalBrotli = jsBrotli + cssBrotli + htmlBrotli + chunkStats.reduce((s, c) => s + c.brotli, 0);

  console.log('  ──────────────────────────────────────────');
  console.log(`    Total: ${formatSize(totalRaw)} │ ${formatSize(totalGzip)} gz │ ${formatSize(totalBrotli)} br`);

  // ─── Bundle size budget check ──────────────────────────────────
  const sizeBudget = config?.build?.sizeBudget || {};
  const budgetWarnings = [];
  if (sizeBudget.jsRaw && jsSize > sizeBudget.jsRaw) {
    budgetWarnings.push(`JS raw ${formatSize(jsSize)} exceeds budget ${formatSize(sizeBudget.jsRaw)}`);
  }
  if (sizeBudget.jsBrotli && jsBrotli > sizeBudget.jsBrotli) {
    budgetWarnings.push(`JS brotli ${formatSize(jsBrotli)} exceeds budget ${formatSize(sizeBudget.jsBrotli)}`);
  }
  if (sizeBudget.cssRaw && cssSize > sizeBudget.cssRaw) {
    budgetWarnings.push(`CSS raw ${formatSize(cssSize)} exceeds budget ${formatSize(sizeBudget.cssRaw)}`);
  }
  if (sizeBudget.cssBrotli && cssBrotli > sizeBudget.cssBrotli) {
    budgetWarnings.push(`CSS brotli ${formatSize(cssBrotli)} exceeds budget ${formatSize(sizeBudget.cssBrotli)}`);
  }
  if (sizeBudget.totalRaw && totalRaw > sizeBudget.totalRaw) {
    budgetWarnings.push(`Total raw ${formatSize(totalRaw)} exceeds budget ${formatSize(sizeBudget.totalRaw)}`);
  }
  if (sizeBudget.totalBrotli && totalBrotli > sizeBudget.totalBrotli) {
    budgetWarnings.push(`Total brotli ${formatSize(totalBrotli)} exceeds budget ${formatSize(sizeBudget.totalBrotli)}`);
  }
  if (sizeBudget.chunkRaw) {
    for (const cs of chunkStats) {
      if (cs.size > sizeBudget.chunkRaw) {
        budgetWarnings.push(`Chunk ${cs.name} ${formatSize(cs.size)} exceeds chunk budget ${formatSize(sizeBudget.chunkRaw)}`);
      }
    }
  }
  if (budgetWarnings.length > 0) {
    console.log('\n  ⚠ Size budget exceeded:');
    for (const w of budgetWarnings) console.log(`    ⚠ ${w}`);
  }

  // Compression ratios
  if (jsSize > 0) {
    const jsGzRatio = ((1 - jsGzip / jsSize) * 100).toFixed(1);
    const jsBrRatio = ((1 - jsBrotli / jsSize) * 100).toFixed(1);
    console.log(`\n  Compression: JS ${jsGzRatio}% gzip │ ${jsBrRatio}% brotli`);
  }
  if (cssSize > 0) {
    const cssGzRatio = ((1 - cssGzip / cssSize) * 100).toFixed(1);
    const cssBrRatio = ((1 - cssBrotli / cssSize) * 100).toFixed(1);
    console.log(`  Compression: CSS ${cssGzRatio}% gzip │ ${cssBrRatio}% brotli`);
  }

  // Module breakdown (analyze)
  if (enableAnalyze) {
    console.log('\n  Module Breakdown:');
    const moduleSizes = [];

    // Match IIFE-wrapped modules: // path\nconst _mN = (function(){...return {
    const iifeMarkerRe = /\/\/ (.+?)\nconst _m\d+ = \(function\(\)\{([\s\S]*?)return \{/g;
    let marker;
    while ((marker = iifeMarkerRe.exec(processedBundle)) !== null) {
      moduleSizes.push({ path: marker[1], size: Buffer.byteLength(marker[2]) });
    }

    // Match hoisted modules: // path\n...code...\nconst _mN = {
    const hoistedMarkerRe = /\/\/ (.+?)\n([\s\S]*?)const _m\d+ = \{/g;
    while ((marker = hoistedMarkerRe.exec(processedBundle)) !== null) {
      // Skip if this was already matched as an IIFE
      if (!moduleSizes.some(m => m.path === marker[1])) {
        moduleSizes.push({ path: marker[1], size: Buffer.byteLength(marker[2]) });
      }
    }
    moduleSizes.sort((a, b) => b.size - a.size);
    const top = moduleSizes.slice(0, 15);
    const maxSize = top[0]?.size || 1;
    const barWidth = 20;

    for (const mod of top) {
      const pct = ((mod.size / jsSize) * 100).toFixed(1);
      const filled = Math.round((mod.size / maxSize) * barWidth);
      const bar = '█'.repeat(filled) + '░'.repeat(barWidth - filled);
      const name = mod.path.length > 40 ? '...' + mod.path.slice(-37) : mod.path;
      console.log(`    ${bar}  ${formatSize(mod.size).padStart(8)}  (${pct.padStart(5)}%)  ${name}`);
    }
    if (moduleSizes.length > 15) {
      console.log(`    ... and ${moduleSizes.length - 15} more modules`);
    }
  }

  console.log('');

  // Save incremental build cache
  if (enableIncremental && _currentHashes && _combinedHash) {
    await saveBuildCache(cacheDir, _currentHashes, _combinedHash);
  }
}
