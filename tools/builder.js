import { readFile, writeFile, mkdir, stat, readdir, copyFile, rm } from 'node:fs/promises';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { minify } from './minify.js';
import { extractClassNames, generateCSS } from './css-extract.js';

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
  return join(frameworkSrc, mod, 'index.js');
}

/**
 * @param {string} source
 * @param {string} baseDir
 * @returns {string[]}
 */
function findImports(source, baseDir) {
  // Strip template literal contents to avoid matching imports inside code examples
  const cleaned = source.replace(/`(?:[^`\\]|\\.)*`/gs, '""');
  const imports = [];
  const regex = /import\s+(?:[\s\S]*?from\s+)?['"](.+?)['"]/g;
  let match;
  while ((match = regex.exec(cleaned)) !== null) {
    const specifier = match[1];
    if (specifier.startsWith('decantr')) {
      const subpath = specifier.replace('decantr/', '').replace('decantr', 'core');
      imports.push({ resolved: resolveDecantrImport(subpath), specifier });
    } else if (specifier.startsWith('./') || specifier.startsWith('../')) {
      imports.push({ resolved: resolve(baseDir, specifier), specifier });
    }
  }
  return imports;
}

/**
 * @param {string} entrypoint
 * @returns {Promise<Map<string, string>>}
 */
async function resolveModules(entrypoint) {
  /** @type {Map<string, string>} */
  const modules = new Map();
  const queue = [{ resolved: resolve(entrypoint), specifier: entrypoint, from: null }];
  const visited = new Set();

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
      if (specifier && specifier.startsWith('decantr')) {
        console.error(`  [error] Could not resolve import '${specifier}' from ${fromRel}`);
        console.error(`    Available modules: decantr/core, decantr/state, decantr/router, decantr/css, decantr/tags, decantr/components, decantr/blocks, decantr/test`);
      } else {
        console.error(`  [error] Could not resolve '${specifier || filePath}' from ${fromRel}`);
      }
    }
  }

  return modules;
}

/**
 * @param {Map<string, string>} modules
 * @param {string} entrypoint
 * @returns {string}
 */
function bundle(modules, entrypoint) {
  const moduleIds = new Map();
  let idCounter = 0;
  for (const path of modules.keys()) {
    moduleIds.set(path, `_m${idCounter++}`);
  }

  // Reverse module order so dependencies are defined before dependents
  const moduleList = [...modules.entries()].reverse();

  let output = '(function(){\n';

  for (const [path, source] of moduleList) {
    const id = moduleIds.get(path);
    let processed = source;

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
          return local === imported ? `${local}` : `${local}: ${imported}`;
        }).filter(b => {
          const name = b.split(/\s*:\s*/)[0].trim();
          return !declaredNames.has(name);
        });
        if (bindings.length === 0) return `/* already declared from re-export */`;
        return `const {${bindings.join(',')}} = ${targetId};`;
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

    // Rewrite exports to module object
    processed = processed.replace(/export\s+function\s+(\w+)/g, `function $1`);
    processed = processed.replace(/export\s+const\s+/g, 'const ');
    processed = processed.replace(/export\s+let\s+/g, 'let ');
    processed = processed.replace(/export\s*\{[^}]*\}\s*;?/g, '');

    // Find exported names from original source
    const exportedNames = [];
    const funcExports = source.matchAll(/export\s+function\s+(\w+)/g);
    for (const m of funcExports) exportedNames.push(m[1]);
    const constExports = source.matchAll(/export\s+(?:const|let)\s+(\w+)/g);
    for (const m of constExports) exportedNames.push(m[1]);
    // Re-exports: export { X } from 'Y' — extract the local names
    const reExports = source.matchAll(/export\s*\{([^}]+)\}\s*from\s/g);
    for (const m of reExports) {
      m[1].split(',').forEach(n => {
        const name = n.trim().split(/\s+as\s+/);
        exportedNames.push((name[1] || name[0]).trim());
      });
    }
    // Plain re-exports: export { X }
    const namedExports = source.matchAll(/export\s*\{([^}]+)\}\s*;/g);
    for (const m of namedExports) {
      // Skip if this is a re-export (already handled above)
      if (/from\s/.test(m[0])) continue;
      m[1].split(',').forEach(n => {
        const name = n.trim().split(/\s+as\s+/);
        exportedNames.push((name[1] || name[0]).trim());
      });
    }

    // Restore stashed template literals
    processed = processed.replace(/`__TPL_(\d+)__`/g, (_, i) => stash[i]);

    output += `// ${relative(process.cwd(), path)}\n`;
    output += `const ${id} = (function(){\n${processed}\nreturn {${exportedNames.join(',')}};\n})();\n\n`;
  }

  // Entry module runs last (mount call is in the entry)
  output += '})();\n';
  return output;
}

function resolveSpecifier(specifier, fromPath) {
  if (specifier.startsWith('decantr')) {
    const subpath = specifier.replace('decantr/', '').replace('decantr', 'core');
    return resolveDecantrImport(subpath);
  }
  return resolve(dirname(fromPath), specifier);
}

function hash(content) {
  return createHash('md5').update(content).digest('hex').slice(0, 8);
}

/**
 * @param {string} projectRoot
 * @param {{ outDir?: string, inline?: boolean }} options
 */
export async function build(projectRoot, options = {}) {
  const outDir = join(projectRoot, options.outDir || 'dist');
  const entrypoint = join(projectRoot, 'src', 'app.js');

  // Clean previous build output
  await rm(outDir, { recursive: true, force: true });

  console.log('\n  decantr build\n');
  console.log('  Resolving modules...');
  const modules = await resolveModules(entrypoint);
  console.log(`  Found ${modules.size} modules`);

  // Bundle
  console.log('  Bundling...');
  let bundled = bundle(modules, entrypoint);

  // Extract CSS
  console.log('  Extracting CSS...');
  const allSource = [...modules.values()].join('\n');
  const classNames = extractClassNames(allSource);
  const cssOutput = generateCSS(classNames);

  // Minify
  console.log('  Minifying...');
  const minified = minify(bundled);
  const jsHash = hash(minified);
  const cssHash = hash(cssOutput);

  // Write output
  await mkdir(join(outDir, 'assets'), { recursive: true });

  const jsFile = `app.${jsHash}.js`;
  const cssFile = `app.${cssHash}.css`;

  await writeFile(join(outDir, 'assets', jsFile), minified);
  if (cssOutput) {
    await writeFile(join(outDir, 'assets', cssFile), cssOutput);
  }

  // Transform HTML: replace dev script tag with bundled script + CSS link
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

  // Read and transform index.html
  let html;
  try {
    html = await readFile(join(projectRoot, 'public', 'index.html'), 'utf-8');
  } catch {
    html = '<!DOCTYPE html><html><head></head><body><div id="app"></div></body></html>';
  }
  html = transformHtml(html);
  await writeFile(join(outDir, 'index.html'), html);

  // Copy public/ assets (excluding index.html) to dist/
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

  // Report sizes
  const jsSize = Buffer.byteLength(minified);
  const cssSize = Buffer.byteLength(cssOutput);
  const jsGzip = gzipSync(minified).length;
  const cssGzip = cssOutput ? gzipSync(cssOutput).length : 0;
  const htmlSize = Buffer.byteLength(html);
  const htmlGzip = gzipSync(html).length;

  console.log('\n  Output:');
  console.log(`    assets/${jsFile}   ${jsSize} B (${jsGzip} B gzip)`);
  if (cssOutput) {
    console.log(`    assets/${cssFile}  ${cssSize} B (${cssGzip} B gzip)`);
  }
  console.log(`    index.html         ${htmlSize} B (${htmlGzip} B gzip)`);
  console.log(`\n  Total gzipped: ${jsGzip + cssGzip + htmlGzip} B\n`);
}
