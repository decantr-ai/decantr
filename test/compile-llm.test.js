import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// Import exported functions from compile-llm.js
// Note: importing the module will trigger main() — but since we use dynamic import
// and the module uses `await main()`, we need to import the exports carefully.
// Since the module runs main() on import, we test the functions indirectly.

// We can test section parser and utility functions via a re-implementation approach,
// or we read the module and test against its outputs.

// Import the module — this will trigger compilation but that's OK for tests
let parseSections, extractSection, estimateTokens, assemblePreamble, validate, loadSources, computeSourceHashes;

describe('Compile LLM', () => {
  it('module exports expected functions', async () => {
    const mod = await import('../tools/compile-llm.js');
    assert.equal(typeof mod.parseSections, 'function');
    assert.equal(typeof mod.extractSection, 'function');
    assert.equal(typeof mod.estimateTokens, 'function');
    assert.equal(typeof mod.assemblePreamble, 'function');
    assert.equal(typeof mod.validate, 'function');
    assert.equal(typeof mod.loadSources, 'function');
    assert.equal(typeof mod.computeSourceHashes, 'function');

    // Store for use in subsequent tests
    parseSections = mod.parseSections;
    extractSection = mod.extractSection;
    estimateTokens = mod.estimateTokens;
    assemblePreamble = mod.assemblePreamble;
    validate = mod.validate;
    loadSources = mod.loadSources;
    computeSourceHashes = mod.computeSourceHashes;
  });

  it('parseSections splits markdown by ## headings', async () => {
    const md = `# Title\nSome intro\n\n## 1. First Section\nContent one\n\n## 2. Second Section\nContent two`;
    const sections = parseSections(md);
    assert.ok(sections.has('1'));
    assert.ok(sections.has('2'));
    assert.ok(sections.get('1').content.includes('Content one'));
    assert.ok(sections.get('2').content.includes('Content two'));
  });

  it('parseSections handles no headings', async () => {
    const md = `Just plain text\nwith no headings`;
    const sections = parseSections(md);
    assert.equal(sections.size, 0);
  });

  it('parseSections handles single heading', async () => {
    const md = `## Only Section\nSome content here`;
    const sections = parseSections(md);
    assert.equal(sections.size, 1);
    assert.ok(sections.has('only-section'));
  });

  it('parseSections handles empty sections', async () => {
    const md = `## First\n## Second\nContent`;
    const sections = parseSections(md);
    assert.equal(sections.size, 2);
    // First section has no content (just the heading line)
    const first = sections.get('first');
    assert.ok(first);
  });

  it('extractSection retrieves by number key', async () => {
    const sections = parseSections(`## 3. My Section\nHello world`);
    const content = extractSection(sections, '3');
    assert.ok(content.includes('Hello world'));
  });

  it('extractSection returns empty for missing key', async () => {
    const sections = parseSections(`## 1. First\nContent`);
    const content = extractSection(sections, '99');
    assert.equal(content, '');
  });

  it('estimateTokens is within reasonable range', async () => {
    // ~4 chars per token
    const text = 'a'.repeat(400); // should be ~100 tokens
    const tokens = estimateTokens(text);
    assert.ok(tokens >= 80 && tokens <= 120, `Expected ~100, got ${tokens}`);
  });

  it('each profile builder produces non-empty output', async () => {
    const sources = loadSources();
    const preamble = assemblePreamble(sources);
    assert.ok(preamble.length > 0, 'Preamble should not be empty');
    assert.ok(preamble.includes('Methodology Preamble'), 'Preamble should contain methodology header');
    assert.ok(preamble.includes('Cork Rules'), 'Preamble should contain Cork Rules');
  });

  it('preamble contains required sections', async () => {
    const sources = loadSources();
    const preamble = assemblePreamble(sources);
    assert.ok(preamble.includes('Spatial Design Rules'));
    assert.ok(preamble.includes('Import Catalog'));
    assert.ok(preamble.includes('Cork Rules'));
  });

  it('validate catches missing preamble', async () => {
    const profiles = { 'task-test': 'No preamble here, no cork rules either' };
    const issues = validate(profiles, {});
    const errors = issues.filter(i => i.severity === 'ERROR');
    assert.ok(errors.length >= 1, 'Should flag missing preamble');
    assert.ok(errors.some(e => e.message.includes('Missing methodology preamble')));
  });

  it('validate catches missing cork rules', async () => {
    const profiles = { 'task-test': 'Methodology Preamble is here but no cork' };
    const issues = validate(profiles, {});
    const errors = issues.filter(i => i.severity === 'ERROR');
    assert.ok(errors.some(e => e.message.includes('Missing Cork Rules')));
  });

  it('computeSourceHashes returns non-empty hash map', async () => {
    const hashes = computeSourceHashes();
    assert.ok(Object.keys(hashes).length > 0, 'Should hash at least some files');
    // Every hash should be a 32-char hex string (MD5)
    for (const hash of Object.values(hashes)) {
      assert.ok(/^[a-f0-9]{32}$/.test(hash), `Expected MD5 hash, got: ${hash}`);
    }
  });

  it('computeSourceHashes is deterministic', async () => {
    const hash1 = computeSourceHashes();
    const hash2 = computeSourceHashes();
    assert.deepEqual(hash1, hash2);
  });

  it('output files exist after compilation', async () => {
    const llmDir = path.join(ROOT, 'llm');
    const expectedFiles = [
      'task-init.md', 'task-page.md', 'task-component.md',
      'task-style.md', 'task-debug.md', 'task-refactor.md',
    ];
    for (const file of expectedFiles) {
      const filePath = path.join(llmDir, file);
      assert.ok(fs.existsSync(filePath), `Expected ${file} to exist in llm/`);
      const content = fs.readFileSync(filePath, 'utf8');
      assert.ok(content.length > 0, `${file} should not be empty`);
    }
  });
});
