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
import { runPipeline } from './engine.js';
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
        enum: ['ecommerce', 'saas-dashboard', 'portfolio', 'content-site', 'docs-explorer', 'general'],
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
        enum: ['auradecantism', 'clean', 'retro', 'glassmorphism', 'command-center'],
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

Available domains: ecommerce, saas-dashboard, portfolio, content-site, docs-explorer.
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
        ['ecommerce', 'saas-dashboard', 'portfolio', 'content-site', 'docs-explorer', 'general'].includes(llmResult.domain),
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
