# UI Framework Adapter Expansion

Date: 2026-05-12

This release expands Decantr's certified runnable adapter surface while keeping the core contract stack-agnostic.

## Added

- `vanilla-vite` for plain HTML/CSS/JavaScript projects.
- `vue-vite` for Vue 3 + Vite projects.
- `sveltekit` for SvelteKit projects.
- `angular` for standalone Angular projects.
- `solid-vite` for Solid + Vite projects.

## Architecture

- Adapter metadata is now data-driven in the CLI bootstrap layer.
- Adapter aliases, lifecycle status, capabilities, attach hints, verify hints, package plans, and runtime writers live together.
- `@decantr/core` remains framework-neutral: it resolves adapter labels and certified realization capability, but framework file generation stays in CLI adapters.

## Certification

Each new adapter must pass greenfield blueprint creation, persisted project metadata, scaffold-pack target metadata, and workflow certification before being advertised as certified.
