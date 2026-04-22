# Workflow Bootstrap Surface Audit

Date: 2026-04-22

## Summary

This audit was run to separate **contract-layer adapter metadata** from **greenfield runtime bootstrap behavior**.

The main conclusion:

- Decantr already had adapter metadata at the contract layer.
- The CLI bootstrap path was still the primary place where React/Vite assumptions leaked into the workflow story.
- The rest of the public package surface is much closer to the intended model than the bootstrap path suggested.

## Findings by Surface

| Surface | Status | Notes |
| --- | --- | --- |
| `@decantr/cli` | action required | `cmdNewProject()` embedded React/Vite file generation directly instead of resolving a bootstrap adapter seam. |
| `@decantr/core` | aligned | Owns canonical pack adapter labels such as `react-vite`, `vue-vite`, `nextjs`, and `generic-web`. This is the correct naming source. |
| `@decantr/registry` | aligned | Registry contracts and client utilities are framework-agnostic. |
| `@decantr/mcp-server` | mostly aligned | Tool defaults still mention React examples in some places, but the surface itself is contract-driven rather than runtime-bound. |
| `@decantr/verifier` | aligned | Verification logic is file/runtime focused, not greenfield-bootstrap bound. |
| `@decantr/css` | aligned | Framework-agnostic CSS atom runtime. |
| `@decantr/essence-spec` | aligned | Target strings exist in schemas, but there is no hard dependency on one UI framework. |
| `@decantr/vite-plugin` | intentionally scoped | This package is Vite-specific by design and should stay classified as experimental rather than being mistaken for a Decantr-wide assumption. |
| `apps/api` | aligned for this initiative | Hosted registry/API surfaces do not need a registry schema change for brownfield optionality in this wave. |
| `apps/registry` | aligned for this initiative | Registry UX may describe workflows, but brownfield adoption must remain optional and not encoded as a dependency. |

## Systemic Gap

The systemic gap was not “Decantr is secretly React-only.”

It was narrower:

- the pack/compiler layer already understood multiple targets
- the brownfield analyzer already existed
- the CLI help and runtime bootstrap path still implied a blueprint-first React/Vite story

That mismatch created the impression that:

- `decantr new` was the universal front door
- `decantr init` was secondary
- `decantr analyze` was informational instead of foundational

## Resulting Direction

The corrective direction for this wave is:

1. keep contract targets framework-agnostic
2. formalize three workflow lanes
3. add an internal bootstrap adapter seam in the CLI
4. keep only the current React/Vite starter wired through that seam
5. make brownfield `analyze -> init` the explicit adoption path
6. keep registry content optional for brownfield teams

## Accepted Boundaries

This wave does **not** attempt:

- full greenfield runnable starters for Angular, Vue, Svelte, Astro, or Next.js
- registry schema changes just to support brownfield attachment
- forcing registry content into brownfield adoption

Those remain future adapter milestones rather than reasons to keep the current CLI story ambiguous.
