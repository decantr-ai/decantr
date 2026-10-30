# Dependency triage: production, development tooling, and frozen evidence

Source baseline: `24b767d6369c7d8287ac3d2a773cea2b255fbc2c`.
The October 30 GitHub alert inventory contained eleven open alerts.

| Scope | Decision |
| --- | --- |
| Main pnpm lockfile: `@hono/node-server` | Update 2.0.11 to patched 2.1.3. The advisory concerns a second path decode in `serveStatic`; the API imports `serve`, and no API `serveStatic` use was found. This is dependency maintenance, not evidence of an exploitable API path. |
| Standalone blueprint harness: nine alerts | Upgrade Puppeteer Core 24.42.0 to 25.16.0, using browsers 3.2.6. This removes the unpatched extract-zip dependency and the obsolete basic-ftp/ip-address tree. Zod resolves to patched 4.6.7. Remove obsolete overrides instead of forcing incompatible transitive majors. |
| Frozen 3.9 route oracle: React Router 7.15.1 | Preserve the exact fixture. Its advisory concerns unstable RSC APIs; this fixture declares client-side `createBrowserRouter`, and its oracle executes verifier discovery over source rather than running a React Router server. No RSC execution path was found. Retain the alert with this scoped assessment; do not silently dismiss it or upgrade the historical input. |

Advisory references: [Node adapter](https://github.com/advisories/GHSA-rmxm-3fg6-px4f),
[ZIP symlink write](https://github.com/advisories/GHSA-7pqw-9j4j-h8q3),
[ZIP symlink traversal](https://github.com/advisories/GHSA-jmr9-qjv8-65gv),
[frozen React Router input](https://github.com/advisories/GHSA-qwww-vcr4-c8h2).
Severity alone does not establish exploitability in Decantr's actual execution.

The standalone harness now requires Node 22.12 or newer, as required by its
upstream dependency. This does not raise the published Decantr packages' Node
20.19 minimum. Use `npm ci --ignore-scripts` in the harness directory; it is not
a member of the root pnpm workspace. The browser launch uses the current boolean
`headless` option.

## Verification and preservation

- Live `pnpm audit` and standalone harness `npm audit` returned zero known
  advisories after the updates. Neither audit includes the excluded historical
  qualification manifest, which remains a documented open alert.
- Package/API builds and API typechecking passed. The default suite passed
  2,235 tests with six existing skips; all 51 release-tooling tests passed.
  The updated standalone harness installed reproducibly with `npm ci`.
  MCP release evidence passed and its canonical tarball is byte-identical to
  published 3.11.4.
- Actual Node HTTP adapter smoke passed: `/health` returned 200 and an oversized
  streamed POST returned the expected 413 JSON response.
- Actual isolated Chrome smoke passed on Node 25 and the declared minimum Node
  22.12: auth-seeded navigation and both mobile/desktop PNG dimensions were
  verified. Temporary profiles and screenshots were removed. No public site or
  existing user browser profile was used.
- Qualification packet lint passed with its existing `INCOMPLETE` human-review
  status. No qualification replay, packet regeneration, or human decision was
  performed or claimed.
- All 83 files under `fixtures/qualification` retain their exact content. The
  sorted path-plus-content SHA-256, with NUL separators, is
  `cec900d2f939d0567d89eb95ab2f68b78a2860a33ca516fd97c46896ca21491e`
  before and after the change. No frozen source, label, snapshot, or receipt is
  edited to clear a security badge.

The MCP bundle does not include the Node server adapter. This change does not
require republishing MCP, CLI, verifier, CSS, or foundation packages. Merging the
lockfile update does not deploy the API; a separate authorized deployment is
needed to put the patched adapter into the running service. Do not describe
local validation as a production deployment or as new qualification evidence.
