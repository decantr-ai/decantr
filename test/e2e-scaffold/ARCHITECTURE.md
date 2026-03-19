# Decantr E2E Scaffolding Test Harness

## Overview

This harness stress-tests Decantr's LLM-driven scaffolding across the full lifecycle:
- **Cold-start**: New project from natural language prompt
- **Modification**: Changes to existing scaffolded projects
- **Edge cases**: Missing patterns, novel requests, third-party integrations

## Architecture

```
test/e2e-scaffold/
├── ARCHITECTURE.md          # This file
├── harness.js               # Main test orchestrator
├── runner.js                # Spawns Claude sessions, captures output
├── validator.js             # Validates generated code
├── scorer.js                # Scores accuracy across dimensions
├── reporter.js              # Generates comprehensive reports
├── corpus/
│   ├── cold-start.js        # Init prompts (new projects)
│   ├── modification.js      # Change requests (existing projects)
│   ├── edge-cases.js        # Missing patterns, novel features
│   └── adversarial.js       # Tricky/ambiguous prompts
├── fixtures/
│   ├── base-projects/       # Pre-scaffolded projects for modification tests
│   └── expected-outputs/    # Golden files for comparison
├── validators/
│   ├── syntax.js            # Does it parse? (AST validation)
│   ├── runtime.js           # Does it run? (dev server boot)
│   ├── render.js            # Does it render? (Playwright screenshots)
│   ├── compliance.js        # Does it follow Decantr rules?
│   └── completeness.js      # Is everything wired up?
├── output/
│   └── [run-id]/            # Generated projects + reports per run
└── reports/
    └── aggregate.json       # Cross-run trends
```

## Scoring Schema

Each scaffold attempt is scored across **8 dimensions**:

### 1. Intent Accuracy (0-100)
Did the generated project match what the user asked for?

| Score | Meaning |
|-------|---------|
| 90-100 | Perfect match - all requested features present, correct domain |
| 70-89 | Good match - minor features missing or slightly off-theme |
| 50-69 | Partial match - core intent captured but significant gaps |
| 30-49 | Weak match - wrong domain or major misinterpretation |
| 0-29 | Failed - fundamentally wrong or broken |

### 2. Structural Completeness (0-100)
Are all expected pages, patterns, and components present?

- Pages present: 30 points
- Patterns resolved: 30 points
- Components used correctly: 20 points
- Router wired: 10 points
- State management present: 10 points

### 3. Runtime Success (0-100)
Does the generated code actually work?

- Parses without errors: 25 points
- Dev server boots: 25 points
- All routes render: 25 points
- No console errors: 25 points

### 4. Visual Fidelity (0-100)
Does it look like what was requested?

- Theme colors match request: 25 points
- Layout matches skeleton: 25 points
- Components render correctly: 25 points
- Responsive breakpoints work: 25 points

### 5. Decantr Compliance (0-100)
Did it follow Decantr rules?

- No inline CSS: 15 points
- Uses atoms correctly: 15 points
- Patterns from registry (not hand-rolled): 20 points
- Essence.json accurate: 20 points
- Cork rules respected: 15 points
- Imports from correct modules: 15 points

### 6. Token Efficiency (0-100)
How efficiently did the LLM complete the task?

- Under 10k tokens: 100 points
- 10-20k tokens: 80 points
- 20-40k tokens: 60 points
- 40-80k tokens: 40 points
- Over 80k tokens: 20 points

### 7. Time Efficiency (0-100)
How fast was the scaffold?

- Under 30 seconds: 100 points
- 30-60 seconds: 80 points
- 1-2 minutes: 60 points
- 2-5 minutes: 40 points
- Over 5 minutes: 20 points

### 8. Gap Detection Score
What's missing from the framework?

This isn't a 0-100 score but a structured report:
- Missing patterns (LLM had to improvise)
- Missing components (LLM created inline)
- Missing icons (LLM substituted)
- Missing archetypes (no good fit)

## Composite Score

```
Composite = (
  Intent × 0.25 +
  Structural × 0.20 +
  Runtime × 0.20 +
  Visual × 0.10 +
  Compliance × 0.15 +
  TokenEfficiency × 0.05 +
  TimeEfficiency × 0.05
)
```

**Grade thresholds:**
- A: 90-100
- B: 75-89
- C: 60-74
- D: 40-59
- F: 0-39

## Test Categories

### 1. Cold-Start Tests (Init Layer)

Test new project scaffolding from scratch.

| ID | Prompt | Domain | Difficulty |
|----|--------|--------|------------|
| CS-001 | Photography portfolio with stormy blues/blacks and glowy effects | portfolio | medium |
| CS-002 | Blog like Smashing Magazine with long-form articles, buyers guides | content-site | hard |
| CS-003 | Call center operations admin panel, light theme, pastel enterprise colors | saas-dashboard | hard |
| CS-004 | Rabbit adoption shelter site | content-site | easy |
| CS-005 | SaaS analytics dashboard with real-time charts | saas-dashboard | medium |
| CS-006 | Recipe sharing community with user submissions | recipe-community | medium |
| CS-007 | Developer documentation site with code examples | docs-explorer | medium |
| CS-008 | E-commerce store for vintage clothing | ecommerce | medium |
| CS-009 | Financial portfolio tracker with goal setting | financial-dashboard | hard |
| CS-010 | Gaming community platform with tournaments | gaming-platform | hard |

### 2. Modification Tests (Established Layer)

Test changes to existing scaffolded projects.

| ID | Base Project | Request | Tests |
|----|--------------|---------|-------|
| MOD-001 | saas-dashboard | Persist theme toggle | State management, localStorage |
| MOD-002 | content-site | Add music page like Soundcloud | Novel pattern creation |
| MOD-003 | portfolio | Wire header login to Clerk | Third-party auth integration |
| MOD-004 | ecommerce | Add wishlist feature | Feature addition to existing domain |
| MOD-005 | saas-dashboard | Add new analytics chart type | Component extension |
| MOD-006 | content-site | Add comments to blog posts | Feature requiring new state |
| MOD-007 | docs-explorer | Add search with fuzzy matching | Complex feature addition |
| MOD-008 | portfolio | Deploy to Vercel | Build/deploy guidance |

### 3. Edge Case Tests

| ID | Scenario | What We're Testing |
|----|----------|-------------------|
| EC-001 | Request pattern that doesn't exist | Does it create local pattern or fail gracefully? |
| EC-002 | Request icon that doesn't exist | Does it substitute or warn? |
| EC-003 | Request component that doesn't exist | Does it create or use closest match? |
| EC-004 | Conflicting style requests | How does it resolve "minimal but flashy"? |
| EC-005 | Extremely vague prompt | Does it ask clarifying questions? |
| EC-006 | Multi-domain in single prompt | Does it detect sections or pick one? |
| EC-007 | Request contradicts essence.json | Does it flag Cork violation? |
| EC-008 | Request deprecated pattern | Does it suggest replacement? |

### 4. Adversarial Tests

| ID | Prompt | Expected Behavior |
|----|--------|-------------------|
| ADV-001 | "Make it look like Stripe" | Should not copy branding, interpret as clean/professional |
| ADV-002 | "Add inline styles for performance" | Should refuse, explain atom system |
| ADV-003 | "Ignore the essence file" | Should refuse, explain Cork rules |
| ADV-004 | "Use React instead" | Should explain this is Decantr, offer translation |

## LLM Session Protocol

Each test spawns a fresh Claude session with:

1. **System prompt**: Standard Decantr CLAUDE.md
2. **Project context**: Either empty (cold-start) or pre-scaffolded (modification)
3. **User prompt**: The test prompt
4. **Capture**:
   - All tool calls and responses
   - Token counts (input/output)
   - Wall-clock time
   - Decision log (what files read, written, edited)

## Report Schema

```json
{
  "run_id": "2026-03-19T10:30:00Z",
  "model": "claude-opus-4-5-20251101",
  "corpus_version": "1.0.0",
  "summary": {
    "total_tests": 30,
    "passed": 25,
    "failed": 3,
    "skipped": 2,
    "avg_composite_score": 78.5,
    "avg_tokens": 15420,
    "avg_time_seconds": 45
  },
  "scores_by_category": {
    "cold-start": { "avg": 82.3, "count": 10 },
    "modification": { "avg": 75.1, "count": 8 },
    "edge-cases": { "avg": 71.2, "count": 8 },
    "adversarial": { "avg": 88.0, "count": 4 }
  },
  "gap_analysis": {
    "missing_patterns": [
      { "requested": "music-player", "frequency": 3, "workaround": "created local pattern" }
    ],
    "missing_components": [
      { "requested": "AudioPlayer", "frequency": 2, "workaround": "used native audio element" }
    ],
    "missing_icons": [
      { "requested": "headphones", "frequency": 1, "substituted": "music" }
    ],
    "archetype_gaps": [
      { "domain": "music-streaming", "frequency": 2, "closest": "content-site" }
    ]
  },
  "compliance_violations": [
    { "rule": "no-inline-css", "frequency": 5, "examples": ["CS-002", "MOD-003"] },
    { "rule": "use-atoms", "frequency": 2, "examples": ["EC-003"] }
  ],
  "llm_observations": {
    "improvisation_points": [
      { "test": "MOD-002", "description": "Created AudioPlayer component inline", "quality": "acceptable" }
    ],
    "confusion_points": [
      { "test": "EC-004", "description": "Unclear how to balance minimal vs flashy", "resolution": "asked user" }
    ],
    "strengths": [
      "Consistent essence.json generation",
      "Good pattern selection for common domains"
    ],
    "weaknesses": [
      "Struggles with multi-domain detection",
      "Sometimes creates inline CSS for edge cases"
    ]
  },
  "recommendations": [
    { "priority": "high", "action": "Add music-player pattern to registry" },
    { "priority": "medium", "action": "Add AudioPlayer component" },
    { "priority": "low", "action": "Add headphones icon to essential set" }
  ],
  "tests": [
    {
      "id": "CS-001",
      "category": "cold-start",
      "prompt": "Photography portfolio with stormy blues/blacks and glowy effects",
      "scores": {
        "intent": 85,
        "structural": 90,
        "runtime": 100,
        "visual": 75,
        "compliance": 95,
        "token_efficiency": 80,
        "time_efficiency": 85
      },
      "composite": 87.5,
      "grade": "B",
      "tokens": { "input": 8500, "output": 12000 },
      "time_seconds": 42,
      "gaps_detected": [],
      "compliance_violations": [],
      "notes": "Good interpretation of 'stormy' theme, used glassmorphism with dark mode"
    }
  ]
}
```

## Running Tests

```bash
# Run full corpus
ANTHROPIC_API_KEY=sk-... node test/e2e-scaffold/harness.js

# Run specific category
node test/e2e-scaffold/harness.js --category cold-start

# Run single test
node test/e2e-scaffold/harness.js --test CS-001

# Run with visual validation (requires Playwright)
node test/e2e-scaffold/harness.js --visual

# Generate report only (from cached results)
node test/e2e-scaffold/harness.js --report-only
```

## Environment Variables

- `ANTHROPIC_API_KEY` - Required for LLM calls
- `DECANTR_E2E_MODEL` - Model to use (default: claude-sonnet-4-20250514)
- `DECANTR_E2E_TIMEOUT` - Per-test timeout in ms (default: 300000)
- `DECANTR_E2E_VISUAL` - Enable Playwright screenshots (default: false)
- `DECANTR_E2E_PARALLEL` - Number of parallel tests (default: 1)

## CI Integration

```yaml
# .github/workflows/e2e-scaffold.yml
name: E2E Scaffold Tests
on:
  schedule:
    - cron: '0 6 * * 1'  # Weekly Monday 6am
  workflow_dispatch:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: node test/e2e-scaffold/harness.js --visual
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
      - uses: actions/upload-artifact@v4
        with:
          name: e2e-report
          path: test/e2e-scaffold/output/
```
