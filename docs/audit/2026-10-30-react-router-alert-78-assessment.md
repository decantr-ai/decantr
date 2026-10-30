# React Router alert #78: frozen fixture usage assessment

Assessment date: 2026-10-30. Reviewed source: main commit
`cc9180cb4a5cbde4595fce4259448563b3b37121`.

## Decision and scope

Dismiss only [Dependabot alert #78](https://github.com/decantr-ai/decantr/security/dependabot/78)
as **Vulnerable code is not actually used** (`not_used`), with this assessment
linked in the dismissal comment. The maintainer explicitly authorized this
documented disposition. This supersedes the earlier instruction to retain the
alert open in [the dependency triage record](2026-10-30-dependency-triage.md);
that record's original observations remain historical evidence.

The alert identifies `react-router` 7.15.1 in
`fixtures/qualification/3.9/oracles/route-source/package.json`, concerning
[GHSA-qwww-vcr4-c8h2](https://github.com/advisories/GHSA-qwww-vcr4-c8h2).
The upstream advisory states that this CSRF vulnerability affects applications
using unstable React Server Components (RSC) APIs. The dependency version is
within the affected range; this decision does not claim it is patched or that
all uses of this version are safe.

## Evidence for non-use of the affected code path

- The fixture's `src/router.tsx` declares object routes using
  `createBrowserRouter`; its layout modules import `Outlet`. No unstable RSC
  API or server-action handler was found in this fixture.
- `run-oracle.mjs` imports the selected built verifier's `discoverProject`
  export and calls it on the fixture directory. It reads and hashes fixture
  files and emits discovery evidence; it does not import the fixture router,
  start a React Router server, or execute RSC actions.
- The root pnpm workspace includes only `packages/*` and `apps/*`. This
  historical fixture is outside that workspace and is not an application
  selected for the production API deployment.

These observations support a scoped non-applicability decision for this
advisory in the current source-analysis use. They are not a general security
certification or new qualification result.

## Preservation and reassessment

All 83 tracked files under `fixtures/qualification` are preserved byte-for-byte
against the reviewed commit. The aggregate SHA-256 is
`cec900d2f939d0567d89eb95ab2f68b78a2860a33ca516fd97c46896ca21491e`.
To reproduce it, sort the repository-relative tracked paths and hash, for each
path, its UTF-8 path, a NUL byte, its raw content, and a NUL byte.

No fixture manifest, source, captured output, receipt, or qualification status
is changed. No replay, evidence regeneration, dependency installation inside
the fixture, or npm publication is needed for this disposition.

Reassess and reopen this alert if the fixture is executed as a server, gains
RSC or server-action behavior, enters a deployed/runtime dependency closure,
or the advisory expands beyond the reviewed code paths. Assess new advisories
independently; do not apply a directory-wide suppression. A future patched
runtime fixture must be a separate versioned baseline with its own evidence,
leaving this historical input intact.
