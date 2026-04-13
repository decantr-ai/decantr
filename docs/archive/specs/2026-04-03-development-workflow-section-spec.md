# Development Workflow Section in DECANTR.md

**Date:** 2026-04-03
**Status:** Approved
**Scope:** CLI scaffold.ts — DECANTR.md template generation

---

## Goal

Add a Development Workflow section to DECANTR.md so the AI knows to use CLI commands for structural mutations (add/remove pages, sections, features, theme switch) and refresh context before building — preventing handrolled pages that violate the guard system.

## Change

In `packages/cli/src/scaffold.ts`, in the `generateDecantrMdV31` function (or the `CSS_APPROACH_CONTENT` constant area), add a `## Development Workflow` section after the Project Brief and before the Guard Rules.

### Content

```markdown
## Development Workflow

The essence file (`decantr.essence.json`) is the source of truth for your project's structure. Context files in `.decantr/context/` are derived from it. When you need to add, remove, or modify pages, sections, or features:

**1. Update the essence** (use CLI commands for consistency):
- `decantr add page {section}/{page} --route /{path}`
- `decantr add section {archetype}`
- `decantr add feature {name}` (or `--section {id}` for scoped)
- `decantr remove page {section}/{page}`
- `decantr remove section {id}`
- `decantr remove feature {name}`
- `decantr theme switch {name}`

**2. Regenerate context:** `decantr refresh`

**3. Read the updated context files**, then build.

**Rules:**
- Never create page components for routes that don't exist in the essence
- Never delete pages without removing them from the essence
- Always refresh after mutations — stale context files lead to drift
- If you edit the essence directly, run `decantr refresh` before building
```

## Placement

After the Project Brief section (blueprint, theme, personality, sections, features, decorators) and before the Guard Rules / CSS Implementation methodology.

## Package Impact

| Package | Change | Version |
|---------|--------|---------|
| @decantr/cli | Add workflow section to DECANTR.md template | 1.7.2 (patch) |

No other packages affected. Skills should be updated to mention the workflow section.

## Checklist

- [ ] Add workflow section to DECANTR.md generation in scaffold.ts
- [ ] Run tests
- [ ] Bump CLI to 1.7.2
- [ ] Regenerate showcase
- [ ] Update decantr-engineering SKILL.md — mention workflow section
- [ ] Push and publish
