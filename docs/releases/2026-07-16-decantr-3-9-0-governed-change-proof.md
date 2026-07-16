# Decantr 3.9.0 Governed Change Proof

Date: 2026-07-16

Release status: authorized for direct stable publication under the explicit sole-maintainer waiver; public release remains incomplete until packed/public artifact verification and release closeout pass. This release is not human-qualified or adoption-proven.

## Product Change

Decantr 3.9 connects project selection, task preparation, and verification through canonical evidence contracts without becoming an autonomous agent, public marketplace, or hosted control plane.

The release keeps production source first, accepted project-owned local law and an explicitly accepted style bridge next, Essence V4 as the structural contract, and official `@decantr/content` guidance as advisory until explicitly adopted.

## Implemented Behavior

- `@decantr/verifier` owns `AdoptionTruthV1`, `TaskCapsuleV1`, `GovernanceDeltaV1`, their JSON Schemas, normalization, and deterministic builders.
- CLI project workflows, MCP project/task reads, explicit CI v3, and Studio adapt those verifier contracts instead of defining separate truth shapes.
- CLI and MCP task context lead with the discovered route implementation, preserve existing top-level compatibility fields, carry content identity/digest provenance, and enforce a deterministic 12,000 canonical UTF-8 byte / 4,000 estimated-token budget.
- `@decantr/core` provides the shared changed-file graph-impact resolver used by higher-level task and proof surfaces.
- `decantr ci` and generated workflows remain v2 by default. Explicit `--report-version v3` adds adoption truth and governance delta; project mode supports `--since`, and workspace mode emits per-project proof plus a deterministic aggregate gate.
- CI v3 classifies missing, stale, or incompatible baseline/change evidence as `not_proven`. It does not label all current findings as new or create/update a baseline.
- Studio is a read-only renderer for current project state and supported project-mode v2/v3/contract artifacts. Refresh recomputes in memory; commands and repair prompts are copy-only.
- First-party content clients, resolver types, ranking, discovery, wiring, schemas, and provenance are owned by `@decantr/content`.
- `@decantr/registry` delegates to content-owned implementations while preserving documented Decantr 3.x import paths, client aliases, schema paths, and environment compatibility.
- The packed content facade audit installs tarballs in a clean npm prefix, checks runtime/schema delegation, verifies `REGISTRY_URL`, rejects workspace links, and scans for retired-host/local-path leakage.

## Compatibility

- Existing v2 report schemas and default exit behavior are unchanged.
- Essence V4 is unchanged.
- MCP keeps the server identity `io.github.decantr-ai/mcp-server`, stdio transport, and exactly these eight tools: `decantr_project`, `decantr_contract`, `decantr_context`, `decantr_graph`, `decantr_registry`, `decantr_verify`, `decantr_repair`, and `decantr_contract_write`.
- The MCP npm package includes `server.json` for directory metadata parity.
- `@decantr/registry`, `decantr registry ...`, `REGISTRY_URL`, and MCP `decantr_registry` remain compatibility surfaces.
- `@decantr/css` remains a legacy optional adapter and is not made a default.
- No npm package, CLI command, MCP tool, account/billing system, hosted source upload, or default telemetry endpoint is added.

## Intended Package Wave

- `@decantr/content@3.9.0`
- `@decantr/registry@3.9.0`
- `@decantr/core@3.9.0`
- `@decantr/verifier@3.9.0`
- `@decantr/mcp-server@3.9.0`
- `@decantr/cli@3.9.0`

`@decantr/essence-spec`, `@decantr/css`, `@decantr/telemetry`, and `@decantr/vite-plugin` are not version-bumped solely for alignment. Release tooling determines the final dependency closure.

## Qualification Status

The original 84-route/24-forbidden/200-finding draft remains quarantined as `legacy-unqualified` and does not count toward release gates.

The executable qualification lane now produces content-addressed candidate evidence for 84 unique ordered route cases, including 24 genuine competing forbidden-first sources, plus 270 isolated machine samples across three frozen targets. The same machine lane records exhaustive adoption and Studio filesystem boundaries, exact package/tarball identities, cross-surface agreement, immediate CI, capsule budgets, determinism, offline content parity, all Studio modes, exact MCP/v2 compatibility, workspace CI, and reproducibility. These artifacts must be regenerated from the committed candidate and revalidated before human review begins; their existence does not make `qualificationClaim` true.

The remaining human-owned blockers are:

1. Signed identities and complete independent workbooks from exactly two distinct actual human reviewers.
2. A frozen, two-reviewer, human-adjudicated corpus containing exactly 200 exhaustive finding judgments.
3. A public npm 3.8.3 finding replay with a recomputable confusion matrix and separate precision/recall Wilson intervals.
4. A final packed or public 3.9.0 finding replay against the same frozen corpus.

Decantr has one human maintainer. Stable publication is therefore authorized by `fixtures/qualification/3.9/release-waiver.json` with these exact four gaps retained, rather than inventing a second reviewer. The waiver does not make the packet complete: no finding precision, finding recall, release-qualification, or adoption-proven claim may be made for 3.9.0.

## Release Gate

The release steward must retain passing output from:

```bash
pnpm install
pnpm build
pnpm test
pnpm audit:package-surface
pnpm audit:package-permissions
pnpm audit:packed-content-facade
pnpm audit:3-9-release-gate
pnpm release:preflight
```

The publish wrapper must also retain the content-addressed staging manifest and tarballs. After both 3.9 package/release-evidence gates pass, it creates the same canonical tarball exercised by qualification and enterprise evidence from each pnpm package snapshot. The shared archive contract fixes path order, manifest key order, timestamps, portable metadata, and gzip output so macOS and Linux produce the same bytes. The wrapper verifies machine-qualified tarballs against the packet's SHA-256 identities, records `sole-maintainer-unqualified`, and publishes those exact `.tgz` paths. It must not inspect one tarball and let npm or pnpm repack the package directory for publication. Hashes are checked again immediately before the OIDC attempt and, when needed, before token fallback.

A real local 3.9 publish is fail-closed unless the worktree is clean, `HEAD` is exactly `v3.9.0`, the local and remote tag both resolve to `HEAD`, the tag is reachable from `origin/main`, and fetched `origin/main` matches the live remote main ref. Selection-only and publish dry runs remain nonpublishing; they do not relax the real-publish source requirement.

After authorized stable publication, closeout requires:

```bash
pnpm release:verify
pnpm release:closeout -- --version 3.9.0
```

Closeout consumes the retained staging manifest, rehashes its tarballs, downloads the public npm tarballs, and requires byte identity with the retained SHA-256 plus npm SHA-512/SHA-1 metadata. When npm advertises OIDC provenance, closeout also binds the SLSA subject digest and protected `publish.yml` source to the release commit. It additionally runs npm's native signature audit against an exact install of the selected public versions. An intentional token fallback remains supported and is recorded without claiming unavailable OIDC provenance.

The first 3.9.0 publication must be stable. Do not publish an RC, `next`, `candidate`, canary, or alternate 3.9.0 dist-tag. Run the public npm adoption-proof matrix and commit a dated, human-reviewed audit before changing this note or product copy to describe 3.9.0 as adoption-proven.

## Upgrade

Publish these commands only after release closeout succeeds:

```bash
npm install -D @decantr/cli@3.9.0
npm install @decantr/mcp-server@3.9.0
```

Direct consumers of content, compatibility, graph, or verifier primitives should upgrade the six-package 3.9.0 dependency closure together.
