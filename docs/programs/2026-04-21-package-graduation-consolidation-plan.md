# Decantr Package Graduation And Consolidation Plan

Date: 2026-04-21

## Summary

Decantr is ready for disciplined package releases, but the current package policy still hides too much uncertainty behind the word `beta`.

That is the part that now needs consolidation.

The release automation is healthy:

- `pnpm audit:release-readiness` passes
- the scheduled `Package Release Audit` workflow is green
- package publishing waves and npm surface audits already exist

The problem is not a missing release mechanism.
The problem is that `beta` is currently doing too many jobs at once:

- "public but still changing"
- "supported but not yet frozen"
- "we have not finished deciding whether this should even be public"
- "we have not frozen the compatibility policy"

That creates operator noise and product ambiguity.

## Program Decision

Decantr should move to a simpler package policy:

1. Stable
   Packages with an intentional public contract, published to npm `latest`, with a compatibility policy we are willing to support.

2. Experimental
   Opt-in packages that are not part of the default Decantr promise. These should not sit in the main public story. If published at all, they should publish under `next`, not `beta`.

3. Internal
   Packages that are real and important, but are not yet good public products. They should support Decantr internally, not pretend to be stable public building blocks before their boundary is clear.

4. Retired
   Packages explicitly removed from the active product story.

The key policy change is:

- no new `beta` maturity
- no package remains beta indefinitely
- every current beta package must be forced into one of three decisions:
  - graduate to stable
  - move to internal
  - stay experimental/opt-in

## Current Surface

Current active package surface:

- `@decantr/css` — stable
- `@decantr/cli` — stable
- `@decantr/essence-spec` — beta
- `@decantr/registry` — beta
- `@decantr/core` — beta
- `@decantr/verifier` — beta
- `@decantr/mcp-server` — beta
- `@decantr/vite-plugin` — experimental

Current audit conclusions:

- `@decantr/css` and `@decantr/cli` are already stable-ready
- the remaining beta packages are blocked for different reasons, not one shared reason

That is an important signal: the right answer is not "graduate all betas at once."
The right answer is "clean up the package model, then graduate the correct packages in order."

## Recommended Public Product Surface

This is the recommended Decantr package story once the cleanup is done.

### Stable Public Foundation

- `@decantr/css`
- `@decantr/essence-spec`
- `@decantr/registry`

These are the most natural stable public contracts:

- CSS runtime and atoms
- schema/types/validation boundary
- registry contracts and client surface

These are the packages external consumers can reason about clearly.

### Stable Public Delivery

- `@decantr/cli`

This is already the strongest user-facing package and should remain a first-class stable line.

### Stable Operator Surface

- `@decantr/verifier`
- `@decantr/mcp-server`

These should only graduate after their long-term report/tool contracts are explicitly frozen.
They are public, but they are not "foundation" packages.
They are advanced/operator packages.

### Internal-Only

- `@decantr/core`

This is the strongest recommendation in this plan.

`@decantr/core` is currently doing important work, but it does not yet read like a clean public low-level integration package.
Right now it is closer to an internal substrate than a finished public contract.

That means we should stop forcing it through a "public beta" identity.

Recommended decision:

- keep `@decantr/core` in the monorepo
- keep it versioned and tested
- stop treating it as a package that must graduate on the same schedule as schema/client-facing lines
- only bring it back into the stable public surface if we later decide to support a deliberate low-level execution-pack API

### Experimental Hold

- `@decantr/vite-plugin`

This should remain outside the default package story until we intentionally decide:

- graduate it as a serious developer-product package
- or archive it

It should not sit in a vague middle lane.

## Concrete Graduation Order

### Wave 0: Policy Cleanup

Goal: remove the conceptual need for `beta`.

Changes:

1. Replace maturity logic in release tooling.
   Current:
   - `stable | beta | experimental`

   Target:
   - `stable | experimental`

2. Introduce an explicit package surface class.
   Recommended field:
   - `surfaceClass: public-foundation | public-delivery | public-operator | internal | experimental | retired`

3. Move non-stable public publishing away from npm `beta`.
   Recommended dist-tag model:
   - stable packages: `latest`
   - experimental opt-in packages: `next`

4. Update release scripts, support matrix generation, and audits so they stop describing "beta blockers" and instead describe:
   - stable graduation blockers
   - internal-only decision
   - experimental hold decision

Exit criteria:

- no active package uses `beta` as its declared maturity
- support matrix reads cleanly without operator translation
- npm tag policy is explicit and boring

### Wave 1: Graduate The Foundation Contracts

Packages:

- `@decantr/essence-spec`
- `@decantr/registry`

Reason:

- they define the most important outward-facing contracts
- other package lines depend on them conceptually
- stable package work should begin where external compatibility matters most

Required work for `@decantr/essence-spec`:

- freeze the essence v3/v3.1 compatibility story
- publish an explicit migration/deprecation policy
- document what counts as compatible additive evolution vs a breaking schema change

Required work for `@decantr/registry`:

- freeze the supported public client API boundary
- freeze the public schema export story
- document what is guaranteed stable between hosted API changes and package client changes

Exit criteria:

- both packages have explicit compatibility guarantees
- both packages have no open blocker text in package-surface metadata
- both publish to `latest`

### Wave 2: Decide `@decantr/core`

This wave is not "graduate core."
This wave is "decide whether core is actually a public product."

Decision options:

1. Internalize it
   Preferred option.
   Keep it internal-only and remove pressure to make it look like a public stable SDK before it is one.

2. Graduate it
   Only do this if we are willing to document and support:
   - the execution-pack boundary
   - the stable low-level API story
   - versioned compatibility expectations for pack compilation and related helpers

Exit criteria:

- `@decantr/core` is no longer in the ambiguous middle
- it is either clearly internal or clearly stable

### Wave 3: Graduate The Operator Packages

Packages:

- `@decantr/verifier`
- `@decantr/mcp-server`

Reason:

- both depend on the foundation contracts being more settled
- both are higher-surface-area packages whose contracts are easier to stabilize after the lower layers stop moving

Required work for `@decantr/verifier`:

- freeze report schemas and findings expectations
- document the supported report contract and compatibility policy
- separate "new checks added" from "breaking report shape change"

Required work for `@decantr/mcp-server`:

- freeze the supported tool surface
- document compatibility expectations for MCP clients
- distinguish additive tool growth from breaking tool contract changes

Exit criteria:

- both packages publish under `latest`
- both have explicit compatibility policies

### Wave 4: Resolve Experimental Or Archive Decisions

Package:

- `@decantr/vite-plugin`

Required decision:

- graduate to real supported developer package
- or archive/remove from the active package story

This package should not be allowed to sit in strategic limbo.

## Package-By-Package Decision Table

| Package | Current State | Recommended State | Why |
| --- | --- | --- | --- |
| `@decantr/css` | stable | stable | Already clear, already public, already low-ambiguity. |
| `@decantr/cli` | stable | stable | Strongest end-user package. |
| `@decantr/essence-spec` | beta | stable next | Best candidate for the next stable graduation wave. |
| `@decantr/registry` | beta | stable next | Public contract package; should not linger as beta. |
| `@decantr/core` | beta | internal by default | Important package, but still too ambiguous as a public contract. |
| `@decantr/verifier` | beta | stable later | Good public candidate after report contracts are frozen. |
| `@decantr/mcp-server` | beta | stable later | Good public candidate after tool contract freeze. |
| `@decantr/vite-plugin` | experimental | experimental or archive | Not part of the core Decantr promise today. |

## Immediate Next Moves

These are the concrete next implementation steps.

1. Rewrite `config/package-surface.json` and the related scripts to eliminate `beta` maturity.

2. Add a new explicit package classification field so the matrix can distinguish:
   - public foundation
   - public delivery
   - public operator
   - internal
   - experimental
   - retired

3. Update:
   - `scripts/package-surface-lib.mjs`
   - `scripts/audit-release-readiness.mjs`
   - `scripts/audit-release-surface.mjs`
   - `scripts/graduation-plan.mjs`
   - `scripts/release-plan.mjs`
   - generated `docs/reference/package-support-matrix.md`

4. Lock Wave 1:
   - `@decantr/essence-spec`
   - `@decantr/registry`

5. Make an explicit product decision on `@decantr/core` before doing any more public package-graduation talk.

6. Upgrade GitHub workflows off Node 20-based actions before calling the release lane fully hardened.

## Operating Rule Going Forward

No package is allowed to remain in a long-lived ambiguous public-prerelease state.

Every package must always have one of these stories:

- stable and supported
- experimental and opt-in
- internal and not part of the public promise
- retired

That is the discipline that replaces "beta forever."
