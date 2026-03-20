# Compiler Audit Fixes

**Date:** 2026-03-20
**Status:** Design Complete
**Author:** Claude + David

## Overview

Fix all issues identified by the compiler audit: path resolution for community styles, workbench internal imports, and audit methodology for browser apps.

## Goals

1. Enable cloud-platform and gaming-platform to build (community styles path)
2. Enable workbench to build (relative imports for internal dependencies)
3. Correctly classify browser apps as passing in the audit

## Scope

### Issue A: Community Styles Path Resolution

**Problem:** `decantr/styles/community/*` imports fail because the path isn't mapped in either builder.

**Solution:** Add path mapping to both builders:
- `decantr/styles/community/{name}` → `src/css/styles/community/{name}.js`

**Files:**
- `tools/builder.js` — OLD builder path resolution
- `tools/compiler/utils/paths.js` — NEW compiler path resolution

### Issue B: Workbench Internal Imports

**Problem:** Workbench imports internal framework paths (`decantr/explorer/*`, `decantr/components/_behaviors.js`) that aren't part of the public API.

**Solution:** Convert to relative imports. Workbench is an internal dev tool in the same repo, so it should use direct paths rather than the public `decantr/*` namespace.

**Conversions:**
| Before | After |
|--------|-------|
| `decantr/explorer/foundations.js` | `../../src/explorer/foundations.js` |
| `decantr/explorer/atoms.js` | `../../src/explorer/atoms.js` |
| `decantr/components/_behaviors.js` | `../../src/components/_behaviors.js` |
| (etc. for all `decantr/explorer/*` imports) | |

**Files:**
- `workbench/src/app.js`
- `workbench/src/sidebar.js`
- Any other workbench files with `decantr/explorer/*` or internal imports

### Issue C: Audit Browser Detection

**Problem:** Phase 4 of the audit tries to `import()` browser code in Node.js, which fails on DOM APIs like `document`, `window`, etc. This marks valid browser apps as "runtime failures".

**Solution:** Detect browser-specific errors and classify them as "browser-pass" instead of failures.

**Known browser errors:**
- `document is not defined`
- `window is not defined`
- `HTMLElement is not defined`
- `MutationObserver is not defined`
- `localStorage is not defined`
- `navigator is not defined`
- `self is not defined`

**New classification:**
- If build passes, syntax passes, and import fails with a browser error → status: `pass`, issueType: `browser`

**Report output:**
```markdown
- [x] `docs` — Pass (browser-only)
- [x] `showcase/portfolio` — Pass (85ms)
```

**File:**
- `tools/compiler-audit.js` — Modify `runPhase4` and status classification

## Architecture

No new architecture. These are targeted fixes to existing files:

1. Path resolution is a small addition to existing resolver logic
2. Workbench changes are import path updates (no logic changes)
3. Audit fix is a classification change in the existing audit script

## Success Criteria

After implementation:
- [ ] `node tools/compiler-audit.js` shows 13/13 passing (or only legitimate failures)
- [ ] cloud-platform builds successfully
- [ ] gaming-platform builds successfully
- [ ] workbench builds successfully
- [ ] Browser apps are classified as "Pass (browser-only)" not "RUNTIME"

## Testing

1. Run `decantr build` in each previously-failing project
2. Run full audit and verify results
3. Verify browser detection catches common DOM errors

## Files to Modify

| File | Change |
|------|--------|
| `tools/builder.js` | Add `styles/community/*` path mapping |
| `tools/compiler/utils/paths.js` | Add `styles/community/*` path mapping |
| `workbench/src/app.js` | Convert to relative imports |
| `workbench/src/sidebar.js` | Convert to relative imports |
| `tools/compiler-audit.js` | Add browser error detection, update classification |
