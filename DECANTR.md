## Project Brief

- **Blueprint:** custom
- **Theme:** existing (auto mode, rounded shape)
- **Workflow:** brownfield-attach
- **Adoption mode:** contract-only
- **Personality:** observed brownfield product
- **Sections:** 1 (custom [primary])
- **Guard mode:** strict

## Development Workflow

Use the Decantr change-control loop for UI work:

**0. Check the current change:** run bare `decantr verify` at any point for zero-write Changed-UI Assurance. It needs no adoption and reports at most three consequential findings. Treat `not_proven` as a stop condition.

**1. Observe:** run `decantr scan` and inspect selected-app, surface-authority, topology, taskability, component-inventory, styling-authority, and runtime-evidence limitations independently.

**2. Prepare:** run `decantr task <target> "<intent>"`. A target can be a proven route, exact surface ID, component, layout, overlay, story, package, or `file:<path>` selector. Read every ranked source before editing. Stop when the result is `blocked` or `unsupported`; treat `limited` as an explicit review requirement.

**3. Edit:** preserve production source and accepted local law. When the requested change intentionally alters project structure, update the Essence with CLI commands for consistency:
- `decantr add page {section}/{page} --route /{path}`
- `decantr add section {archetype}`
- `decantr add feature {name}` (or `--section {id}` for scoped)
- `decantr remove page {section}/{page}`
- `decantr remove section {id}`
- `decantr remove feature {name}`
- `decantr theme switch {name}`

**4. Verify:** run the verification command returned by task context, normally `decantr verify`.

**5. Report:** preserve the typed evidence or explicit `not_proven` result. CI v3 is opt-in through `decantr ci --report-version v3`.

When the Essence changes, run `decantr refresh` and read the updated context before building.

**Rules:**
- Never promote a route, component, or styling candidate into authority because a filename, dependency, fixture, story, generated tree, or stale analysis mentions it
- Never create page components for routes that have neither proven production authority nor an explicitly reviewed Essence change
- Never delete pages without removing them from the essence
- Always refresh after mutations — stale context files lead to drift
- If you edit the essence directly, run `decantr refresh` before building

---
# DECANTR.md

This project uses **Decantr** for AI Frontend Governance. Read this file before generating or editing UI code.

**Before editing a UI surface, run `decantr task <target> "<intent>"`.** Use the returned authority, ranked reads, limitations, and verify command as the working context. If you are an AI assistant, do not start source changes when target resolution is blocked, unsupported, or ambiguous.

---

## What is Decantr?

Decantr is a local Contract / Context / Evidence and UI change-control layer that sits between you (the AI coding agent) and the code you produce. Its operating loop is **Observe -> Prepare -> Verify -> Report**. It uses project-owned authority, structured schemas, guard rules, and a two-layer model (DNA + Blueprint) to make UI changes reviewable.

**Decantr does NOT generate code.** You generate or edit the code. Decantr keeps the result coherent, consistent, and repairable.

Decantr 3.11.3 is the current stable release. Bare `decantr verify` checks the current Git-scoped UI change; the 3.10 independent UI-surface model remains its authority foundation. For SvelteKit route tasks, `+page.svelte` is the taskable implementation and colocated page-data modules are supporting authority only. Shipped product behavior is not proof that Decantr improves frontier models. The separate frozen qualification program must pass before making a measured model-lift claim.

---

## Two-Layer Model

### DNA (Design Axioms)

DNA defines the foundational design rules. **DNA violations are blocking contract errors** -- they must never happen without updating the essence first.

DNA axioms include: Theme (id, mode, shape), Spacing (density, content gap), Typography (scale, weights), Color (palette, accent count), Radius (philosophy, base), Elevation (system, levels), Motion (preference, reduce-motion), Accessibility (WCAG level, focus-visible), and Personality traits.

### Blueprint (Structural Layout)

Blueprint defines sections, pages, routes, features, and pattern layouts. **Blueprint deviations are usually advisory structural warnings** -- they should be corrected or reviewed, but they do not normally block generation unless the active workflow makes them strict.

Blueprint includes: Sections (grouped by archetype with role, shell, and scoped features), Page definitions with layouts and pattern references, Routes (URL mapping), and Features (resolved from archetype union + blueprint overrides).

---

## Guard Rules

| # | Rule | Layer | What It Checks |
|---|------|-------|----------------|
| 1 | Style | DNA (error) | Code uses the theme specified in DNA |
| 2 | Density | DNA (error) | Spacing follows the density profile |
| 3 | Accessibility | DNA (error) | Code meets the WCAG level |
| 4 | Theme-mode | DNA (error) | Theme/mode combination is valid |
| 5 | Structure | Blueprint (warn) | Pages exist in the blueprint sections |
| 6 | Layout | Blueprint (warn) | Pattern order matches the layout spec |
| 7 | Pattern existence | Blueprint (warn) | Patterns referenced resolve from official corpus or accepted local content |
| 8 | Interactions | Experiential (configured) | Declared interaction signals are present in production UI source; static detection does not prove runtime behavior |

### Enforcement Tiers

| Tier | When Used | DNA Rules | Blueprint Rules |
|------|-----------|-----------|-----------------|
| **Creative** | New project scaffolding | Off | Off |
| **Guided** | Adding pages or features | Error | Off; interaction findings warn when enabled |
| **Strict** | Modifying existing code | Error | Warn; interaction severity follows `interactions_enforcement` |

This project uses **strict** mode.

### Violation Response Protocol

When a user request would violate guard rules:

```
1. STOP   -- Do not proceed with code that violates DNA rules
2. EXPLAIN -- Tell the user which rule would be violated and why
3. OFFER  -- Suggest an explicit Essence edit or `decantr_contract_write` with `action: "update_essence"`
4. WAIT   -- Only proceed after the essence is updated
```

**Never make "just this once" exceptions.** If the user insists, update the essence first.

### MCP Tools for Drift Management

- `decantr_project` -- Read project state, shared discovery, and workspace health
- `decantr_contract` -- Read/validate Essence, inspect drift, and load the Contract capsule
- `decantr_context` -- Load scaffold/page/task context; call with `{ "action": "task" }` before UI edits and honor blocked or limited authority
- `decantr_graph` -- Query graph snapshots, nodes, edges, and impact
- `decantr_registry` -- Compatibility content-corpus and execution-pack helper
- `decantr_verify` -- Run local audit/critique and read Evidence Bundles or health-loop state
- `decantr_repair` -- Read findings, repair plans, prompts, and loop guidance
- `decantr_contract_write` -- Explicit write surface for reviewed drift/Essence changes

Task context is compact by default. Request `detail: "full"` only when full graph nodes/edges and expanded context are needed.

---

## How To Use This Project

### Authority

`decantr.essence.json` is the structural contract. It is not evidence that every declared or discovered surface is reachable in production.

Authority order for this project:

1. The existing production source is the observed implementation truth.
2. Accepted `.decantr/local-patterns.json`, `.decantr/rules.json`, and `.decantr/style-bridge.json` are project-owned local law where present.
3. `decantr.essence.json` is the structural contract for routes, sections, DNA, guard mode, and intended product shape.
4. Official corpus patterns and execution packs are guidance unless the project maps them into accepted local law.

When runtime source and Decantr context disagree, report the drift and run `decantr doctor` or the verify command returned by task context; do not guess which side wins. Keep selected app, surface authority, topology completeness, taskability, component inventory, styling authority, and runtime evidence separate. One strong axis does not repair another unresolved axis.

### Initial scaffolding

This project is using Decantr in **brownfield attach** mode.

This project is using Decantr in **brownfield attach** mode with **contract-only** adoption.

No `.decantr/analysis.json` or `.decantr/init-seed.json` was present when this context was generated. Inventory the current framework, routes, styling, layout, package manager, and rule files before changing runtime code. Read `.decantr/context/scaffold.md` for the local topology, route, and voice contract. If `.decantr/context/scaffold-pack.md` is later hydrated, prefer that more specific compiled contract when the two differ.

Preserve the current framework, package manager, router, and working runtime structure unless the contract gives you a reviewed reason to change them. Official corpus content is optional in this workflow unless the task explicitly asks for it.

### Working on a section

Read `.decantr/context/section-{name}.md` for the section contract before implementation. If a compiled `section-{name}-pack.md` is later hydrated, prefer that more specific pack when the two sources differ. Do not invent section features, shells, or themes outside the local contract.

### Working on a UI surface

Run `decantr task <target> "<intent>"` before editing. Read the files it ranks first and preserve the authority and limitation blocks it prints. Valid selectors can include a route such as `/settings`, an exact surface ID, a component or overlay name, `kind:name`, or `file:src/path/to/file.tsx`.

For a proven route, use the route source, narrative context, and Contract capsule listed by `decantr task`. If a compiled `page-{name}-pack.md` is later hydrated, prefer it over broader narrative context when they differ. For components, layouts, overlays, stories, packages, and exact files, static discovery may remain `limited` because it does not prove runtime reachability. Do not turn limited evidence into a clean claim.

### Editing rules

- Follow the **Styling Adoption** section below before adding dependencies, imports, tokens, or runtime CSS.
- If a local `package.json` is present, trust its declared Decantr dependencies and the project adoption mode over external assumptions about package availability.
- Do **not** create a parallel styling runtime or hand-written substitute for a package that the project does not use.
- Import the legacy Decantr CSS runtime only when the adoption section below explicitly declares `decantr-css`. In `style-bridge` mode, use only the project-owned bridge files named by the local context; a style bridge does not authorize installing `@decantr/css`.
- Reuse the project-owned components, variants, tokens, and design-system primitives instead of inventing a new visual system. Use Decantr runtime styling only when the adoption section explicitly enables it.
- Do **not** use inline visual style values or component-scoped `<style>` tags as the primary styling path. Colors, spacing, borders, shadows, gradients, and transitions should come from the project's adopted styling system. Inline styles are only acceptable for truly dynamic geometry that cannot be expressed through the contract.
- Shells own spacing, centering, and scroll containers. Page components should not duplicate shell responsibilities with extra full-height wrappers, max-width wrappers, or page-local padding unless the route contract explicitly requires it.
- When the adoption section explicitly requires a Decantr CSS class, report a missing class as a contract gap instead of inventing a parallel visual system.
- If `dna.accessibility.skip_nav = true`, add a visible-on-focus skip link and a matching main landmark target such as `<main id="main-content">`.
- If `dna.motion.reduce_motion = true`, add an explicit `prefers-reduced-motion: reduce` path in project CSS.
- Do not modify generated context files unless you are explicitly regenerating or refreshing Decantr context.
- If a required context file is missing or inconsistent, stop and report which file is missing before continuing.

### Validation

Run bare `decantr verify` for zero-write Changed-UI Assurance before handoff or pull requests. Run `decantr verify --full` for the broader Project Health view. Preserve failures and missing proof in the report rather than summarizing them away. Use `decantr ci init` to install the default GitHub Actions gate, `decantr health --prompt <finding-id>` to generate a scoped remediation prompt for a specific issue, and `decantr studio` as an advanced read-only view of local findings and evidence.
Declared command palettes and hotkeys must be implemented, not merely acknowledged.

### Quick Commands

```bash
decantr setup                         # Detect project state and next workflow step
decantr scan                          # Observe UI authority with zero writes
decantr doctor                        # Explain current state, authority, and next steps
decantr graph                         # Generate or refresh the typed Contract graph
decantr task <target> "<intent>"      # Prepare change-scoped context before AI edits
decantr verify                        # Check the current Git-scoped UI change with zero writes
decantr verify --full                 # Run the broader Project Health gate
decantr ci init                       # Install the pinned CI gate
decantr ci --report-version v3        # Report explicit governed-change evidence
```

---

## Styling Adoption

This project uses Decantr as a **contract and governance layer only**.

Do not install `@decantr/css`, rewrite the styling system, or add generated Decantr CSS files unless the task explicitly changes the adoption mode. Preserve or deliberately select one project-owned styling system and use it consistently.

Use the available files in `.decantr/context/` to understand visual intent, shell structure, and route contracts. Prefer compiled scaffold/section/page packs when present; otherwise use the narrative scaffold and section context. Implement the contract through the project's selected CSS, component library, tokens, or design-system primitives.

### Interaction Requirements

Every interaction declared by local route context or a compiled page pack must be implemented in source through the project's selected component library, CSS, or event-handler patterns.

| Declared interaction | Canonical implementation shape |
|----------------------|--------------------------------|
| `animate-on-mount` | Entrance animation class or component transition on the pattern root |
| `stagger-children` | Parent stagger class or animation delay driven by child index |
| `keyboard-navigation` | Arrow-key/Enter/Space handlers with visible focus state |
| `ripple-click` | Project-native click feedback on the interactive surface |
