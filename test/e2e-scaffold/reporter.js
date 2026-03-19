/**
 * E2E Scaffold Test Reporter
 *
 * Generates comprehensive reports from test results including:
 * - Aggregate scores and trends
 * - Gap analysis and recommendations
 * - Compliance violation summaries
 * - LLM observation analysis
 */

import { writeFile, readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

// ─── Report Generation ───────────────────────────────────────────────────────

/**
 * Generate a comprehensive report from test results.
 *
 * @param {string} outputDir - Directory containing results
 * @param {Array} results - Test results (optional, will load from files if not provided)
 * @returns {Promise<Object>} Generated report
 */
export async function generateReport(outputDir, results = null) {
  // Load results if not provided
  if (!results) {
    results = await loadResults(outputDir);
  }

  const runId = new Date().toISOString();
  const completed = results.filter(r => r.status === 'completed');
  const failed = results.filter(r => r.status === 'failed');

  // ─── Summary Statistics ────────────────────────────────────────────────────

  const summary = {
    total_tests: results.length,
    passed: completed.length,
    failed: failed.length,
    skipped: results.filter(r => r.status === 'skipped').length,
    avg_composite_score: completed.length > 0
      ? completed.reduce((sum, r) => sum + r.scores.composite, 0) / completed.length
      : 0,
    avg_tokens: completed.length > 0
      ? completed.reduce((sum, r) => sum + (r.tokens?.total || 0), 0) / completed.length
      : 0,
    avg_time_seconds: completed.length > 0
      ? completed.reduce((sum, r) => sum + r.duration, 0) / completed.length / 1000
      : 0,
  };

  // ─── Category Breakdown ────────────────────────────────────────────────────

  const categories = ['cold-start', 'modification', 'edge-cases'];
  const scoresByCategory = {};

  for (const cat of categories) {
    const catResults = completed.filter(r => r.category === cat);
    if (catResults.length > 0) {
      scoresByCategory[cat] = {
        avg: catResults.reduce((sum, r) => sum + r.scores.composite, 0) / catResults.length,
        count: catResults.length,
        passed: catResults.filter(r => r.scores.grade !== 'F').length,
        failed: catResults.filter(r => r.scores.grade === 'F').length,
      };
    }
  }

  // ─── Dimension Breakdown ───────────────────────────────────────────────────

  const dimensions = ['intent', 'structural', 'runtime', 'visual', 'compliance', 'tokenEfficiency', 'timeEfficiency'];
  const scoresByDimension = {};

  for (const dim of dimensions) {
    const scores = completed.map(r => r.scores[dim]).filter(s => s !== undefined);
    if (scores.length > 0) {
      scoresByDimension[dim] = {
        avg: scores.reduce((a, b) => a + b, 0) / scores.length,
        min: Math.min(...scores),
        max: Math.max(...scores),
      };
    }
  }

  // ─── Gap Analysis ──────────────────────────────────────────────────────────

  const gapAnalysis = analyzeGaps(results);

  // ─── Compliance Violations ─────────────────────────────────────────────────

  const complianceViolations = analyzeViolations(results);

  // ─── LLM Observations ──────────────────────────────────────────────────────

  const llmObservations = analyzeLLMBehavior(results);

  // ─── Recommendations ───────────────────────────────────────────────────────

  const recommendations = generateRecommendations(gapAnalysis, complianceViolations, scoresByDimension);

  // ─── Difficulty Analysis ───────────────────────────────────────────────────

  const difficulties = ['easy', 'medium', 'hard'];
  const scoresByDifficulty = {};

  for (const diff of difficulties) {
    const diffResults = completed.filter(r => r.difficulty === diff);
    if (diffResults.length > 0) {
      scoresByDifficulty[diff] = {
        avg: diffResults.reduce((sum, r) => sum + r.scores.composite, 0) / diffResults.length,
        count: diffResults.length,
      };
    }
  }

  // ─── Assemble Report ───────────────────────────────────────────────────────

  const report = {
    run_id: runId,
    model: process.env.DECANTR_E2E_MODEL || 'claude-sonnet-4-20250514',
    corpus_version: '1.0.0',
    summary,
    scores_by_category: scoresByCategory,
    scores_by_dimension: scoresByDimension,
    scores_by_difficulty: scoresByDifficulty,
    gap_analysis: gapAnalysis,
    compliance_violations: complianceViolations,
    llm_observations: llmObservations,
    recommendations,
    tests: completed.map(r => ({
      id: r.id,
      category: r.category,
      difficulty: r.difficulty,
      prompt: r.prompt.slice(0, 100) + (r.prompt.length > 100 ? '...' : ''),
      scores: r.scores,
      tokens: r.tokens,
      duration_seconds: r.duration / 1000,
      gaps_detected: r.gaps?.length || 0,
      violations: r.violations?.length || 0,
    })),
    failures: failed.map(r => ({
      id: r.id,
      error: r.error,
    })),
  };

  // Write report
  const reportPath = join(outputDir, 'report.json');
  await writeFile(reportPath, JSON.stringify(report, null, 2));

  // Generate markdown summary
  const markdownPath = join(outputDir, 'REPORT.md');
  await writeFile(markdownPath, generateMarkdownReport(report));

  console.log(`  Report written to: ${reportPath}`);
  console.log(`  Markdown: ${markdownPath}`);

  return report;
}

// ─── Gap Analysis ────────────────────────────────────────────────────────────

function analyzeGaps(results) {
  const patternGaps = {};
  const componentGaps = {};
  const iconGaps = {};
  const archetypeGaps = {};

  for (const result of results) {
    for (const gap of (result.gaps || [])) {
      const target = gap.type === 'missing-pattern' ? patternGaps
        : gap.type === 'missing-component' ? componentGaps
        : gap.type === 'missing-icon' ? iconGaps
        : gap.type === 'missing-archetype' ? archetypeGaps
        : null;

      if (target) {
        if (!target[gap.name]) {
          target[gap.name] = { frequency: 0, workarounds: [] };
        }
        target[gap.name].frequency++;
        if (gap.workaround) {
          target[gap.name].workarounds.push(gap.workaround);
        }
      }
    }
  }

  return {
    missing_patterns: Object.entries(patternGaps).map(([name, data]) => ({
      requested: name,
      frequency: data.frequency,
      workaround: mostCommon(data.workarounds),
    })).sort((a, b) => b.frequency - a.frequency),
    missing_components: Object.entries(componentGaps).map(([name, data]) => ({
      requested: name,
      frequency: data.frequency,
      workaround: mostCommon(data.workarounds),
    })).sort((a, b) => b.frequency - a.frequency),
    missing_icons: Object.entries(iconGaps).map(([name, data]) => ({
      requested: name,
      frequency: data.frequency,
      substituted: mostCommon(data.workarounds),
    })).sort((a, b) => b.frequency - a.frequency),
    archetype_gaps: Object.entries(archetypeGaps).map(([name, data]) => ({
      domain: name,
      frequency: data.frequency,
      closest: mostCommon(data.workarounds),
    })).sort((a, b) => b.frequency - a.frequency),
  };
}

function mostCommon(arr) {
  if (!arr.length) return null;
  const counts = {};
  for (const item of arr) {
    counts[item] = (counts[item] || 0) + 1;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

// ─── Violation Analysis ──────────────────────────────────────────────────────

function analyzeViolations(results) {
  const violations = {};

  for (const result of results) {
    for (const v of (result.violations || [])) {
      if (!violations[v.rule]) {
        violations[v.rule] = { frequency: 0, examples: [] };
      }
      violations[v.rule].frequency++;
      if (violations[v.rule].examples.length < 5) {
        violations[v.rule].examples.push(result.id);
      }
    }
  }

  return Object.entries(violations).map(([rule, data]) => ({
    rule,
    frequency: data.frequency,
    examples: data.examples,
  })).sort((a, b) => b.frequency - a.frequency);
}

// ─── LLM Behavior Analysis ───────────────────────────────────────────────────

function analyzeLLMBehavior(results) {
  const improvisations = [];
  const confusions = [];
  const strengths = new Set();
  const weaknesses = new Set();

  for (const result of results) {
    for (const obs of (result.observations || [])) {
      if (obs.type === 'resource-not-found') {
        improvisations.push({
          test: result.id,
          description: obs.context,
          quality: result.scores?.composite > 70 ? 'acceptable' : 'poor',
        });
      }
      if (obs.type === 'asked-clarification') {
        // This is good behavior
        strengths.add('Asks for clarification when needed');
      }
    }

    // Analyze score patterns for strengths/weaknesses
    if (result.scores) {
      if (result.scores.compliance > 90) {
        strengths.add('Consistent compliance with Decantr rules');
      }
      if (result.scores.intent > 85) {
        strengths.add('Good intent interpretation');
      }
      if (result.scores.compliance < 60) {
        weaknesses.add('Sometimes bypasses Decantr patterns');
      }
      if (result.scores.intent < 50) {
        weaknesses.add('Struggles with vague prompts');
      }
    }

    // Check for confusion signals in gaps
    if ((result.gaps?.length || 0) > 2) {
      confusions.push({
        test: result.id,
        description: `Multiple gaps detected (${result.gaps.length})`,
        resolution: 'created local patterns',
      });
    }
  }

  return {
    improvisation_points: improvisations.slice(0, 10),
    confusion_points: confusions.slice(0, 10),
    strengths: [...strengths],
    weaknesses: [...weaknesses],
  };
}

// ─── Recommendations ─────────────────────────────────────────────────────────

function generateRecommendations(gaps, violations, dimensions) {
  const recommendations = [];

  // Pattern gaps → suggest adding patterns
  for (const gap of (gaps.missing_patterns || []).slice(0, 5)) {
    recommendations.push({
      priority: gap.frequency >= 3 ? 'high' : 'medium',
      action: `Add ${gap.requested} pattern to registry`,
      reason: `Requested ${gap.frequency} times, workaround: ${gap.workaround}`,
    });
  }

  // Component gaps
  for (const gap of (gaps.missing_components || []).slice(0, 3)) {
    recommendations.push({
      priority: gap.frequency >= 2 ? 'medium' : 'low',
      action: `Add ${gap.requested} component`,
      reason: `Requested ${gap.frequency} times`,
    });
  }

  // Compliance violations
  for (const v of violations.slice(0, 3)) {
    if (v.rule === 'no-inline-css') {
      recommendations.push({
        priority: 'high',
        action: 'Strengthen inline CSS prevention in LLM prompts',
        reason: `${v.frequency} inline CSS violations`,
      });
    }
  }

  // Dimension weaknesses
  if (dimensions.visual && dimensions.visual.avg < 60) {
    recommendations.push({
      priority: 'medium',
      action: 'Improve visual fidelity scoring or theme application',
      reason: `Low visual scores (avg: ${dimensions.visual.avg.toFixed(1)})`,
    });
  }

  if (dimensions.runtime && dimensions.runtime.avg < 70) {
    recommendations.push({
      priority: 'high',
      action: 'Improve code generation reliability',
      reason: `Low runtime scores (avg: ${dimensions.runtime.avg.toFixed(1)})`,
    });
  }

  return recommendations;
}

// ─── Markdown Report ─────────────────────────────────────────────────────────

function generateMarkdownReport(report) {
  let md = `# Decantr E2E Scaffold Test Report

**Run ID:** ${report.run_id}
**Model:** ${report.model}

## Summary

| Metric | Value |
|--------|-------|
| Total Tests | ${report.summary.total_tests} |
| Passed | ${report.summary.passed} |
| Failed | ${report.summary.failed} |
| Average Score | ${report.summary.avg_composite_score.toFixed(1)} |
| Average Tokens | ${Math.round(report.summary.avg_tokens)} |
| Average Time | ${report.summary.avg_time_seconds.toFixed(1)}s |

## Scores by Category

| Category | Average | Count |
|----------|---------|-------|
`;

  for (const [cat, data] of Object.entries(report.scores_by_category)) {
    md += `| ${cat} | ${data.avg.toFixed(1)} | ${data.count} |\n`;
  }

  md += `
## Scores by Difficulty

| Difficulty | Average | Count |
|------------|---------|-------|
`;

  for (const [diff, data] of Object.entries(report.scores_by_difficulty)) {
    md += `| ${diff} | ${data.avg.toFixed(1)} | ${data.count} |\n`;
  }

  md += `
## Dimension Analysis

| Dimension | Average | Min | Max |
|-----------|---------|-----|-----|
`;

  for (const [dim, data] of Object.entries(report.scores_by_dimension)) {
    md += `| ${dim} | ${data.avg.toFixed(1)} | ${data.min} | ${data.max} |\n`;
  }

  if (report.gap_analysis.missing_patterns.length > 0) {
    md += `
## Framework Gaps

### Missing Patterns
`;
    for (const gap of report.gap_analysis.missing_patterns.slice(0, 10)) {
      md += `- **${gap.requested}** (${gap.frequency}x) - workaround: ${gap.workaround}\n`;
    }
  }

  if (report.compliance_violations.length > 0) {
    md += `
## Compliance Violations
`;
    for (const v of report.compliance_violations.slice(0, 10)) {
      md += `- **${v.rule}** (${v.frequency}x) - examples: ${v.examples.join(', ')}\n`;
    }
  }

  if (report.recommendations.length > 0) {
    md += `
## Recommendations
`;
    for (const rec of report.recommendations) {
      md += `- **[${rec.priority.toUpperCase()}]** ${rec.action}\n  - ${rec.reason}\n`;
    }
  }

  if (report.llm_observations.strengths.length > 0 || report.llm_observations.weaknesses.length > 0) {
    md += `
## LLM Behavior Analysis

### Strengths
`;
    for (const s of report.llm_observations.strengths) {
      md += `- ${s}\n`;
    }

    md += `
### Weaknesses
`;
    for (const w of report.llm_observations.weaknesses) {
      md += `- ${w}\n`;
    }
  }

  if (report.failures.length > 0) {
    md += `
## Failures
`;
    for (const f of report.failures) {
      md += `- **${f.id}**: ${f.error}\n`;
    }
  }

  md += `
---
Generated by Decantr E2E Scaffold Test Harness
`;

  return md;
}

// ─── Load Results ────────────────────────────────────────────────────────────

async function loadResults(outputDir) {
  const results = [];

  try {
    const files = await readdir(outputDir);
    const resultFiles = files.filter(f => f.startsWith('results-') && f.endsWith('.json'));

    for (const file of resultFiles) {
      try {
        const content = await readFile(join(outputDir, file), 'utf-8');
        const data = JSON.parse(content);
        if (Array.isArray(data)) {
          results.push(...data);
        }
      } catch {
        // Ignore invalid files
      }
    }
  } catch {
    // Directory doesn't exist or no files
  }

  return results;
}
