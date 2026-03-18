#!/usr/bin/env node

/**
 * Decantr LLM Task Profile Compiler
 *
 * Compiles reference docs, registry JSON, and CLAUDE.md into
 * task-specific context profiles optimized for LLM consumption.
 *
 * Usage:
 *   node tools/compile-llm.js                          # compile all profiles
 *   node tools/compile-llm.js --report                 # compile + detailed report
 *   node tools/compile-llm.js --check                  # validate only, no write
 *   node tools/compile-llm.js --only=task-init,task-page  # compile specific profiles
 *   node tools/compile-llm.js --watch                  # recompile on source changes
 *
 * Incremental caching: skips recompile when source hashes match previous build.
 * Cache stored at node_modules/.decantr-cache/compile-llm-cache.json
 *
 * Output: llm/task-{type}.md  (6 profiles)
 *
 * @module tools/compile-llm
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'node:crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const ROOT = path.resolve(__dirname, '..');
const REF = path.join(ROOT, 'reference');
const REG = path.join(ROOT, 'src', 'registry');
const OUT = path.join(ROOT, 'llm');
const CACHE_PATH = path.join(ROOT, 'node_modules', '.decantr-cache', 'compile-llm-cache.json');

// ---------------------------------------------------------------------------
// Token budget thresholds (warn if exceeded)
// ---------------------------------------------------------------------------

const TOKEN_BUDGETS = {
  'task-init':      45000,
  'task-page':      30000,
  'task-component': 25000,
  'task-style':     20000,
  'task-debug':     15000,
  'task-refactor':  15000,
};

// ---------------------------------------------------------------------------
// Utility: estimate tokens (~4 chars per token for English + code)
// ---------------------------------------------------------------------------

function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

// ---------------------------------------------------------------------------
// Utility: read file, return empty string if missing
// ---------------------------------------------------------------------------

function readFile(filePath) {
  try { return fs.readFileSync(filePath, 'utf8'); }
  catch { return ''; }
}

function readJSON(filePath) {
  const raw = readFile(filePath);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

// ---------------------------------------------------------------------------
// Source loader: reads all source files into memory
// ---------------------------------------------------------------------------

function loadSources() {
  const sources = {
    ref: {},     // reference/*.md  keyed by basename
    reg: {},     // registry JSON   keyed by relative path
    claude: '',  // CLAUDE.md
    agents: '',  // AGENTS.md
  };

  // Reference docs
  for (const f of fs.readdirSync(REF).filter(n => n.endsWith('.md'))) {
    sources.ref[f.replace('.md', '')] = readFile(path.join(REF, f));
  }

  // CLAUDE.md & AGENTS.md
  sources.claude = readFile(path.join(ROOT, 'CLAUDE.md'));
  sources.agents = readFile(path.join(ROOT, 'AGENTS.md'));

  // Registry JSON (flat)
  for (const f of fs.readdirSync(REG).filter(n => n.endsWith('.json'))) {
    sources.reg[f] = readJSON(path.join(REG, f));
  }

  // Registry subdirs: archetypes, patterns
  for (const sub of ['archetypes', 'patterns']) {
    const dir = path.join(REG, sub);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir).filter(n => n.endsWith('.json'))) {
      sources.reg[`${sub}/${f}`] = readJSON(path.join(dir, f));
    }
  }

  // Recipes
  for (const f of fs.readdirSync(REG).filter(n => n.startsWith('recipe-') && n.endsWith('.json'))) {
    sources.reg[f] = sources.reg[f] || readJSON(path.join(REG, f));
  }

  return sources;
}

// ---------------------------------------------------------------------------
// Incremental caching
// ---------------------------------------------------------------------------

function computeSourceHashes() {
  const hashes = {};

  // Hash reference docs
  const refDir = REF;
  if (fs.existsSync(refDir)) {
    for (const f of fs.readdirSync(refDir).filter(n => n.endsWith('.md'))) {
      const content = fs.readFileSync(path.join(refDir, f), 'utf8');
      hashes[`ref/${f}`] = createHash('md5').update(content).digest('hex');
    }
  }

  // Hash registry files
  if (fs.existsSync(REG)) {
    for (const f of fs.readdirSync(REG).filter(n => n.endsWith('.json'))) {
      const content = fs.readFileSync(path.join(REG, f), 'utf8');
      hashes[`reg/${f}`] = createHash('md5').update(content).digest('hex');
    }
    for (const sub of ['archetypes', 'patterns']) {
      const dir = path.join(REG, sub);
      if (!fs.existsSync(dir)) continue;
      for (const f of fs.readdirSync(dir).filter(n => n.endsWith('.json'))) {
        const content = fs.readFileSync(path.join(dir, f), 'utf8');
        hashes[`reg/${sub}/${f}`] = createHash('md5').update(content).digest('hex');
      }
    }
  }

  // Hash CLAUDE.md and AGENTS.md
  for (const f of ['CLAUDE.md', 'AGENTS.md']) {
    const p = path.join(ROOT, f);
    if (fs.existsSync(p)) {
      hashes[f] = createHash('md5').update(fs.readFileSync(p, 'utf8')).digest('hex');
    }
  }

  return hashes;
}

function loadCompileCache() {
  try {
    return JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));
  } catch {
    return null;
  }
}

function saveCompileCache(sourceHashes, buildHash) {
  const cacheDir = path.dirname(CACHE_PATH);
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
  fs.writeFileSync(CACHE_PATH, JSON.stringify({ sourceHashes, buildHash }, null, 2), 'utf8');
}

// ---------------------------------------------------------------------------
// Async source loader: reads all source files in parallel
// ---------------------------------------------------------------------------

async function loadSourcesAsync() {
  const sources = {
    ref: {},
    reg: {},
    claude: '',
    agents: '',
  };

  const { readFile: readFileAsync } = await import('node:fs/promises');

  // Gather all file paths first
  const refFiles = fs.readdirSync(REF).filter(n => n.endsWith('.md'));
  const regFiles = fs.readdirSync(REG).filter(n => n.endsWith('.json'));
  const subDirs = ['archetypes', 'patterns'];
  const subFiles = [];
  for (const sub of subDirs) {
    const dir = path.join(REG, sub);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir).filter(n => n.endsWith('.json'))) {
      subFiles.push({ sub, file: f });
    }
  }

  // Load all in parallel
  const [refEntries, regEntries, subEntries, claude, agents] = await Promise.all([
    Promise.all(refFiles.map(f =>
      readFileAsync(path.join(REF, f), 'utf-8').then(c => [f.replace('.md', ''), c]).catch(() => null)
    )),
    Promise.all(regFiles.map(f =>
      readFileAsync(path.join(REG, f), 'utf-8').then(c => {
        try { return [f, JSON.parse(c)]; } catch { return null; }
      }).catch(() => null)
    )),
    Promise.all(subFiles.map(({ sub, file }) =>
      readFileAsync(path.join(REG, sub, file), 'utf-8').then(c => {
        try { return [`${sub}/${file}`, JSON.parse(c)]; } catch { return null; }
      }).catch(() => null)
    )),
    readFileAsync(path.join(ROOT, 'CLAUDE.md'), 'utf-8').catch(() => ''),
    readFileAsync(path.join(ROOT, 'AGENTS.md'), 'utf-8').catch(() => ''),
  ]);

  for (const entry of refEntries) if (entry) sources.ref[entry[0]] = entry[1];
  for (const entry of regEntries) if (entry) sources.reg[entry[0]] = entry[1];
  for (const entry of subEntries) if (entry) sources.reg[entry[0]] = entry[1];
  sources.claude = claude;
  sources.agents = agents;

  return sources;
}

// ---------------------------------------------------------------------------
// Section parser: splits markdown by ## headings
// Returns Map<sectionKey, { title, content, number }>
// sectionKey = number (for "## 1. Title") or lowercase title
// ---------------------------------------------------------------------------

function parseSections(markdown) {
  const sections = new Map();
  const lines = markdown.split('\n');
  let current = null;
  let buf = [];

  function flush() {
    if (current) {
      current.content = buf.join('\n').trim();
      // key by number if present, else by lowercase title
      const key = current.number != null
        ? String(current.number)
        : current.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      sections.set(key, current);
    }
    buf = [];
  }

  for (const line of lines) {
    const m = line.match(/^## (?:(\d+)\.\s+)?(.+)$/);
    if (m) {
      flush();
      current = {
        title: m[2].trim(),
        number: m[1] != null ? parseInt(m[1], 10) : null,
        content: '',
      };
      buf.push(line);
    } else {
      buf.push(line);
    }
  }
  flush();
  return sections;
}

// ---------------------------------------------------------------------------
// Extract a specific section (by number or key) from parsed sections
// ---------------------------------------------------------------------------

function extractSection(sections, key) {
  const s = sections.get(String(key));
  return s ? s.content : '';
}

// ---------------------------------------------------------------------------
// Extract multiple sections and join
// ---------------------------------------------------------------------------

function extractSections(sections, keys) {
  return keys.map(k => extractSection(sections, k)).filter(Boolean).join('\n\n---\n\n');
}

// ---------------------------------------------------------------------------
// Strip "See also:" footer lines from extracted content
// ---------------------------------------------------------------------------

function stripSeeAlso(content) {
  return content.replace(/\n\*\*See also:\*\*.*/g, '').trim();
}

// ---------------------------------------------------------------------------
// Resolve inline cross-references: "see `reference/X.md` §N" → inline
// This is a best-effort pass; unresolvable refs are left as-is.
// ---------------------------------------------------------------------------

function resolveInlineRefs(content, allSections) {
  // Pattern: see `reference/foo.md` §N or see §N above/below
  return content.replace(
    /see\s+`?reference\/([a-z-]+)\.md`?\s*§(\d+)/gi,
    (match, file, num) => {
      const key = file.replace('.md', '');
      const sections = allSections[key];
      if (sections) {
        const s = sections.get(String(num));
        if (s) return `(inlined from ${file}.md §${num})`;
      }
      return match;
    }
  );
}

// ---------------------------------------------------------------------------
// Registry extractors
// ---------------------------------------------------------------------------

function extractArchetypeSummaries(sources) {
  const lines = ['## Archetype Index\n'];
  const indexPath = 'archetypes/index.json';
  const index = sources.reg[indexPath];

  // Iterate archetype files
  for (const [key, data] of Object.entries(sources.reg)) {
    if (!key.startsWith('archetypes/') || key === indexPath || !data) continue;
    const name = key.replace('archetypes/', '').replace('.json', '');
    lines.push(`### ${name}`);
    if (data.pages) {
      lines.push(`**Pages:** ${data.pages.map(p => p.id).join(', ')}`);
      lines.push(`**Patterns used:** ${[...new Set(data.pages.flatMap(p => {
        const blend = p.default_blend || p.patterns || [];
        return blend.flatMap(b => {
          if (typeof b === 'string') return [b];
          if (b.pattern) return [b.pattern];
          if (b.cols) return Array.isArray(b.cols) ? b.cols : [b.cols];
          return [];
        });
      }))].filter(Boolean).join(', ')}`);
    }
    if (data.tannins) {
      lines.push(`**Tannins:** ${data.tannins.join(', ')}`);
    }
    if (data.suggested_vintage) {
      const v = data.suggested_vintage;
      lines.push(`**Suggested vintage:** style=${v.style || 'auradecantism'}, mode=${v.mode || 'dark'}`);
    }
    if (data.skeletons) {
      lines.push(`**Skeletons:** ${Object.keys(data.skeletons).join(', ')}`);
    }
    // Default blend examples (first 2 pages)
    if (data.pages) {
      for (const page of data.pages.slice(0, 2)) {
        if (page.default_blend) {
          lines.push(`**${page.id} blend:** \`${JSON.stringify(page.default_blend)}\``);
        }
      }
    }
    lines.push('');
  }
  return lines.join('\n');
}

function extractPatternIndex(sources) {
  const lines = ['## Pattern Index\n'];
  lines.push('| Pattern | Presets | Layout | Components |');
  lines.push('|---------|---------|--------|-----------|');

  for (const [key, data] of Object.entries(sources.reg)) {
    if (!key.startsWith('patterns/') || key === 'patterns/index.json' || !data) continue;
    const name = key.replace('patterns/', '').replace('.json', '');
    const presets = data.presets ? Object.keys(data.presets).join(', ') : '—';
    const layout = data.default_blend?.layout || data.blend?.layout || '—';
    const comps = data.components ? data.components.join(', ') : '—';
    lines.push(`| ${name} | ${presets} | ${layout} | ${comps} |`);
  }
  return lines.join('\n');
}

function extractRecipeSummaries(sources) {
  const lines = ['## Recipe Index\n'];

  for (const [key, data] of Object.entries(sources.reg)) {
    if (!key.startsWith('recipe-') || !data) continue;
    const name = key.replace('.json', '');
    lines.push(`### ${name}`);
    if (data.setup) lines.push(`**Setup:** \`${data.setup}\``);
    if (data.decorators) {
      const decNames = Object.keys(data.decorators);
      lines.push(`**Decorators (${decNames.length}):** ${decNames.join(', ')}`);
    }
    if (data.pattern_overrides) {
      lines.push(`**Pattern overrides:** ${Object.keys(data.pattern_overrides).join(', ')}`);
    }
    if (data.compositions) {
      lines.push(`**Compositions:** ${Object.keys(data.compositions).join(', ')}`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

function extractSkeletonSummary(sources) {
  const data = sources.reg['skeletons.json'];
  if (!data) return '';
  const lines = ['## Skeleton Presets\n'];
  const skeletons = data.skeletons || data;
  if (Array.isArray(skeletons)) {
    for (const s of skeletons) {
      lines.push(`### ${s.id || s.name}`);
      if (s.description) lines.push(s.description);
      if (s.code) lines.push('```js\n' + s.code + '\n```');
      lines.push('');
    }
  } else if (typeof skeletons === 'object') {
    for (const [id, s] of Object.entries(skeletons)) {
      lines.push(`### ${id}`);
      if (typeof s === 'string') lines.push(s);
      else if (s.description) lines.push(s.description);
      if (s.code) lines.push('```js\n' + s.code + '\n```');
      lines.push('');
    }
  }
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// PREAMBLE: Protected methodology content included in every profile
// ---------------------------------------------------------------------------

function assemblePreamble(sources) {
  const spatial = parseSections(sources.ref['spatial-guidelines'] || '');
  const tokens = parseSections(sources.ref['tokens'] || '');
  const atoms = parseSections(sources.ref['atoms'] || '');
  const claude = sources.claude || '';

  const parts = [];

  parts.push('# Decantr — Methodology Preamble\n');
  parts.push('> This preamble is included in every task profile. It contains the spatial, typographic, and thematic rules that define Decantr output quality.\n');

  // --- Spatial ---
  parts.push('---\n\n# Spatial Design Rules\n');

  // §3 Gestalt Proximity
  const gestalt = extractSection(spatial, '3');
  if (gestalt) parts.push(stripSeeAlso(gestalt));

  // §5 Functional Density Zones
  const zones = extractSection(spatial, '5');
  if (zones) parts.push(stripSeeAlso(zones));

  // §2 Spatial Taxonomy (decision flow)
  const taxonomy = extractSection(spatial, '2');
  if (taxonomy) parts.push(stripSeeAlso(taxonomy));

  // §16 Density System Integration
  const density = extractSection(spatial, '16');
  if (density) parts.push(stripSeeAlso(density));

  // §17 Clarity Profile (THE most important table)
  const clarity = extractSection(spatial, '17');
  if (clarity) parts.push(stripSeeAlso(clarity));

  // §18 Quick Reference Decision Table
  const decision = extractSection(spatial, '18');
  if (decision) parts.push(stripSeeAlso(decision));

  // §19 Density Zone Quick Selection
  const zoneQuick = extractSection(spatial, '19');
  if (zoneQuick) parts.push(stripSeeAlso(zoneQuick));

  // --- Typography ---
  parts.push('\n---\n\n# Typography\n');

  // From tokens.md: Typography Tokens section
  const typoTokens = extractSection(tokens, 'typography-tokens');
  if (typoTokens) parts.push(stripSeeAlso(typoTokens));

  // From spatial-guidelines: §8 Typographic Spatial System
  const typoSpatial = extractSection(spatial, '8');
  if (typoSpatial) parts.push(stripSeeAlso(typoSpatial));

  // From atoms.md: Typography Presets
  const typoPresets = extractSection(atoms, 'typography-presets-compound-atoms-');
  if (typoPresets) parts.push(stripSeeAlso(typoPresets));

  // --- Tokens (essentials) ---
  parts.push('\n---\n\n# Essential Tokens\n');

  // Spacing tokens
  const spacingTokens = extractSection(tokens, 'spacing-tokens');
  if (spacingTokens) parts.push(stripSeeAlso(spacingTokens));

  // Semantic color tokens
  const colorTokens = extractSection(tokens, 'semantic-color-tokens');
  if (colorTokens) parts.push(stripSeeAlso(colorTokens));

  // Z-index tokens
  const zTokens = extractSection(tokens, 'z-index-tokens');
  if (zTokens) parts.push(stripSeeAlso(zTokens));

  // Radius token hierarchy
  const radiusTokens = extractSection(tokens, 'radius-token-hierarchy');
  if (radiusTokens) parts.push(stripSeeAlso(radiusTokens));

  // Quick-reference mapping (literal → token)
  const quickRef = extractSection(tokens, 'token-compliance');
  if (quickRef) parts.push(stripSeeAlso(quickRef));

  // --- Essential Atoms ---
  parts.push('\n---\n\n# Essential Atoms\n');

  // Layout atoms
  const layoutAtoms = [
    extractSection(atoms, 'display'),
    extractSection(atoms, 'flexbox'),
    extractSection(atoms, 'alignment'),
    extractSection(atoms, 'grid-system'),
    extractSection(atoms, 'container-utilities'),
  ].filter(Boolean).join('\n\n');
  if (layoutAtoms) parts.push(stripSeeAlso(layoutAtoms));

  // Spacing atoms
  const spacingAtoms = extractSection(atoms, 'spacing-p-m-gap-scale-0-12-14-16-20-24-32-40-48-56-64-');
  if (spacingAtoms) parts.push(stripSeeAlso(spacingAtoms));

  // Color atoms
  const colorAtoms = extractSection(atoms, 'colors-semantic-');
  if (colorAtoms) parts.push(stripSeeAlso(colorAtoms));

  // --- Cork Rules ---
  parts.push('\n---\n\n# Cork Rules (Anti-Drift)\n');
  parts.push(`Before writing ANY code, read \`decantr.essence.json\`. Verify:
1. **Style matches the Vintage.** Do not switch styles.
2. **Page exists in the Structure.** If new, add it to the Essence first.
3. **Layout follows the page's Blend.** Do not freestyle spatial arrangement.
4. **Composition follows the active Recipe.** Do not freestyle decoration.
5. **Spacing follows the Clarity profile** derived from Character → see Clarity Profile table above. Do not default to \`_gap4\`/\`_p4\` everywhere.

If a request conflicts with the Essence, flag the conflict and ask for confirmation.`);

  // --- Decantation Process (summary) ---
  parts.push('\n---\n\n# Decantation Process (Summary)\n');
  parts.push(`\`\`\`
POUR → SETTLE → CLARIFY → DECANT → SERVE → AGE
\`\`\`

| Stage | Purpose |
|-------|---------|
| **POUR** | User expresses intent in natural language |
| **SETTLE** | Decompose into 5 layers: Terroir (domain), Vintage (style+mode+recipe), Character (personality traits), Structure (pages), Tannins (functional systems) |
| **CLARIFY** | Write \`decantr.essence.json\` — the project's persistent DNA. User confirms. |
| **DECANT** | Resolve each page's Blend (spatial arrangement from archetype defaults) |
| **SERVE** | Generate code from Blend specs using the SERVE algorithm |
| **AGE** | Read Essence before every change. Guard against drift. |

**Essence Schema (simple):**
\`\`\`json
{
  "version": "1.0.0",
  "terroir": "saas-dashboard",
  "vintage": { "style": "command-center", "mode": "dark", "recipe": "command-center", "shape": "sharp" },
  "character": ["tactical", "data-dense"],
  "vessel": { "type": "spa", "routing": "hash" },
  "structure": [
    { "id": "overview", "skeleton": "sidebar-main", "blend": ["kpi-grid", "data-table"] }
  ],
  "tannins": ["auth", "realtime-data"],
  "cork": { "enforce_style": true, "enforce_recipe": true }
}
\`\`\`

**Blend row types:**
- \`"pattern-id"\` → full-width pattern row
- \`{ "pattern": "hero", "preset": "image-overlay", "as": "recipe-hero" }\` → pattern with preset + alias
- \`{ "cols": ["a", "b"], "at": "lg" }\` → equal-width side-by-side, collapse below lg
- \`{ "cols": ["a", "b"], "span": { "a": 3 }, "at": "md" }\` → weighted columns (a=3fr, b=1fr)
`);

  // --- Import catalog ---
  parts.push('\n---\n\n# Import Catalog\n');
  parts.push(`\`\`\`js
import { tags } from 'decantr/tags';
import { h, text, cond, list, mount, onMount, onDestroy } from 'decantr/core';
import { createSignal, createEffect, createMemo, createStore, batch } from 'decantr/state';
import { createQuery, createMutation, queryClient } from 'decantr/data';
import { createRouter, link, navigate, useRoute, back, forward, isNavigating } from 'decantr/router';
import { css, setStyle, setMode, registerStyle } from 'decantr/css';
import { Button, Input, Card, Modal, Tabs, Select, ... } from 'decantr/components';
import { Chart, Sparkline } from 'decantr/chart';
import { icon } from 'decantr/icons';
\`\`\``);

  return parts.join('\n\n');
}

// ---------------------------------------------------------------------------
// TASK PROFILES
// ---------------------------------------------------------------------------

// --- task-init: Create a New Decantr Project ---
function buildTaskInit(sources, preamble) {
  const decant = sources.ref['decantation-process'] || '';
  const primer = parseSections(sources.ref['llm-primer'] || '');

  const parts = [preamble];

  parts.push('\n\n---\n\n# Task: Create a New Decantr Project\n');
  parts.push('> Read this file when scaffolding a new project from scratch. Covers the full Decantation Process, all archetypes, styles, recipes, and skeleton templates.\n');

  // Full decantation process
  parts.push('# The Decantation Process (Full)\n');
  parts.push(stripSeeAlso(decant));

  // Archetype summaries (all)
  parts.push('\n---\n\n');
  parts.push(extractArchetypeSummaries(sources));

  // Recipe summaries (all)
  parts.push('\n---\n\n');
  parts.push(extractRecipeSummaries(sources));

  // Style catalog
  parts.push('\n---\n\n# Style Catalog\n');
  const styleSec = extractSection(primer, '8');
  if (styleSec) parts.push(stripSeeAlso(styleSec));

  // Skeleton code templates
  parts.push('\n---\n\n# Skeleton Code Templates\n');
  const skelCode = extractSection(primer, '5');
  if (skelCode) parts.push(stripSeeAlso(skelCode));

  // Pattern index
  parts.push('\n---\n\n');
  parts.push(extractPatternIndex(sources));

  // Community registry discovery
  parts.push('\n---\n\n# Community Content Registry\n');
  parts.push(`During the Decantation Process, you can discover community content via:
- \`decantr registry search <query>\` — search for styles, recipes, patterns, archetypes
- \`decantr registry add <type>/<name>\` — install community content (e.g. \`style/neon\`)
- MCP tools: \`search_content_registry\`, \`get_content_recommendations\`

Registry content is installed locally with no runtime dependency. The manifest \`decantr.registry.json\` tracks installed content with checksums for integrity verification.`);

  return parts.join('\n\n');
}

// --- task-page: Add/Modify a Page ---
function buildTaskPage(sources, preamble) {
  const primer = parseSections(sources.ref['llm-primer'] || '');
  const spatial = parseSections(sources.ref['spatial-guidelines'] || '');

  const parts = [preamble];

  parts.push('\n\n---\n\n# Task: Add or Modify a Page\n');
  parts.push('> Read this file when adding a page to an existing project. Always read `decantr.essence.json` first to identify the active archetype, recipe, and Clarity profile.\n');

  // How to read the essence
  parts.push('## Reading the Essence\n');
  parts.push(`1. Open \`decantr.essence.json\`
2. Identify the \`terroir\` — this determines which archetype to consult
3. Identify the \`vintage.recipe\` — this determines which decorators to apply
4. Identify the \`character\` — this determines the Clarity profile (spacing density)
5. Check if the new page already exists in \`structure\`. If not, add it.
6. Resolve the page's \`blend\` from the archetype's \`default_blend\` or customize.`);

  // SERVE algorithm
  parts.push('\n## SERVE Algorithm (Code Generation from Blend)\n');
  parts.push(`For each page, read its \`blend\` array and apply:
1. Create page container with \`surface\` atoms (default: \`_flex _col _gap4 _p4 _overflow[auto] _flex1\`) + \`d-page-enter\` class
2. String rows → full-width pattern (use pattern's \`default_blend.atoms\`)
3. \`{ cols, at }\` rows → \`_grid _gc1 _{at}:gc{N} _gap{clarity}\` wrapper with responsive collapse
4. \`{ cols, span, at }\` rows → responsive \`_gc{total}\` grid, each pattern gets \`_span{weight}\`
5. Wrap contained patterns in \`Card(Card.Header, Card.Body)\` — standalone patterns (layout \`hero\`/\`row\` or \`contained: false\`) skip wrapping
6. Apply recipe \`pattern_overrides\` (background effects) from recipe JSON as Card class attrs
7. Apply Clarity-derived gap to pattern code internals (\`_gap4\` → clarity gap)
8. Add entrance animations: \`d-stagger\` / \`d-stagger-up\` on grid wrappers, \`animate: true\` on Statistic`);

  // Recipe application guide
  parts.push('\n## Recipe Application Guide\n');
  const recipeGuide = extractSection(primer, '7');
  if (recipeGuide) parts.push(stripSeeAlso(recipeGuide));

  // All archetype summaries (for page context)
  parts.push('\n---\n\n');
  parts.push(extractArchetypeSummaries(sources));

  // All recipe summaries
  parts.push('\n---\n\n');
  parts.push(extractRecipeSummaries(sources));

  // Pattern index with code snippets
  parts.push('\n---\n\n# Pattern Code Snippets\n');
  const patternSnippets = extractSection(primer, '6');
  if (patternSnippets) parts.push(stripSeeAlso(patternSnippets));

  // Skeleton templates
  parts.push('\n---\n\n# Skeleton Templates\n');
  const skelCode = extractSection(primer, '5');
  if (skelCode) parts.push(stripSeeAlso(skelCode));

  // Responsive spatial behavior
  parts.push('\n---\n\n# Responsive Spatial Behavior\n');
  const responsive = extractSection(spatial, '6');
  if (responsive) parts.push(stripSeeAlso(responsive));

  // Containment principle
  const containment = extractSection(spatial, '4');
  if (containment) parts.push('\n\n' + stripSeeAlso(containment));

  return parts.join('\n\n');
}

// --- task-component: Create/Modify Components ---
function buildTaskComponent(sources, preamble) {
  const primer = parseSections(sources.ref['llm-primer'] || '');
  const lifecycle = sources.ref['component-lifecycle'] || '';
  const behaviors = sources.ref['behaviors'] || '';
  const state = sources.ref['state'] || '';
  const stateData = sources.ref['state-data'] || '';
  const atoms = sources.ref['atoms'] || '';
  const compound = sources.ref['compound-spacing'] || '';
  const spatial = parseSections(sources.ref['spatial-guidelines'] || '');

  const parts = [preamble];

  parts.push('\n\n---\n\n# Task: Create or Modify a Component\n');
  parts.push('> Read this file when creating a new component or modifying existing framework components.\n');

  // Component authoring contract
  parts.push('## Component Authoring Contract\n');
  parts.push(`- Components are **functions** that return \`HTMLElement\`
- Props are the first argument: \`function MyComponent({ prop1, prop2, class: cls }) {}\`
- Additional children via rest args: \`function MyComponent(props, ...children) {}\`
- Use \`const { div, span, h1 } = tags;\` for element creation
- Use \`css('_atom1 _atom2')\` for styling — never inline styles for static values
- Wire cleanup via \`onDestroy(() => {...})\` for listeners, timers, observers
- Export as named function: \`export function MyComponent(props) { ... }\``);

  // Top 15 component signatures
  parts.push('\n## Top Component Signatures\n');
  const compSigs = extractSection(primer, '3');
  if (compSigs) parts.push(stripSeeAlso(compSigs));

  // Chart API
  parts.push('\n## Chart API\n');
  const chartApi = extractSection(primer, '4');
  if (chartApi) parts.push(stripSeeAlso(chartApi));

  // Lifecycle & cleanup
  parts.push('\n---\n\n# Component Lifecycle & Cleanup\n');
  parts.push(stripSeeAlso(lifecycle));

  // Behaviors API (summary)
  parts.push('\n---\n\n# Behavioral Primitives\n');
  parts.push(stripSeeAlso(behaviors));

  // State management
  parts.push('\n---\n\n# State Management\n');
  parts.push(stripSeeAlso(state));

  // Data layer
  parts.push('\n---\n\n# Data Layer\n');
  parts.push(stripSeeAlso(stateData));

  // Compound spacing contract
  parts.push('\n---\n\n# Compound Spacing\n');
  parts.push(stripSeeAlso(compound));

  // Full atom reference
  parts.push('\n---\n\n# Full Atom Reference\n');
  parts.push(stripSeeAlso(atoms));

  // Component sizing from spatial guidelines
  parts.push('\n---\n\n# Component Sizing\n');
  const sizing = extractSection(spatial, '7');
  if (sizing) parts.push(stripSeeAlso(sizing));

  // Micro-spacing rules
  const micro = extractSection(spatial, '15');
  if (micro) parts.push('\n\n' + stripSeeAlso(micro));

  return parts.join('\n\n');
}

// --- task-style: Change Styles/Themes ---
function buildTaskStyle(sources, preamble) {
  const styleSystem = sources.ref['style-system'] || '';
  const tokens = sources.ref['tokens'] || '';
  const colorGuide = sources.ref['color-guidelines'] || '';

  const parts = [preamble];

  parts.push('\n\n---\n\n# Task: Change Styles or Themes\n');
  parts.push('> Read this file when changing the visual style, creating a custom style, or modifying the theme system.\n');

  // Style system reference
  parts.push('# Style + Mode System\n');
  parts.push(stripSeeAlso(styleSystem));

  // Full token reference
  parts.push('\n---\n\n# Design Token Reference (Full)\n');
  parts.push(stripSeeAlso(tokens));

  // Recipe summaries (for recipe visual transforms)
  parts.push('\n---\n\n');
  parts.push(extractRecipeSummaries(sources));

  // Community styles via registry
  parts.push('\n---\n\n# Community Styles via Registry\n');
  parts.push(`Beyond built-in styles, community styles can be discovered and installed:
- \`decantr registry search --type=style <query>\` — find community styles
- \`decantr registry add style/<name>\` — install to \`src/css/styles/community/\`
- Installed styles auto-register via \`registerStyle()\` and become available to \`setStyle()\`
- Use \`decantr registry list\` to see installed community content`);

  return parts.join('\n\n');
}

// --- task-debug: Debugging & Troubleshooting ---
function buildTaskDebug(sources, preamble) {
  const primer = parseSections(sources.ref['llm-primer'] || '');
  const agents = sources.agents || '';

  const parts = [preamble];

  parts.push('\n\n---\n\n# Task: Debug Issues\n');
  parts.push('> Read this file when debugging problems. Covers common pitfalls, framework translation, and lifecycle issues.\n');

  // Common pitfalls
  parts.push('# Common Pitfalls\n');
  const pitfalls = extractSection(primer, '16');
  if (pitfalls) parts.push(stripSeeAlso(pitfalls));

  // Children rules (critical for debugging)
  parts.push('\n## Children Rules (Critical)\n');
  parts.push(`> **Function children = reactive TEXT only.** When an element receives a function as a child, the framework calls \`String(fn())\` and creates a reactive text node. It does **not** expect DOM elements from that function.

Use \`cond()\` for conditional DOM elements:
\`\`\`js
// WRONG — returns "[object HTMLSpanElement]"
div({}, () => show() ? span({}, 'Hello') : null)

// CORRECT — use cond() for conditional DOM
div({}, cond(() => show(), () => span({}, 'Hello')))

// CORRECT — function children work for reactive text
span({}, () => \`Count: \${count()}\`)
\`\`\``);

  // Framework translation layer (distilled)
  parts.push('\n---\n\n# Framework Translation\n');
  // Extract just the cheat sheet and common pitfalls from AGENTS.md
  const agentsSections = parseSections(agents);
  const quickEquiv = extractSection(agentsSections, 'quick-equivalence-cheat-sheet');
  if (quickEquiv) parts.push(stripSeeAlso(quickEquiv));

  const commonPitfalls = extractSection(agentsSections, 'common-pitfalls');
  if (commonPitfalls) parts.push('\n\n' + stripSeeAlso(commonPitfalls));

  // Tier 1 mappings (full framework translations)
  const tier1 = extractSection(agentsSections, 'tier-1--full-framework-mappings');
  if (tier1) parts.push('\n\n' + stripSeeAlso(tier1));

  // Integration patterns
  const integrations = extractSection(agentsSections, 'integration-patterns');
  if (integrations) parts.push('\n\n' + stripSeeAlso(integrations));

  // Component lifecycle debugging
  parts.push('\n---\n\n# Lifecycle Debugging\n');
  const lifecycle = sources.ref['component-lifecycle'] || '';
  if (lifecycle) parts.push(stripSeeAlso(lifecycle));

  // State management reference
  parts.push('\n---\n\n# State Management Reference\n');
  const stateRef = extractSection(primer, '9');
  if (stateRef) parts.push(stripSeeAlso(stateRef));

  // Routing reference
  const routeRef = extractSection(primer, '10');
  if (routeRef) parts.push('\n\n' + stripSeeAlso(routeRef));

  return parts.join('\n\n');
}

// --- task-refactor: Refactoring & Drift Correction ---
function buildTaskRefactor(sources, preamble) {
  const decant = parseSections(sources.ref['decantation-process'] || '');

  const parts = [preamble];

  parts.push('\n\n---\n\n# Task: Refactor & Fix Drift\n');
  parts.push('> Read this file when refactoring code, fixing style drift, or correcting essence violations.\n');

  // Cork rules (detailed — from decantation process)
  parts.push('# Cork Rules (Detailed)\n');
  const corkRules = extractSection(decant, 'cork-rules--anti-drift-');
  if (corkRules) parts.push(stripSeeAlso(corkRules));

  // Essence schema validation
  parts.push('\n## Essence Validation\n');
  parts.push(`Run \`npx decantr validate\` to check the Essence against the schema. Common violations:

- Missing \`version\` field — add semver string
- Page in code but not in \`structure\` — add to Essence
- Style mismatch between Essence and \`decantr.config.json\` — Essence is authoritative
- Blend references non-existent pattern — check registry
- Character traits don't match actual spacing — update Clarity profile`);

  // Pattern abstraction rules
  parts.push('\n## Pattern Abstraction Rules\n');
  parts.push(`- Patterns MUST be abstract from recipes and archetypes
- Recipe-to-pattern mapping is **top-down only**: recipe → pattern_overrides
- Never add recipe-specific logic to pattern JSON files
- Check if a new pattern can be a **preset** on an existing pattern before creating a new file
- Pattern presets differ only in content slots, label placement, or density — NOT in grid structure`);

  // Recipe/style boundary
  parts.push('\n## Recipe/Style Boundary\n');
  parts.push(`- Recipes and styles are fully abstracted plugins
- NEVER modify core pattern JSONs or the generate engine for recipe-specific visual concerns
- All recipe visual behavior lives in the style addon CSS (\`registerStyle({ components: '...' })\`)
- Recipe \`pattern_overrides\` in JSON only specify CSS class names to add — the actual CSS rules are in the style`);

  // Atom validation
  parts.push('\n## Atom Validation\n');
  parts.push(`- ALWAYS consult \`reference/atoms.md\` or the atom reference in this file before generating markup
- Never invent atom names — if an atom doesn't exist, use \`define()\` or bracket notation
- Escalation path: (1) Standard atom → (2) Bracket notation \`_w[32px]\` → (3) \`define()\` → (4) Propose to atoms.js
- Common invalid atoms: \`_flexCol\` (use \`_col\`), \`_flexRow\` (use \`_row\`), \`_textColor\` (use \`_fgfg\`)`);

  // Mandatory checklist
  parts.push('\n## Mandatory Reasoning Checklist\n');
  parts.push(`Before ANY code change, verify:

- [ ] **SCOPE** — Change is within the requested scope
- [ ] **LAYER** — Correct architectural layer (core/state/css → components → patterns)
- [ ] **CHAIN** — Import chain is valid (no circular deps)
- [ ] **EXISTING** — Checked for existing solutions before creating new ones
- [ ] **CONTRACT** — Component follows authoring contract (returns HTMLElement, named export)
- [ ] **TOKENS** — All values use design tokens (no hardcoded px/rem/colors)
- [ ] **CLEANUP** — Listeners/timers/observers wired to onDestroy
- [ ] **STYLE** — Matches Vintage in Essence
- [ ] **SPATIAL** — Follows Clarity profile from Character traits
- [ ] **CORK** — All 5 Cork rules pass
- [ ] **BOUQUET** — Colors use semantic tokens
- [ ] **FIELD** — Form components use field tokens`);

  // Essence-Config reconciliation
  parts.push('\n## Essence-Config Reconciliation\n');
  parts.push(`The Essence (\`decantr.essence.json\`) is authoritative. The config (\`decantr.config.json\`) is derived from it.

| Essence Field | Config Field |
|--------------|-------------|
| \`vintage.style\` | \`config.style\` |
| \`vintage.mode\` | \`config.mode\` |
| \`vessel.routing\` | \`config.router\` |

Essence always wins. If config diverges, update config to match.`);

  return parts.join('\n\n');
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validate(profiles, sources) {
  const issues = [];

  for (const [name, content] of Object.entries(profiles)) {
    const tokens = estimateTokens(content);
    const budget = TOKEN_BUDGETS[name];

    // Token budget check
    if (budget && tokens > budget) {
      issues.push({
        severity: 'WARN',
        profile: name,
        message: `Exceeds token budget: ${tokens} > ${budget} (${Math.round((tokens/budget-1)*100)}% over)`,
      });
    }

    // Check for unresolved cross-references
    const unresolvedRefs = content.match(/see\s+`?reference\/[a-z-]+\.md`?\s*§\d+/gi) || [];
    if (unresolvedRefs.length > 3) {
      issues.push({
        severity: 'INFO',
        profile: name,
        message: `${unresolvedRefs.length} unresolved cross-references remaining`,
      });
    }

    // Check for duplicate Clarity Profile table
    const clarityMatches = (content.match(/Clarity Profile/g) || []).length;
    if (clarityMatches > 3) {
      issues.push({
        severity: 'INFO',
        profile: name,
        message: `Clarity Profile mentioned ${clarityMatches} times — potential duplication`,
      });
    }

    // Check methodology preamble is present
    if (!content.includes('Methodology Preamble')) {
      issues.push({
        severity: 'ERROR',
        profile: name,
        message: 'Missing methodology preamble',
      });
    }

    // Check Cork Rules present
    if (!content.includes('Cork Rules')) {
      issues.push({
        severity: 'ERROR',
        profile: name,
        message: 'Missing Cork Rules section',
      });
    }
  }

  return issues;
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

function generateReport(profiles, issues, preambleTokens) {
  const lines = [];
  lines.push('╔══════════════════════════════════════════════════════════════╗');
  lines.push('║          Decantr LLM Task Profile Compilation Report       ║');
  lines.push('╚══════════════════════════════════════════════════════════════╝\n');

  // Profile sizes
  lines.push('Profile Sizes:');
  lines.push('┌─────────────────────┬──────────┬──────────┬──────────┬────────┐');
  lines.push('│ Profile             │ Lines    │ Chars    │ Tokens   │ Budget │');
  lines.push('├─────────────────────┼──────────┼──────────┼──────────┼────────┤');

  let totalTokens = 0;
  for (const [name, content] of Object.entries(profiles)) {
    const lineCount = content.split('\n').length;
    const chars = content.length;
    const tokens = estimateTokens(content);
    const budget = TOKEN_BUDGETS[name] || '—';
    const budgetStr = typeof budget === 'number' ? `${Math.round(tokens/budget*100)}%` : '—';
    totalTokens += tokens;
    lines.push(`│ ${name.padEnd(19)} │ ${String(lineCount).padStart(8)} │ ${String(chars).padStart(8)} │ ${String(tokens).padStart(8)} │ ${budgetStr.padStart(6)} │`);
  }
  lines.push('├─────────────────────┼──────────┼──────────┼──────────┼────────┤');
  lines.push(`│ TOTAL               │          │          │ ${String(totalTokens).padStart(8)} │        │`);
  lines.push(`│ Preamble (shared)   │          │          │ ${String(preambleTokens).padStart(8)} │        │`);
  lines.push('└─────────────────────┴──────────┴──────────┴──────────┴────────┘\n');

  // Comparison
  lines.push('Token Comparison (vs current architecture):');
  lines.push('┌────────────────────────────┬──────────┬──────────┬─────────┐');
  lines.push('│ Scenario                   │ Current  │ Compiled │ Savings │');
  lines.push('├────────────────────────────┼──────────┼──────────┼─────────┤');

  const scenarios = [
    ['Init new project', '122-240k', 'task-init'],
    ['Add page to project', '122-240k', 'task-page'],
    ['Modify a component', '122-240k', 'task-component'],
    ['Change style/theme', '122-240k', 'task-style'],
    ['Debug an issue', '122-240k', 'task-debug'],
    ['Refactor / fix drift', '122-240k', 'task-refactor'],
  ];

  for (const [scenario, current, profileName] of scenarios) {
    const tokens = estimateTokens(profiles[profileName] || '');
    const currentMid = 180000; // midpoint estimate
    const savings = `${Math.round((1 - tokens / currentMid) * 100)}%`;
    lines.push(`│ ${scenario.padEnd(26)} │ ${current.padStart(8)} │ ${String(tokens).padStart(8)} │ ${savings.padStart(7)} │`);
  }
  lines.push('└────────────────────────────┴──────────┴──────────┴─────────┘\n');

  // Issues
  if (issues.length > 0) {
    lines.push(`Issues (${issues.length}):`);
    for (const i of issues) {
      lines.push(`  [${i.severity}] ${i.profile}: ${i.message}`);
    }
    lines.push('');
  } else {
    lines.push('No issues found.\n');
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// CLAUDE.md dispatcher template
// ---------------------------------------------------------------------------

function generateDispatcher() {
  return `# Decantr v1.0 — AI-First Web Framework

## Before Any Code Change
1. Read \`decantr.essence.json\`
2. Read the task-specific context file below

## Context Files

| Task | File | Est. Tokens |
|------|------|-------------|
| Create new project | \`node_modules/decantr/llm/task-init.md\` | ~35-40k |
| Add/modify a page | \`node_modules/decantr/llm/task-page.md\` | ~20-25k |
| Create/modify component | \`node_modules/decantr/llm/task-component.md\` | ~20-25k |
| Change styles/themes | \`node_modules/decantr/llm/task-style.md\` | ~15-20k |
| Debug issues | \`node_modules/decantr/llm/task-debug.md\` | ~10-15k |
| Refactor / fix drift | \`node_modules/decantr/llm/task-refactor.md\` | ~10-15k |

## Cork Rules (Always Apply)
1. Style matches the Vintage
2. Page exists in the Structure
3. Layout follows the Blend
4. Composition follows the Recipe
5. Spacing follows the Clarity profile

## Framework Imports
\`\`\`js
import { tags } from 'decantr/tags';
import { h, text, cond, list, mount, onMount, onDestroy } from 'decantr/core';
import { createSignal, createEffect, createMemo, createStore, batch } from 'decantr/state';
import { createQuery, createMutation, queryClient } from 'decantr/data';
import { createRouter, link, navigate, useRoute } from 'decantr/router';
import { css, setStyle, setMode, registerStyle } from 'decantr/css';
import { Button, Input, Card, Modal, Tabs, Select, ... } from 'decantr/components';
import { Chart, Sparkline } from 'decantr/chart';
import { icon } from 'decantr/icons';
\`\`\`

## Commands
- \`npx decantr dev\` — Dev server with hot reload
- \`npx decantr build\` — Production build to \`dist/\`
- \`npx decantr test\` — Run tests
- \`npx decantr validate\` — Validate \`decantr.essence.json\`
- \`npx decantr compile-context\` — Regenerate LLM context profiles
`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);
  const reportMode = args.includes('--report');
  const checkOnly = args.includes('--check');
  const watchMode = args.includes('--watch');

  // Parse --only flag
  const onlyArg = args.find(a => a.startsWith('--only='));
  const onlyProfiles = onlyArg ? onlyArg.split('=')[1].split(',') : null;

  // Incremental cache check
  if (!checkOnly && !reportMode) {
    const currentHashes = computeSourceHashes();
    const combinedHash = createHash('md5').update(JSON.stringify(currentHashes)).digest('hex');
    const cache = loadCompileCache();

    if (cache && cache.buildHash === combinedHash) {
      // Verify output exists
      const allExist = Object.keys(TOKEN_BUDGETS).every(name =>
        fs.existsSync(path.join(OUT, `${name}.md`))
      );
      if (allExist) {
        console.log('No changes detected — skipping recompile (cached)');
        return;
      }
    }

    // Save hash for later
    var _currentHashes = currentHashes;
    var _combinedHash = combinedHash;
  }

  console.log('Loading sources...');
  const sources = await loadSourcesAsync();

  // Count what we loaded
  const refCount = Object.keys(sources.ref).length;
  const regCount = Object.keys(sources.reg).length;
  console.log(`  ${refCount} reference docs, ${regCount} registry files`);

  // Build preamble (shared across all profiles)
  console.log('Assembling methodology preamble...');
  const preamble = assemblePreamble(sources);
  const preambleTokens = estimateTokens(preamble);
  console.log(`  Preamble: ${preambleTokens} tokens (${preamble.split('\n').length} lines)`);

  // Profile builders map
  const profileBuilders = {
    'task-init':      () => buildTaskInit(sources, preamble),
    'task-page':      () => buildTaskPage(sources, preamble),
    'task-component': () => buildTaskComponent(sources, preamble),
    'task-style':     () => buildTaskStyle(sources, preamble),
    'task-debug':     () => buildTaskDebug(sources, preamble),
    'task-refactor':  () => buildTaskRefactor(sources, preamble),
  };

  // Build profiles (filtered by --only if specified)
  console.log('Building task profiles...');
  const profiles = {};
  const buildList = onlyProfiles
    ? Object.keys(profileBuilders).filter(k => onlyProfiles.includes(k))
    : Object.keys(profileBuilders);

  for (const name of buildList) {
    profiles[name] = profileBuilders[name]();
  }

  // Validate
  console.log('Validating...');
  const issues = validate(profiles, sources);

  // Report
  const report = generateReport(profiles, issues, preambleTokens);

  if (reportMode || checkOnly) {
    console.log('\n' + report);
  } else {
    // Summary
    for (const [name, content] of Object.entries(profiles)) {
      const tokens = estimateTokens(content);
      console.log(`  ${name}: ${tokens} tokens`);
    }
  }

  // Write output
  if (!checkOnly) {
    if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

    for (const [name, content] of Object.entries(profiles)) {
      const outPath = path.join(OUT, `${name}.md`);
      fs.writeFileSync(outPath, content, 'utf8');
    }
    console.log(`\nWrote ${Object.keys(profiles).length} profiles to llm/`);

    // Write dispatcher template (only when compiling all)
    if (!onlyProfiles) {
      const dispatcherPath = path.join(OUT, 'CLAUDE.md.template');
      fs.writeFileSync(dispatcherPath, generateDispatcher(), 'utf8');
      console.log('Wrote CLAUDE.md.template to llm/');
    }

    // Save cache
    if (_currentHashes && _combinedHash) {
      saveCompileCache(_currentHashes, _combinedHash);
    }
  }

  // Exit with error if validation found issues
  const errors = issues.filter(i => i.severity === 'ERROR');
  if (errors.length > 0) {
    console.error(`\n${errors.length} error(s) found. Fix before shipping.`);
    process.exit(1);
  }

  console.log('\nDone.');

  // Watch mode
  if (watchMode && !checkOnly) {
    console.log('\nWatching for changes...');
    const { watch } = await import('node:fs');
    const watchDirs = [REF, REG];
    for (const dir of watchDirs) {
      try {
        watch(dir, { recursive: true }, async (eventType, filename) => {
          if (!filename) return;
          console.log(`\n  [watch] ${eventType}: ${filename}`);
          // Re-run main without watch to avoid recursive watching
          const savedArgs = process.argv;
          process.argv = process.argv.filter(a => a !== '--watch');
          await main();
          process.argv = savedArgs;
        });
      } catch (e) {
        console.log(`  [warn] Watching not available for ${dir}: ${e.message}`);
      }
    }
    // Keep process alive
    setInterval(() => {}, 60000);
  }
}

// Exports for testing
export { parseSections, extractSection, estimateTokens, assemblePreamble, validate, loadSources, computeSourceHashes, loadCompileCache, saveCompileCache };

await main();
