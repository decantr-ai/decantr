# Decantr Workflow Model

Decantr now treats project setup as a three-workflow system instead of assuming everything starts from blueprint-first scaffolding.

The rule is simple:

- Decantr stays framework-agnostic at the contract layer.
- Bootstrap becomes adapter-driven.
- Blueprints are optional.
- Existing-app adoption is a first-class path.

## Command Ownership

| Workflow | When to use it | Primary commands | Registry role |
| --- | --- | --- | --- |
| Greenfield blueprint | Starting in a new directory from a blueprint or blank Decantr workspace | `decantr new`, `decantr magic` | optional, often primary |
| Brownfield adoption | Attaching Decantr to an existing Angular/React/Vue/etc. project | `decantr analyze`, `decantr init --existing` | optional |
| Hybrid composition | Selectively layering Decantr sections, themes, or features into an attached project | `decantr add/remove`, `decantr theme switch`, `decantr registry`, `decantr upgrade` | opt-in enrichment |

## Greenfield Blueprint

Use this lane when you want a new project directory and a Decantr contract from day one.

Command ownership:

- `decantr new` creates the workspace in a new directory.
- `decantr magic` stays greenfield-first and helps you choose a contract direction from a natural-language prompt.

What happens:

1. resolve blueprint, archetype, theme, and contract inputs
2. generate `decantr.essence.json`, `DECANTR.md`, and compiled execution-pack context files
3. create the currently available runnable bootstrap adapter when one exists
4. hand off to the LLM for implementation

Current bootstrap adapter availability in this wave:

- `react-vite` is the runnable greenfield adapter
- other contract targets remain valid Decantr targets, but initialize in contract-only mode until their adapters land

## Brownfield Adoption

Use this lane when you already have a project and want Decantr governance without requiring official or community blueprint content.

Command ownership:

- `decantr analyze` is the canonical first step
- `decantr init --existing` attaches Decantr to the repository

What happens:

1. detect framework, package manager, routes, layout, styling, and dependencies
2. write `.decantr/analysis.json`
3. write `.decantr/init-seed.json` with recommended attach defaults
4. run `decantr init --existing` to attach the contract and context files

Important rule:

- brownfield does **not** require a blueprint
- brownfield does **not** require registry access
- registry content is optional enrichment, not a mandatory dependency

## Hybrid Composition

Use this lane after a project already has Decantr attached.

This is where teams selectively compose new pieces into a self-owned app instead of starting over:

- add or remove sections/pages/features
- switch themes
- fetch registry content when it is useful
- upgrade contract inputs deliberately

Representative commands:

- `decantr add section <archetype>`
- `decantr add feature <feature>`
- `decantr remove ...`
- `decantr theme switch <theme>`
- `decantr registry search/get-pack/...`
- `decantr upgrade`

## Why This Model Exists

Blueprint-first scaffolding is great for greenfield exploration, but it is the wrong mental model for every team:

- some teams already have Angular, React, Vue, or custom apps
- some teams want Decantr governance without adopting registry content
- some teams only want selected Decantr patterns, themes, or sections later

The workflow model keeps those paths explicit so the CLI does not silently generate the wrong runtime or imply that a blueprint is always required.

## Harness and Certification

The workflow architecture is now certified across three surfaces:

- greenfield blueprint scaffold
- brownfield `analyze -> init --existing`
- hybrid follow-up composition

Use:

```bash
pnpm --filter @decantr/cli certify:workflows
```

That matrix exists alongside the narrower blueprint harness:

```bash
pnpm --filter @decantr/cli certify:blueprints
```
