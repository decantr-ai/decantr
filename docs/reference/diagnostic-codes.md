# Diagnostic Codes

Decantr findings use stable diagnostic codes and typed repair IDs so agents can act on evidence without parsing prose. Codes are intentionally boring: the family says what kind of contract drift was found, and the repair ID says what action class should resolve it.

Use `decantr health --diagnostics --json` for a machine-readable catalog, or `decantr health --diagnostics --markdown` for a compact human reference.

| Family | Meaning |
| --- | --- |
| `CONTRACT` | Essence or contract presence/version issues |
| `STRUCT` | Route, page, shell, or structural contract issues |
| `CTX` | Generated context or execution-pack issues |
| `GRAPH` | Typed Contract graph freshness/readiness issues |
| `COMP` | Component reuse and component policy drift |
| `TOKEN` | Token, design-system, or accepted style bridge drift |
| `VISUAL` | Browser/runtime visual evidence issues |
| `A11Y` | Accessibility contract issues |
| `ROUTE` | Brownfield observed-route drift |
| `CHECK` | Guard/check command findings |
| `INT` | Interaction contract findings |
| `RUNTIME` | Built runtime output findings |
| `AUDIT` | General audit findings |

## Curated Codes

| Code | Rule | Repair ID | Typical Source |
| --- | --- | --- | --- |
| `CONTRACT001` | `essence-present` | `restore-essence-contract` | Restore `decantr.essence.json`. |
| `CONTRACT002` | `essence-v4` | `migrate-essence-v4` | Migrate pre-V4 essence contracts. |
| `STRUCT001` | `page-route-required` | `add-page-route` | Add or repair a missing page route. |
| `STRUCT002` | `declared-route-resolves` | `repair-route-binding` | Reconcile declared routes with real pages. |
| `STRUCT003` | `section-shell-concrete` | `assign-section-shell` | Replace inherited/ambiguous shells with concrete shells. |
| `CTX001` | `page-pack-count-mismatch` | `regenerate-context-packs` | Regenerate stale page/section packs. |
| `CTX002` | `pack-manifest-present` / `pack-manifest-missing` | `hydrate-execution-packs` | Hydrate or repair execution-pack context. |
| `CTX003` | `review-pack-present` / `review-pack-file-missing` | `hydrate-review-pack` | Hydrate or repair the compiled review pack. |
| `GRAPH001` | `typed-graph-current` | `regenerate-typed-graph` | Run `decantr graph` for missing or stale graph artifacts. |
| `COMP001` | `component-reuse-primitive-reimplemented` | `import-existing-component` | Replace a local primitive redeclaration with the existing reusable component. |
| `COMP010` | `component-reuse-raw-control` | `replace-raw-control-with-local-component` | Replace raw JSX controls with project-owned primitives. |
| `COMP020` | `behavior-project-interaction-primitive` / `behavior-dialog-project-primitive` | `use-project-owned-interaction-primitive` | Replace one-off interaction surfaces with accepted project-owned primitives from local law. |
| `TOKEN001` | `tokens-file-present` | `restore-design-token-file` | Restore missing token files where Decantr tokens are authoritative. |
| `TOKEN002` | `design-token-coverage` | `repair-design-token-coverage` | Reconcile exported design tokens with local token usage. |
| `TOKEN010` | `style-bridge-arbitrary-value` | `replace-arbitrary-style-with-bridge-token` | Replace arbitrary Tailwind, inline style, or stylesheet values with accepted style bridge tokens/classes. |
| `VISUAL001` | `browser-playwright-missing` | `install-browser-verifier` | Install or configure browser verification. |
| `VISUAL002` | `browser-base-url-missing` | `provide-browser-base-url` | Provide a browser verification base URL. |
| `VISUAL003` | `browser-route-verification-failed` | `fix-route-render` | Fix a route that fails browser verification. |
| `VISUAL010` | `visual-baseline-screenshot-drift` | `review-visual-baseline-drift` | Review screenshot hash changes since the saved health baseline. |
| `A11Y001` | `focus-visible-enabled` | `enable-focus-visible` | Add visible keyboard focus treatment. |
| `A11Y010` | `behavior-dialog-accessible-name` | `restore-dialog-accessible-name` | Restore accessible names for accepted confirmation-dialog behavior obligations. |
| `A11Y011` | `behavior-form-label-associated` | `restore-label-association` | Restore label association for accepted form-control behavior obligations. |
| `INT010` | `behavior-dialog-visible-consequence` | `restore-visible-consequence-copy` | Restore visible destructive consequence copy in accepted confirmation dialogs. |
| `INT011` | `behavior-dialog-cancel-affordance` | `restore-cancel-affordance` | Restore cancel or close affordances in accepted confirmation dialogs. |
| `INT012` | `behavior-dialog-submitting-guard` | `restore-submitting-guard` | Restore submitting guards for destructive confirmation execution. |
| `INT013` | `behavior-form-explicit-button-type` | `set-explicit-button-type` | Set explicit button types inside accepted form-control behavior. |
| `ROUTE001` | `brownfield-route-drift` | `reconcile-brownfield-routes` | Reconcile observed routes with the contract. |
| `CHECK001` | `check-failed` | `repair-contract-check` | Repair a failed `decantr check` rule. |
| `AUDIT001` | `project-audit-invalid` | `repair-project-audit` | Resolve blocking project audit findings. |

Uncurated findings still receive deterministic fallback codes based on source, rule, id, category, and message. Treat those as stable within the same finding shape, but prefer curated rules for dashboards, automation, and long-lived suppressions.
