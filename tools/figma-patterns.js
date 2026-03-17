/**
 * Figma Pattern & Layout Template Export.
 * Reads pattern JSONs, skeleton definitions, and archetype blueprints,
 * converts Decantr atoms to Figma Auto Layout properties, and outputs
 * composable layout templates.
 *
 * @module figma-patterns
 */

import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const registryRoot = resolve(__dirname, '..', 'src', 'registry');

// ============================================================
// Atom → Figma Auto Layout Translation
// ============================================================

/** Spacing scale (matches SPACING in derive.js) */
const SPACING_SCALE = {
  '0': 0, '0-5': 2, '1': 4, '1-5': 6, '2': 8, '2-5': 10,
  '3': 12, '4': 16, '5': 20, '6': 24, '8': 32, '10': 40, '12': 48, '16': 64,
};

/**
 * Parse an atom string into Figma Auto Layout properties.
 * @param {string} atomStr - Space-separated atom classes (e.g. '_flex _col _gap4 _p4')
 * @returns {Object} Figma layout properties
 */
export function atomsToFigmaLayout(atomStr) {
  if (!atomStr) return {};

  const atoms = atomStr.split(/\s+/).filter(Boolean);
  const layout = {};

  for (const atom of atoms) {
    // Layout mode
    if (atom === '_flex') layout.layoutMode = 'HORIZONTAL';
    if (atom === '_col') layout.layoutMode = 'VERTICAL';
    if (atom === '_grid') {
      layout.layoutMode = 'HORIZONTAL';
      layout.layoutWrap = 'WRAP';
    }

    // Grid columns: _gc{N} or _gridCols{N}
    const gcMatch = atom.match(/^_gc(\d+)$/);
    if (gcMatch) layout.gridColumns = parseInt(gcMatch[1]);
    const gridColsMatch = atom.match(/^_gridCols(\d+)$/);
    if (gridColsMatch) layout.gridColumns = parseInt(gridColsMatch[1]);

    // Gap: _gap{n}
    const gapMatch = atom.match(/^_gap(\d+(?:-\d+)?)$/);
    if (gapMatch) layout.itemSpacing = SPACING_SCALE[gapMatch[1]] ?? 0;

    // Padding: _p{n}, _px{n}, _py{n}, _pt{n}, _pr{n}, _pb{n}, _pl{n}
    const pMatch = atom.match(/^_p(\d+(?:-\d+)?)$/);
    if (pMatch) {
      const val = SPACING_SCALE[pMatch[1]] ?? 0;
      layout.paddingTop = val;
      layout.paddingRight = val;
      layout.paddingBottom = val;
      layout.paddingLeft = val;
    }
    const pxMatch = atom.match(/^_px(\d+(?:-\d+)?)$/);
    if (pxMatch) {
      const val = SPACING_SCALE[pxMatch[1]] ?? 0;
      layout.paddingLeft = val;
      layout.paddingRight = val;
    }
    const pyMatch = atom.match(/^_py(\d+(?:-\d+)?)$/);
    if (pyMatch) {
      const val = SPACING_SCALE[pyMatch[1]] ?? 0;
      layout.paddingTop = val;
      layout.paddingBottom = val;
    }
    const ptMatch = atom.match(/^_pt(\d+(?:-\d+)?)$/);
    if (ptMatch) layout.paddingTop = SPACING_SCALE[ptMatch[1]] ?? 0;
    const prMatch = atom.match(/^_pr(\d+(?:-\d+)?)$/);
    if (prMatch) layout.paddingRight = SPACING_SCALE[prMatch[1]] ?? 0;
    const pbMatch = atom.match(/^_pb(\d+(?:-\d+)?)$/);
    if (pbMatch) layout.paddingBottom = SPACING_SCALE[pbMatch[1]] ?? 0;
    const plMatch = atom.match(/^_pl(\d+(?:-\d+)?)$/);
    if (plMatch) layout.paddingLeft = SPACING_SCALE[plMatch[1]] ?? 0;

    // Alignment
    if (atom === '_center') {
      layout.primaryAxisAlignItems = 'CENTER';
      layout.counterAxisAlignItems = 'CENTER';
    }
    if (atom === '_aic') layout.counterAxisAlignItems = 'CENTER';
    if (atom === '_aie') layout.counterAxisAlignItems = 'MAX';
    if (atom === '_ais') layout.counterAxisAlignItems = 'MIN';
    if (atom === '_jcc') layout.primaryAxisAlignItems = 'CENTER';
    if (atom === '_jcsb') layout.primaryAxisAlignItems = 'SPACE_BETWEEN';
    if (atom === '_jcse') layout.primaryAxisAlignItems = 'SPACE_EVENLY';
    if (atom === '_jce') layout.primaryAxisAlignItems = 'MAX';

    // Sizing
    if (atom === '_grow' || atom === '_flex1') layout.layoutGrow = 1;
    if (atom === '_w[100%]' || atom === '_wfull') layout.layoutSizingHorizontal = 'FILL';
    if (atom === '_h[100%]' || atom === '_hfull') layout.layoutSizingVertical = 'FILL';

    // Overflow
    if (atom === '_overflow[auto]' || atom === '_overflow[hidden]') {
      layout.clipsContent = true;
    }

    // Border radius: _r{n}
    const rMatch = atom.match(/^_r(\d+)$/);
    if (rMatch) layout.cornerRadius = parseInt(rMatch[1]) * 4; // approximate scale
    if (atom === '_rfull') layout.cornerRadius = 9999;

    // Wrap
    if (atom === '_wrap') layout.layoutWrap = 'WRAP';

    // Specific height
    const hMatch = atom.match(/^_h\[(\d+)(?:px|vh)?\]$/);
    if (hMatch) layout.height = parseInt(hMatch[1]);
    if (atom === '_h[100vh]') {
      layout.height = 900; // Standard viewport
      layout.layoutSizingVertical = 'FIXED';
    }
  }

  return layout;
}

// ============================================================
// Pattern Processing
// ============================================================

/**
 * Load all pattern definitions from registry.
 * @returns {Promise<Object[]>} Array of pattern objects
 */
async function loadPatterns() {
  const patternsDir = join(registryRoot, 'patterns');
  const indexPath = join(patternsDir, 'index.json');

  let patternIds;
  try {
    const index = JSON.parse(await readFile(indexPath, 'utf-8'));
    patternIds = index.patterns || Object.keys(index);
  } catch {
    // Fallback: read directory
    const files = await readdir(patternsDir);
    patternIds = files.filter(f => f.endsWith('.json') && f !== 'index.json').map(f => f.replace('.json', ''));
  }

  const patterns = [];
  for (const id of patternIds) {
    try {
      const filePath = join(patternsDir, `${id}.json`);
      const content = JSON.parse(await readFile(filePath, 'utf-8'));
      patterns.push(content);
    } catch { /* skip missing patterns */ }
  }

  return patterns;
}

/**
 * Convert a pattern definition to a Figma frame specification.
 * @param {Object} pattern - Pattern definition from registry
 * @param {string} [recipe] - Optional recipe override
 * @returns {Object} Figma frame spec
 */
/**
 * Resolve a pattern with optional preset to get the effective blend.
 * @param {Object} pattern - Pattern definition (may have presets)
 * @param {string} [presetId] - Optional preset to use
 * @returns {Object} Resolved pattern with effective blend
 */
function resolvePreset(pattern, presetId) {
  if (!presetId || !pattern.presets?.[presetId]) return pattern;
  const preset = pattern.presets[presetId];
  return {
    ...pattern,
    default_blend: preset.blend || pattern.default_blend,
    components: preset.components || pattern.components,
    code: preset.code || pattern.code,
  };
}

function patternToFigmaFrame(pattern, recipe, presetId) {
  const resolved = resolvePreset(pattern, presetId);
  const blend = resolved.default_blend || {};
  const atoms = blend.atoms || '_flex _col _gap4 _p4';

  // Apply recipe overrides if present
  let effectiveAtoms = atoms;
  let wrapperClass = '';
  if (recipe && resolved.recipe_overrides?.[recipe]) {
    const override = resolved.recipe_overrides[recipe];
    if (override.atoms) effectiveAtoms = override.atoms;
    if (override.wrapper) wrapperClass = override.wrapper;
  }

  const layout = atomsToFigmaLayout(effectiveAtoms);

  const frame = {
    type: 'FRAME',
    name: pattern.name || pattern.id,
    id: pattern.id,
    ...layout,
    // Include slot definitions for composition
    slots: {},
  };

  // Process slots
  if (blend.slots) {
    for (const [slotName, slotDesc] of Object.entries(blend.slots)) {
      frame.slots[slotName] = {
        description: slotDesc,
        // Placeholder component instance
        node: {
          type: 'INSTANCE',
          name: slotName,
          componentId: null, // Resolved during composition
        },
      };
    }
  }

  // Add recipe wrapper if needed
  if (wrapperClass) {
    frame.wrapperClass = wrapperClass;
    frame.wrapperDescription = `Wrapped with .${wrapperClass} recipe decorator`;
  }

  // Components used
  frame.components = pattern.components || [];

  return frame;
}

// ============================================================
// Skeleton Processing
// ============================================================

/**
 * Load skeleton definitions.
 * @returns {Promise<Object>} Skeleton definitions keyed by ID
 */
async function loadSkeletons() {
  const path = join(registryRoot, 'skeletons.json');
  try {
    return JSON.parse(await readFile(path, 'utf-8'));
  } catch {
    return {};
  }
}

/**
 * Convert a skeleton definition to Figma frame specs at multiple viewports.
 * @param {string} id - Skeleton ID
 * @param {Object} skeleton - Skeleton definition
 * @returns {Object[]} Figma frame specs at 3 viewports
 */
function skeletonToFigmaFrames(id, skeleton) {
  const viewports = [
    { name: 'Desktop', width: 1440, height: 900 },
    { name: 'Tablet', width: 1024, height: 768 },
    { name: 'Mobile', width: 375, height: 812 },
  ];

  return viewports.map(vp => {
    const atoms = skeleton.atoms || '_grid _h[100vh]';
    const layout = atomsToFigmaLayout(atoms);
    const config = skeleton.config || {};

    const frame = {
      type: 'FRAME',
      name: `${skeleton.name || id} — ${vp.name}`,
      skeletonId: id,
      viewport: vp.name,
      width: vp.width,
      height: vp.height,
      layoutSizingHorizontal: 'FIXED',
      layoutSizingVertical: 'FIXED',
      ...layout,
      regions: [],
    };

    // Map grid regions
    if (config.regions) {
      for (const region of config.regions) {
        const regionFrame = {
          type: 'FRAME',
          name: region,
          layoutMode: 'VERTICAL',
          layoutSizingHorizontal: 'FILL',
          layoutSizingVertical: region === 'header' ? 'HUG' : 'FILL',
        };

        // Apply region-specific config
        if (region === 'nav' && config.nav) {
          regionFrame.width = parseInt(config.nav.width) || 240;
          regionFrame.layoutSizingHorizontal = 'FIXED';
          // Collapse on mobile
          if (vp.name === 'Mobile' && config.nav.collapseBelow) {
            regionFrame.visible = false;
          }
        }
        if (region === 'header' && config.header) {
          regionFrame.height = parseInt(config.header.height) || 52;
          regionFrame.layoutSizingVertical = 'FIXED';
        }
        if (region === 'body' && config.body?.scroll) {
          regionFrame.clipsContent = true;
        }

        frame.regions.push(regionFrame);
      }
    }

    return frame;
  });
}

// ============================================================
// Archetype Processing
// ============================================================

/**
 * Load archetype definitions.
 * @returns {Promise<Object[]>} Array of archetype objects
 */
async function loadArchetypes() {
  const archetypesDir = join(registryRoot, 'archetypes');
  try {
    const files = await readdir(archetypesDir);
    const archetypes = [];
    for (const file of files.filter(f => f.endsWith('.json'))) {
      const content = JSON.parse(await readFile(join(archetypesDir, file), 'utf-8'));
      archetypes.push(content);
    }
    return archetypes;
  } catch {
    return [];
  }
}

/**
 * Compose a full archetype page from skeleton + patterns.
 * @param {Object} archetype - Archetype definition
 * @param {Object} patternMap - Patterns keyed by ID
 * @param {Object} skeletons - Skeletons keyed by ID
 * @returns {Object[]} Figma page frame specs
 */
function archetypeToFigmaPages(archetype, patternMap, skeletons) {
  const pages = [];

  for (const page of archetype.pages || []) {
    const skeleton = skeletons[page.skeleton];
    const blend = page.default_blend || page.blend || [];

    const pageFrame = {
      type: 'FRAME',
      name: `${archetype.id} / ${page.id}`,
      archetypeId: archetype.id,
      pageId: page.id,
      skeletonId: page.skeleton,
      width: 1440,
      height: 900,
      layoutMode: 'VERTICAL',
      layoutSizingHorizontal: 'FIXED',
      clipsContent: true,
      // Skeleton base
      skeleton: skeleton ? {
        name: skeleton.name,
        config: skeleton.config,
      } : null,
      // Composed pattern rows
      rows: [],
    };

    // Process blend array (supports v2 preset references)
    function resolveBlendPattern(ref) {
      if (typeof ref === 'string') {
        return { id: ref, pattern: patternMap[ref], presetId: null };
      }
      if (ref && ref.pattern) {
        const basePattern = patternMap[ref.pattern];
        return { id: ref.as || ref.pattern, pattern: basePattern, presetId: ref.preset };
      }
      return { id: ref, pattern: null, presetId: null };
    }

    for (const blendItem of blend) {
      if (typeof blendItem === 'string' || (blendItem.pattern && !blendItem.cols)) {
        // Full-width pattern row (string or v2 preset ref)
        const { id, pattern, presetId } = resolveBlendPattern(blendItem);
        if (pattern) {
          pageFrame.rows.push({
            type: 'pattern',
            id,
            frame: patternToFigmaFrame(pattern, null, presetId),
            layoutSizingHorizontal: 'FILL',
          });
        }
      } else if (blendItem.cols) {
        // Multi-column row
        const colCount = blendItem.cols.length;
        const row = {
          type: 'columns',
          layoutMode: 'HORIZONTAL',
          itemSpacing: 16, // default _gap4
          layoutSizingHorizontal: 'FILL',
          collapseBelow: blendItem.at || 'md',
          columns: [],
        };

        for (const col of blendItem.cols) {
          const { id, pattern, presetId } = resolveBlendPattern(col);
          const span = blendItem.span?.[id] || 1;
          row.columns.push({
            id,
            span,
            frame: pattern ? patternToFigmaFrame(pattern, null, presetId) : { type: 'FRAME', name: id },
            layoutGrow: span,
          });
        }

        pageFrame.rows.push(row);
      }
    }

    pages.push(pageFrame);
  }

  return pages;
}

// ============================================================
// Public API
// ============================================================

/**
 * Generate Figma pattern, skeleton, and archetype layout templates.
 * @param {Object} opts
 * @param {string} [opts.recipe] - Recipe to apply overrides
 * @param {string} [opts.output] - Output directory
 * @param {boolean} [opts.dryRun=false] - Print stats without writing
 * @param {string} [opts.cwd] - Working directory
 * @returns {Promise<{ patterns: number, skeletons: number, archetypes: number, file: string }>}
 */
export async function generateFigmaPatterns(opts = {}) {
  const {
    recipe,
    output: outputDir,
    'dry-run': dryRun = false,
    dryRun: dryRunAlt = false,
    cwd = process.cwd(),
  } = opts;

  const isDryRun = dryRun || dryRunAlt;
  const outDir = outputDir ? resolve(cwd, outputDir) : join(cwd, 'dist', 'figma');

  // Load all data sources
  const [patterns, skeletons, archetypes] = await Promise.all([
    loadPatterns(),
    loadSkeletons(),
    loadArchetypes(),
  ]);

  // Build pattern map
  const patternMap = {};
  for (const p of patterns) {
    patternMap[p.id] = p;
  }

  if (isDryRun) {
    return {
      patterns: patterns.length,
      skeletons: Object.keys(skeletons).length,
      archetypes: archetypes.length,
    };
  }

  // Generate pattern frames
  const patternFrames = patterns.map(p => patternToFigmaFrame(p, recipe));

  // Generate skeleton frames (3 viewports each)
  const skeletonFrames = [];
  for (const [id, skeleton] of Object.entries(skeletons)) {
    skeletonFrames.push(...skeletonToFigmaFrames(id, skeleton));
  }

  // Generate archetype page compositions
  const archetypePages = [];
  for (const archetype of archetypes) {
    archetypePages.push(...archetypeToFigmaPages(archetype, patternMap, skeletons));
  }

  const output = {
    $schema: 'https://decantr.ai/schemas/figma-patterns.v1.json',
    generatedAt: new Date().toISOString(),
    patterns: patternFrames,
    skeletons: skeletonFrames,
    archetypes: archetypePages,
  };

  await mkdir(outDir, { recursive: true });
  const outFile = join(outDir, 'patterns.json');
  await writeFile(outFile, JSON.stringify(output, null, 2));

  return {
    patterns: patternFrames.length,
    skeletons: skeletonFrames.length,
    archetypes: archetypePages.length,
    file: outFile,
  };
}
