# Decantr E2E Scaffold Testing - Implementation Plan

## Important: Dev-Only Tooling

**This test suite is NOT part of the distributed Decantr package.**

Decantr ships with zero dependencies. This testing harness lives in `test/` and is excluded from npm publication. It's for framework development and QA only.

## Two Testing Modes

### 1. Manual Testing (No API Cost)

You scaffold a project using Claude Code with your normal subscription, then run the validator:

```bash
# Scaffold a project manually with Claude Code
claude "Create a photography portfolio with stormy blues and glowy effects"

# Validate the result
node test/e2e-scaffold/manual.js ./my-project

# Validate against a specific corpus entry
node test/e2e-scaffold/manual.js ./my-project --expect CS-001

# Full validation with screenshots
node test/e2e-scaffold/manual.js ./my-project --visual
```

### 2. Automated Testing (API Cost)

Runs prompts through Claude API programmatically:

```bash
ANTHROPIC_API_KEY=sk-... node test/e2e-scaffold/harness.js
```

---

## Executive Summary

This document outlines a comprehensive strategy for stress-testing Decantr's LLM-driven scaffolding process. The goal is to identify gaps in patterns, components, archetypes, and behaviors while measuring accuracy, compliance, and efficiency.

## What's Been Built

### Infrastructure (Complete)

```
test/e2e-scaffold/
├── ARCHITECTURE.md      # Full technical spec
├── PLAN.md              # This file
├── manual.js            # Manual validation (no API cost)
├── harness.js           # Automated test orchestrator
├── runner.js            # Claude session spawner
├── scorer.js            # 8-dimension scoring engine
├── reporter.js          # Report generator
├── index.js             # Module exports
├── corpus/
│   ├── cold-start.js    # 20 init prompts
│   ├── modification.js  # 20 change requests
│   └── edge-cases.js    # 16 edge/adversarial tests
└── validators/
    └── compliance.js    # 7 compliance rules
```

### Test Corpus (56 tests)

| Category | Count | Purpose |
|----------|-------|---------|
| Cold-Start | 20 | New project scaffolding |
| Modification | 20 | Changes to existing projects |
| Edge Cases | 16 | Missing resources, conflicts, adversarial |

### Scoring Schema (8 dimensions)

| Dimension | Weight | What It Measures |
|-----------|--------|------------------|
| Intent Accuracy | 25% | Did it match user's request? |
| Structural Completeness | 20% | Pages, patterns, components present? |
| Runtime Success | 20% | Does code parse and run? |
| Visual Fidelity | 10% | Theme, layout, appearance |
| Decantr Compliance | 15% | Rules followed? |
| Token Efficiency | 5% | Under budget? |
| Time Efficiency | 5% | Fast enough? |

## What's Needed to Complete

### Phase 1: Core Functionality (1-2 days)

1. **Claude Code Integration**
   - The runner.js currently has placeholder code for spawning Claude
   - Need to integrate with actual Claude Code CLI or direct API
   - Decision: Use `claude --print` CLI or direct API with tool_use

2. **Base Project Fixtures**
   - Create `fixtures/base-projects/` with pre-scaffolded projects
   - One for each archetype: saas-dashboard, portfolio, content-site, ecommerce, docs-explorer
   - These serve as starting points for modification tests

```bash
# Generate fixtures
node tools/generate.js --essence fixtures/base-projects/saas-dashboard/decantr.essence.json
```

### Phase 2: Visual Validation (2-3 days)

1. **Playwright Integration**
   - Install Playwright: `npm install -D @playwright/test`
   - Create screenshot capture for each route
   - Compare against baseline images

2. **Visual Scoring**
   - Theme color extraction
   - Layout structure verification
   - Responsive breakpoint testing

### Phase 3: CI Integration (1 day)

1. **GitHub Actions Workflow**
   ```yaml
   # .github/workflows/e2e-scaffold.yml
   name: E2E Scaffold Tests
   on:
     schedule:
       - cron: '0 6 * * 1'  # Weekly
     workflow_dispatch:
   ```

2. **Cost Management**
   - Set token budget limits
   - Implement test sampling for daily runs

### Phase 4: Iteration & Gap Filling (Ongoing)

Based on report output:
1. Add missing patterns to registry
2. Add missing components
3. Improve LLM prompts for common failures
4. Expand corpus with failure-specific tests

## Manual Testing Workflow

This is the recommended workflow for testing with your monthly Claude subscription:

### Step 1: Pick a corpus entry to test

```bash
# List available test prompts
node -e "
  import('./corpus/cold-start.js').then(m => {
    m.coldStartCorpus.forEach(e => console.log(e.id + ': ' + e.prompt.slice(0, 60) + '...'));
  });
"
```

### Step 2: Scaffold manually with Claude Code

Open Claude Code and paste the prompt:

```
CS-001: "I want to create a Photography Portfolio website with a stormy theme of blues blacks and glowy stuff"
```

Let Claude scaffold the project.

### Step 3: Validate the result

```bash
# Basic validation
node test/e2e-scaffold/manual.js ~/path/to/scaffolded-project

# Validate against the corpus entry's expectations
node test/e2e-scaffold/manual.js ~/path/to/scaffolded-project --expect CS-001

# Include visual screenshots (requires Playwright)
node test/e2e-scaffold/manual.js ~/path/to/scaffolded-project --expect CS-001 --visual
```

### Step 4: Review the report

The validator outputs:
- **Structure check**: Are all expected files present?
- **Compliance check**: Any rule violations?
- **Gap detection**: Did Claude create local patterns/components?
- **Corpus match**: How well does it match expectations?

### Step 5: Document findings

If you find issues, document them:
- Missing pattern? Add to `corpus/edge-cases.js` and create registry issue
- Compliance failure? Check if CLAUDE.md needs clarification
- Wrong interpretation? Add adversarial test case

---

## Automated Testing (API Mode)

For batch testing with API costs:

### Prerequisites

```bash
# Ensure API key is set
export ANTHROPIC_API_KEY=sk-...
```

### Commands

```bash
# Run full corpus
node test/e2e-scaffold/harness.js

# Run specific category
node test/e2e-scaffold/harness.js --category cold-start

# Run single test
node test/e2e-scaffold/harness.js --test CS-001

# With visual validation
node test/e2e-scaffold/harness.js --visual

# Generate report from cached results
node test/e2e-scaffold/harness.js --report-only

# Use different model
node test/e2e-scaffold/harness.js --model claude-opus-4-5-20251101
```

## Expected Outputs

### Per-Test Output

```
test/e2e-scaffold/output/[run-id]/[test-id]/
├── project/               # Generated project files
├── session.json           # Full conversation log
├── screenshots/           # Visual captures (if enabled)
└── scores.json            # Individual scores
```

### Aggregate Report

```
test/e2e-scaffold/output/
├── report.json            # Full JSON report
├── REPORT.md              # Markdown summary
└── results-[timestamp].json
```

### Report Contents

- **Summary**: Pass/fail counts, averages
- **Category Breakdown**: Scores by test type
- **Dimension Analysis**: Which dimensions are weakest
- **Gap Analysis**: Missing patterns, components, icons
- **Compliance Violations**: Rule breaches
- **LLM Observations**: Strengths, weaknesses, confusion points
- **Recommendations**: Prioritized action items

## Key Metrics to Track Over Time

| Metric | Target | Rationale |
|--------|--------|-----------|
| Overall Pass Rate | >85% | Most tests should succeed |
| Cold-Start Avg Score | >80 | New projects should work well |
| Compliance Score | >90% | Rules should be followed |
| Token Efficiency | <20k avg | Keep costs reasonable |
| Gap Frequency | Decreasing | Registry should grow |

## Strategic Questions Answered

### 1. How accurate does it deliver the request?
Measured by **Intent Accuracy** (25% weight) + **Structural Completeness** (20% weight)

### 2. How long does it take?
Measured by **Time Efficiency** dimension + duration tracking

### 3. Is it token efficient?
Measured by **Token Efficiency** dimension + per-test token counts

### 4. Does it follow hard rules?
Measured by **Compliance** dimension with 7 specific rules:
- No inline CSS
- Use atoms
- Valid imports
- No foreign frameworks
- Essence structure
- Pattern registry preference
- Component registry preference

### 5. Where are the gaps?
Detected via:
- `missing_patterns` in gap analysis
- `missing_components` in gap analysis
- `missing_icons` in gap analysis
- `archetype_gaps` for domains without good fits

### 6. Where did the LLM improvise?
Tracked via:
- `improvisation_points` in LLM observations
- Local pattern/component creation detection
- Conversation log analysis

## Next Steps

1. **Immediate**: Run a few manual tests to validate the harness works
2. **This Week**: Generate base project fixtures
3. **Next Week**: Add Playwright visual validation
4. **Ongoing**: Expand corpus based on real user prompts

## Cost Estimates

| Scenario | Tests | Est. Tokens | Est. Cost |
|----------|-------|-------------|-----------|
| Full corpus (Sonnet) | 56 | ~1.1M | ~$4 |
| Full corpus (Opus) | 56 | ~1.1M | ~$16 |
| Weekly CI (Sonnet) | 56 | ~1.1M | ~$16/mo |
| Daily sampling (10) | 10 | ~200k | ~$25/mo |

## Contact

For questions about this testing infrastructure, refer to:
- `test/e2e-scaffold/ARCHITECTURE.md` for technical details
- `test/decantation/` for the existing deterministic test suite
- `CLAUDE.md` for Decantr framework documentation
