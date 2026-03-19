/**
 * Decantation Process — LLM Integration Tests
 *
 * Gated by DECANTR_TEST_LLM=1 environment variable.
 * Requires ANTHROPIC_API_KEY to be set.
 *
 * Runs prompts through both the deterministic engine and Claude,
 * then compares decisions to measure divergence.
 *
 * Usage: DECANTR_TEST_LLM=1 ANTHROPIC_API_KEY=sk-... node --test test/decantation/integration.test.js
 */

import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { runPipeline, resolveArchetype, loadArchetypes, clearCaches } from './engine.js';
import { DecisionLog } from './decision-log.js';
import { corpus } from './corpus.js';

const LLM_ENABLED = process.env.DECANTR_TEST_LLM === '1';
const API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = 'claude-sonnet-4-20250514';

/**
 * Call Claude with structured output for a decantation stage.
 */
async function callClaude(systemPrompt, userPrompt, toolSchema) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
      tools: [toolSchema],
      tool_choice: { type: 'tool', name: toolSchema.name },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const toolUse = data.content.find(c => c.type === 'tool_use');
  return toolUse?.input;
}

const SETTLE_TOOL = {
  name: 'settle_classification',
  description: 'Classify a user prompt into a domain archetype and list activated features',
  input_schema: {
    type: 'object',
    properties: {
      domain: {
        type: 'string',
        enum: ['ecommerce', 'saas-dashboard', 'portfolio', 'content-site', 'docs-explorer', 'recipe-community', 'general'],
        description: 'The best-fit domain archetype',
      },
      confidence: {
        type: 'string',
        enum: ['confident', 'ambiguous', 'none'],
        description: 'Confidence in the classification',
      },
      features: {
        type: 'array',
        items: { type: 'string' },
        description: 'List of feature IDs that should be activated',
      },
      character: {
        type: 'array',
        items: { type: 'string' },
        description: 'Character traits for the project (e.g., functional, playful, bold)',
      },
      style: {
        type: 'string',
        enum: ['auradecantism', 'clean', 'retro', 'glassmorphism'],
        description: 'Suggested visual style',
      },
      mode: {
        type: 'string',
        enum: ['light', 'dark', 'auto'],
        description: 'Suggested color mode',
      },
      reasoning: {
        type: 'string',
        description: 'Brief explanation of the classification decision',
      },
    },
    required: ['domain', 'confidence', 'features', 'reasoning'],
  },
};

const SETTLE_SYSTEM = `You are the SETTLE stage of the Decantr decantation process.
Given a user's project description, classify it into a domain archetype and identify features.

Available domains: ecommerce, saas-dashboard, portfolio, content-site, docs-explorer, recipe-community.
Use "general" if no domain fits.

For ecommerce, features include: product-catalog, product-detail, cart, checkout, auth, search, filtering, categories, navbar, footer, wishlist, reviews, coupons, payment-integration, order-confirmation, order-history, user-profile, cart-persistence.

Classify the domain, list features that should be activated, suggest character traits and visual style.`;

describe('LLM Integration', { skip: !LLM_ENABLED }, () => {
  before(() => {
    if (!API_KEY) {
      throw new Error('ANTHROPIC_API_KEY must be set for LLM integration tests');
    }
  });

  // Run a subset of the corpus through both engine and LLM
  const testSubset = corpus
    .filter(e => e.category === 'single-domain' && e.domain === 'ecommerce')
    .slice(0, 5);

  for (const entry of testSubset) {
    it(`[${entry.id}] Engine vs LLM: "${entry.prompt.slice(0, 50)}"`, async () => {
      // Run engine
      const engineResult = await runPipeline(entry.prompt);

      // Run LLM
      const llmResult = await callClaude(SETTLE_SYSTEM, entry.prompt, SETTLE_TOOL);

      assert.ok(llmResult, 'LLM should return structured output');
      assert.ok(llmResult.domain, 'LLM should classify a domain');

      // Compare domain classification
      const domainMatch = engineResult.classification.winner === llmResult.domain ||
                          (engineResult.classification.winner === null && llmResult.domain === 'general');

      // Compare feature overlap
      const engineFeatures = new Set(Object.keys(engineResult.activated));
      const llmFeatures = new Set(llmResult.features || []);
      const overlap = [...engineFeatures].filter(f => llmFeatures.has(f));
      const overlapRatio = engineFeatures.size > 0
        ? overlap.length / Math.max(engineFeatures.size, llmFeatures.size)
        : 0;

      // Log comparison (don't assert hard — this is measurement, not validation)
      console.log(`  ${entry.id}: domain=${domainMatch ? 'MATCH' : 'DIVERGE'} (engine=${engineResult.classification.winner}, llm=${llmResult.domain}), features overlap=${Math.round(overlapRatio * 100)}%`);

      // LLM should at minimum produce a valid domain
      assert.ok(
        ['ecommerce', 'saas-dashboard', 'portfolio', 'content-site', 'docs-explorer', 'recipe-community', 'general'].includes(llmResult.domain),
        `Invalid domain from LLM: ${llmResult.domain}`
      );

      // LLM should produce character traits (something engine can't do)
      if (llmResult.character) {
        assert.ok(Array.isArray(llmResult.character), 'Character should be array');
      }
    });
  }

  // Test ambiguous prompts — LLM should ask for clarification
  const ambiguousSubset = corpus
    .filter(e => e.category === 'ambiguous')
    .slice(0, 3);

  for (const entry of ambiguousSubset) {
    it(`[${entry.id}] LLM handles ambiguity: "${entry.prompt}"`, async () => {
      const llmResult = await callClaude(SETTLE_SYSTEM, entry.prompt, SETTLE_TOOL);
      assert.ok(llmResult);

      // For ambiguous prompts, LLM should either return "general" or low confidence
      const isAmbiguous = llmResult.domain === 'general' ||
                          llmResult.confidence === 'none' ||
                          llmResult.confidence === 'ambiguous';

      console.log(`  ${entry.id}: domain=${llmResult.domain}, confidence=${llmResult.confidence}, ambiguous=${isAmbiguous}`);
    });
  }
});

// ══════════════════════════════════════════════════════════════════════════
// ARCHETYPE INHERITANCE
// ══════════════════════════════════════════════════════════════════════════

describe('Archetype Inheritance', () => {
  let archetypes;

  before(async () => {
    clearCaches();
    archetypes = await loadArchetypes();
  });

  it('resolves archetype without extends as-is', async () => {
    const resolved = await resolveArchetype('ecommerce');
    assert.ok(resolved);
    assert.equal(resolved.id, 'ecommerce');
    assert.ok(Array.isArray(resolved.pages));
    assert.ok(resolved.pages.length > 0);
    assert.ok(!resolved.extends, 'Resolved archetype should not have extends field');
  });

  it('basic extends resolves pages from parent', async () => {
    const resolved = await resolveArchetype('financial-dashboard');
    assert.ok(resolved);
    // financial-dashboard extends saas-dashboard, so it should have parent pages
    // that were not overridden (e.g. analytics, users, user-detail from saas-dashboard)
    const pageIds = resolved.pages.map(p => p.id);
    assert.ok(pageIds.includes('analytics'), 'Should inherit analytics page from saas-dashboard');
    assert.ok(pageIds.includes('users'), 'Should inherit users page from saas-dashboard');
    assert.ok(pageIds.includes('user-detail'), 'Should inherit user-detail page from saas-dashboard');
  });

  it('child pages override parent pages by id', async () => {
    const resolved = await resolveArchetype('financial-dashboard');
    const overviewPage = resolved.pages.find(p => p.id === 'overview');
    assert.ok(overviewPage, 'Should have overview page');
    // The child's overview has goal-tracker pattern, parent does not
    assert.ok(overviewPage.patterns.includes('goal-tracker'),
      'overview should be the child version with goal-tracker');
  });

  it('child adds new pages not in parent', async () => {
    const resolved = await resolveArchetype('financial-dashboard');
    const pageIds = resolved.pages.map(p => p.id);
    assert.ok(pageIds.includes('pipeline'), 'Should have child-only pipeline page');
    assert.ok(pageIds.includes('approvals'), 'Should have child-only approvals page');
    assert.ok(pageIds.includes('collections'), 'Should have child-only collections page');
    assert.ok(pageIds.includes('outreach'), 'Should have child-only outreach page');
    assert.ok(pageIds.includes('scorecard'), 'Should have child-only scorecard page');
    assert.ok(pageIds.includes('vendors'), 'Should have child-only vendors page');
  });

  it('tannins are concatenated and deduped', async () => {
    const resolved = await resolveArchetype('financial-dashboard');
    const parentArchetype = archetypes['saas-dashboard'];

    // Should include parent tannins
    for (const t of parentArchetype.tannins) {
      assert.ok(resolved.tannins.includes(t), `Should inherit parent tannin "${t}"`);
    }

    // Should include child tannins
    assert.ok(resolved.tannins.includes('portfolio-state'), 'Should have child tannin portfolio-state');
    assert.ok(resolved.tannins.includes('pipeline-state'), 'Should have child tannin pipeline-state');
    assert.ok(resolved.tannins.includes('compliance-state'), 'Should have child tannin compliance-state');

    // Should be deduped (auth appears in both parent and child via parent inheritance)
    const authCount = resolved.tannins.filter(t => t === 'auth').length;
    assert.equal(authCount, 1, 'auth should appear exactly once (deduped)');
  });

  it('skeletons are merged with child overriding', async () => {
    const resolved = await resolveArchetype('financial-dashboard');
    // Parent (saas-dashboard) has sidebar-main and centered
    assert.ok(resolved.skeletons['sidebar-main'], 'Should inherit sidebar-main skeleton from parent');
    assert.ok(resolved.skeletons['centered'], 'Should inherit centered skeleton from parent');
  });

  it('suggested_vintage child overrides parent', async () => {
    const resolved = await resolveArchetype('financial-dashboard');
    // Child financial-dashboard has its own suggested_vintage
    assert.ok(resolved.suggested_vintage);
    assert.ok(resolved.suggested_vintage.styles.includes('auradecantism'),
      'Should have child suggested_vintage styles');
  });

  it('circular dependency detection throws', async () => {
    // Temporarily inject a circular reference
    const original = archetypes['saas-dashboard'];
    archetypes['saas-dashboard'] = { ...original, extends: 'financial-dashboard' };

    try {
      await assert.rejects(
        () => resolveArchetype('financial-dashboard'),
        (err) => {
          assert.ok(err.message.includes('Circular archetype inheritance'),
            `Expected circular error, got: ${err.message}`);
          return true;
        }
      );
    } finally {
      // Restore original
      archetypes['saas-dashboard'] = original;
    }
  });

  it('depth limit (>5) throws', async () => {
    // Create a deep chain by temporarily modifying cache
    // Save originals
    const originals = {};
    const ids = ['saas-dashboard', 'ecommerce', 'portfolio', 'content-site', 'docs-explorer'];

    for (const id of ids) {
      originals[id] = archetypes[id];
    }

    // Build chain: financial-dashboard -> saas-dashboard -> ecommerce -> portfolio -> content-site -> docs-explorer -> recipe-community
    // That's depth 6 which exceeds the limit of 5
    archetypes['saas-dashboard'] = { ...originals['saas-dashboard'], extends: 'ecommerce' };
    archetypes['ecommerce'] = { ...originals['ecommerce'], extends: 'portfolio' };
    archetypes['portfolio'] = { ...originals['portfolio'], extends: 'content-site' };
    archetypes['content-site'] = { ...originals['content-site'], extends: 'docs-explorer' };
    archetypes['docs-explorer'] = { ...originals['docs-explorer'], extends: 'recipe-community' };

    try {
      await assert.rejects(
        () => resolveArchetype('financial-dashboard'),
        (err) => {
          assert.ok(err.message.includes('depth exceeds limit'),
            `Expected depth limit error, got: ${err.message}`);
          return true;
        }
      );
    } finally {
      // Restore all originals
      for (const id of ids) {
        archetypes[id] = originals[id];
      }
    }
  });

  it('unknown archetype throws', async () => {
    await assert.rejects(
      () => resolveArchetype('nonexistent-archetype'),
      (err) => {
        assert.ok(err.message.includes('Unknown archetype'),
          `Expected unknown archetype error, got: ${err.message}`);
        return true;
      }
    );
  });

  it('multi-level inheritance (A extends B extends C) works', async () => {
    // Temporarily make a 3-level chain:
    // financial-dashboard (already extends saas-dashboard)
    // Make saas-dashboard extend portfolio temporarily
    const originalSaas = archetypes['saas-dashboard'];
    archetypes['saas-dashboard'] = { ...originalSaas, extends: 'portfolio' };

    try {
      const resolved = await resolveArchetype('financial-dashboard');
      const pageIds = resolved.pages.map(p => p.id);

      // Should have pages from portfolio (grandparent)
      assert.ok(pageIds.includes('projects') || pageIds.includes('home'),
        'Should inherit pages from grandparent (portfolio)');

      // Should have pages from saas-dashboard (parent)
      assert.ok(pageIds.includes('analytics'),
        'Should inherit pages from parent (saas-dashboard)');

      // Should have child-specific pages
      assert.ok(pageIds.includes('pipeline'),
        'Should have child-specific pages (financial-dashboard)');

      // Tannins should merge across all 3 levels
      const portfolioArchetype = archetypes['portfolio'];
      if (portfolioArchetype.tannins) {
        for (const t of portfolioArchetype.tannins) {
          assert.ok(resolved.tannins.includes(t),
            `Should inherit grandparent tannin "${t}"`);
        }
      }
    } finally {
      archetypes['saas-dashboard'] = originalSaas;
    }
  });

  it('resolved archetype has no extends field', async () => {
    const resolved = await resolveArchetype('financial-dashboard');
    assert.equal(resolved.extends, undefined, 'extends field should be removed after resolution');
  });
});
