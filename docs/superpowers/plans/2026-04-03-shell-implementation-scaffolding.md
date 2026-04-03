# Shell Implementation Specs + Scaffolding Accelerators

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix shell layout collisions by passing full shell spatial data through the CLI pipeline, add Quick Start blocks, spacing guides, nesting anti-patterns, and css() API docs to generated context files.

**Architecture:** Enrich 13 shell JSON files with `internal_layout` in decantr-content. Expand `ShellInfo` in CLI to carry the data. Add three new generator functions (shell implementation, quick start, spacing guide). Update DECANTR.md template. Update registry Shell type. Update all docs and skills.

**Tech Stack:** TypeScript, Vitest, JSON content files, pnpm monorepo

**Spec:** `docs/specs/2026-04-03-shell-implementation-scaffolding-spec.md`

---

## File Map

### decantr-content
- Modify: 13 shell files in `shells/` — add `internal_layout`

### decantr-monorepo
- Modify: `packages/registry/src/types.ts:144-156` — Shell interface
- Modify: `packages/registry/package.json` — bump
- Modify: `packages/cli/src/scaffold.ts:2899-2920` — ShellInfo + SectionContextInput interfaces
- Modify: `packages/cli/src/scaffold.ts:~2590` — shell fetching in refreshDerivedFiles
- Modify: `packages/cli/src/scaffold.ts:~2950` — generateSectionContext rendering
- Modify: `packages/cli/src/scaffold.ts:~1284` — CSS_APPROACH_CONTENT constant
- Modify: `packages/cli/src/scaffold.ts:~1549` — DECANTR.md template generation
- Modify: `packages/cli/package.json` — bump to 1.7.0
- Modify: `CLAUDE.md`
- Modify: `README.md`
- Modify: `docs/css-scaffolding-guide.md`
- Modify: `.claude/skills/harness.md`
- Modify: `~/.claude/skills/decantr-engineering/SKILL.md`
- Modify: `~/.claude/skills/decantr-engineering/harness.md`

---

## Task 1: Add internal_layout to All 13 Shells

**Repo:** decantr-content
**Files:** All 13 files in `shells/`

- [ ] **Step 1: Read each shell file and add the `internal_layout` field**

For each of the 13 shells, read the file. Add an `internal_layout` object using semantic properties (NOT Tailwind classes). Use the existing `config` and `code.example` as reference for values.

The `internal_layout` uses this format:
```json
{
  "region_name": {
    "width": "240px",
    "height": "52px",
    "display": "flex",
    "direction": "column",
    "border": "right",
    "overflow_y": "auto",
    "padding": "0.5rem",
    "atoms": "_flex _col _borderR",
    "treatment": "d-interactive[ghost]",
    "gap": "2px",
    "note": "Prose description"
  }
}
```

Each shell's `internal_layout` is fully specified in the spec (Section 1.1 through 1.13). Use those exact definitions. Key shells:

**sidebar-main**: root (flex row, 100vh), sidebar (240px/64px collapsed, brand 52px, nav with groups/items/footer), main_wrapper (flex-1 col overflow-hidden), header (52px, breadcrumb + search), body (flex-1 overflow-y-auto p-6)

**centered**: root (flex center min-h-screen), body (max-w 28rem auth / 36rem wide, d-surface)

**top-nav-footer**: root (flex col min-h-screen), header (52px sticky, brand + nav links + CTA, hamburger ONLY below md), body (flex-1, no padding, sections own spacing), footer (border-top, mt-auto)

- [ ] **Step 2: Validate**

```bash
cd /Users/davidaimi/projects/decantr-content && node validate.js
```
Expected: 0 errors, 0 warnings

- [ ] **Step 3: Commit and push**

```bash
git add shells/ && git commit -m "feat: add internal_layout to all 13 shells — semantic spatial specs for AI context" && git push origin main
```

---

## Task 2: Update Registry Shell Type

**Repo:** decantr-monorepo
**Files:** `packages/registry/src/types.ts:144-156`, `packages/registry/package.json`

- [ ] **Step 1: Add internal_layout to Shell interface**

In `packages/registry/src/types.ts`, find the Shell interface (line 144) and add:

```typescript
export interface Shell {
  id: string;
  name: string;
  description?: string;
  root?: string;
  nav?: string;
  header?: string;
  nav_style?: string;
  dimensions?: {
    navWidth?: string;
    headerHeight?: string;
  };
  // NEW
  internal_layout?: Record<string, any>;
  layout?: string;
  atoms?: string;
  config?: Record<string, any>;
  guidance?: Record<string, string>;
  code?: { imports?: string; example?: string };
}
```

- [ ] **Step 2: Bump version**

Change `packages/registry/package.json` version to `1.0.0-beta.12`.

- [ ] **Step 3: Build and test**

```bash
pnpm --filter @decantr/registry build && pnpm --filter @decantr/registry test -- --run
```

- [ ] **Step 4: Commit**

```bash
git add packages/registry/ && git commit -m "feat(registry): add internal_layout, config, guidance to Shell type — bump to 1.0.0-beta.12"
```

---

## Task 3: Expand ShellInfo + SectionContextInput in CLI

**Repo:** decantr-monorepo
**File:** `packages/cli/src/scaffold.ts`

- [ ] **Step 1: Expand ShellInfo interface (line 2899)**

```typescript
export interface ShellInfo {
  description: string;
  regions: string[];
  layout?: string;
  guidance?: Record<string, string>;
  // NEW
  atoms?: string;
  config?: {
    grid?: { areas?: string[][] };
    nav?: { position?: string; width?: string; collapseTo?: string; collapseBelow?: string; defaultState?: string };
    header?: { height?: string; sticky?: boolean };
    body?: { scroll?: boolean; inputAnchored?: boolean };
    footer?: { height?: string; sticky?: boolean };
  };
  internal_layout?: Record<string, any>;
}
```

- [ ] **Step 2: Add voiceTone to SectionContextInput (line 2906)**

```typescript
export interface SectionContextInput {
  // ...all existing fields...
  voiceTone?: string;  // NEW — first sentence of voice.tone for Quick Start
}
```

- [ ] **Step 3: Update shell fetching in refreshDerivedFiles (~line 2590)**

Find the block that builds `shellInfoCache`. Update to extract all new fields:

```typescript
shellInfoCache[shellId] = {
  description: (inner.description as string) || '',
  regions: (inner.config?.regions as string[]) || [],
  layout: (inner.layout as string) || undefined,
  guidance: (inner.guidance as Record<string, string>) || undefined,
  atoms: (inner.atoms as string) || undefined,
  config: inner.config || undefined,
  internal_layout: inner.internal_layout || undefined,
};
```

- [ ] **Step 4: Pass voiceTone to generateSectionContext calls**

Find both calls to `generateSectionContext` (~lines 2636 and 2743). Add:

```typescript
voiceTone: storedVoice?.tone ? storedVoice.tone.split('.')[0] + '.' : undefined,
```

- [ ] **Step 5: Run tests**

```bash
pnpm --filter decantr test -- --run
```

- [ ] **Step 6: Commit**

```bash
git add packages/cli/src/scaffold.ts && git commit -m "feat(cli): expand ShellInfo with config, internal_layout, atoms; add voiceTone to SectionContextInput"
```

---

## Task 4: Implement Three New Generator Functions

**Repo:** decantr-monorepo
**File:** `packages/cli/src/scaffold.ts`

- [ ] **Step 1: Add generateShellImplementation function**

Add before `generateSectionContext`:

```typescript
function generateShellImplementation(shellId: string, shellInfo: ShellInfo): string[] {
  const lines: string[] = [];
  lines.push(`## Shell Implementation: ${shellId}`);
  lines.push('');

  if (!shellInfo.internal_layout) {
    // Fallback for shells without internal_layout
    lines.push(`**Layout:** ${shellInfo.layout || 'flex'}`);
    if (shellInfo.atoms) lines.push(`**Container:** \`${shellInfo.atoms}\``);
    lines.push(`**Regions:** ${shellInfo.regions.join(', ')}`);
    if (shellInfo.config?.nav?.width)
      lines.push(`**Nav:** ${shellInfo.config.nav.width} (collapsed: ${shellInfo.config.nav.collapseTo || 'n/a'})`);
    if (shellInfo.config?.header?.height)
      lines.push(`**Header:** ${shellInfo.config.header.height}${shellInfo.config.header.sticky ? ' sticky' : ''}`);
    lines.push('');
    return lines;
  }

  for (const [region, props] of Object.entries(shellInfo.internal_layout as Record<string, any>)) {
    const label = region.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());

    // Check if this is a nested object (sub-region) or a flat property
    if (typeof props === 'object' && !Array.isArray(props)) {
      lines.push(`**${label}:**`);
      for (const [key, value] of Object.entries(props as Record<string, any>)) {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          // Nested sub-region (e.g., sidebar.brand, sidebar.nav)
          const subLabel = key.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
          lines.push(`- **${subLabel}:**`);
          for (const [sk, sv] of Object.entries(value as Record<string, string>)) {
            if (sk === 'note') {
              lines.push(`  - ${sv}`);
            } else {
              const prettyKey = sk.replace(/_/g, ' ');
              lines.push(`  - ${prettyKey}: \`${sv}\``);
            }
          }
        } else if (key === 'note') {
          lines.push(`- ${value}`);
        } else if (key === 'atoms' || key === 'treatment') {
          lines.push(`- ${key}: \`${value}\``);
        } else {
          const prettyKey = key.replace(/_/g, ' ');
          lines.push(`- ${prettyKey}: \`${value}\``);
        }
      }
      lines.push('');
    }
  }

  // Anti-patterns
  lines.push('**Anti-patterns:**');
  lines.push('- Never put overflow-y-auto on anything except designated scroll regions');
  lines.push('- Never nest d-surface inside shell frame regions (sidebar, header)');
  lines.push('- Never add a wrapper div around the page outlet — body IS the content container');
  if (shellInfo.config?.nav?.collapseTo) {
    lines.push(`- Collapsed sidebar: ${shellInfo.config.nav.collapseTo} wide, icons only, text hidden`);
  }
  if (shellInfo.config?.nav?.collapseBelow) {
    lines.push(`- Collapse breakpoint: ≤${shellInfo.config.nav.collapseBelow}. Full nav above, collapsed/hidden below.`);
  }
  lines.push('');
  return lines;
}
```

- [ ] **Step 2: Add generateQuickStart function**

```typescript
function generateQuickStart(input: SectionContextInput): string[] {
  const lines: string[] = [];
  lines.push('## Quick Start');
  lines.push('');

  // Shell summary
  const shell = input.section.shell as string;
  const si = input.shellInfo;
  let shellDesc = shell;
  if (si?.config?.nav?.width) shellDesc += ` (${si.config.nav.width} sidebar`;
  if (si?.config?.header?.height) shellDesc += `, ${si.config.header.height} header`;
  if (si?.config?.nav?.width) shellDesc += ')';
  lines.push(`- **Shell:** ${shellDesc}`);

  // Pages
  const pageIds = input.section.pages.map(p => p.id);
  lines.push(`- **Pages:** ${pageIds.length} — ${pageIds.join(', ')}`);

  // Key patterns
  const entries = Object.entries(input.patternSpecs);
  const hints: string[] = [];
  for (const [name, spec] of entries) {
    const count = spec.components?.length || 0;
    if (count >= 8) hints.push(`${name} (complex)`);
    else if (count >= 4) hints.push(`${name} (moderate)`);
  }
  if (hints.length > 0) lines.push(`- **Key patterns:** ${hints.slice(0, 5).join(', ')}`);

  // CSS
  const cssClasses: string[] = [];
  if (input.decorators.length > 0) cssClasses.push(...input.decorators.slice(0, 3).map(d => d.name));
  const pLower = input.personality.join(' ').toLowerCase();
  if (pLower.includes('neon') || pLower.includes('glow')) cssClasses.push('neon-glow');
  if (pLower.includes('mono')) cssClasses.push('mono-data');
  if (pLower.includes('status') || pLower.includes('ring')) cssClasses.push('status-ring');
  if (cssClasses.length > 0) lines.push(`- **CSS:** ${cssClasses.join(', ')} + base treatments`);

  // Density
  const density = (input.section.dna_overrides as any)?.density || 'comfortable';
  lines.push(`- **Density:** ${density}`);

  // Voice
  if (input.voiceTone) lines.push(`- **Voice:** ${input.voiceTone}`);

  lines.push('');
  return lines;
}
```

- [ ] **Step 3: Add generateSpacingGuide function**

Import `computeSpatialTokens` from essence-spec (check if it's already imported, if not add the import):

```typescript
import { computeSpatialTokens } from '@decantr/essence-spec';
// or if the import path is different, check existing imports in scaffold.ts
```

Then add:

```typescript
function generateSpacingGuide(density: string): string[] {
  const lines: string[] = [];
  const level = (density === 'compact' || density === 'spacious') ? density : 'comfortable';
  const tokens = computeSpatialTokens(level as any);

  lines.push(`## Spacing Guide (${level} density)`);
  lines.push('');
  lines.push('| Context | Token | Value | Usage |');
  lines.push('|---------|-------|-------|-------|');
  lines.push(`| Content gap | --d-content-gap | ${tokens['--d-content-gap']} | Between sibling content blocks |`);
  lines.push(`| Section padding | --d-section-py | ${tokens['--d-section-py']} | Vertical space between page sections |`);
  lines.push(`| Surface padding | --d-surface-p | ${tokens['--d-surface-p']} | Inside d-surface cards |`);
  lines.push(`| Interactive | --d-interactive-py / px | ${tokens['--d-interactive-py']} / ${tokens['--d-interactive-px']} | Buttons, nav items |`);
  lines.push(`| Control | --d-control-py | ${tokens['--d-control-py']} | Form inputs |`);
  lines.push(`| Data cell | --d-data-py | ${tokens['--d-data-py']} | Table cells |`);
  lines.push('');
  lines.push('Use `var(--d-*)` tokens for density-responsive spacing. Use atoms for fixed layout structure.');
  lines.push('');
  return lines;
}
```

- [ ] **Step 4: Run tests**

```bash
pnpm --filter decantr test -- --run
```

- [ ] **Step 5: Commit**

```bash
git add packages/cli/src/scaffold.ts && git commit -m "feat(cli): add generateShellImplementation, generateQuickStart, generateSpacingGuide"
```

---

## Task 5: Wire New Functions Into generateSectionContext

**Repo:** decantr-monorepo
**File:** `packages/cli/src/scaffold.ts`

- [ ] **Step 1: Update generateSectionContext to use new functions**

Find `generateSectionContext` (line 2950). After the header block (lines ~2955-2958), insert the new blocks and reorganize:

```typescript
export function generateSectionContext(input: SectionContextInput): string {
  const { section, decorators, guardConfig, personality, themeName, zoneContext, patternSpecs, themeHints, constraints, shellInfo } = input;
  const lines: string[] = [];

  // Header (keep existing)
  lines.push(`# Section: ${section.id}`);
  lines.push('');
  lines.push(`**Role:** ${section.role} | **Shell:** ${section.shell} | **Archetype:** ${section.id}`);
  lines.push(`**Description:** ${section.description}`);
  lines.push('');

  // NEW: Quick Start
  lines.push(...generateQuickStart(input));

  // NEW: Shell Implementation (replaces old shell one-liner)
  if (shellInfo) {
    lines.push(...generateShellImplementation(section.shell as string, shellInfo));
  }

  // KEEP: Shell Notes (existing behavioral guidance)
  if (shellInfo?.guidance && Object.keys(shellInfo.guidance).length > 0) {
    // ...existing shell notes code...
  }

  // NEW: Spacing Guide
  const density = (section.dna_overrides as any)?.density || 'comfortable';
  lines.push(...generateSpacingGuide(density));

  // KEEP: Everything else (guard config, token palette, decorators, visual direction, etc.)
  // ...rest of existing function unchanged...
```

Remove the old shell rendering that produced just:
```
**Shell structure:** ...description...
**Regions:** ...region list...
```

These are now replaced by the shell implementation block.

- [ ] **Step 2: Run tests — fix any assertion changes**

```bash
pnpm --filter decantr test -- --run
```

Some tests may assert on the old shell structure text. Update assertions to match the new Quick Start, Shell Implementation, and Spacing Guide blocks.

- [ ] **Step 3: Commit**

```bash
git add packages/cli/ && git commit -m "feat(cli): wire Quick Start, Shell Implementation, Spacing Guide into generateSectionContext"
```

---

## Task 6: Update DECANTR.md Template

**Repo:** decantr-monorepo
**File:** `packages/cli/src/scaffold.ts`

- [ ] **Step 1: Add responsive/pseudo examples to CSS_APPROACH_CONTENT**

Find `CSS_APPROACH_CONTENT` (~line 1284). Find the existing `css()` usage example and append:

```typescript
// After existing css() example, add:
`
// Responsive prefix — applies at breakpoint and above:
css('_col sm:_row')        // column on mobile, row from sm+

// Pseudo prefix:
css('hover:_opacity80')    // opacity on hover
`
```

Merge into the existing block, don't create a duplicate section.

- [ ] **Step 2: Add nesting anti-patterns after treatment class table**

Find where the treatment class table ends in `CSS_APPROACH_CONTENT`. After it, add:

```typescript
`
### Layout Rules

1. **Never nest d-surface inside d-surface.** Inner sections use plain containers with padding atoms.
2. **Shell regions are frames, not surfaces.** Sidebar and header use var(--d-surface) or var(--d-bg) directly. Apply d-surface only to content cards within the body region.
3. **One scroll container per region.** Body has overflow-y-auto. Sidebar nav has its own overflow-y-auto. Never nest additional scrollable wrappers.
4. **d-section spacing is self-contained.** Each d-section owns its padding. The d-section + d-section rule adds a separator. Do NOT add extra margin between adjacent sections.
5. **Responsive nav rules.** Hamburger menus appear ONLY below the shell's collapse breakpoint. Full nav shows above it.
`
```

- [ ] **Step 3: Run tests**

```bash
pnpm --filter decantr test -- --run
```

- [ ] **Step 4: Commit**

```bash
git add packages/cli/src/scaffold.ts && git commit -m "feat(cli): add css() responsive/pseudo examples and nesting anti-patterns to DECANTR.md"
```

---

## Task 7: Bump CLI Version + Full Build/Test

**Repo:** decantr-monorepo

- [ ] **Step 1: Bump CLI to 1.7.0**

Change `packages/cli/package.json` version to `1.7.0`.

- [ ] **Step 2: Full build and test**

```bash
pnpm build && pnpm test
```

- [ ] **Step 3: Commit**

```bash
git add packages/cli/package.json && git commit -m "chore: bump CLI to 1.7.0 — shell implementation specs"
```

---

## Task 8: Update All Documentation

**Repo:** decantr-monorepo

- [ ] **Step 1: Update CLAUDE.md**

Add under the existing sections:
- Shell implementation specs: mention that section contexts now include full spatial layout for each shell
- Quick Start blocks: mention new summary at top of section contexts
- Spacing guide: mention computed density-aware spacing table
- Nesting anti-patterns: reference the 5 rules in DECANTR.md
- Update CLI version to 1.7.0
- Update registry version to 1.0.0-beta.12
- Add shell `internal_layout` field to Content Architecture section

- [ ] **Step 2: Update docs/css-scaffolding-guide.md**

Add a "Shell Spatial Guidance" section documenting:
- Shell `internal_layout` format
- How shells provide region dimensions and internal spacing
- Nesting rules (same 5 rules as DECANTR.md)

- [ ] **Step 3: Update README.md**

Verify README.md reflects current state:
- CLI version 1.7.0
- Registry version 1.0.0-beta.12
- Content highlights: 116 patterns (visual_brief, composition, motion, responsive, a11y), 20 themes (decorator_definitions), 13 shells (internal_layout), 19 blueprints (personality, voice)
- Mention shell implementation specs as a feature

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md docs/css-scaffolding-guide.md README.md && git commit -m "docs: update CLAUDE.md, CSS guide, README for shell implementation specs and v1.7.0"
```

---

## Task 9: Update Skills

- [ ] **Step 1: Update ~/.claude/skills/decantr-engineering/SKILL.md**

- CLI version: 1.7.0
- Registry version: 1.0.0-beta.12
- Three-tier context model: section contexts now include Shell Implementation block (full spatial layout with anti-patterns), Quick Start block, Spacing Guide table
- Key design decisions: add "Shell `internal_layout` provides semantic spatial specs. The AI translates these to framework-appropriate code. No Tailwind coupling."
- Anti-patterns: add "Tailwind-specific classes in shell specs — use semantic properties + Decantr atoms"
- Theme.shell interaction: add "Theme spatial hints influence visual treatment, not shell structure. Shell `internal_layout` takes precedence for layout."
- Content types: update shells description to mention `internal_layout`

- [ ] **Step 2: Update both harness.md files**

Update both `~/.claude/skills/decantr-engineering/harness.md` AND `/Users/davidaimi/projects/decantr-monorepo/.claude/skills/harness.md`:

- Add shell implementation block validation: check for region dimensions, anti-patterns section, scroll container designation
- Add Quick Start block presence check
- Add Spacing Guide table presence check (with computed values, not hardcoded)
- Add nesting anti-patterns check in DECANTR.md
- Update quality scoring to include shell spatial completeness

- [ ] **Step 3: Commit project-level harness**

```bash
git add .claude/skills/harness.md && git commit -m "docs: update harness for shell implementation specs, Quick Start, spacing guide"
```

---

## Task 10: Push Both Repos

- [ ] **Step 1: Push decantr-monorepo**

```bash
git push origin main
```

- [ ] **Step 2: Verify decantr-content auto-synced**

```bash
cd /Users/davidaimi/projects/decantr-content && gh run list --limit 1
```
Expected: `completed success`

- [ ] **Step 3: Regenerate agent-marketplace showcase**

```bash
cd /Users/davidaimi/projects/decantr-monorepo
pnpm --filter @decantr/cli build
cd apps/showcase/agent-marketplace && node ../../../packages/cli/dist/bin.js refresh
```

- [ ] **Step 4: Verify output**

Check section-agent-orchestrator.md for:
- Quick Start block at top
- Shell Implementation: sidebar-main with region dimensions and anti-patterns
- Spacing Guide table with computed values

- [ ] **Step 5: Commit and push showcase**

```bash
cd /Users/davidaimi/projects/decantr-monorepo
git add apps/showcase/agent-marketplace/ && git commit -m "chore: regenerate showcase with shell implementation specs" && git push origin main
```

---

## Task 11: Integration Test — Fresh Scaffold in /tmp

- [ ] **Step 1: Build and publish CLI**

User runs:
```bash
cd /Users/davidaimi/projects/decantr-monorepo
pnpm --filter @decantr/cli build
cd packages/cli && pnpm publish --access public --tag latest
```

Also publish registry:
```bash
cd /Users/davidaimi/projects/decantr-monorepo
cd packages/registry && pnpm publish --access public --tag latest
```

- [ ] **Step 2: Fresh scaffold**

```bash
mkdir /tmp/decantr-shell-test && cd /tmp/decantr-shell-test
npx @decantr/cli@1.7.0 init --blueprint=agent-marketplace --yes
```

- [ ] **Step 3: Run harness prompt in a fresh Claude Code session**

```
Run the decantr harness against the agent-marketplace blueprint in this directory.
Verify: shell implementation blocks with region dimensions, Quick Start at top of each section,
spacing guide with computed values, nesting anti-patterns in DECANTR.md, css() responsive examples.
Report the full scorecard. Target: ≥95/100.
```
