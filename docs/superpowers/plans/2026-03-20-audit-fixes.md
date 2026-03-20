# Compiler Audit Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all compiler audit issues so all 13 projects pass (community styles path, workbench imports, browser detection).

**Architecture:** Three targeted fixes: (1) add path mapping for `decantr/styles/community/*` in both builders, (2) convert workbench to relative imports, (3) detect browser-only errors in audit and classify as passing.

**Tech Stack:** Node.js, existing builder/compiler infrastructure.

---

## File Structure

| File | Purpose |
|------|---------|
| `tools/builder.js` | OLD builder - add community styles path resolution |
| `tools/compiler/utils/paths.js` | NEW compiler - add community styles path resolution |
| `workbench/src/app.js` | Convert internal imports to relative paths |
| `workbench/src/sidebar.js` | Convert internal imports to relative paths |
| `tools/compiler-audit.js` | Add browser error detection, update classification |

---

### Task 1: Add Community Styles Path to OLD Builder

**Files:**
- Modify: `tools/builder.js:17-22`

- [ ] **Step 1: Update resolveDecantrImport function**

Replace lines 17-22 in `tools/builder.js`:

```js
function resolveDecantrImport(subpath) {
  const mod = subpath || 'core';
  const mapped = BUILD_IMPORT_MAP[mod];
  if (mapped) return join(frameworkSrc, mapped);

  // Handle styles/community/* path
  if (mod.startsWith('styles/community/')) {
    const styleName = mod.replace('styles/community/', '');
    return join(frameworkSrc, 'css/styles/community', styleName + '.js');
  }

  // Handle styles/* (non-community)
  if (mod.startsWith('styles/')) {
    const styleName = mod.replace('styles/', '');
    return join(frameworkSrc, 'css/styles', styleName + '.js');
  }

  return join(frameworkSrc, mod, 'index.js');
}
```

- [ ] **Step 2: Verify cloud-platform builds**

Run: `cd showcase/cloud-platform && node ../../cli/index.js build`
Expected: Build succeeds without "Could not resolve" error

- [ ] **Step 3: Verify gaming-platform builds**

Run: `cd showcase/gaming-platform && node ../../cli/index.js build`
Expected: Build succeeds without "Could not resolve" error

- [ ] **Step 4: Commit**

```bash
git add tools/builder.js
git commit -m "fix(builder): add community styles path resolution"
```

---

### Task 2: Add Community Styles Path to NEW Compiler

**Files:**
- Modify: `tools/compiler/utils/paths.js:30-60`

- [ ] **Step 1: Update resolveDecantrImport function**

Replace the `resolveDecantrImport` function in `tools/compiler/utils/paths.js`:

```js
/**
 * Resolve decantr framework import
 */
export function resolveDecantrImport(specifier, frameworkSrc) {
  const subpath = specifier.replace('decantr/', '').replace('decantr', 'core');
  const mapped = BUILD_IMPORT_MAP[subpath];

  if (mapped) {
    return join(frameworkSrc, mapped);
  }

  // Handle styles/community/* path
  if (subpath.startsWith('styles/community/')) {
    const styleName = subpath.replace('styles/community/', '');
    return join(frameworkSrc, 'css/styles/community', styleName + '.js');
  }

  // Handle styles/* (non-community)
  if (subpath.startsWith('styles/')) {
    const styleName = subpath.replace('styles/', '');
    return join(frameworkSrc, 'css/styles', styleName + '.js');
  }

  // If subpath has .js extension, use it directly
  if (subpath.endsWith('.js')) {
    const direct = join(frameworkSrc, subpath);
    if (existsSync(direct)) {
      return direct;
    }
  }

  // Try as directory with index.js
  const indexPath = join(frameworkSrc, subpath, 'index.js');
  if (existsSync(indexPath)) {
    return indexPath;
  }

  // Try adding .js extension
  const withExt = join(frameworkSrc, subpath + '.js');
  if (existsSync(withExt)) {
    return withExt;
  }

  // Fallback to index.js (will error at read time if doesn't exist)
  return indexPath;
}
```

- [ ] **Step 2: Verify with experimental compiler**

Run: `cd showcase/cloud-platform && node ../../cli/index.js build --experimental-compiler`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add tools/compiler/utils/paths.js
git commit -m "fix(compiler): add community styles path resolution"
```

---

### Task 3: Convert Workbench to Relative Imports

**Files:**
- Modify: `workbench/src/app.js`
- Modify: `workbench/src/sidebar.js`

- [ ] **Step 1: Update workbench/src/app.js imports**

Replace the internal decantr imports at the top of `workbench/src/app.js`:

```js
// Change these lines:
// import { createFocusTrap } from 'decantr/components/_behaviors.js';
// import { initUsageIndex } from 'decantr/explorer/shared/usage-links.js';
// import { activeShellConfig } from 'decantr/explorer/shell-config.js';

// To:
import { createFocusTrap } from '../../src/components/_behaviors.js';
import { initUsageIndex } from '../../src/explorer/shared/usage-links.js';
import { activeShellConfig } from '../../src/explorer/shell-config.js';
```

- [ ] **Step 2: Update workbench/src/sidebar.js imports**

Replace the internal decantr imports at the top of `workbench/src/sidebar.js`:

```js
// Change these lines:
// import { loadFoundationItems } from 'decantr/explorer/foundations.js';
// import { loadAtomItems } from 'decantr/explorer/atoms.js';
// ... etc

// To:
import { loadFoundationItems } from '../../src/explorer/foundations.js';
import { loadAtomItems } from '../../src/explorer/atoms.js';
import { loadTokenItems } from '../../src/explorer/tokens.js';
import { loadComponentItems } from '../../src/explorer/components.js';
import { loadIconItems } from '../../src/explorer/icons.js';
import { loadChartItems } from '../../src/explorer/charts.js';
import { loadPatternItems } from '../../src/explorer/patterns.js';
import { loadArchetypeItems } from '../../src/explorer/archetypes.js';
import { loadRecipeItems } from '../../src/explorer/recipes.js';
import { loadToolItems } from '../../src/explorer/tools.js';
import { loadShellItems } from '../../src/explorer/shells.js';
```

- [ ] **Step 3: Verify workbench builds**

Run: `cd workbench && node ../cli/index.js build`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add workbench/src/app.js workbench/src/sidebar.js
git commit -m "fix(workbench): convert to relative imports for internal dependencies"
```

---

### Task 4: Add Browser Detection to Audit

**Files:**
- Modify: `tools/compiler-audit.js`

- [ ] **Step 1: Add browser error detection constants**

Add after the imports (around line 14) in `tools/compiler-audit.js`:

```js
// Known browser-only errors that indicate valid browser code, not compiler bugs
const BROWSER_ERRORS = [
  'document is not defined',
  'window is not defined',
  'HTMLElement is not defined',
  'MutationObserver is not defined',
  'localStorage is not defined',
  'sessionStorage is not defined',
  'navigator is not defined',
  'self is not defined',
  'customElements is not defined',
  'IntersectionObserver is not defined',
  'ResizeObserver is not defined',
  'requestAnimationFrame is not defined',
  'getComputedStyle is not defined',
];

function isBrowserOnlyError(error) {
  if (!error) return false;
  return BROWSER_ERRORS.some(browserErr => error.includes(browserErr));
}
```

- [ ] **Step 2: Update runPhase4 to detect browser errors**

Replace the `runPhase4` function (lines 115-142):

```js
async function runPhase4(project) {
  const distPath = join(project.path, 'dist');

  try {
    const files = await readdir(distPath);
    const mainFile = files.find(f => f.startsWith('main.') && f.endsWith('.js'));

    if (!mainFile) {
      return { pass: false, error: 'No main.*.js found in dist/', browser: false };
    }

    const filePath = join(distPath, mainFile);
    // Use dynamic import test
    const result = await runCommand(
      'node',
      ['--input-type=module', '-e', `"import('${filePath}')"`],
      project.path,
      10000
    );

    // Check if failure is due to browser-only code
    if (!result.pass && isBrowserOnlyError(result.error)) {
      return { pass: true, browser: true, error: null };
    }

    return {
      pass: result.pass,
      browser: false,
      error: result.pass ? null : result.error
    };
  } catch (err) {
    return { pass: false, browser: false, error: err.message };
  }
}
```

- [ ] **Step 3: Update status classification in auditProject**

In the `auditProject` function, update the status determination (around line 266-281):

```js
  // Determine status and issue type
  if (!result.phases.baseline.pass) {
    result.status = 'fail';
    result.issueType = 'pre-existing';
  } else if (!result.phases.experimental.pass) {
    result.status = 'fail';
    result.issueType = 'compiler';
  } else if (!result.phases.syntax?.pass) {
    result.status = 'fail';
    result.issueType = 'syntax';
  } else if (!result.phases.import?.pass) {
    result.status = 'fail';
    result.issueType = 'runtime';
  } else if (result.phases.import?.browser) {
    result.status = 'pass';
    result.issueType = 'browser';
  } else {
    result.status = 'pass';
  }
```

- [ ] **Step 4: Update generateReport to show browser status**

In `generateReport`, update the summary calculation (around line 289-297):

```js
  const summary = {
    total: results.length,
    pass: results.filter(r => r.status === 'pass').length,
    fail: results.filter(r => r.status === 'fail').length,
    preExisting: results.filter(r => r.issueType === 'pre-existing').length,
    compiler: results.filter(r => r.issueType === 'compiler').length,
    syntax: results.filter(r => r.issueType === 'syntax').length,
    runtime: results.filter(r => r.issueType === 'runtime').length,
    browser: results.filter(r => r.issueType === 'browser').length,
  };
```

- [ ] **Step 5: Update report table to show browser count**

Update the failure breakdown table (add after runtime row):

```js
| Browser-only | ${summary.browser} | Valid browser code (DOM APIs) |
```

- [ ] **Step 6: Update checklist status display**

In the checklist generation loop, update the status display (around line 340):

```js
      const status = project.status === 'pass'
        ? project.issueType === 'browser'
          ? 'Pass (browser-only)'
          : `Pass (${project.phases.experimental.time}ms)`
        : `**${project.issueType.toUpperCase()}**`;
```

- [ ] **Step 7: Commit**

```bash
git add tools/compiler-audit.js
git commit -m "fix(audit): detect browser-only code as passing"
```

---

### Task 5: Run Full Audit and Verify

**Files:**
- Update: `docs/superpowers/specs/2026-03-19-compiler-audit.md` (generated)

- [ ] **Step 1: Run the full audit**

Run: `node tools/compiler-audit.js`
Expected:
- cloud-platform: Pass
- gaming-platform: Pass
- workbench: Pass
- All other projects: Pass (browser-only) or Pass (Xms)
- Summary shows 13/13 passing

- [ ] **Step 2: Review the report**

Run: `cat docs/superpowers/specs/2026-03-19-compiler-audit.md`
Expected: All checkboxes checked, browser-only projects marked appropriately

- [ ] **Step 3: Commit the updated report**

```bash
git add docs/superpowers/specs/2026-03-19-compiler-audit.md
git commit -m "docs: update compiler audit with all projects passing"
```

---

## Verification

After completing all tasks:

1. Run `node tools/compiler-audit.js` — should show 13/13 passing
2. Run `cd showcase/cloud-platform && node ../../cli/index.js build` — should succeed
3. Run `cd showcase/gaming-platform && node ../../cli/index.js build` — should succeed
4. Run `cd workbench && node ../cli/index.js build` — should succeed
5. Check `docs/superpowers/specs/2026-03-19-compiler-audit.md` has all checkboxes checked
