# Decantr Scaffold Audit Remediation Plan

Date: 2026-04-13
Status: Active
Context: First cold-start external audit of the new scaffolding system, plus Decantr-side certification and source review

## 1. Purpose

This plan captures the Decantr-side response to the first unbiased cold-start scaffold audit.

The goal is not to tune one generated app until it looks handcrafted. The goal is to improve the
Decantr system where the audit exposed real product-level gaps:

- broken or stale wiring
- inconsistent contract delivery
- missing accessibility defaults
- verifier false positives or weak signal separation
- scaffold/runtime gaps that make the operator experience less reliable than the vNext master plan intends

This plan explicitly avoids theme-by-theme or app-specific patchwork.

## 2. What Is Already Closed

These issues were real and have already been repaired:

1. `terminal-dashboard` was repaired as a representative blueprint outlier.
   - `composeSections()` now resolves archetype layout aliases into concrete pattern references instead of leaking alias names into sectioned essence output.
   - `decantr check` now reads real local pattern/theme registry context instead of evaluating guard rules against empty registries.
   - the v3 essence schema now accepts the already-modeled `dna.constraints` metadata.
2. The representative blueprint certification matrix is now real and green at `6/6`.
   - `product-landing`
   - `saas-dashboard`
   - `agent-marketplace`
   - `knowledge-base`
   - `registry-platform`
   - `terminal-dashboard`
3. The matrix command now builds the package dependencies it actually relies on (`@decantr/essence-spec`, `@decantr/registry`, `@decantr/core`, `@decantr/cli`) so stale workspace dist output does not produce misleading results.

## 3. Triage Principles

### Fix now if it is:

- a contract delivery bug
- a scaffold/runtime wiring bug
- a DNA/accessibility failure
- a verifier signal bug that causes obvious false positives or hides real regressions
- a repeated operator experience failure likely to affect many blueprints

### Do not treat as urgent if it is:

- a high-effort showcase-quality enhancement
- optional interaction richness beyond current scaffold tier
- component architecture taste rather than contract fidelity
- SEO embellishment on non-SSR/hash-router scaffolds

## 4. Priority Order

## Priority 0: Critical System Integrity

These items most directly affect whether Decantr scaffolds are trustworthy.

### 4.1 Real `@decantr/css` runtime in cold-start scaffolds

**Problem**
- The audited scaffold used a local `css()` stub and a hand-written `atoms.css` instead of the real `@decantr/css` runtime.
- Current Decantr guidance clearly expects the real runtime, but the cold-start generated app package surface does not enforce that strongly enough.

**Why this matters**
- This is core product contract drift, not visual polish.
- If models routinely bypass `@decantr/css`, Decantr loses one of its main framework-agnostic runtime guarantees.

**Systemic fix**
- Align `init` / cold-start package scaffolding with the same runtime dependency expectations already present in `new-project`.
- Ensure generated project package metadata and imports make the intended `@decantr/css` path the easiest path.
- Decide whether locally generated `atoms.css` is:
  - a temporary fallback that should be explicitly marked as such, or
  - a behavior to remove in favor of the real runtime.

**Exit criteria**
- Fresh cold-start scaffolds use the real `@decantr/css` runtime by default, or the fallback mode is made explicit and intentional in docs and verification.

**Master-plan fit**
- Track B: Contract Compiler
- Track C: Target Adapters
- Track G: Docs and positioning rewrite

### 4.2 Accessibility baseline defaults for skip nav and reduced motion

**Problem**
- The audited scaffold missed skip navigation and reduced-motion handling.
- Decantr’s own verifier also flags those omissions.

**Why this matters**
- These are DNA/accessibility expectations, not optional polish.
- If Decantr says `skip_nav: true` and `reduce_motion: true`, scaffold outputs need stronger default support.

**Systemic fix**
- Strengthen shell/global scaffold guidance so every app has:
  - a skip link
  - a stable main landmark target
  - a baseline reduced-motion branch
- Tighten the generated CSS and/or shell examples so these are easier to adopt correctly.
- Consider raising the salience of these requirements in `DECANTR.md` and page/shell contexts.

**Exit criteria**
- Representative cold-start scaffolds include or clearly implement:
  - skip link + main target pairing
  - `prefers-reduced-motion` handling
- Verifier signals remain consistent with those expectations.

**Master-plan fit**
- Track D: Verification Engine
- Track G: Docs and positioning rewrite

### 4.3 Pack/runtime freshness hygiene

**Problem**
- The first audit exposed a stale-build symptom where newly modeled spatial tokens appeared as `undefined` in section context output until dependent packages were rebuilt.

**Why this matters**
- This is a trust issue in local operator workflows.
- If Decantr’s generated contract surface depends on stale package dist output, audits can report false regressions.

**Systemic fix**
- Audit and tighten local build dependency assumptions for scaffold-sensitive commands.
- Make sure package build order is explicit anywhere scaffold certification or operator smoke tests are run.
- Consider whether root/operator commands should prefer source-linked execution in dev workflows or require a workspace preflight.

**Exit criteria**
- Scaffold-sensitive commands and smoke paths are deterministic from a clean local workspace.

**Master-plan fit**
- Track B: Contract Compiler
- Track J: Package and release governance

## Priority 1: High-Value Product Hardening

These issues are not as foundational as Priority 0, but they materially improve consistency and trust.

### 4.4 Clarify treatment vs decorator overlap

**Problem**
- The audit correctly called out ambiguity around `d-control` vs `carbon-input`.
- Similar overlap exists around loading decorators like `carbon-skeleton`.

**Systemic fix**
- Establish a simple rule:
  - treatments are semantic base behavior
  - decorators are optional theme-specific augmentation
- Update docs and examples so models know when decorators should layer on top versus stay unused.

**Exit criteria**
- The design-system docs clearly explain when to use:
  - `d-control`
  - `d-surface`
  - `d-annotation`
  - theme decorators such as `carbon-input`, `carbon-glass`, `carbon-skeleton`

**Master-plan fit**
- Track B
- Track G

### 4.5 Shell contract execution details

**Problem**
- The audit exposed ambiguity around:
  - compact header button sizing
  - sidebar auto-collapse breakpoint behavior
  - route-change page transitions

**Systemic fix**
- Move the most important shell behaviors from descriptive prose into more directly actionable shell contract fields or examples.
- Prefer reusable shell recipes over one-off prose hints.

**Exit criteria**
- Shell contexts are less interpretive for:
  - header compact controls
  - breakpoint-driven collapse
  - page transition triggering

**Master-plan fit**
- Track B
- Track C

### 4.6 Verifier false-positive reduction

**Problem**
- Some current verifier findings on generated apps are too noisy to be trusted at face value, especially:
  - “no explicit post-auth destination” when a clear protected destination exists
  - built-JS HTML injection / insecure transport marker counts that may overreact to bundle internals

**Systemic fix**
- Tighten heuristics so:
  - source evidence beats generic built-bundle string counts
  - role-aware route detection is more tolerant of non-`/dashboard` primary destinations
  - warnings reflect actionable product risk, not implementation noise

**Exit criteria**
- Verifier results are more credible and less likely to drown real scaffold problems in noise.

**Master-plan fit**
- Track D

## Priority 2: Scaffold Quality and Guidance Improvements

These are good improvements, but they should not displace Priority 0 or Priority 1.

### 4.7 Motion/stagger/scroll-reveal guidance refinement

**Problem**
- The audit found partial stagger coverage and missing scroll reveals/page-transition depth.

**Systemic stance**
- This is useful quality work, but not a core contract failure.

**Fix direction**
- Add stronger examples or recipes for:
  - route transitions
  - staggered card/list reveals
  - scroll-triggered section entrance

### 4.8 Complex pattern capability labeling

**Problem**
- The audit highlighted that some pattern contracts describe rich features like minimaps, drag/connect, or force layout that may be too heavy for scaffold-tier output.

**Fix direction**
- Make complexity expectations more explicit in pattern metadata and section/page packs.
- Mark advanced interaction capabilities as:
  - required
  - recommended
  - optional

### 4.9 SEO expectations by platform type

**Problem**
- The audit flagged limited SEO output on a hash-routed scaffold.

**Fix direction**
- Clarify what Decantr expects for:
  - SPA/hash scaffolds
  - SSR/static-hosted routes
- Avoid over-prescribing SSR-style SEO behavior to obviously client-routed prototypes.

## 5. Explicit Non-Priority / Intentional Tradeoffs

The following findings should not currently drive major system work:

- force-directed graph layout, minimap drag viewport, drag-to-connect, or other advanced canvas interactions
- full live-data streaming behavior in scaffold-tier apps
- exporting every pattern slot as a separate top-level component
- handcrafted component abstraction purity when the visual/result contract is already correct
- exhaustive SEO enrichment on clearly non-SSR scaffolds

These may still matter for showcase-quality examples, but they are not the best use of system-level effort right now.

## 6. Recommended Execution Sequence

1. Real `@decantr/css` runtime default path for cold-start scaffolds
2. Accessibility baseline defaults: skip nav + main landmark + reduced motion
3. Pack/runtime freshness and local build hygiene
4. Treatment vs decorator clarification
5. Shell contract execution details
6. Verifier false-positive reduction
7. Motion/stagger/scroll-reveal guidance refinement
8. Complex pattern capability labeling
9. Platform-specific SEO expectation cleanup

## 7. Success Condition

This remediation wave is successful when:

- representative cold-start scaffolds remain green in the certification matrix
- Decantr-generated apps use the intended runtime/tooling path by default
- core accessibility defaults are scaffolded or made unmistakably required
- verifier output becomes more trustworthy and less noisy
- remaining scaffold issues are primarily polish, not contract integrity failures
