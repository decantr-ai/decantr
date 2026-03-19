/**
 * E2E Scaffold Test Scorer
 *
 * Scores test results across 8 dimensions:
 * 1. Intent Accuracy - Did it match what user asked for?
 * 2. Structural Completeness - Are all pages/patterns present?
 * 3. Runtime Success - Does the code actually work?
 * 4. Visual Fidelity - Does it look right?
 * 5. Decantr Compliance - Did it follow the rules?
 * 6. Token Efficiency - How many tokens used?
 * 7. Time Efficiency - How fast?
 * 8. Gap Detection - What's missing from framework?
 */

import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawn } from 'node:child_process';

// ─── Score Weights ───────────────────────────────────────────────────────────

const WEIGHTS = {
  intent: 0.25,
  structural: 0.20,
  runtime: 0.20,
  visual: 0.10,
  compliance: 0.15,
  tokenEfficiency: 0.05,
  timeEfficiency: 0.05,
};

// ─── Grade Thresholds ────────────────────────────────────────────────────────

function getGrade(score) {
  if (score >= 90) return 'A';
  if (score >= 75) return 'B';
  if (score >= 60) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

// ─── Intent Accuracy (0-100) ─────────────────────────────────────────────────

function scoreIntent(entry, result) {
  let score = 0;
  const notes = [];

  // Check if essence was generated
  if (result.essence) {
    score += 20;
    notes.push('Essence generated');

    // Check terroir match
    const expectedTerroir = Array.isArray(entry.expected?.terroir)
      ? entry.expected.terroir
      : [entry.expected?.terroir];

    if (expectedTerroir.includes(result.essence.terroir)) {
      score += 20;
      notes.push(`Correct terroir: ${result.essence.terroir}`);
    } else if (result.essence.terroir) {
      score += 5;
      notes.push(`Wrong terroir: expected ${expectedTerroir.join('/')}, got ${result.essence.terroir}`);
    }

    // Check vintage/style match
    const expectedStyles = entry.expected?.vintage?.style;
    if (expectedStyles) {
      const styles = Array.isArray(expectedStyles) ? expectedStyles : [expectedStyles];
      if (styles.includes(result.essence.vintage?.style)) {
        score += 15;
        notes.push(`Correct style: ${result.essence.vintage.style}`);
      }
    } else {
      score += 10; // No specific style expected
    }

    // Check mode match
    const expectedMode = entry.expected?.vintage?.mode;
    if (expectedMode) {
      const modes = Array.isArray(expectedMode) ? expectedMode : [expectedMode];
      if (modes.includes(result.essence.vintage?.mode)) {
        score += 10;
        notes.push(`Correct mode: ${result.essence.vintage.mode}`);
      }
    } else {
      score += 5;
    }
  }

  // Check for keyword matches in prompt interpretation
  const keywords = entry.scoring?.intent_keywords || [];
  const conversation = result.conversationLog?.toLowerCase() || '';
  let keywordHits = 0;
  for (const kw of keywords) {
    if (conversation.includes(kw.toLowerCase())) {
      keywordHits++;
    }
  }
  if (keywords.length > 0) {
    const keywordScore = (keywordHits / keywords.length) * 20;
    score += keywordScore;
    notes.push(`Keyword coverage: ${keywordHits}/${keywords.length}`);
  } else {
    score += 15; // No keywords to check
  }

  // Check if clarification was expected and given
  if (entry.scoring?.expect_clarification) {
    const askedClarification = result.observations?.some(o => o.type === 'asked-clarification');
    if (askedClarification) {
      score += 15;
      notes.push('Correctly asked for clarification');
    } else {
      notes.push('Expected clarification but none asked');
    }
  }

  return {
    score: Math.min(100, Math.round(score)),
    notes,
  };
}

// ─── Structural Completeness (0-100) ─────────────────────────────────────────

async function scoreStructural(entry, result, projectDir) {
  let score = 0;
  const notes = [];

  // Check pages present (30 points)
  if (result.essence?.structure) {
    const pages = result.essence.structure;
    const requiredPages = entry.expected?.structure?.required_pages || [];
    const minPages = entry.expected?.structure?.min_pages || 1;

    if (pages.length >= minPages) {
      score += 15;
      notes.push(`Page count OK: ${pages.length} >= ${minPages}`);
    } else {
      score += (pages.length / minPages) * 15;
      notes.push(`Insufficient pages: ${pages.length} < ${minPages}`);
    }

    const pageIds = pages.map(p => p.id);
    let requiredHits = 0;
    for (const req of requiredPages) {
      if (pageIds.includes(req)) requiredHits++;
    }
    if (requiredPages.length > 0) {
      score += (requiredHits / requiredPages.length) * 15;
      notes.push(`Required pages: ${requiredHits}/${requiredPages.length}`);
    } else {
      score += 15;
    }
  }

  // Check patterns resolved (30 points)
  const requiredPatterns = entry.expected?.structure?.required_patterns || [];
  if (requiredPatterns.length > 0 && result.essence?.structure) {
    const usedPatterns = new Set();
    for (const page of result.essence.structure) {
      const blend = page.blend || [];
      for (const item of blend) {
        if (typeof item === 'string') {
          usedPatterns.add(item);
        } else if (item.pattern) {
          usedPatterns.add(item.pattern);
        }
      }
    }

    let patternHits = 0;
    for (const req of requiredPatterns) {
      if (usedPatterns.has(req)) patternHits++;
    }
    score += (patternHits / requiredPatterns.length) * 30;
    notes.push(`Required patterns: ${patternHits}/${requiredPatterns.length}`);
  } else {
    score += 20; // No specific patterns required
  }

  // Check components used (20 points)
  const srcDir = join(projectDir, 'src');
  if (existsSync(srcDir)) {
    try {
      const files = await readdir(srcDir, { recursive: true });
      const jsFiles = files.filter(f => f.endsWith('.js'));

      if (jsFiles.length > 0) {
        score += 10;
        notes.push(`JS files present: ${jsFiles.length}`);

        // Check for component imports
        const appPath = join(srcDir, 'app.js');
        if (existsSync(appPath)) {
          const appContent = await readFile(appPath, 'utf-8');
          if (appContent.includes('decantr/components')) {
            score += 10;
            notes.push('Uses Decantr components');
          }
        }
      }
    } catch {
      notes.push('Could not read src directory');
    }
  }

  // Check router wired (10 points)
  const appPath = join(projectDir, 'src', 'app.js');
  if (existsSync(appPath)) {
    try {
      const appContent = await readFile(appPath, 'utf-8');
      if (appContent.includes('createRouter') || appContent.includes('decantr/router')) {
        score += 10;
        notes.push('Router is wired');
      }
    } catch {
      // Ignore
    }
  }

  // Check state management (10 points)
  if (existsSync(appPath)) {
    try {
      const appContent = await readFile(appPath, 'utf-8');
      if (appContent.includes('createSignal') || appContent.includes('createStore')) {
        score += 10;
        notes.push('State management present');
      }
    } catch {
      // Ignore
    }
  }

  return {
    score: Math.min(100, Math.round(score)),
    notes,
  };
}

// ─── Runtime Success (0-100) ─────────────────────────────────────────────────

async function scoreRuntime(entry, result, projectDir, options) {
  let score = 0;
  const notes = [];

  // Check if code parses (25 points)
  const srcDir = join(projectDir, 'src');
  if (existsSync(srcDir)) {
    try {
      const files = await readdir(srcDir, { recursive: true });
      const jsFiles = files.filter(f => f.endsWith('.js'));

      let parseErrors = 0;
      for (const file of jsFiles) {
        try {
          const content = await readFile(join(srcDir, file), 'utf-8');
          // Basic syntax check - try to parse as module
          new Function(`"use strict"; ${content}`);
        } catch {
          parseErrors++;
        }
      }

      if (parseErrors === 0) {
        score += 25;
        notes.push('All files parse successfully');
      } else {
        score += Math.max(0, 25 - (parseErrors * 5));
        notes.push(`Parse errors: ${parseErrors}`);
      }
    } catch (err) {
      notes.push(`Could not check parsing: ${err.message}`);
    }
  }

  // Check if dev server boots (25 points) - skip if not running visual tests
  if (options?.visual) {
    try {
      const serverBooted = await checkDevServer(projectDir);
      if (serverBooted) {
        score += 25;
        notes.push('Dev server boots');
      } else {
        notes.push('Dev server failed to boot');
      }
    } catch (err) {
      notes.push(`Dev server check failed: ${err.message}`);
    }
  } else {
    // Assume it would work based on structure
    if (existsSync(join(projectDir, 'src', 'app.js'))) {
      score += 20;
      notes.push('App.js exists (dev server not tested)');
    }
  }

  // Check routes render (25 points) - requires visual testing
  if (options?.visual) {
    // This would use Playwright to check routes
    score += 20; // Placeholder
    notes.push('Route check pending visual validation');
  } else {
    // Check route definitions exist
    if (result.essence?.structure?.length > 0) {
      score += 20;
      notes.push('Routes defined in essence');
    }
  }

  // No console errors (25 points) - requires visual testing
  if (options?.visual) {
    score += 15; // Placeholder
    notes.push('Console error check pending visual validation');
  } else {
    // Check for obvious error patterns in code
    score += 15;
    notes.push('Console errors not checked (no visual)');
  }

  return {
    score: Math.min(100, Math.round(score)),
    notes,
  };
}

async function checkDevServer(projectDir) {
  return new Promise((resolve) => {
    const child = spawn('npx', ['decantr', 'dev', '--port', '0'], {
      cwd: projectDir,
      timeout: 10000,
    });

    let resolved = false;

    child.stdout.on('data', (data) => {
      if (data.toString().includes('listening') || data.toString().includes('ready')) {
        if (!resolved) {
          resolved = true;
          child.kill();
          resolve(true);
        }
      }
    });

    child.on('error', () => {
      if (!resolved) {
        resolved = true;
        resolve(false);
      }
    });

    child.on('close', (code) => {
      if (!resolved) {
        resolved = true;
        resolve(code === 0);
      }
    });

    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        child.kill();
        resolve(false);
      }
    }, 10000);
  });
}

// ─── Visual Fidelity (0-100) ─────────────────────────────────────────────────

async function scoreVisual(entry, result, projectDir, options) {
  let score = 0;
  const notes = [];

  // Without visual testing, score based on configuration
  if (!options?.visual) {
    // Check theme colors in CSS/HTML
    const indexPath = join(projectDir, 'public', 'index.html');
    if (existsSync(indexPath)) {
      const content = await readFile(indexPath, 'utf-8');
      const expectedColors = entry.expected?.theme?.colors || [];

      for (const color of expectedColors) {
        if (content.toLowerCase().includes(color.toLowerCase())) {
          score += 5;
        }
      }
      notes.push(`Color hints: ${expectedColors.length ? 'checked' : 'none specified'}`);
    }

    // Check layout skeleton
    if (result.essence?.structure?.[0]?.skeleton) {
      const expectedSkeleton = entry.expected?.structure?.required_skeleton;
      if (!expectedSkeleton || result.essence.structure[0].skeleton === expectedSkeleton) {
        score += 25;
        notes.push('Skeleton matches');
      }
    }

    // Give partial credit for essence existing
    if (result.essence) {
      score += 30;
      notes.push('Essence configured (visual not tested)');
    }

    return {
      score: Math.min(100, Math.round(score)),
      notes: [...notes, 'Visual testing disabled - scores are estimates'],
    };
  }

  // With visual testing, use Playwright screenshots
  // This is a placeholder for actual Playwright integration
  score = 60;
  notes.push('Visual testing enabled - implement Playwright checks');

  return {
    score: Math.min(100, Math.round(score)),
    notes,
  };
}

// ─── Decantr Compliance (0-100) ──────────────────────────────────────────────

async function scoreCompliance(entry, result, projectDir) {
  let score = 0;
  const notes = [];
  const violations = [];

  // No inline CSS (15 points)
  const inlineViolations = result.violations?.filter(v => v.rule === 'no-inline-css') || [];
  if (inlineViolations.length === 0) {
    score += 15;
    notes.push('No inline CSS detected');
  } else {
    notes.push(`Inline CSS violations: ${inlineViolations.length}`);
    violations.push(...inlineViolations);
  }

  // Uses atoms correctly (15 points)
  const srcDir = join(projectDir, 'src');
  if (existsSync(srcDir)) {
    try {
      const files = await readdir(srcDir, { recursive: true });
      let atomUsage = 0;
      let totalClassRefs = 0;

      for (const file of files.filter(f => f.endsWith('.js'))) {
        const content = await readFile(join(srcDir, file), 'utf-8');
        const atomMatches = content.match(/_[a-z][a-z0-9]*/g) || [];
        const classMatches = content.match(/class(Name)?[:=]/g) || [];
        atomUsage += atomMatches.length;
        totalClassRefs += classMatches.length;
      }

      if (atomUsage > 0) {
        score += 15;
        notes.push(`Atom usage: ${atomUsage} atoms`);
      } else if (totalClassRefs === 0) {
        score += 10; // No classes at all
        notes.push('No class references');
      }
    } catch {
      score += 5;
    }
  }

  // Patterns from registry (20 points)
  const localPatterns = result.gaps?.filter(g => g.type === 'missing-pattern') || [];
  if (localPatterns.length === 0) {
    score += 20;
    notes.push('All patterns from registry');
  } else {
    score += Math.max(0, 20 - (localPatterns.length * 5));
    notes.push(`Local patterns created: ${localPatterns.length}`);
  }

  // Essence.json accurate (20 points)
  if (result.essence) {
    // Check if essence validates
    const essenceViolations = result.violations?.filter(v => v.rule === 'valid-essence') || [];
    if (essenceViolations.length === 0) {
      score += 20;
      notes.push('Essence is valid');
    } else {
      notes.push('Essence validation errors');
    }
  }

  // Cork rules respected (15 points)
  // For modification tests, check if Cork was honored
  if (entry.baseProject) {
    const corkViolations = result.violations?.filter(v =>
      v.rule === 'cork-violation' || v.rule === 'style-change-blocked'
    ) || [];
    if (corkViolations.length === 0) {
      score += 15;
      notes.push('Cork rules respected');
    } else {
      notes.push(`Cork violations: ${corkViolations.length}`);
    }
  } else {
    score += 15; // No Cork to violate on new projects
  }

  // Imports from correct modules (15 points)
  const appPath = join(projectDir, 'src', 'app.js');
  if (existsSync(appPath)) {
    try {
      const content = await readFile(appPath, 'utf-8');
      const decantrImports = content.match(/from ['"]decantr\/[^'"]+['"]/g) || [];
      const invalidImports = content.match(/from ['"]react|vue|svelte['"]/g) || [];

      if (decantrImports.length > 0 && invalidImports.length === 0) {
        score += 15;
        notes.push('Correct Decantr imports');
      } else if (invalidImports.length > 0) {
        notes.push(`Invalid framework imports: ${invalidImports.length}`);
        violations.push({ rule: 'framework-imports', count: invalidImports.length });
      }
    } catch {
      // Ignore
    }
  }

  return {
    score: Math.min(100, Math.round(score)),
    notes,
    violations,
  };
}

// ─── Token Efficiency (0-100) ────────────────────────────────────────────────

function scoreTokenEfficiency(result) {
  const total = result.tokens?.total || 0;

  let score;
  if (total < 10000) score = 100;
  else if (total < 20000) score = 80;
  else if (total < 40000) score = 60;
  else if (total < 80000) score = 40;
  else score = 20;

  return {
    score,
    notes: [`Total tokens: ${total}`],
  };
}

// ─── Time Efficiency (0-100) ─────────────────────────────────────────────────

function scoreTimeEfficiency(result) {
  const seconds = (result.duration || 0) / 1000;

  let score;
  if (seconds < 30) score = 100;
  else if (seconds < 60) score = 80;
  else if (seconds < 120) score = 60;
  else if (seconds < 300) score = 40;
  else score = 20;

  return {
    score,
    notes: [`Duration: ${seconds.toFixed(1)}s`],
  };
}

// ─── Main Scorer ─────────────────────────────────────────────────────────────

/**
 * Score a test result across all dimensions.
 *
 * @param {Object} entry - Corpus entry
 * @param {Object} result - Run result
 * @param {Object} options - Scoring options
 * @returns {Promise<Object>} Scores with composite and grade
 */
export async function scoreTest(entry, result, options = {}) {
  const projectDir = result.projectDir || options.outputDir;

  // Score each dimension
  const intent = scoreIntent(entry, result);
  const structural = await scoreStructural(entry, result, projectDir);
  const runtime = await scoreRuntime(entry, result, projectDir, options);
  const visual = await scoreVisual(entry, result, projectDir, options);
  const compliance = await scoreCompliance(entry, result, projectDir);
  const tokenEfficiency = scoreTokenEfficiency(result);
  const timeEfficiency = scoreTimeEfficiency(result);

  // Calculate composite
  const composite =
    intent.score * WEIGHTS.intent +
    structural.score * WEIGHTS.structural +
    runtime.score * WEIGHTS.runtime +
    visual.score * WEIGHTS.visual +
    compliance.score * WEIGHTS.compliance +
    tokenEfficiency.score * WEIGHTS.tokenEfficiency +
    timeEfficiency.score * WEIGHTS.timeEfficiency;

  const grade = getGrade(composite);

  return {
    intent: intent.score,
    structural: structural.score,
    runtime: runtime.score,
    visual: visual.score,
    compliance: compliance.score,
    tokenEfficiency: tokenEfficiency.score,
    timeEfficiency: timeEfficiency.score,
    composite: Math.round(composite * 10) / 10,
    grade,
    details: {
      intent: intent.notes,
      structural: structural.notes,
      runtime: runtime.notes,
      visual: visual.notes,
      compliance: compliance.notes,
      tokenEfficiency: tokenEfficiency.notes,
      timeEfficiency: timeEfficiency.notes,
    },
    violations: compliance.violations || [],
  };
}
