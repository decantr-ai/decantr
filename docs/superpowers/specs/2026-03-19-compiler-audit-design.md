# Experimental Compiler Full Audit

**Date:** 2026-03-19
**Status:** Design Complete
**Author:** Claude + David

## Overview

A comprehensive audit of all buildable Decantr projects against the new experimental compiler. The audit will test build success, syntax validation, and runtime import across 13 projects, producing a checklist-format report for tracking fixes.

## Goals

1. Identify all projects that fail with the experimental compiler
2. Distinguish pre-existing issues from new compiler issues
3. Produce a repeatable audit script for re-validation after fixes
4. Generate a markdown checklist for tracking remediation

## Scope

### Projects to Audit (13 total)

| Category | Projects |
|----------|----------|
| Showcase | cloud-platform, ecommerce-admin, gaming-platform, portfolio, saas-dashboard |
| Test Fixtures | content-site, docs-explorer, ecommerce, portfolio, saas-dashboard |
| Apps | docs, playground, workbench |

### Test Phases

Each project runs 4 sequential phases:

1. **Baseline Build** — `decantr build` with old builder (establishes pre-existing issues)
2. **Experimental Build** — `decantr build --experimental-compiler`
3. **Syntax Validation** — `node -c` on all output `.js` files
4. **Runtime Import** — `node -e "import('./dist/main.*.js')"` smoke test

### Failure Classification

- **Pre-existing** — Fails on old builder (Phase 1)
- **Compiler regression** — Passes old builder, fails experimental (Phase 2)
- **Syntax error** — Builds succeed but output has syntax errors (Phase 3)
- **Runtime error** — Syntax valid but import fails (Phase 4)

## Architecture

### Audit Script (`tools/compiler-audit.js`)

```
┌─────────────────────────────────────────────────────────────┐
│                    compiler-audit.js                         │
├─────────────────────────────────────────────────────────────┤
│  discoverProjects()     → Find all src/app.js locations     │
│  runPhase1(project)     → Old builder baseline               │
│  runPhase2(project)     → Experimental compiler              │
│  runPhase3(project)     → Syntax check all outputs           │
│  runPhase4(project)     → Node import test                   │
│  generateReport(results)→ Markdown checklist                 │
└─────────────────────────────────────────────────────────────┘
```

### Output Structure

**JSON results** (`tools/audit-results.json`):
```json
{
  "timestamp": "2026-03-19T21:30:00Z",
  "summary": { "total": 13, "pass": 10, "fail": 3 },
  "projects": [
    {
      "name": "showcase/portfolio",
      "path": "/abs/path",
      "phases": {
        "baseline": { "pass": true, "time": 42, "error": null },
        "experimental": { "pass": true, "time": 31, "error": null },
        "syntax": { "pass": true, "files": 1, "failures": [] },
        "import": { "pass": true, "error": null }
      },
      "status": "pass",
      "issueType": null
    }
  ]
}
```

**Markdown checklist** (`docs/superpowers/specs/2026-03-19-compiler-audit.md`):
```markdown
# Compiler Audit Results

## Summary
- Total: 13 | Pass: 10 | Fail: 3
- Pre-existing: 2 | Compiler: 1 | Syntax: 0 | Runtime: 0

## Checklist

### Showcase Projects
- [x] portfolio — Pass (31ms)
- [x] saas-dashboard — Pass (36ms)
- [ ] gaming-platform — Pre-existing: import path not found
...
```

## Implementation Plan

### Phase 1: Create Audit Script
1. Create `tools/compiler-audit.js`
2. Implement project discovery
3. Implement 4 test phases
4. Implement JSON output

### Phase 2: Create Report Generator
1. Parse JSON results
2. Generate markdown checklist with categories
3. Include error details and fix suggestions

### Phase 3: Run Initial Audit
1. Execute full audit
2. Review results
3. Commit audit report

### Phase 4: Fix Issues (separate from audit)
1. Work through checklist
2. Re-run audit to verify fixes
3. Update checklist status

## Success Criteria

- [ ] Audit script discovers all 13 projects
- [ ] All 4 phases execute without script errors
- [ ] JSON results file generated
- [ ] Markdown checklist generated with proper formatting
- [ ] Pre-existing vs new issues correctly classified
- [ ] Script is re-runnable for verification

## Files to Create

| File | Purpose |
|------|---------|
| `tools/compiler-audit.js` | Main audit script |
| `tools/audit-results.json` | Raw results (gitignored) |
| `docs/superpowers/specs/2026-03-19-compiler-audit.md` | Checklist report |

## Usage

```bash
# Run full audit
node tools/compiler-audit.js

# Run audit on specific category
node tools/compiler-audit.js --only=showcase

# Re-run after fixes
node tools/compiler-audit.js --update
```
