# CLI Scaffold Hotfix

Date: 2026-05-12

Release target: `@decantr/cli@2.4.1`.

## Fixed

- Blueprint `design_constraints` are normalized into Essence V4-compatible `dna.constraints` before validation and pack compilation.
- Cold scaffolds no longer fail execution-pack compilation when a blueprint carries route- or surface-specific design constraints such as `public_home`.
- The scaffold success prompt now falls back to narrative context instructions when compiled pack files are missing, instead of telling agents to read files that were not generated.
