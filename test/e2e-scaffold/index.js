/**
 * Decantr E2E Scaffold Test Suite
 *
 * Entry point for the scaffold testing harness.
 *
 * This is DEV-ONLY tooling - not shipped with the npm package.
 * See PLAN.md for usage instructions.
 */

// Corpus exports
export { coldStartCorpus, stats as coldStartStats } from './corpus/cold-start.js';
export { modificationCorpus, stats as modificationStats } from './corpus/modification.js';
export { edgeCaseCorpus, stats as edgeCaseStats } from './corpus/edge-cases.js';

// Runner & scoring
export { runTest } from './runner.js';
export { scoreTest } from './scorer.js';
export { generateReport } from './reporter.js';

// Validation
export { validateCompliance, getRules } from './validators/compliance.js';

// Visual validation (requires Playwright)
export { runVisualValidation, updateBaseline } from './visual.js';
