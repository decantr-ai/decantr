# Decantr 3.5.1 External Dogfood Hardening

Decantr 3.5.1 is a CLI-only hardening patch from the first external Brownfield dogfood pass against established open-source apps.

## What Changed

- `decantr doctor` no longer crashes when CI discovery encounters directory candidates such as a root `BUILD/` directory.
- `decantr doctor` now avoids reading non-file CI candidates, preventing `EISDIR` failures on real repositories after dependencies are installed.
- Typed graph freshness is stable after regenerating graph artifacts for changed source. Rebuilding the same graph snapshot preserves prior snapshot lineage and diff output instead of making `.decantr/graph/*` look stale.

## Package

This patch bumps and publishes only:

- `@decantr/cli@3.5.1`

No Essence, verifier, MCP, hosted upload, telemetry, or permission-surface changes are included.
