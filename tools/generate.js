/**
 * Generate engine — reads decantr.essence.json and produces working code.
 *
 * Algorithm:
 * 1. Parse essence
 * 2. For each page in structure:
 *    a. Resolve skeleton → get code from skeletons.json
 *    b. For each item in blend:
 *       - String → load pattern, use its code.example
 *       - { cols } → grid wrapper with patterns inside
 *       - { cols, span } → weighted grid with patterns
 *    c. Wrap contained patterns in Card components (recipe styles override Card appearance)
 *    c2. Apply recipe pattern_overrides (background effects) from recipe JSON
 *    d. Deduplicate imports
 *    e. Generate page function
 * 3. Generate src/app.js with router, style/mode init, skeleton layout
 * 4. Generate src/state/store.js with signals
 * 5. Write decantr.lock.json recording essence hash
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { VERSION } from './version.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const registryRoot = join(__dirname, '..', 'src', 'registry');

// ─── Registry loaders ───────────────────────────────────────────

async function loadJSON(path) {
  return JSON.parse(await readFile(path, 'utf-8'));
}

async function loadSkeletons() {
  const data = await loadJSON(join(registryRoot, 'skeletons.json'));
  return data.skeletons;
}

async function loadPattern(id, projectRoot) {
  // Support local patterns via 'local:' prefix (project-local src/patterns/ dir)
  if (id.startsWith('local:')) {
    const localId = id.slice(6);
    const localPath = join(projectRoot || process.cwd(), 'src', 'patterns', `${localId}.json`);
    return loadJSON(localPath);
  }
  return loadJSON(join(registryRoot, 'patterns', `${id}.json`));
}

/**
 * Resolve a pattern reference that may include a preset.
 * Accepts both string IDs and { pattern, preset, as } objects.
 * Returns the resolved pattern with preset-specific blend/code merged in.
 */
async function resolvePatternRef(ref, recipeDefaultPresets) {
  if (typeof ref === 'string') {
    const pattern = await loadPattern(ref);
    // Recipe may suggest a default preset for this pattern
    const presetId = recipeDefaultPresets?.[ref] || pattern.default_preset;
    if (presetId && pattern.presets?.[presetId]) {
      const preset = pattern.presets[presetId];
      return {
        id: ref,
        alias: ref,
        pattern: {
          ...pattern,
          id: ref,
          name: pattern.name + (presetId !== pattern.default_preset ? ` (${presetId})` : ''),
          components: preset.components || pattern.components,
          default_blend: preset.blend || pattern.default_blend,
          code: preset.code || pattern.code,
        }
      };
    }
    return { id: ref, alias: ref, pattern };
  }
  if (ref && ref.pattern) {
    const pattern = await loadPattern(ref.pattern);
    // Resolution order: explicit preset > recipe default > pattern default
    const presetId = ref.preset || recipeDefaultPresets?.[ref.pattern] || pattern.default_preset;
    const alias = ref.as || ref.pattern;

    // If pattern has presets and a matching preset exists, merge it
    if (presetId && pattern.presets?.[presetId]) {
      const preset = pattern.presets[presetId];
      return {
        id: ref.pattern,
        alias,
        pattern: {
          ...pattern,
          id: alias,
          name: pattern.name + (presetId !== pattern.default_preset ? ` (${presetId})` : ''),
          components: preset.components || pattern.components,
          default_blend: preset.blend || pattern.default_blend,
          code: preset.code || pattern.code,
        }
      };
    }
    return { id: ref.pattern, alias, pattern };
  }
  return null;
}

async function loadRecipe(id) {
  return loadJSON(join(registryRoot, `recipe-${id}.json`));
}

// ─── Import deduplication ───────────────────────────────────────

function parseImports(importStr) {
  if (!importStr) return new Map();
  const imports = new Map();
  for (const line of importStr.split('\n')) {
    const m = line.match(/import\s+\{([^}]+)\}\s+from\s+'([^']+)'/);
    if (m) {
      const names = m[1].split(',').map(s => s.trim()).filter(Boolean);
      const from = m[2];
      if (!imports.has(from)) imports.set(from, new Set());
      for (const name of names) imports.get(from).add(name);
    }
  }
  return imports;
}

function mergeImports(a, b) {
  const merged = new Map(a);
  for (const [from, names] of b) {
    if (!merged.has(from)) merged.set(from, new Set());
    for (const name of names) merged.get(from).add(name);
  }
  return merged;
}

function renderImports(imports) {
  const order = ['decantr/tags', 'decantr/core', 'decantr/state', 'decantr/css', 'decantr/router', 'decantr/components', 'decantr/chart'];
  const lines = [];
  for (const mod of order) {
    if (imports.has(mod)) {
      const names = [...imports.get(mod)].sort();
      lines.push(`import { ${names.join(', ')} } from '${mod}';`);
    }
  }
  // Any remaining imports not in order
  for (const [mod, names] of imports) {
    if (!order.includes(mod)) {
      lines.push(`import { ${[...names].sort().join(', ')} } from '${mod}';`);
    }
  }
  return lines.join('\n');
}

// ─── Blend resolver ─────────────────────────────────────────────

function resolveBlendId(item) {
  // Extract the effective ID (alias) from a blend item
  if (typeof item === 'string') return item;
  if (item.as) return item.as;
  if (item.pattern) return item.pattern;
  return null;
}

function blendItemToCode(item, nameMap, indent = '    ', patterns = null, recipePatternOverrides = null, clarity = null, recipeCardWrapping = null, wirings = null) {
  const gap = clarity?.contentGap || '_gap4';

  // Wrap pattern in Card component (skip for standalone patterns like heroes and filter rows)
  function wrapPattern(patternId, call, localIndent) {
    const pattern = patterns?.get(patternId);
    const layout = pattern?.default_blend?.layout;
    // Standalone patterns: heroes, horizontal control rows, explicitly uncontained
    if (layout === 'hero' || layout === 'row' || pattern?.contained === false) return call;

    // Recipe card_wrapping hint
    const wrapping = recipeCardWrapping || 'always';
    if (wrapping === 'none') return call;
    if (wrapping === 'minimal' && !pattern?.requires_card) return call;

    const i = localIndent || indent;
    const headerName = pattern?.name || toDisplayName(patternId);
    const extra = recipePatternOverrides?.get(patternId);
    const cardAttrs = extra?.background ? `{ class: css('${extra.background}') }` : '{}';
    return `Card(${cardAttrs},\n${i}  Card.Header({}, '${headerName}'),\n${i}  Card.Body({},\n${i}    ${call}\n${i}  )\n${i})`;
  }

  if (typeof item === 'string') {
    // Full-width pattern
    const fn = nameMap.get(item) || toPascalCase(item);
    const wireProps = wirings?.props?.get(item);
    const call = wireProps ? `${fn}({ ${formatWireProps(wireProps)} })` : `${fn}()`;
    return `${indent}// @pattern: ${item}\n${indent}${wrapPattern(item, call)}`;
  }

  // v2 preset reference at top level: { pattern, preset, as }
  if (item.pattern && !item.cols) {
    const alias = item.as || item.pattern;
    const fn = nameMap.get(alias) || toPascalCase(alias);
    const wireProps = wirings?.props?.get(alias);
    const call = wireProps ? `${fn}({ ${formatWireProps(wireProps)} })` : `${fn}()`;
    return `${indent}// @pattern: ${alias} (${item.pattern}:${item.preset || 'default'})\n${indent}${wrapPattern(alias, call)}`;
  }

  if (item.cols) {
    const colCount = item.cols.length;
    const hasSpan = item.span && Object.keys(item.span).length > 0;

    // Responsive breakpoint: collapse to 1 column below `at`
    const bpPrefix = item.at ? `_gc1 _${item.at}:` : '';

    if (hasSpan) {
      // Weighted grid
      const totalSpan = item.cols.reduce((sum, c) => sum + (item.span?.[resolveBlendId(c) || c] || 1), 0);
      const children = item.cols.map(c => {
        const id = resolveBlendId(c) || c;
        const span = item.span?.[id] || 1;
        const fn = nameMap.get(id) || toPascalCase(id);
        const wireProps = wirings?.props?.get(id);
        const call = wireProps ? `${fn}({ ${formatWireProps(wireProps)} })` : `${fn}()`;
        return `${indent}  div({ class: css('_span${span}') },\n${indent}    // @pattern: ${id}\n${indent}    ${wrapPattern(id, call, indent + '    ')}\n${indent}  )`;
      }).join(',\n');
      const gridAtoms = bpPrefix ? `_grid ${bpPrefix}gc${totalSpan} ${gap}` : `_grid _gc${totalSpan} ${gap}`;
      return `${indent}div({ class: css('${gridAtoms}') },\n${children}\n${indent})`;
    } else {
      // Equal-width grid
      const children = item.cols.map(c => {
        const id = resolveBlendId(c) || c;
        const fn = nameMap.get(id) || toPascalCase(id);
        const wireProps = wirings?.props?.get(id);
        const call = wireProps ? `${fn}({ ${formatWireProps(wireProps)} })` : `${fn}()`;
        return `${indent}  // @pattern: ${id}\n${indent}  ${wrapPattern(id, call, indent + '  ')}`;
      }).join(',\n');
      const gridAtoms = bpPrefix ? `_grid ${bpPrefix}gc${colCount} ${gap}` : `_grid _gc${colCount} ${gap}`;
      return `${indent}div({ class: css('${gridAtoms}') },\n${children}\n${indent})`;
    }
  }

  return `${indent}// Unknown blend item`;
}

// ─── Naming helpers ─────────────────────────────────────────────

function toCamelCase(kebab) {
  return kebab.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

function toPascalCase(kebab) {
  const camel = toCamelCase(kebab);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

function toDisplayName(kebab) {
  return kebab.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// ─── Clarity profile (character → spacing) ──────────────────────
// Source of truth: reference/spatial-guidelines.md §17
//
// Priority table (higher priority = lower number, wins on multi-trait conflict):
// 1. Compact   — tactical, dense, data-dense, technical, utilitarian
// 2. Editorial — editorial, luxurious, premium
// 3. Expressive — playful, bouncy, fluffy, immersive, cinematic, dramatic
// 4. Spacious  — minimal, clean, elegant
// 5. Balanced  — professional, modern, friendly
// 6. Default   — comfortable (no match)
//
// Rationale: functional density constraints (compact) are hardest to violate
// without breaking usability, so they take precedence. Aesthetic intent comes next.

function deriveClarityProfile(character, recipeSpatial) {
  const traits = (character || []).map(t => t.toLowerCase());
  let base;

  // Priority 1: Compact (functional density)
  if (traits.some(t => ['tactical', 'dense', 'data-dense', 'technical', 'utilitarian'].includes(t))) {
    base = { contentGap: '_gap3', chromeGap: '_gap1', sectionPad: '_py8', density: 'compact' };
  }
  // Priority 2: Editorial (spacious luxury)
  else if (traits.some(t => ['editorial', 'luxurious', 'premium'].includes(t))) {
    base = { contentGap: '_gap8', chromeGap: '_gap2', sectionPad: '_py24', density: 'spacious' };
  }
  // Priority 3: Expressive (comfortable with room)
  else if (traits.some(t => ['playful', 'bouncy', 'fluffy', 'immersive', 'cinematic', 'dramatic'].includes(t))) {
    base = { contentGap: '_gap5', chromeGap: '_gap2', sectionPad: '_py12', density: 'comfortable' };
  }
  // Priority 4: Spacious (clean minimalism)
  else if (traits.some(t => ['minimal', 'clean', 'elegant'].includes(t))) {
    base = { contentGap: '_gap6', chromeGap: '_gap2', sectionPad: '_py16', density: 'spacious' };
  }
  // Priority 5: Balanced (professional default)
  else if (traits.some(t => ['professional', 'modern', 'friendly'].includes(t))) {
    base = { contentGap: '_gap4', chromeGap: '_gap2', sectionPad: '_py12', density: 'comfortable' };
  }
  // Priority 6: Default
  else {
    base = { contentGap: '_gap4', chromeGap: '_gap2', sectionPad: '_py12', density: 'comfortable' };
  }

  // Recipe spatial overlay — recipe can shift the base profile
  if (recipeSpatial) {
    if (recipeSpatial.section_padding) base.sectionPad = recipeSpatial.section_padding;
    if (recipeSpatial.content_gap_shift) {
      const gapNum = parseInt(base.contentGap.replace('_gap', ''));
      base.contentGap = `_gap${Math.max(1, Math.min(12, gapNum + recipeSpatial.content_gap_shift))}`;
    }
    if (recipeSpatial.density_bias) {
      const densities = ['compact', 'comfortable', 'spacious'];
      const idx = densities.indexOf(base.density);
      base.density = densities[Math.max(0, Math.min(2, idx + recipeSpatial.density_bias))] || base.density;
    }
  }

  return base;
}

// ─── Recipe pattern overrides resolver ───────────────────────────
// Overrides now live in recipe JSON (pattern_overrides section),
// not in individual pattern files. Patterns stay recipe-agnostic.

// ─── Page generator ─────────────────────────────────────────────

async function generatePage(page, vintage, recipe, clarity = null) {
  const blendRefs = extractBlendRefs(page.blend || []);
  const patterns = new Map();
  let pageImports = parseImports("import { tags } from 'decantr/tags';\nimport { css } from 'decantr/css';\nimport { component } from 'decantr/core';");

  // Load all patterns referenced in blend (supports both string IDs and {pattern, preset, as})
  const recipeDefaultPresets = recipe?.pattern_preferences?.default_presets || null;
  for (const ref of blendRefs) {
    try {
      const resolved = await resolvePatternRef(ref, recipeDefaultPresets);
      if (resolved) {
        patterns.set(resolved.alias, resolved.pattern);
        if (resolved.pattern.code?.imports) {
          pageImports = mergeImports(pageImports, parseImports(resolved.pattern.code.imports));
        }
      }
    } catch {
      // Pattern not found — generate placeholder
      const id = typeof ref === 'string' ? ref : (ref.as || ref.pattern);
      patterns.set(id, { id, code: null });
    }
  }

  // Cross-pattern wiring: detect applicable rules
  const wirings = detectWirings(page.blend || []);
  const hasWirings = wirings.signals.size > 0;
  if (hasWirings) {
    pageImports = mergeImports(pageImports, parseImports("import { createSignal } from 'decantr/state';"));
  }

  // Build name map — extract actual function names from code examples
  const nameMap = new Map();
  for (const [id, pattern] of patterns) {
    if (pattern.code?.example) {
      const m = pattern.code.example.match(/function\s+(\w+)/);
      if (m) { nameMap.set(id, m[1]); continue; }
    }
    nameMap.set(id, toPascalCase(id));
  }

  // Load recipe pattern overrides from recipe JSON (not from individual patterns)
  const recipePatternOverrides = recipe?.pattern_overrides
    ? new Map(Object.entries(recipe.pattern_overrides))
    : null;

  // Check if Card wrapping will be needed (any non-standalone pattern)
  const needsCardWrap = [...patterns.values()].some(p => {
    const layout = p.default_blend?.layout;
    return layout !== 'hero' && layout !== 'row' && p.contained !== false;
  });
  if (needsCardWrap) {
    pageImports = mergeImports(pageImports, parseImports("import { Card } from 'decantr/components';"));
  }

  // Generate pattern functions
  const patternFunctions = [];
  for (const [id, pattern] of patterns) {
    const fnName = nameMap.get(id) || toPascalCase(id);
    if (pattern.code?.example) {
      let code = pattern.code.example;
      // Apply clarity-derived gap to pattern internals
      if (clarity && clarity.contentGap !== '_gap4') {
        code = code.replace(/\b_gap4\b/g, clarity.contentGap);
      }
      patternFunctions.push(`// @pattern: ${id}\n${code}`);
    } else {
      // Fallback placeholder
      const atoms = pattern.default_blend?.atoms || '_flex _col _gap4 _p4';
      patternFunctions.push(
        `// @pattern: ${id}\nfunction ${fnName}() {\n  const { div, h3 } = tags;\n  return div({ class: css('${atoms}') },\n    h3({ class: css('_heading4') }, '${toPascalCase(id)}')\n  );\n}`
      );
    }
  }

  // Generate page function body from blend
  const recipeCardWrapping = recipe?.spatial_hints?.card_wrapping || null;
  const blendCode = (page.blend || []).map(item =>
    blendItemToCode(item, nameMap, '    ', patterns, recipePatternOverrides, clarity, recipeCardWrapping, wirings)
  ).join(',\n');

  const defaultGap = clarity?.contentGap || '_gap4';
  const surface = page.surface || `_flex _col ${defaultGap} _p4 _overflow[auto] _flex1`;
  const pageName = toPascalCase(page.id) + 'Page';

  let wiringSignals = '';
  if (hasWirings) {
    const sigLines = [];
    for (const [name, init] of wirings.signals) {
      const setter = 'set' + name.charAt(0).toUpperCase() + name.slice(1);
      sigLines.push(`  const [${name}, ${setter}] = createSignal(${init});`);
    }
    wiringSignals = '\n' + sigLines.join('\n') + '\n';
  }

  const pageFunction = `export default component(function ${pageName}() {
  const { div } = tags;${wiringSignals}
  return div({ class: css('${surface}') },
${blendCode}
  );
})`;

  return {
    name: pageName,
    id: page.id,
    imports: renderImports(pageImports),
    patternFunctions: patternFunctions.join('\n\n'),
    pageFunction,
    full: `${renderImports(pageImports)}\n\n${patternFunctions.join('\n\n')}\n\n${pageFunction}\n`
  };
}

/**
 * Extract all pattern references from a blend array.
 * Returns a Set of refs (strings or {pattern, preset, as} objects).
 * Handles both v1 flat strings and v2 preset references.
 */
function extractBlendRefs(blend) {
  const refs = [];
  const seen = new Set();
  for (const item of blend) {
    if (typeof item === 'string') {
      if (!seen.has(item)) { refs.push(item); seen.add(item); }
    } else if (item.pattern) {
      // v2 preset reference in blend array
      const key = item.as || item.pattern;
      if (!seen.has(key)) { refs.push(item); seen.add(key); }
    } else if (item.cols) {
      for (const col of item.cols) {
        if (typeof col === 'string') {
          if (!seen.has(col)) { refs.push(col); seen.add(col); }
        } else if (col.pattern) {
          const key = col.as || col.pattern;
          if (!seen.has(key)) { refs.push(col); seen.add(key); }
        }
      }
    }
  }
  return refs;
}

// Backward compat: extract just the IDs (aliases) from blend refs
function extractPatternIds(blend) {
  return new Set(extractBlendRefs(blend).map(ref =>
    typeof ref === 'string' ? ref : (ref.as || ref.pattern)
  ));
}

// ─── Nav icon map ────────────────────────────────────────────────

const NAV_ICONS = {
  overview: 'layout-dashboard', home: 'home', analytics: 'bar-chart',
  users: 'user', settings: 'settings', billing: 'file',
  notifications: 'bell', pipeline: 'activity', goals: 'target',
  search: 'search', reports: 'bar-chart', products: 'file',
  orders: 'file', dashboard: 'layout-dashboard', profile: 'user',
  apps: 'box', team: 'users', activity: 'activity', services: 'server',
  tokens: 'key', usage: 'gauge', status: 'circle-dot', compliance: 'shield-check',
};

// ─── Cross-pattern wiring rules ─────────────────────────────────
// When related patterns co-exist on a page, the generator creates
// page-level signals and passes them as props to pattern functions.

const WIRING_RULES = [
  {
    pair: ['filter-bar', 'data-table'],
    signals: [
      { name: 'pageSearch', init: "''" },
      { name: 'pageStatus', init: "'all'" },
    ],
    props: {
      'filter-bar': { onSearch: 'setPageSearch', onCategory: 'setPageStatus' },
      'data-table': { search: 'pageSearch', status: 'pageStatus' },
    }
  },
  {
    pair: ['filter-bar', 'activity-feed'],
    signals: [
      { name: 'pageSearch', init: "''" },
      { name: 'pageView', init: "'all'" },
    ],
    props: {
      'filter-bar': { onSearch: 'setPageSearch', onView: 'setPageView' },
      'activity-feed': { search: 'pageSearch', view: 'pageView' },
    }
  },
  {
    pair: ['filter-bar', 'card-grid'],
    signals: [{ name: 'pageSearch', init: "''" }],
    props: {
      'filter-bar': { onSearch: 'setPageSearch' },
      'card-grid': { search: 'pageSearch' },
    }
  },
];

function formatWireProps(props) {
  return Object.entries(props).map(([k, v]) => `${k}: ${v}`).join(', ');
}

/**
 * Detect applicable cross-pattern wiring rules for a page's blend.
 * Returns { signals: Map<name, init>, props: Map<patternAlias, propsObj> }
 */
function detectWirings(blend) {
  const baseIds = new Set();
  const aliasToBase = new Map();
  for (const ref of extractBlendRefs(blend)) {
    if (typeof ref === 'string') {
      baseIds.add(ref);
      aliasToBase.set(ref, ref);
    } else if (ref.pattern) {
      const alias = ref.as || ref.pattern;
      baseIds.add(ref.pattern);
      aliasToBase.set(alias, ref.pattern);
    }
  }

  const signals = new Map();
  const props = new Map();

  for (const rule of WIRING_RULES) {
    const [a, b] = rule.pair;
    if (!baseIds.has(a) || !baseIds.has(b)) continue;

    for (const sig of rule.signals) {
      if (!signals.has(sig.name)) signals.set(sig.name, sig.init);
    }

    for (const [baseId, propsObj] of Object.entries(rule.props)) {
      for (const [alias, base] of aliasToBase) {
        if (base === baseId) {
          const existing = props.get(alias) || {};
          props.set(alias, { ...existing, ...propsObj });
        }
      }
    }
  }

  return { signals, props };
}

// ─── App.js generator ───────────────────────────────────────────

function generateAppJs(essence, pages, skeletonCode, recipe = null, clarity = null) {
  const style = essence.vintage?.style || 'auradecantism';
  const mode = essence.vintage?.mode || 'dark';
  const shape = essence.vintage?.shape || null;
  const routing = essence.vessel?.routing || 'hash';

  // Resolve route paths
  function routePath(id) {
    return (id === 'home' || id === 'overview') ? '/' : '/' + id;
  }

  const routeEntries = pages.map(p =>
    `    { path: '${p.id === 'login' ? '/login' : routePath(p.id)}', component: () => import('./pages/${p.id}.js').then(m => m.default) }`
  ).join(',\n');

  // Determine dominant skeleton from structure
  const structures = Array.isArray(essence.sections)
    ? essence.sections.flatMap(s => s.structure || [])
    : (essence.structure || []);
  const skeletonId = structures[0]?.skeleton || 'sidebar-main';
  const inset = structures.some(p => p.inset);

  // Build nav array — exclude centered-skeleton pages (auth flows)
  const nav = structures
    .filter(p => p.skeleton !== 'centered')
    .map(p => ({ href: routePath(p.id), icon: NAV_ICONS[p.id] || 'file', label: toDisplayName(p.id) }));

  // Build skeleton-specific App function and extra imports
  const terroir = essence.terroir || 'App';
  let { appFunction, extraImports } = buildSkeletonApp(skeletonId, nav, clarity, terroir, inset);

  // Apply recipe-specific decoration to the skeleton
  if (recipe) {
    appFunction = applyRecipeToSkeleton(appFunction, recipe, clarity);
  }

  // Addon style import/registration (non-core styles need explicit import)
  const ADDON_STYLE_MAP = {
    'clean': { varName: 'clean', pkg: 'clean' },
    'glassmorphism': { varName: 'glassmorphism', pkg: 'glassmorphism' },
    'retro': { varName: 'retro', pkg: 'community/retro' },
    'launchpad': { varName: 'launchpad', pkg: 'community/launchpad' },
    'liquid-glass': { varName: 'liquidGlass', pkg: 'community/liquid-glass' },
    'dopamine': { varName: 'dopamine', pkg: 'community/dopamine' },
    'prismatic': { varName: 'prismatic', pkg: 'community/prismatic' },
    'bioluminescent': { varName: 'bioluminescent', pkg: 'community/bioluminescent' },
    'editorial': { varName: 'editorial', pkg: 'community/editorial' },
  };
  const addonInfo = ADDON_STYLE_MAP[style];
  const cssImportNames = addonInfo
    ? `css, setShape, setStyle, setMode, registerStyle`
    : `css, setShape, setStyle, setMode`;
  const addonImportLine = addonInfo
    ? `\nimport { ${addonInfo.varName} } from 'decantr/styles/${addonInfo.pkg}';`
    : '';
  const addonRegisterLine = addonInfo
    ? `registerStyle(${addonInfo.varName});\n`
    : '';

  // Merge imports
  const baseImports = parseImports([
    "import { tags } from 'decantr/tags';",
    "import { mount } from 'decantr/core';",
    "import { createRouter } from 'decantr/router';",
    `import { ${cssImportNames} } from 'decantr/css';`,
  ].join('\n'));

  const skelImports = parseImports(extraImports);
  const allImports = mergeImports(baseImports, skelImports);

  return `// Generated by decantr generate — ${new Date().toISOString().split('T')[0]}
// Modify freely — this is a starting point, not a final product.

${renderImports(allImports)}${addonImportLine}

// ─── Style initialization ───────────────────────────────────────
${addonRegisterLine}setStyle('${style}');
setMode('${mode}');${shape ? `\nsetShape('${shape}');` : ''}

// ─── Router ─────────────────────────────────────────────────────
const router = createRouter({
  mode: '${routing}',
  routes: [
${routeEntries},
    { path: '/:404', component: () => import('./pages/not-found.js').then(m => m.default) }
  ]
});

// ─── App shell (${skeletonId} skeleton) ────────────────────────
${appFunction}

mount(document.getElementById('app'), App);
`;
}

function buildSkeletonApp(skeletonId, nav, clarity = null, terroir = 'App', inset = false) {
  const navLiteral = `[\n${nav.map(n => `    { href: '${n.href}', icon: '${n.icon}', label: '${n.label}' }`).join(',\n')}\n  ]`;
  const contentGap = clarity?.contentGap || '_gap4';
  const chromeGap = clarity?.chromeGap || '_gap1';
  const brandLabel = toDisplayName(terroir);

  switch (skeletonId) {
    case 'sidebar-main': return {
      extraImports: [
        "import { text, cond, onMount, onDestroy } from 'decantr/core';",
        "import { createSignal } from 'decantr/state';",
        "import { link, useRoute, navigate } from 'decantr/router';",
        "import { Shell, Breadcrumb, Button, Command, Dropdown, Popover, icon } from 'decantr/components';",
      ].join('\n'),
      // ── sidebar-main skeleton ── matched by applyRecipeToSkeleton
      appFunction: `function App() {
  const { div, span } = tags;
  const [navState, setNavState] = createSignal('expanded');
  const [cmdOpen, setCmdOpen] = createSignal(false);
  const route = useRoute();

  const nav = ${navLiteral};

  const pageTitle = () => {
    const path = route().path;
    const item = nav.find(n => n.href === path);
    return item ? item.label : '${brandLabel}';
  };

  // Keyboard shortcut: Ctrl+\\ to toggle sidebar
  const handleKey = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === '\\\\') {
      e.preventDefault();
      setNavState(navState() === 'expanded' ? 'rail' : 'expanded');
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      setCmdOpen(!cmdOpen());
    }
  };
  onMount(() => document.addEventListener('keydown', handleKey));
  onDestroy(() => document.removeEventListener('keydown', handleKey));

  return Shell({ config: 'sidebar-main',${inset ? ' inset: true,' : ''} navState, onNavStateChange: setNavState, class: css('_h[100vh]') },
    // Sidebar — recipe: sidebar chrome
    Shell.Nav({ class: css('_flex _col ${chromeGap} _bgmuted') },
      div({ class: css('_flex _aic _jcsb _mb4 _px3 _pt3') },
        cond(() => navState() !== 'rail', () => span({ class: css('_heading5') }, '${brandLabel}')),
        Button({ variant: 'ghost', size: 'sm', onclick: () => setNavState(navState() === 'expanded' ? 'rail' : 'expanded') },
          icon('panel-left')
        )
      ),
      ...nav.map(item =>
        link({ href: item.href, class: () => css(\`d-shell-nav-item _r2 _trans \${route().path === item.href ? 'd-shell-nav-item-active _bgprimary/10 _fgprimary' : '_fgfg'}\`) },
          icon(item.icon),
          cond(() => navState() !== 'rail', () => text(() => item.label))
        )
      )
    ),
    // Header — recipe: header chrome
    Shell.Header({ class: css('_flex _aic _jcsb _px6 _borderB') },
      Breadcrumb({ items: () => [
            { label: '${brandLabel}', href: '/' },
            { label: pageTitle() }
          ], separator: 'slash' }),
      div({ class: css('_flex _aic _gap2') },
        Button({ variant: 'ghost', size: 'sm', onclick: () => setCmdOpen(true) }, icon('search')),
        Popover({ trigger: () => Button({ variant: 'ghost', size: 'sm' }, icon('bell')), align: 'end' },
          div({ class: css('_p4 _fgmuted _body') }, 'No new notifications')
        ),
        Dropdown({ trigger: () => Button({ variant: 'ghost', size: 'sm' }, icon('user')), align: 'right',
          items: [
            { label: 'Profile', icon: 'user' },
            { label: 'Settings', icon: 'settings' },
            { separator: true },
            { label: 'Sign out', icon: 'log-out' }
          ]
        })
      )
    ),
    // Command palette
    Command({ visible: cmdOpen, onClose: () => setCmdOpen(false),
      items: nav.map(n => ({ label: n.label, icon: n.icon, onSelect: () => { navigate(n.href); setCmdOpen(false); } }))
    }),
    // Main content
    Shell.Body({ class: css('d-page-enter _flex _col ${contentGap} _p6 _overflow[auto] _flex1') },
      router.outlet()
    )
  );
}`
    };

    case 'top-nav-main': return {
      extraImports: [
        "import { text } from 'decantr/core';",
        "import { link } from 'decantr/router';",
        "import { Button, icon } from 'decantr/components';",
      ].join('\n'),
      appFunction: `function App() {
  const { div, header, main, nav: navEl } = tags;

  const nav = ${navLiteral};

  return div({ class: css('_flex _col _h[100vh]') },
    // Top navigation bar
    header({ class: css('_flex _aic _jcsb _px6 _py3 _borderB _bgbg') },
      link({ href: '/', class: css('_heading5 _nounder _fgfg') }, '${brandLabel}'),
      navEl({ class: css('_flex _aic _gap6') },
        ...nav.map(item =>
          link({ href: item.href, class: css('_fgmuted _nounder _trans') }, item.label)
        )
      ),
      div({ class: css('_flex _aic _gap2') },
        Button({ variant: 'ghost', size: 'sm' }, icon('search')),
        Button({ variant: 'ghost', size: 'sm' }, icon('user'))
      )
    ),
    // Main content
    main({ class: css('_flex _col ${contentGap} _p6 _overflow[auto] _flex1') },
      router.outlet()
    )
  );
}`
    };

    case 'centered': return {
      extraImports: "import { Card } from 'decantr/components';",
      appFunction: `function App() {
  const { div } = tags;

  return div({ class: css('_flex _center _h[100vh] _bgmuted _p4') },
    Card({ class: css('_w[400px] _mw[100%]') },
      router.outlet()
    )
  );
}`
    };

    case 'full-bleed': return {
      extraImports: "import { link } from 'decantr/router';",
      appFunction: `function App() {
  const { div, header, main, nav: navEl } = tags;

  return div({ class: css('_flex _col') },
    // Floating nav (absolute positioned over hero)
    header({ class: css('_fixed _top0 _left0 _wfull _flex _aic _jcsb _px8 _py4 _z[40]') },
      link({ href: '/', class: css('_heading5 _nounder _fgfg') }, 'App'),
      navEl({ class: css('_flex _aic _gap6') })
    ),
    // Content
    main({ class: css('_flex _col') },
      router.outlet()
    )
  );
}`
    };

    case 'minimal-header': return {
      extraImports: [
        "import { link } from 'decantr/router';",
        "import { icon } from 'decantr/components';",
      ].join('\n'),
      appFunction: `function App() {
  const { div, header, main } = tags;

  return div({ class: css('_flex _col _h[100vh]') },
    // Slim header
    header({ class: css('_flex _aic _jcc _py3 _borderB') },
      link({ href: '/', class: css('_flex _aic _gap2 _nounder _fgfg') },
        icon('arrow-left'),
        'App'
      )
    ),
    // Centered main content
    main({ class: css('_flex _col _aic _overflow[auto] _flex1 _py8') },
      div({ class: css('_w[720px] _mw[100%] _px4 _flex _col _gap6') },
        router.outlet()
      )
    )
  );
}`
    };

    default: return {
      extraImports: '',
      appFunction: `function App() {
  const { div } = tags;
  return div({ class: css('_flex _col _h[100vh]') },
    router.outlet()
  );
}`
    };
  }
}

// ─── Recipe skeleton decoration ─────────────────────────────────
// Applies recipe-specific CSS classes to skeleton template strings.
// Each replacement targets comments/class strings produced by buildSkeletonApp().

/** Get recipe-specific decoration classes for Shell skeleton regions.
 *  Data-driven: reads from recipe.skeleton fields instead of hardcoded switch.
 */
function getRecipeDecoration(recipe) {
  if (!recipe?.skeleton) {
    return { root: '', nav: '', header: '', navLabel: '', brand: '', navStyle: '' };
  }
  return {
    root: recipe.skeleton.root || '',
    nav: recipe.skeleton.nav || '',
    header: recipe.skeleton.header || '',
    navLabel: recipe.skeleton.navLabel || '',
    brand: recipe.skeleton.brand || '',
    navStyle: recipe.skeleton.nav_style || '',
  };
}

function applyRecipeToSkeleton(appFunction, recipe, clarity) {
  if (!recipe) return appFunction;
  const d = getRecipeDecoration(recipe);
  let result = appFunction;

  // Root Shell: inject recipe root class
  if (d.root) {
    result = result.replace(
      /Shell\(\{ config: 'sidebar-main', (.+?), class: css\('_h\[100vh\]'\)/,
      `Shell({ config: 'sidebar-main', $1, class: css('_h[100vh] ${d.root}')`
    );
  }

  // Nav: replace _bgmuted with recipe nav decoration
  if (d.nav) {
    result = result.replace(
      /Shell\.Nav\(\{ class: css\('_flex _col (?:_gap\d+) _bgmuted'\)/,
      `Shell.Nav({ class: css('_flex _col ${clarity?.chromeGap || '_gap1'} ${d.nav}')`
    );
  }

  // Brand label: add recipe brand class
  if (d.brand) {
    result = result.replace(
      /span\(\{ class: css\('_heading5'\) \}/,
      `span({ class: css('_heading5 ${d.brand}') }`
    );
  }

  // Nav links: add recipe navLabel class
  if (d.navLabel) {
    result = result.replace(
      /d-shell-nav-item _r2 _trans /g,
      `d-shell-nav-item _r2 _trans ${d.navLabel} `
    );
  }

  // Header: add recipe header class
  if (d.header) {
    result = result.replace(
      /Shell\.Header\(\{ class: css\('_flex _aic _jcsb _px6 _borderB'\)/,
      `Shell.Header({ class: css('_flex _aic _jcsb _px6 _borderB ${d.header}')`
    );
  }

  // Nav style: inject nav style variant class on Shell root
  if (d.navStyle) {
    result = result.replace(
      /d-shell-nav-item _r2 _trans/g,
      `d-shell-nav-item d-shell-nav-style-${d.navStyle} _r2 _trans`
    );
  }

  // Default nav state from recipe
  if (recipe?.skeleton?.default_nav_state) {
    result = result.replace(
      /createSignal\('expanded'\)/,
      `createSignal('${recipe.skeleton.default_nav_state}')`
    );
  }

  // Shell dimensions from recipe
  if (recipe?.skeleton?.dimensions) {
    const dims = JSON.stringify(recipe.skeleton.dimensions);
    result = result.replace(
      /Shell\(\{ config: 'sidebar-main',/,
      `Shell({ config: 'sidebar-main', dimensions: ${dims},`
    );
  }

  return result;
}

// ─── Store generator ────────────────────────────────────────────

function generateStore(essence) {
  const pages = essence.structure || [];
  const signals = pages.map(p => `export const [${toCamelCase(p.id)}Data, set${toPascalCase(p.id)}Data] = createSignal(null);`);

  return `// Generated by decantr generate
// Global state signals for page data.

import { createSignal, createStore } from 'decantr/state';

// ─── Page data signals ──────────────────────────────────────────
${signals.join('\n')}

// ─── App state ──────────────────────────────────────────────────
export const [appState, setAppState] = createStore({
  user: null,
  loading: false,
  sidebarCollapsed: false,
});
`;
}

// ─── Lock file ──────────────────────────────────────────────────

function generateLock(essence) {
  const hash = createHash('md5').update(JSON.stringify(essence)).digest('hex');
  return JSON.stringify({
    essenceHash: hash,
    generatedAt: new Date().toISOString(),
    version: VERSION,
    pages: (essence.structure || []).map(p => p.id),
  }, null, 2);
}

// ─── Not Found page ─────────────────────────────────────────────

function generateNotFound() {
  return `import { tags } from 'decantr/tags';
import { css } from 'decantr/css';
import { Button } from 'decantr/components';
import { navigate } from 'decantr/router';

export default function NotFoundPage() {
  const { div, h1, p } = tags;
  return div({ class: css('_flex _col _center _h[100vh] _gap4') },
    h1({ class: css('_heading1') }, '404'),
    p({ class: css('_fgmuted _body') }, 'Page not found.'),
    Button({ variant: 'primary', onclick: () => navigate('/') }, 'Go Home')
  );
}
`;
}

// ─── Post-generation quality validation ──────────────────────────

async function validateScaffold(generatedPages) {
  const warnings = [];
  const errors = [];

  // Load icon registry for validation
  let iconRegistry;
  try {
    const iconMod = await import(join(__dirname, '..', 'src', 'icons', 'essential.js'));
    iconRegistry = new Set(Object.keys(iconMod.ESSENTIAL));
  } catch {
    iconRegistry = null;
  }

  // Load atom resolver
  let resolveAtomDecl;
  try {
    const atomsMod = await import(join(__dirname, '..', 'src', 'css', 'atoms.js'));
    resolveAtomDecl = atomsMod.resolveAtomDecl;
  } catch {
    resolveAtomDecl = null;
  }

  for (const { pageId, code } of generatedPages) {
    // 1. Card count check
    const cardCount = (code.match(/\bCard\(/g) || []).length;
    if (cardCount > 6) {
      warnings.push(`${pageId}: ${cardCount} Card components — consider reducing nesting`);
    }

    // 2. Nested Card(Card( pattern
    if (/Card\([^)]*Card\(/.test(code)) {
      errors.push(`${pageId}: Nested Card(Card()) detected — remove inner card wrapping`);
    }

    // 3. Icon validation
    if (iconRegistry) {
      const iconCalls = code.matchAll(/icon\(['"]([^'"]+)['"]/g);
      for (const m of iconCalls) {
        if (!iconRegistry.has(m[1])) {
          warnings.push(`${pageId}: Unknown icon "${m[1]}" — check src/icons/essential.js`);
        }
      }
    }

    // 4. Atom validation
    if (resolveAtomDecl) {
      const cssMatches = code.matchAll(/css\(['"`]([^'"`]+)['"`]\)/g);
      for (const cm of cssMatches) {
        const atoms = cm[1].split(/\s+/).filter(a => a.startsWith('_'));
        for (const atom of atoms) {
          if (atom.includes('[') || atom.includes(':')) continue;
          const base = atom.includes('/') ? atom.split('/')[0] : atom;
          if (!resolveAtomDecl(base)) {
            warnings.push(`${pageId}: Unknown atom "${atom}"`);
          }
        }
      }
    }

    // 5. Filter-bar in card check
    if (/Card\([^)]*FilterBar\(/.test(code) || /Card\([^)]*filter-bar/.test(code)) {
      warnings.push(`${pageId}: Filter bar should not be wrapped in a Card`);
    }

    // 6. Glass + glow stacking
    if (/d-glass[^}]*aura-glow|aura-glow[^}]*d-glass/.test(code)) {
      warnings.push(`${pageId}: "d-glass" and "aura-glow" used together — use one elevation effect per element`);
    }

    // 7. Dead signals — setter called but getter never read
    const signalMatches = code.matchAll(/const \[(\w+), (set\w+)\] = createSignal\(/g);
    for (const sm of signalMatches) {
      const getter = sm[1];
      // Count occurrences (first is the declaration)
      const getterCount = (code.match(new RegExp(`\\b${getter}\\b`, 'g')) || []).length;
      if (getterCount <= 1) {
        warnings.push(`${pageId}: Signal "${getter}" is declared but never read — possible dead signal`);
      }
    }
  }

  // Report
  if (warnings.length > 0 || errors.length > 0) {
    console.log('\n  ── Scaffold validation ──');
    for (const e of errors) console.error(`    ✗ ${e}`);
    for (const w of warnings) console.warn(`    ⚠ ${w}`);
    console.log('');
  }

  return { errors, warnings };
}

// ─── Main entry point ───────────────────────────────────────────

export async function generate(options = {}) {
  const { cwd = process.cwd(), force = false, dryRun = false, pageFilter = null } = options;

  // 1. Load essence
  const essencePath = join(cwd, 'decantr.essence.json');
  let essence;
  try {
    essence = JSON.parse(await readFile(essencePath, 'utf-8'));
  } catch (e) {
    throw new Error('Cannot read decantr.essence.json — run the CLARIFY stage first.');
  }

  // Handle sectioned essences
  const isSectioned = Array.isArray(essence.sections);
  const structures = isSectioned
    ? essence.sections.flatMap(s => (s.structure || []).map(p => ({ ...p, _section: s })))
    : (essence.structure || []);

  if (structures.length === 0) {
    throw new Error('Essence has no pages in structure. Add pages first.');
  }

  // 2. Load skeletons
  let skeletons;
  try {
    skeletons = await loadSkeletons();
  } catch {
    skeletons = {};
  }

  // 3. Load recipe if specified
  let recipe = null;
  const recipeId = isSectioned ? null : essence.vintage?.recipe;
  if (recipeId) {
    try {
      recipe = await loadRecipe(recipeId);
    } catch {
      console.warn(`  ⚠ Recipe "${recipeId}" not found, proceeding without recipe overrides.`);
    }
  }

  // 3b. Derive clarity profile from character traits + recipe spatial hints
  const character = isSectioned
    ? (essence.character || essence.sections?.[0]?.character || [])
    : (essence.character || []);
  const clarity = deriveClarityProfile(character, recipe?.spatial_hints);

  // 4. Generate pages
  const pagesToGenerate = pageFilter
    ? structures.filter(p => p.id === pageFilter)
    : structures;

  if (pagesToGenerate.length === 0) {
    throw new Error(`Page "${pageFilter}" not found in essence structure.`);
  }

  const generatedPages = [];
  const files = [];

  // @validate — call validateScaffold(generatedPages) after this loop
  for (const page of pagesToGenerate) {
    const vintage = page._section?.vintage || essence.vintage;
    const result = await generatePage(page, vintage, recipe, clarity);
    generatedPages.push(result);
    files.push({
      path: join('src', 'pages', `${page.id}.js`),
      content: result.full
    });
  }

  // 5. Generate app.js (only on full generation, not --page)
  if (!pageFilter) {
    files.push({
      path: join('src', 'app.js'),
      content: generateAppJs(essence, pagesToGenerate, skeletons, recipe, clarity)
    });

    // 6. Generate store
    files.push({
      path: join('src', 'state', 'store.js'),
      content: generateStore(essence)
    });

    // 7. Generate 404 page
    files.push({
      path: join('src', 'pages', 'not-found.js'),
      content: generateNotFound()
    });

    // 8. Generate lock file
    files.push({
      path: 'decantr.lock.json',
      content: generateLock(essence)
    });

    // 9. Auto-set cork.mode to 'maintenance' after initial generation
    if (!essence.cork?.mode || essence.cork.mode === 'creative') {
      const updatedEssence = { ...essence, cork: { ...(essence.cork || {}), mode: 'maintenance' } };
      files.push({
        path: 'decantr.essence.json',
        content: JSON.stringify(updatedEssence, null, 2) + '\n'
      });
    }
  }

  // 9. Write files
  if (dryRun) {
    console.log('\n  Dry run — files that would be generated:\n');
    for (const f of files) {
      console.log(`    ${f.path} (${f.content.length} bytes)`);
    }
    console.log(`\n  Total: ${files.length} files\n`);
    return { files, dryRun: true };
  }

  let written = 0;
  let skipped = 0;

  for (const f of files) {
    const fullPath = join(cwd, f.path);
    const dir = dirname(fullPath);

    // Check if file exists (skip unless --force)
    if (!force) {
      try {
        await readFile(fullPath, 'utf-8');
        console.log(`    skip ${f.path} (exists, use --force to overwrite)`);
        skipped++;
        continue;
      } catch {
        // File doesn't exist — write it
      }
    }

    await mkdir(dir, { recursive: true });
    await writeFile(fullPath, f.content, 'utf-8');
    console.log(`    write ${f.path}`);
    written++;
  }

  console.log(`\n  ✓ Generated ${written} file${written !== 1 ? 's' : ''}${skipped > 0 ? `, skipped ${skipped} existing` : ''}\n`);

  return { files, written, skipped };
}
