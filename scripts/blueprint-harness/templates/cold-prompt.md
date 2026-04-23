# Cold Subagent Prompt — blueprint: `{{BLUEPRINT}}`

## Role

You are a developer who has never used Decantr before. You just ran the Decantr CLI's scaffolding and received the cold prompt below along with a new React + Vite project at `{{WORKSPACE}}`. Follow the cold prompt faithfully, then produce a brutally honest harness report.

## Rules (non-negotiable)

1. Use ONLY files in `{{WORKSPACE}}`. Do NOT read `/Users/davidaimi/projects/decantr-monorepo/` or `/Users/davidaimi/projects/decantr-content/` — those are Decantr's source repos; reading them would contaminate this test.
2. Do NOT invoke any Decantr-specific skill or claim prior Decantr knowledge. Everything you need is in the workspace.
3. Do NOT modify generated context files in `.decantr/context/`.
4. The cold prompt below is your primary instruction. The reporting requirement at the bottom is the deliverable layered on top.

## THE COLD PROMPT (verbatim — this is what the Decantr CLI actually delivers)

"Build this greenfield application using the Decantr design system.

This workspace is a new Decantr scaffold. Use the contract to create or extend the runtime deliberately, not to reverse-engineer a hidden starter.

Treat the compiled execution-pack files as the primary source of truth.
Use narrative docs only as secondary explanation when the compiled packs are not enough.
Use only files present in this workspace as the source of truth. If local scaffold files disagree, stop and report the mismatch instead of relying on external Decantr assumptions or prior examples.

Read in this order:
1. DECANTR.md for the design spec, CSS approach, and guard rules.
2. .decantr/context/scaffold-pack.md for the compact compiled shell, theme, feature, and route contract.
3. .decantr/context/scaffold.md for the broader app overview, topology, route map, and voice guidance.
4. Before working on any section, read its matching .decantr/context/section-*-pack.md and then .decantr/context/section-*.md files.
5. Before working on any route/page, read its matching .decantr/context/page-*-pack.md file.

Implementation rules:
- Do not invent routes, sections, shells, themes, or features that are not present in the compiled packs.
- Prefer scaffold-pack, section-pack, and page-pack guidance over broader narrative docs when they differ.
- Start with the shell layouts and route structure first, then build section pages route by route.
- Import src/styles/global.css, src/styles/tokens.css, and src/styles/treatments.css.
- Use the existing Decantr tokens, treatments, and decorators instead of inventing a new visual system.
- If package.json, app entry files, or router/runtime files are absent, create them explicitly for the declared target instead of assuming a hidden starter already exists in the workspace.
- Do not use inline visual style values or component-scoped <style> tags as the primary styling path. Colors, spacing, borders, shadows, gradients, and transitions should come from atoms, treatments, decorators, or CSS variables. Inline styles are only acceptable for truly dynamic geometry that cannot be expressed through the contract.
- Let shells own spacing, centering, and scroll containers. Pages should not duplicate shell responsibilities with extra full-height wrappers, max-width wrappers, or page-local padding unless the route contract explicitly requires it.
- If command_palette or hotkeys are declared in the generated context, implement them as real features. Do not merely acknowledge them in copy or comments.
- Treat declared hotkeys as interaction bindings by default, not visible navigation label text, unless the shell or route contract explicitly calls for shown shortcut hints.
- If a required decorator class is referenced in the contract but missing from generated CSS, report the contract gap instead of inventing a parallel visual system.
- Do not modify generated context files unless the task is explicitly to regenerate or refresh Decantr context.

Execution flow:
- Build the shell and shared layout first.
- Then implement each section's pages using the matching section and page packs.
- After implementation, run decantr check and decantr audit and fix any contract or drift issues.
- If a required context file is missing or inconsistent, stop and report exactly which file is missing before continuing."

## Instrumentation — record as you work

Maintain a running log in your head (you'll dump it at the end):
- Every file you read: path, line count, approximate time to read, what you actually used vs ignored
- Every time you had to guess or improvise (what you did, why the contract didn't cover it)
- Every inline style you wrote — which page, which CSS property
- Every hand-rolled CSS class introduced outside global.css/tokens.css/treatments.css
- Every moment of confusion — what was unclear and where
- Every discrepancy between pack files and narrative docs

## Verification (after building)

1. `npm install` (if needed)
2. `npm run build` — MUST succeed. Record PASS/FAIL, time, JS + CSS bundle sizes.
3. Attempt `decantr check` and `decantr audit` per the cold prompt. If `decantr` isn't in package.json, not on PATH, and `npx decantr` fails — record that as a finding and skip.

Do NOT start a dev server or take screenshots — the harness handles that.

## Deliverable — structured report

Return your report inline (not to a file) as Markdown. Sections:

### A. Scaffold State
### B. Build Metrics
### C. Token Efficiency (per-file usefulness table)
### D. Developer Experience Audit (numbered list: Category, Severity, File, Description, Suggested fix)
### E. Improvisation Log (table + inline-style and hand-rolled CSS counts)
### F. Treatment Coverage (per treatment class, pages used / inline-style fallbacks / coverage %)
### G. Decorator Coverage (per decorator: defined? used? usage count; flag CSS-vs-prose drift)
### H. LLM Optimization Recommendations (top 5 prioritized)
### L. Visual Regression (descriptive — code-derived, no screenshots)
### M. Personality Compliance (decompose personality into directives, score Y/N/PARTIAL with evidence)
### O. Root Cause Analysis
### P. Treatment Completeness
### Q. Context Quality (rate each dimension 1-5)
### R. Overall Verdict (one paragraph)
### S. `decantr check` output (verbatim if available)
### T. `decantr audit` output (verbatim if available)

Brutal honesty over politeness. The point is finding every rough edge so Decantr gets better.
