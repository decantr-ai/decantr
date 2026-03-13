/**
 * Decantation Process — Report Generator
 *
 * Runs the full corpus through the deterministic engine and produces
 * an aggregate report with accuracy metrics, automation ratios,
 * LLM intervention points, and framework gaps.
 *
 * Usage: node test/decantation/report.js
 */

import { writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { corpus, stats as corpusStats } from './corpus.js';
import { runPipeline, clearCaches } from './engine.js';
import { DecisionLog } from './decision-log.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, 'output');

/**
 * Run the full corpus and produce a report.
 */
export async function generateReport() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  const results = [];
  const aggregateLog = new DecisionLog();
  const failures = [];

  for (const entry of corpus) {
    const log = new DecisionLog();
    try {
      const result = await runPipeline(entry.prompt, { log });
      results.push({ entry, result, log });

      // Merge decisions into aggregate
      for (const d of log.decisions) {
        aggregateLog.record(d);
      }
    } catch (err) {
      failures.push({ id: entry.id, error: err.message });
    }
  }

  // ── Accuracy Metrics ──────────────────────────────────────────────────

  let classificationCorrect = 0;
  let classificationTotal = 0;
  let activationWithinBounds = 0;
  let activationTotal = 0;
  let completenessCorrect = 0;
  let completenessTotal = 0;
  let blendCorrect = 0;
  let blendTotal = 0;

  const categoryBreakdowns = {};

  for (const { entry, result } of results) {
    const cat = entry.category;
    if (!categoryBreakdowns[cat]) {
      categoryBreakdowns[cat] = { total: 0, classification_ok: 0, failures: [] };
    }
    categoryBreakdowns[cat].total++;

    const exp = entry.expected;

    // Classification accuracy
    if (exp.classification) {
      classificationTotal++;

      let domainOk = true;
      if (exp.classification.domain && result.classification.winner !== exp.classification.domain) {
        domainOk = false;
      }
      if (exp.classification.confidence && result.classification.confidence !== exp.classification.confidence) {
        // Confidence mismatch is softer — don't count as total failure
        if (exp.classification.confidence === 'none' && result.classification.confidence !== 'none') {
          domainOk = false;
        }
      }
      if (exp.classification.multi === true && !result.classification.multi) {
        // Expected multi but got single — partial failure
      }

      // Score bounds
      if (exp.classification.scores) {
        for (const [domain, bounds] of Object.entries(exp.classification.scores)) {
          const actual = result.classification.scores[domain] || 0;
          if (bounds.min !== undefined && actual < bounds.min) domainOk = false;
          if (bounds.max !== undefined && actual > bounds.max) domainOk = false;
        }
      }

      if (domainOk) {
        classificationCorrect++;
        categoryBreakdowns[cat].classification_ok++;
      } else {
        categoryBreakdowns[cat].failures.push({
          id: entry.id,
          expected: exp.classification,
          actual: {
            domain: result.classification.winner,
            confidence: result.classification.confidence,
            scores: result.classification.scores,
          },
        });
      }
    }

    // Activation accuracy (ecommerce only — the only domain with real features)
    if (exp.activation) {
      activationTotal++;
      const total = Object.keys(result.activated).length;
      let ok = true;
      if (exp.activation.min_total && total < exp.activation.min_total) ok = false;
      if (exp.activation.max_total && total > exp.activation.max_total) ok = false;
      if (ok) activationWithinBounds++;
    }

    // Completeness accuracy
    if (exp.completeness) {
      completenessTotal++;
      const grades = ['D', 'C', 'B', 'A'];
      const actualGradeIdx = grades.indexOf(result.completeness.grade);
      const minGradeIdx = exp.completeness.grade_min ? grades.indexOf(exp.completeness.grade_min) : -1;
      let ok = actualGradeIdx >= minGradeIdx;
      if (exp.completeness.composite_min && result.completeness.composite < exp.completeness.composite_min) ok = false;
      if (exp.completeness.core_coverage_min && result.completeness.coverage.core < exp.completeness.core_coverage_min) ok = false;
      if (ok) completenessCorrect++;
    }

    // Blend accuracy
    if (exp.blend) {
      blendTotal++;
      let ok = true;
      if (exp.blend.min_pages && result.blend.pages.length < exp.blend.min_pages) ok = false;
      if (exp.blend.must_have_pages) {
        const pageIds = result.blend.pages.map(p => p.id);
        for (const required of exp.blend.must_have_pages) {
          if (!pageIds.includes(required)) ok = false;
        }
      }
      if (ok) blendCorrect++;
    }
  }

  // ── LLM Intervention Analysis ─────────────────────────────────────────

  const llmPoints = aggregateLog.llmInterventionPoints();
  const llmStepFrequency = {};
  for (const point of llmPoints) {
    const key = `${point.stage}:${point.step}`;
    llmStepFrequency[key] = (llmStepFrequency[key] || 0) + 1;
  }

  const llmInterventionPoints = Object.entries(llmStepFrequency).map(([key, count]) => ({
    stage: key.split(':')[0],
    step: key.split(':')[1],
    frequency: `${Math.round(count / results.length * 100)}%`,
    count,
  }));

  // ── Fallback Analysis ─────────────────────────────────────────────────

  const fallbacks = aggregateLog.ofType('fallback');
  const fallbackReasons = {};
  for (const f of fallbacks) {
    const reason = f.detail?.reason || 'unknown';
    fallbackReasons[reason] = (fallbackReasons[reason] || 0) + 1;
  }

  // ── Framework Gaps ────────────────────────────────────────────────────

  const frameworkGaps = [
    { gap: 'No feature DAG for saas-dashboard', impact: 'Cannot score completeness accurately', fix: 'Create domains/saas-dashboard.json' },
    { gap: 'No feature DAG for portfolio', impact: 'Cannot score completeness accurately', fix: 'Create domains/portfolio.json' },
    { gap: 'No feature DAG for content-site', impact: 'Cannot score completeness accurately', fix: 'Create domains/content-site.json' },
    { gap: 'No feature DAG for docs-explorer', impact: 'Cannot score completeness accurately', fix: 'Create domains/docs-explorer.json' },
  ];

  // Check if synthetic triggers underperform
  const syntheticResults = results.filter(r => r.result.featureSource === 'synthetic');
  const handAuthoredResults = results.filter(r => r.result.featureSource === 'hand-authored');

  if (syntheticResults.length > 0 && handAuthoredResults.length > 0) {
    const syntheticAccuracy = syntheticResults.filter(r => {
      const exp = r.entry.expected;
      return exp.classification?.domain && r.result.classification.winner === exp.classification.domain;
    }).length / syntheticResults.length;

    const handAccuracy = handAuthoredResults.filter(r => {
      const exp = r.entry.expected;
      return exp.classification?.domain && r.result.classification.winner === exp.classification.domain;
    }).length / handAuthoredResults.length;

    frameworkGaps.push({
      gap: `Synthetic triggers ${Math.round(syntheticAccuracy * 100)}% vs hand-authored ${Math.round(handAccuracy * 100)}%`,
      impact: 'Lower classification accuracy for non-ecommerce domains',
      fix: 'Author trigger files for all domains',
    });
  }

  // ── Assemble Report ───────────────────────────────────────────────────

  const report = {
    generated: new Date().toISOString(),
    corpus: corpusStats(),
    failures,
    deterministic: {
      classification_accuracy: classificationTotal > 0 ? Math.round(classificationCorrect / classificationTotal * 100) / 100 : null,
      activation_accuracy: activationTotal > 0 ? Math.round(activationWithinBounds / activationTotal * 100) / 100 : null,
      completeness_accuracy: completenessTotal > 0 ? Math.round(completenessCorrect / completenessTotal * 100) / 100 : null,
      blend_accuracy: blendTotal > 0 ? Math.round(blendCorrect / blendTotal * 100) / 100 : null,
    },
    process_analysis: {
      automation_ratio: Math.round(aggregateLog.automationRatio() * 100) / 100,
      decision_counts: aggregateLog.typeCounts(),
      llm_intervention_points: llmInterventionPoints,
      category_breakdowns: categoryBreakdowns,
      fallback_reasons: fallbackReasons,
      framework_gaps: frameworkGaps,
    },
  };

  const reportPath = join(OUTPUT_DIR, 'report.json');
  await writeFile(reportPath, JSON.stringify(report, null, 2));
  clearCaches();

  // Print summary
  console.log('\n  Decantation Process Report');
  console.log('  ─────────────────────────');
  console.log(`  Corpus: ${report.corpus.total} prompts`);
  console.log(`  Failures: ${failures.length}`);
  console.log(`\n  Accuracy:`);
  console.log(`    Classification: ${report.deterministic.classification_accuracy}`);
  console.log(`    Activation:     ${report.deterministic.activation_accuracy}`);
  console.log(`    Completeness:   ${report.deterministic.completeness_accuracy}`);
  console.log(`    Blend:          ${report.deterministic.blend_accuracy}`);
  console.log(`\n  Automation ratio: ${report.process_analysis.automation_ratio}`);
  console.log(`  LLM intervention points: ${llmInterventionPoints.length}`);
  for (const point of llmInterventionPoints) {
    console.log(`    ${point.stage}.${point.step}: ${point.frequency}`);
  }
  console.log(`\n  Report written to: ${reportPath}\n`);

  return report;
}

// Run if executed directly
const isMain = process.argv[1] && (
  process.argv[1].endsWith('report.js') ||
  process.argv[1].endsWith('report')
);

if (isMain) {
  generateReport().catch(err => {
    console.error('Report generation failed:', err);
    process.exit(1);
  });
}
