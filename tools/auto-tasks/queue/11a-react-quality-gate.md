---
type: enrich
name: react-quality-gate-tier2
---

You are running in fully autonomous mode on the Decantr monorepo at /Users/davidaimi/projects/decantr-new.
Do NOT use EnterPlanMode or AskUserQuestion tools. Do NOT add Co-Authored-By lines to commits.

## Task: React Quality Gate — Post-Tier-1 Validation

This task runs AFTER the Tier 1 pattern tasks (01-10) to validate that all new React generator output follows Vercel's React best practices.

## What to do

1. Read `packages/generator-react/src/quality-rules.ts` — this contains the quality validation rules created by task 00.

2. Run the FULL test suite to make sure everything still passes:
```bash
cd /Users/davidaimi/projects/decantr-new && pnpm test
```

3. Generate a saas-dashboard with the React target and inspect the output:
```bash
cd /Users/davidaimi/projects/decantr-new
node -e "
import { runPipeline } from './packages/generator-core/dist/index.js';
import { createReactPlugin } from './packages/generator-react/dist/index.js';
import { readFileSync } from 'fs';
const essence = JSON.parse(readFileSync('./examples/saas-dashboard/decantr.essence.json', 'utf-8'));
const result = await runPipeline(essence, {
  projectRoot: process.cwd(),
  contentRoot: './content/core',
  overridePaths: ['./content'],
  plugin: createReactPlugin(),
});
for (const f of result.files) {
  console.log('--- ' + f.path + ' ---');
  console.log(f.content.substring(0, 500));
  console.log('...\n');
}
"
```

4. Check each generated file against these rules:
   - **No barrel imports** — All imports must be from specific paths
   - **No inline components** — No function/const component inside another component
   - **React.lazy for routes** — Page imports in App.tsx use lazy loading
   - **Suspense boundaries** — Lazy routes wrapped in Suspense
   - **Functional setState** — setState uses callback form when depending on prev state
   - **No useEffect for derived state** — useMemo instead of useEffect+setState
   - **Hoisted defaults** — No `= []` or `= {}` in component params
   - **Direct shadcn imports** — `@/components/ui/button` not `@/components/ui`

5. If ANY violations are found:
   - Fix the generator source code (emit-page.ts, emit-app.ts, shadcn.ts, etc.)
   - Update or add tests to prevent regression
   - Re-run tests to confirm fix

6. If the quality-rules.ts module doesn't exist yet (task 00 hasn't run), create a simpler inline check:
   - Scan all generated .tsx content for barrel import patterns
   - Scan for nested component definitions
   - Log any findings and fix the generators

7. Commit all fixes:
```bash
git commit -m "fix(generator-react): resolve quality violations found in post-tier-1 gate"
```

## Acceptance Criteria
- All generated React code passes quality validation with zero violations
- `pnpm test` passes
- No barrel imports in any generated file
- No inline component definitions
- React.lazy used for code splitting in router
