#!/usr/bin/env node
/**
 * List available test prompts from the corpus.
 *
 * Usage:
 *   node test/e2e-scaffold/list-prompts.js [category]
 *
 * Examples:
 *   node test/e2e-scaffold/list-prompts.js              # All
 *   node test/e2e-scaffold/list-prompts.js cold-start   # Just cold-start
 *   node test/e2e-scaffold/list-prompts.js mod          # Modification tests
 */

import { coldStartCorpus } from './corpus/cold-start.js';
import { modificationCorpus } from './corpus/modification.js';
import { edgeCaseCorpus } from './corpus/edge-cases.js';

const category = process.argv[2]?.toLowerCase();

function printEntry(e, cat) {
  const prompt = e.prompt.length > 70 ? e.prompt.slice(0, 67) + '...' : e.prompt;
  console.log(`  ${e.id.padEnd(8)} [${e.difficulty.padEnd(6)}] ${prompt}`);
}

if (!category || category === 'cold-start' || category === 'cold' || category === 'cs') {
  console.log('\n  COLD-START (New Project Scaffolding)');
  console.log('  ─────────────────────────────────────');
  for (const e of coldStartCorpus) {
    printEntry(e, 'cold-start');
  }
}

if (!category || category === 'modification' || category === 'mod') {
  console.log('\n  MODIFICATION (Existing Project Changes)');
  console.log('  ────────────────────────────────────────');
  for (const e of modificationCorpus) {
    const base = `[base: ${e.baseProject}]`;
    const prompt = e.prompt.length > 50 ? e.prompt.slice(0, 47) + '...' : e.prompt;
    console.log(`  ${e.id.padEnd(8)} ${base.padEnd(20)} ${prompt}`);
  }
}

if (!category || category === 'edge' || category === 'edge-cases' || category === 'ec') {
  console.log('\n  EDGE CASES & ADVERSARIAL');
  console.log('  ─────────────────────────');
  for (const e of edgeCaseCorpus) {
    printEntry(e, 'edge-cases');
  }
}

console.log(`
  Usage:
    1. Pick a prompt to test
    2. Scaffold with Claude Code using that prompt
    3. Validate: node test/e2e-scaffold/manual.js <project-dir> --expect <ID>
`);
