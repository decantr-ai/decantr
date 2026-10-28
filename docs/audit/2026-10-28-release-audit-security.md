# Release audit dependency remediation

The weekly [October 27 Package Release Audit](https://github.com/decantr-ai/decantr/actions/runs/40567904500)
failed while generating release evidence: the vulnerability audit returned a
failure. The workflow skipped its artifact-upload step after that failure, so
the run did not retain the detailed report. The same scheduled workflow had
failed each week from September 8 through October 27 on source commit
`5a3c796bab242d91d408550c8ac9cd3b800c3049`.

This change updates the MCP SDK and vulnerable workspace resolutions, including
transitive `qs`, `ip-address`, `proxy-addr`, `body-parser`, `zod`, and `undici`.
The broader workspace check also identified vulnerable API, homepage tooling,
showcase, and root development dependencies; those resolutions are updated in
the same repair. The MCP third-party notices now match the rebuilt bundle.
The release evidence gate remains enabled and fail-closed. Artifact upload now
runs after an earlier failure unless the workflow was canceled, preserving the
report when it exists.

On October 28, npm's live advisory report returned zero findings across the
entire updated lockfile. The exact `pnpm release:evidence` command succeeded for
all nine selected public packages. These are point-in-time dependency-audit
results, not a claim that Decantr is free of all security defects.

The older published MCP server bundles its SDK, Zod, and `fast-uri` 3.1.5;
the last dependency has subsequent high-severity advisories. The workspace
audit attributed those `fast-uri` advisories to the API importer and did not
identify the bundled MCP copy. The presence of affected bytes alone does not
establish that a vulnerable operation is reachable. Updating a workspace
lockfile alone does not change published bytes. It is a stdio server, and the
HTTP-specific SDK advisories do not establish exposure through its normal
transport. A separately prepared MCP security patch and its protected release
checks are necessary for consumers to receive the rebuilt bundle. The published
CSS package does not bundle the `jsdom`/`undici` development tree, so that
finding alone does not justify republishing CSS. The deployed API must be
rebuilt and redeployed to receive its Hono and `fast-uri` updates.

The release SBOM currently inventories declared runtime dependencies and does
not fully identify bundled build-time components. The published MCP artifact
was inspected directly, rather than treating that SBOM or the scoped workspace
audit as an exhaustive account of shipped code. A bundle-derived component
inventory remains a follow-up improvement.

The API's existing 10 MiB body guard only checked the `Content-Length` header.
A streamed body without that header could reach JSON parsing without the intended
limit. Hono's body-limit middleware now checks streamed bodies and returns the
same 413 JSON response; regression cases cover oversized streamed and declared
requests, a small streamed request, and CORS preflight. The running Fly service
continues to use its old code until a reviewed deployment.

The regression test was replayed against the previous app: a headerless
oversized stream returned 400 rather than 413. The patched implementation returned
413. All 34 API tests passed, and the new cases also passed under Node 20 and 22.

Zod's upstream array-limit fix does not bound every unbounded array. The MCP
SDK's stdio read buffer has a 10 MiB cap, but it is still possible for a local
client to supply inputs that cause validation work. The dependency update is
security maintenance, not proof that every resource-exhaustion scenario is
eliminated.

No npm version has been changed or published by this repair. Release-specific
versioning, tag-bound tarballs, provenance, publication, and closeout remain
separate steps. Updating this branch alone also does not change the scheduled
workflow running on GitHub's default branch or the deployed API.

The unfiltered `pnpm release:preflight` dry-run failed because the selected
stable packages contain both 3.10.0 and 3.11.3 and the staging code requires one
explicit release version. This is not the weekly vulnerability failure and is
not evidence of a ready-to-publish candidate. A future scoped release needs its
own version and protected release plan; do not treat an all-package dry-run as
MCP release authorization.

The two wave-specific publish dry runs used by the weekly workflow both passed
separately. The final candidate also passed package and API builds, the normal
test suite, 1,131 verifier tests, all nine 3.11 change-assurance trials, the
packed MCP clean-consumer audit, package surface and permission audits, release
readiness, and the public API audit. The weekly workflow itself has not been
run from this branch on GitHub.
