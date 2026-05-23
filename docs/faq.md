# Decantr FAQ

Short answers for common Decantr usage questions.

## How do I start a new app with Decantr?

Use `decantr new`:

```bash
npx @decantr/cli new my-app
cd my-app
```

You can also start from a specific blueprint:

```bash
npx @decantr/cli new my-app --blueprint=agent-marketplace
```

Decantr creates the app contract, starter context, and available adapter files. The AI assistant still writes and edits the implementation.

## How do I use Decantr in an existing app?

Use the Brownfield adoption workflow:

```bash
npx @decantr/cli adopt --yes
```

For monorepos, install at the workspace root and point Decantr at the app:

```bash
pnpm add -D -w @decantr/cli
pnpm exec decantr setup
pnpm exec decantr workspace list
pnpm exec decantr adopt --project apps/web --yes
pnpm exec decantr doctor --project apps/web
```

Brownfield adoption is observe-first: Decantr reads what already exists, proposes a contract, and lets you accept or merge it.

After adoption, use `doctor` when you are not sure what Decantr expects next. It reports whether the app is still Brownfield contract-only or has moved into Hybrid local law, style bridge, Decantr CSS, or composition mode.

If the app is running and you want local screenshot evidence, run:

```bash
npx @decantr/cli verify --project apps/web --base-url http://localhost:3000 --evidence
```

## How does Decantr keep AI or agent work tied back to the original spec?

You cannot truly force an LLM to follow a spec. Models are probabilistic, and once implementation starts they can drift, improvise, or overfit to the last instruction.

That is why Decantr exists. It gives the assistant a durable contract to work from, scoped context to read while coding, and checks that report when the implementation drifts away from the intended product shape.

The normal loop is:

```bash
npx @decantr/cli task /feed "describe the change"
npx @decantr/cli verify
npx @decantr/cli doctor
```

`task` now includes the route's active authority: existing app, accepted local law, style bridge, Decantr CSS, hosted packs as guidance, or Greenfield context. If the prompt asks for a mismatched runtime or Decantr CSS in a contract-only app, the task context warns before the assistant starts coding.

If product intent changes, update the Decantr contract deliberately, regenerate context, then continue:

```bash
npx @decantr/cli add page dashboard/reports --route /dashboard/reports
npx @decantr/cli add feature auth
npx @decantr/cli refresh
npx @decantr/cli verify
```

The guardrail is simple: do not let implementation silently redefine the product. Either the code follows the contract, or the contract changes on purpose.

## How do I make sure my project keeps following Decantr over time?

Use local checks for fast feedback, then make Decantr part of CI so drift cannot be merged unnoticed.

You cannot guarantee that every LLM, editor, or developer action will follow Decantr perfectly at all times. Local agents can ignore instructions, humans can forget commands, and commit hooks can be bypassed. The durable guardrail is to make Decantr health a required CI check.

Install the default GitHub Actions gate:

```bash
npx @decantr/cli ci init
```

For monorepos:

```bash
npx @decantr/cli ci init --project apps/web
```

The generated workflow runs:

```bash
npx @decantr/cli ci --fail-on error
```

Then mark that GitHub check as required in branch protection. That makes Decantr drift unmergeable until it is fixed or the contract is deliberately updated.

For local convenience, add package scripts:

```json
{
  "scripts": {
    "decantr:check": "decantr verify",
    "decantr:doctor": "decantr doctor",
    "decantr:ci": "decantr ci --fail-on error"
  }
}
```

Some teams also wire those scripts into pre-commit or pre-push hooks, but CI is the enforcement layer. The local checks help people and agents catch drift early; CI keeps drift out of the main branch.

## How do I check whether my app is still following Decantr?

Run:

```bash
npx @decantr/cli verify
```

For an existing app that was attached through brownfield adoption:

```bash
npx @decantr/cli verify --brownfield
```

If you accepted local project law with `decantr codify --accept`, use:

```bash
npx @decantr/cli verify --brownfield --local-patterns
```

For a broader report:

```bash
npx @decantr/cli health
```

## How do I open the Decantr Studio dashboard?

Run Studio from the app root, where `decantr.essence.json` lives:

```bash
npx @decantr/cli studio
```

Then open:

```text
http://127.0.0.1:4319
```

If that port is already in use:

```bash
npx @decantr/cli studio --host 127.0.0.1 --port 4320
```

In a monorepo, run Studio from the app package rather than the workspace root:

```bash
cd apps/web
npx @decantr/cli studio
```

Studio is local-only and uses the same Project Health report as:

```bash
npx @decantr/cli health
```

Use Studio when you want a browser view of status, the issue to fix first, the AI prompt before copying it, manual repair guidance, verification commands, route coverage, runtime evidence, pack health, and CI readiness. Use `decantr ci` for enforcement in pull requests. Stop Studio with `Ctrl+C` in the terminal that started it.

## Does Decantr automatically fix Project Health findings?

Not by default. Decantr is the contract and verification layer; it tells the developer or AI assistant what drifted and what needs to change. For an LLM-assisted workflow, use Studio's **Copy AI prompt** button or run:

```bash
npx @decantr/cli health --prompt <finding-id>
```

That command prints a focused repair prompt. It does not edit files by itself. Paste the prompt into the assistant doing the implementation, make the change, then rerun:

```bash
npx @decantr/cli health
```

To view a CI-produced JSON report without scanning the project source again:

```bash
npx @decantr/cli health --json --output decantr-health.json
npx @decantr/cli studio --report decantr-health.json
```

Report mode is useful for customer-controlled dashboards or internal reporting pages. It serves the JSON artifact you provide; it does not upload the report to Decantr telemetry.

## How do I regenerate Decantr guidance after changing the app contract?

Run:

```bash
npx @decantr/cli refresh
```

Use `refresh` after changing routes, sections, theme, features, or any other product-shape decision that the assistant should follow.

## How do I add a page, feature, or theme?

Examples:

```bash
npx @decantr/cli add page dashboard/reports --route /dashboard/reports
npx @decantr/cli add page app/settings --route /settings --project apps/web
npx @decantr/cli add feature auth
npx @decantr/cli theme switch auradecantism
npx @decantr/cli refresh
```

In observed Brownfield apps, `app/settings` can resolve to the single primary section, such as `observed-primary`, when that mapping is unambiguous.

After the change, run:

```bash
npx @decantr/cli check
```

## How do I migrate an older Decantr project to V2 / Essence V4?

Run:

```bash
npx @decantr/cli migrate --to v4
```

Then refresh and check:

```bash
npx @decantr/cli refresh
npx @decantr/cli check
```

Pre-V4 essence files are migration inputs, not active runtime contracts.

## How do I add Decantr checks to CI?

Install the default GitHub Actions gate:

```bash
npx @decantr/cli ci init
```

For monorepos:

```bash
npx @decantr/cli ci init --project apps/web
```

CI can then run:

```bash
npx @decantr/cli ci --fail-on error
```

## Is Decantr a code generator?

Not primarily. Decantr is an AI Frontend Governance layer for codebases touched by AI agents. It gives AI tools a clearer Contract, better route-scoped Context, registry-backed vocabulary when useful, and drift evidence with repair guidance. The assistant still writes the code.

## What should I do when Decantr flags drift?

Decide whether the code or the contract is wrong.

If the implementation drifted, fix the code and rerun:

```bash
npx @decantr/cli check
```

If the product direction changed, update Decantr first, then regenerate guidance:

```bash
npx @decantr/cli refresh
npx @decantr/cli check
```
