# Package and Release Surface Audit

Date: 2026-04-08
Status: In progress on `codex/decantr-vnext-reset`
Scope: publishable npm packages and their role in the Decantr vNext reset

## 1. Objective

Decantr already has multiple public npm packages. Even though this reset does not require backward compatibility, it still requires explicit package governance.

Without a package-level plan, the reset would create public confusion by leaving outdated or off-strategy packages looking current.

This audit defines how package surfaces should be handled during the vNext reset.

Progress checkpoint on 2026-04-09:

- package support is now captured in `config/package-surface.json`
- public package README coverage is now complete for active package surfaces
- CI now audits the package surface
- the publish workflow now follows a manifest-backed package list instead of a stale hardcoded loop

## 2. Current Publishable Package Surface

| Package | Version | Current role | Initial vNext stance |
|---|---:|---|---|
| `@decantr/essence-spec` | `1.0.0-beta.11` | contract schema and validation | Keep |
| `@decantr/registry` | `1.0.0-beta.12` | registry model and resolver | Keep |
| `@decantr/mcp-server` | `1.0.0-beta.12` | agent delivery surface | Keep |
| `@decantr/cli` | `1.7.5` | local scaffold and maintenance | Keep |
| `@decantr/css` | `1.0.2` | framework-agnostic atom runtime | Keep |
| `@decantr/core` | `1.0.0-beta.9` | internal pipeline / IR foundation | Keep pending scope cleanup |
| `@decantr/verifier` | `1.0.0-beta.1` | shared verification and critique engine | Keep as new core package |
| `@decantr/vite-plugin` | `0.1.0` | verification-related integration | Keep but defer |
| `@decantr/ui` | `0.1.0` | standalone framework experiment | Removed from monorepo on reset branch |
| `@decantr/ui-chart` | `0.1.0` | charting library tied to UI line | Removed from monorepo on reset branch |
| `@decantr/ui-catalog` | `0.1.0` | component stories / metadata for UI line | Removed from monorepo on reset branch |

## 3. Package Governance Rules

### 3.1 Keep packages only if they serve the vNext product nucleus

A package should stay active only if it directly contributes to:

- contract definition
- content access
- compiler runtime
- verification
- AI delivery surfaces
- platform integration

### 3.2 Archived packages still need an intentional public state

If a package is removed from the vNext product, the team should choose one of these outcomes:

1. keep but mark experimental and unsupported
2. deprecate on npm with a clear message
3. move to a separate archive or extraction repo
4. stop publishing further versions and remove it from public product messaging

### 3.3 Public clarity matters more than technical compatibility

Because there are no commercial users to preserve, the priority is not seamless migration. The priority is ensuring the outside world can understand:

- what Decantr is
- which packages are current
- which packages are legacy or experimental
- what the supported path is

## 4. Package-Level Recommendations

### 4.1 Core packages to keep and modernize

#### `@decantr/essence-spec`
- keep as a core vNext package
- likely evolve schema and validation interfaces
- treat package schema exports as the canonical essence contract source
- publish with the new contract direction once stable

#### `@decantr/registry`
- keep as a core vNext package
- align with the new canonical content contract
- treat package schema exports as the canonical registry contract source
- keep browser and Next.js consumers on a web-safe `@decantr/registry/client` entrypoint instead of the Node-oriented root resolver bundle
- remove any assumptions tied to deprecated taxonomy or framework leakage

#### `@decantr/mcp-server`
- keep as a core package
- remove or gate off-strategy tools if the UI-framework line is archived
- align tool inventory with the vNext product boundary

#### `@decantr/cli`
- keep, but narrow the scope
- make sure it reflects the same product story as MCP, API, and docs

#### `@decantr/css`
- keep as long as it remains framework-agnostic and aligned with the control-plane vision
- ensure docs do not present it as a gateway into a broader UI framework product unless that remains intentional

#### `@decantr/core`
- keep provisionally
- clarify whether it is a true compiler / IR foundation or an older internal abstraction that needs reshaping

#### `@decantr/verifier`
- keep as a new core vNext package
- own schema-backed verification reports and shared critique/audit logic
- serve CLI, MCP, and future CI or hosted verification surfaces from one engine

### 4.2 Packages to keep only after review

#### `@decantr/vite-plugin`
- potentially useful in the verification program
- should not drive architecture today
- keep in a parked state until verification engine requirements are clear

### 4.3 Legacy packages already removed from the reset branch

#### `@decantr/ui`
- removed from this reset branch
- public npm/deprecation handling still needs an explicit follow-up decision
- should not shape Decantr’s public identity during the reset

#### `@decantr/ui-chart`
- removed from this reset branch with the UI line
- not part of the control-plane product story

#### `@decantr/ui-catalog`
- removed from this reset branch with the UI line
- useful only if the UI framework ecosystem remains active elsewhere

## 5. Release Strategy for the Reset

### 5.1 Freeze current public state before broad architecture changes

Before major implementation work begins:
- document the current package set
- decide archive targets
- decide which packages stay public and supported

### 5.2 Use an explicit vNext release wave

Do not let package releases drift piecemeal during the reset.

Preferred approach:
- complete the product-boundary cleanup first
- publish coordinated package updates once the new surface is coherent
- use prerelease tags if needed while the reset is in-flight

### 5.3 Deprecate intentionally if packages are archived

If a package is being retired or extracted, add:
- npm deprecation message where appropriate
- README notice
- docs-site update
- repo-level package table cleanup

### 5.4 Treat README and metadata as part of the release surface

The release surface is not only code. It includes:
- npm metadata
- package descriptions
- README content
- installation instructions
- docs-site package tables
- MCP / CLI onboarding instructions

## 6. Immediate vNext Deliverables

### 6.1 Package support matrix

Create a living matrix that marks every package as:
- core and supported
- supported but secondary
- parked
- archived
- extracted

### 6.2 Deprecation policy for the reset

Define when to:
- deprecate on npm
- archive in repo
- extract to another repo
- leave in place but unsupported

### 6.3 Public package cleanup pass

Once product-boundary decisions are locked:
- update package descriptions
- remove stale ecosystem framing
- update README package table
- update docs references
- remove outdated onboarding paths
- include new core packages in package and schema documentation as they ship

## 7. Exit Criteria

This audit is resolved when:

- every publishable package has a clear support status
- the public docs and npm metadata match that status
- archived or extracted packages no longer confuse the main product story
- release sequencing is explicit before the vNext implementation wave begins
