# E2E Audit Action Plan Generator

**Date:** 2024-03-19
**Status:** Approved
**Author:** Claude + David

## Overview

A tool that transforms E2E scaffold test findings into actionable prompts for improving the decantr registry. After running validation against a scaffolded project, generates a comprehensive markdown action plan with classified gaps, violations, and improvement opportunities—each with a ready-to-use prompt for Claude.

## Problem Statement

When Claude scaffolds a decantr project, it sometimes creates local components or patterns because they don't exist in the registry. Currently, identifying and promoting these gaps requires manual inspection. We need an automated pipeline that:

1. Detects gaps (missing components, patterns, presets, archetypes)
2. Detects violations (inline CSS, wrong imports, etc.)
3. Identifies improvement opportunities for existing patterns
4. Generates actionable prompts to address each finding

## User Flow

```bash
# Run validation with action plan generation
node test/e2e-scaffold/manual.js ~/test-scaffold --expect CS-004 --action-plan

# Output:
#   - Console: validation report (existing)
#   - File: test/e2e-scaffold/output/action-plan-2024-03-19-CS004.md
```

User then works through the action plan, copying prompts into Claude to implement fixes and promotions.

## Architecture

### File Structure

```
test/e2e-scaffold/
├── manual.js                    # Orchestrator (modify)
├── action-plan.js               # NEW: generates action plan markdown
├── gap-classifier.js            # NEW: classifies gaps → registry type
├── prompts/                     # NEW: prompt templates
│   ├── _base.md                 # Common context header
│   ├── fix-atoms.md             # Fix atom violations
│   ├── fix-imports.md           # Fix import violations
│   ├── promote-component.md     # Gap → new component
│   ├── promote-pattern.md       # Gap → new pattern
│   ├── add-preset.md            # Gap → preset on existing pattern
│   ├── improve-pattern.md       # Pattern improvement
│   └── new-archetype.md         # Gap → new archetype
└── output/                      # Generated artifacts (gitignored)
    └── action-plan-{date}-{testId}.md
```

### Gap Classification

The classifier analyzes each gap and suggests a registry type:

```javascript
classifyGap(gap, existingRegistry) → {
  type: 'component' | 'pattern' | 'preset' | 'archetype',
  confidence: 'high' | 'medium' | 'low',
  reason: string,
  existingMatch?: string
}
```

**Classification Rules:**

| Signal | Suggested Type | Confidence |
|--------|---------------|------------|
| Single file, <100 lines, no child components | Component | High |
| Composes 3+ decantr components | Pattern | High |
| Name matches existing pattern + variant | Preset | High |
| Layout-focused (header, footer, sidebar) | Pattern | Medium |
| Complex state, multiple files | Pattern | Medium |
| No matching archetype for terroir | Archetype | Low |

### Action Plan Structure

```markdown
# E2E Audit Action Plan
**Test:** CS-004 | **Date:** 2024-03-19 | **Project:** ~/test-scaffold

## Summary
| Type | Count | Action |
|------|-------|--------|
| Violations | 1 | Fix |
| Gaps → Components | 1 | Promote |
| Gaps → Presets | 2 | Add to existing patterns |
| Pattern Improvements | 1 | Update |

---

## 1. Violations (Fix First)

### [V1] use-atoms: Raw CSS references
- **Severity:** Warning
- **Files:** `src/components/article-card.js`
- **Count:** 15 occurrences

<details>
<summary>Prompt: Fix atom usage</summary>

> [Generated prompt here]

</details>

- [ ] Fixed

---

## 2. Gaps → Registry Items

### [G1] article-card → `card-grid:article` preset
- **Classification:** Preset (high confidence)
- **Reason:** Composes Card, Badge, Image - matches card-grid structure
- **Source:** `~/test-scaffold/src/components/article-card.js`

<details>
<summary>Prompt: Add article preset to card-grid</summary>

> [Generated prompt with gap code]

</details>

- [ ] Promoted

---

## 3. Pattern Improvements

### [P1] footer-columns → Add `minimal` preset
- **Current:** Has `standard`, `newsletter` presets
- **Opportunity:** Gap code shows simpler single-row variant

<details>
<summary>Prompt: Add minimal preset</summary>

> [Generated prompt]

</details>

- [ ] Improved
```

### Prompt Templates

Templates use `{{placeholder}}` syntax for simple string replacement (no external dependencies).

**`prompts/_base.md`:**
```markdown
You are working in the decantr framework codebase.

**Context:**
- Project: {{projectPath}}
- Test: {{testId}}
- Original prompt: "{{originalPrompt}}"

**References:**
- CLAUDE.md for framework conventions
- src/registry/patterns/ for pattern examples
- src/components/ for component examples
```

**`prompts/add-preset.md`:**
```markdown
{{> _base}}

## Task: Add `{{presetName}}` preset to `{{patternId}}` pattern

**File:** `src/registry/patterns/{{patternId}}.json`

**Based on this implementation:**
```javascript
{{gapCode}}
```

**Requirements:**
1. Follow existing preset structure in the file
2. Include: description, components array, blend config, code example
3. Preset should handle: {{inferredCapabilities}}

**Similar presets to reference:**
{{similarPresets}}
```

### Integration with manual.js

```javascript
// Add CLI flag
const args = parseArgs({
  options: {
    expect: { type: 'string' },
    visual: { type: 'boolean' },
    'action-plan': { type: 'boolean' },  // NEW
    verbose: { type: 'boolean' },
  },
});

// After validation, if --action-plan:
if (options['action-plan']) {
  const { generateActionPlan } = await import('./action-plan.js');

  const plan = await generateActionPlan({
    projectDir,
    testId: entry?.id,
    report: { gaps, violations, corpusMatch, essence },
    originalPrompt: entry?.prompt,
  });

  const outputPath = join(__dirname, 'output',
    `action-plan-${date}-${testId || 'manual'}.md`);

  await writeFile(outputPath, plan);
  console.log(`\n  Action plan saved to: ${outputPath}\n`);
}
```

### action-plan.js Main Function

```javascript
export async function generateActionPlan({ projectDir, testId, report, originalPrompt }) {
  const { gaps, violations } = report;

  // 1. Classify each gap
  const classifiedGaps = await Promise.all(
    gaps.map(gap => classifyGap(gap, projectDir))
  );

  // 2. Read gap source code
  const gapsWithCode = await Promise.all(
    classifiedGaps.map(gap => enrichWithSourceCode(gap, projectDir))
  );

  // 3. Generate prompts from templates
  const sections = {
    violations: violations.map(v => generateViolationSection(v)),
    gaps: gapsWithCode.map(g => generateGapSection(g)),
    improvements: detectImprovements(gapsWithCode, existingPatterns),
  };

  // 4. Assemble markdown
  return assembleActionPlan({ testId, projectDir, sections, originalPrompt });
}
```

## Edge Cases

| Scenario | Handling |
|----------|----------|
| No gaps or violations found | Generate minimal plan with "No issues found" |
| Gap source file deleted/moved | Skip with warning in plan |
| Can't read source code | Include gap without code snippet |
| Unknown pattern for preset match | Classify as new pattern |
| Multiple tests run | Each gets separate dated action plan |
| No `--expect` flag | Action plan works without corpus context |
| Very large gap file (>500 lines) | Truncate, note "see full file" |

## Files to Modify

- `test/e2e-scaffold/manual.js` - add `--action-plan` flag
- `.gitignore` - add `test/e2e-scaffold/output/`

## Files to Create

- `test/e2e-scaffold/action-plan.js`
- `test/e2e-scaffold/gap-classifier.js`
- `test/e2e-scaffold/prompts/_base.md`
- `test/e2e-scaffold/prompts/fix-atoms.md`
- `test/e2e-scaffold/prompts/fix-imports.md`
- `test/e2e-scaffold/prompts/promote-component.md`
- `test/e2e-scaffold/prompts/promote-pattern.md`
- `test/e2e-scaffold/prompts/add-preset.md`
- `test/e2e-scaffold/prompts/improve-pattern.md`
- `test/e2e-scaffold/prompts/new-archetype.md`

## Success Criteria

1. Running `--action-plan` generates valid markdown
2. All gaps are classified with type and confidence
3. Prompts include gap source code when available
4. Action plan has checkboxes for tracking progress
5. Output is gitignored
6. Works with or without `--expect` flag

## Out of Scope

- Auto-executing prompts (user manually pastes into Claude)
- GitHub issue creation
- Interactive CLI selection
- External templating library dependencies
