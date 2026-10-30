# Bundled dependency evidence

Release evidence distinguishes dependencies declared for installation from
third-party code embedded in a build. A development dependency can ship inside
JavaScript even when consumers do not install it separately.

The MCP build captures esbuild's actual output contribution metadata and writes
`.decantr-build/bundled-dependencies.json` inside the package checkout. Only inputs
with a nonzero contribution to runtime JavaScript become bundled components.
Package identities come from the owning installed package manifest, including
nested package boundaries. Reports contain package-relative input names, exact
versions, and final JavaScript hashes, without absolute build-machine paths.

`config/bundled-dependency-inventories.json` lists builds that supply inventories.
During `pnpm release:evidence`, configured inventories are required and checked
against the package manifest, workspace lockfile, complete runtime output set,
output hashes, and JavaScript bytes extracted from the actual packed tarball.
Rebuild packages when any of those checks fail. Packages without a configured
inventory are marked `not-configured`; this does not assert that they contain
no bundled dependencies.

For configured packages, evidence includes `bundled-dependencies.json` alongside
the CycloneDX report. Bundled components are added to the SBOM with a
`decantr:bundled=true` property and deduplicated with matching declared components.
Component identities use CycloneDX's standard `bom-ref` field; this also corrects
the former nonstandard `bomRef` field on declared components. Packed verification
rejects extra or duplicate JavaScript members, including files outside `dist`.
The inventory lives outside the package's published `dist` directory and is
excluded from npm contents. It changes release reporting, not the installed MCP
runtime or its public tool inventory.

The collector uses [esbuild metafiles](https://esbuild.github.io/api/#metafile).
Attributed byte counts are compiler estimates, not exact postprocessing byte
allocation. Inclusion does not establish exploitability, runtime reachability,
or absence of vulnerabilities. External runtime dependencies remain separate;
this is not a full transitive installation inventory or a signed build attestation.
The existing workspace advisory-audit selection is unchanged. A passing advisory
audit must not be described as exhaustive coverage of these bundled components;
their explicit names and versions are now available for separate advisory triage.

## Validation

`node --test scripts/bundled-dependencies-lib.test.mjs` exercises nested ownership,
excluded tree-shaken inputs, stale lockfile/manifest/runtime output, missing
configured evidence, SBOM deduplication, and actual tarball byte mismatches.
These tests run as part of `pnpm test:release-tooling` and default `pnpm test`.

An actual MCP 3.11.4 build inventories SDK 1.32.2, Zod 4.6.7, fast-uri 3.1.9,
Ajv, ajv-formats, fast-deep-equal, json-schema-traverse, and zod-to-json-schema.
Express, qs, and the CSS test dependency undici are not included merely because
they are present in the development installation. Recompute versions from the
current build rather than treating this snapshot as policy.
