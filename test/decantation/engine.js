/**
 * Decantation Process — Deterministic Engine
 *
 * Extracts the algorithms described in AGENTS.md into pure, testable JS functions.
 * No LLM calls. No DOM. No side effects beyond the DecisionLog passed in.
 */

import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REGISTRY = join(__dirname, '..', '..', 'src', 'registry');

// ── Data Loaders ──────────────────────────────────────────────────────────

let _domainCache = null;
let _archetypeCache = null;
let _crossCuttingCache = null;
let _patternIndexCache = null;

export async function loadDomains() {
  if (_domainCache) return _domainCache;
  const idx = JSON.parse(await readFile(join(REGISTRY, 'architect', 'index.json'), 'utf-8'));
  const domains = {};
  for (const [id, meta] of Object.entries(idx.domains)) {
    domains[id] = JSON.parse(await readFile(join(REGISTRY, 'architect', meta.file), 'utf-8'));
  }
  _domainCache = domains;
  return domains;
}

export async function loadArchetypes() {
  if (_archetypeCache) return _archetypeCache;
  const idx = JSON.parse(await readFile(join(REGISTRY, 'archetypes', 'index.json'), 'utf-8'));
  const archetypes = {};
  for (const [id, meta] of Object.entries(idx.archetypes)) {
    archetypes[id] = JSON.parse(await readFile(join(REGISTRY, 'archetypes', meta.file), 'utf-8'));
  }
  _archetypeCache = archetypes;
  return archetypes;
}

export async function loadCrossCutting() {
  if (_crossCuttingCache) return _crossCuttingCache;
  _crossCuttingCache = JSON.parse(await readFile(join(REGISTRY, 'architect', 'cross-cutting.json'), 'utf-8'));
  return _crossCuttingCache;
}

export async function loadPatternIndex() {
  if (_patternIndexCache) return _patternIndexCache;
  _patternIndexCache = JSON.parse(await readFile(join(REGISTRY, 'patterns', 'index.json'), 'utf-8'));
  return _patternIndexCache;
}

export function clearCaches() {
  _domainCache = null;
  _archetypeCache = null;
  _crossCuttingCache = null;
  _patternIndexCache = null;
}

// ── Archetype Inheritance ─────────────────────────────────────────────────

/**
 * Resolve an archetype with inheritance support.
 * If the archetype has an `extends` field, recursively load and merge with parent.
 *
 * @param {string} id - Archetype ID
 * @param {Set} [visited] - Visited set for circular dependency detection
 * @param {number} [depth] - Current depth (max 5)
 * @returns {Promise<Object>} Fully resolved archetype
 */
export async function resolveArchetype(id, visited = new Set(), depth = 0) {
  if (depth > 5) throw new Error(`Archetype inheritance depth exceeds limit (5): ${id}`);
  if (visited.has(id)) throw new Error(`Circular archetype inheritance: ${[...visited, id].join(' → ')}`);

  const archetypes = await loadArchetypes();
  const archetype = archetypes[id];
  if (!archetype) throw new Error(`Unknown archetype: ${id}`);

  if (!archetype.extends) return { ...archetype };

  visited.add(id);
  const parent = await resolveArchetype(archetype.extends, visited, depth + 1);

  return mergeArchetypes(parent, archetype);
}

/**
 * Deep-merge a parent archetype with a child archetype.
 * - Pages: child adds/overrides by id
 * - Tannins: concat + dedup
 * - Skeletons: child overrides individual keys
 * - All other fields: child overrides parent (shallow)
 *
 * @param {Object} parent - Resolved parent archetype
 * @param {Object} child - Child archetype (may still have `extends`)
 * @returns {Object} Merged archetype
 */
function mergeArchetypes(parent, child) {
  const result = { ...parent, ...child };
  delete result.extends;

  // Pages: child adds/overrides by id
  const parentPages = parent.pages || [];
  const childPages = child.pages || [];
  const pageMap = new Map(parentPages.map(p => [p.id, p]));
  for (const page of childPages) {
    pageMap.set(page.id, page);
  }
  result.pages = [...pageMap.values()];

  // Tannins: concat + dedup
  const parentTannins = parent.tannins || [];
  const childTannins = child.tannins || [];
  result.tannins = [...new Set([...parentTannins, ...childTannins])];

  // Skeletons: child overrides individual keys
  if (parent.skeletons || child.skeletons) {
    result.skeletons = { ...(parent.skeletons || {}), ...(child.skeletons || {}) };
  }

  // suggested_vintage: child overrides entirely (already handled by spread)

  return result;
}

// ── Synthetic Trigger Generation ──────────────────────────────────────────

/**
 * For domains without a hand-authored trigger/feature file (saas-dashboard,
 * portfolio, content-site, docs-explorer), derive synthetic triggers from
 * archetype metadata.
 */
export function deriveSyntheticTriggers(archetype) {
  const id = archetype.id;
  const nameTokens = archetype.name.toLowerCase().split(/[\s-]+/);
  const descTokens = archetype.description.toLowerCase().split(/[\s,.-]+/).filter(t => t.length > 3);

  // Stop words — too generic to be useful as individual triggers
  const STOP = new Set([
    'with', 'and', 'for', 'the', 'page', 'pages', 'website', 'home', 'site',
    'login', 'register', 'contact', 'about', 'search', 'navigation', 'content',
    'main', 'area', 'management', 'online', 'interactive', 'design', 'system',
    'information', 'that', 'this', 'from', 'into', 'have', 'been', 'will', 'make',
    'platform', 'app', 'application', 'tool', 'service',
  ]);

  // Primary: full hyphenated id (always included even if parts are stop words)
  //   + id parts that aren't stop words + name tokens that aren't stop words
  const rawPrimary = [
    id, // full compound id (e.g., "content-site") — matched against prompt with includes()
    ...id.split('-').filter(t => t.length > 2 && !STOP.has(t)),
    ...nameTokens.filter(t => t.length > 2 && !STOP.has(t)),
  ];
  const primary = [...new Set(rawPrimary)];

  // Secondary: key page ids (non-generic) + tannin names + description keywords
  const genericPages = new Set(['home', 'login', 'register', 'contact', 'about', 'search', 'settings']);
  const secondary = [...new Set([
    ...archetype.pages.map(p => p.id).filter(p => !primary.includes(p) && !genericPages.has(p) && !STOP.has(p)),
    ...archetype.tannins.map(t => t.split('-')).flat().filter(t => !STOP.has(t) && t.length > 3),
    ...descTokens.filter(t => !primary.includes(t) && !STOP.has(t)),
  ])];

  // Negative: other archetype ids
  const otherIds = ['ecommerce', 'saas-dashboard', 'portfolio', 'content-site', 'docs-explorer', 'financial-dashboard', 'recipe-community', 'gaming-platform']
    .filter(a => a !== id);
  const negative = otherIds.map(a => `${a}-only`);

  return { primary, secondary, negative };
}

/**
 * Derive synthetic features from archetype pages (for domains without
 * a hand-authored feature DAG).
 */
export function deriveSyntheticFeatures(archetype) {
  const features = {};

  for (const page of archetype.pages) {
    features[page.id] = {
      t: ['home', 'login', 'register'].includes(page.id) ? 'core' :
         archetype.pages.indexOf(page) < archetype.pages.length / 2 ? 'should' : 'nice',
      w: Math.max(0.3, 1.0 - archetype.pages.indexOf(page) * 0.1),
      label: page.id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      desc: `${page.id} page using ${page.patterns.join(', ')}`,
      requires: [],
      implies: [],
      decantr: {
        components: [],
        atoms: '',
        state: [],
        routes: [`/${page.id === 'home' ? '' : page.id}`],
      },
    };
  }

  // Add tannins as should-tier features
  for (const tannin of archetype.tannins) {
    if (!features[tannin]) {
      features[tannin] = {
        t: 'should',
        w: 0.6,
        label: tannin.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        desc: `${tannin} functional system`,
        requires: [],
        implies: [],
        decantr: { components: [], atoms: '', state: [], routes: [] },
      };
    }
  }

  return features;
}

// ── Step 1: Domain Classification ─────────────────────────────────────────

/**
 * Classify a user prompt against available domains using weighted keyword matching.
 *
 * @param {string} prompt - Raw user prompt
 * @param {Object} domains - Map of domain id → { triggers: { primary, secondary, negative } }
 * @param {import('./decision-log.js').DecisionLog} [log] - Optional decision log
 * @returns {{ scores: Object, winner: string|null, confidence: string, multi: boolean }}
 */
export function classifyDomain(prompt, domains, log) {
  const promptLower = prompt.toLowerCase();
  // Normalize: also create a version with hyphens replaced by spaces for compound matching
  const promptNorm = promptLower.replace(/-/g, ' ');
  const tokens = promptLower.split(/[\s,.\-!?;:'"()\[\]{}]+/).filter(Boolean);
  const tokenSet = new Set(tokens);
  const scores = {};

  for (const [id, domain] of Object.entries(domains)) {
    const triggers = domain.triggers || deriveSyntheticTriggers(domain);
    let score = 0;
    let primaryHits = 0;

    for (const kw of triggers.primary) {
      // Match: exact token, substring of token, substring of prompt, or space-normalized form
      const kwNorm = kw.replace(/-/g, ' ');
      if (tokenSet.has(kw) || tokens.some(t => t.includes(kw)) ||
          promptLower.includes(kw) || promptNorm.includes(kwNorm)) {
        score += 3.0;
        primaryHits++;
      }
    }

    for (const kw of triggers.secondary) {
      const kwNorm = kw.replace(/-/g, ' ');
      if (tokenSet.has(kw) || tokens.some(t => t.includes(kw)) ||
          promptLower.includes(kw) || promptNorm.includes(kwNorm)) {
        score += 1.0;
      }
    }

    for (const kw of triggers.negative) {
      if (tokenSet.has(kw) || promptLower.includes(kw) || promptNorm.includes(kw.replace(/-/g, ' '))) {
        score -= 5.0;
      }
    }

    // Multipliers
    if (primaryHits >= 2) score *= 1.5;
    else if (primaryHits === 0) score *= 0.4;

    scores[id] = Math.max(0, score);
  }

  // Decision
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [topId, topScore] = sorted[0] || [null, 0];
  const [secondId, secondScore] = sorted[1] || [null, 0];

  let winner = null;
  let confidence = 'none';
  let multi = false;

  if (topScore < 2.0) {
    confidence = 'none';
  } else if (secondScore > 0 && secondScore / topScore >= 0.7) {
    // Within 30% — ambiguous
    winner = topId;
    confidence = 'ambiguous';
    multi = true;
  } else {
    winner = topId;
    confidence = 'confident';
  }

  if (log) {
    const type = confidence === 'none' ? 'fallback' :
                 confidence === 'ambiguous' ? 'ambiguous' : 'automated';
    log.record({
      stage: 'SETTLE', step: 'domain-classification', type,
      detail: {
        input: prompt.slice(0, 100),
        output: winner,
        confidence,
        scores,
        multi,
        ...(confidence === 'ambiguous' ? { gap: `${Math.round((1 - secondScore / topScore) * 100)}%` } : {}),
      },
    });
  }

  return { scores, winner, confidence, multi };
}

// ── Step 2: Feature Graph Activation ──────────────────────────────────────

/**
 * Activate features from a domain's feature DAG based on prompt keywords.
 *
 * @param {string} prompt
 * @param {Object} features - Feature DAG from domain file
 * @param {Object} [opts]
 * @param {number} [opts.decay=0.85]
 * @param {number} [opts.cutoff=0.3]
 * @param {import('./decision-log.js').DecisionLog} [opts.log]
 * @returns {Map<string, { confidence: number, source: string }>}
 */
export function activateFeatures(prompt, features, opts = {}) {
  const { decay = 0.85, cutoff = 0.3, log } = opts;
  const tokens = prompt.toLowerCase().split(/[\s,.\-!?;:'"()\[\]{}]+/).filter(Boolean);
  const promptLower = prompt.toLowerCase();
  const activated = new Map();

  // 1. Explicit activation — scan prompt for feature labels/desc keywords
  for (const [id, feat] of Object.entries(features)) {
    const label = feat.label?.toLowerCase() || '';
    const desc = feat.desc?.toLowerCase() || '';
    const labelTokens = label.split(/\s+/);
    const descTokens = desc.split(/\s+/).filter(t => t.length > 3);

    const matched = labelTokens.some(t => tokens.includes(t) || promptLower.includes(t)) ||
                    descTokens.some(t => tokens.includes(t));

    if (matched) {
      activated.set(id, { confidence: 1.0, source: 'explicit' });
    }
  }

  // 2. Forward propagation via implies edges
  let changed = true;
  let iterations = 0;
  while (changed && iterations < 50) {
    changed = false;
    iterations++;
    for (const [id, entry] of [...activated]) {
      const feat = features[id];
      if (!feat?.implies) continue;
      for (const implied of feat.implies) {
        if (!features[implied]) continue;
        const newConf = entry.confidence * decay;
        if (newConf < cutoff) continue;
        const existing = activated.get(implied);
        if (!existing || existing.confidence < newConf) {
          activated.set(implied, { confidence: newConf, source: `implied-by:${id}` });
          changed = true;
        }
      }
    }
  }

  // 3. Backward dependency resolution
  changed = true;
  iterations = 0;
  while (changed && iterations < 50) {
    changed = false;
    iterations++;
    for (const [id] of [...activated]) {
      const feat = features[id];
      if (!feat?.requires) continue;
      for (const req of feat.requires) {
        if (!features[req]) continue;
        if (!activated.has(req)) {
          activated.set(req, { confidence: 1.0, source: `required-by:${id}` });
          changed = true;
        }
      }
    }
  }

  // 4. Auto-include tier=core
  for (const [id, feat] of Object.entries(features)) {
    if (feat.t === 'core' && !activated.has(id)) {
      activated.set(id, { confidence: 1.0, source: 'auto-core' });
    }
  }

  if (log) {
    const explicit = [...activated].filter(([, v]) => v.source === 'explicit').map(([k]) => k);
    const implied = [...activated].filter(([, v]) => v.source.startsWith('implied')).map(([k]) => k);
    const autoCore = [...activated].filter(([, v]) => v.source === 'auto-core').map(([k]) => k);
    const required = [...activated].filter(([, v]) => v.source.startsWith('required')).map(([k]) => k);

    log.record({
      stage: 'SETTLE', step: 'feature-activation', type: 'automated',
      detail: { total: activated.size, explicit, implied, autoCore, required },
    });
  }

  return activated;
}

// ── Step 3: Completeness Scoring ──────────────────────────────────────────

/**
 * Score how complete the activated feature set is.
 *
 * @param {Map<string, { confidence: number, source: string }>} activated
 * @param {Object} allFeatures - Full feature DAG
 * @param {string[]} crossCuttingIds - Cross-cutting concern IDs from domain
 * @param {Object} crossCuttingData - Full cross-cutting.json data
 * @param {import('./decision-log.js').DecisionLog} [log]
 * @returns {{ composite: number, grade: string, gaps: { critical: string[], recommended: string[], optional: string[] }, coverage: { core: number, should: number, nice: number, cross: number } }}
 */
export function scoreCompleteness(activated, allFeatures, crossCuttingIds = [], crossCuttingData = {}, log) {
  const tiers = { core: [], should: [], nice: [] };

  for (const [id, feat] of Object.entries(allFeatures)) {
    const tier = feat.t || 'nice';
    if (tiers[tier]) tiers[tier].push(id);
  }

  const coreCoverage = tiers.core.length > 0
    ? tiers.core.filter(id => activated.has(id)).length / tiers.core.length
    : 1.0;
  const shouldCoverage = tiers.should.length > 0
    ? tiers.should.filter(id => activated.has(id)).length / tiers.should.length
    : 1.0;
  const niceCoverage = tiers.nice.length > 0
    ? tiers.nice.filter(id => activated.has(id)).length / tiers.nice.length
    : 1.0;

  // Cross-cutting: count how many of the domain's cross-cutting concerns are addressed
  // (we consider them addressed if they're in the cross-cutting data — they're always applied)
  const crossTotal = crossCuttingIds.length;
  const crossAddressed = crossCuttingIds.filter(id => crossCuttingData[id]).length;
  const crossCoverage = crossTotal > 0 ? crossAddressed / crossTotal : 1.0;

  const composite = coreCoverage * 0.60 + shouldCoverage * 0.25 + niceCoverage * 0.10 + crossCoverage * 0.05;

  const grade = composite >= 0.9 ? 'A' : composite >= 0.75 ? 'B' : composite >= 0.5 ? 'C' : 'D';

  const gaps = {
    critical: tiers.core.filter(id => !activated.has(id)),
    recommended: tiers.should.filter(id => !activated.has(id)),
    optional: tiers.nice.filter(id => !activated.has(id)),
  };

  if (log) {
    log.record({
      stage: 'SETTLE', step: 'completeness-scoring', type: 'automated',
      detail: {
        composite: Math.round(composite * 100) / 100,
        grade,
        coverage: {
          core: Math.round(coreCoverage * 100) / 100,
          should: Math.round(shouldCoverage * 100) / 100,
          nice: Math.round(niceCoverage * 100) / 100,
          cross: Math.round(crossCoverage * 100) / 100,
        },
        gaps,
      },
    });
  }

  return {
    composite: Math.round(composite * 100) / 100,
    grade,
    gaps,
    coverage: {
      core: Math.round(coreCoverage * 100) / 100,
      should: Math.round(shouldCoverage * 100) / 100,
      nice: Math.round(niceCoverage * 100) / 100,
      cross: Math.round(crossCoverage * 100) / 100,
    },
  };
}

// ── Step 4: Question Generation ───────────────────────────────────────────

/**
 * Generate prioritized questions for the user based on gaps and feature questions.
 *
 * @param {Map<string, { confidence: number, source: string }>} activated
 * @param {Object} features - Full feature DAG
 * @param {{ critical: string[], recommended: string[], optional: string[] }} gaps
 * @param {import('./decision-log.js').DecisionLog} [log]
 * @returns {{ questions: Array<{ id: string, question: string, priority: number, source: string, feature: string }>, stopCriteria: { met: boolean, reason: string } }}
 */
export function generateQuestions(activated, features, gaps, log) {
  const candidates = [];
  const seenFeatures = new Set();

  // 1. Feature-embedded questions from activated features
  for (const [id, entry] of activated) {
    const feat = features[id];
    if (!feat?.questions) continue;
    for (const q of feat.questions) {
      if (seenFeatures.has(id)) continue;
      seenFeatures.add(id);
      candidates.push({
        id: q.id,
        question: q.q,
        priority: (feat.w || 0.5) * 2.0,
        source: 'feature-embedded',
        feature: id,
        opts: q.opts,
        default: q.default,
      });
    }
  }

  // 2. Critical gap questions
  for (const id of gaps.critical) {
    if (seenFeatures.has(id)) continue;
    seenFeatures.add(id);
    const feat = features[id];
    candidates.push({
      id: `gap-${id}`,
      question: `Your app needs ${feat?.label || id}. Include it?`,
      priority: (feat?.w || 0.5) * 3.0,
      source: 'critical-gap',
      feature: id,
    });
  }

  // 3. Recommended gap questions
  for (const id of gaps.recommended) {
    if (seenFeatures.has(id)) continue;
    seenFeatures.add(id);
    const feat = features[id];
    candidates.push({
      id: `gap-${id}`,
      question: `Would you like ${feat?.label || id}?`,
      priority: (feat?.w || 0.5) * 1.5,
      source: 'recommended-gap',
      feature: id,
    });
  }

  // Sort by priority, take top 5
  candidates.sort((a, b) => b.priority - a.priority);
  const questions = candidates.slice(0, 5);

  // Stop criteria
  const completeness = scoreCompleteness(activated, features);
  const stopMet = completeness.composite >= 0.75 && gaps.critical.length === 0;
  const stopCriteria = {
    met: stopMet,
    reason: stopMet
      ? `Completeness ${completeness.composite} >= 0.75 and no critical gaps`
      : gaps.critical.length > 0
        ? `${gaps.critical.length} critical gaps remain`
        : `Completeness ${completeness.composite} < 0.75`,
  };

  if (log) {
    log.record({
      stage: 'SETTLE', step: 'question-generation', type: 'automated',
      detail: { count: questions.length, stopCriteria, questions: questions.map(q => q.id) },
    });

    // Character inference is always LLM-required
    log.record({
      stage: 'SETTLE', step: 'character-inference',
      type: 'llm-required',
      detail: { reason: 'No algorithm exists for character trait derivation' },
    });

    // Vintage selection is always LLM-required
    log.record({
      stage: 'SETTLE', step: 'vintage-selection',
      type: 'llm-required',
      detail: { reason: 'Style/mode selection requires aesthetic judgment' },
    });
  }

  return { questions, stopCriteria };
}

// ── DECANT: Blend Resolution ──────────────────────────────────────────────

/**
 * Resolve the blend (page layout composition) for an archetype given activated features.
 *
 * @param {Object} archetype - Archetype definition
 * @param {Map<string, { confidence: number, source: string }>} activatedFeatures
 * @param {import('./decision-log.js').DecisionLog} [log]
 * @returns {{ pages: Array<{ id: string, skeleton: string, blend: Array, patterns: string[] }>, unresolvedPatterns: string[] }}
 */
export function resolveBlend(archetype, activatedFeatures, log) {
  const pages = [];
  const unresolvedPatterns = [];

  for (const page of archetype.pages) {
    // Include page if any of its patterns relate to an activated feature,
    // or if it's a core structural page (home, login, register)
    const isCore = ['home', 'login', 'register', 'overview'].includes(page.id);
    const patternsUsed = page.patterns || [];
    const hasActiveRelation = isCore || patternsUsed.some(p => {
      // Check if any activated feature references a route that matches this page
      for (const [, feat] of activatedFeatures) {
        if (feat.source) return true; // Any activation means the page ecosystem is active
      }
      return false;
    });

    if (hasActiveRelation || activatedFeatures.size === 0) {
      pages.push({
        id: page.id,
        skeleton: page.skeleton,
        blend: page.default_blend || patternsUsed,
        patterns: patternsUsed,
      });
    }
  }

  // Check for unresolved patterns (patterns referenced but not in pattern index)
  // This is a static check — we just flag them
  // Supports v2 preset references: { pattern, preset, as } and plain strings
  const allPatterns = new Set();
  function collectPatternRef(ref) {
    if (typeof ref === 'string') {
      allPatterns.add(ref);
    } else if (ref && ref.pattern) {
      allPatterns.add(ref.pattern); // track the base pattern, not the alias
    }
  }
  for (const page of pages) {
    for (const p of page.patterns) {
      collectPatternRef(p);
    }
    // Also check blend entries
    for (const entry of page.blend) {
      if (typeof entry === 'string') {
        allPatterns.add(entry);
      } else if (entry && entry.pattern && !entry.cols) {
        allPatterns.add(entry.pattern);
      } else if (entry && entry.cols) {
        for (const col of entry.cols) {
          collectPatternRef(col);
        }
      }
    }
  }

  if (log) {
    const isSynthetic = !activatedFeatures.size || [...activatedFeatures.values()].some(v => v.source === 'auto-core');
    log.record({
      stage: 'DECANT', step: 'blend-resolution',
      type: isSynthetic ? 'automated' : 'automated',
      detail: { pageCount: pages.length, patterns: [...allPatterns], unresolvedPatterns },
    });
  }

  return { pages, unresolvedPatterns };
}

/**
 * Validate that all patterns referenced in a blend exist in the pattern registry.
 *
 * @param {{ pages: Array }} blend - Output from resolveBlend
 * @param {Object} patternIndex - Pattern index from registry
 * @returns {{ valid: boolean, missing: string[] }}
 */
export function validateBlend(blend, patternIndex) {
  const missing = [];
  const knownPatterns = new Set(Object.keys(patternIndex.patterns || patternIndex));

  function checkRef(ref) {
    if (typeof ref === 'string') {
      if (!knownPatterns.has(ref)) missing.push(ref);
    } else if (ref && ref.pattern) {
      // v2 preset reference — validate the base pattern exists
      if (!knownPatterns.has(ref.pattern)) missing.push(ref.pattern);
    }
  }

  for (const page of blend.pages) {
    for (const p of page.patterns) {
      checkRef(p);
    }
  }

  return { valid: missing.length === 0, missing: [...new Set(missing)] };
}

// ── Essence Validation ────────────────────────────────────────────────────

const KNOWN_ARCHETYPES = ['ecommerce', 'saas-dashboard', 'portfolio', 'content-site', 'docs-explorer', 'financial-dashboard', 'recipe-community'];
const KNOWN_STYLES = ['auradecantism', 'clean', 'retro', 'glassmorphism', 'command-center'];

/**
 * Validate an essence JSON object. Mirrors cli/commands/validate.js logic.
 *
 * @param {Object} essence
 * @param {import('./decision-log.js').DecisionLog} [log]
 * @returns {{ valid: boolean, errors: string[], warnings: string[] }}
 */
export function validateEssence(essence, log) {
  const errors = [];
  const warnings = [];

  if (!essence || typeof essence !== 'object') {
    errors.push('Essence must be a non-null object');
    return { valid: false, errors, warnings };
  }

  const isSectioned = Array.isArray(essence.sections);
  const isSimple = typeof essence.terroir === 'string' || essence.terroir === null;

  if (!isSectioned && !isSimple) {
    errors.push('Essence must have either "terroir" (simple) or "sections" (sectioned)');
  }

  function validateVintage(vintage, prefix) {
    if (!vintage) return;
    if (vintage.style && !KNOWN_STYLES.includes(vintage.style)) {
      errors.push(`${prefix}vintage.style "${vintage.style}" is not a registered style. Known: ${KNOWN_STYLES.join(', ')}`);
    }
    if (vintage.mode && !['light', 'dark', 'auto'].includes(vintage.mode)) {
      errors.push(`${prefix}vintage.mode must be light|dark|auto, got "${vintage.mode}"`);
    }
  }

  function validateStructure(structure, prefix) {
    if (!Array.isArray(structure)) return;
    for (const page of structure) {
      if (!page.id) errors.push(`${prefix}structure entry missing "id"`);
      if (!page.skeleton) warnings.push(`${prefix}structure entry "${page.id || '?'}" missing "skeleton"`);
      if (!page.blend && !page.patterns) warnings.push(`${prefix}structure entry "${page.id || '?'}" missing "blend"`);
    }
  }

  if (isSectioned) {
    const sectionPaths = new Set();
    for (const section of essence.sections) {
      if (!section.id) errors.push('Section missing "id"');
      if (!section.path) errors.push(`Section "${section.id || '?'}" missing "path"`);
      if (section.path && sectionPaths.has(section.path)) {
        errors.push(`Duplicate section path: "${section.path}"`);
      }
      if (section.path) sectionPaths.add(section.path);
      if (section.terroir && !KNOWN_ARCHETYPES.includes(section.terroir)) {
        errors.push(`Section "${section.id}": terroir "${section.terroir}" is not a known archetype`);
      }
      validateVintage(section.vintage, `Section "${section.id || '?'}": `);
      validateStructure(section.structure, `Section "${section.id || '?'}": `);
    }

    if (Array.isArray(essence.shared_tannins)) {
      for (const section of essence.sections) {
        if (Array.isArray(section.tannins)) {
          for (const t of section.tannins) {
            if (essence.shared_tannins.includes(t)) {
              warnings.push(`Tannin "${t}" is in both shared_tannins and section "${section.id}"`);
            }
          }
        }
      }
    }
  } else {
    if (essence.terroir && !KNOWN_ARCHETYPES.includes(essence.terroir)) {
      errors.push(`terroir "${essence.terroir}" is not a known archetype. Known: ${KNOWN_ARCHETYPES.join(', ')}`);
    }
    validateVintage(essence.vintage, '');
    validateStructure(essence.structure, '');
  }

  if (essence.vessel) {
    if (essence.vessel.type && !['spa', 'mpa'].includes(essence.vessel.type)) {
      warnings.push(`vessel.type "${essence.vessel.type}" is unusual (expected spa|mpa)`);
    }
    if (essence.vessel.routing && !['hash', 'history'].includes(essence.vessel.routing)) {
      errors.push(`vessel.routing must be hash|history, got "${essence.vessel.routing}"`);
    }
  }

  if (essence.cork && typeof essence.cork !== 'object') {
    errors.push('cork must be an object');
  }

  const valid = errors.length === 0;

  if (log) {
    log.record({
      stage: 'CLARIFY', step: 'essence-validation',
      type: valid ? 'automated' : 'automated',
      detail: { valid, errorCount: errors.length, warningCount: warnings.length },
    });
  }

  return { valid, errors, warnings };
}

// ── Cork Enforcement ──────────────────────────────────────────────────────

/**
 * Enforce cork rules on a proposed action against an essence.
 * Cork is the "seal" — once an essence is corked, certain fields become immutable.
 *
 * @param {Object} essence - Current essence
 * @param {{ type: string, field: string, value: any }} action - Proposed change
 * @param {import('./decision-log.js').DecisionLog} [log]
 * @returns {{ allowed: boolean, violations: string[] }}
 */
export function enforceCork(essence, action, log) {
  const violations = [];

  if (!essence.cork) {
    // No cork — everything allowed
    if (log) {
      log.record({
        stage: 'SERVE', step: 'cork-enforcement', type: 'automated',
        detail: { allowed: true, reason: 'No cork present' },
      });
    }
    return { allowed: true, violations };
  }

  const cork = essence.cork;

  // Cork can lock specific fields
  if (cork.locked && Array.isArray(cork.locked)) {
    if (cork.locked.includes(action.field)) {
      violations.push(`Field "${action.field}" is locked by cork`);
    }
  }

  // Cork can lock terroir
  if (cork.terroir_locked && action.field === 'terroir') {
    violations.push('Terroir is locked by cork — cannot change domain archetype');
  }

  // Cork can lock vintage
  if (cork.vintage_locked && action.field?.startsWith('vintage')) {
    violations.push('Vintage is locked by cork — cannot change style/mode');
  }

  // Cork can lock structure (prevent adding/removing pages)
  if (cork.structure_locked && action.field === 'structure') {
    violations.push('Structure is locked by cork — cannot modify page layout');
  }

  const allowed = violations.length === 0;

  if (log) {
    log.record({
      stage: 'SERVE', step: 'cork-enforcement',
      type: allowed ? 'automated' : 'automated',
      detail: { allowed, violations, action: action.type },
    });
  }

  return { allowed, violations };
}

// ── Config Reconciliation ─────────────────────────────────────────────────

/**
 * Check if essence and config are in sync.
 *
 * @param {Object} essence
 * @param {Object} config - decantr.config.json
 * @param {import('./decision-log.js').DecisionLog} [log]
 * @returns {{ inSync: boolean, diffs: Array<{ field: string, essence: any, config: any }> }}
 */
export function reconcileConfig(essence, config, log) {
  const diffs = [];

  const isSectioned = Array.isArray(essence.sections);
  const essenceStyle = isSectioned ? null : essence.vintage?.style;
  const essenceMode = isSectioned ? null : essence.vintage?.mode;

  if (essenceStyle && config.style && essenceStyle !== config.style) {
    diffs.push({ field: 'style', essence: essenceStyle, config: config.style });
  }

  if (essenceMode && config.mode && essenceMode !== config.mode) {
    diffs.push({ field: 'mode', essence: essenceMode, config: config.mode });
  }

  // Check routing
  if (essence.vessel?.routing && config.routing && essence.vessel.routing !== config.routing) {
    diffs.push({ field: 'routing', essence: essence.vessel.routing, config: config.routing });
  }

  const inSync = diffs.length === 0;

  if (log) {
    log.record({
      stage: 'SERVE', step: 'config-reconciliation', type: 'automated',
      detail: { inSync, diffCount: diffs.length, diffs },
    });
  }

  return { inSync, diffs };
}

// ── Multi-Domain Section Detection ────────────────────────────────────────

/**
 * Detect whether a prompt describes multiple domain sections.
 *
 * @param {{ scores: Object, winner: string|null, confidence: string, multi: boolean }} classification
 * @param {string} prompt
 * @param {import('./decision-log.js').DecisionLog} [log]
 * @returns {{ sectioned: boolean, sections: Array<{ domain: string, keywords: string[], score: number }> }}
 */
export function detectSections(classification, prompt, log) {
  const { scores, multi } = classification;

  if (!multi) {
    if (log) {
      log.record({
        stage: 'SETTLE', step: 'section-detection', type: 'automated',
        detail: { sectioned: false, reason: 'Single domain confident match' },
      });
    }
    return { sectioned: false, sections: [] };
  }

  // Find all domains scoring above 2.0
  const viableDomains = Object.entries(scores)
    .filter(([, score]) => score >= 2.0)
    .sort((a, b) => b[1] - a[1]);

  // Check for explicit section markers in prompt
  const sectionMarkers = ['with', 'and', 'plus', 'also', 'including', 'section for', 'area for'];
  const hasMarkers = sectionMarkers.some(m => prompt.toLowerCase().includes(m));

  const sections = viableDomains.map(([domain, score]) => ({
    domain,
    keywords: [], // Would need per-domain keyword extraction
    score,
  }));

  const sectioned = sections.length >= 2;

  if (log) {
    log.record({
      stage: 'SETTLE', step: 'section-detection',
      type: sectioned ? 'ambiguous' : 'automated',
      detail: { sectioned, sectionCount: sections.length, hasMarkers, domains: sections.map(s => s.domain) },
    });
  }

  return { sectioned, sections };
}

// ── Pipeline Runner ───────────────────────────────────────────────────────

/**
 * Run the full deterministic pipeline for a prompt.
 * Returns all stage outputs + the decision log.
 *
 * @param {string} prompt
 * @param {Object} [opts]
 * @param {import('./decision-log.js').DecisionLog} [opts.log]
 * @returns {Promise<Object>}
 */
export async function runPipeline(prompt, opts = {}) {
  const { DecisionLog } = await import('./decision-log.js');
  const log = opts.log || new DecisionLog();

  const domains = await loadDomains();
  const archetypes = await loadArchetypes();
  const crossCutting = await loadCrossCutting();
  const patternIndex = await loadPatternIndex();

  // Step 1: Domain classification
  // Build classification input — merge hand-authored domains + synthetic triggers for archetypes
  const classificationDomains = {};
  for (const [id, domain] of Object.entries(domains)) {
    classificationDomains[id] = domain;
  }
  for (const [id, archetype] of Object.entries(archetypes)) {
    if (!classificationDomains[id]) {
      classificationDomains[id] = {
        ...archetype,
        triggers: deriveSyntheticTriggers(archetype),
        features: deriveSyntheticFeatures(archetype),
      };
    }
  }

  const classification = classifyDomain(prompt, classificationDomains, log);

  // Step 1b: Multi-domain detection
  const sectionDetection = detectSections(classification, prompt, log);

  // Step 2: Feature activation (use winner domain's features)
  let features = {};
  let featureSource = 'none';
  if (classification.winner) {
    if (domains[classification.winner]) {
      features = domains[classification.winner].features;
      featureSource = 'hand-authored';
    } else if (archetypes[classification.winner]) {
      features = deriveSyntheticFeatures(archetypes[classification.winner]);
      featureSource = 'synthetic';

      log.record({
        stage: 'DECANT', step: 'feature-activation', type: 'fallback',
        detail: { reason: `No feature DAG for ${classification.winner}, using archetype pages`, featureSource },
      });
    }
  }

  const activated = Object.keys(features).length > 0
    ? activateFeatures(prompt, features, { log })
    : new Map();

  // Step 3: Completeness scoring
  const crossCuttingIds = classification.winner && domains[classification.winner]
    ? domains[classification.winner].cross_cutting || []
    : [];
  const completeness = Object.keys(features).length > 0
    ? scoreCompleteness(activated, features, crossCuttingIds, crossCutting, log)
    : { composite: 0, grade: 'D', gaps: { critical: [], recommended: [], optional: [] }, coverage: { core: 0, should: 0, nice: 0, cross: 0 } };

  // Step 4: Question generation
  const questions = Object.keys(features).length > 0
    ? generateQuestions(activated, features, completeness.gaps, log)
    : { questions: [], stopCriteria: { met: false, reason: 'No features loaded' } };

  // DECANT: Blend resolution
  const archetype = archetypes[classification.winner];
  const blend = archetype
    ? resolveBlend(archetype, activated, log)
    : { pages: [], unresolvedPatterns: [] };

  const blendValidation = archetype
    ? validateBlend(blend, patternIndex)
    : { valid: true, missing: [] };

  return {
    prompt,
    classification,
    sectionDetection,
    activated: Object.fromEntries(activated),
    featureSource,
    completeness,
    questions,
    blend,
    blendValidation,
    log,
  };
}
