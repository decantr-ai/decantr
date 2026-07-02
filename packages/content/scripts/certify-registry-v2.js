#!/usr/bin/env node

/**
 * Certifies the official registry catalog against the Decantr V2 product
 * boundary. This intentionally does not depend on an npm-published V2 CLI:
 * before package publishing, the content repo still needs a local gate that can
 * prove active blueprints compile to Essence v4-shaped contracts.
 */

import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';
import {
  CONTENT_DIRECTORIES,
  isIgnoredLocalContentFile,
} from './content-contract.js';

const ESSENCE_VERSION = '4.0.0';
const ACTIVE_DECANTR_COMPAT = '>=2.0.0';
const SEMVER_RE = /^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/;
const ROUTE_RE = /^\//;
const LAYOUT_BREAKPOINTS = new Set(['sm', 'md', 'lg', 'xl', '2xl']);
const ALLOWED_MODES = new Set(['light', 'dark', 'auto']);
const ALLOWED_SHAPES = new Set(['sharp', 'rounded', 'pill']);
const VALID_ROLES = new Set(['primary', 'gateway', 'public', 'auxiliary']);

const args = process.argv.slice(2);
const reportPath = readArgValue('--report-json');
const summaryPath = readArgValue('--summary-markdown');
const root = process.cwd();
const startedAt = new Date().toISOString();
const findings = [];

function readArgValue(name) {
  const prefix = `${name}=`;
  return args.find(arg => arg.startsWith(prefix))?.slice(prefix.length) || null;
}

function ensureParentDir(path) {
  mkdirSync(dirname(path), { recursive: true });
}

function loadJson(path) {
  return JSON.parse(readFileSync(join(root, path), 'utf8'));
}

function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function asArray(value) {
  if (Array.isArray(value)) return value.filter(item => typeof item === 'string' && item.trim().length > 0);
  if (typeof value === 'string' && value.trim().length > 0) return [value];
  return [];
}

function uniq(values) {
  return [...new Set(values.filter(value => typeof value === 'string' && value.trim().length > 0))];
}

function serializeConstraintValue(value) {
  if (value === undefined || value === null) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function sanitizeDesignConstraints(designConstraints) {
  if (!isRecord(designConstraints)) return null;

  const constraints = {};
  const effects = {};

  for (const [key, value] of Object.entries(designConstraints)) {
    if (key === 'effects' && isRecord(value)) {
      for (const [effectKey, effectValue] of Object.entries(value)) {
        const serialized = serializeConstraintValue(effectValue);
        if (serialized) effects[effectKey] = serialized;
      }
      continue;
    }

    const serialized = serializeConstraintValue(value);
    if (!serialized) continue;

    if (key === 'mode' && typeof value === 'string') constraints.mode = value;
    else if (key === 'typography' && typeof value === 'string') constraints.typography = value;
    else if (key === 'borders' && typeof value === 'string') constraints.borders = value;
    else if (key === 'corners' && typeof value === 'string') constraints.corners = value;
    else if (key === 'shadows' && typeof value === 'string') constraints.shadows = value;
    else effects[key] = serialized;
  }

  if (Object.keys(effects).length > 0) constraints.effects = effects;

  return Object.keys(constraints).length > 0 ? constraints : null;
}

function addFinding(severity, file, message, evidence = []) {
  findings.push({ severity, file, message, evidence });
}

function listContent(dir) {
  const items = new Map();
  const ignored = [];

  for (const file of readdirSync(join(root, dir)).filter(name => name.endsWith('.json')).sort()) {
    if (isIgnoredLocalContentFile(file)) {
      ignored.push(`${dir}/${file}`);
      continue;
    }

    const path = `${dir}/${file}`;
    try {
      const item = loadJson(path);
      const id = item.id || item.slug;
      if (typeof id !== 'string' || id.trim().length === 0) {
        addFinding('error', path, 'Active registry item is missing id/slug.');
        continue;
      }
      items.set(id, { file, path, item });
    } catch (error) {
      addFinding('error', path, `Invalid JSON: ${error.message}`);
    }
  }

  return { items, ignored };
}

function validateCatalogMetadata(collections) {
  for (const dir of CONTENT_DIRECTORIES) {
    for (const { path, item } of collections[dir].items.values()) {
      if (typeof item.version !== 'string' || !SEMVER_RE.test(item.version)) {
        addFinding('error', path, 'Active registry item must declare a semver content version.');
      }

      if (item.decantr_compat !== ACTIVE_DECANTR_COMPAT) {
        addFinding(
          'error',
          path,
          `Active registry item must declare decantr_compat "${ACTIVE_DECANTR_COMPAT}".`,
          [`Actual: ${item.decantr_compat ?? '(missing)'}`],
        );
      }
    }
  }
}

function normalizeTheme(themeRef, themeCatalog) {
  const themeId = isRecord(themeRef) && typeof themeRef.id === 'string' ? themeRef.id : 'clean';
  const theme = themeCatalog.get(themeId)?.item;
  const mode = isRecord(themeRef) && ALLOWED_MODES.has(themeRef.mode) ? themeRef.mode : 'light';
  const shape = isRecord(themeRef) && ALLOWED_SHAPES.has(themeRef.shape) ? themeRef.shape : 'rounded';

  return {
    theme: {
      id: themeId,
      mode,
      shape,
    },
    color: {
      palette: themeId,
      accent_count: theme?.seed ? Object.keys(theme.seed).length : 1,
      cvd_preference: 'safe',
    },
    radius: {
      philosophy: typeof theme?.radius?.philosophy === 'string' ? theme.radius.philosophy : shape,
      base: typeof theme?.radius?.base === 'number' ? theme.radius.base : 8,
    },
    motion: {
      preference: typeof theme?.motion?.preference === 'string' ? theme.motion.preference : 'standard',
      duration_scale: typeof theme?.motion?.duration_scale === 'number' ? theme.motion.duration_scale : 1,
      reduce_motion: false,
    },
  };
}

function normalizePatternRef(value) {
  if (typeof value === 'string') return value;
  if (!isRecord(value) || typeof value.pattern !== 'string') return value;

  const normalized = { pattern: value.pattern };
  if (typeof value.preset === 'string') normalized.preset = value.preset;
  if (typeof value.as === 'string') normalized.as = value.as;
  return normalized;
}

function normalizeLayoutItem(value) {
  if (typeof value === 'string') return value;
  if (!isRecord(value)) return value;

  if (typeof value.pattern === 'string') {
    return normalizePatternRef(value);
  }

  if (Array.isArray(value.cols)) {
    const normalized = {
      cols: value.cols.map(normalizePatternRef),
    };
    if (typeof value.at === 'string' && LAYOUT_BREAKPOINTS.has(value.at)) normalized.at = value.at;
    if (isRecord(value.span)) normalized.span = value.span;
    if (Array.isArray(value.breakpoints)) normalized.breakpoints = value.breakpoints;
    if (value.responsive === 'viewport' || value.responsive === 'container') normalized.responsive = value.responsive;
    return normalized;
  }

  return value;
}

function sanitizeSeoHints(value) {
  if (!isRecord(value)) return undefined;
  const seo = {};
  if (Array.isArray(value.schema_org)) seo.schema_org = asArray(value.schema_org);
  if (Array.isArray(value.meta_priorities)) seo.meta_priorities = asArray(value.meta_priorities);
  return Object.keys(seo).length > 0 ? seo : undefined;
}

function sanitizeCommandPalette(value) {
  if (typeof value === 'boolean') return value;
  if (!isRecord(value)) return undefined;

  const palette = {};
  for (const key of ['trigger', 'placeholder', 'width', 'styling']) {
    if (typeof value[key] === 'string') palette[key] = value[key];
  }
  if (Array.isArray(value.commands)) {
    palette.commands = value.commands
      .filter(command => isRecord(command) && typeof command.id === 'string' && typeof command.label === 'string')
      .map(command => {
        const normalized = { id: command.id, label: command.label };
        for (const key of ['section', 'hotkey', 'action', 'route']) {
          if (typeof command[key] === 'string') normalized[key] = command[key];
        }
        return normalized;
      });
  }
  return Object.keys(palette).length > 0 ? palette : undefined;
}

function sanitizeHotkeySemantics(value) {
  if (!isRecord(value)) return undefined;
  const semantics = {};
  if (Number.isInteger(value.chord_window_ms)) semantics.chord_window_ms = value.chord_window_ms;
  for (const key of ['input_guard', 'modifier_suppression', 'match_case', 'show_chord_indicator']) {
    if (typeof value[key] === 'boolean') semantics[key] = value[key];
  }
  return Object.keys(semantics).length > 0 ? semantics : undefined;
}

function sanitizeNavigation(value) {
  if (!isRecord(value)) return undefined;
  const navigation = {};

  const commandPalette = sanitizeCommandPalette(value.command_palette);
  if (commandPalette !== undefined) navigation.command_palette = commandPalette;

  const semantics = sanitizeHotkeySemantics(value.hotkey_semantics);
  if (semantics) navigation.hotkey_semantics = semantics;

  if (Array.isArray(value.hotkeys)) {
    const hotkeys = value.hotkeys
      .filter(hotkey => isRecord(hotkey) && typeof hotkey.key === 'string' && typeof hotkey.label === 'string')
      .map(hotkey => {
        const normalized = { key: hotkey.key, label: hotkey.label };
        if (typeof hotkey.route === 'string') normalized.route = hotkey.route;
        if (typeof hotkey.action === 'string') normalized.action = hotkey.action;
        const perKeySemantics = sanitizeHotkeySemantics(hotkey.semantics);
        if (perKeySemantics) normalized.semantics = perKeySemantics;
        return normalized;
      });
    if (hotkeys.length > 0) navigation.hotkeys = hotkeys;
  }

  return Object.keys(navigation).length > 0 ? navigation : undefined;
}

function buildEssenceForBlueprint(blueprintRecord, collections) {
  const blueprint = blueprintRecord.item;
  const blueprintPath = blueprintRecord.path;
  const archetypes = collections.archetypes.items;
  const themes = collections.themes.items;
  const shellCatalog = collections.shells.items;
  const composeEntries = Array.isArray(blueprint.compose)
    ? blueprint.compose
    : typeof blueprint.archetype === 'string'
      ? [blueprint.archetype]
      : [];
  const sections = [];
  const sectionIdByArchetype = new Map();
  const features = [];

  if (composeEntries.length === 0) {
    addFinding('error', blueprintPath, 'Blueprint must compose at least one archetype for V2 certification.');
  }

  for (const entry of composeEntries) {
    const archetypeId = typeof entry === 'string' ? entry : entry?.archetype;
    const sectionId = typeof entry === 'object' && typeof entry.prefix === 'string' ? entry.prefix : archetypeId;
    const archetypeRecord = archetypes.get(archetypeId);

    if (!archetypeRecord) {
      addFinding('error', blueprintPath, `Blueprint composes missing archetype "${archetypeId}".`);
      continue;
    }

    const archetype = archetypeRecord.item;
    const role = typeof entry === 'object' && VALID_ROLES.has(entry.role) ? entry.role : archetype.role;
    const firstRouteShell = Object.values(blueprint.routes || {}).find(routeEntry => (
      routeEntry?.archetype === archetypeId && typeof routeEntry.shell === 'string' && routeEntry.shell !== 'inherit'
    ))?.shell;
    const firstShell = archetype.pages?.find(page => (
      typeof page?.shell === 'string' && page.shell !== 'inherit'
    ))?.shell;
    const archetypeShell = typeof archetype.shell === 'string' && archetype.shell !== 'inherit'
      ? archetype.shell
      : null;
    const resolvedSectionShell = firstRouteShell || firstShell || archetypeShell || 'sidebar-main';

    if (!shellCatalog.has(resolvedSectionShell)) {
      addFinding('error', archetypeRecord.path, `V2 section shell "${resolvedSectionShell}" is missing from shells/.`);
    }

    sectionIdByArchetype.set(archetypeId, sectionId);
    features.push(...asArray(archetype.features));

    const section = {
      id: sectionId,
      role,
      shell: resolvedSectionShell,
      features: asArray(archetype.features),
      description: archetype.description,
      pages: [],
    };

    if (Array.isArray(archetype.navigation_items) && archetype.navigation_items.length > 0) {
      section.navigation_items = archetype.navigation_items;
    }
    if (Array.isArray(archetype.directives) && archetype.directives.length > 0) {
      section.directives = archetype.directives;
    }

    for (const page of archetype.pages || []) {
      const route = Object.entries(blueprint.routes || {}).find(([, routeEntry]) => (
        routeEntry?.archetype === archetypeId && routeEntry?.page === page.id
      ));
      const routePath = route?.[0];
      const routeShell = route?.[1]?.shell;
      const layout = Array.isArray(page.default_layout)
        ? page.default_layout.map(normalizeLayoutItem)
        : [];

      if (page.shell && page.shell !== 'inherit' && !shellCatalog.has(page.shell)) {
        addFinding('error', archetypeRecord.path, `Page "${page.id}" references missing shell "${page.shell}".`);
      }

      const essencePage = {
        id: page.id,
        layout,
        default_layout: layout,
      };
      if (routePath) essencePage.route = routePath;
      const shellOverride = page.shell && page.shell !== 'inherit' ? page.shell : routeShell;
      if (shellOverride && shellOverride !== resolvedSectionShell) essencePage.shell_override = shellOverride;
      if (Array.isArray(page.directives) && page.directives.length > 0) essencePage.directives = page.directives;

      section.pages.push(essencePage);
    }

    sections.push(section);
  }

  const routes = {};
  for (const [routePath, routeEntry] of Object.entries(blueprint.routes || {})) {
    if (!ROUTE_RE.test(routePath)) {
      addFinding('error', blueprintPath, `Route "${routePath}" must start with "/".`);
      continue;
    }

    const section = sectionIdByArchetype.get(routeEntry?.archetype);
    if (!section) {
      addFinding('error', blueprintPath, `Route "${routePath}" references uncomposed archetype "${routeEntry?.archetype}".`);
      continue;
    }

    routes[routePath] = {
      section,
      page: routeEntry.page,
    };
  }

  const routeRemove = new Set(Array.isArray(blueprint.overrides?.features_remove) ? blueprint.overrides.features_remove : []);
  const theme = normalizeTheme(blueprint.theme, themes);
  const essence = {
    $schema: 'https://decantr.ai/schemas/essence.v4.json',
    version: ESSENCE_VERSION,
    dna: {
      theme: theme.theme,
      spacing: {
        base_unit: 4,
        scale: 'linear',
        density: 'comfortable',
        content_gap: '1rem',
      },
      typography: {
        scale: 'modern',
        heading_weight: 700,
        body_weight: 400,
      },
      color: theme.color,
      radius: theme.radius,
      elevation: {
        system: 'layered',
        max_levels: 4,
      },
      motion: theme.motion,
      accessibility: {
        wcag_level: 'AA',
        focus_visible: true,
        skip_nav: true,
      },
      personality: asArray(blueprint.personality).length > 0
        ? asArray(blueprint.personality)
        : ['Clear, coherent Decantr V2 interface contract.'],
    },
    blueprint: {
      sections,
      features: uniq([...features, ...asArray(blueprint.features), ...asArray(blueprint.overrides?.features_add)])
        .filter(feature => !routeRemove.has(feature)),
      routes,
    },
    meta: {
      archetype: blueprint.id,
      target: 'react',
      platform: {
        type: 'spa',
        routing: 'history',
      },
      guard: {
        mode: 'guided',
        dna_enforcement: 'warn',
        blueprint_enforcement: 'warn',
      },
    },
  };

  const seo = sanitizeSeoHints(blueprint.seo_hints);
  if (seo) essence.meta.seo = seo;

  const navigation = sanitizeNavigation(blueprint.navigation);
  if (navigation) essence.meta.navigation = navigation;

  const constraints = sanitizeDesignConstraints(blueprint.design_constraints);
  if (constraints) essence.dna.constraints = constraints;

  return essence;
}

function formatSchemaErrors(errors) {
  return (errors || []).slice(0, 8).map(error => {
    const path = error.instancePath || '/';
    return `${path} ${error.message}`.trim();
  });
}

function renderMarkdown(report) {
  const lines = [
    '# Registry V2 Certification',
    '',
    `- Certified at: ${report.certifiedAt}`,
    `- Essence contract: ${report.essenceVersion}`,
    `- Required active compatibility: \`${report.requiredDecantrCompat}\``,
    `- Status: ${report.status}`,
    '',
    '| Type | Active | Ignored |',
    '| --- | ---: | ---: |',
  ];

  for (const [type, stats] of Object.entries(report.byType)) {
    lines.push(`| ${type} | ${stats.active} | ${stats.ignored} |`);
  }

  lines.push('');
  lines.push(`- Blueprints certified: ${report.blueprints.certified}/${report.blueprints.total}`);
  lines.push(`- Findings: ${report.findings.length}`);

  if (report.findings.length > 0) {
    lines.push('');
    lines.push('## Findings');
    for (const finding of report.findings.slice(0, 50)) {
      lines.push(`- ${finding.severity.toUpperCase()} ${finding.file}: ${finding.message}`);
      for (const evidence of finding.evidence || []) {
        lines.push(`  - ${evidence}`);
      }
    }
  }

  return `${lines.join('\n')}\n`;
}

const collections = {};
const ignored = [];
for (const dir of CONTENT_DIRECTORIES) {
  collections[dir] = listContent(dir);
  ignored.push(...collections[dir].ignored);
}

validateCatalogMetadata(collections);

const ajv = new Ajv2020({ allErrors: true, strict: false, allowUnionTypes: true });
const validateEssence = ajv.compile(loadJson('schemas/essence.v4.json'));
const blueprintResults = [];

for (const blueprintRecord of collections.blueprints.items.values()) {
  const before = findings.length;
  const essence = buildEssenceForBlueprint(blueprintRecord, collections);
  const valid = validateEssence(essence);

  if (!valid) {
    addFinding(
      'error',
      blueprintRecord.path,
      `Blueprint does not compile to a valid Essence ${ESSENCE_VERSION} candidate.`,
      formatSchemaErrors(validateEssence.errors),
    );
  }

  blueprintResults.push({
    id: blueprintRecord.item.id,
    file: blueprintRecord.path,
    status: findings.length === before && valid ? 'certified' : 'failed',
    routeCount: Object.keys(essence.blueprint.routes || {}).length,
    sectionCount: essence.blueprint.sections.length,
  });
}

const report = {
  certifiedAt: startedAt,
  status: findings.some(finding => finding.severity === 'error') ? 'failed' : 'passed',
  essenceVersion: ESSENCE_VERSION,
  requiredDecantrCompat: ACTIVE_DECANTR_COMPAT,
  byType: Object.fromEntries(CONTENT_DIRECTORIES.map(dir => [
    dir,
    {
      active: collections[dir].items.size,
      ignored: collections[dir].ignored.length,
    },
  ])),
  ignored,
  blueprints: {
    total: blueprintResults.length,
    certified: blueprintResults.filter(result => result.status === 'certified').length,
    items: blueprintResults,
  },
  findings,
};

if (reportPath) {
  ensureParentDir(reportPath);
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
}

if (summaryPath) {
  ensureParentDir(summaryPath);
  writeFileSync(summaryPath, renderMarkdown(report));
}

if (report.status === 'failed') {
  console.error(`Registry V2 certification failed with ${findings.length} finding(s).`);
  for (const finding of findings.slice(0, 20)) {
    console.error(`- ${finding.file}: ${finding.message}`);
    for (const evidence of finding.evidence || []) {
      console.error(`  ${evidence}`);
    }
  }
  process.exit(1);
}

console.log(`Registry V2 certification passed: ${report.blueprints.certified}/${report.blueprints.total} blueprints compile to Essence ${ESSENCE_VERSION}.`);
