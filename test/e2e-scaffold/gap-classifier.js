/**
 * Gap Classifier
 *
 * Analyzes gap source code and classifies it into registry types
 * (component, pattern, preset, archetype) with confidence levels.
 */

import { readFile } from 'fs/promises';
import { join } from 'path';

const CLASSIFICATION_RULES = [
  { signal: 'single-file-small', type: 'component', confidence: 'high' },
  { signal: 'composes-3-plus', type: 'pattern', confidence: 'high' },
  { signal: 'matches-existing-variant', type: 'preset', confidence: 'high' },
  { signal: 'layout-focused', type: 'pattern', confidence: 'medium' },
  { signal: 'complex-state', type: 'pattern', confidence: 'medium' },
  { signal: 'no-matching-archetype', type: 'archetype', confidence: 'low' },
];

/**
 * Classify a gap into a registry type
 * @param {Object} gap - Gap object from validation
 * @param {string} projectDir - Project directory path
 * @returns {Promise<Object>} Classified gap with type, confidence, sourceCode
 */
export async function classifyGap(gap, projectDir) {
  const sourceCode = await readGapSource(gap, projectDir);
  const analysis = analyzeSource(sourceCode, gap.name);

  return {
    ...gap,
    classification: determineType(analysis),
    sourceCode,
    lineCount: sourceCode?.split('\n').length || 0,
  };
}

/**
 * Analyze source code for classification signals
 */
function analyzeSource(code, name) {
  if (!code) return { signals: [] };

  const lines = code.split('\n').length;

  // Count decantr component imports
  const componentImports = code.match(/from\s+['"]decantr\/components['"]/g) || [];
  const componentCount = componentImports.length;

  // Count individual components imported
  const componentMatches = code.match(/import\s*\{([^}]+)\}\s*from\s*['"]decantr\/components['"]/);
  const individualComponents = componentMatches
    ? componentMatches[1].split(',').map(c => c.trim()).filter(Boolean).length
    : 0;

  // Check for reactive state
  const hasState = /createSignal|createStore|createEffect|createMemo/.test(code);

  // Check if layout-focused
  const isLayout = /header|footer|sidebar|nav|shell|layout/i.test(name) ||
    /header|footer|sidebar|nav|shell/i.test(code.slice(0, 500));

  // Check if it looks like a variant of an existing pattern
  const patternVariantSignals = [
    /card[-_]?grid/i,
    /hero[-_]?(section|banner)?/i,
    /form[-_]?section/i,
    /data[-_]?table/i,
    /filter[-_]?bar/i,
    /kpi[-_]?(grid|card)/i,
  ];
  const matchesExisting = patternVariantSignals.some(re => re.test(name));

  const signals = [];

  // Single file, small, few components = likely component
  if (lines < 100 && individualComponents <= 2 && !hasState) {
    signals.push('single-file-small');
  }

  // Composes 3+ components = likely pattern
  if (individualComponents >= 3) {
    signals.push('composes-3-plus');
  }

  // Matches existing pattern naming = likely preset
  if (matchesExisting) {
    signals.push('matches-existing-variant');
  }

  // Layout-focused = likely pattern
  if (isLayout) {
    signals.push('layout-focused');
  }

  // Complex state = likely pattern
  if (hasState && lines > 50) {
    signals.push('complex-state');
  }

  return {
    lines,
    componentCount,
    individualComponents,
    hasState,
    isLayout,
    matchesExisting,
    signals,
  };
}

/**
 * Determine registry type from analysis signals
 */
function determineType(analysis) {
  const { signals } = analysis;

  for (const rule of CLASSIFICATION_RULES) {
    if (signals.includes(rule.signal)) {
      return {
        type: rule.type,
        confidence: rule.confidence,
        reason: rule.signal,
      };
    }
  }

  // Default to component with low confidence
  return {
    type: 'component',
    confidence: 'low',
    reason: 'default',
  };
}

/**
 * Read gap source file content
 */
async function readGapSource(gap, projectDir) {
  try {
    const filePath = join(projectDir, gap.location);
    return await readFile(filePath, 'utf-8');
  } catch {
    return null;
  }
}
