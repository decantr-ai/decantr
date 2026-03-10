import { readFile, readdir, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { gzipSync, brotliCompressSync, constants } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

// ── Helpers ──────────────────────────────────────────────────────────

const BROTLI_OPTS = {
  params: { [constants.BROTLI_PARAM_QUALITY]: 11 }
};

const BAR_CHARS = '▏▎▍▌▋▊▉█';

function fmtBytes(n) {
  return n.toLocaleString('en-US') + ' B';
}

function pad(str, len, right) {
  return right ? str.padEnd(len) : str.padStart(len);
}

function compressedSizes(buf) {
  const raw = buf.length;
  const gz = gzipSync(buf).length;
  const br = brotliCompressSync(buf, BROTLI_OPTS).length;
  return { raw, gzip: gz, brotli: br };
}

function compressionRatio(raw, compressed) {
  if (raw === 0) return 0;
  return ((1 - compressed / raw) * 100);
}

function bar(value, max, width) {
  if (max === 0) return '';
  const filled = (value / max) * width;
  const full = Math.floor(filled);
  const frac = filled - full;
  const fracIdx = Math.round(frac * (BAR_CHARS.length - 1));
  let s = BAR_CHARS[BAR_CHARS.length - 1].repeat(full);
  if (full < width) {
    s += frac > 0.05 ? BAR_CHARS[fracIdx] : '░';
    s += '░'.repeat(width - full - 1);
  }
  return s;
}

// ── Module breakdown parser ──────────────────────────────────────────

function parseModules(jsSource) {
  // Builder inserts: // src/path/file.js (or relative path from cwd)
  const marker = /^\/\/\s+((?:src\/|\.\.?\/)[^\n]+)$/gm;
  const markers = [];
  let m;
  while ((m = marker.exec(jsSource)) !== null) {
    markers.push({ path: m[1].trim(), index: m.index });
  }

  const modules = [];
  for (let i = 0; i < markers.length; i++) {
    const start = markers[i].index;
    const end = i + 1 < markers.length ? markers[i + 1].index : jsSource.length;
    const chunk = jsSource.slice(start, end);
    const size = Buffer.byteLength(chunk, 'utf-8');
    modules.push({ path: markers[i].path, size });
  }

  // Sort descending by size
  modules.sort((a, b) => b.size - a.size);

  // Calculate percentages
  const total = modules.reduce((s, mod) => s + mod.size, 0);
  return modules.map(mod => ({
    ...mod,
    percentage: total > 0 ? (mod.size / total) * 100 : 0
  }));
}

// ── Exported API ─────────────────────────────────────────────────────

/**
 * Analyze bundled JS, CSS, and optionally HTML output.
 * @param {string} bundledJS - Raw bundled JS string
 * @param {string} cssOutput - Raw CSS string
 * @param {{ html?: string, silent?: boolean }} options
 * @returns {{ report: string, stats: object }}
 */
export function analyzeBundle(bundledJS, cssOutput, options = {}) {
  const jsBuf = Buffer.from(bundledJS || '', 'utf-8');
  const cssBuf = Buffer.from(cssOutput || '', 'utf-8');
  const htmlBuf = Buffer.from(options.html || '', 'utf-8');

  const js = compressedSizes(jsBuf);
  const css = compressedSizes(cssBuf);
  const html = compressedSizes(htmlBuf);

  const total = {
    raw: js.raw + css.raw + html.raw,
    gzip: js.gzip + css.gzip + html.gzip,
    brotli: js.brotli + css.brotli + html.brotli
  };

  const modules = bundledJS ? parseModules(bundledJS) : [];

  const assets = [];
  if (js.raw > 0) assets.push({ name: 'bundle.js', ...js });
  if (css.raw > 0) assets.push({ name: 'bundle.css', ...css });
  if (html.raw > 0) assets.push({ name: 'index.html', ...html });

  const stats = { js, css, html, total, modules, assets };
  const report = formatReport(stats);

  return { report, stats };
}

// ── Report formatting ────────────────────────────────────────────────

function formatReport(stats) {
  const lines = [];
  const W = 50;

  lines.push('');
  lines.push('  Bundle Analysis');
  lines.push('  ' + '═'.repeat(W));
  lines.push('');

  // Assets table
  if (stats.assets.length > 0) {
    lines.push('  Assets:');

    const nameW = Math.max(...stats.assets.map(a => a.name.length), 4);
    const rawW = Math.max(...stats.assets.map(a => fmtBytes(a.raw).length), 5);
    const gzW = Math.max(...stats.assets.map(a => fmtBytes(a.gzip).length + 3), 5);
    const brW = Math.max(...stats.assets.map(a => fmtBytes(a.brotli).length + 3), 5);

    for (const asset of stats.assets) {
      const name = pad(asset.name, nameW, true);
      const raw = pad(fmtBytes(asset.raw), rawW);
      const gz = pad(fmtBytes(asset.gzip) + ' gz', gzW);
      const br = pad(fmtBytes(asset.brotli) + ' br', brW);
      lines.push(`    ${name}  ${raw} │ ${gz} │ ${br}`);
    }

    lines.push('  ' + '─'.repeat(W));

    const raw = pad(fmtBytes(stats.total.raw), Math.max(...stats.assets.map(a => fmtBytes(a.raw).length), 5));
    const gz = pad(fmtBytes(stats.total.gzip) + ' gz', Math.max(...stats.assets.map(a => fmtBytes(a.gzip).length + 3), 5));
    const br = pad(fmtBytes(stats.total.brotli) + ' br', Math.max(...stats.assets.map(a => fmtBytes(a.brotli).length + 3), 5));
    const totalLabel = pad('Total', Math.max(...stats.assets.map(a => a.name.length), 4), true);
    lines.push(`    ${totalLabel}  ${raw} │ ${gz} │ ${br}`);
  }

  // Module breakdown
  if (stats.modules.length > 0) {
    lines.push('');
    lines.push('  Module Breakdown (JS):');

    const top = stats.modules.slice(0, 10);
    const maxSize = top[0]?.size || 1;
    const pathW = Math.max(...top.map(m => m.path.length), 4);
    const barW = 15;

    for (const mod of top) {
      const p = pad(mod.path, pathW, true);
      const b = bar(mod.size, maxSize, barW);
      const sz = fmtBytes(mod.size);
      const pct = `(${mod.percentage.toFixed(1)}%)`;
      lines.push(`    ${p}  ${b}  ${pad(sz, 10)} ${pct}`);
    }

    if (stats.modules.length > 10) {
      const rest = stats.modules.slice(10);
      const restSize = rest.reduce((s, m) => s + m.size, 0);
      const restPct = stats.modules.length > 0
        ? rest.reduce((s, m) => s + m.percentage, 0)
        : 0;
      lines.push(`    ${pad('... ' + rest.length + ' more', pathW, true)}  ${'░'.repeat(barW)}  ${pad(fmtBytes(restSize), 10)} (${restPct.toFixed(1)}%)`);
    }
  }

  // Compression ratios
  lines.push('');
  lines.push('  Compression Ratios:');
  if (stats.js.raw > 0) {
    const gzRatio = compressionRatio(stats.js.raw, stats.js.gzip).toFixed(1);
    const brRatio = compressionRatio(stats.js.raw, stats.js.brotli).toFixed(1);
    lines.push(`    JS:   ${gzRatio}% gzip │ ${brRatio}% brotli`);
  }
  if (stats.css.raw > 0) {
    const gzRatio = compressionRatio(stats.css.raw, stats.css.gzip).toFixed(1);
    const brRatio = compressionRatio(stats.css.raw, stats.css.brotli).toFixed(1);
    lines.push(`    CSS:  ${gzRatio}% gzip │ ${brRatio}% brotli`);
  }
  if (stats.html.raw > 0) {
    const gzRatio = compressionRatio(stats.html.raw, stats.html.gzip).toFixed(1);
    const brRatio = compressionRatio(stats.html.raw, stats.html.brotli).toFixed(1);
    lines.push(`    HTML: ${gzRatio}% gzip │ ${brRatio}% brotli`);
  }

  lines.push('');
  return lines.join('\n');
}

// ── Standalone mode ──────────────────────────────────────────────────

async function readDistDir(distDir) {
  const assetsDir = join(distDir, 'assets');
  const stats = {
    js: { raw: 0, gzip: 0, brotli: 0 },
    css: { raw: 0, gzip: 0, brotli: 0 },
    html: { raw: 0, gzip: 0, brotli: 0 },
    total: { raw: 0, gzip: 0, brotli: 0 },
    modules: [],
    assets: []
  };

  // Read asset files
  let assetFiles;
  try {
    assetFiles = await readdir(assetsDir);
  } catch {
    assetFiles = [];
  }

  let allJS = '';

  for (const name of assetFiles) {
    const filePath = join(assetsDir, name);
    const content = await readFile(filePath);
    const sizes = compressedSizes(content);
    const ext = extname(name).toLowerCase();

    stats.assets.push({ name: 'assets/' + name, ...sizes });

    if (ext === '.js') {
      stats.js.raw += sizes.raw;
      stats.js.gzip += sizes.gzip;
      stats.js.brotli += sizes.brotli;
      allJS += content.toString('utf-8');
    } else if (ext === '.css') {
      stats.css.raw += sizes.raw;
      stats.css.gzip += sizes.gzip;
      stats.css.brotli += sizes.brotli;
    }
  }

  // Read root files (index.html etc.)
  let rootFiles;
  try {
    rootFiles = await readdir(distDir);
  } catch {
    rootFiles = [];
  }

  for (const name of rootFiles) {
    const filePath = join(distDir, name);
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) continue;
    if (name === 'assets') continue;

    const content = await readFile(filePath);
    const sizes = compressedSizes(content);
    const ext = extname(name).toLowerCase();

    stats.assets.push({ name, ...sizes });

    if (ext === '.html') {
      stats.html.raw += sizes.raw;
      stats.html.gzip += sizes.gzip;
      stats.html.brotli += sizes.brotli;
    }
  }

  // Totals
  stats.total.raw = stats.js.raw + stats.css.raw + stats.html.raw;
  stats.total.gzip = stats.js.gzip + stats.css.gzip + stats.html.gzip;
  stats.total.brotli = stats.js.brotli + stats.css.brotli + stats.html.brotli;

  // Module breakdown from JS
  if (allJS) {
    stats.modules = parseModules(allJS);
  }

  return stats;
}

async function main() {
  const args = process.argv.slice(2);
  const distDir = args[0] || join(process.cwd(), 'dist');

  try {
    await stat(distDir);
  } catch {
    console.error(`  Error: dist directory not found: ${distDir}`);
    console.error('  Run "decantr build" first, or pass a dist directory path.');
    process.exit(1);
  }

  const stats = await readDistDir(distDir);

  if (stats.assets.length === 0) {
    console.error('  Error: no files found in dist directory.');
    process.exit(1);
  }

  const report = formatReport(stats);
  console.log(report);
}

// Run standalone when executed directly
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  main();
}
