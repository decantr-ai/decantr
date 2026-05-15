# Brownfield 2.9.x Dogfood Confidence Report

Date: 2026-05-15
Scope: Brownfield contract-only adoption, monorepo onboarding, task-time activation, local law, CI wiring, and adversarial LLM usage after the 2.9.4, 2.9.5, and 2.9.6 polish releases.

## Verdict

Brownfield is stable enough to move the next active product program to Hybrid fortification.

The 2.9.x Brownfield path now covers the first-mile user loop:

```bash
pnpm add -D @decantr/cli
pnpm exec decantr setup
pnpm exec decantr adopt --project apps/web --yes
pnpm exec decantr doctor --project apps/web
pnpm exec decantr task /route "Describe the change"
pnpm exec decantr verify --project apps/web
```

That path is not perfect. The remaining issues are mostly depth and clarity polish, not blockers for moving the main attention to Hybrid. The product should keep Brownfield in hardening mode while Hybrid gets its own equivalent dogfood pass.

## Test Setup

The dogfood target was a clean temporary copy of the `culinary-platform` monorepo:

- Source: `/Users/davidaimi/projects/culinary-platform`
- Temp target: `/tmp/decantr-295-cold-dogfood-Gwwjy2/culinary-platform`
- Excluded from copy: `.git`, `node_modules`, `.next`, `dist`, `build`, `.turbo`, `coverage`, and test artifacts.
- Removed only in temp: `.decantr`, `decantr.essence.json`, and `DECANTR.md`.

The temp repo was deliberately made messier before adoption by adding conflicting UI and design-system files:

- `apps/flavorbase-web/components/dogfood/ConflictingButtons.tsx`
- `apps/flavorbase-web/app/dogfood-conflicts/page.tsx`
- `apps/flavorbase-web/styles/bootstrap-legacy.css`
- `apps/flavorbase-web/styles/tailwind-overrides.css`

Those files introduced raw buttons, inline styles, raw hex and rgb values, Bootstrap-like classes, Tailwind-like overrides, a variant theme selector, and a localhost debug link.

## What Passed

`decantr setup` correctly detected the repo as a monorepo and identified five app candidates:

- `apps/flavorbase-web`
- `apps/marketplace`
- `apps/operator-console`
- `apps/partner-portal`
- `apps/recipefork-web`

`decantr adopt --project apps/flavorbase-web --yes` correctly handled a cold Brownfield attach:

- Detected Next.js 15.5.6, TypeScript, App Router, pages, routes, components, CSS styling, and observed feature signals.
- Wrote Brownfield analysis artifacts under the selected app rather than the monorepo root.
- Accepted the observed contract-only Brownfield proposal without taking source ownership.
- Hydrated hosted execution packs when online.
- Ran Project Health, saved a baseline, and printed the Brownfield operating loop.

The adopted project produced useful first-pass findings:

- Inline-style drift.
- Security-risk source patterns.
- Localhost endpoint evidence.
- Accessibility gaps such as skip-nav and focus evidence.
- Unsafe context risk around local environment files.

The 43-case scenario sweep passed 41 cases before the final 2.9.6 fix and passed the two release-blocking command-shape cases after the fix:

- `decantr add page app/foo --project apps/flavorbase-web` resolves the `app` section alias to the observed primary section.
- `decantr add feature saved-recipes --section app --project apps/flavorbase-web` resolves the same alias instead of requiring users to know `observed-primary`.

The blind-agent pass confirmed that Decantr now behaves usefully for a user who does not know the Decantr engineering context:

- `setup` gave a clear starting point before and after adoption.
- `doctor` explained project state, local law, visual evidence, and next commands.
- `task` produced route-local Brownfield context after codified local law existed.
- `verify` and health prompts were copy-pasteable enough for LLM remediation.
- `ci init --force` generated a project-scoped workflow and printed the exact CI command.
- Missing routes failed cleanly with known routes.
- Incompatible Angular, Svelte, and Solid prompts were treated as task text and kept the existing app authority intact.

## Fixes Shipped From Dogfood

The dogfood cycle produced three Brownfield releases:

- 2.9.4: project-prefixed health prompt read targets, root-safe build commands, production-UI interaction evidence filtering, contract-only token-export copy, and improved workspace-list copy.
- 2.9.5: `decantr add page app/foo` section alias support for observed Brownfield app sections.
- 2.9.6: `decantr add feature --section app` section alias support for observed Brownfield app sections.

## Known Non-Blockers

These remain important, but they should not hold the move to Hybrid:

- Inline-style remediation prompts can still cite broad evidence before citing the most relevant newly injected files.
- `decantr suggest "standardize buttons"` is weaker than `decantr codify --from-audit` for project-owned Brownfield law discovery.
- Global CLI installs can confuse users when `decantr --version` differs from `pnpm exec decantr --version`.
- `task` can still produce useful context for a route whose source evidence is stale, while `verify` reports the stale route drift. That behavior is technically correct but needs sharper wording.
- Pre-codify `verify --local-patterns` failure is expected, but the remediation copy should make the local-law sequence even more obvious.
- Cross-stack task prompts should explicitly say when the requested framework is not the current app runtime.

## Product Backlog

Keep these in the Brownfield backlog while Hybrid work begins:

- Richer source evidence ranking for health prompts and task context.
- Stronger local-law and project-owned pattern weighting in `suggest`.
- Local-first command guidance that warns when a global CLI is older than the pinned workspace package.
- Better distinction between route freshness, task activation, and generated artifact freshness.
- More explicit runtime-boundary messaging for incompatible framework requests.
- Continued randomized Brownfield dogfood after each Hybrid-adjacent release.

## Content And Registry Impact

No `decantr-content` schema or registry-content change was required by the 2.9.4 through 2.9.6 dogfood fixes.

The issues were CLI and docs workflow ergonomics:

- Monorepo project targeting.
- Contract-only Brownfield messaging.
- Local-law activation.
- Generated CI command safety.
- Observed-section aliases.

Registry content remains relevant to Hybrid because Hybrid needs to explain how hosted patterns, local patterns, and app-owned law combine without forcing a registry takeover.

## Decision

Brownfield 2.9.x is credible for first-mile contract-only monorepo adoption and day-two LLM activation.

The product still needs more Brownfield fortification, but the next highest-leverage program is Hybrid: the path where an existing app intentionally adopts selected Decantr or registry capabilities without surrendering its local design authority.
