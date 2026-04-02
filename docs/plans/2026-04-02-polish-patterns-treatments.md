# Pattern Enrichment + Treatment Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 26 visual issues identified by harness + user review. Enrich 7 patterns in registry, refine treatments, add atoms, update DECANTR.md generic guidance, absorb personality-derived CSS into framework. Then re-scaffold + harness.

**Architecture:** Pattern specs in decantr-content get richer structural guidance (layout direction, container hints, component relationships). Treatment system gets density-aware section spacing, better dividers, cursor fix, override fix. @decantr/css gets atoms for common inline style patterns. DECANTR.md stays generic — all specific guidance lives in pattern specs and section contexts.

**Tech Stack:** JSON content files, TypeScript, CSS, Vitest

**Key principle:** DECANTR.md template contains ZERO specific logic about any blueprint, archetype, or pattern. It's the universal methodology. Pattern specs in the registry carry structural specifics.

---

## Phase 1: Pattern Content Enrichment (decantr-content)

### Task 1: Enrich hero pattern

**Files:**
- Modify: `/Users/davidaimi/projects/decantr-content/patterns/hero.json`

The `hero` pattern needs better slot descriptions so the LLM doesn't render meaningless data widgets in the visual proof area.

- [ ] **Step 1: Read current hero pattern**

Read `/Users/davidaimi/projects/decantr-content/patterns/hero.json` and understand its current structure (components, presets, slots).

- [ ] **Step 2: Update the pattern**

Add/update these fields in the pattern's structural spec:

**Components:** Ensure the components list includes: `HeroHeading`, `HeroSubtitle`, `HeroCTA`, `HeroVisual` (or similar names).

**Slot descriptions for the visual proof area** — add or update the `layout.slots` for the default/standard preset:

```json
"visual": {
  "description": "Ambient visual element below CTAs. NOT a data widget. Use: animated gradient mesh, particle effect, blurred screenshot, or subtle background illustration. If showing product data (agents, metrics), render as a floating ambient visualization — not wrapped in a card. Omit entirely if no meaningful visual is available.",
  "required": false
}
```

**Layout guidance** — add to the pattern's top-level description or a `layout_hints` field:
- "Hero sections should NOT wrap sub-elements in d-surface cards. The hero IS the section — it needs breathing room, not containment."
- "Subtitle line-height: use 1.6-1.8 for readability. Subtitle should be visually lighter than heading (text-muted color, smaller font)."
- "CTA buttons should have equal padding. Primary is filled, secondary is ghost — both same size."
- "Announcement badge (if present): use d-annotation with prominent styling, not a tiny muted pill."

- [ ] **Step 3: Validate and commit**

```bash
node validate.js
git add patterns/hero.json
git commit -m "feat(patterns): enrich hero with visual proof and layout guidance"
```

---

### Task 2: Enrich how-it-works pattern

**Files:**
- Modify: `/Users/davidaimi/projects/decantr-content/patterns/how-it-works.json` (or similar — check actual filename)

- [ ] **Step 1: Find and read the pattern**

Search for the how-it-works or steps pattern:
```bash
ls patterns/ | grep -i "how\|step\|process"
```

- [ ] **Step 2: Update the pattern**

Add layout guidance:

```json
"layout_hints": {
  "direction": "horizontal",
  "note": "For 3-5 steps, use a horizontal layout with connecting arrows or lines between numbered circles. Center-aligned within the section. For 6+ steps, use a 2-column or 3-column grid. Never use a left-aligned vertical list for ≤5 steps — it creates visual imbalance.",
  "step_connector": "Use a horizontal line or arrow between step circles. The line should be subtle (border-color at 50% opacity).",
  "step_circle": "Numbered circle with accent border. 40-48px diameter. Number centered inside.",
  "alignment": "center"
}
```

Also update slot descriptions:
- Step title: bold, above or beside the step circle
- Step description: muted text below title, max 2 lines

- [ ] **Step 3: Validate and commit**

```bash
node validate.js
git add patterns/
git commit -m "feat(patterns): enrich how-it-works with horizontal layout guidance"
```

---

### Task 3: Enrich agent-swarm-canvas pattern

**Files:**
- Modify: `/Users/davidaimi/projects/decantr-content/patterns/agent-swarm-canvas.json`

- [ ] **Step 1: Read and update the pattern**

Add structural guidance:

```json
"container": "borderless",
"layout_hints": {
  "note": "This is a full-bleed visualization. Do NOT wrap in a d-surface card. The canvas IS the content area — agent nodes float freely within it.",
  "node_interaction": "Each agent node must have cursor: pointer. Use d-surface[data-interactive] for node cards. Clicking a node navigates to agent detail.",
  "metrics": "Display agent metrics with labeled text, not icon-only. Example: 'Requests: 142 | Latency: 120ms' — not '⚡ 142 ⬇ 120ms'. Icons without labels are unparseable.",
  "status_consistency": "All status badges must render consistently using d-annotation[data-status]. Always include a status dot (colored circle) prefix for visual scanning.",
  "error_escalation": "Agents with error status should have a subtle red border glow on their node card: box-shadow: 0 0 12px color-mix(in srgb, var(--d-error) 25%, transparent)."
}
```

- [ ] **Step 2: Validate and commit**

```bash
node validate.js
git add patterns/agent-swarm-canvas.json
git commit -m "feat(patterns): enrich agent-swarm-canvas with borderless container and interaction guidance"
```

---

### Task 4: Enrich agent-timeline pattern

**Files:**
- Modify: `/Users/davidaimi/projects/decantr-content/patterns/agent-timeline.json`

- [ ] **Step 1: Read and update the pattern**

Add structural guidance for the timeline visual treatment:

```json
"layout_hints": {
  "vertical_line": "A continuous 2px vertical line runs the full height of the timeline, positioned 16px from the left edge. Color: var(--d-border). The line connects all events visually — it should not have gaps between events.",
  "orb": "Each event has a 12px diameter circle (orb) centered on the vertical line. The orb is position: absolute, centered vertically with the first line of the event's text (the badge/timestamp row). Orb color matches the event type.",
  "event_type_colors": "Each event type should have a distinct color. Avoid duplicates. Suggested mapping: action=cyan (--d-accent), decision=green (--d-success), error=red (--d-error), warning=amber (--d-warning), info=blue (--d-info), tool_call=purple, reasoning=amber. At minimum, no two types should share the same color.",
  "spacing": "Events should have compact spacing (gap-3 or gap-4, not gap-6+). Dense timelines are easier to scan.",
  "badge_size": "Event type badges (ACTION, DECISION, etc.) should use d-annotation with enough padding to be scannable at speed. Font size 0.7rem minimum."
}
```

- [ ] **Step 2: Validate and commit**

```bash
node validate.js
git add patterns/agent-timeline.json
git commit -m "feat(patterns): enrich agent-timeline with connected line, orb alignment, and color mapping"
```

---

### Task 5: Enrich form-sections pattern

**Files:**
- Modify: `/Users/davidaimi/projects/decantr-content/patterns/form-sections.json`

- [ ] **Step 1: Read and update the pattern**

Add layout guidance to fix the labels-miles-from-fields problem:

```json
"layout_hints": {
  "label_position": "stacked",
  "note": "Labels go ABOVE their field, not side-by-side. Stacked layout prevents the label-field gap problem at wide viewports. Use: label (uppercase, small, muted) → field (full width within its column) → next row.",
  "max_width": "Form content should be constrained to max-width 40rem (640px). Forms that span 100% viewport width are hard to read.",
  "sections": "Group related fields under section headers. Use a single d-surface card for the entire form, OR no card at all — do NOT wrap each section in its own card. Section headers are inline (icon + heading + description), not card titles.",
  "icon_placement": "Section icons render inline-left of the section heading text, not floating outside the container. Use a 20px icon vertically centered with the heading.",
  "select_styling": "Apply d-control to ALL form elements including <select>. Add appearance: none and a custom chevron for consistent styling across browsers.",
  "textarea_hint": "Textareas should have a visible min-height (6rem+) to differentiate from single-line inputs."
}
```

- [ ] **Step 2: Validate and commit**

```bash
node validate.js
git add patterns/form-sections.json
git commit -m "feat(patterns): enrich form-sections with stacked layout, max-width, and section grouping"
```

---

### Task 6: Enrich settings-nav pattern + generative-card-grid

**Files:**
- Modify: `/Users/davidaimi/projects/decantr-content/patterns/settings-nav.json` (or find actual filename)
- Modify: `/Users/davidaimi/projects/decantr-content/patterns/generative-card-grid.json` (or similar)

- [ ] **Step 1: Update settings-nav**

Add guidance about sidebar tab navigation for settings pages:
- Tab/nav items use d-interactive
- Active tab has accent left border or background highlight
- Content area scrolls independently of the nav

- [ ] **Step 2: Update generative-card-grid**

Add guidance about filter/tab interaction:
```json
"layout_hints": {
  "filtering": "If filter tabs or category pills are shown, they MUST be functional — clicking a tab filters the grid content. Use React state to filter the card array. Do not render non-functional filter UI.",
  "empty_state": "When filters produce 0 results, show an empty state with icon + message + 'Clear filters' CTA."
}
```

- [ ] **Step 3: Validate and commit**

```bash
node validate.js
git add patterns/
git commit -m "feat(patterns): enrich settings-nav and generative-card-grid with interaction guidance"
```

---

### Task 7: Add general pattern guidance for empty states, labels, breadcrumbs

Some issues are cross-pattern: empty states, section label styling, breadcrumbs, page transitions. These belong in the **shell** specs and the scaffold.md context generation — NOT in DECANTR.md (which stays generic).

**Files:**
- Modify: `/Users/davidaimi/projects/decantr-content/shells/sidebar-main.json`
- Modify: `/Users/davidaimi/projects/decantr-content/shells/top-nav-footer.json`
- Modify: CLI scaffold.md generation (monorepo)

- [ ] **Step 1: Update sidebar-main shell**

Add guidance about sidebar behavior and shell-specific patterns:

```json
"guidance": {
  "hotkeys": "Navigation hotkeys (if defined in essence) are keyboard shortcuts — implement as useEffect keydown listeners. Do NOT render hotkey text in the sidebar UI.",
  "collapse_button": "Sidebar collapse toggle should be integrated into the sidebar header (next to the brand), not floating at the bottom.",
  "breadcrumbs": "For nested routes (e.g., /agents/:id), show a breadcrumb above the page heading: 'Agents > CodeGen Alpha'.",
  "section_labels": "Dashboard section labels (SWARM TOPOLOGY, ACTIVITY FEED) should be uppercase monospace with a 2px left accent border for visual anchoring: border-left: 2px solid var(--d-accent); padding-left: 0.5rem.",
  "empty_states": "When a section has zero data, show an empty state: centered icon (48px, muted) + message + optional CTA button.",
  "page_transitions": "Apply the theme entrance animation class to the main content area for smooth page transitions."
}
```

- [ ] **Step 2: Update top-nav-footer shell**

Add guidance about marketing section spacing and labels:

```json
"guidance": {
  "section_spacing": "Marketing sections use spacious density. Each d-section should have generous padding (var(--d-section-py) at the spacious scale).",
  "section_labels": "Section overline labels (CAPABILITIES, HOW IT WORKS) should be uppercase, small, monospace, accent-colored, center-aligned, with letter-spacing: 0.1em."
}
```

- [ ] **Step 3: Update scaffold.md generation in CLI**

In `packages/cli/src/scaffold.ts`, the `generateScaffoldContext()` function should emit shell guidance from the shell data into scaffold.md. This connects shell-level guidance to the context the LLM reads.

Read the current scaffold.md generation and add a "Shell Guidance" section that pulls from the shell's `guidance` field when available.

- [ ] **Step 4: Validate content and commit separately**

```bash
# decantr-content
cd /Users/davidaimi/projects/decantr-content
node validate.js
git add shells/
git commit -m "feat(shells): add guidance for hotkeys, breadcrumbs, labels, empty states"
git push origin main

# monorepo
cd /Users/davidaimi/projects/decantr-monorepo
git add packages/cli/src/scaffold.ts
git commit -m "feat(cli): emit shell guidance in scaffold.md context"
```

---

## Phase 2: Treatment System Refinements (monorepo CLI)

### Task 8: Fix d-section density awareness + divider styling + cursor

**Files:**
- Modify: `packages/cli/src/treatments.ts`
- Modify: `packages/cli/test/treatments.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
describe('d-section density variants', () => {
  it('generates compact variant for dashboard shells', () => {
    const css = generateTreatmentCSS(spatialTokens);
    expect(css).toContain('.d-section[data-density="compact"]');
  });

  it('compact variant uses half the section padding', () => {
    const css = generateTreatmentCSS(spatialTokens);
    expect(css).toContain('calc(var(--d-section-py) * 0.5)');
  });
});

describe('d-section divider upgrade', () => {
  it('uses gradient fade for adjacent section border', () => {
    const css = generateTreatmentCSS(spatialTokens);
    expect(css).toContain('border-image');
    expect(css).toContain('linear-gradient');
  });
});

describe('d-surface cursor', () => {
  it('includes cursor pointer on interactive surfaces', () => {
    const css = generateTreatmentCSS(spatialTokens);
    expect(css).toContain('.d-surface[data-interactive]');
    const interactiveRule = css.split('.d-surface[data-interactive]')[1];
    expect(interactiveRule).toContain('cursor: pointer');
  });
});
```

- [ ] **Step 2: Implement the fixes**

In `packages/cli/src/treatments.ts`:

**d-section density variant:**
Add after the base d-section rule:
```css
.d-section[data-density="compact"] {
  padding: calc(var(--d-section-py) * 0.5) 0;
}
```

**d-section divider upgrade:**
Change the adjacent section rule from:
```css
.d-section + .d-section {
  border-top: 1px solid var(--d-border);
}
```
to:
```css
.d-section + .d-section {
  border-top: 1px solid transparent;
  border-image: linear-gradient(to right, transparent, var(--d-border), transparent) 1;
  margin-top: var(--d-gap-2);
}
```

**d-surface cursor:**
Add `cursor: pointer` to the `d-surface[data-interactive]:hover` rule (or add a separate base rule for `d-surface[data-interactive]` with just cursor).

- [ ] **Step 3: Fix treatment override merge logic**

In the `applyOverrides` or `emitRule` function, ensure that when a theme's `treatments` has an override for `d-control:focus`, it REPLACES the base properties entirely (not merges/stacks). The current logic should already do this since we use object spread `{ ...base, ...override }`, but verify that pseudo-selectors like `:focus` are matched correctly in the override key.

- [ ] **Step 4: Add d-label utility**

Add a new utility class for section labels:
```css
.d-label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--d-text-muted);
  font-family: var(--d-font-mono, ui-monospace, monospace);
}
```

- [ ] **Step 5: Run tests**

```bash
cd packages/cli && pnpm build && pnpm test -- --run
```

- [ ] **Step 6: Commit**

```bash
git add packages/cli/src/treatments.ts packages/cli/test/treatments.test.ts
git commit -m "feat(cli): density-aware sections, gradient dividers, cursor fix, d-label utility"
```

---

### Task 9: Generate personality-derived CSS in the framework

**Files:**
- Modify: `packages/cli/src/treatments.ts` (add personality CSS generation)
- Modify: `packages/cli/src/scaffold.ts` (wire personality into treatment generation)

Currently the harness agent created `neon.css` (78 lines) with 7 utility classes. This should be generated by the CLI from personality keywords.

- [ ] **Step 1: Add generatePersonalityCSS function**

In `packages/cli/src/treatments.ts`, add:

```typescript
export function generatePersonalityCSS(personality: string[], themeData: ThemeData): string {
  const text = personality.join(' ').toLowerCase();
  const rules: string[] = [];

  // Neon glow utilities (keyword: neon, glow)
  if (text.includes('neon') || text.includes('glow')) {
    const glowColor = 'var(--d-accent-glow, rgba(0, 212, 255, 0.3))';
    rules.push(`.neon-glow { box-shadow: 0 0 20px ${glowColor}; }`);
    rules.push(`.neon-glow-hover:hover { box-shadow: 0 0 24px ${glowColor}; }`);
    rules.push(`.neon-text-glow { text-shadow: 0 0 12px ${glowColor}; }`);
    rules.push(`.neon-border-glow { border-color: var(--d-accent); box-shadow: 0 0 8px ${glowColor}; }`);
  }

  // Monospace data utility (keyword: monospace, mono)
  if (text.includes('monospace') || text.includes('mono')) {
    rules.push(`.mono-data { font-family: var(--d-font-mono, ui-monospace, monospace); font-variant-numeric: tabular-nums; }`);
  }

  // Pulse ring utilities (keyword: pulse, ring, status)
  if (text.includes('pulse') || text.includes('ring') || text.includes('status')) {
    rules.push(`
.status-ring {
  width: 48px; height: 48px; border-radius: 50%;
  border: 2px solid var(--d-border);
  display: flex; align-items: center; justify-content: center;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.status-ring[data-status="active"] { border-color: var(--d-success); }
.status-ring[data-status="error"] { border-color: var(--d-error); box-shadow: 0 0 12px color-mix(in srgb, var(--d-error) 25%, transparent); }
.status-ring[data-status="warning"] { border-color: var(--d-warning); }
.status-ring[data-status="idle"] { border-color: var(--d-text-muted); }
.status-ring[data-status="active"]::after {
  content: ''; position: absolute; inset: -4px; border-radius: 50%;
  border: 2px solid var(--d-success); opacity: 0;
  animation: pulse-ring 2s ease-out infinite;
}
@keyframes pulse-ring {
  0% { opacity: 0.6; transform: scale(1); }
  100% { opacity: 0; transform: scale(1.3); }
}`);
  }

  // Entrance animation (keyword: entrance, animate)
  if (themeData.motion?.entrance) {
    rules.push(`
.entrance-fade {
  animation: decantr-entrance var(--d-duration-entrance, 0.2s) var(--d-easing, ease-out);
}
@keyframes decantr-entrance {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}`);
  }

  if (rules.length === 0) return '';

  return '\n/* ── Personality-Derived Utilities ── */\n\n' + rules.join('\n\n') + '\n';
}
```

- [ ] **Step 2: Wire into treatment generation**

In `packages/cli/src/scaffold.ts`, after calling `generateTreatmentCSS()`, append personality CSS:

```typescript
import { generatePersonalityCSS } from './treatments.js';
// ...
let treatmentCSS = generateTreatmentCSS(spatialTokens, themeData.treatments, themeData.decorators, themeName);
treatmentCSS += generatePersonalityCSS(personality, themeData);
writeFileSync(treatmentsPath, treatmentCSS);
```

- [ ] **Step 3: Add tests**

Test that personality keywords produce expected CSS classes.

- [ ] **Step 4: Build and test**

```bash
cd packages/cli && pnpm build && pnpm test -- --run
```

- [ ] **Step 5: Commit**

```bash
git add packages/cli/src/treatments.ts packages/cli/src/scaffold.ts packages/cli/test/treatments.test.ts
git commit -m "feat(cli): generate personality-derived CSS utilities from keywords"
```

---

## Phase 3: @decantr/css Atoms

### Task 10: Add missing atoms

**Files:**
- Modify: `packages/css/src/atoms.ts` (or wherever atoms are defined)
- Test: `packages/css/test/`

- [ ] **Step 1: Read the atom definition file**

Find where atoms are defined in `packages/css/src/` and understand the pattern.

- [ ] **Step 2: Add new atoms**

Add these atoms following the existing naming convention:

```typescript
// Font
_fontmono: 'font-family: var(--d-font-mono, ui-monospace, monospace)',

// Color application
_fgaccent: 'color: var(--d-accent)',
_fgmuted: 'color: var(--d-text-muted)',
_fgsuccess: 'color: var(--d-success)',
_fgerror: 'color: var(--d-error)',
_bgsurf: 'background: var(--d-surface)',
_bgsurfraised: 'background: var(--d-surface-raised)',

// Cursor
_pointer: 'cursor: pointer',

// Common sizing shortcuts
_mw640: 'max-width: 40rem',
_mw480: 'max-width: 30rem',
```

- [ ] **Step 3: Build and test**

```bash
cd packages/css && pnpm build && pnpm test -- --run
```

- [ ] **Step 4: Bump version and commit**

Bump `@decantr/css` to next patch version.

```bash
git add packages/css/
git commit -m "feat(css): add font-mono, color, cursor, and sizing atoms"
```

---

## Phase 4: DECANTR.md Template Updates (generic only)

### Task 11: Update DECANTR.md template with generic guidance

**Files:**
- Modify: `packages/cli/src/scaffold.ts` (CSS_APPROACH_CONTENT constant and template sections)

IMPORTANT: All additions must be GENERIC — no blueprint/archetype-specific logic.

- [ ] **Step 1: Add generic guidance sections**

Add to the treatment reference section of CSS_APPROACH_CONTENT:

**Section Labels:**
```
### Section Labels
Use the d-label class for uppercase section headings.
Anchor labels visually with a left accent border: border-left: 2px solid var(--d-accent); padding-left: 0.5rem.
```

**Empty States:**
```
### Empty States
Every data-driven section should handle the zero-data case.
Pattern: centered icon (48px, muted) + message text + optional CTA button.
```

**Page Transitions:**
```
### Page Transitions
If the theme defines motion.entrance, apply the entrance-fade class to the main content area for smooth page-to-page transitions.
```

**Keyboard Shortcuts:**
```
### Navigation
If the essence defines hotkeys, implement them as useEffect keyboard event listeners — not as visible UI elements. If command_palette is enabled, render a ⌘K-triggered overlay.
```

- [ ] **Step 2: Remove treatments.md generation**

In `packages/cli/src/scaffold.ts`, find where `treatments.md` is written to the context directory. Remove it — DECANTR.md is sufficient. Update context file references.

- [ ] **Step 3: Trim task-scaffold.md**

Reduce task-scaffold.md to only the unique content (the "What to Generate" list). Remove the duplicated checklist and rules that restate DECANTR.md.

- [ ] **Step 4: Update section context generation for shell guidance**

In `generateSectionContext()`, if the shell data has a `guidance` field, emit it as a "Shell Notes" section in the section context markdown. This connects shell-specific guidance (hotkeys behavior, breadcrumbs, section label styling) to the LLM without hardcoding it in DECANTR.md.

- [ ] **Step 5: Build and test**

```bash
cd packages/cli && pnpm build && pnpm test -- --run
```

- [ ] **Step 6: Commit**

```bash
git add packages/cli/
git commit -m "feat(cli): generic DECANTR.md guidance for labels, empty states, transitions, hotkeys"
```

---

## Phase 5: Theme Content Tweaks (decantr-content)

### Task 12: Enrich carbon-neon theme

**Files:**
- Modify: `/Users/davidaimi/projects/decantr-content/themes/carbon-neon.json`

- [ ] **Step 1: Add error state treatment override**

Add to `treatments`:
```json
"d-surface[data-status=\"error\"]": {
  "border-color": "var(--d-error)",
  "box-shadow": "0 0 12px color-mix(in srgb, var(--d-error) 20%, transparent)"
}
```

- [ ] **Step 2: Add secondary color differentiation**

Add a `palette.secondary` entry distinct from primary:
```json
"secondary": { "dark": "#A78BFA", "light": "#7C3AED" }
```
(Purple — provides a second visual channel alongside cyan accent for charts, categories, etc.)

- [ ] **Step 3: Ensure treatment override for focus doesn't double-stack**

Check that the `treatments` field for `d-control:focus` replaces (not adds to) the base treatment. If carbon-neon has a neon glow override for focus, it should be a SINGLE box-shadow, not base + override stacked.

```json
"d-control:focus": {
  "border-color": "var(--d-accent)",
  "box-shadow": "0 0 0 3px var(--d-accent-glow, rgba(0, 212, 255, 0.2))"
}
```

- [ ] **Step 4: Validate and commit**

```bash
cd /Users/davidaimi/projects/decantr-content
node validate.js
git add themes/carbon-neon.json
git commit -m "feat(carbon-neon): error state treatment, secondary color, focus fix"
```

---

### Task 13: Push all content changes

- [ ] **Step 1: Push to main**

```bash
cd /Users/davidaimi/projects/decantr-content
git push origin main
```

Wait for GitHub Actions sync.

---

## Phase 6: Build, Publish, Re-scaffold, Harness

### Task 14: Build + test monorepo

- [ ] **Step 1: Full build and test**

```bash
cd /Users/davidaimi/projects/decantr-monorepo
pnpm build && pnpm test
```

Fix any failures.

- [ ] **Step 2: Bump versions**

- `@decantr/css` → next patch
- `decantr` (CLI) → 1.5.5
- Other packages only if changed

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "chore: version bumps for pattern enrichment + treatment polish"
git push origin main
```

- [ ] **Step 4: Provide publish commands to user**

---

### Task 15: Re-scaffold agent-marketplace + run harness

- [ ] **Step 1: Clean and re-scaffold**

```bash
cd apps/showcase/agent-marketplace
rm -rf decantr.essence.json DECANTR.md .decantr/ src/ dist/
mkdir -p src
node ../../../packages/cli/dist/bin.js sync
node ../../../packages/cli/dist/bin.js init --blueprint=agent-marketplace --existing --yes
```

- [ ] **Step 2: Verify improvements**

Check that:
- `treatments.css` includes: `d-section[data-density="compact"]`, gradient divider, `d-label`, `cursor: pointer` on interactive surfaces
- `treatments.css` includes personality-derived section: `neon-glow`, `mono-data`, `status-ring`, `entrance-fade`
- `tokens.css` includes all expected tokens
- Section contexts include shell guidance (if shell data has guidance field)
- No `treatments.md` file generated (removed)
- `task-scaffold.md` is trimmed

- [ ] **Step 3: Run full harness**

Dispatch harness agent. Compare to Run 4 baseline:
- Token efficiency: 88% (target: >88%)
- Treatment coverage: 100% (maintain)
- Personality compliance: 100% (maintain)
- Visual quality: 4.7/5 (target: >4.8)
- Inline styles: 285 (target: <150 with new atoms)
- Improvised CSS: 78 lines neon.css (target: 0 — absorbed into framework)

Key visual checks:
- Hero: no data widget card, ambient visual or clean end
- How-it-works: horizontal layout with connections
- Swarm: no outer card, connected timeline, pointer cursors
- Config: stacked labels above fields, max-width constrained, no card-per-section
- Dividers: gradient fade, not boring line
- Section labels: anchored with accent border
- Focus ring: single glow, not double

If critical issues remain, break from harness, fix at framework level, re-scaffold, re-run.

---

## Summary

| Phase | Tasks | What Changes |
|-------|:-----:|-------------|
| 1: Pattern Enrichment | 1-7 | 7 patterns + 2 shells in decantr-content |
| 2: Treatment Polish | 8-9 | d-section density, divider, cursor, d-label, personality CSS |
| 3: Atoms | 10 | _fontmono, _fgaccent, _fgmuted, _pointer, _mw640 |
| 4: DECANTR.md | 11 | Generic guidance (labels, empty states, transitions, hotkeys), remove treatments.md |
| 5: Theme Tweaks | 12-13 | carbon-neon error treatment, secondary color, focus fix |
| 6: Validate | 14-15 | Build, publish, re-scaffold, harness Run 5 |
