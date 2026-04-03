# Shell Implementation Specs + Scaffolding Accelerators

**Date:** 2026-04-03
**Status:** Approved
**Scope:** All 13 shells (decantr-content), CLI context generation (scaffold.ts), DECANTR.md template

---

## Goal

Fix shell layout collisions, card inception, spacing inconsistencies, and scaffolding speed issues identified in the first real-world agent-marketplace scaffold test. The root cause is that rich shell data (grid templates, dimensions, internal spacing, code examples) exists in shell JSON files but only 3 of 15+ fields reach the AI through the `ShellInfo` bottleneck.

---

## Section 1: Shell Content Enrichment — `internal_layout` Field

Add an `internal_layout` field to all 13 shells in decantr-content. This field provides region-by-region spatial specifications using Tailwind-style utility notation as a framework-agnostic lingua franca.

### 1.1 sidebar-main.json

```json
"internal_layout": {
  "root": {
    "structure": "flex h-screen w-full",
    "note": "Horizontal flex, full viewport"
  },
  "sidebar": {
    "container": "w-64 shrink-0 border-r flex flex-col bg-[var(--d-surface)]",
    "width": "240px",
    "collapsed_width": "64px",
    "collapse_breakpoint": "md",
    "brand": "h-14 flex items-center px-4 border-b gap-2",
    "nav": "flex-1 overflow-y-auto py-2 px-2",
    "nav_group_gap": "py-2",
    "nav_group_header": "px-3 mb-1 d-label",
    "nav_item": "w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm d-interactive[ghost]",
    "nav_item_gap": "space-y-0.5",
    "footer": "border-t p-2 mt-auto"
  },
  "main": {
    "container": "flex-1 flex flex-col overflow-hidden"
  },
  "header": {
    "container": "h-14 shrink-0 border-b flex items-center justify-between px-6",
    "left": "Breadcrumb — omit segment when it equals page title",
    "right": "Search/command trigger"
  },
  "body": {
    "container": "flex-1 overflow-y-auto p-6",
    "scroll": true,
    "note": "Sole scroll container. Page outlet renders directly here. No wrapper div."
  }
}
```

### 1.2 centered.json

```json
"internal_layout": {
  "root": {
    "structure": "flex items-center justify-center min-h-screen bg-[var(--d-bg)]",
    "note": "Full viewport centered"
  },
  "body": {
    "container": "w-full max-w-md p-6 d-surface rounded-lg",
    "auth_width": "max-w-[28rem]",
    "wide_width": "max-w-[36rem]",
    "note": "Single centered card. No sidebar, no header. Auth forms use 28rem, wider content uses 36rem."
  }
}
```

### 1.3 top-nav-footer.json

```json
"internal_layout": {
  "root": {
    "structure": "flex flex-col min-h-screen",
    "note": "Vertical stack, full viewport"
  },
  "header": {
    "container": "h-14 shrink-0 border-b flex items-center justify-between px-6 sticky top-0 bg-[var(--d-bg)] z-10",
    "left": "Brand/logo",
    "center": "Nav links — hidden on mobile, shown as flex gap-6 on desktop",
    "right": "CTA button + mobile hamburger (hamburger ONLY below md breakpoint)"
  },
  "body": {
    "container": "flex-1",
    "note": "Full-width sections stack vertically. Each section uses d-section with --d-section-py. Body itself has NO padding — sections own their own padding.",
    "scroll": "natural document scroll (no overflow-y-auto needed)"
  },
  "footer": {
    "container": "border-t py-8 px-6",
    "note": "Multi-column footer with links and legal. mt-auto pushes it to bottom on short pages."
  }
}
```

### 1.4–1.13 Remaining 10 Shells

Each shell gets the same treatment. Key specifications per shell:

**chat-portal.json:**
```json
"internal_layout": {
  "root": { "structure": "flex h-screen w-full" },
  "sidebar": {
    "container": "w-72 shrink-0 border-r flex flex-col",
    "width": "280px", "collapsed_width": "64px",
    "conversation_list": "flex-1 overflow-y-auto",
    "conversation_item": "flex items-center gap-3 px-3 py-2.5 d-interactive[ghost] rounded-md",
    "conversation_item_gap": "space-y-0.5"
  },
  "main": { "container": "flex-1 flex flex-col overflow-hidden" },
  "header": { "container": "h-14 shrink-0 border-b flex items-center px-4 gap-3" },
  "body": {
    "container": "flex-1 flex flex-col overflow-hidden",
    "messages": "flex-1 overflow-y-auto p-4",
    "input": "shrink-0 border-t p-4",
    "note": "Body splits into messages scroll area + pinned input. Input anchored to bottom."
  }
}
```

**full-bleed.json:**
```json
"internal_layout": {
  "root": { "structure": "min-h-screen" },
  "header": {
    "container": "fixed top-0 w-full h-14 flex items-center justify-between px-6 z-50 bg-[var(--d-bg)]/80 backdrop-blur-sm",
    "note": "Floating header with transparency. No sidebar."
  },
  "body": { "container": "pt-14", "note": "Padding-top to clear fixed header." }
}
```

**minimal-header.json:**
```json
"internal_layout": {
  "root": { "structure": "min-h-screen flex flex-col" },
  "header": { "container": "h-11 shrink-0 border-b flex items-center justify-between px-4", "note": "Slim 44px header" },
  "body": { "container": "flex-1 max-w-3xl mx-auto w-full p-6", "note": "Centered content at 720px max-width" }
}
```

**sidebar-aside.json:**
```json
"internal_layout": {
  "root": { "structure": "flex h-screen w-full" },
  "sidebar": { "container": "w-64 shrink-0 border-r flex flex-col", "width": "240px", "collapsed_width": "64px" },
  "main": { "container": "flex-1 flex flex-col overflow-hidden" },
  "header": { "container": "h-14 shrink-0 border-b flex items-center justify-between px-6" },
  "body": { "container": "flex-1 flex overflow-hidden", "content": "flex-1 overflow-y-auto p-6", "aside": "w-72 shrink-0 border-l overflow-y-auto p-4", "note": "Body is horizontal flex: content + aside. Both scroll independently." }
}
```

**sidebar-main-footer.json:**
```json
"internal_layout": {
  "root": { "structure": "flex h-screen w-full" },
  "sidebar": { "container": "w-64 shrink-0 border-r flex flex-col", "width": "240px" },
  "main": { "container": "flex-1 flex flex-col overflow-hidden" },
  "header": { "container": "h-14 shrink-0 border-b flex items-center justify-between px-6" },
  "body": { "container": "flex-1 overflow-y-auto p-6" },
  "footer": { "container": "shrink-0 border-t py-3 px-6", "note": "Footer inside main area, below body scroll." }
}
```

**sidebar-right.json:**
```json
"internal_layout": {
  "root": { "structure": "flex h-screen w-full" },
  "main": { "container": "flex-1 flex flex-col overflow-hidden" },
  "header": { "container": "h-14 shrink-0 border-b flex items-center justify-between px-6" },
  "body": { "container": "flex-1 overflow-y-auto p-6" },
  "sidebar": { "container": "w-64 shrink-0 border-l flex flex-col", "width": "240px", "collapsed_width": "64px", "note": "Sidebar on RIGHT side. Same internal structure as sidebar-main but border-l instead of border-r." }
}
```

**terminal-split.json:**
```json
"internal_layout": {
  "root": { "structure": "flex flex-col h-screen" },
  "status_bar": { "container": "h-6 shrink-0 flex items-center px-3 text-xs bg-[var(--d-surface)] border-b", "note": "24px thin status bar" },
  "body": { "container": "flex-1 flex overflow-hidden", "note": "Horizontal split panes. Each pane scrolls independently.", "pane": "flex-1 overflow-y-auto font-mono text-sm p-2" },
  "hotkey_bar": { "container": "h-7 shrink-0 flex items-center gap-4 px-3 text-xs border-t bg-[var(--d-surface)]", "note": "28px bottom bar with key hints" }
}
```

**top-nav-main.json:**
```json
"internal_layout": {
  "root": { "structure": "flex flex-col min-h-screen" },
  "header": { "container": "h-14 shrink-0 border-b flex items-center justify-between px-6 sticky top-0 bg-[var(--d-bg)] z-10" },
  "body": { "container": "flex-1 p-6", "note": "No footer. Simple top-nav + content." }
}
```

**top-nav-sidebar.json:**
```json
"internal_layout": {
  "root": { "structure": "flex flex-col h-screen" },
  "header": { "container": "h-14 shrink-0 border-b flex items-center justify-between px-6", "note": "Full-width header spans above both sidebar and content" },
  "below_header": { "structure": "flex flex-1 overflow-hidden" },
  "sidebar": { "container": "w-64 shrink-0 border-r flex flex-col overflow-y-auto", "width": "240px", "collapsed_width": "64px" },
  "body": { "container": "flex-1 overflow-y-auto p-6" }
}
```

**workspace-aside.json:**
```json
"internal_layout": {
  "root": { "structure": "flex h-screen w-full" },
  "sidebar": { "container": "w-64 shrink-0 border-r flex flex-col", "width": "240px", "collapsed_width": "48px" },
  "main": { "container": "flex-1 flex flex-col overflow-hidden" },
  "header": { "container": "h-14 shrink-0 border-b flex items-center justify-between px-6", "note": "Spans above both content and aside" },
  "body": { "container": "flex-1 flex overflow-hidden", "content": "flex-1 overflow-y-auto p-4", "aside": "w-72 shrink-0 border-l overflow-y-auto p-4", "note": "Left sidebar + content + right aside. Page tree in sidebar, comments in aside." }
}
```

---

## Section 2: Quick-Start Block

Add a `## Quick Start` section at the very top of every section context file, before any other content.

**Generation logic in CLI:**

```typescript
function generateQuickStart(input: SectionContextInput): string[] {
  const lines: string[] = [];
  lines.push('## Quick Start');
  lines.push('');

  // Shell summary from internal_layout
  const shellSummary = input.shellInfo?.internal_layout
    ? `${input.section.shell} (${describeShellBrief(input.shellInfo)})`
    : input.section.shell;
  lines.push(`- **Shell:** ${shellSummary}`);

  // Pages
  lines.push(`- **Pages:** ${input.section.pages.length} — ${input.section.pages.map(p => p.id).join(', ')}`);

  // Key patterns with complexity hint
  const patternEntries = Object.entries(input.patternSpecs);
  const complex = patternEntries.filter(([, s]) => (s.components?.length || 0) >= 6).map(([n]) => `${n} (complex)`);
  const shared = patternEntries.filter(([, s]) => s.sharedCount && s.sharedCount > 1).map(([n]) => `${n} (shared)`);
  const key = [...new Set([...complex, ...shared])].slice(0, 5);
  if (key.length) lines.push(`- **Key patterns:** ${key.join(', ')}`);

  // CSS classes to use
  const treatments = ['d-surface', 'd-interactive', 'd-section', 'd-annotation', 'd-control', 'd-data'];
  const decorators = input.decorators.slice(0, 3).map(d => d.name);
  const personality = [];
  const pLower = input.personality.join(' ').toLowerCase();
  if (pLower.includes('neon') || pLower.includes('glow')) personality.push('neon-glow');
  if (pLower.includes('mono')) personality.push('mono-data');
  if (pLower.includes('status') || pLower.includes('ring')) personality.push('status-ring');
  lines.push(`- **CSS:** ${[...decorators, ...personality].join(', ')} + base treatments`);

  // Density
  const density = input.section.dna_overrides?.density || 'comfortable';
  lines.push(`- **Density:** ${density} (content_gap: var(--d-content-gap))`);

  // Voice one-liner (from scaffold.md voice)
  if (input.voiceTone) lines.push(`- **Voice:** ${input.voiceTone}`);

  lines.push('');
  return lines;
}
```

---

## Section 3: `@decantr/css` API in DECANTR.md

Add to the DECANTR.md template, in the CSS Implementation section:

```markdown
### @decantr/css API

```js
import { css } from '@decantr/css';

// css() accepts space-separated atom strings, returns a className string
// Injects corresponding CSS rules as a side effect (singleton, no duplicates)
const classes = css('_flex _col _gap4 _p6');

// Combine with treatment and decorator classes:
<div className={css('_flex _col _gap4') + ' d-surface carbon-glass'}>

// Responsive prefix — applies at breakpoint and above:
css('_col sm:_row')        // column on mobile, row from sm+

// Pseudo prefix:
css('hover:_opacity80')    // opacity on hover
```
```

---

## Section 4: Nesting Anti-Patterns in DECANTR.md

Add to the DECANTR.md template, after the treatment class table:

```markdown
### Treatment Nesting Rules

1. **Never nest d-surface inside d-surface.** Cards within cards create visual inception. If a card needs inner sections, use plain divs with padding atoms (_p4), not nested surfaces.
2. **Shell regions are transparent frames.** Do NOT apply d-surface to the sidebar, header, or nav containers. They use bg-[var(--d-surface)] or bg-[var(--d-bg)] directly. d-surface is for content cards WITHIN the body region.
3. **One scroll container per region.** The shell body has overflow-y-auto. Do NOT add another scrollable wrapper inside it. The shell sidebar nav also scrolls independently — do not nest scrolls there either.
4. **d-section spacing is self-contained.** Each d-section owns its padding via --d-section-py. The `d-section + d-section` CSS rule adds a top border separator between adjacent sections. Do NOT add extra margin or gap between d-section elements.
5. **Responsive breakpoints on nav elements.** The shell spec defines a collapse breakpoint (e.g., md). Hamburger menus, mobile drawers, and collapsed sidebars should ONLY appear at or below that breakpoint. Full nav should show at breakpoints above it.
```

---

## Section 5: Spacing Guide Table in Section Contexts

Add a `## Spacing Guide` section after the token palette table, generated from the computed spatial tokens:

```markdown
## Spacing Guide (comfortable density)

| Context | Token | Atom Equivalent | Value | Usage |
|---------|-------|----------------|-------|-------|
| Content gap | --d-content-gap | _gap4 | 1rem | Gap between sibling content blocks |
| Section padding | --d-section-py | — | 5rem | Vertical space between page sections |
| Surface padding | --d-surface-p | ~_p5 | 1.25rem | Internal padding for d-surface cards |
| Interactive padding | --d-interactive-py/px | ~_p2 / ~_p4 | 0.5rem / 1rem | Button and nav item internal padding |
| Control padding | --d-control-py | ~_p2 | 0.5rem | Form input vertical padding |
| Data cell padding | --d-data-py | ~_p2.5 | 0.625rem | Table cell vertical padding |
| Body region | (from shell spec) | _p6 | 1.5rem | Main content area padding |

**Rule:** Use CSS custom properties (var(--d-content-gap)) for density-responsive spacing inside treatment classes. Use atoms (_gap4, _p6) for layout structure that doesn't need to adapt to density changes.
```

---

## Section 6: Data Shape Hints in Section Contexts

For each pattern that renders dynamic data (not static marketing content), add a `**Data shape:**` block after the pattern spec:

```markdown
### agent-timeline
...existing visual brief, composition, motion, responsive, accessibility...

**Data shape:**
```ts
interface TimelineEvent {
  id: string;
  type: 'action' | 'decision' | 'error' | 'tool_call' | 'reasoning' | 'warning';
  message: string;
  timestamp: Date;
  agentId?: string;
  details?: Record<string, unknown>;
}
// Feed: TimelineEvent[] sorted by timestamp descending
```
```

**Generation logic:** Derive the interface from:
- Pattern `components` list → field names (e.g., "FilterChip" implies a filterable `type` field)
- Pattern `slots` → data structure (e.g., "Scrollable message list" → array)
- Pattern `composition` → nesting (e.g., "Message[] > [Avatar + Content + Timestamp]" → Message has avatar, content, timestamp)

**Which patterns get data shapes:** Any pattern where the composition references `[]` (array/list) or where the visual_brief mentions "data", "list", "feed", "table", "metrics", "chart". Static patterns (hero, cta, footer) are excluded.

---

## Section 7: CLI Pipeline Changes

### 7.1 Expand ShellInfo Interface

```typescript
interface ShellInfo {
  description: string;
  regions: string[];
  layout?: string;                              // "grid" | "stack" | "center" | "flex"
  guidance?: Record<string, string>;
  // NEW fields:
  atoms?: string;                               // Root container atoms
  config?: {
    grid?: { areas?: string[][] };
    nav?: { position?: string; width?: string; collapseTo?: string; collapseBelow?: string; defaultState?: string };
    header?: { height?: string; sticky?: boolean };
    body?: { scroll?: boolean; inputAnchored?: boolean };
    footer?: { height?: string; sticky?: boolean };
  };
  internal_layout?: Record<string, Record<string, string>>;  // Region → property → value
  code_example?: string;
}
```

### 7.2 Update Shell Fetching in refreshDerivedFiles

Extract all new fields from the shell JSON:

```typescript
shellInfoCache[shellId] = {
  description: inner.description || '',
  regions: inner.config?.regions || [],
  layout: inner.layout || undefined,
  guidance: inner.guidance || undefined,
  atoms: inner.atoms || undefined,
  config: inner.config || undefined,
  internal_layout: inner.internal_layout || undefined,
  code_example: inner.code?.example || undefined,
};
```

### 7.3 New Function: generateShellImplementation()

```typescript
function generateShellImplementation(shellId: string, shellInfo: ShellInfo): string[] {
  const lines: string[] = [];
  lines.push(`## Shell Implementation: ${shellId}`);
  lines.push('');

  if (!shellInfo.internal_layout) {
    // Fallback for shells without internal_layout
    lines.push(`**Layout:** ${shellInfo.layout || 'unknown'}`);
    if (shellInfo.atoms) lines.push(`**Container:** ${shellInfo.atoms}`);
    lines.push(`**Regions:** ${shellInfo.regions.join(', ')}`);
    if (shellInfo.config?.nav?.width) lines.push(`**Nav width:** ${shellInfo.config.nav.width} (collapsed: ${shellInfo.config.nav.collapseTo || 'n/a'})`);
    if (shellInfo.config?.header?.height) lines.push(`**Header height:** ${shellInfo.config.header.height}`);
    lines.push('');
    return lines;
  }

  // Rich rendering from internal_layout
  for (const [region, props] of Object.entries(shellInfo.internal_layout)) {
    const label = region.charAt(0).toUpperCase() + region.slice(1).replace(/_/g, ' ');
    if (props.structure) {
      lines.push(`**${label}:** \`${props.structure}\``);
    } else if (props.container) {
      lines.push(`**${label}:** \`${props.container}\``);
    }
    for (const [key, value] of Object.entries(props)) {
      if (key === 'structure' || key === 'container') continue;
      if (key === 'note') {
        lines.push(`  - ${value}`);
      } else {
        const prettyKey = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        lines.push(`  - ${prettyKey}: \`${value}\``);
      }
    }
    lines.push('');
  }

  // Anti-patterns
  lines.push('**Anti-patterns:**');
  lines.push('- Never put overflow-y-auto on anything except designated scroll regions');
  lines.push('- Never nest d-surface inside shell frame regions (sidebar, header)');
  lines.push('- Never add a wrapper div around the page outlet — the body region IS the content container');
  if (shellInfo.config?.nav?.collapseTo) {
    lines.push(`- Collapsed state: sidebar becomes ${shellInfo.config.nav.collapseTo} wide, icons only, text hidden`);
  }
  if (shellInfo.config?.nav?.collapseBelow) {
    lines.push(`- Collapse breakpoint: ≤${shellInfo.config.nav.collapseBelow}. Full nav above, collapsed/hidden below.`);
  }
  lines.push('');
  return lines;
}
```

### 7.4 Update generateSectionContext()

Replace the current shell rendering (lines ~2957-2982) with:

```typescript
// Quick Start (new)
lines.push(...generateQuickStart(input));

// Shell Implementation (new, replaces old shell one-liner + regions)
if (input.shellInfo) {
  lines.push(...generateShellImplementation(input.section.shell as string, input.shellInfo));
}

// Shell Notes (keep existing behavioral guidance)
if (input.shellInfo?.guidance && Object.keys(input.shellInfo.guidance).length > 0) {
  lines.push(`## Shell Notes`);
  lines.push('');
  for (const [key, value] of Object.entries(input.shellInfo.guidance)) {
    const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    lines.push(`- **${label}:** ${value}`);
  }
  lines.push('');
}

// Spacing Guide (new)
lines.push(...generateSpacingGuide(densityLevel));
```

### 7.5 Update DECANTR.md Template

Add css() API documentation and nesting anti-patterns as described in Sections 3 and 4.

### 7.6 Generate Data Shape Hints

In the pattern spec rendering loop within `generateSectionContext`, after the existing fields (visual_brief, composition, motion, responsive, accessibility), add:

```typescript
if (shouldGenerateDataShape(spec)) {
  lines.push('**Data shape:**');
  lines.push('```ts');
  lines.push(generateDataShapeHint(patternName, spec));
  lines.push('```');
  lines.push('');
}
```

`shouldGenerateDataShape` returns true if composition contains `[]` or visual_brief mentions data/list/feed/table/metrics.

---

## Section 8: Pattern Complexity Hints

Add a `complexity` field to patterns in decantr-content for the Quick Start block:

```json
"complexity": "simple"   // hero, cta, footer — <50 LOC expected
"complexity": "moderate" // data-table, pricing, form — 50-200 LOC
"complexity": "complex"  // agent-swarm-canvas, doc-editor — 200+ LOC
```

Derivation: `simple` = ≤3 components, `moderate` = 4-7 components, `complex` = 8+ components OR has `layout_hints` with >3 entries.

---

## Package Impact

| Package | Change | Version |
|---------|--------|---------|
| decantr-content | `internal_layout` on all 13 shells, `complexity` on ~116 patterns | 1.2.0 |
| @decantr/cli | Expanded ShellInfo, generateShellImplementation, Quick Start, Spacing Guide, Data Shape, DECANTR.md updates | 1.7.0 |

No changes to: essence-spec, registry, mcp-server, core, css, vite-plugin.

---

## Implementation Checklist

### Content (decantr-content)
- [ ] Add `internal_layout` to sidebar-main.json
- [ ] Add `internal_layout` to centered.json
- [ ] Add `internal_layout` to top-nav-footer.json
- [ ] Add `internal_layout` to chat-portal.json
- [ ] Add `internal_layout` to full-bleed.json
- [ ] Add `internal_layout` to minimal-header.json
- [ ] Add `internal_layout` to sidebar-aside.json
- [ ] Add `internal_layout` to sidebar-main-footer.json
- [ ] Add `internal_layout` to sidebar-right.json
- [ ] Add `internal_layout` to terminal-split.json
- [ ] Add `internal_layout` to top-nav-main.json
- [ ] Add `internal_layout` to top-nav-sidebar.json
- [ ] Add `internal_layout` to workspace-aside.json
- [ ] Add `complexity` field to all ~116 patterns
- [ ] Run validate.js — 0 errors, 0 warnings
- [ ] Push to main

### CLI (decantr-monorepo)
- [ ] Expand ShellInfo interface with config, internal_layout, atoms, code_example
- [ ] Update shell fetching in refreshDerivedFiles to extract all fields
- [ ] Implement generateShellImplementation() function
- [ ] Implement generateQuickStart() function
- [ ] Implement generateSpacingGuide() function
- [ ] Implement generateDataShapeHint() function
- [ ] Update generateSectionContext() to render all new blocks
- [ ] Add css() API docs to DECANTR.md template
- [ ] Add nesting anti-patterns to DECANTR.md template
- [ ] Run tests — all pass
- [ ] Bump CLI to 1.7.0
- [ ] Push to main

### Skills
- [ ] Update decantr-engineering SKILL.md — shell implementation specs, Quick Start, spacing guide, data shapes, nesting rules, CLI 1.7.0
- [ ] Update both harness.md files — shell implementation spec validation, Quick Start presence check, spacing guide check, nesting rule check
- [ ] Push monorepo (.claude/skills/harness.md)

### Verification
- [ ] Regenerate agent-marketplace showcase
- [ ] Run harness — verify shell implementation blocks, Quick Start, spacing guide, data shapes all present
- [ ] Publish @decantr/cli@1.7.0
