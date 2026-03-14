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
 *    c. Apply recipe_overrides if vintage has a recipe
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

async function loadPattern(id) {
  return loadJSON(join(registryRoot, 'patterns', `${id}.json`));
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

function blendItemToCode(item, nameMap, indent = '    ') {
  if (typeof item === 'string') {
    // Full-width pattern
    const fn = nameMap.get(item) || toPascalCase(item);
    return `${indent}// @pattern: ${item}\n${indent}${fn}()`;
  }

  if (item.cols) {
    const colCount = item.cols.length;
    const hasSpan = item.span && Object.keys(item.span).length > 0;

    if (hasSpan) {
      // Weighted grid
      const totalSpan = item.cols.reduce((sum, c) => sum + (item.span?.[c] || 1), 0);
      const children = item.cols.map(c => {
        const span = item.span?.[c] || 1;
        const fn = nameMap.get(c) || toPascalCase(c);
        return `${indent}  div({ class: css('_span${span}') },\n${indent}    // @pattern: ${c}\n${indent}    ${fn}()\n${indent}  )`;
      }).join(',\n');
      return `${indent}div({ class: css('_grid _gc${totalSpan} _gap4') },\n${children}\n${indent})`;
    } else {
      // Equal-width grid
      const children = item.cols.map(c => {
        const fn = nameMap.get(c) || toPascalCase(c);
        return `${indent}  // @pattern: ${c}\n${indent}  ${fn}()`;
      }).join(',\n');
      return `${indent}div({ class: css('_grid _gc${colCount} _gap4') },\n${children}\n${indent})`;
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

// ─── Page generator ─────────────────────────────────────────────

async function generatePage(page, vintage, recipe) {
  const patternIds = extractPatternIds(page.blend || []);
  const patterns = new Map();
  let pageImports = parseImports("import { tags } from 'decantr/tags';\nimport { css } from 'decantr/css';");

  // Load all patterns referenced in blend
  for (const id of patternIds) {
    try {
      const pattern = await loadPattern(id);
      patterns.set(id, pattern);
      if (pattern.code?.imports) {
        pageImports = mergeImports(pageImports, parseImports(pattern.code.imports));
      }
    } catch {
      // Pattern not found — generate placeholder
      patterns.set(id, { id, code: null });
    }
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

  // Generate pattern functions
  const patternFunctions = [];
  for (const [id, pattern] of patterns) {
    const fnName = nameMap.get(id) || toPascalCase(id);
    if (pattern.code?.example) {
      patternFunctions.push(`// @pattern: ${id}\n${pattern.code.example}`);
    } else {
      // Fallback placeholder
      const atoms = pattern.default_blend?.atoms || '_flex _col _gap4 _p4';
      patternFunctions.push(
        `// @pattern: ${id}\nfunction ${fnName}() {\n  const { div, h3 } = tags;\n  return div({ class: css('${atoms}') },\n    h3({ class: css('_heading4') }, '${toPascalCase(id)}')\n  );\n}`
      );
    }
  }

  // Generate page function body from blend
  const blendCode = (page.blend || []).map(item =>
    blendItemToCode(item, nameMap)
  ).join(',\n');

  const surface = page.surface || '_flex _col _gap4 _p4 _overflow[auto] _flex1';
  const pageName = toPascalCase(page.id) + 'Page';

  const pageFunction = `export default function ${pageName}() {
  const { div } = tags;
  return div({ class: css('${surface}') },
${blendCode}
  );
}`;

  return {
    name: pageName,
    id: page.id,
    imports: renderImports(pageImports),
    patternFunctions: patternFunctions.join('\n\n'),
    pageFunction,
    full: `${renderImports(pageImports)}\n\n${patternFunctions.join('\n\n')}\n\n${pageFunction}\n`
  };
}

function extractPatternIds(blend) {
  const ids = new Set();
  for (const item of blend) {
    if (typeof item === 'string') {
      ids.add(item);
    } else if (item.cols) {
      for (const col of item.cols) ids.add(col);
    }
  }
  return ids;
}

// ─── Nav icon map ────────────────────────────────────────────────

const NAV_ICONS = {
  overview: 'layout-dashboard', home: 'home', analytics: 'bar-chart',
  users: 'user', settings: 'settings', billing: 'file',
  notifications: 'bell', pipeline: 'activity', goals: 'target',
  search: 'search', reports: 'bar-chart', products: 'file',
  orders: 'file', dashboard: 'layout-dashboard', profile: 'user',
};

// ─── App.js generator ───────────────────────────────────────────

function generateAppJs(essence, pages, skeletonCode) {
  const style = essence.vintage?.style || 'auradecantism';
  const mode = essence.vintage?.mode || 'dark';
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

  // Build nav array — exclude centered-skeleton pages (auth flows)
  const nav = structures
    .filter(p => p.skeleton !== 'centered')
    .map(p => ({ href: routePath(p.id), icon: NAV_ICONS[p.id] || 'file', label: toPascalCase(p.id) }));

  // Build skeleton-specific App function and extra imports
  const { appFunction, extraImports } = buildSkeletonApp(skeletonId, nav);

  // Merge imports
  const baseImports = parseImports([
    "import { tags } from 'decantr/tags';",
    "import { mount } from 'decantr/core';",
    "import { createRouter } from 'decantr/router';",
    "import { css, setStyle, setMode } from 'decantr/css';",
  ].join('\n'));

  const skelImports = parseImports(extraImports);
  const allImports = mergeImports(baseImports, skelImports);

  return `// Generated by decantr generate — ${new Date().toISOString().split('T')[0]}
// Modify freely — this is a starting point, not a final product.

${renderImports(allImports)}

// ─── Style initialization ───────────────────────────────────────
setStyle('${style}');
setMode('${mode}');

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

function buildSkeletonApp(skeletonId, nav) {
  const navLiteral = `[\n${nav.map(n => `    { href: '${n.href}', icon: '${n.icon}', label: '${n.label}' }`).join(',\n')}\n  ]`;

  switch (skeletonId) {
    case 'sidebar-main': return {
      extraImports: [
        "import { text, cond } from 'decantr/core';",
        "import { createSignal } from 'decantr/state';",
        "import { link, useRoute } from 'decantr/router';",
        "import { Button, icon } from 'decantr/components';",
      ].join('\n'),
      appFunction: `function App() {
  const { div, aside, main, header, span } = tags;
  const [collapsed, setCollapsed] = createSignal(false);
  const route = useRoute();

  const nav = ${navLiteral};

  const pageTitle = () => {
    const path = route().path;
    const item = nav.find(n => n.href === path);
    return item ? item.label : 'App';
  };

  return div({ class: css('_grid _h[100vh]'), style: () => \`grid-template-columns:\${collapsed() ? '64px' : '240px'} 1fr;grid-template-rows:auto 1fr\` },
    // Sidebar
    aside({ class: css('_flex _col _gap1 _p3 _bgmuted _overflow[auto] _borderR'), style: 'grid-row:1/3' },
      div({ class: css('_flex _aic _jcsb _mb4') },
        cond(() => !collapsed(), () => span({ class: css('_heading5') }, 'App')),
        Button({ variant: 'ghost', size: 'sm', onclick: () => setCollapsed(!collapsed()) },
          icon('panel-left')
        )
      ),
      ...nav.map(item =>
        link({ href: item.href, class: css('_flex _aic _gap2 _p2 _px3 _r2 _trans _fgfg') },
          icon(item.icon),
          cond(() => !collapsed(), () => text(item.label))
        )
      )
    ),
    // Header
    header({ class: css('_flex _aic _jcsb _px6 _py3 _borderB') },
      span({ class: css('_heading4') }, pageTitle),
      div({ class: css('_flex _aic _gap2') })
    ),
    // Main content
    main({ class: css('_flex _col _gap4 _p6 _overflow[auto] _flex1') },
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
      link({ href: '/', class: css('_heading5 _nounder _fgfg') }, 'App'),
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
    main({ class: css('_flex _col _gap4 _p6 _overflow[auto] _flex1') },
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
    version: '0.4.0',
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

  // 4. Generate pages
  const pagesToGenerate = pageFilter
    ? structures.filter(p => p.id === pageFilter)
    : structures;

  if (pagesToGenerate.length === 0) {
    throw new Error(`Page "${pageFilter}" not found in essence structure.`);
  }

  const generatedPages = [];
  const files = [];

  for (const page of pagesToGenerate) {
    const vintage = page._section?.vintage || essence.vintage;
    const result = await generatePage(page, vintage, recipe);
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
      content: generateAppJs(essence, pagesToGenerate, skeletons)
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
