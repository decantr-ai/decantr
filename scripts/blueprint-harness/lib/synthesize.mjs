// Fill the report template with scaffold state + subagent report + smoke results.

import { readFileSync, writeFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATE = resolve(__dirname, '../templates/report.md');

function countInlineStyles(workspace) {
  // Count `style={{` occurrences across src/.
  const srcDir = join(workspace, 'src');
  if (!existsSync(srcDir)) return 0;
  let count = 0;
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      const s = statSync(full);
      if (s.isDirectory()) walk(full);
      else if (/\.(tsx?|jsx?)$/.test(name)) {
        const content = readFileSync(full, 'utf8');
        const matches = content.match(/style=\{\{/g);
        if (matches) count += matches.length;
      }
    }
  };
  walk(srcDir);
  return count;
}

function listSourceFiles(workspace) {
  const srcDir = join(workspace, 'src');
  if (!existsSync(srcDir)) return { files: 0, lines: 0 };
  let files = 0;
  let lines = 0;
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      const s = statSync(full);
      if (s.isDirectory()) walk(full);
      else if (/\.(tsx?|jsx?|css)$/.test(name)) {
        files += 1;
        lines += readFileSync(full, 'utf8').split('\n').length;
      }
    }
  };
  walk(srcDir);
  return { files, lines };
}

function readScaffoldState(workspace) {
  const essencePath = join(workspace, 'decantr.essence.json');
  const manifestPath = join(workspace, '.decantr/context/pack-manifest.json');
  const state = {
    essenceVersion: null,
    personality: null,
    sections: [],
    routes: [],
    packCount: 0,
    contractShape: 'unknown',
  };
  if (existsSync(essencePath)) {
    const essence = JSON.parse(readFileSync(essencePath, 'utf8'));
    state.essenceVersion = essence.version ?? essence.schema_version ?? null;
    state.personality =
      (typeof essence?.blueprint?.personality === 'string' ? essence.blueprint.personality : null) ??
      (typeof essence?.dna?.personality === 'string' ? essence.dna.personality : null) ??
      (typeof essence?.meta?.personality === 'string' ? essence.meta.personality : null) ??
      null;
    // Routes can live in several shapes depending on schema version.
    const routeSources = [
      essence?.blueprint?.routes,
      essence?.blueprint?.pages,
      essence?.structure?.pages,
    ].filter((x) => Array.isArray(x));
    const allRoutes = routeSources.flat();
    state.routes = allRoutes
      .map((p) => (typeof p === 'string' ? p : p?.path ?? p?.route ?? p?.id))
      .filter(Boolean);
    const sections =
      essence?.blueprint?.sections ?? essence?.structure?.sections ?? [];
    state.sections = Array.isArray(sections)
      ? sections.map((s) => (typeof s === 'string' ? s : s?.slug ?? s?.id ?? s?.name)).filter(Boolean)
      : [];
  }
  if (existsSync(manifestPath)) {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    state.packCount = Array.isArray(manifest?.packs) ? manifest.packs.length : 0;
    state.contractShape = 'pack-style';
  } else {
    state.contractShape = 'narrative-only';
  }
  return state;
}

function renderTemplate(template, vars) {
  return template.replace(/\{\{(\w+)\}\}/g, (_m, k) => {
    if (k in vars) return String(vars[k]);
    return `{{${k}}}`;
  });
}

export function synthesizeReport({
  workspace,
  blueprint,
  subagentReportPath,
  mobileShotsDir,
  smokeResults,
  outputPath,
}) {
  const template = readFileSync(TEMPLATE, 'utf8');
  const scaffold = readScaffoldState(workspace);
  const src = listSourceFiles(workspace);
  const inlineStyles = countInlineStyles(workspace);
  const subagentReport = existsSync(subagentReportPath)
    ? readFileSync(subagentReportPath, 'utf8')
    : '_(no subagent report provided — run the cold-agent dispatch step first)_';
  const mobileTable = (smokeResults ?? [])
    .map((r) => `| ${r.route} | ${r.viewport} | ${r.ok ? '✓' : '✗'} | \`${r.file ?? '—'}\` |`)
    .join('\n');

  const rendered = renderTemplate(template, {
    DATE: new Date().toISOString().slice(0, 10),
    BLUEPRINT: blueprint,
    WORKSPACE: workspace,
    ESSENCE_VERSION: scaffold.essenceVersion ?? '?',
    PACK_COUNT: scaffold.packCount,
    SECTION_COUNT: scaffold.sections.length,
    ROUTE_COUNT: scaffold.routes.length,
    SECTIONS: scaffold.sections.join(', ') || '—',
    ROUTES: scaffold.routes.map((r) => `\`${r}\``).join(', ') || '—',
    PERSONALITY: scaffold.personality ?? '—',
    SRC_FILES: src.files,
    SRC_LINES: src.lines,
    INLINE_STYLES: inlineStyles,
    MOBILE_SHOTS_DIR: mobileShotsDir,
    MOBILE_TABLE: mobileTable || '_(no smoke results)_',
    SUBAGENT_REPORT: subagentReport,
  });

  writeFileSync(outputPath, rendered);
  return {
    outputPath,
    scaffold,
    src,
    inlineStyles,
  };
}
