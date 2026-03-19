# Decantr E2E Scaffold Testing

Stress-test Decantr's LLM-driven scaffolding process. Identifies gaps in patterns, components, and archetypes while measuring accuracy, compliance, and efficiency.

**This is dev-only tooling** - not shipped with the npm package.

## Prerequisites

For scaffolding new projects, decantr must be available:

```bash
# From the decantr repo root, link it globally (run once)
npm link

# Then in any test project:
npm link decantr
```

## Quick Start

```bash
# List available test prompts
node test/e2e-scaffold/list-prompts.js

# Validate a scaffolded project
node test/e2e-scaffold/manual.js ./my-project

# Validate against corpus expectations
node test/e2e-scaffold/manual.js ./my-project --expect CS-001
```

## Manual Testing Workflow

### 1. List prompts

```bash
node test/e2e-scaffold/list-prompts.js           # All prompts
node test/e2e-scaffold/list-prompts.js cold-start # Just cold-start (CS-*)
node test/e2e-scaffold/list-prompts.js mod        # Just modification (MOD-*)
node test/e2e-scaffold/list-prompts.js edge       # Just edge cases (EC-*, ADV-*)
```

### 2. Scaffold a project

Pick a prompt, create a test directory, and link decantr:

```bash
# First, link decantr globally (run once from decantr repo root)
cd /path/to/decantr
npm link

# Create test project and link decantr
mkdir ~/test-scaffold && cd ~/test-scaffold
npm init -y
npm link decantr
```

Then in Claude Code (from the test project directory), paste the prompt:
> "I want to create a Photography Portfolio website with a stormy theme of blues blacks and glowy stuff"

Claude will scaffold the project using the linked decantr package.

### 3. Validate the result

```bash
# Basic validation
node test/e2e-scaffold/manual.js ~/test-scaffold

# Score against corpus entry
node test/e2e-scaffold/manual.js ~/test-scaffold --expect CS-001

# Include visual screenshots (requires Playwright)
node test/e2e-scaffold/manual.js ~/test-scaffold --expect CS-001 --visual
```

### 4. Test modifications

For modification tests (MOD-*), start from a fixture:

```bash
cp -r test/e2e-scaffold/fixtures/base-projects/saas-dashboard ~/test-mod
cd ~/test-mod
npm install   # Installs decantr from the file: reference in package.json
```

Then prompt Claude (from ~/test-mod):
> "I'd like to persist my dashboard light/dark theme toggle so it remembers my preference"

Validate:
```bash
node test/e2e-scaffold/manual.js ~/test-mod --expect MOD-001
```

**Note:** The fixtures use `"decantr": "file:../../../../.."` which points to the local decantr. If you copy the fixture elsewhere, update the path or use `npm link decantr` instead.

## Test Corpus

| Category | Count | IDs | Description |
|----------|-------|-----|-------------|
| Cold-Start | 20 | CS-001 to CS-020 | New project scaffolding |
| Modification | 20 | MOD-001 to MOD-020 | Changes to existing projects |
| Edge Cases | 16 | EC-001 to EC-016, ADV-001 to ADV-005 | Adversarial/unusual requests |

### Cold-Start Categories
- Portfolio/Creative (CS-001 to CS-003)
- Content/Blog (CS-004 to CS-006)
- SaaS/Dashboard (CS-007 to CS-010)
- E-commerce (CS-011 to CS-012)
- Specialized (CS-013 to CS-017)
- Vague prompts (CS-018 to CS-020)

### Modification Categories
- State management (MOD-001 to MOD-002)
- New features/pages (MOD-003 to MOD-005)
- Third-party integrations (MOD-006 to MOD-008)
- Deployment/build (MOD-009 to MOD-010)
- Style/theme changes (MOD-011 to MOD-013)
- Component modifications (MOD-014 to MOD-015)
- Navigation/routing (MOD-016 to MOD-017)
- Data/API (MOD-018 to MOD-020)

## Base Project Fixtures

Pre-scaffolded projects for modification tests:

```
fixtures/base-projects/
├── saas-dashboard/   # Dashboard with sidebar, KPIs, data tables
├── portfolio/        # Creative portfolio with hero, projects
├── content-site/     # Blog with articles, detail pages
├── ecommerce/        # Store with catalog, cart
└── docs-explorer/    # Documentation with sidebar nav
```

Test fixtures directly:
```bash
node test/e2e-scaffold/manual.js test/e2e-scaffold/fixtures/base-projects/saas-dashboard --expect CS-008
node test/e2e-scaffold/manual.js test/e2e-scaffold/fixtures/base-projects/portfolio --expect CS-001
```

## Validation Output

The validator checks:

| Check | Description |
|-------|-------------|
| **Structure** | Required files present (essence, app.js, index.html) |
| **Compliance** | 7 rules (no inline CSS, use atoms, valid imports, etc.) |
| **Gaps** | Local patterns/components created (indicates registry gaps) |
| **Corpus Match** | Terroir, style, mode, pages, patterns vs expectations |

## Visual Validation

Requires Playwright:
```bash
npm install -D playwright
npx playwright install chromium
```

Then:
```bash
# Capture screenshots
node test/e2e-scaffold/visual.js ./my-project

# Include mobile viewport
node test/e2e-scaffold/visual.js ./my-project --mobile

# Update baseline for comparison
node test/e2e-scaffold/visual.js ./my-project --update-baseline
```

## Automated Testing (API Mode)

Run the full corpus programmatically:

```bash
export ANTHROPIC_API_KEY=sk-...

# Full corpus
node test/e2e-scaffold/harness.js

# Single category
node test/e2e-scaffold/harness.js --category cold-start

# Single test
node test/e2e-scaffold/harness.js --test CS-001

# With visual validation
node test/e2e-scaffold/harness.js --visual

# Generate report from cached results
node test/e2e-scaffold/harness.js --report-only
```

## CI Integration

Copy `ci/e2e-scaffold.yml` to `.github/workflows/` to enable:
- Weekly scheduled runs (Monday 6am UTC)
- Manual dispatch with filters
- Artifact uploads for results

Requires `ANTHROPIC_API_KEY` secret in repository settings.

## Scoring Dimensions

| Dimension | Weight | Description |
|-----------|--------|-------------|
| Intent Accuracy | 25% | Did it match user's request? |
| Structural Completeness | 20% | Pages, patterns, components present? |
| Runtime Success | 20% | Does code parse and run? |
| Visual Fidelity | 10% | Theme, layout, appearance |
| Decantr Compliance | 15% | Rules followed? |
| Token Efficiency | 5% | Under budget? |
| Time Efficiency | 5% | Fast enough? |

Grades: A (90+), B (75+), C (60+), D (40+), F (<40)

## File Structure

```
test/e2e-scaffold/
├── README.md           # This file
├── PLAN.md             # Implementation plan
├── ARCHITECTURE.md     # Technical spec
├── index.js            # Module exports
├── harness.js          # Automated test orchestrator
├── runner.js           # Claude session spawner
├── scorer.js           # 8-dimension scoring
├── reporter.js         # Report generator
├── manual.js           # Manual validation CLI
├── list-prompts.js     # Prompt listing utility
├── visual.js           # Playwright visual validation
├── corpus/
│   ├── cold-start.js   # 20 init prompts
│   ├── modification.js # 20 change requests
│   └── edge-cases.js   # 16 edge/adversarial
├── validators/
│   └── compliance.js   # 7 compliance rules
├── fixtures/
│   └── base-projects/  # 5 pre-scaffolded projects
└── ci/
    └── e2e-scaffold.yml # GitHub Actions workflow
```

## Adding New Tests

### New corpus entry

Edit the appropriate corpus file:

```js
// corpus/cold-start.js
{
  id: 'CS-021',
  prompt: `Your test prompt here`,
  difficulty: 'medium', // easy, medium, hard
  expected: {
    terroir: 'portfolio',
    vintage: { style: ['glassmorphism'], mode: 'dark' },
    structure: {
      min_pages: 3,
      required_pages: ['home', 'projects'],
      required_patterns: ['hero', 'card-grid'],
    },
  },
  scoring: {
    intent_keywords: ['keyword1', 'keyword2'],
  },
}
```

### New fixture

```bash
mkdir -p test/e2e-scaffold/fixtures/base-projects/my-archetype/{src/pages,public}
# Add decantr.essence.json, package.json, public/index.html, src/app.js, src/pages/*.js
```

## Troubleshooting

**"Playwright is not installed"**
```bash
npm install -D playwright
npx playwright install chromium
```

**"ANTHROPIC_API_KEY not set"** (automated mode only)
```bash
export ANTHROPIC_API_KEY=sk-...
```

**Validation fails on valid project**
- Check `decantr.essence.json` exists and is valid JSON
- Ensure `src/app.js` exists
- Run with `--verbose` for detailed output
