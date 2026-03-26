---
type: enrich
name: react-quality-gate-final
---

You are running in fully autonomous mode on the Decantr monorepo at /Users/davidaimi/projects/decantr-new.
Do NOT use EnterPlanMode or AskUserQuestion tools. Do NOT add Co-Authored-By lines to commits.

## Task: Final React Quality Gate — Full Audit

This is the FINAL quality gate after all React polish tasks (11-16). Perform a comprehensive audit.

## What to do

1. Run full test suite: `cd /Users/davidaimi/projects/decantr-new && pnpm test`

2. Read ALL files in `packages/generator-react/src/` — understand the current state of every emitter.

3. For EACH emit function, generate sample output and validate against ALL 10 Vercel React best practice rules:

**CRITICAL (must be zero violations):**
- no-barrel-imports
- no-inline-components
- use-lazy-imports (in router)
- use-suspense-boundaries

**HIGH (must be zero violations):**
- functional-setstate
- no-effect-derived-state
- hoist-default-props

**MEDIUM (should be zero, fix if easy):**
- hoist-static-jsx
- memo-expensive-components
- primitive-effect-deps

4. Also check these additional React quality standards:
- TypeScript types are correct (no `any` in generated code)
- Props interfaces are properly defined
- Event handlers use proper React types (React.ChangeEvent, etc.)
- Keys are properly set on mapped elements
- useEffect cleanup functions are present where needed
- No memory leaks (event listeners cleaned up)

5. Fix ALL violations found in the generator source code.

6. Add regression tests for any new patterns fixed.

7. Run tests again to confirm everything passes.

8. Commit:
```bash
git commit -m "fix(generator-react): comprehensive quality audit — all Vercel best practices enforced"
```

## Acceptance Criteria
- Zero CRITICAL violations in any generated output
- Zero HIGH violations in any generated output
- Near-zero MEDIUM violations
- All generated TypeScript compiles without errors (no `any`)
- `pnpm test` passes
