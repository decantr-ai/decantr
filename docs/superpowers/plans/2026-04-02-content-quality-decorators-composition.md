# Content Quality Floor + Structured Decorators + Composition Algebra

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Zero content warnings, structured decorator definitions on all 20 themes (replacing CLI keyword heuristic), and composition algebra on 76 patterns with 3+ components.

**Architecture:** Content enrichment in decantr-content (JSON files), one CLI code change (delete heuristic + update rendering), skills update. GitHub Actions auto-syncs content to registry API on push.

**Tech Stack:** JSON content files, TypeScript CLI, Vitest

**Spec reference:** `docs/specs/2026-04-02-content-quality-decorators-composition-spec.md`

---

## File Map

### decantr-content
- Modify: 10 patterns missing `components` arrays
- Modify: ~40 patterns with short preset descriptions
- Modify: 20 themes (add `decorator_definitions`)
- Modify: 76 patterns (add `composition`)

### decantr-monorepo
- Modify: `packages/cli/src/scaffold.ts` — delete `generateDecoratorRule`, update `generateSectionContext` decorator rendering
- Modify: `packages/cli/src/treatments.ts` — remove decorator CSS generation loop
- Modify: `packages/cli/package.json` — bump to 1.6.2
- Modify: `~/.claude/skills/decantr-engineering/SKILL.md` — update
- Modify: `~/.claude/skills/decantr-engineering/harness.md` — update
- Modify: `.claude/skills/harness.md` — update

---

## Task 1: Fix 10 Missing Components Arrays

**Repo:** decantr-content
**Files:** `patterns/{ascii-chart,hotkey-bar,leaderboard,post-list,progress-bar,remote-cursor,split-pane,stats-bar,timeline,tool-list}.json`

- [ ] **Step 1: Read each pattern and add components array**

For each of the 10 patterns, read the file, examine its slots/presets/visual_brief, and add a `components` array listing all UI components it uses.

- [ ] **Step 2: Run validation**

```bash
cd /Users/davidaimi/projects/decantr-content && node validate.js 2>&1 | grep "missing or empty components"
```
Expected: 0 matches

- [ ] **Step 3: Commit**

```bash
git add patterns/ && git commit -m "fix: add components arrays to 10 patterns missing them"
```

---

## Task 2: Expand 61 Short Preset Descriptions

**Repo:** decantr-content
**Files:** ~40 pattern files with preset descriptions under 30 chars

- [ ] **Step 1: Get the full list of affected files and presets**

```bash
node validate.js 2>&1 | grep "description shorter than"
```

- [ ] **Step 2: Read each file and expand preset descriptions to 30+ chars**

Each description must describe the visual layout difference from the default. Transform short strings like `"Compact layout"` into meaningful descriptions like `"Compact single-row layout with inline actions and condensed spacing for dense data views"`.

- [ ] **Step 3: Run validation**

```bash
node validate.js 2>&1 | grep "WARN"
```
Expected: 0 warnings

- [ ] **Step 4: Commit**

```bash
git add patterns/ && git commit -m "fix: expand all preset descriptions to 30+ chars — zero quality warnings"
```

---

## Task 3: Author decorator_definitions for 10 Rich Themes

**Repo:** decantr-content
**Files:** `themes/{carbon,carbon-neon,auradecantism,terminal,luminarum,glassmorphism,studio,estate,paper,neon-cyber}.json`

These themes already have `decorators` with string descriptions. Promote each to structured `decorator_definitions`.

- [ ] **Step 1: For each theme, read the file and add decorator_definitions**

For every entry in `decorators`, create a corresponding entry in `decorator_definitions` with:
- `description` — copy from existing `decorators` string
- `intent` — write: when/why the AI should use this decorator
- `suggested_properties` — write: 3-5 key CSS properties with actual values (derived from the description and theme's palette)
- `pairs_with` — write: which other decorators in the same theme complement this one
- `usage` — write: 2-4 component types this applies to

Keep the original `decorators` field intact.

Decorator counts per theme:
- auradecantism: 17 decorators
- carbon-neon: 10 decorators
- carbon: 10 decorators
- estate: 14 decorators
- glassmorphism: 6 decorators
- luminarum: 11 decorators
- neon-cyber: 7 decorators
- paper: 11 decorators
- studio: 12 decorators
- terminal: 15 decorators

Total: 113 decorator definitions to author.

- [ ] **Step 2: Validate JSON**

```bash
node validate.js
```
Expected: 0 errors

- [ ] **Step 3: Commit**

```bash
git add themes/ && git commit -m "feat: add decorator_definitions to 10 rich themes (113 structured definitions)"
```

---

## Task 4: Author decorator_definitions for 10 Stub Themes

**Repo:** decantr-content
**Files:** `themes/{retro,dopamine,editorial,prismatic,bioluminescent,liquid-glass,neon-dark,launchpad,gaming-guild,clean}.json`

These themes have basic `decorators` strings added in Phase 6. Add `decorator_definitions` alongside.

- [ ] **Step 1: For each theme, add decorator_definitions**

Same structure as Task 3. Decorator counts:
- bioluminescent: 4 decorators
- clean: 5 decorators
- dopamine: 5 decorators
- editorial: 5 decorators
- gaming-guild: 8 decorators
- launchpad: 7 decorators
- liquid-glass: 4 decorators
- neon-dark: 4 decorators
- prismatic: 4 decorators
- retro: 5 decorators

Total: 51 decorator definitions to author.

- [ ] **Step 2: Validate and commit**

```bash
node validate.js && git add themes/ && git commit -m "feat: add decorator_definitions to 10 stub themes (51 structured definitions)"
```

---

## Task 5: CLI — Delete Heuristic, Update Decorator Rendering

**Repo:** decantr-monorepo
**Files:** `packages/cli/src/scaffold.ts`, `packages/cli/src/treatments.ts`

- [ ] **Step 1: Delete generateDecoratorRule function**

In `scaffold.ts`, find and delete the `generateDecoratorRule` function (~150 lines, approximately lines 750-905). This is the keyword-matching NLP engine.

- [ ] **Step 2: Remove decorator CSS generation from treatments.ts**

In `treatments.ts`, in the `generateTreatmentCSS` function, find the loop that iterates over `themeDecorators` and calls `generateDecoratorRule` for each one. Remove this loop. Replace the `@layer decorators` content with a comment:

```typescript
// @layer decorators — empty; AI generates decorator CSS from structured definitions
decoratorCss = `@layer decorators {\n  /* Decorator CSS is AI-generated from structured definitions in section context files. */\n  /* See .decantr/context/section-*.md for intent, suggested properties, and usage. */\n}\n`;
```

- [ ] **Step 3: Update generateSectionContext decorator rendering**

In `scaffold.ts`, in `generateSectionContext`, update the decorator rendering to prefer `decorator_definitions`:

```typescript
// Check if theme has structured decorator_definitions
if (input.themeData?.decorator_definitions && Object.keys(input.themeData.decorator_definitions).length > 0) {
  lines.push('**Theme decorators:**');
  lines.push('');
  lines.push('| Class | Intent | Key CSS | Pairs with |');
  lines.push('|-------|--------|---------|------------|');
  for (const [name, def] of Object.entries(input.themeData.decorator_definitions as Record<string, any>)) {
    const cssHints = def.suggested_properties
      ? Object.entries(def.suggested_properties).map(([k, v]: [string, any]) => `${k}: ${v}`).join('; ')
      : '';
    const pairs = def.pairs_with?.join(', ') || '';
    lines.push(`| \`.${name}\` | ${def.intent || def.description} | ${cssHints} | ${pairs} |`);
  }
  lines.push('');
  if (Object.values(input.themeData.decorator_definitions as Record<string, any>).some((d: any) => d.usage?.length)) {
    lines.push('**Decorator usage guide:**');
    for (const [name, def] of Object.entries(input.themeData.decorator_definitions as Record<string, any>)) {
      if (def.usage?.length) {
        lines.push(`- \`.${name}\`: ${(def.usage as string[]).join(', ')}`);
      }
    }
    lines.push('');
  }
} else if (decorators.length > 0) {
  // Fallback: old-style decorators with description table (already implemented)
  lines.push('**Theme decorators:**');
  lines.push('');
  lines.push('| Class | Usage |');
  lines.push('|-------|-------|');
  for (const d of decorators) {
    lines.push(`| \`.${d.name}\` | ${d.description} |`);
  }
  lines.push('');
} else {
  lines.push('**Theme decorators:** None defined for this theme.');
  lines.push('');
}
```

Also update the DECANTR.md decorator quick reference to use structured definitions when available:

```typescript
// In generateDecantrMdV31, update decorator table building
if (params.decoratorDefinitions && Object.keys(params.decoratorDefinitions).length > 0) {
  // Rich table from structured definitions
  for (const [name, def] of Object.entries(params.decoratorDefinitions)) {
    decoratorRows.push(`| \`.${name}\` | ${def.intent || def.description} |`);
  }
} else if (params.decorators?.length) {
  // Fallback to old format
  for (const d of params.decorators) {
    decoratorRows.push(`| \`.${d.name}\` | ${d.description} |`);
  }
}
```

Pass `decoratorDefinitions` from themeData through to the DECANTR.md generator.

- [ ] **Step 4: Run tests**

```bash
pnpm --filter decantr test -- --run
```
Expected: All pass. Some tests may need assertion updates for the empty @layer decorators block.

- [ ] **Step 5: Bump CLI version**

Change `packages/cli/package.json` version to `1.6.2`.

- [ ] **Step 6: Commit**

```bash
git add packages/cli/ && git commit -m "feat(cli): replace decorator heuristic with structured definitions — delete generateDecoratorRule"
```

---

## Task 6: Author Composition Algebra for 76 Patterns

**Repo:** decantr-content
**Files:** 76 pattern files (all patterns with 3+ components)

- [ ] **Step 1: Author composition expressions**

For each of the 76 patterns with 3+ components, read the file's `visual_brief`, `components`, and `slots`, then write a `composition` object expressing the component hierarchy.

Full list of patterns:
account-settings, activity-feed, agent-handoff-zone, agent-swarm-canvas, agent-timeline, api-key-row, block-toolbar, card-grid, chart-grid, chat-header, chat-message, chat-thread, checkout-flow, comment-thread, content-card-grid, content-detail-hero, content-feed, content-uploader, conversation-list, creator-profile, data-table, depth-layered-canvas, detail-header, doc-editor, document-vault, earnings-dashboard, expense-tracker, filter-bar, form, form-sections, generative-card-grid, holographic-control-bar, intent-radar, kpi-grid, lease-manager, maintenance-board, maintenance-ticket, moderation-queue-item, morphing-topology, nav-header, neural-feedback-loop, page-tree, payment-history, payout-settings, permission-matrix, pnl-dashboard, presence-avatars, pricing, pricing-usage, product-card, product-grid, property-card, property-detail, property-grid, rent-reminder, rent-roll, search-filter-bar, session-manager, share-modal, spatial-presence-ring, stats-overview, storefront-hero, subscriber-list, team-member-row, tenant-card, tenant-directory, tenant-payment-setup, testimonials, tier-builder, tier-card, tier-upgrade-card, unit-detail, unit-list, unlock-gate, vacancy-tracker, version-history

Grammar:
- `>` contains
- `[]` repeats
- `?` conditional
- `()` props/decorators
- `+` adjacent
- `a ? b : c` ternary

- [ ] **Step 2: Validate JSON**

```bash
node validate.js
```
Expected: 0 errors, 0 warnings

- [ ] **Step 3: Commit**

```bash
git add patterns/ && git commit -m "feat: add composition algebra to 76 patterns with 3+ components"
```

---

## Task 7: Push Both Repos and Verify

- [ ] **Step 1: Push decantr-content**

```bash
cd /Users/davidaimi/projects/decantr-content && git push origin main
```

GitHub Actions will auto-sync to registry API.

- [ ] **Step 2: Push decantr-monorepo**

```bash
cd /Users/davidaimi/projects/decantr-monorepo && git push origin main
```

- [ ] **Step 3: Verify GitHub Actions**

```bash
cd /Users/davidaimi/projects/decantr-content && gh run list --limit 1
```
Expected: `completed success`

- [ ] **Step 4: Regenerate agent-marketplace showcase**

```bash
cd /Users/davidaimi/projects/decantr-monorepo/apps/showcase/agent-marketplace
node ../../../packages/cli/dist/bin.js refresh
```

Verify:
- Section contexts show structured decorator table (Intent + Key CSS + Pairs with columns)
- Section contexts show composition algebra code blocks
- treatments.css has empty @layer decorators block with comment
- 0 warnings from validate.js

- [ ] **Step 5: Commit showcase regeneration**

```bash
cd /Users/davidaimi/projects/decantr-monorepo
git add apps/showcase/agent-marketplace/ && git commit -m "chore: regenerate showcase with structured decorators and composition algebra"
git push origin main
```

---

## Task 8: Update Skills

- [ ] **Step 1: Update decantr-engineering SKILL.md**

File: `~/.claude/skills/decantr-engineering/SKILL.md`

Update:
- CLI version: 1.6.2
- Content counts note: 0 quality warnings, all patterns have visual_brief, all themes have decorator_definitions, 76 patterns have composition
- Add to key design decisions: "Decorator CSS is AI-generated from structured definitions, not CLI-heuristic-generated. The @layer decorators block is empty in treatments.css."
- Remove any remaining reference to generateDecoratorRule or keyword heuristic
- Add `decorator_definitions` to the Theme interface in the Essence V3.1 section
- Add `composition` to the Pattern content description

- [ ] **Step 2: Update both harness.md files**

Files: `~/.claude/skills/decantr-engineering/harness.md` AND `/Users/davidaimi/projects/decantr-monorepo/.claude/skills/harness.md`

Update:
- Decorator audit now checks for structured definitions (Intent + Key CSS columns), not just description table
- Composition algebra coverage: check % of patterns with composition expressions
- @layer decorators should be empty (comment only) — flag if it contains generated CSS rules
- Update quality thresholds

- [ ] **Step 3: Commit project-level harness**

```bash
cd /Users/davidaimi/projects/decantr-monorepo
git add .claude/skills/harness.md && git commit -m "docs: update harness for structured decorators and composition algebra"
git push origin main
```

---

## Task 9: NPM Publish Reminder

After all tasks complete, inform user to publish:

```bash
cd /Users/davidaimi/projects/decantr-monorepo
pnpm --filter @decantr/cli build
cd packages/cli && pnpm publish --access public --tag latest && cd ../..
npm dist-tag add @decantr/cli@1.6.2 latest
```
