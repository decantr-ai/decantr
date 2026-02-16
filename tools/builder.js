import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { minify } from './minify.js';
import { extractClassNames, generateCSS } from './css-extract.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const frameworkSrc = resolve(__dirname, '..', 'src');

const BUILD_IMPORT_MAP = {
  'themes': 'css/themes.js',
  'styles': 'css/styles.js'
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
  const imports = [];
  const regex = /import\s+(?:[\s\S]*?from\s+)?['"](.+?)['"]/g;
  let match;
  while ((match = regex.exec(source)) !== null) {
    const specifier = match[1];
    if (specifier.startsWith('decantr')) {
      const subpath = specifier.replace('decantr/', '').replace('decantr', 'core');
      imports.push(resolveDecantrImport(subpath));
    } else if (specifier.startsWith('./') || specifier.startsWith('../')) {
      imports.push(resolve(baseDir, specifier));
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
  const queue = [resolve(entrypoint)];
  const visited = new Set();

  while (queue.length > 0) {
    const filePath = queue.shift();
    if (visited.has(filePath)) continue;
    visited.add(filePath);

    try {
      const source = await readFile(filePath, 'utf-8');
      modules.set(filePath, source);
      const imports = findImports(source, dirname(filePath));
      queue.push(...imports);
    } catch (e) {
      console.warn(`  [warn] Could not resolve: ${filePath}`);
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

  let output = '(function(){\n';

  for (const [path, source] of modules) {
    const id = moduleIds.get(path);
    let processed = source;

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
        });
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
    const namedExports = source.matchAll(/export\s*\{([^}]+)\}/g);
    for (const m of namedExports) {
      m[1].split(',').forEach(n => {
        const name = n.trim().split(/\s+as\s+/);
        exportedNames.push((name[1] || name[0]).trim());
      });
    }

    output += `// ${relative(process.cwd(), path)}\n`;
    output += `const ${id} = (function(){\n${processed}\nreturn {${exportedNames.join(',')}};\n})();\n\n`;
  }

  // Call the entry module's init (mount call is in the entry)
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

  // Read and transform index.html
  let html;
  try {
    html = await readFile(join(projectRoot, 'public', 'index.html'), 'utf-8');
  } catch {
    html = '<!DOCTYPE html><html><head></head><body><div id="app"></div></body></html>';
  }

  // Replace module script with bundled script
  html = html.replace(
    /<script type="module"[^>]*><\/script>/,
    `<script src="/assets/${jsFile}"></script>`
  );

  // Add CSS link
  if (cssOutput) {
    html = html.replace('</head>', `<link rel="stylesheet" href="/assets/${cssFile}">\n</head>`);
  }

  await writeFile(join(outDir, 'index.html'), html);

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
