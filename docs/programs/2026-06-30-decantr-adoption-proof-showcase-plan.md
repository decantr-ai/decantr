# Decantr Adoption Proof Showcase Plan

Generated at: 2026-06-30

## Summary

The next adoption work should prove Decantr inside the tool and repo shapes users already trust: Cursor, real Brownfield apps, repeatable mutations, and short before/after evidence. This is not a popularity plan. It is a product proof plan: reduce first-run friction, show concrete saved-agent work, and give skeptical developers artifacts they can inspect.

## Principles

- Lead with Cursor because it is where many AI coding sessions already happen.
- Show Decantr catching or preventing specific failures, not generic governance claims.
- Use public apps respectfully: clone, mutate locally, document findings, and avoid implying upstream projects are broken.
- Keep raw logs and generated artifacts separate from polished summaries.
- Prefer repeatable scripts over hand-curated demos.
- Do not add telemetry, hosted upload requirements, autonomous source edits, or hidden mutation paths.

## Showcase Tracks

| Track | Goal | Artifact |
| --- | --- | --- |
| Cursor first mile | Prove a user can connect Decantr to Cursor and get task-first route behavior without manual MCP setup. | Short guide, command transcript, generated `.cursor/mcp.json`, generated `.cursor/rules/decantr.mdc`. |
| Brownfield task loop | Show `scan -> adopt -> connect cursor -> task -> verify -> resolve` on an existing app. | Before/after command log, v2 health report, task context excerpt, verifier finding summary. |
| Agent failure prevention | Mutate an app with common AI mistakes such as reimplemented components, token drift, missing labels, or route drift. | Mutation patch, Decantr finding, repair prompt, after-verify result. |
| Runtime/static proof | Show Decantr behavior on runnable static or framework apps without private services. | Runtime proof log, screenshot/visual manifest where available, classified setup gaps where not available. |
| Monorepo app targeting | Show Decantr picking the product UI app over docs/packages/workbenches. | Candidate ranking JSON and command hints with `--project`. |

## Candidate Demo Apps

Use a small, stable set first:

- A Next.js/Turborepo app with clear product UI.
- A Vite React app with local components and Tailwind.
- A plain static HTML/CSS/JavaScript app.
- A legacy jQuery or mixed static app.
- A monorepo where docs/packages could distract app discovery.

Later corpus runs can expand to SaaS starters, real-world clones, and framework examples, but the public showcase should stay small enough for users to understand.

## Required Evidence Per Showcase

Each showcase should include:

- Repo name, commit SHA, license, and clone/setup notes.
- Decantr version and command list.
- Whether the app was attached from root or with `--project`.
- Raw command logs.
- Generated Decantr artifacts used in the proof.
- The intentional mutation or scenario.
- Decantr finding(s), severity, evidence tier, graph anchor when present, and repair plan.
- After-repair or after-revert verification.
- Honest failure notes, especially missing env vars, private services, slow installs, or runtime setup gaps.

## Proposed Implementation

1. Add a `scripts/run-adoption-showcase.mjs` harness that reads a small JSON config and runs a fixed command matrix against cloned apps.
2. Add `fixtures/adoption-showcase/showcases.json` with 3-5 documented apps and local mutation recipes.
3. Extend the existing corpus report renderer to emit a concise Markdown showcase report under `docs/benchmarks/`.
4. Add a Cursor-specific guide page with the generated command and manual fallback.
5. Add one short public-facing proof page that links to raw artifacts and avoids overclaiming.

## Acceptance Criteria

- `decantr connect cursor --preview` and `decantr connect cursor --project <app> --preview` are documented and tested.
- At least three showcase apps run through a repeatable command matrix.
- At least two intentional mutations produce clear Decantr evidence and repair guidance.
- At least one runtime/static proof case includes local visual or runtime evidence.
- Monorepo candidate ranking is shown with an app-scoped `--project` path.
- Reports include false positives and setup failures instead of hiding them.
- No showcase requires uploading source or granting Decantr hosted access.

## Non-Goals

- Building a full Cursor marketplace extension before the CLI connector has proven demand.
- Claiming framework-specific support from one successful run.
- Using Decantr to edit source autonomously.
- Turning public demo apps into marketing claims without raw evidence.

## Next Release Candidates

- Patch release: ship the Cursor connector and docs once tests and audits pass.
- Minor release: add the repeatable adoption showcase harness and public proof report.
- Later: consider a true Cursor extension only if the connector shows demand and users need UI beyond project MCP/rules.
