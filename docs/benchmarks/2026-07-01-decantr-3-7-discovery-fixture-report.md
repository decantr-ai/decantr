# Decantr 3.7 Discovery Fixture Report

Fixture: `packages/verifier/fixtures/discovery/mixed-angular-react-tanstack`

This fixture reproduces the Brownfield discovery class reported by real users: a pnpm monorepo with an Angular sibling app and a React/Vite/TypeScript app using TanStack Router, Tailwind 4 `@theme`, CSS variables, feature-folder UI, chart/form primitives, and generated route-tree evidence.

## Verified 3.7 Result

Command:

```bash
node packages/cli/dist/index.js scan --project packages/verifier/fixtures/discovery/mixed-angular-react-tanstack/apps/react-console --json
```

Observed summary:

| Field | Result |
| --- | --- |
| Schema | `scan-report.v2` |
| Framework | `react` |
| Package manager | `pnpm` |
| Primary language | `typescript` |
| Project path | `apps/react-console` |
| Route strategy | `source-declared` |
| Route signals | 3 |
| Taskable routes | 3 |
| Components discovered | 4 |
| Component confidence | `medium` |
| Styling | `tailwind` via CSS `@theme` |
| Dark mode | detected |

The key before/after criterion was not raw route count. The criterion was whether Decantr could keep app scope honest: selected React app, root package manager, no Angular sibling contamination, route evidence separated from taskable routes, and component count presented as advisory static inventory with confidence.

## Remaining Limitations

- Component inventory remains static and advisory. It is stronger than the previous narrow directory scan, but it is not a proof that every reusable UI primitive was found.
- Generated route-tree paths can be valid source-declared route evidence, but Decantr still treats them as static evidence rather than runtime proof.
- Runtime/browser evidence is outside this fixture report; it still requires a runnable app and `verify --base-url`.
