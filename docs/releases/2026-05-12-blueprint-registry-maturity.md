# Blueprint Registry Maturity

Decantr now treats blueprint discovery as a curated product surface instead of a flat catalog.

## What Changed

- Added `blueprint_portfolio` metadata to blueprint schemas and official content.
- Public blueprint browsing/search now supports `All`, `Featured`, `Certified`, and opt-in `Labs`.
- Folded overlap slugs stay directly addressable by slug, but no longer appear in default browse/search.
- Registry cards show public blueprint badges without exposing internal maturity labels.
- CLI list/search supports `--blueprint-set <all|featured|certified|labs>` plus `--labs`.
- Direct scaffolding of Labs or folded blueprints prints compatibility guidance instead of silently steering users.

## Why

The registry should make new users more confident, not make them sort through every historical experiment. This keeps the useful long tail available while making the strongest Decantr blueprint paths obvious.
