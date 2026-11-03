# Component-reuse correction: scoped release plan

The implementation was merged in PR #160 (`202cb4c37f65475606dc6ef199ae5b0649c527dd`).
Prepare three patch packages: verifier 3.11.4, CLI 3.11.4, MCP server 3.11.5.
Use the new immutable release tag `v3.11.5`; do not move existing `v3.11.4`.
MCP package metadata and directory metadata must both identify 3.11.5.

## Scope and checks

Use `--only=@decantr/verifier,@decantr/cli,@decantr/mcp-server` consistently for
selection, evidence, publication, verification, and closeout. Internal dependency
closure includes already published packages; retain their versions and skip
publication rather than aligning or reattributing them to this release.
CLI and MCP packed manifests must resolve the fixed verifier 3.11.4 exactly.

Validate frozen-lockfile installation, package builds, the default tests,
changed-UI qualification, package surface, release readiness, content,
documentation, permissions, scoped vulnerability evidence, and clean packed
consumers. Require Astra's review of this plan and prepared changes before
publication. Retain all 83 qualification fixture files unchanged, including
aggregate SHA-256 `cec900d2f939d0567d89eb95ab2f68b78a2860a33ca516fd97c46896ca21491e`.

## Protected publication and closeout

Merge release preparation only after checks pass. Confirm no conflicting publish
is active. Record Publish's current state, temporarily disable only that workflow
to prevent its broad tag-push route, push the reviewed `v3.11.5` tag, and restore
and verify its original active state even on failure. Then manually dispatch
`publish.yml` from main with the exact tag, package selection, and
`publish_auth_strategy=oidc`. Do not fall back to token-only publication.

Retain the workflow's content-addressed tarballs, staging manifest, verification
report, and closeout result. Verify exact npm versions/latest tags, packed
dependency pins, public tarball bytes, signatures/provenance, clean-consumer
CLI/MCP behavior, and tag-bound closeout. Registry visibility retries must remain
bounded and fail closed; never republish an existing version to repair a badge.
Any recovery must use the original retained artifacts and publish-run identity.
Keep the original publication manifest marking CLI/verifier as `published`: a
fresh publishing rerun could mark these lower-version packages `already-published`
and incorrectly classify their provenance as historical during closeout.

Verify a non-draft, non-prerelease GitHub Release and separately publish/verify
MCP directory version 3.11.5, because manual npm dispatch does not trigger the
automatic directory path. No API deployment, community announcement, research
execution, or changes to CAYV are part of this release.

This is a product correctness patch. Passing release checks does not complete
the research qualification program or establish general finding accuracy.
