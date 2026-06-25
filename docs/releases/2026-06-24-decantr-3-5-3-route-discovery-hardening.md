# Decantr 3.5.3 Route Discovery Hardening

Decantr 3.5.3 tightens Brownfield route discovery for source-declared routes without adding a new framework adapter or changing Essence V4.

## Changes

- `decantr scan` and `decantr analyze` now recognize declarative TypeScript route specs shaped like `route("Name", "/path", page(Component))`.
- The extractor is read-only and dependency-free. It does not invoke framework compilers, install packages, or add a Wasp-specific platform lane.
- Brownfield proposals can now include routes declared in Wasp-style `.wasp.ts` spec files, such as `/`, `/login`, `/signup`, `/pricing`, and admin routes.
- Added focused CLI and verifier tests so scan preview and adoption analysis stay aligned.

## Why It Matters

The external 3.5.2 dogfood pass showed that established React/Node/Prisma projects can declare routes through TypeScript route DSLs rather than framework-native file routers or React Router JSX. Decantr should treat those declarations as observable production source truth, while staying stack agnostic.

## Compatibility

- No Essence schema changes.
- No MCP surface changes.
- No package permission changes.
- No new runtime dependencies.
