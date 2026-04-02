---
name: decantr-harness
description: Run a full Decantr scaffold harness test — fresh agent builds from blueprint, audits DX, benchmarks token efficiency, bundle analysis, visual quality comparison, and produces actionable recommendations for the framework
---

# Decantr Scaffold Harness

A comprehensive QA + benchmarking tool that dispatches a fresh agent to scaffold and build from a Decantr blueprint, then analyzes every dimension of the output.

## When to Use

- After making changes to the CLI, composition pipeline, themes, patterns, or context generation
- Before publishing new package versions
- When evaluating a new blueprint's quality
- When testing visual personality directives
- Periodically as a regression check

## How to Run

The harness operator (you) manages the process. The harness agent (subagent) does the work.

### Step 0: Pre-flight version check

Before running, verify local packages match published versions. If they don't, the harness tests local code that users can't access yet.

```bash
cd /Users/davidaimi/projects/decantr-monorepo
for pkg in essence-spec registry core mcp-server cli; do
  name=$(python3 -c "import json; print(json.load(open('packages/$pkg/package.json'))['name'])")
  local=$(python3 -c "import json; print(json.load(open('packages/$pkg/package.json'))['version'])")
  pub=$(npm view "$name" version 2>/dev/null || echo "NOT PUBLISHED")
  match=$( [ "$local" = "$pub" ] && echo "OK" || echo "MISMATCH" )
  echo "$name: local=$local published=$pub $match"
done
```

If any show MISMATCH:
- **Testing local changes (pre-publish):** Proceed, but note in the report that results reflect unpublished code
- **Testing the published experience:** Publish first, then run the harness
- **Critical:** The harness agent uses `workspace:*` refs (local packages), NOT the npm versions. This means the harness always tests local code regardless of what's published. Note this in the report.

Also check the API is responding:
```bash
curl -s -o /dev/null -w "API: %{http_code}\n" "https://api.decantr.ai/health"
```

If not 200, the init will fall back to cache — results may differ from a fresh user's experience.

### Step 1: Clean the target

```bash
cd /Users/davidaimi/projects/decantr-monorepo/apps/showcase/{blueprint}
rm -rf decantr.essence.json DECANTR.md .decantr/ src/ dist/
mkdir src
```

### Step 2: Dispatch the harness agent

Use the Agent tool with `model: "opus"` and the prompt template below. The agent must have ZERO knowledge of Decantr — it discovers everything from generated files.

### Step 3: Analyze results

After the agent returns, the operator reviews findings and creates actionable tickets.

---

## Harness Agent Prompt Template

```
You are a developer who has NEVER used Decantr before. Blank Vite + React project at `/Users/davidaimi/projects/decantr-monorepo/apps/showcase/{BLUEPRINT}/` — only package.json, vite.config.ts, tsconfig.json, index.html, and empty src/.

## PHASE 1: SCAFFOLD

1. `node ../../../packages/cli/dist/bin.js sync`
2. `node ../../../packages/cli/dist/bin.js init --blueprint={BLUEPRINT} --existing --yes`
3. Record: wall-clock time for each command, any warnings/errors, file count generated.

## PHASE 2: READ & PLAN

Read ALL generated documentation. For EACH file you read, record:
- File name and line count
- Time spent reading (estimate in seconds)
- Lines you actually USED vs lines you skimmed/ignored
- Moments of confusion or missing information

Pay special attention to:
- The **Personality** section — it contains visual direction. Follow it precisely.
- The **Project Brief** in DECANTR.md — blueprint, theme, personality, sections, features, decorators.
- The **Voice & Copy** section in scaffold.md — tone, CTA verbs, avoid words, empty states, errors, loading.
- The **Visual Direction** section in each section-*.md — personality utilities, decorator table, token palette.
- The **decorator table** (Class + Usage columns) in each section context.
- The **semantic token palette** (Token/Value/Role) in each section context.
- The **theme hints** (preferred patterns, compositions, spatial) in each section context.

## PHASE 3: BUILD

Build ALL pages the blueprint defines (check scaffold.md route map for the full list). For EACH page:
- Use theme tokens from tokens.css (wrapped in @layer tokens)
- Use treatment classes from treatments.css (wrapped in @layer treatments, decorators, utilities)
- Verify global.css has @layer order: reset > tokens > treatments > decorators > utilities > app
- Follow the personality directive for visual quality
- Install any packages the personality requests (e.g., lucide-react)
- Record: which files you created, which docs you referenced, where you had to improvise

`tsc && vite build` must succeed.

## PHASE 4: VISUAL QUALITY AUDIT

After building, evaluate the output against this benchmark: "Would this look at home next to a production React + Next.js + Tailwind 4 + shadcn/ui application?"

For each dimension, rate 1-5 and note gaps:
- Typography hierarchy (h1-h6 scale, weight contrast, line-height)
- Spacing system (section padding, card gaps, content density)
- Color usage (token consistency, contrast ratios, accent usage)
- Interactive states (hover, focus, active, disabled on buttons/cards/inputs)
- Iconography (consistent library, appropriate sizing, meaningful usage)
- Shadows & depth (card elevation, glassmorphic effects, layering)
- Transitions & animations (hover lifts, entrance animations, smooth state changes)
- Form fields (borders, focus rings, placeholder styling, error states)
- Dark mode correctness (no white flashes, proper surface hierarchy)
- Responsive hints (mobile considerations, breakpoint awareness)

## OUTPUT FORMAT

### A: Scaffold Metrics

| Metric | Value |
|--------|-------|
| Sync time | Xs |
| Init time | Xs |
| Files generated by CLI | N |
| Essence version | 3.x.x |
| Sections | N |
| Routes | N |
| Personality type | narrative / array / missing |
| Visual brief coverage | N/M patterns with visual_brief |
| Motion spec coverage | N/M patterns with motion specs |
| Responsive coverage | N/M patterns with responsive strategies |
| Voice presence | YES/NO (scaffold.md Voice & Copy section) |
| @layer cascade | VALID/INVALID (global.css layer order) |
| Personality materialization | YES/NO (section contexts contain Visual Direction) |

### B: Build Metrics

| Metric | Value |
|--------|-------|
| Total pages built | N |
| Total source files created | N |
| Build result | PASS/FAIL |
| Build time | Xms |
| Bundle size (JS) | XKB |
| Bundle size (CSS) | XKB |
| Gzipped total | XKB |
| Packages installed | list |

### C: Token Efficiency Analysis

| Document | Lines | Lines Used | Lines Ignored | Useful % |
|----------|-------|------------|---------------|----------|
| DECANTR.md | N | N | N | N% |
| scaffold.md | N | N | N | N% |
| section-*.md (each) | N | N | N | N% |
| essence.json | N | N | N | N% |
| task-*.md | N | N | N | N% |
| **TOTAL** | N | N | N | **N%** |

**Token waste sources:** (list specific duplications, empty fields, irrelevant content)

**Estimated context tokens consumed:** N tokens
**Estimated useful tokens:** N tokens
**Token efficiency ratio:** N%

### D: Developer Experience Audit

Numbered list. For EACH issue:
- **Category:** CONFUSION | GAP | STALE/WRONG | DRIFT | FRICTION | TOKEN_WASTE | WIN
- **Severity:** CRITICAL | HIGH | MEDIUM | LOW
- **File:** which doc/file the issue is in
- **Description:** 1-2 sentences
- **Framework fix:** where in Decantr this should be fixed (CLI scaffold.ts, theme JSON, pattern content, DECANTR.md template, etc.)

### E: Improvisation Log

For every place you had to guess, improvise, or deviate from documentation:
| What | Why | What docs should have said | Severity |
|------|-----|---------------------------|----------|
| Invented section spacing | No guidance on padding between sections | Theme spatial_hints should specify section_padding | MEDIUM |
| Used inline styles for X | No atom or treatment exists | Add atom or document expected approach | LOW |
| ... | ... | ... | ... |

**Total improvisations:** N
**Inline styles used:** N instances (list which properties)
**Hand-rolled CSS classes:** N (list which)

### F: Treatment Coverage Scorecard

For each of the 7 visual treatment categories, evaluate whether the LLM used the generated classes:

| Treatment | Classes in CSS | Used by LLM (pages) | Improvised Instead | Inline Styles | Coverage % |
|-----------|:-:|:-:|:-:|:-:|:-:|
| Interactive Surface (d-interactive) | count | N/M | count | count | % |
| Container Surface (d-surface) | count | N/M | count | count | % |
| Data Display (d-data) | count | N/M | count | count | % |
| Form Control (d-control) | count | N/M | count | count | % |
| Section Rhythm (d-section) | count | N/M | count | count | % |
| Inline Annotation (d-annotation) | count | N/M | count | count | % |
| Personality Utilities (d-personality-*) | count | N/M | count | count | % |
| **TOTAL** | | | | | **avg%** |

"Coverage" = (pages where LLM used treatment class) / (pages where that category applies).
Target: 80%+ across all categories. Inline styles for treatment-covered elements should be near zero.

### G: Performance & Bundle Analysis

- Largest page component (file size, estimated render cost)
- Largest dependency (package size impact)
- Unused imports or dead code
- CSS specificity issues
- Render-blocking patterns
- Recommended optimizations (code splitting, lazy loading, etc.)

### H: LLM Optimization Recommendations

Things that would dramatically improve LLM scaffold quality:

1. **[IMPACT: HIGH/MEDIUM/LOW]** Description — where to fix, expected improvement
2. ...

Prioritized by: "If I could only fix ONE thing to make the next scaffold better, it would be..."

### I: Architectural Suggestions

Based on what you built, suggest improvements to:
- **Blueprints:** Missing routes, wrong shell assignments, feature gaps
- **Patterns:** Missing patterns that should exist, pattern specs that need enrichment, missing visual_brief
- **Archetypes:** Role misassignment, missing pages, feature gaps
- **Themes:** Treatment CSS quality, missing treatments, decorator completeness, spatial hints accuracy
- **Themes:** Token completeness, missing status colors, palette issues

### J: Theme & Color System Audit

Evaluate the theme's color palette sophistication against modern CSS standards (CSS Color 4, oklch, P3 gamut). Read `src/styles/tokens.css` and the theme JSON from `.decantr/cache/`.

**Palette Completeness:**

| Token Category | Present? | Values | Assessment |
|---------------|----------|--------|------------|
| Primary + hover | Y/N | values | Sufficient contrast? Hover distinct enough? |
| Secondary | Y/N | value | Does it serve a clear role vs primary? |
| Accent | Y/N | value | Used for what? Distinct from primary? |
| Background | Y/N | value | True dark (#18181B) or lazy dark (#1a1a1a)? |
| Surface (1 level) | Y/N | value | Enough contrast against bg? |
| Surface-raised (2 levels) | Y/N | value | Clear elevation hierarchy bg → surface → raised? |
| Border | Y/N | value | Visible but subtle on dark? Not invisible? |
| Text primary | Y/N | value | WCAG AA contrast against bg? |
| Text muted | Y/N | value | Readable but clearly secondary? |
| Success/Error/Warning/Info | Y/N | values | All 4 status colors present? |
| Shadow tokens | Y/N | values | Multiple levels (sm, md, lg)? Appropriate opacity? |
| Radius tokens | Y/N | values | Full scale (sm, default, lg, xl, full)? |
| Gap/spacing tokens | Y/N | values | Full scale (1-12)? |

**Mode Sophistication:**

| Question | Answer | Recommendation |
|----------|--------|---------------|
| Does the theme define SEPARATE palettes for dark and light modes? | Y/N | If no, the AI can't scaffold light mode at all |
| Are light mode surface colors truly light (not just inverted dark)? | Y/N | Light mode needs its own surface hierarchy |
| Does the palette use oklch or hsl for mode derivation? | Y/N | Modern CSS uses oklch for perceptual uniformity |
| Is there a P3/wide-gamut consideration? | Y/N | Modern displays support P3 — palette could leverage it |
| Does the theme have anti-aliased font smoothing guidance? | Y/N | Dark mode needs `-webkit-font-smoothing: antialiased` |

**Depth & Layering Analysis:**

| Layer | Token | Visual Treatment | Assessment |
|-------|-------|-----------------|------------|
| Base (bg) | --d-bg | Background | Is it dark enough for true dark mode? |
| Surface (cards) | --d-surface | Cards, panels | Enough lift from bg? (should be 5-10% lighter) |
| Raised (dropdowns) | --d-surface-raised | Modals, menus | Enough lift from surface? |
| Border | --d-border | Dividers | Visible against surface without being harsh? |
| Shadow sm | --d-shadow-sm | Subtle depth | Appropriate blur + opacity for dark mode? |
| Shadow md | --d-shadow-md | Card hover | Noticeable lift increase? |
| Shadow lg | --d-shadow-lg | Modals | Clear floating effect? |

**Intelligent Effects Assessment:**

| Effect | Palette supports it? | Recommendation |
|--------|---------------------|---------------|
| Glassmorphic blur | Need semi-transparent surface token | Add `rgba(surface, 0.8)` variant or theme handles it |
| Glow on primary | Primary must be light enough to glow on dark bg | Does primary (#7C93B0) glow well? Or too muted? |
| Focus ring | Need primary at low opacity for ring | `rgba(primary, 0.2-0.3)` — is primary vibrant enough? |
| Gradient accent | Need primary → accent direction | Are primary/accent distinct enough for a gradient? |
| Text on primary | Need contrast check | White text on primary bg — passes WCAG? |
| Disabled states | Need muted variants | Enough tokens for disabled opacity treatment? |

**Where fixes belong in the Decantr hierarchy:**

| Finding | Fix location | Example |
|---------|-------------|---------|
| Missing token | `themes/{name}.json` → `seed` or `palette` | Add `surface-glass: rgba(31,31,35,0.8)` |
| Missing mode palette | `themes/{name}.json` → `palette.{token}.{mode}` | Add light mode values |
| Shadow quality | `themes/{name}.json` → tokens and decorators | Theme owns both token values and CSS classes |
| Glow/effects | `themes/{name}.json` → `decorators` + `visual_effects` | Theme owns visual treatments |
| Anti-aliasing | `themes/{name}.json` → `shell.root` class OR CLI CSS generation | Generated CSS should include font-smoothing |
| oklch migration | `themes/{name}.json` → `palette` values | Convert hex to oklch for perceptual uniformity |
| Spacing/density | DNA `spacing` in essence + theme `spatial_hints` | Theme suggests, DNA enforces |
| Personality overrides | Blueprint `personality` string | "prefer oklch tokens, P3 gamut colors" |

**Summary recommendation:** One paragraph describing the overall palette sophistication and the top 3 changes that would most improve the theme's ability to produce visually stunning scaffolds.

### K: Comparison Summary

| Metric | This scaffold | Typical shadcn/Tailwind project |
|--------|--------------|-------------------------------|
| Setup time | Xs | ~5 min (npx shadcn init + components) |
| Token efficiency | N% | N/A (human reads docs) |
| Visual quality avg | N/5 | 4.5/5 (shadcn default) |
| Pages per hour | N | ~3-5 (manual) |
| Bundle size | XKB | ~200-400KB typical |
| Inline styles | N | 0 (Tailwind classes) |
| Hand-rolled CSS | N | 0 (shadcn components) |

### L: Visual Regression Check (Descriptive)

NOTE: You cannot take screenshots. Instead, READ the generated source code for each key page and describe what it WOULD look like. Be specific about visual issues.

For each key page (landing, chat, login, contact, settings):

1. **What does this page look like?** Describe the visual output as if viewing it in a browser.
2. **Does it match the personality?** If personality says "glassmorphic depth" — did you use backdrop-filter anywhere? If "soft shadows" — are shadow tokens applied to cards?
3. **Production-ready?** Would you ship this to production? Or does it look like a prototype/homework assignment?
4. **Specific visual callouts:**
   - Unstyled native form fields (browser default selects, inputs without border-radius)
   - Flat cards with no depth (border-only, no shadow, no hover state)
   - Invisible shadows (rgba opacity too low for dark background)
   - Missing hover/focus/active states on ANY interactive element
   - Sections running into each other (no padding/gap between major sections)
   - Text contrast issues (muted text that's too dim or too bright)
5. **What would Claude.ai / Linear.app / Vercel.com's version of this page look like?** Specific differences.

### M: Personality Compliance Score

The personality directive contains specific visual instructions. Score EACH directive independently:

| Directive (extract from personality) | Followed? (YES/NO/PARTIAL) | Evidence (what you built vs what was asked) |
|--------------------------------------|---------------------------|-------------------------------------------|
| [each specific phrase from personality] | Y/N/P | specific detail |
| ... | ... | ... |
| **Overall compliance:** | **N/M (X%)** | |

If compliance is below 70%: Flag root cause — is it because:
- A) The framework doesn't provide enough CSS/treatment support for the directive?
- B) The documentation didn't emphasize the personality enough?
- C) The AI chose to ignore it in favor of simpler implementation?

### N: Action Plan (Prioritized)

Generate a prioritized action plan with criticality levels:

| Priority | Fix Description | Visual Impact | Token Impact | Effort | Fix Location |
|----------|----------------|---------------|-------------|--------|-------------|
| P0 (FIX NOW) | [highest impact fixes] | +N points | -N lines | S/M/L | exact file |
| P1 (NEXT SESSION) | [important fixes] | +N points | -N lines | S/M/L | exact file |
| P2 (BACKLOG) | [nice to have] | +N points | -N lines | S/M/L | exact file |

After the table, ask:
> "Do you want me to create an implementation plan for the P0 fixes? Estimated: [N tasks, ~N minutes]"

### O: Root Cause Analysis

Don't just list symptoms — trace them to root causes. For each major visual quality gap:

**ROOT CAUSE N: [one sentence]**
- Symptoms: [what the harness found — scores, inline styles, improvisations]
- Why it happened: [what's missing in the framework/content/pipeline]
- Fix: [specific change to specific file]
- Impact: [which scores improve, by how much]
- Dependencies: [does this fix require other fixes first?]

Connect root causes to each other:
> "Root Cause 1 (skeletal treatment CSS) causes Root Cause 3 (90 inline styles). Fixing RC1 eliminates RC3."

### P: Treatment Completeness Audit

For EACH base treatment in treatments.css, evaluate completeness:

| Treatment | Has base? | Has hover? | Has focus? | Has active? | Has disabled? | Has variants? | Has transitions? | Grade |
|-----------|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| d-interactive | Y/N | Y/N | Y/N | Y/N | Y/N | primary/ghost/danger | Y/N | A-F |
| d-surface | Y/N | Y/N | N/A | N/A | N/A | raised/overlay | Y/N | A-F |
| d-data | Y/N | Y/N (row) | N/A | N/A | N/A | header/row/cell | N/A | A-F |
| d-control | Y/N | N/A | Y/N | N/A | Y/N | error (aria-invalid) | Y/N | A-F |
| d-section | Y/N | N/A | N/A | N/A | N/A | adjacent | N/A | A-F |
| d-annotation | Y/N | N/A | N/A | N/A | N/A | 4 status variants | N/A | A-F |

Then evaluate theme decorators separately (same format as before).

### Q: Context Quality Audit

Evaluate the richness of generated context files against v2 expectations:

| Dimension | Present? | Quality (1-5) | Notes |
|-----------|----------|---------------|-------|
| **Section contexts** | | | |
| Decorator table (Class + Usage) | Y/N | N | Are descriptions useful or just names? |
| Token palette table (Token/Value/Role) | Y/N | N | Semantic roles assigned? |
| Theme hints (preferred patterns, compositions, spatial) | Y/N | N | Actionable or vague? |
| Visual Direction section | Y/N | N | Personality materialized with utility refs? |
| Composition algebra (if in content) | Y/N | N | Clear sub-pattern combination rules? |
| Accessibility patterns (if in content) | Y/N | N | ARIA roles, keyboard nav specified? |
| Motion specs (if in content) | Y/N | N | Entrance, exit, hover animations defined? |
| **Scaffold.md** | | | |
| Voice & Copy section | Y/N | N | Tone, CTA verbs, avoid words present? |
| **DECANTR.md** | | | |
| Project Brief section | Y/N | N | Blueprint, theme, personality, features listed? |
| **CSS files** | | | |
| tokens.css @layer tokens | Y/N | N | Wrapped in @layer? |
| treatments.css @layer (treatments, decorators, utilities) | Y/N | N | All three layers present? |
| global.css @layer order declaration | Y/N | N | reset > tokens > treatments > decorators > utilities > app? |

**Context quality score:** N/65 (sum of all quality ratings)

**Average grade:** [X]
**Recommendation:** If average is below B, the treatment generation system needs improvement.

Be brutally honest. The goal is to find every rough edge and make Decantr produce shadcn-quality output from a single `decantr init`.
```

---

## After the Harness

The operator reviews all sections. Key decision points:

1. **Section N (Action Plan)** — review P0 fixes. If the agent offered to create a plan, approve or modify.
2. **Section O (Root Causes)** — understand WHY before fixing WHAT. Root causes often chain together.
3. **Section M (Personality Compliance)** — if below 70%, the framework needs work before the AI can follow personality directives.
4. **Section P (Treatment Completeness)** — if average grade below B, prioritize treatment CSS generation improvement.
5. **Section Q (Context Quality)** — if score below 40/65, the context generation pipeline needs enrichment.

Create:
1. **P0 fixes** — implement immediately (from sections N, O)
2. **Content fixes** — changes to decantr-content (from sections D, I, J, P, Q)
3. **Framework fixes** — changes to CLI scaffold.ts (from sections E, H, O, P, Q)
4. **Regression baseline** — save metrics for comparison (from sections A, B, C, F, K)

### No Cleanup Needed

The harness agent does NOT take screenshots or create temporary files. All analysis is descriptive (reading source code). The only files created are the scaffold output in the showcase directory, which is the intended output. No /tmp/ accumulation.

### Tracking Table

Track improvements across harness runs:

| Run | Date | Token % | Treatment Coverage | Personality Compliance | Treatment Grade | Context Quality | Bundle | Inline Styles | P0 Fixes |
|-----|------|---------|-----------|----------------------|----------------|----------------|--------|--------------|----------|
| 1 | YYYY-MM-DD | N% | N/5 | N% | X | N/65 | XKB | N | N |
| 2 | YYYY-MM-DD | N% | N/5 | N% | X | N/65 | XKB | N | N |
