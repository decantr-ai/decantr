# Decantr Harness Program — Post-Session Synthesis

**Date:** 2026-04-24
**Scope:** Methodology + lessons from the cross-blueprint harness audit + Tier B/C/D3 implementation cycle.

## Program arc in one paragraph

We ran cold-LLM scaffold harnesses against blueprints (agent-marketplace, ecommerce, ai-video-studio, cloud-platform, observability-platform) using delta-focused subagents with no Decantr priors. Each run measured inline-style count, hand-rolled CSS classes, Lucide icon adoption, and directive compliance — graded as a snapshot of "does Decantr produce stunning shadcn-grade scaffolds out of the box?" The structural answer (routes, shells, atoms, semantic treatments) reached A-grade by run 11 (agent-marketplace v6: 5 inline styles, 0 hand-rolled, 43 unique Lucide icons, 4/4 directives). The user then surfaced the deeper diagnosis driving the bulk of remaining work: **experiential requirements (motion, interactivity) lived only in DECANTR.md prose. Cold LLMs in generation mode categorized that prose as "nice to have" and skipped it. Nothing failed when they did.** This shipped the structural-to-experiential bridge across two coordinated tiers.

## Findings → Fixes catalog

### Tier A — Unblockers (already shipped before this cycle)

| Finding | Fix | PR |
|---------|-----|-----|
| Routing default `hash` confused modern SPAs | Default flipped to `history`; pack-md routing-impl hint | #18 |
| Decorator state CSS missing | Theme JSON state-variant fields (`hover_properties` etc.) | #17 |
| `sidebar-aside` shell + theme-toggle dark tokens | Treatment + token emission | #29 |

### Tier B — Visual quality core (this cycle, PR #30)

| Finding | Fix |
|---------|-----|
| LLMs hand-rolled `@keyframes` per scaffold (inconsistent timings) | Motion treatment library (12 classes: `d-enter-fade`, `d-pulse`, `d-shimmer`, `d-glow-hover`, `d-lift-hover`, …) with `prefers-reduced-motion` baked in |
| Authors set `font-size`/`font-weight`/etc. inline | Typography contract (10 classes: `d-display`, `d-headline`, `d-title`, `d-prose`, `d-eyebrow`, `d-mono-text`, …) |
| Ad-hoc `box-shadow` values per scaffold | Elevation utility `d-elevate[data-level="0..5"]` reading from `--d-elevation-1..5` mode-aware tokens |
| `carbon-card` requires authors to manually compose flex/gap/padding | Composite card treatments (`d-card`, `d-card-header/body/footer`, `data-padding="compact|spacious|none"`, `data-interactive` hover) |
| `.status-ring` fixed at 48px → authors override via inline style | Size variants `[data-size="sm|md|lg"]` (32/48/64px) |
| Motion/Interactivity Philosophy as prose → ignored | **Replaced with reference tables in DECANTR.md** + hard-rule opening sentences |

### Tier C — Experiential enforcement (this cycle, PR #31)

| Piece | Fix |
|-------|-----|
| C1 — declarations | `interactions: string[]` field on pattern.v2.json (24-value enum) threaded through `Pattern → IRPatternMeta → PagePackPattern` |
| C2 — surfacing | Page-pack markdown emits checkbox checklist per pattern: `**Interactions (MUST implement each)** — [ ] drag-nodes, [ ] status-pulse, ...` |
| C3 — visual feedback | `d-hotkey-indicator` corner badge + `hotkey_semantics.show_chord_indicator` schema field |
| C4 — detection | `@decantr/verifier`'s `verifyInteractionsInSource(declared, sources)` with 24-key signal map (regex + substring), 16 unit tests |
| C5 — enforcement | 8th guard rule (`'interactions'`) joining structure/layout/pattern-existence; severity from `meta.guard.interactions_enforcement` field with mode-derived defaults (creative=off, guided=warn, strict=error) |
| CLI wiring | `scanProjectInteractions(cwd)` reads pack-manifest, walks source, calls verifier, threads result to guard via `interaction_issues`. `decantr check --strict` exits 1 on missing implementations. 10 unit tests. |

### Tier D3 — Data-viz primitives (this cycle, PR #32)

7 treatments closing the last hand-rolled territory:
- `d-timeline-rail` + `d-timeline-dot[data-state]`
- `d-sparkline` (+ `d-sparkline-path` + `d-sparkline-area`, `data-trend="up|down"`)
- `d-intent-radar` (5 ring levels, axis rotation)
- `d-waveform`
- `d-qr-placeholder`
- `d-conic-ring` (gauge via `--d-conic-value` 0..1)
- `d-heatmap-cell` (intensity blending)

### B4 — Theme JSON tuning (this cycle, content #7)

18 themes populated with character-tuned `motion.durations`, `motion.easings`, `typography.{display,body}`, `elevation[1..5]`. Four character variants:
- **SHARP** (carbon-neon, fintech, terminal) — fast durations, sharp eases
- **SMOOTH** (auradecantism, clean, studio, paper, editorial, launchpad) — balanced
- **CINEMATIC** (cinema, neo-tokyo, glassmorphism, prismatic) — slower, expo eases
- **BOUNCY** (dopamine, gaming-guild) — spring everywhere

### C1 content rollout (this cycle, content #6 + #8)

70 patterns populated with `interactions[]` in 3 batches:
- Batch 1 (#6, 10 patterns): agent-swarm-canvas, service-map, trace-waterfall, data-table, hero, card-grid, status-board, chart-grid, sparkline-cell, activity-feed
- Batch 2 (#6 amend, 9 patterns): agent-timeline, intent-radar, log-stream, chat-thread, kanban-board, calendar-view, alert-rule-builder, metric-gauge, neural-feedback-loop, api-explorer
- Batch 3 (#8, 49 patterns): auth-form, command-palette, stepper, toast-notification, notification-center, comment-thread, conversation-list, audit-trail, comparison-table, pricing, content-feed, cta-banner, citation-graph, deal-pipeline-board, …

## Cross-blueprint tracking (full program)

| Run | Date | Blueprint | Theme | Build | Inline | Hand-rolled | Lucide |
|-----|------|-----------|-------|-------|--------|-------------|--------|
| v1-v6 | Apr 23-24 | agent-marketplace | carbon-neon | PASS | 254 → 5 | 0 → 0 | PARTIAL → Y(43) |
| E1-E2 | Apr 23-24 | ecommerce | auradecantism (light) | PASS | 83 → 1 | 25 classes → 0 | PARTIAL → Y(41) |
| V1 | Apr 24 | ai-video-studio | cinema (dark) | PASS | 122 | 0 | Y (45) |
| C1 | Apr 24 | cloud-platform | lumen | PASS | 200 (narrative-only — root-caused + fixed) | 2 | PARTIAL |
| A1 | Apr 23 | observability-platform | fintech | PASS | 207 | 0 | PARTIAL |

Pack-style scaffolds converge to 1-15 inline styles across themes. Cloud-platform's 200 was traced to silent essence-validation failures (now fixed in #27 — schema unblock + warning emission).

## Lessons

### 1. Structural rules get followed; prose gets skipped.

The single biggest insight from this cycle. LLMs in generation mode bifurcate attention:
- **Hard-edged**: "must satisfy or fail" — followed
- **Soft prose**: "nice to have" — silently dropped

This is true even when the prose is in a section labeled "MUST" with imperative voice. The generative attention model sees paragraphs and treats them as guidance.

The fix is to make EVERY soft thing hard:
1. Convert prose to structured data (interactions[] enum, not "Motion Philosophy" paragraphs)
2. Render structured data as checklists or tables (not prose)
3. Add a verifier that checks the structured data is implemented
4. Wire the verifier as a guard rule that fails the build

This is the C1-C5 + CLI wiring chain.

### 2. Treatments come before declarations.

If you ship a schema field declaring "this pattern needs `glow-hover`" but no treatment for `glow-hover` exists, LLMs will hand-roll inconsistent CSS. The motion library (B1) had to ship BEFORE or ALONGSIDE the interactions schema (C1) so declarations point to known-good implementations.

### 3. Per-theme tuning unlocks distinctiveness.

Default motion tokens work, but they make all themes feel the same. Per-theme `motion.durations` / `motion.easings` (B4) unlocks the difference between "terminal" (snappy, linear, 40ms instant) and "cinema" (dramatic, expo eases, 350ms base). The same applies to typography — `paper` uses Charter serif; `gaming-guild` uses Rajdhani.

### 4. Cold-subagent harness is the only honest measurement.

Authors writing scaffolds for review fall into the trap of perfecting one scaffold while the other 39 blueprints stay broken. Cold-subagent harness with no Decantr priors and no conversation memory is the only signal that generalizes. Run before/after deltas per cycle to verify.

### 5. The structural floor is not the ceiling.

Reaching `inline-style count: 5` does not mean the scaffold is "stunning." The user's gap-analysis ("does this bridge the gap to visually stunning shadcn?") exposed the experiential ceiling that structural metrics couldn't see. Honest answer: P0-P9 as v1 framed it gets 75-85% of stunning. The motion library + typography contracts + elevation tokens + seed content are the missing ceiling.

## What ships in this cycle

| Repo | PR | Status |
|------|----|--------|
| decantr | #30 — Tier B (motion + typography + elevation + composite card + status-ring sizes) | MERGED |
| decantr | #31 — Tier C (full experiential enforcement loop) | MERGED |
| decantr | #32 — Tier D3 (data-viz primitives) | MERGED |
| decantr | #33 — docs (CLAUDE.md refresh + this synthesis doc) | MERGED |
| decantr | #34 — fix(cli): wire interactions guard into cmdHeal (critical post-merge fix; closes the C5 loop in production) | MERGED |
| decantr | #35 — chore: sync local package.json versions to published npm releases | MERGED |
| decantr-content | #6 — interactions[] on 19 patterns (batches 1+2) | MERGED |
| decantr-content | #7 — theme motion/typography/elevation on 18 themes | MERGED |
| decantr-content | #8 — interactions[] on 49 more patterns (batch 3) | MERGED |
| decantr-content | #9 — interactions[] on 132 more patterns (batch 4, heuristic) | MERGED |
| decantr-content | #10 — B4 batch 2: 13 more themes tuned | MERGED |
| decantr-content | #11 — D4 behavior directives | MERGED |
| decantr-content | #12 — fix: restore B4 batch 2 themes | MERGED |

**Published to npm 2026-04-25:**

| Package | Version |
|---------|---------|
| @decantr/essence-spec | 1.0.3 |
| @decantr/registry | 1.0.2 |
| @decantr/core | 1.0.1 |
| @decantr/verifier | 1.0.2 |
| @decantr/cli | 1.7.9 |
| @decantr/css | 1.0.3 |
| @decantr/mcp-server | 1.0.4 *(pending publish; bumped locally)* |

## What's next (priority order)

**Update 2026-04-25:** Items 1, 3, 4, 5 below are now ✅ complete. All six core packages published (essence-spec 1.0.3, registry 1.0.2, core 1.0.1, verifier 1.0.2, cli 1.7.9, css 1.0.3). mcp-server 1.0.4 prepared. Cross-blueprint reruns are now the gating measurement.

1. ~~**`@decantr/css` npm publish + sibling packages**~~ ✅ DONE — all 5 patch-bumped packages published 2026-04-25 (PR #35 synced local versions)
2. **Cross-blueprint harness reruns** post-publish — validate predictions (highest-leverage remaining item)
3. ~~**B4 expansion** — populate motion/typography/elevation on remaining themes~~ ✅ DONE — 31/32 themes tuned (recipefork excluded as separate workstream)
4. ~~**C1 content rollout** — 60+ patterns still need interactions[]~~ ✅ DONE — 201/221 patterns (~91%) populated
5. ~~**D4 content directives**~~ ✅ DONE — auth-guard composition, breadcrumb derivation, theme persistence, drag-vs-click threshold all landed
6. **E1 + E2** — `seed_content` + `signature_moment` schemas + content (blueprint-level "feels real" layer; needs design)
7. **CI harness gate** — automated cross-blueprint regression measurement per PR
8. **Visual benchmark suite** — screenshot diff vs reference catalog of top shadcn / Linear / Raycast demos
9. **Per-package release cadence + changelog** — formalize the rhythm now that all packages have shipped together once

## Reusable playbook for future cycles

1. **Set the goal as a falsifiable claim** ("Decantr produces shadcn-grade scaffolds first-pass") rather than a feature checklist.
2. **Run cold-subagent harness on 3-4 blueprints + themes** as baseline.
3. **Categorize findings**: structural (LLM CAN'T do correctly) vs experiential (LLM CAN'T be enforced to do).
4. **Fix structural first** with treatments + atoms + tokens. This is faster and gives more measurable wins.
5. **For experiential**: never write prose. Always write checklist-format declarations + verifier + guard rule.
6. **Per-theme tuning is a separate phase** after the contract layer ships.
7. **Cross-blueprint reruns each cycle** to catch regressions and measure cumulative improvement.

## File-paths reference

- Master TODO (post-cycle): `.claude/harness-runs/2026-04-24-master-todo-v2.md`
- Final summary: `.claude/harness-runs/2026-04-24-final-summary.md`
- Per-run reports: `.claude/harness-runs/<date>-<blueprint>-<run>.md`
- Treatments: `packages/cli/src/treatments.ts`
- Tokens: `packages/cli/src/scaffold.ts` (`generateTokensCSS`)
- DECANTR.md template: `packages/cli/src/scaffold.ts` (search "Visual Treatments")
- Pattern schema: `docs/schemas/pattern.v2.json`
- Essence v3 schema: `packages/essence-spec/schema/essence.v3.json`
- Interactions verifier: `packages/verifier/src/interactions.ts`
- Guard rule: `packages/essence-spec/src/guard.ts` (`checkInteractions`)
- CLI wiring: `packages/cli/src/lib/scan-interactions.ts`
- CLI check command: `packages/cli/src/index.ts` (`cmdCheck`)
