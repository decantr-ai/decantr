import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');
const defaultContentRoot = process.env.DECANTR_CONTENT_DIR
  ? resolve(process.env.DECANTR_CONTENT_DIR)
  : resolve(repoRoot, '..', 'decantr-content');
const showcaseManifestPath = join(repoRoot, 'apps', 'showcase', 'manifest.json');

function parseArgs(argv) {
  const options = {
    blueprint: null,
    contentRoot: defaultContentRoot,
    shortlist: false,
    all: false,
    json: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--shortlist') {
      options.shortlist = true;
    } else if (arg === '--all') {
      options.all = true;
    } else if (arg === '--json') {
      options.json = true;
    } else if (arg.startsWith('--blueprint=')) {
      options.blueprint = arg.slice('--blueprint='.length).trim() || null;
    } else if (arg === '--blueprint' && argv[i + 1]) {
      options.blueprint = argv[i + 1].trim();
      i += 1;
    } else if (arg.startsWith('--content-root=')) {
      options.contentRoot = resolve(arg.slice('--content-root='.length));
    } else if (arg === '--content-root' && argv[i + 1]) {
      options.contentRoot = resolve(argv[i + 1]);
      i += 1;
    }
  }

  return options;
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf-8'));
}

function fileFor(contentRoot, type, id) {
  return join(contentRoot, type, `${id}.json`);
}

function loadOptionalJson(contentRoot, type, id) {
  const path = fileFor(contentRoot, type, id);
  if (!existsSync(path)) return null;
  return readJson(path);
}

function extractPatternIdsFromLayoutItem(item, aliasMap = new Map()) {
  if (typeof item === 'string' && item.trim().length > 0) {
    const aliasTarget = aliasMap.get(item);
    return aliasTarget ? [aliasTarget] : [item];
  }
  if (!item || typeof item !== 'object') return [];
  if (typeof item.pattern === 'string' && item.pattern.trim().length > 0) return [item.pattern];
  if (Array.isArray(item.cols)) {
    return item.cols.flatMap((child) => extractPatternIdsFromLayoutItem(child, aliasMap));
  }
  return [];
}

function collectArchetypePatternIds(archetype) {
  const patternIds = new Set();
  for (const page of archetype.pages ?? []) {
    const aliasMap = new Map();
    const fromPatterns = Array.isArray(page.patterns)
      ? page.patterns.flatMap((item) => {
          if (item && typeof item === 'object' && typeof item.pattern === 'string' && typeof item.as === 'string') {
            aliasMap.set(item.as, item.pattern);
          }
          return extractPatternIdsFromLayoutItem(item, aliasMap);
        })
      : [];
    const fromLayout = Array.isArray(page.default_layout)
      ? page.default_layout.flatMap((item) => extractPatternIdsFromLayoutItem(item, aliasMap))
      : [];
    for (const patternId of [...fromPatterns, ...fromLayout]) {
      if (patternId) patternIds.add(patternId);
    }
  }
  return [...patternIds];
}

function compactRouteMap(blueprint) {
  return Object.entries(blueprint.routes ?? {}).map(([path, route]) => ({
    path,
    page: route.page,
    archetype: route.archetype,
    shell: route.shell,
  }));
}

function addFinding(findings, severity, area, message, evidence = {}) {
  findings.push({ severity, area, message, evidence });
}

function shellReviewEntries(routes, archetypes) {
  const byShell = new Map();
  for (const route of routes) {
    const archetype = archetypes.get(route.archetype);
    const role = archetype?.role ?? null;
    const entry = byShell.get(route.shell) ?? { shell: route.shell, routes: [], archetypes: new Set(), roles: new Set() };
    entry.routes.push({ path: route.path, page: route.page, archetype: route.archetype, role });
    entry.archetypes.add(route.archetype);
    if (role) entry.roles.add(role);
    byShell.set(route.shell, entry);
  }

  return [...byShell.values()].map((entry) => ({
    shell: entry.shell,
    archetypeCount: entry.archetypes.size,
    roles: [...entry.roles],
    routes: entry.routes,
  }));
}

function manualChecklist(shellSpread) {
  const lines = [
    '1. Route map matches blueprint intent and every route resolves to an existing archetype page.',
    '2. Every archetype page used by the blueprint has a page brief with clear visual and interaction intent.',
    '3. Every active route pattern has enough scaffold-critical guidance: visual brief, responsive notes, and at least one of accessibility, motion, or layout hints.',
    '4. Theme defines a non-empty decorator surface and the decorator names feel semantically aligned with the blueprint personality.',
    '5. Shells used by the blueprint expose enough internal layout guidance that page components do not need to re-solve centering, padding, or scroll ownership.',
    '6. Navigation intent is concrete: command palette and hotkeys are enumerated strongly enough that a model can implement them instead of merely acknowledging them.',
    '7. Public/app/gateway shell reuse is intentional. If one shell spans multiple roles or archetypes, verify its rhythm still fits without page-local overrides.',
  ];

  if (shellSpread.some((entry) => entry.archetypeCount > 1 || entry.roles.length > 1)) {
    lines.push('8. Review multi-context shell reuse carefully: some shells serve multiple archetypes or roles in this blueprint and may need richer guidance.');
  }

  return lines;
}

function auditBlueprint(contentRoot, blueprintId) {
  const findings = [];
  const blueprintPath = fileFor(contentRoot, 'blueprints', blueprintId);
  if (!existsSync(blueprintPath)) {
    throw new Error(`Blueprint not found: ${blueprintPath}`);
  }

  const blueprint = readJson(blueprintPath);
  const routes = compactRouteMap(blueprint);
  const composeEntries = Array.isArray(blueprint.compose) ? blueprint.compose : [];
  const composeArchetypeIds = composeEntries.map((entry) => (typeof entry === 'string' ? entry : entry.archetype)).filter(Boolean);
  const composedArchetypeIdSet = new Set(composeArchetypeIds);
  const declaredArchetypeIds = Object.keys(blueprint.dependencies?.archetypes ?? {});
  const archetypeIds = [...new Set([...composeArchetypeIds, ...declaredArchetypeIds])];
  const archetypes = new Map();
  const shellIds = new Set();
  const patternIds = new Set();

  if (!blueprint.voice) {
    addFinding(findings, 'warn', 'blueprint', 'Blueprint is missing voice guidance.');
  }
  if (!blueprint.navigation?.command_palette) {
    addFinding(findings, 'info', 'blueprint', 'Blueprint does not enable a command palette.', {
      blueprintId,
    });
  }
  if (!Array.isArray(blueprint.navigation?.hotkeys) || blueprint.navigation.hotkeys.length === 0) {
    addFinding(findings, 'warn', 'blueprint', 'Blueprint has no declared hotkeys.');
  }
  if (!Array.isArray(blueprint.suggested_themes) || blueprint.suggested_themes.length === 0) {
    addFinding(findings, 'info', 'blueprint', 'Blueprint does not declare suggested themes.');
  }

  for (const archetypeId of archetypeIds) {
    const archetype = loadOptionalJson(contentRoot, 'archetypes', archetypeId);
    if (!archetype) {
      addFinding(findings, 'error', 'archetype', `Missing archetype "${archetypeId}" referenced by blueprint.`);
      continue;
    }
    archetypes.set(archetypeId, archetype);

    if (!archetype.page_briefs || typeof archetype.page_briefs !== 'object') {
      addFinding(findings, 'warn', 'archetype', `Archetype "${archetypeId}" has no page_briefs.`, { archetypeId });
    }
    if (!archetype.suggested_theme?.ids?.length) {
      addFinding(findings, 'info', 'archetype', `Archetype "${archetypeId}" has no suggested_theme.ids.`, { archetypeId });
    }

    const pageIds = new Set((archetype.pages ?? []).map((page) => page.id));
    const routedPagesForArchetype = new Set(routes.filter((entry) => entry.archetype === archetypeId).map((entry) => entry.page));
    for (const route of routes.filter((entry) => entry.archetype === archetypeId)) {
      if (!pageIds.has(route.page)) {
        addFinding(
          findings,
          'error',
          'route',
          `Route "${route.path}" points to missing page "${route.page}" in archetype "${archetypeId}".`,
          route,
        );
        continue;
      }
      const matchingPage = archetype.pages.find((page) => page.id === route.page);
      if (matchingPage?.shell && matchingPage.shell !== 'inherit' && route.shell && matchingPage.shell !== route.shell) {
        addFinding(
          findings,
          'warn',
          'route',
          `Route "${route.path}" uses shell "${route.shell}" but archetype page "${route.page}" declares "${matchingPage.shell}".`,
          route,
        );
      }
      if (!archetype.page_briefs?.[route.page]) {
        addFinding(findings, 'warn', 'archetype', `Archetype "${archetypeId}" is missing a page brief for "${route.page}".`, route);
      }
      if (route.shell && route.shell !== 'inherit') shellIds.add(route.shell);
    }

    if (routes.length > 0 && composedArchetypeIdSet.has(archetypeId)) {
      for (const page of archetype.pages ?? []) {
        if (routedPagesForArchetype.has(page.id)) continue;
        if (page.route) {
          addFinding(
            findings,
            'info',
            'route',
            `Archetype "${archetypeId}" page "${page.id}" relies on its local page.route instead of an explicit blueprint route entry.`,
            { archetypeId, pageId: page.id, pageRoute: page.route },
          );
        } else {
          addFinding(
            findings,
            'warn',
            'route',
            `Archetype "${archetypeId}" page "${page.id}" is composed into the blueprint but has no published route.`,
            { archetypeId, pageId: page.id },
          );
        }
      }
    }

    for (const patternId of collectArchetypePatternIds(archetype)) {
      patternIds.add(patternId);
    }

    for (const page of archetype.pages ?? []) {
      if (page.shell && page.shell !== 'inherit') shellIds.add(page.shell);
    }
  }

  const patternReports = [];
  for (const patternId of [...patternIds].sort()) {
    const pattern = loadOptionalJson(contentRoot, 'patterns', patternId);
    if (!pattern) {
      addFinding(findings, 'error', 'pattern', `Missing pattern "${patternId}" referenced by the blueprint chain.`, { patternId });
      continue;
    }

    const report = {
      id: patternId,
      visualBrief: Boolean(pattern.visual_brief),
      layoutHints: Boolean(pattern.layout_hints),
      motion: Boolean(pattern.motion),
      responsive: Boolean(pattern.responsive),
      accessibility: Boolean(pattern.accessibility),
    };
    patternReports.push(report);

    if (!report.visualBrief) {
      addFinding(findings, 'warn', 'pattern', `Pattern "${patternId}" is missing a visual_brief.`, report);
    }
    if (!report.responsive) {
      addFinding(findings, 'warn', 'pattern', `Pattern "${patternId}" is missing responsive guidance.`, report);
    }
    if (!report.accessibility) {
      addFinding(findings, 'info', 'pattern', `Pattern "${patternId}" is missing accessibility guidance.`, report);
    }
    if (!report.motion) {
      addFinding(findings, 'info', 'pattern', `Pattern "${patternId}" is missing motion guidance.`, report);
    }
    if (!report.layoutHints) {
      addFinding(findings, 'info', 'pattern', `Pattern "${patternId}" is missing layout_hints.`, report);
    }
  }

  const shellReports = [];
  for (const shellId of [...shellIds].sort()) {
    const shell = loadOptionalJson(contentRoot, 'shells', shellId);
    if (!shell) {
      addFinding(findings, 'error', 'shell', `Missing shell "${shellId}" referenced by the blueprint chain.`, { shellId });
      continue;
    }

    const report = {
      id: shellId,
      hasInternalLayout: Boolean(shell.internal_layout),
      hasGuidance: Boolean(shell.guidance),
      hasCodeExample: Boolean(shell.code?.example),
      usesPseudoRuntimeExample: typeof shell.code?.imports === 'string'
        && /decantr\/tags|createSignal|decantr\/core|decantr\/state/.test(shell.code.imports),
      hasShellSpacingGuidance: Boolean(shell.guidance?.shell_spacing),
    };
    shellReports.push(report);

    if (!report.hasInternalLayout) {
      addFinding(findings, 'error', 'shell', `Shell "${shellId}" is missing internal_layout guidance.`, report);
    }
    if (!report.hasGuidance) {
      addFinding(findings, 'warn', 'shell', `Shell "${shellId}" is missing guidance notes.`, report);
    }
    if (!report.hasShellSpacingGuidance) {
      addFinding(findings, 'info', 'shell', `Shell "${shellId}" does not declare shell_spacing guidance.`, report);
    }
    if (report.usesPseudoRuntimeExample) {
      addFinding(findings, 'warn', 'shell', `Shell "${shellId}" still uses pseudo-Decantr runtime code examples rather than target-specific examples.`, report);
    }
  }

  const themeId = blueprint.theme?.id ?? null;
  const theme = themeId ? loadOptionalJson(contentRoot, 'themes', themeId) : null;
  const themeReport = {
    id: themeId,
    exists: Boolean(theme),
    decoratorCount: theme?.decorators ? Object.keys(theme.decorators).length : 0,
    hasDecoratorDefinitions: Boolean(theme?.decorator_definitions && Object.keys(theme.decorator_definitions).length > 0),
    hasMotion: Boolean(theme?.motion),
    hasTreatments: Boolean(theme?.treatments),
  };

  if (!theme) {
    addFinding(findings, 'error', 'theme', `Blueprint theme "${themeId}" is missing from content.`, themeReport);
  } else {
    if (themeReport.decoratorCount === 0) {
      addFinding(findings, 'warn', 'theme', `Theme "${themeId}" has no decorator definitions.`, themeReport);
    } else if (!themeReport.hasDecoratorDefinitions) {
      addFinding(findings, 'info', 'theme', `Theme "${themeId}" provides decorator names/descriptions only; canonical CSS must come from compiler/runtime.`, themeReport);
    }
    if (!themeReport.hasMotion) {
      addFinding(findings, 'info', 'theme', `Theme "${themeId}" has no motion guidance.`, themeReport);
    }
  }

  const shellSpread = shellReviewEntries(routes, archetypes);
  const summary = {
    blueprint: blueprintId,
    routeCount: routes.length,
    archetypeCount: archetypes.size,
    patternCount: patternReports.length,
    shellCount: shellReports.length,
    theme: themeId,
    findings: {
      error: findings.filter((finding) => finding.severity === 'error').length,
      warn: findings.filter((finding) => finding.severity === 'warn').length,
      info: findings.filter((finding) => finding.severity === 'info').length,
    },
  };

  return {
    summary,
    blueprint: {
      id: blueprint.id,
      theme: blueprint.theme,
      navigation: blueprint.navigation ?? null,
      features: blueprint.features ?? [],
      routes,
    },
    archetypes: [...archetypes.values()].map((archetype) => ({
      id: archetype.id,
      role: archetype.role,
      featureCount: Array.isArray(archetype.features) ? archetype.features.length : 0,
      pageCount: Array.isArray(archetype.pages) ? archetype.pages.length : 0,
      hasPageBriefs: Boolean(archetype.page_briefs),
    })),
    patterns: patternReports,
    shells: shellReports,
    theme: themeReport,
    shellSpread,
    checklist: manualChecklist(shellSpread),
    findings,
  };
}

function loadShortlistBlueprintIds(contentRoot) {
  const manifest = readJson(showcaseManifestPath);
  return manifest.apps
    .filter((entry) => entry.status === 'active' && entry.goldenCandidate === 'shortlist')
    .map((entry) => entry.slug)
    .filter((slug) => existsSync(fileFor(contentRoot, 'blueprints', slug)));
}

function loadAllBlueprintIds(contentRoot) {
  return readdirSync(join(contentRoot, 'blueprints'))
    .filter((name) => name.endsWith('.json'))
    .map((name) => name.replace(/\.json$/, ''))
    .filter((id) => !id.startsWith('recipefork'))
    .sort();
}

function summarizeReports(reports) {
  return reports.reduce((summary, report) => {
    summary.blueprints += 1;
    summary.error += report.summary.findings.error;
    summary.warn += report.summary.findings.warn;
    summary.info += report.summary.findings.info;
    return summary;
  }, { blueprints: 0, error: 0, warn: 0, info: 0 });
}

function renderTextReport(report) {
  const lines = [
    '# Blueprint Content Contract Audit',
    '',
    `- Blueprint: ${report.summary.blueprint}`,
    `- Theme: ${report.summary.theme ?? 'none'}`,
    `- Routes: ${report.summary.routeCount}`,
    `- Archetypes: ${report.summary.archetypeCount}`,
    `- Patterns: ${report.summary.patternCount}`,
    `- Shells: ${report.summary.shellCount}`,
    `- Findings: ${report.summary.findings.error} error, ${report.summary.findings.warn} warn, ${report.summary.findings.info} info`,
    '',
    '## Findings',
  ];

  if (report.findings.length === 0) {
    lines.push('- No findings.');
  } else {
    for (const finding of report.findings) {
      lines.push(`- [${finding.severity}] ${finding.area}: ${finding.message}`);
    }
  }

  lines.push('', '## Shell Review');
  for (const shell of report.shellSpread) {
    lines.push(`- ${shell.shell}: ${shell.routes.length} routes, ${shell.archetypeCount} archetype(s), roles=${shell.roles.length > 0 ? shell.roles.join(', ') : 'none'}`);
  }

  lines.push('', '## Checklist');
  for (const item of report.checklist) {
    lines.push(`- ${item}`);
  }

  return `${lines.join('\n')}\n`;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  if (!existsSync(options.contentRoot)) {
    throw new Error(`Missing content root: ${options.contentRoot}`);
  }

  const blueprintIds = options.shortlist
    ? loadShortlistBlueprintIds(options.contentRoot)
    : options.all
      ? loadAllBlueprintIds(options.contentRoot)
    : options.blueprint
      ? [options.blueprint]
      : [];

  if (blueprintIds.length === 0) {
    throw new Error('Usage: node scripts/audit-content-contract-quality.mjs --blueprint=<id> [--json], --shortlist [--json], or --all [--json]');
  }

  const reports = blueprintIds.map((blueprintId) => auditBlueprint(options.contentRoot, blueprintId));
  if (options.json) {
    console.log(JSON.stringify({ generatedAt: new Date().toISOString(), summary: summarizeReports(reports), reports }, null, 2));
    return;
  }

  if (options.all) {
    const summary = summarizeReports(reports);
    process.stdout.write(`# Blueprint Content Contract Audit Summary\n\n`);
    process.stdout.write(`- Blueprints: ${summary.blueprints}\n`);
    process.stdout.write(`- Findings: ${summary.error} error, ${summary.warn} warn, ${summary.info} info\n\n`);
  }

  for (const [index, report] of reports.entries()) {
    if (index > 0) process.stdout.write('\n');
    process.stdout.write(renderTextReport(report));
  }
}

main();
