# Decantr 3.5.2 Security And Dogfood Hardening

Decantr 3.5.2 is a CLI-focused hardening patch for the Brownfield control loop. It clears known GitHub security hygiene before the next external dogfood pass and tightens graph alias resolution flagged by CodeQL.

## What Changed

- Updated pinned GitHub Actions for checkout, pnpm setup, and CodeQL analysis.
- Fixed graph path-alias expansion so tsconfig targets with repeated `*` placeholders are expanded completely and literally.
- Added regression coverage for repeated wildcard alias expansion, including replacement metacharacters such as `$&`.
- Raised vulnerable transitive dependency floors for Vite, Hono, Undici, Babel, esbuild, and blueprint harness `ws`.
- Added a five-project external dogfood report covering scan, adopt, doctor, graph, task, verify, ci, resolve, and unhappy-path commands.
- Realigned the blueprint certification matrix with current generated `DECANTR.md` workflow guidance so CI checks task-first, verify/ci handoff, and compiled-pack authority instead of stale wording.
- Kept Essence V4, MCP tools, hosted upload behavior, telemetry, and report schemas unchanged.

## Release Scope

- `@decantr/cli@3.5.2`

Repository apps, internal harnesses, workflow pins, and lockfiles are updated for security posture, but no additional npm package public surface changes are introduced.
