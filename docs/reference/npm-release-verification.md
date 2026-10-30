# npm release verification and registry visibility

`pnpm release:verify` checks public npm version visibility, the expected dist-tag,
the exact published manifest, and public CLI smoke tests where selected. It does
not replace retained-artifact, byte-integrity, signature, or provenance closeout.

| Outcome | Exit code | Meaning |
| --- | --- | --- |
| `pass` | 0 | All selected checks passed. Release closeout is still required. |
| `fail` | 1 | A definitive failure: authorization error, malformed response, wrong manifest identity, workspace protocol leak, or smoke-test failure. |
| `pending` | 2 | Registry evidence remains unavailable or inconsistent after bounded polling. The cause has not been established. |

Only pending registry checks are retried. Queries explicitly use public npm with
`--prefer-online`, disabled offline/prefer-offline settings, an explicit scoped registry override, a fresh disposable cache per query, disabled nested fetch retries, and bounded command timeouts. CLI smoke checks also use the public registry and a fresh cache.
E404 does not prove propagation or staging. Missing versions and stale/missing
dist-tags remain pending. Incorrect manifests and failed smoke tests fail
immediately; CLI smoke tests run only after registry metadata is consistent.

`--retries` caps attempts per package, `--retry-delay` controls the delay, and
`--max-wait` sets one shared registry polling budget in milliseconds across the
selection. Registry query timeouts respect that remaining budget; CLI smoke tests
retain separate bounded timeouts. Defaults are three attempts, 5-second delays,
and a 2-minute shared budget. Invalid or excessive flags are rejected.

Publish uses up to 61 attempts, 15-second delays, and a 15-minute shared budget.
It retains `release-verification-vX.Y.Z` on success, failure, or pending visibility,
including checks, attempts, registry-phase elapsed time, filters, and original publish-run identity. CLI smoke time is excluded from the shared registry polling budget.
`--report-json=/path/to/report.json` writes that report when explicitly requested;
`--json` prints it. Consumers must treat `pending` as incomplete even when
`summary.failed` is zero. A finite wait cannot guarantee eventual npm consistency.

## Resume without publishing again

An exhausted wait returns nonzero and blocks workflow closeout. GitHub marks the
job unsuccessful; the report distinguishes unverified visibility from a rejected
package. Release behavior remains fail-closed.

Retain `release-evidence-publish-tarballs-vX.Y.Z` and its nested manifest. From a
clean checkout of the exact tag with required locked dependencies/builds available,
repeat verification with the same selection, then close out against the original
artifacts and publish run:

```sh
pnpm release:verify -- --only=@decantr/mcp-server --retries=61 --retry-delay=15000 --max-wait=900000
pnpm release:closeout -- --version=X.Y.Z --only=@decantr/mcp-server --publish-run-id=ORIGINAL_RUN_ID --staging-manifest=/absolute/path/to/original/manifest.json
```

Preserve the actual package or wave filters. Do not regenerate substitute
tarballs, republish an immutable version, move `latest`, or disable provenance
merely to obtain a green workflow badge. If visibility remains pending, inspect
npm maintainer state or service availability without asserting an unverified
cause. A later full closeout can complete the release after an Actions visibility
timeout; report both outcomes honestly.
