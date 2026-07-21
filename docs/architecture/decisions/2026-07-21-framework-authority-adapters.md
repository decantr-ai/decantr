# Framework Authority Adapters

Date: 2026-07-21

Status: Accepted for Decantr 3.9

## Decision

Decantr is stack-agnostic at the governance-contract layer, not at the source-parser layer.

`AdoptionTruthV1`, `TaskCapsuleV1`, `GovernanceDeltaV1`, Essence, the typed graph, and Project Health remain common contracts. Source authority is established by framework-specific adapters that understand how an application actually boots, routes, styles, and renders components.

An adapter must report separate facts instead of one blended confidence score:

- authority: `proven`, `inferred`, or `unresolved`
- extraction completeness: `complete`, `partial`, or `unknown`
- taskability: whether a route resolves to a production page implementation
- provenance: bootstrap, router, lazy-route, and implementation files
- exclusions: test, fixture, mock, E2E, and generated paths removed from production evidence
- limitations: unresolved expressions, runtime-only behavior, missing external inputs, and bounded output

The global score is presentation metadata. It cannot override a failed authority or completeness axis.

## Angular 3.9 Adapter

The Angular adapter selects the app through `angular.json` or `project.json`, resolves the configured `browser` or `main` entry, builds a TypeScript source program without test and fixture paths, and follows static imports from the selected bootstrap.

Production route authority requires a bootstrap-reachable `provideRouter(...)` or `RouterModule.forRoot(...)`. The adapter resolves imported `Routes` arrays, spreads, static path constants, nested `children`, lazy `loadChildren`, lazy `loadComponent`, default route exports, and `RouterModule.forChild(...)`.

Lazy route boundaries remain graph signals and authority files. They are not taskable pages unless a component renders at that path. Redirects and catch-all routes are not taskable. An unresolved component or lazy route expression makes extraction partial and prevents the affected route from becoming task context.

Angular `@Component` classes, including external-template components, form the component inventory. Styling authority starts with selected-app build styles and runtime/config evidence. A Tailwind dependency alone is not Tailwind authority. PrimeNG, Sass, Tailwind/PostCSS, CSS directives, and configured global styles are reported independently with evidence and limitations.

## Operational Policy

For Angular Brownfield projects in 3.9:

- `scan` may report inferred signals, but it withholds the adopt recommendation unless authority is proven and extraction is complete.
- `adopt` and direct existing-app `init` refuse unproven discovery before writing governance files. `--force` is an explicit operator override after manual review.
- CLI and MCP route tasks refuse when the current production route is not proven. A stale `.decantr/analysis.json` cannot outrank live source discovery.
- CI v3 marks graph proof incomplete and returns `not_proven` when route authority or completeness is insufficient.
- tests, fixtures, mocks, E2E files, and generated source cannot become production route authority.

Other framework adapters retain their Decantr 3 compatibility behavior until they expose equivalent proof. This is an explicit capability difference, not a claim that a generic regex parser proves every framework.

## Consequences

This model prevents a high aggregate score from laundering bad route data into a contract baseline. It also allows Decantr to add Angular, React Router, TanStack, Vue, SvelteKit, Next, Nuxt, and future adapters incrementally without fragmenting the governance contracts consumed by CLI, MCP, CI, and Studio.

The cost is adapter-specific engineering and qualification. Each adapter needs pinned real-world repositories, adversarial fixtures, production-entry proof, implementation-source assertions, style-authority assertions, and explicit unsupported cases. Runtime corroboration can be added later as a second evidence source, but it must not silently replace static provenance or make a partial static graph appear complete.
