import { readFile, readdir, stat } from 'node:fs/promises';
import { join, dirname, resolve, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync, brotliCompressSync, constants as zlibConstants } from 'node:zlib';
import { performance } from 'node:perf_hooks';

const __dirname = dirname(fileURLToPath(import.meta.url));
const registryDir = resolve(__dirname, '..', 'src', 'registry');

// ─── Helpers ─────────────────────────────────────────────────────

/**
 * Recursively find all .js files under a directory.
 * @param {string} dir
 * @returns {Promise<string[]>}
 */
async function findJsFiles(dir) {
  const results = [];
  let entries;
  try { entries = await readdir(dir, { withFileTypes: true }); } catch { return results; }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip node_modules, dist, .decantr
      if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name.startsWith('.')) continue;
      results.push(...await findJsFiles(full));
    } else if (entry.name.endsWith('.js')) {
      results.push(full);
    }
  }
  return results;
}

/**
 * Recursively find all files under a directory.
 * @param {string} dir
 * @returns {Promise<string[]>}
 */
async function findAllFiles(dir) {
  const results = [];
  let entries;
  try { entries = await readdir(dir, { withFileTypes: true }); } catch { return results; }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...await findAllFiles(full));
    } else {
      results.push(full);
    }
  }
  return results;
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
 * Safely read and parse a JSON file. Returns null on failure.
 * @param {string} filePath
 * @returns {Promise<any>}
 */
async function readJSON(filePath) {
  try {
    return JSON.parse(await readFile(filePath, 'utf-8'));
  } catch {
    return null;
  }
}

// ─── Registry Loaders ────────────────────────────────────────────

/**
 * Load known component names from components.json.
 * @returns {Promise<string[]>}
 */
async function loadComponentNames() {
  const data = await readJSON(join(registryDir, 'components.json'));
  if (!data || !data.components) return [];
  return Object.keys(data.components);
}

/**
 * Load known pattern names from patterns/index.json.
 * @returns {Promise<string[]>}
 */
async function loadPatternNames() {
  const data = await readJSON(join(registryDir, 'patterns', 'index.json'));
  if (!data || !data.patterns) return [];
  return Object.keys(data.patterns);
}

// ─── Pass 1: Essence Compliance ──────────────────────────────────

const DECANTATION_STAGES = ['POUR', 'SETTLE', 'CLARIFY', 'DECANT', 'SERVE', 'AGE'];

/**
 * Analyze essence file for decantation stage compliance.
 * @param {string} projectRoot
 * @returns {Promise<{valid: boolean, terroir: string|null, stagesCompleted: string[], stagesSkipped: string[], errors: string[]}>}
 */
async function analyzeEssence(projectRoot) {
  const result = {
    valid: false,
    terroir: null,
    stagesCompleted: [],
    stagesSkipped: [],
    errors: []
  };

  const essencePath = join(projectRoot, 'decantr.essence.json');
  const essence = await readJSON(essencePath);

  if (!essence) {
    result.errors.push('No decantr.essence.json found');
    result.stagesSkipped = [...DECANTATION_STAGES];
    return result;
  }

  result.valid = true;

  // POUR: always complete if essence exists — it means intent was captured
  result.stagesCompleted.push('POUR');

  // SETTLE: terroir + vintage + character must be present
  const hasTerroir = !!(essence.terroir || (essence.sections && essence.sections.length > 0));
  const hasVintage = !!(essence.vintage || (essence.sections && essence.sections.some(s => s.vintage)));
  const hasCharacter = !!(essence.character && Array.isArray(essence.character) && essence.character.length > 0);

  if (hasTerroir) {
    result.terroir = essence.terroir || essence.sections?.map(s => s.terroir).join(', ') || null;
  }

  if (hasTerroir && hasVintage && hasCharacter) {
    result.stagesCompleted.push('SETTLE');
  } else {
    result.stagesSkipped.push('SETTLE');
    if (!hasTerroir) result.errors.push('Missing terroir');
    if (!hasVintage) result.errors.push('Missing vintage');
    if (!hasCharacter) result.errors.push('Missing character');
  }

  // CLARIFY: structure + tannins present
  const hasStructure = !!(
    (essence.structure && Array.isArray(essence.structure) && essence.structure.length > 0) ||
    (essence.sections && essence.sections.some(s => s.structure && s.structure.length > 0))
  );
  const hasTannins = !!(
    (essence.tannins && Array.isArray(essence.tannins) && essence.tannins.length > 0) ||
    (essence.sections && essence.sections.some(s => s.tannins && s.tannins.length > 0))
  );

  if (hasStructure && hasTannins) {
    result.stagesCompleted.push('CLARIFY');
  } else {
    result.stagesSkipped.push('CLARIFY');
    if (!hasStructure) result.errors.push('Missing structure');
    if (!hasTannins) result.errors.push('Missing tannins');
  }

  // DECANT: style file exists in src/css/styles/
  const vintage = essence.vintage || (essence.sections && essence.sections[0]?.vintage) || {};
  const styleId = vintage.style;
  if (styleId) {
    const stylePath = resolve(__dirname, '..', 'src', 'css', 'styles', `${styleId}.js`);
    try {
      await stat(stylePath);
      result.stagesCompleted.push('DECANT');
    } catch {
      result.stagesSkipped.push('DECANT');
      result.errors.push(`Style file not found: ${styleId}.js`);
    }
  } else {
    result.stagesSkipped.push('DECANT');
    result.errors.push('No style specified in vintage');
  }

  // SERVE: pages exist in src/pages/
  const pagesDir = join(projectRoot, 'src', 'pages');
  try {
    const pagesEntries = await readdir(pagesDir);
    if (pagesEntries.length > 0) {
      result.stagesCompleted.push('SERVE');
    } else {
      result.stagesSkipped.push('SERVE');
      result.errors.push('src/pages/ exists but is empty');
    }
  } catch {
    result.stagesSkipped.push('SERVE');
    result.errors.push('No src/pages/ directory found');
  }

  // AGE: cork rules present
  const hasCork = !!(essence.cork && (essence.cork.rules || essence.cork.enforce_style || essence.cork.enforce_recipe));
  if (hasCork) {
    result.stagesCompleted.push('AGE');
  } else {
    result.stagesSkipped.push('AGE');
    result.errors.push('No cork rules defined');
  }

  return result;
}

// ─── Pass 2: Source Analysis ─────────────────────────────────────

/**
 * @typedef {Object} SourceAnalysis
 * @property {number} frameworkDerivedPct
 * @property {number} projectSpecificPct
 * @property {string[]} componentsUsed
 * @property {number} componentsTotal
 * @property {string[]} patternsUsed
 * @property {number} patternsTotal
 * @property {number} atomCalls
 * @property {number} inlineStyleViolations
 * @property {number} frameworkImports
 * @property {number} totalStatements
 */

/**
 * Analyze source files for framework derivation vs improvised code.
 * @param {string} projectRoot
 * @param {string[]} knownComponents
 * @param {string[]} knownPatterns
 * @returns {Promise<SourceAnalysis>}
 */
async function analyzeSource(projectRoot, knownComponents, knownPatterns) {
  const srcDir = join(projectRoot, 'src');
  const files = await findJsFiles(srcDir);

  let frameworkImports = 0;
  let atomCalls = 0;
  let inlineStyleViolations = 0;
  let totalStatements = 0;

  const usedComponents = new Set();
  const usedPatterns = new Set();

  // Build regex patterns for component detection
  // Match ComponentName( — function call usage
  const componentCallRe = new RegExp(
    '\\b(' + knownComponents.map(c => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')\\s*\\(',
    'g'
  );

  // Build pattern detection regex — pattern names in string literals or comments
  const patternNameSet = new Set(knownPatterns);

  for (const file of files) {
    let source;
    try { source = await readFile(file, 'utf-8'); } catch { continue; }

    // Count approximate statements (lines with meaningful code)
    const lines = source.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('/*') && !trimmed.startsWith('*')) {
        totalStatements++;
      }
    }

    // Count decantr imports
    const importMatches = source.match(/from\s+['"]decantr\//g);
    if (importMatches) frameworkImports += importMatches.length;

    // Count css() calls
    const cssMatches = source.match(/\bcss\s*\(/g);
    if (cssMatches) atomCalls += cssMatches.length;

    // Detect inline style violations — static px/rem/hex values in style: or .style.
    // Match style: 'anything with px/rem/#hex' (static values only)
    const styleAttrRe = /style:\s*['"`]([^'"`]*?)['"`]/g;
    let styleMatch;
    while ((styleMatch = styleAttrRe.exec(source)) !== null) {
      const val = styleMatch[1];
      // Flag if contains px, rem, em, hex color — these are static values
      if (/\d+px|\d+rem|\d+em|#[0-9a-fA-F]{3,8}/.test(val)) {
        inlineStyleViolations++;
      }
    }
    // Also check .style.property = 'value' with static values
    const dotStyleRe = /\.style\.\w+\s*=\s*['"`]([^'"`]*?)['"`]/g;
    while ((styleMatch = dotStyleRe.exec(source)) !== null) {
      const val = styleMatch[1];
      if (/\d+px|\d+rem|\d+em|#[0-9a-fA-F]{3,8}/.test(val)) {
        inlineStyleViolations++;
      }
    }

    // Detect component usage
    let compMatch;
    while ((compMatch = componentCallRe.exec(source)) !== null) {
      usedComponents.add(compMatch[1]);
    }

    // Detect pattern references in strings or comments
    for (const pName of patternNameSet) {
      if (source.includes(pName)) {
        usedPatterns.add(pName);
      }
    }
  }

  // Compute derivation percentage
  // Framework-derived signals: imports + atom calls + component uses
  const frameworkSignals = frameworkImports + atomCalls + usedComponents.size;
  // Total signals approximate: all statements
  const derivedPct = totalStatements > 0
    ? Math.min(100, Math.round((frameworkSignals / totalStatements) * 100))
    : 0;

  return {
    frameworkDerivedPct: derivedPct,
    projectSpecificPct: 100 - derivedPct,
    componentsUsed: [...usedComponents].sort(),
    componentsTotal: knownComponents.length,
    patternsUsed: [...usedPatterns].sort(),
    patternsTotal: knownPatterns.length,
    atomCalls,
    inlineStyleViolations,
    frameworkImports,
    totalStatements
  };
}

// ─── Pass 3: Quality Checks ─────────────────────────────────────

/**
 * @typedef {Object} QualityReport
 * @property {{file: string, line: number, value: string}[]} hardcodedCSS
 * @property {{file: string, line: number}[]} missingAria
 * @property {{file: string, line: number}[]} leakedListeners
 * @property {{file: string, line: number}[]} missingFocusTrap
 */

/**
 * Scan source files for quality issues.
 * @param {string} projectRoot
 * @returns {Promise<QualityReport>}
 */
async function checkQuality(projectRoot) {
  const srcDir = join(projectRoot, 'src');
  const files = await findJsFiles(srcDir);

  /** @type {QualityReport} */
  const report = {
    hardcodedCSS: [],
    missingAria: [],
    leakedListeners: [],
    missingFocusTrap: []
  };

  for (const file of files) {
    let source;
    try { source = await readFile(file, 'utf-8'); } catch { continue; }

    const relFile = relative(projectRoot, file);
    const lines = source.split('\n');

    // Track whether file has onDestroy somewhere
    const hasOnDestroy = /\bonDestroy\b/.test(source);

    // Track whether file has createFocusTrap
    const hasFocusTrap = /\bcreateFocusTrap\b/.test(source);

    // Track whether file creates overlays (Modal, Drawer, Popover)
    const isOverlay = /\b(Modal|Drawer|Popover)\s*\(/.test(source) ||
      /role:\s*['"]dialog['"]/.test(source);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;

      // Hardcoded CSS: style: with px/rem/hex static values
      const styleAttrMatch = line.match(/style:\s*['"`]([^'"`]*?)['"`]/);
      if (styleAttrMatch) {
        const val = styleAttrMatch[1];
        if (/\d+px|\d+rem|\d+em|#[0-9a-fA-F]{3,8}/.test(val)) {
          report.hardcodedCSS.push({ file: relFile, line: lineNum, value: val.slice(0, 60) });
        }
      }
      const dotStyleMatch = line.match(/\.style\.\w+\s*=\s*['"`]([^'"`]*?)['"`]/);
      if (dotStyleMatch) {
        const val = dotStyleMatch[1];
        if (/\d+px|\d+rem|\d+em|#[0-9a-fA-F]{3,8}/.test(val)) {
          report.hardcodedCSS.push({ file: relFile, line: lineNum, value: val.slice(0, 60) });
        }
      }

      // Missing aria-label on icon-only buttons
      // Detect icon( call near Button( without aria-label nearby
      if (/\bicon\s*\(/.test(line)) {
        // Look within a 5-line window for Button( without aria-label
        const windowStart = Math.max(0, i - 3);
        const windowEnd = Math.min(lines.length - 1, i + 3);
        const window = lines.slice(windowStart, windowEnd + 1).join('\n');
        if (/\bButton\s*\(/.test(window) && !/aria-label/.test(window)) {
          report.missingAria.push({ file: relFile, line: lineNum });
        }
      }

      // Leaked listeners: addEventListener without onDestroy in the same file
      if (/\.addEventListener\s*\(/.test(line) || /document\.addEventListener/.test(line) || /window\.addEventListener/.test(line)) {
        if (!hasOnDestroy) {
          report.leakedListeners.push({ file: relFile, line: lineNum });
        }
      }
    }

    // Missing focus trap in overlay components
    if (isOverlay && !hasFocusTrap) {
      report.missingFocusTrap.push({ file: relFile, line: 1 });
    }
  }

  return report;
}

// ─── Pass 4: Coverage Gaps ──────────────────────────────────────

/**
 * @typedef {Object} CoverageGaps
 * @property {string[]} unusedPatterns
 * @property {string[]} unusedComponents
 * @property {string[]} missingPages
 * @property {string[]} unimplementedTannins
 */

/**
 * Compare used vs available patterns, components, pages, tannins.
 * @param {string} projectRoot
 * @param {string[]} usedComponents
 * @param {string[]} usedPatterns
 * @param {string[]} allComponents
 * @param {string[]} allPatterns
 * @returns {Promise<CoverageGaps>}
 */
async function analyzeCoverageGaps(projectRoot, usedComponents, usedPatterns, allComponents, allPatterns) {
  const usedCompSet = new Set(usedComponents);
  const usedPatSet = new Set(usedPatterns);

  const unusedComponents = allComponents.filter(c => !usedCompSet.has(c));
  const unusedPatterns = allPatterns.filter(p => !usedPatSet.has(p));

  // Pages: compare essence structure vs src/pages/ files
  const missingPages = [];
  const essence = await readJSON(join(projectRoot, 'decantr.essence.json'));

  if (essence) {
    const declaredPages = [];
    if (essence.structure && Array.isArray(essence.structure)) {
      for (const page of essence.structure) {
        if (page.id) declaredPages.push(page.id);
      }
    }
    if (essence.sections && Array.isArray(essence.sections)) {
      for (const section of essence.sections) {
        if (section.structure && Array.isArray(section.structure)) {
          for (const page of section.structure) {
            if (page.id) declaredPages.push(`${section.id}/${page.id}`);
          }
        }
      }
    }

    // Check which pages have corresponding files
    const pagesDir = join(projectRoot, 'src', 'pages');
    let pageFiles = [];
    try {
      pageFiles = await findJsFiles(pagesDir);
      pageFiles = pageFiles.map(f => relative(pagesDir, f).replace(/\.js$/, '').replace(/\\/g, '/'));
    } catch { /* no pages dir */ }

    const pageFileSet = new Set(pageFiles);
    for (const pageId of declaredPages) {
      // Check for exact match or index file
      if (!pageFileSet.has(pageId) && !pageFileSet.has(`${pageId}/index`)) {
        missingPages.push(pageId);
      }
    }
  }

  // Tannins: compare declared vs implemented
  const unimplementedTannins = [];
  if (essence) {
    const declaredTannins = [];
    if (essence.tannins && Array.isArray(essence.tannins)) {
      declaredTannins.push(...essence.tannins);
    }
    if (essence.sections && Array.isArray(essence.sections)) {
      for (const section of essence.sections) {
        if (section.tannins && Array.isArray(section.tannins)) {
          declaredTannins.push(...section.tannins);
        }
      }
    }

    // Look for tannin implementations in src/
    const srcDir = join(projectRoot, 'src');
    const allSrcFiles = await findJsFiles(srcDir);
    const allSrcContent = [];
    for (const f of allSrcFiles) {
      try {
        const content = await readFile(f, 'utf-8');
        allSrcContent.push({ file: f, content });
      } catch { /* skip */ }
    }

    for (const tannin of declaredTannins) {
      // Normalize: check for file name match or string reference
      const tanninSlug = tannin.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
      const found = allSrcContent.some(({ file, content }) => {
        const fileName = relative(srcDir, file).toLowerCase();
        return fileName.includes(tanninSlug) || content.includes(tannin);
      });
      if (!found) {
        unimplementedTannins.push(tannin);
      }
    }
  }

  return {
    unusedPatterns,
    unusedComponents,
    missingPages,
    unimplementedTannins
  };
}

// ─── Pass 5: Bundle Metrics ─────────────────────────────────────

/**
 * @typedef {Object} SizeMetrics
 * @property {number} raw
 * @property {number} gzip
 * @property {number} brotli
 * @property {string} rawFormatted
 * @property {string} gzipFormatted
 * @property {string} brotliFormatted
 */

/**
 * @typedef {Object} BundleReport
 * @property {number} buildTimeMs
 * @property {SizeMetrics} js
 * @property {SizeMetrics} css
 * @property {SizeMetrics} html
 * @property {SizeMetrics} total
 * @property {number} moduleCount
 * @property {string|null} error
 */

/**
 * Build the project and measure output sizes.
 * @param {string} projectRoot
 * @returns {Promise<BundleReport>}
 */
async function measureBundle(projectRoot) {
  /** @type {BundleReport} */
  const report = {
    buildTimeMs: 0,
    js: { raw: 0, gzip: 0, brotli: 0, rawFormatted: '0 B', gzipFormatted: '0 B', brotliFormatted: '0 B' },
    css: { raw: 0, gzip: 0, brotli: 0, rawFormatted: '0 B', gzipFormatted: '0 B', brotliFormatted: '0 B' },
    html: { raw: 0, gzip: 0, brotli: 0, rawFormatted: '0 B', gzipFormatted: '0 B', brotliFormatted: '0 B' },
    total: { raw: 0, gzip: 0, brotli: 0, rawFormatted: '0 B', gzipFormatted: '0 B', brotliFormatted: '0 B' },
    moduleCount: 0,
    error: null
  };

  try {
    const { build } = await import('./builder.js');

    const t0 = performance.now();
    await build(projectRoot, {
      sourcemap: false,
      analyze: false,
      incremental: false
    });
    const t1 = performance.now();
    report.buildTimeMs = Math.round(t1 - t0);

    // Scan dist/ for file sizes
    const distDir = join(projectRoot, 'dist');
    const distFiles = await findAllFiles(distDir);

    let jsRaw = 0, cssRaw = 0, htmlRaw = 0;
    let jsContent = '', cssContent = '', htmlContent = '';

    for (const file of distFiles) {
      const ext = extname(file).toLowerCase();
      try {
        const content = await readFile(file, 'utf-8');
        const size = Buffer.byteLength(content);
        if (ext === '.js') {
          jsRaw += size;
          jsContent += content;
          report.moduleCount++;
        } else if (ext === '.css') {
          cssRaw += size;
          cssContent += content;
        } else if (ext === '.html') {
          htmlRaw += size;
          htmlContent += content;
        }
        // Skip .map and other files
      } catch { /* binary files — skip */ }
    }

    function buildSizeMetrics(content, raw) {
      if (raw === 0 || !content) {
        return { raw: 0, gzip: 0, brotli: 0, rawFormatted: '0 B', gzipFormatted: '0 B', brotliFormatted: '0 B' };
      }
      const gz = gzipSync(content).length;
      const br = brotliSize(content);
      return {
        raw,
        gzip: gz,
        brotli: br,
        rawFormatted: formatSize(raw),
        gzipFormatted: formatSize(gz),
        brotliFormatted: formatSize(br)
      };
    }

    report.js = buildSizeMetrics(jsContent, jsRaw);
    report.css = buildSizeMetrics(cssContent, cssRaw);
    report.html = buildSizeMetrics(htmlContent, htmlRaw);

    const totalRaw = jsRaw + cssRaw + htmlRaw;
    const totalContent = jsContent + cssContent + htmlContent;
    report.total = buildSizeMetrics(totalContent, totalRaw);

  } catch (err) {
    report.error = err.message || String(err);
  }

  return report;
}

// ─── Main Audit Function ─────────────────────────────────────────

/**
 * Run all 5 audit passes against a project.
 *
 * @param {string} projectRoot - Absolute path to the project root
 * @returns {Promise<{
 *   essence:  { valid: boolean, terroir: string|null, stagesCompleted: string[], stagesSkipped: string[], errors: string[] },
 *   coverage: { frameworkDerivedPct: number, componentsUsed: string[], componentsTotal: number, patternsUsed: string[], patternsTotal: number, atomCalls: number, violations: number },
 *   quality:  { hardcodedCSS: {file: string, line: number, value: string}[], missingAria: {file: string, line: number}[], leakedListeners: {file: string, line: number}[], missingFocusTrap: {file: string, line: number}[] },
 *   gaps:     { unusedPatterns: string[], unusedComponents: string[], missingPages: string[], unimplementedTannins: string[] },
 *   bundle:   { buildTimeMs: number, js: SizeMetrics, css: SizeMetrics, html: SizeMetrics, total: SizeMetrics, moduleCount: number, error: string|null }
 * }>}
 */
export async function audit(projectRoot) {
  projectRoot = resolve(projectRoot);

  // Load registry data
  const [knownComponents, knownPatterns] = await Promise.all([
    loadComponentNames(),
    loadPatternNames()
  ]);

  // Run pass 1 (essence) and pass 2 (source) and pass 3 (quality) in parallel
  const [essenceResult, sourceResult, qualityResult] = await Promise.all([
    analyzeEssence(projectRoot),
    analyzeSource(projectRoot, knownComponents, knownPatterns),
    checkQuality(projectRoot)
  ]);

  // Pass 4 depends on pass 2 results
  const gapsResult = await analyzeCoverageGaps(
    projectRoot,
    sourceResult.componentsUsed,
    sourceResult.patternsUsed,
    knownComponents,
    knownPatterns
  );

  // Pass 5: bundle metrics (runs build, so do it last)
  const bundleResult = await measureBundle(projectRoot);

  return {
    essence: essenceResult,
    coverage: {
      frameworkDerivedPct: sourceResult.frameworkDerivedPct,
      componentsUsed: sourceResult.componentsUsed,
      componentsTotal: sourceResult.componentsTotal,
      patternsUsed: sourceResult.patternsUsed,
      patternsTotal: sourceResult.patternsTotal,
      atomCalls: sourceResult.atomCalls,
      violations: sourceResult.inlineStyleViolations
    },
    quality: qualityResult,
    gaps: gapsResult,
    bundle: bundleResult
  };
}
