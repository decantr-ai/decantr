# Decantr 3.11.5: Exact Component-Reuse Import Advice

This release publishes `@decantr/verifier@3.11.4`, `@decantr/cli@3.11.4`, and
`@decantr/mcp-server@3.11.5` together under tag `v3.11.5`. Existing CLI and MCP
releases pin verifier 3.11.3, so both consumers need a patch to deliver the fix.
Foundation, content, CSS, and experimental packages are not version-bumped.

## Corrected behavior

Decantr could match a locally declared `AuthoringDraftReconcileButton` to a
shared `Button` by its primitive suffix, then claim the shared module exported
`AuthoringDraftReconcileButton` and recommend an invalid import. `COMP001` now
requires matching declaration names before selecting an exact-import repair.

Exact-name redeclaration findings and the separate `COMP010` raw-control reuse
check remain available. Differently named feature wrappers are no longer
classified as exact shared redeclarations merely because their suffix matches.
This patch does not add complete alias, default, or separate-export resolution.
It does not change report schemas, CLI commands, or the eight-tool MCP surface.

The regression fails on the original implementation and passes with the fix.
The full verifier suite passes 1,132 tests across 22 files, and verifier build
and declaration generation pass. Astra reviewed the implementation with no
actionable blockers. Publication also requires the applicable package,
changed-UI qualification, clean-consumer, and protected release gates.

All 83 frozen qualification fixture files retain their exact bytes. CAYV was
used read-only as development evidence; no finding-accuracy, adoption, human
qualification, or frontier-model improvement claim follows from this patch.
The API does not execute the changed component-reuse code, and its consumed
verifier schemas are unchanged, so no API deployment is required.

## Upgrade

```bash
npx @decantr/cli@3.11.4 verify
npx @decantr/mcp-server@3.11.5
```

Library consumers should update to `@decantr/verifier@3.11.4`. Existing exact
CLI/MCP dependency pins will not receive the correction without upgrading.
